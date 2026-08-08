// ==========================================
// CLIENTS
// ==========================================

document.addEventListener("DOMContentLoaded", loadClients);

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function initials(name) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(word => word[0].toUpperCase())
        .join("");
}

async function loadClients() {

    const container = document.getElementById("clients-grid");

    if (!container) return;

    try {

        const response = await fetch("data/clients.json");

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        container.innerHTML = "";

        data.clients.forEach(client => {
            container.appendChild(createClientCard(client));
        });

    } catch (error) {

        console.error("Failed to load clients:", error);

        container.innerHTML = `
            <div class="research-error">
                <p>Unable to load clients.</p>
            </div>
        `;
    }
}

function createClientCard(client) {

    const card = document.createElement("div");
    card.className = "client-card";

    const industry = client.industry
        ? `<p class="client-industry">${escapeHtml(client.industry)}</p>`
        : "";

    const service = client.service
        ? `<span class="client-service">${escapeHtml(client.service)}</span>`
        : "";

    card.innerHTML = `
        <div class="terminal-bar">
            <span class="dot green"></span>
            <span class="terminal-title">
                client://${escapeHtml(client.id)}
            </span>
        </div>

        <div class="client-content">

            <div class="client-header">

                <div class="client-avatar">${escapeHtml(initials(client.name))}</div>

                <div>
                    <h3>${escapeHtml(client.name)}</h3>
                    ${industry}
                </div>

            </div>

            <p>${escapeHtml(client.description)}</p>

            <div class="client-footer">
                ${service}
            </div>

        </div>
    `;

    return card;
}
