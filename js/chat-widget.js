/* ==========================================
   Kaushix AI — floating chat widget
   DocNest-style launcher + panel on every page
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

const MODELS = [
    { value: "assistant", label: "k-core" },
    { value: "fast", label: "k-spark" },
    { value: "reason", label: "k-mind" },
    { value: "research", label: "k-atlas" },
    { value: "compound", label: "k-nexus" }
];

const AI_NAME = "kaushix-ai";
const USER_NAME = "you";

const SUGGESTIONS = [
    "Explain how a transformer model works in simple terms",
    "Write a Python script to fetch data from an API",
    "Summarize the key ideas of machine learning in one paragraph",
    "Give me 5 ideas for AI startup projects"
];

const STORE_KEY = "kaushix-chat-history";
const HISTORY_LIMIT = 20;

const MODEL_OPTIONS = MODELS.map(
    (model) => `<option value="${model.value}">${model.label}</option>`
).join("");

const WIDGET_HTML = `
<div class="chat-widget">

    <button type="button" class="chat-launcher attention" id="chat-launcher"
        aria-label="Open Kaushix AI chat" aria-expanded="false" aria-controls="chat-panel">

        <i class="fas fa-terminal chat-launcher-open" aria-hidden="true"></i>

        <i class="fas fa-times chat-launcher-close" aria-hidden="true"></i>
    </button>

    <div class="chat-panel" id="chat-panel" role="dialog" aria-label="Kaushix AI chat"
        aria-hidden="true">

        <header class="chat-titlebar">

            <div class="chat-heading">

                <span class="chat-avatar" aria-hidden="true">
                    <i class="fas fa-terminal"></i>
                </span>

                <div class="chat-heading-text">

                    <span class="chat-title">${AI_NAME}</span>

                    <span class="chat-subtitle">
                        <span class="status-dot"></span>
                        online
                    </span>

                </div>

            </div>

            <div class="chat-tools">

                <div class="ai-model">

                    <label for="chat-model">model</label>

                    <select id="chat-model" aria-label="Choose model">
                        ${MODEL_OPTIONS}
                    </select>

                </div>

                <button type="button" class="chat-action" id="chat-clear"
                    title="Clear chat" aria-label="Clear chat">
                    <i class="fas fa-eraser" aria-hidden="true"></i>
                </button>

                <button type="button" class="chat-action" id="chat-close"
                    title="Close" aria-label="Close chat">
                    <i class="fas fa-times" aria-hidden="true"></i>
                </button>

            </div>

        </header>

        <div class="chat-output" id="chat-output" aria-live="polite"></div>

        <div class="chat-input-line">

            <textarea id="chat-input" rows="1"
                placeholder="Ask anything — code, research, or plain questions…"
                aria-label="Message to Kaushix AI"></textarea>

            <button type="button" class="chat-send" id="chat-send" aria-label="Send message">
                <i class="fas fa-arrow-up" aria-hidden="true"></i>
            </button>

            <button type="button" class="chat-stop" id="chat-stop"
                aria-label="Stop response" hidden>
                <i class="fas fa-stop" aria-hidden="true"></i>
            </button>

        </div>

    </div>

</div>
`;


/* ==========================================
   Inject widget
========================================== */

document.body.insertAdjacentHTML("beforeend", WIDGET_HTML);

let firstOpen = true;
let userNearBottom = true;
let abortController = null;
let renderer = null;

let history = loadHistory();

const launcher = document.getElementById("chat-launcher");
const panel = document.getElementById("chat-panel");
const clearButton = document.getElementById("chat-clear");
const closeButton = document.getElementById("chat-close");
const chatOutput = document.getElementById("chat-output");
const chatInput = document.getElementById("chat-input");
const modelSelect = document.getElementById("chat-model");
const sendButton = document.getElementById("chat-send");
const stopButton = document.getElementById("chat-stop");

panel.inert = true;

const chatColumn = el("div", "chat-column");

if (chatOutput) {
    chatOutput.appendChild(chatColumn);
}


/* ==========================================
   Primitives
========================================== */

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


