# AGENTS.md

## Purpose

This guide is for agentic coding assistants working in this repo. It captures
how to build, lint, and test the backend and frontend, plus the house style
used in existing code. Follow it for any changes unless a user request says
otherwise.

## Repository Layout

- `backend/` FastAPI service (Python 3.12, uv, aiohttp, pydantic)
- `frontend/` Vite + React + TypeScript + Tailwind
- `legacy/` old scripts, read-only for reference
- `docker-compose.yml` local orchestration

## Commands (Backend)

### Install / Run

- Install deps: `cd backend && uv sync`
- Run dev server: `cd backend && uv run uvicorn src.hos_padel.main:app --reload`
- Build wheel: `cd backend && uv build`

### Tests

- Run all tests: `cd backend && uv run pytest`
- Run a single file: `cd backend && uv run pytest tests/test_file.py`
- Run a single test: `cd backend && uv run pytest tests/test_file.py::test_name`
- Run by keyword: `cd backend && uv run pytest -k "availability"`

Note: there is currently no `tests/` directory checked in. Add tests under
`backend/tests/` when needed and keep them fast/unit-level by default.

## Commands (Frontend)

### Install / Run

- Install deps: `cd frontend && npm install`
- Run dev server: `cd frontend && npm run dev`
- Build: `cd frontend && npm run build`
- Preview build: `cd frontend && npm run preview`

### Lint

- Run lint: `cd frontend && npm run lint`

### Tests

- No frontend test runner is configured. If you add tests, document the
  command here and keep scripts in `frontend/package.json`.

## Commands (Docker)

- Build & run all services: `docker compose up --build`
- Run in background: `docker compose up -d --build`
- View API logs: `docker compose logs -f api`
- Stop services: `docker compose down`

## Style Guide (Backend)

### Python

- Target Python 3.12.
- Use 4-space indentation, no tabs.
- Prefer explicit type hints for function inputs/outputs and public fields.
- Keep async functions `async def` and use `await` for I/O.
- Use standard-library imports first, then third-party, then local imports.
- Keep local imports relative within `hos_padel/` (e.g., `from ...core import ...`).
- Keep module docstrings at the top of files and short docstrings for helpers.
- Prefer small, single-purpose functions and helpers (see `_validate_*`).
- Use `pydantic`/`pydantic-settings` for configuration and models.
- Use `FastAPI` dependency injection and response models for routes.

### Error Handling

- For API input validation, raise `fastapi.HTTPException` with `status_code`
  and a helpful `detail` message.
- For HTTP client calls, allow `aiohttp` to raise on non-2xx and surface
  exceptions to the service layer; avoid swallowing errors silently unless
  behavior requires a fallback.
- Keep errors typed and explicit; do not use bare `except:`.

### Naming

- `snake_case` for functions, variables, modules.
- `PascalCase` for classes and Pydantic models.
- Constants in `UPPER_SNAKE_CASE` and centralized under `core/constants.py`.

### Structure

- API routes live in `backend/src/hos_padel/api/routes/`.
- Business logic should stay in `services/` with thin route handlers.
- Scraper concerns stay in `scraper/` with a shared client.

## Style Guide (Frontend)

### TypeScript + React

- Use function components and hooks only.
- Keep imports grouped: external libs first, then local modules.
- Use named exports for hooks/utilities; default exports for components.
- Prefer `interface` for props and exported shapes.
- Use explicit types for API data and custom hooks.
- Keep state minimal and derived data computed in render or helpers.
- Favor `Map<string, T>` for keyed availability (existing pattern).

### Formatting

- 2-space indentation.
- No semicolons (match existing files).
- Single quotes in TS/TSX imports/strings.
- Trailing commas in multiline objects/arrays/args.

### Naming

- `PascalCase` for components and types.
- `camelCase` for variables/functions/hooks.
- `UPPER_SNAKE_CASE` only for constants.

### Error Handling

- For fetch failures, throw `Error` with a descriptive message.
- In hooks, normalize unknown errors to `Error` instances.
- If a call can be partially degraded, return safe fallbacks (see
  `getWeekAvailability` returning empty slots on error).

### UI / Styling

- Use Tailwind utility classes for styling; avoid inline styles.
- Keep layout-related classes in the component, small presentational helpers
  in `components/Calendar/`.

## Tooling Notes

- ESLint config lives at `frontend/eslint.config.js` and includes React Hooks
  and React Refresh rules. Do not disable lint rules without discussion.
- TypeScript is `strict` and disallows unused locals/params; keep types tidy.

## Cursor / Copilot Rules

- No `.cursor/rules`, `.cursorrules`, or Copilot instruction files exist.
  If they are added later, update this file to reflect them.
