# DataRunners: A Cyberpunk Oregon Trail

A terminal-style, narrative survival game that reimagines the classic Oregon Trail as a cyberpunk reimagination. Guide a small team of specialists across a 2000 km journey from the Seattle Ruins to the Neo-Tokyo Data Haven, managing resources, surviving random events, and making hard choices.

## Key ideas

- Retro terminal aesthetic with modern browser graphics and procedural events.
- Resource management (credits, data chips, energy cells) and a simple inventory system.
- Events, hazards, and encounters that require choices with risk/reward outcomes.
- TypeScript codebase with modular game logic and visual terminal effects.

## Playable demo

- Open `index.html` in a browser after building the TypeScript output (see instructions below). The interface is keyboard-driven and intentionally designed to feel like a command-line terminal.

## Basic commands

- TRAVEL — advance along the route (consumes energy cells)
- REST — recover team health and recharge energy
- STATUS — display team, resources and progress
- INVENTORY — view items and resources
- USE — choose and use a consumable item
- HELP — show available commands
- SAVE / LOAD — save to / restore from localStorage
- During events, reply with a number (1, 2, 3, ...) to select a choice

## Tech stack

- TypeScript (source in `src/`) compiled to JavaScript in `dist/`
- Plain HTML/CSS for the terminal UI (`index.html`)
- No runtime server required (static site)

## Getting started

1. Install dependencies:

	```bash
	npm install
	```

2. Build TypeScript once:

	```bash
	npm run build
	```

	This compiles `src/*.ts` into `dist/*.js` (see `tsconfig.json`).

3. Open the game:

	- Directly: open `index.html` in your browser (macOS: `open index.html`).
	- Or run a simple static server (recommended for some browsers):

		```bash
		npx http-server .
		```

		then open http://localhost:8080

## Development workflow

- To continuously compile during development:

	```bash
	npm run watch
	```

- Edit TypeScript files in `src/` and the compiled output will appear in `dist/`.
- The UI is in `index.html`; most visual/animation code is in `src/terminal.ts` and game logic in `src/game.ts`.

## Project structure (important files)

- index.html — the terminal UI and CSS
- src/game.ts — core game logic, events, commands and state
- src/terminal.ts — ambient visual effects and terminal UI enhancements
- tsconfig.json — TypeScript configuration (outDir: `dist`)
- package.json — build/watch scripts and dev dependencies

## Contributing

- Open issues or send pull requests. Keep changes small and focused. TypeScript types are enforced (strict mode in `tsconfig.json`).

## License

- ISC (see `package.json`)

## Credits

- Built as a small, single-developer project. Inspiration: classic text adventures and the Oregon Trail reimagined with cyberpunk themes.

Have fun. The net remembers everything.
