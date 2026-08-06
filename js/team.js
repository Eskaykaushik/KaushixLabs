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
                        >

                        <div>

                            <h3>${member.name}</h3>

                            <span class="status active">
                                ${member.role}
                            </span>

                        </div>

                    </div>


                    <p>
                        ${member.bio}
                    </p>


                    <div class="tags">
                        ${expertise}
                    </div>


                    <div class="social-links">

                        ${
                            member.socials.github
                            ? `<a href="${member.socials.github}" target="_blank">
                                GitHub
                               </a>`
                            : ""
                        }


                        ${
                            member.socials.linkedin
                            ? `<a href="${member.socials.linkedin}" target="_blank">
                                LinkedIn
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
