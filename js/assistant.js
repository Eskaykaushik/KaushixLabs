/* ==========================================
   Kaushix AI — DocNest-style chat
========================================== */

const API_URL =
    "https://kaushix-api-service.onrender.com";

const ENDPOINTS = {
    assistant: "/api/assistant",
    fast: "/api/fast",
    reason: "/api/reason",
    research: "/api/research",
    compound: "/api/compound"
};

const AI_NAME = "kaushix-ai";
const USER_NAME = "you";

const SUGGESTIONS = [
    "Explain how a transformer model works in simple terms",
    "Write a Python script to fetch data from an API",
    "Summarize the key ideas of machine learning in one paragraph",
    "Give me 5 ideas for AI startup projects"
];

const STREAM_CHUNK = 3;
const STREAM_TICK_MS = 10;


/* ==========================================
   DOM Elements
========================================== */

const chatOutput = document.getElementById("chat-output");
const promptInput = document.getElementById("prompt");
const modelSelect = document.getElementById("model");
const sendButton = document.getElementById("send");
const newChatButton = document.getElementById("new-chat");


/* ==========================================
   Primitives
========================================== */

let userNearBottom = true;
let streamTimer = null;


function isNearBottom() {

    return (
        chatOutput.scrollHeight - chatOutput.scrollTop - chatOutput.clientHeight
    ) < 120;

}


function scrollToBottom({ smooth = true } = {}) {

    if (!userNearBottom) {
        return;
    }

    chatOutput.scrollTo({
        top: chatOutput.scrollHeight,
        behavior: smooth ? "smooth" : "instant"
    });

}


function el(tag, className) {

    const node = document.createElement(tag);

    if (className) {
        node.className = className;
    }

    return node;

}


function makeAvatar() {

    const avatar = el("div", "msg-avatar");

    avatar.innerHTML = '<i class="fas fa-terminal"></i>';

    return avatar;

}