function escapeHtml(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


/* ==========================================
   History persistence
========================================== */

function loadHistory() {

    try {

        const stored = JSON.parse(localStorage.getItem(STORE_KEY));

        return Array.isArray(stored) ? stored : [];

    } catch {

        return [];

    }

}


function saveHistory() {

    try {

        localStorage.setItem(STORE_KEY, JSON.stringify(history));

    } catch {

        // storage unavailable — keep history in memory only

    }

}


function restoreHistory() {

    if (!history.length) {
        return;
    }

    firstOpen = false;

    history.forEach((turn) => {

        if (turn.role === "user") {

            addUserMessage(turn.content);

        } else if (turn.role === "assistant") {

            const textEl = addAssistantMessage(turn.label || "k-core");

            textEl.innerHTML = renderMarkdown(turn.content);
            initCopyButtons(textEl);

        }

    });

}


/* ==========================================
   Open / close
========================================== */

function init() {

    restoreHistory();

    launcher.addEventListener("click", () => {
        const isOpen = panel.getAttribute("aria-hidden") === "false";
        isOpen ? closeChat() : openChat();
    });

    closeButton.addEventListener("click", closeChat);

    clearButton.addEventListener("click", resetConversation);

    sendButton.addEventListener("click", () => sendMessage());

    stopButton.addEventListener("click", stopResponse);

    chatInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });

    panel.addEventListener("keydown", trapFocus);

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && panel.getAttribute("aria-hidden") === "false") {
            closeChat();
            launcher.focus();
        }
    });

}


function openChat() {

    panel.inert = false;

    panel.setAttribute("aria-hidden", "false");
    launcher.setAttribute("aria-expanded", "true");
    launcher.classList.add("active");

    if (firstOpen) {
        firstOpen = false;
        renderWelcome();
    }

    chatInput.focus();

}


function closeChat() {

    panel.inert = true;

    panel.setAttribute("aria-hidden", "true");
    launcher.setAttribute("aria-expanded", "false");
    launcher.classList.remove("active");

    if (panel.contains(document.activeElement)) {
        launcher.focus();
    }

}


function trapFocus(event) {

    if (event.key !== "Tab") {
        return;
    }

    const focusables = panel.querySelectorAll(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])"
    );

    const list = [...focusables].filter(
        (element) => !element.disabled && element.offsetParent !== null
    );

    if (!list.length) {
        return;
    }

    const first = list[0];
    const last = list[list.length - 1];

    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }

}


function resetConversation() {

    stopResponse();

    history = [];
    saveHistory();

    renderWelcome();

}


function stopResponse() {

    if (abortController) {
        abortController.abort();
        abortController = null;
    }

    setStreaming(false);
    sendButton.disabled = false;

}


function setStreaming(active) {

    sendButton.hidden = active;
    stopButton.hidden = !active;

}


/* ==========================================
   Markdown rendering (marked + highlight.js)
========================================== */

