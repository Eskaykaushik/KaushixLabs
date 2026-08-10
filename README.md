# Kaushix Labs

> Research • Training • Consultancy

Kaushix Labs is a modern, lightweight, static website showcasing research, projects, and the people behind them. Built with vanilla HTML, CSS, and JavaScript, the site follows a data-driven architecture where content is stored in JSON files and rendered dynamically in the browser.

The goal is to provide a fast, maintainable, and easily extensible platform for presenting AI research, open-source projects, publications, and the Kaushix Labs team.

---

## Features

* Modern terminal-inspired UI
* Responsive design
* Dark & light theme support
* Dynamic rendering using JSON data
* Static website (no backend required)
* Easy to extend with new pages and datasets
* GitHub Pages compatible

---

## Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript (ES6)

### Data

* JSON

### Deployment

* GitHub Pages
* Any static web server

---

## Project Structure

```text
KaushixLabs/
│
├── index.html
├── research.html
├── team.html
├── about.html
├── contact.html
│
├── css/
│   └── styles.css
│
├── js/
│   ├── script.js
│   ├── research.js
│   └── team.js
│
├── data/
│   ├── projects.json
│   └── team.json
│
├── images/
│   ├── team/
│   └── projects/
│
└── research/
    ├── contractkit.html
    └── beyond-vision.html
```

---

## Data-Driven Architecture

Instead of hardcoding content into HTML pages, Kaushix Labs stores information in JSON files.

Example:

```text
projects.json
```

```json
{
  "projects": [
    {
      "title": "ContractKit",
      "description": "...",
      "technologies": [
        "Python",
        "LangChain"
      ]
    }
  ]
}
```

The corresponding JavaScript file fetches the data and generates the project cards automatically.

Adding a new project requires only updating `projects.json`—no HTML changes are necessary.

The same architecture is used for team members and can easily be extended to publications, news, events, and other content.

---

## Running Locally

Because the website loads JSON using the Fetch API, opening the HTML files directly (`file://`) will not work due to browser security restrictions.

Run a local web server instead.

Using Python:

```bash
cd KaushixLabs
python3 -m http.server 8000
```

Then visit:

```
http://localhost:8000
```

---

## Deployment

The website can be deployed directly using GitHub Pages.

Simply push the repository to GitHub and enable GitHub Pages for the repository. Since the project is entirely static, no additional build step or backend is required.

---

## Future Improvements

* Publications page
* Research blog
* Events and workshops
* News section
* Search and filtering
* Markdown-based research articles
* Automatic project generation
* Interactive research timeline
* Research tags and categories
* Project gallery

---

## Philosophy

Kaushix Labs follows a simple principle:

* Keep the frontend lightweight.
* Separate content from presentation.
* Make adding new content effortless.
* Build with open web standards.
* Prioritize maintainability and performance.

---

## License

This project is released under the MIT License.

---

Built with ❤️ by **Kaushix Labs**
