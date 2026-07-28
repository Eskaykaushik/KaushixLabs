 
/* ==========================================
   Hero Terminal Animation
========================================== */

const command = "initialize";

const commandElement = document.getElementById("command");

const output = document.getElementById("terminal-output");

const lines = [

"",

"Loading AI Research Modules...",

"✓ Artificial Intelligence",

"✓ Machine Learning",

"✓ Agentic AI",

"✓ Generative AI",

"✓ Enterprise Consultancy",

"",

"System Ready.",

"",

"Welcome to Kaushix Labs"

];

let index = 0;

function typeCommand(){

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
