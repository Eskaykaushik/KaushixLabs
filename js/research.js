// ==========================================
// RESEARCH PROJECTS
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    loadResearchProjects();
});

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

    const card = document.createElement("a");
    card.className = "research-card";
    card.href = project.links?.page || "#";

    const tags = (project.technologies || [])
        .map(tag => `<span>${tag}</span>`)
        .join("");

    const status = (project.status || "Research").toUpperCase();
    const statusClass = (project.status || "research").toLowerCase();

    card.innerHTML = `
        <div class="terminal-bar">
            <span class="dot green"></span>
            <span class="terminal-title">
                research://${project.id}
            </span>
        </div>

        <div class="card-content">

            <span class="status ${statusClass}">
                ${status}
            </span>

            <h3>${project.title}</h3>

            <p>${project.description}</p>

            <div class="tags">
                ${tags}
            </div>

            <span class="card-link">$ open project</span>

        </div>
    `;

    return card;
}
