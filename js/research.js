// ==========================================
// RESEARCH PROJECTS
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    loadResearchProjects();
});

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

async function loadResearchProjects() {
    const container = document.getElementById("research-grid");

    if (!container) return;

    try {
        const response = await fetch("data/projects.json");

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        container.innerHTML = "";

        data.projects.forEach(project => {
            container.appendChild(createProjectCard(project));
        });

    } catch (error) {
        console.error("Failed to load research projects:", error);

        container.innerHTML = `
            <div class="research-error">
                <p>Unable to load research projects.</p>
            </div>
        `;
    }
}

function createProjectCard(project) {

    const links = project.links || {};

    const external = [
        ["github", "GitHub"],
        ["paper", "Paper"],
        ["demo", "Demo"]
    ]
        .filter(([key]) => links[key])
        .map(([key, label]) => `
            <a class="project-link" href="${escapeHtml(links[key])}"
               target="_blank" rel="noopener">${label}</a>
        `)
        .join("");

    const firstLink = links.page || links.github || links.paper || links.demo;

    const card = document.createElement(firstLink ? "a" : "div");
    card.className = "research-card";
    if (firstLink) {
        card.href = escapeHtml(firstLink);
        card.target = "_blank";
        card.rel = "noopener";
    }

    const tags = (project.technologies || [])
        .map(tag => `<span>${escapeHtml(tag)}</span>`)
        .join("");

    const status = (project.status || "Research").toUpperCase();
    const statusClass = (project.status || "research").toLowerCase();

    card.innerHTML = `
        <div class="terminal-bar">
            <span class="dot green"></span>
            <span class="terminal-title">
                research://${escapeHtml(project.id)}
            </span>
        </div>

        <div class="card-content">

            <span class="status ${statusClass}">
                ${status}
            </span>

            <h3>${escapeHtml(project.title)}</h3>

            <p>${escapeHtml(project.description)}</p>

            <div class="tags">
                ${tags}
            </div>

            ${external ? `<div class="project-links">${external}</div>` : ""}

            ${firstLink ? '<span class="card-link">$ open project</span>' : ""}

        </div>
    `;

    return card;
}
