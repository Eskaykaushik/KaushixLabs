document.addEventListener("DOMContentLoaded", loadTeam);

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

async function loadTeam() {

    const container = document.getElementById("team-grid");

    if (!container) return;

    try {

        const response = await fetch("data/team.json");

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        container.innerHTML = "";

        data.members.forEach(member => {

            const expertise = member.expertise
                .map(skill => `<span>${escapeHtml(skill)}</span>`)
                .join("");

            const fallbackText = encodeURIComponent(member.name);

            const card = document.createElement("div");

            card.className = "team-card";

            card.innerHTML = `

                <div class="terminal-bar">

                    <span class="dot green"></span>

                    <span class="terminal-title">
                        team://${escapeHtml(member.id)}
                    </span>

                </div>


                <div class="team-content">


                    <div class="team-header">

                        <img
                            src="${escapeHtml(member.photo)}"
                            alt="${escapeHtml(member.name)}"
                            class="team-photo"
                            onerror="this.src='https://via.placeholder.com/100?text=${fallbackText}';"
                        >

                        <div>

                            <h3>${escapeHtml(member.name)}</h3>

                            <span class="status active">
                                ${escapeHtml(member.role)}
                            </span>

                        </div>

                    </div>


                    <div class="bio-block">
                        <p class="bio-label">About</p>
                        <p class="bio-text">${escapeHtml(member.bio)}</p>
                    </div>

                    <div class="tags">
                        ${expertise}
                    </div>


                    <div class="social-links">

                        ${
                            member.socials.github
                            ? `<a href="${escapeHtml(member.socials.github)}" target="_blank" rel="noopener" title="GitHub">
                                <i class="fab fa-github"></i>
                               </a>`
                            : ""
                        }


                        ${
                            member.socials.linkedin
                            ? `<a href="${escapeHtml(member.socials.linkedin)}" target="_blank" rel="noopener" title="LinkedIn">
                                <i class="fab fa-linkedin-in"></i>
                               </a>`
                            : ""
                        }

                        ${
                            member.socials.email
                            ? `<a href="mailto:${escapeHtml(member.socials.email)}" title="Email">
                                <i class="fas fa-envelope"></i>
                               </a>`
                            : ""
                        }

                    </div>


                </div>

            `;

            container.appendChild(card);

        });


    } catch(error) {

        console.error("Team loading failed:", error);

        container.innerHTML =
            "<p>$ error loading team</p>";
    }
}