function escapeHtml(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


/* ==========================================
   Markdown rendering (marked + highlight.js)
========================================== */

const renderer = new marked.Renderer();

renderer.code = (code, infoString) => {

    const language = (infoString || "text").trim().split(/\s+/)[0];
    const validLanguage = hljs.getLanguage(language) ? language : "plaintext";
    const highlighted = hljs.highlight(code, { language: validLanguage }).value;
    const label = hljs.getLanguage(language)
        ? hljs.getLanguage(language).name
        : (validLanguage === "plaintext" ? "text" : validLanguage);

    return `
        <div class="code-block">
            <div class="code-block-header">
                <span class="code-lang">${escapeHtml(label)}</span>
                <button type="button" class="copy-btn" data-code="${encodeURIComponent(code)}">
                    <i class="far fa-copy"></i>
                    <span class="copy-label">Copy</span>
                </button>
            </div>
            <pre><code class="hljs language-${validLanguage}">${highlighted}</code></pre>
        </div>
    `;

};


function renderMarkdown(text) {

    marked.setOptions({
        gfm: true,
        breaks: false,
        renderer: renderer
    });

    return marked.parse(text);

}


function initCopyButtons(container) {

    const buttons = container.querySelectorAll(".copy-btn:not([data-bound])");

    buttons.forEach((button) => {

        button.setAttribute("data-bound", "true");

        button.addEventListener("click", () => {

            const code = decodeURIComponent(button.dataset.code || "");
            const label = button.querySelector(".copy-label");

            navigator.clipboard.writeText(code).then(() => {
                button.classList.add("copied");
                if (label) {
                    label.textContent = "Copied";
                }
            }).catch(() => {
                if (label) {
                    label.textContent = "Failed";
                }
            }).then(() => {
                setTimeout(() => {
                    button.classList.remove("copied");
                    if (label) {
                        label.textContent = "Copy";
                    }
                }, 1800);
            });

        });

    });

}


/* ==========================================
   Welcome screen
========================================== */

function renderWelcome() {

    chatOutput.innerHTML = "";
    clearStream();

    const welcome = el("div", "welcome");

    const icon = el("div", "welcome-icon");

    icon.innerHTML = '<i class="fas fa-terminal"></i>';

    const title = el("h2", null);

    title.textContent = "How can I help you today?";

    const sub = el("p", null);

    sub.textContent = "Ask anything — code, research, or plain questions. Pick a model and hit Enter.";

    const chips = el("div", "chips");

    SUGGESTIONS.forEach((suggestion, index) => {

        const chip = el("button", "chip");

        chip.type = "button";

        chip.style.setProperty("--i", index);

        chip.textContent = suggestion;

        chip.addEventListener("click", () => {
            sendMessage(suggestion);
        });

        chips.appendChild(chip);

    });

    welcome.appendChild(icon);
    welcome.appendChild(title);
    welcome.appendChild(sub);
    welcome.appendChild(chips);

    chatOutput.appendChild(welcome);

    promptInput.focus();

}


/* ==========================================
   Messages
========================================== */

function addUserMessage(text) {

    const msg = el("div", "msg msg-user");

    const body = el("div", "msg-body");

    const name = el("div", "msg-name");

    name.textContent = USER_NAME;

    const bubble = el("div", "msg-text");

    bubble.textContent = text;

    body.appendChild(name);
    body.appendChild(bubble);

    msg.appendChild(body);

    chatOutput.appendChild(msg);

    scrollToBottom();

}


function addAssistantMessage(modelLabel) {

    const msg = el("div", "msg msg-ai");

    const body = el("div", "msg-body");

    const name = el("div", "msg-name");

    name.textContent = AI_NAME + " · " + modelLabel;

    const text = el("div", "msg-text");

    body.appendChild(name);
    body.appendChild(text);

    msg.appendChild(makeAvatar());
    msg.appendChild(body);

    chatOutput.appendChild(msg);

    scrollToBottom();

    return text;

}


function addTypingIndicator() {

    const msg = el("div", "msg msg-ai");

    const body = el("div", "msg-body");

    const dots = el("div", "typing");

    dots.innerHTML = "<span></span><span></span><span></span>";

    body.appendChild(dots);

    msg.appendChild(makeAvatar());
    msg.appendChild(body);

    chatOutput.appendChild(msg);

    scrollToBottom();

    return msg;

}


function addError(message) {

    const msg = el("div", "msg msg-ai");

    const body = el("div", "msg-body");

    const name = el("div", "msg-name");

    name.textContent = AI_NAME + " · error";

    const text = el("div", "msg-text msg-error");

    text.textContent = message;

    body.appendChild(name);
    body.appendChild(text);

    msg.appendChild(makeAvatar());
    msg.appendChild(body);

    chatOutput.appendChild(msg);

    scrollToBottom();

}


function streamResponse(container, fullText) {

    return new Promise((resolve) => {

        clearStream();

        let index = 0;

        container.classList.add("streaming");

        streamTimer = setInterval(() => {

            index += STREAM_CHUNK;

            container.textContent = fullText.slice(0, index);

            scrollToBottom({ smooth: false });

            if (index >= fullText.length) {

                clearInterval(streamTimer);
                streamTimer = null;

                container.innerHTML = renderMarkdown(fullText);
                initCopyButtons(container);
                container.classList.remove("streaming");

                scrollToBottom();

                resolve();

            }

        }, STREAM_TICK_MS);

    });

}


function clearStream() {

    if (streamTimer) {
        clearInterval(streamTimer);
        streamTimer = null;
    }

}


/* ==========================================
   API
========================================== */

async function askAssistant(message, model) {

    const endpoint = ENDPOINTS[model];

    if (!endpoint) {
        throw new Error("Invalid model selected");
    }

    const response = await fetch(
        API_URL.replace(/\/+$/, "") + endpoint,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: message
            })
        }
    );

    if (!response.ok) {
        throw new Error(
            `API request failed: ${response.status}`
        );
    }

    const data = await response.json();

    return data.response;
}


/* ==========================================
   Send
========================================== */

function modelLabel() {

    return modelSelect.options[modelSelect.selectedIndex].text;

}


async function sendMessage(preset) {

    const message = (
        typeof preset === "string" ? preset : promptInput.value
    ).trim();

    if (!message || sendButton.disabled) {
        return;
    }

    promptInput.value = "";
    resizeInput();

    promptInput.blur();

    addUserMessage(message);

    const model = modelSelect.value;
    const label = modelLabel();

    sendButton.disabled = true;

    const typing = addTypingIndicator();

    try {

        const answer = await askAssistant(message, model);

        typing.remove();

        const textEl = addAssistantMessage(label);

        await streamResponse(textEl, answer);

    } catch (error) {

        console.error("Assistant error:", error);

        clearStream();

        typing.remove();

        addError("! " + error.message);

    } finally {

        sendButton.disabled = false;

    }

}


/* ==========================================
   Input helpers
========================================== */

function resizeInput() {

    promptInput.style.height = "auto";

    promptInput.style.height = promptInput.scrollHeight + "px";

}


/* ==========================================
   Events
========================================== */

if (sendButton) {

    sendButton.addEventListener(
        "click",
        () => sendMessage()
    );

}


if (newChatButton) {

    newChatButton.addEventListener(
        "click",
        renderWelcome
    );

}


if (promptInput) {

    promptInput.addEventListener(
        "input",
        resizeInput
    );

    promptInput.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();

            }

        }
    );

}


if (chatOutput) {

    chatOutput.addEventListener(
        "click",
        () => promptInput.focus()
    );

    chatOutput.addEventListener(
        "scroll",
        () => {
            userNearBottom = isNearBottom();
        }
    );

}


/* ==========================================
   Init
========================================== */

renderWelcome();

promptInput.focus();
