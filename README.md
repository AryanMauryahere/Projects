# Aryan Maurya Projects

This repository is a collection of personal learning projects and experiments. Each project is kept in its own folder so it can be developed and run independently.

## Project overview

| Folder | Project | Description | Main technologies |
| --- | --- | --- | --- |
| [`01_project`](01_project) | Rock Paper Scissors | A small browser-based Rock Paper Scissors experiment. | HTML, JavaScript |
| [`02_project/Portfolio`](02_project/Portfolio) | Kage portfolio | The current interactive personal portfolio, built from the ThreeUI Kage landing page and personalized with Aryan's profile content. | React, Vite, Three.js, ThreeUI |
| [`02_project/Portfolio_website`](02_project/Portfolio_website) | Portfolio website prototype | A standalone interactive resume-style portfolio prototype. | HTML, CSS, JavaScript |
| [`turbo-racer/turbo-racer`](turbo-racer/turbo-racer) | Turbo Racer | A full-stack pseudo-3D racing game with a score leaderboard. | Java 17, Spring Boot, Spring Data JPA, H2, HTML5 Canvas |

## `01_project` — Rock Paper Scissors

This is an introductory JavaScript exercise located at [`01_project/index.html`](01_project/index.html). It provides buttons for Rock, Paper, and Scissors and contains the initial computer-choice and score logic directly in the page.

### Run

Open `01_project/index.html` in a browser. No package installation or server is required.

### Notes

- This is an early learning project and is intentionally simple.
- The page currently serves as a practice example for conditionals, variables, random values, and button handlers.

## `02_project/Portfolio` — Kage portfolio

This is the main portfolio application. It uses React and Vite around the ThreeUI Kage landing page, with locally hosted scene assets, personalized profile content, responsive navigation, skills, interests, social links, and a section reserved for completed projects.

### Requirements

- Node.js `22.12` or later
- npm

### Run locally

```sh
cd 02_project/Portfolio
npm ci
npm run dev
```

Open [http://127.0.0.1:5173/](http://127.0.0.1:5173/) in a browser.

### Useful commands

```sh
npm run check    # Validate content, regenerate the scene, and verify source fingerprints
npm run build    # Create the production build in dist/
npm run preview  # Preview the production build locally
```

### Important files

- [`src/content.js`](02_project/Portfolio/src/content.js) — profile, skills, interests, links, and project entries.
- [`src/main.jsx`](02_project/Portfolio/src/main.jsx) — active React entry point and Kage component configuration.
- [`src/personalize-kage.js`](02_project/Portfolio/src/personalize-kage.js) — adapts the original scene to the portfolio content.
- [`scripts/prepare-kage.mjs`](02_project/Portfolio/scripts/prepare-kage.mjs) — generates the local Kage page.
- [`scripts/check-kage.mjs`](02_project/Portfolio/scripts/check-kage.mjs) — verifies generated output and original source preservation.

Do not edit `public/landing-pages/kage.html` directly; it is generated from the source and personalization script. To add a real project to the portfolio, update the `projects` array in `src/content.js` and place any screenshot assets under `public/projects/`.

The project contains local license and third-party notices under [`public/licenses`](02_project/Portfolio/public/licenses). Keep these files when distributing the built site.

## `02_project/Portfolio_website` — static portfolio prototype

This folder contains a self-contained interactive portfolio prototype in [`index.html`](02_project/Portfolio_website/index.html). It presents Aryan Maurya's profile as a game-like, scrolling resume experience using inline or local web assets.

### Run

Open `02_project/Portfolio_website/index.html` directly in a browser. If browser security restrictions affect local assets, serve the folder with any simple static HTTP server.

This prototype is separate from the React/Vite portfolio. Changes made here do not automatically appear in `02_project/Portfolio`.

## `turbo-racer/turbo-racer` — Turbo Racer

Turbo Racer is a Spring Boot web application containing a pseudo-3D racing game and a persistent leaderboard. The browser game is served by the Java application from [`src/main/resources/static`](turbo-racer/turbo-racer/src/main/resources/static).

### Requirements

- Java 17 or later
- Maven

### Run locally

```sh
cd turbo-racer/turbo-racer
mvn spring-boot:run
```

Open [http://localhost:8080](http://localhost:8080).

### Controls

- Left/right arrows — steer
- Up arrow — accelerate
- Down arrow — brake
- Shift — nitro
- `C` — change camera
- `P` — pause
- On-screen controls — touch and mouse input

### Leaderboard API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/scores/top?limit=10` | Get the fastest recorded times. |
| `POST` | `/api/scores` | Submit a completed race, for example `{"name":"Ace","timeMs":185000}`. |

Scores are stored in the local H2 database files under [`data`](turbo-racer/turbo-racer/data).

## Repository conventions

- Keep each project self-contained and use its own build or run instructions.
- Avoid committing generated dependencies and build output unless a project specifically requires them.
- Keep project-specific documentation in the project's own folder; this README is the index for the entire collection.
- Do not add private credentials, personal access tokens, or other secrets to source files or public project descriptions.
