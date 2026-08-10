// ==========================================
// RESEARCH PROJECTS
// ==========================================

let researchProjects = [];
let researchCategory = "all";
let researchQuery = "";

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

        researchProjects = data.projects;

        renderFilters();
        bindSearch();
        renderProjects();

    } catch (error) {
        console.error("Failed to load research projects:", error);

        container.innerHTML = `
            <div class="research-error">
                <p>Unable to load research projects.</p>
            </div>
        `;
    }
}

function renderFilters() {
    const container = document.getElementById("research-filters");

    if (!container) return;

    const categories = [
        "all",
        ...new Set(researchProjects.flatMap(project =>
            String(project.category || "")
                .split("•")
                .map(cat => cat.trim())
                .filter(Boolean)
        ))
    ];

    container.innerHTML = categories.map(category => `
        <button class="filter-chip ${category === researchCategory ? "active" : ""}"
                data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>
    `).join("");

    container.querySelectorAll(".filter-chip").forEach(chip => {
        chip.addEventListener("click", () => {
            researchCategory = chip.dataset.category;
            renderFilters();
            renderProjects();
        });
    });
}

function bindSearch() {
    const input = document.getElementById("research-search");

    if (!input) return;

    input.addEventListener("input", event => {
        researchQuery = event.target.value.trim().toLowerCase();
        renderProjects();
    });
}

function renderProjects() {
    const container = document.getElementById("research-grid");

    if (!container) return;

    const filtered = researchProjects.filter(project => {
        const matchesCategory = researchCategory === "all" ||
            String(project.category || "")
                .toLowerCase()
                .includes(researchCategory.toLowerCase());

        const haystack = [
            project.title,
            project.description,
            project.category,
            project.status,
            ...(project.highlights || []),
            ...(project.technologies || [])
        ].join(" ").toLowerCase();

        const matchesSearch = !researchQuery || haystack.includes(researchQuery);

        return matchesCategory && matchesSearch;
    });

    container.innerHTML = "";

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="research-empty">
                <p class="terminal-path">$ no matches</p>
                <p>No projects found${researchQuery ? ` for "${escapeHtml(researchQuery)}"` : ""}.</p>
            </div>
        `;
        return;
    }

    filtered.forEach(project => {
        container.appendChild(createProjectCard(project));
    });
}

function createProjectCard(project) {

    const links = project.links || {};

    const external = [
        ["github", "GitHub"],
        ["pypi", "PyPI"],
        ["paper", "Paper"],
        ["demo", "Demo"]
    ]
        .filter(([key]) => links[key])
        .map(([key, label]) => `
            <a class="project-link" href="${escapeHtml(links[key])}"
               target="_blank" rel="noopener">${label}</a>
        `)
        .join("");

    const firstLink = links.page || links.github || links.pypi || links.paper || links.demo;

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
    const statusClass = (project.status || "research").toLowerCase().replace(/\s+/g, "-");

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
