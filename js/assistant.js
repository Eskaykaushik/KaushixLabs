/* ==========================================
   Kaushix AI — Claude-style terminal chat
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

const PROMPT = "kaushix@labs:~$";

const SUGGESTIONS = [
    "Explain how a transformer model works in simple terms",
    "Write a Python script to fetch data from an API",
    "Summarize the key ideas of machine learning in one paragraph",
    "Give me 5 ideas for AI startup projects"
];


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


function isNearBottom() {

    return (
        chatOutput.scrollHeight - chatOutput.scrollTop - chatOutput.clientHeight
    ) < 120;

}


function scrollToBottom() {

    chatOutput.scrollTop = chatOutput.scrollHeight;

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


/* ==========================================
   Welcome screen
========================================== */

function renderWelcome() {

    chatOutput.innerHTML = "";

    const welcome = el("div", "welcome");

    const icon = el("div", "welcome-icon");

    icon.innerHTML = '<i class="fas fa-terminal"></i>';

    const title = el("h2", null);

    title.textContent = "How can I help you today?";

    const sub = el("p", null);

    sub.textContent = "Ask anything — code, research, or plain questions. Pick a model and hit Enter.";

    const chips = el("div", "chips");

    SUGGESTIONS.forEach((suggestion) => {

        const chip = el("button", "chip");

        chip.type = "button";

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

    const bubble = el("div", "msg-bubble");

    bubble.textContent = text;

    msg.appendChild(bubble);

    chatOutput.appendChild(msg);

    scrollToBottom();

}


function addAssistantMessage(modelLabel) {

    const msg = el("div", "msg msg-ai");

    const body = el("div", "msg-body");

    const name = el("div", "msg-name");

    name.textContent = "kaushix-ai · " + modelLabel;

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

    const dots = el("div", "typing-dots");

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

    name.textContent = "kaushix-ai · error";

    const text = el("div", "msg-text msg-error");

    text.textContent = message;

    body.appendChild(name);
    body.appendChild(text);

    msg.appendChild(makeAvatar());
    msg.appendChild(body);

    chatOutput.appendChild(msg);

    scrollToBottom();

}


function typeText(text, container) {

    return new Promise((resolve) => {

        const cursor = el("span", "block-cursor");

        let i = 0;

        let buffer = "";

        const render = () => {

            container.innerHTML = marked.parse(buffer);

            container.appendChild(cursor);

        };

        render();

        const step = () => {

            if (i < text.length) {

                buffer += text[i];

                i++;

                render();

                if (userNearBottom) {

                    scrollToBottom();

                }

                setTimeout(step, 8);

            } else {

                if (userNearBottom) {

                    scrollToBottom();

                }

                resolve();

            }

        };

        step();

    });

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

    addUserMessage(message);

    const model = modelSelect.value;
    const label = modelLabel();

    sendButton.disabled = true;

    const typing = addTypingIndicator();

    try {

        const answer = await askAssistant(message, model);

        typing.remove();

        const textEl = addAssistantMessage(label);

        await typeText(answer, textEl);

    } catch (error) {

        console.error("Assistant error:", error);

        typing.remove();

        addError("! " + error.message);

    } finally {

        sendButton.disabled = false;

        promptInput.focus();

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
