document.addEventListener("DOMContentLoaded", loadTeam);

async function loadTeam() {

    const container = document.getElementById("team-grid");

    if (!container) return;

    try {

        const response = await fetch("data/team.json");

        const data = await response.json();

        container.innerHTML = "";

        data.members.forEach(member => {

            const expertise = member.expertise
                .map(skill => `<span>${skill}</span>`)
                .join("");

            const card = document.createElement("div");

            card.className = "team-card";

            card.innerHTML = `

                <div class="terminal-bar">

                    <span class="dot green"></span>

                    <span class="terminal-title">
                        team://${member.id}
                    </span>

                </div>


                <div class="team-content">


                    <div class="team-header">

                        <img
                            src="${member.photo}"
                            alt="${member.name}"
                            class="team-photo"
                            style="width: 100px; height: 100px; min-width: 100px; min-height: 100px; object-fit: cover; border-radius: 12px; border: 2px solid var(--border);"
                            onerror="this.src='https://via.placeholder.com/100?text=${member.name.replace(/\s+/g, '+')}';"
                        >

                        <div>

                            <h3>${member.name}</h3>

                            <span class="status active">
                                ${member.role}
                            </span>

                        </div>

                    </div>


                    <div class="bio-block">
                        <p class="bio-label">About</p>
                        <p class="bio-text">${member.bio}</p>
                    </div>

                    <div class="tags">
                        ${expertise}
                    </div>


                    <div class="social-links">

                        ${
                            member.socials.github
                            ? `<a href="${member.socials.github}" target="_blank" title="GitHub">
                                <i class="fab fa-github"></i>
                               </a>`
                            : ""
                        }


                        ${
                            member.socials.linkedin
                            ? `<a href="${member.socials.linkedin}" target="_blank" title="LinkedIn">
                                <i class="fab fa-linkedin-in"></i>
                               </a>`
                            : ""
                        }

                        ${
                            member.socials.email
                            ? `<a href="mailto:${member.socials.email}" title="Email">
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
