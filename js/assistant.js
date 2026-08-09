/* ==========================================
   Kaushix AI — terminal assistant
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


/* ==========================================
   DOM Elements
========================================== */

const terminalOutput = document.getElementById("terminal-output");
const promptInput = document.getElementById("prompt");
const modelSelect = document.getElementById("model");
const sendButton = document.getElementById("send");
const clearButton = document.getElementById("clear");


/* ==========================================
   Terminal primitives
========================================== */

function scrollToBottom() {

    terminalOutput.scrollTop = terminalOutput.scrollHeight;

}


function addLine() {

    const line = document.createElement("div");

    line.className = "term-line";

    terminalOutput.appendChild(line);

    scrollToBottom();

    return line;

}


function printSystem(text) {

    const line = addLine();

    line.className = "term-line term-system";

    line.textContent = text;

    return line;

}


function printError(text) {

    const line = addLine();

    line.className = "term-line term-error";

    line.textContent = text;

}


function printUser(message) {

    const line = addLine();

    line.className = "term-line term-user";

    const promptSpan = document.createElement("span");

    promptSpan.className = "terminal-prompt";

    promptSpan.textContent = PROMPT + " ";

    const commandSpan = document.createElement("span");

    commandSpan.className = "term-cmd";

    commandSpan.textContent = message;

    line.appendChild(promptSpan);

    line.appendChild(commandSpan);

}


function printAI(modelLabel) {

    const line = addLine();

    line.className = "term-line term-ai";

    const labelSpan = document.createElement("span");

    labelSpan.className = "term-ai-label";

    labelSpan.textContent = "⟶ " + modelLabel + ": ";

    line.appendChild(labelSpan);

    return line;

}


function typeText(text, container) {

    return new Promise((resolve) => {

        const cursor = document.createElement("span");

        cursor.className = "block-cursor";

        container.appendChild(cursor);

        let i = 0;

        const step = () => {

            if (i < text.length) {

                container.insertBefore(
                    document.createTextNode(text[i]),
                    cursor
                );

                i++;

                scrollToBottom();

                setTimeout(step, 8);

            } else {

                resolve();

            }

        };

        step();

    });

}


/* ==========================================
   Boot / commands
========================================== */

function bootBanner() {

    printSystem("Kaushix AI v0.2.0 — shared gateway ready");
    printSystem("type 'help' for commands · pick a model in the toolbar · Enter to send");
    printSystem("");

}


function printHelp() {

    printSystem("usage: kaushix-ai [message]");
    printSystem("  <message>             send to the selected model");
    printSystem("  clear                 clear this terminal");
    printSystem("  help                  show this help");
    printSystem("  models                list available models");
    printSystem("");

}


function printModels() {

    printSystem("  assistant    gpt-oss-20b     general assistant");
    printSystem("  fast         gpt-oss-20b     quick, low-latency");
    printSystem("  reason       gpt-oss-120b    deep reasoning");
    printSystem("  research     compound-mini   research oriented");
    printSystem("  compound     compound        compound analysis");
    printSystem("");

}


function clearTerminal() {

    terminalOutput.innerHTML = "";

    promptInput.focus();

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
        API_URL + endpoint,
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


async function sendMessage() {

    const message = promptInput.value.trim();

    if (!message) {
        return;
    }

    promptInput.value = "";
    resizeInput();

    printUser(message);

    const firstWord = message.split(/\s+/)[0].toLowerCase();

    if (firstWord === "clear") {
        clearTerminal();
        return;
    }

    if (firstWord === "help") {
        printHelp();
        promptInput.focus();
        return;
    }

    if (firstWord === "models") {
        printModels();
        promptInput.focus();
        return;
    }

    const model = modelSelect.value;
    const label = modelLabel();

    sendButton.disabled = true;

    const statusLine = printSystem("⟶ querying " + label + " …");

    try {

        const answer = await askAssistant(message, model);

        statusLine.remove();

        const aiLine = printAI(label);

        await typeText(answer, aiLine);

    } catch (error) {

        console.error("Assistant error:", error);

        statusLine.remove();

        printError("! " + error.message);

        printSystem("  check that the API key is configured on the server");

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
        sendMessage
    );

}


if (clearButton) {

    clearButton.addEventListener(
        "click",
        clearTerminal
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


if (terminalOutput) {

    terminalOutput.addEventListener(
        "click",
        () => promptInput.focus()
    );

}


/* ==========================================
   Init
========================================== */

bootBanner();

promptInput.focus();
