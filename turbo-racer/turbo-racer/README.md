# Turbo Racer — full-stack Java racing game

- **Backend:** Spring Boot 3 (Java 17), Spring Data JPA, H2 file database, REST API
- **Frontend:** HTML5 canvas pseudo-3D racer served by Spring Boot (`src/main/resources/static`)
- **HUD:** rev-arc, digital speed, gear, points, minimap, fuel gauge, timer, pause, touch pedals, 1st/2nd/3rd + player labels

## Run
    mvn spring-boot:run
Open http://localhost:8080

## Controls
← → steer · ↑ gas · ↓ brake · Shift nitro · C camera · P pause (on-screen buttons work with touch/mouse)

## API
- `GET  /api/scores/top?limit=10` — fastest times
- `POST /api/scores` `{ "name": "Ace", "timeMs": 185000 }` — submit a finished 3-lap race

Times are stored in `./data/turboracer.mv.db`.
