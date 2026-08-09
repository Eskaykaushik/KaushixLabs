 
/* ==========================================
   Hero Terminal Animation
========================================== */

const command = "initialize";

const commandElement = document.getElementById("command");

const output = document.getElementById("terminal-output");

const lines = [
    "",
    "Research",
    "Training",
    "Enterprise Consultancy",
    "",
    "Welcome to Kaushix Labs"
];

let index = 0;

function typeCommand(){

    if(!commandElement) return;

    if(index < command.length){

        commandElement.textContent += command.charAt(index);

        index++;

        setTimeout(typeCommand,120);

    }

    else{

        printLines();

    }

}

function printLines(){

    if(!output) return;

    let i = 0;

    function next(){

        if(i >= lines.length) return;

        const p = document.createElement("p");

        p.className = "output-line";

        p.textContent = lines[i];

        output.appendChild(p);

        i++;

        setTimeout(next,250);

    }

    next();

}

typeCommand();


/* ==========================================
   Theme Toggle
========================================== */

const themeToggle = document.getElementById("theme-toggle");

function setTheme(theme) {

    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    // Update button icon
    if(themeToggle) {
        themeToggle.textContent = theme === "dark" ? "☀" : "☾";
    }

}

const savedTheme = localStorage.getItem("theme") || "dark";
setTheme(savedTheme);

if(themeToggle) {
    themeToggle.addEventListener("click", () => {

        const currentTheme = document.documentElement.getAttribute("data-theme");

        setTheme(currentTheme === "dark" ? "light" : "dark");

    });
}



/* ==========================================
   Kaushix Assistant
========================================== */

const ASSISTANT_API =
    "https://kaushix-api-service.onrender.com/api/assistant";

async function askAssistant(message) {

    try {

        const response = await fetch(ASSISTANT_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        return data.response;

    } catch (error) {

        console.error("Assistant error:", error);

        return "Unable to reach Kaushix Assistant.";

    }
}
