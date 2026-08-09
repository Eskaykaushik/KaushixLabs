// ==========================================
// SCIENTIFIC TOOLS HUB
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    loadTools();
});

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

async function loadTools() {
    const container = document.getElementById("tools-grid");

    if (!container) return;

    try {
        const response = await fetch("data/tools.json");

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        container.innerHTML = "";

        data.tools.forEach(tool => {
            container.appendChild(createToolCard(tool));
        });

    } catch (error) {
        console.error("Failed to load tools:", error);

        container.innerHTML = `
            <div class="research-error">
                <p>Unable to load tools.</p>
            </div>
        `;
    }
}

function createToolCard(tool) {

    const card = document.createElement("a");
    card.className = "research-card tool-card";
    card.href = escapeHtml(tool.path);
    card.rel = "noopener";

    card.innerHTML = `
        <div class="terminal-bar">
            <span class="dot green"></span>
            <span class="terminal-title">
                tools://${escapeHtml(tool.id)}
            </span>
        </div>

        <div class="card-content">

            <span class="tool-icon">
                <i class="${escapeHtml(tool.icon)}"></i>
            </span>

            <span class="status tool-status">
                ${escapeHtml(tool.tag)}
            </span>

            <h3>${escapeHtml(tool.title)}</h3>

            <p>${escapeHtml(tool.description)}</p>

            <span class="card-link">$ run tool</span>

        </div>
    `;

    return card;
}