function buildRenderer() {

    renderer = new marked.Renderer();

    renderer.code = (code, infoString) => {

        if (typeof hljs === "undefined") {

            return `<pre><code class="hljs">${escapeHtml(code)}</code></pre>`;

        }

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

}


function renderMarkdown(text) {

    if (typeof marked === "undefined") {

        return "<p>" + escapeHtml(text).replace(/\n/g, "<br>") + "</p>";

    }

    if (!renderer) {
        buildRenderer();
    }

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

    chatColumn.innerHTML = "";

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

    chatColumn.appendChild(welcome);

    if (panel.getAttribute("aria-hidden") === "false") {
        chatInput.focus();
    }

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

    chatColumn.appendChild(msg);

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

    chatColumn.appendChild(msg);

    scrollToBottom();

    return text;

}


function makeAvatar() {

    const avatar = el("div", "msg-avatar");

    avatar.innerHTML = '<i class="fas fa-terminal"></i>';

    return avatar;

}


function addTypingIndicator() {

    const msg = el("div", "msg msg-ai");

    const body = el("div", "msg-body");

    const dots = el("div", "typing");

    dots.innerHTML = "<span></span><span></span><span></span>";

    body.appendChild(dots);

    msg.appendChild(makeAvatar());
    msg.appendChild(body);

    chatColumn.appendChild(msg);

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

    chatColumn.appendChild(msg);

    scrollToBottom();

}


/* ==========================================
   API
========================================== */

function buildHistoryPayload() {

    return history
        .slice(-HISTORY_LIMIT)
        .map(({ role, content }) => ({ role, content }));

}


async function askAssistant(message, model, onChunk, signal) {

    const endpoint = ENDPOINTS[model];

    if (!endpoint) {
        throw new Error("Invalid model selected");
    }

    const response = await fetch(
        API_URL.replace(/\/+$/, "") + endpoint + "?stream=1",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            signal: signal,

            body: JSON.stringify({
                message: message,
                history: buildHistoryPayload()
            })
        }
    );

    if (!response.ok) {
        throw new Error(
            `API request failed: ${response.status}`
        );
    }

    if (!response.body || typeof onChunk !== "function") {
        const data = await response.json();
        return data.response;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullText = "";

    while (true) {

        const { done, value } = await reader.read();

        if (done) {
            break;
        }

        buffer += decoder.decode(value, { stream: true });

        const frames = buffer.split("\n\n");
        buffer = frames.pop();

        for (const frame of frames) {

            for (const line of frame.split("\n")) {

                if (!line.startsWith("data:")) {
                    continue;
                }

                const data = line.slice(5).trim();

                if (!data || data === "[DONE]") {
                    continue;
                }

                let parsed;

                try {
                    parsed = JSON.parse(data);
                } catch {
                    continue;
                }

                if (parsed.error) {
                    throw new Error(parsed.error);
                }

                if (parsed.content) {
                    fullText += parsed.content;
                    onChunk(fullText);
                }

            }

        }

    }

    return fullText;

}


/* ==========================================
   Send
========================================== */

function modelLabel() {

    return modelSelect.options[modelSelect.selectedIndex].text;

}


async function sendMessage(preset) {

    const message = (
        typeof preset === "string" ? preset : chatInput.value
    ).trim();

    if (!message || sendButton.disabled) {
        return;
    }

    chatInput.value = "";
    resizeInput();

    chatInput.blur();

    addUserMessage(message);

    const model = modelSelect.value;
    const label = modelLabel();

    sendButton.disabled = true;
    setStreaming(true);

    abortController = new AbortController();
    const controller = abortController;

    const typing = addTypingIndicator();

    let textEl = null;

    const showChunk = (fullText) => {

        if (controller.signal.aborted) {
            return;
        }

        if (!textEl) {
            typing.remove();
            textEl = addAssistantMessage(label);
        }

        textEl.textContent = fullText;
        scrollToBottom({ smooth: false });

    };

    const finalize = (content) => {

        if (!textEl) {
            typing.remove();
            textEl = addAssistantMessage(label);
        }

        textEl.innerHTML = renderMarkdown(content);
        initCopyButtons(textEl);
        scrollToBottom();

    };

    try {

        const answer = await askAssistant(message, model, showChunk, controller.signal);

        if (controller.signal.aborted) {
            finalize(textEl ? textEl.textContent : answer);
            return;
        }

        finalize(answer);

        history.push(
            { role: "user", content: message },
            { role: "assistant", content: answer, label }
        );

        history = history.slice(-HISTORY_LIMIT);

        saveHistory();

    } catch (error) {

        typing.remove();

        if (controller.signal.aborted) {
            if (textEl && textEl.textContent) {
                finalize(textEl.textContent);
            }
            return;
        }

        console.error("Assistant error:", error);

        addError("! " + error.message);

    } finally {

        setStreaming(false);
        sendButton.disabled = false;

    }

}


/* ==========================================
   Input helpers
========================================== */

function resizeInput() {

    chatInput.style.height = "auto";

    chatInput.style.height = chatInput.scrollHeight + "px";

}


/* ==========================================
   Output events
========================================== */

chatOutput.addEventListener("scroll", () => {
    userNearBottom = isNearBottom();
});

chatOutput.addEventListener("click", () => {
    if (panel.getAttribute("aria-hidden") === "false") {
        chatInput.focus();
    }
});


if (chatInput) {

    chatInput.addEventListener(
        "input",
        resizeInput
    );

}


/* ==========================================
   Boot — all declarations are above this point
========================================== */

if (launcher && panel) {
    init();
}
