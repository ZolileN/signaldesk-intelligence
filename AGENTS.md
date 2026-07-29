# AGENTS.md

## Cursor Cloud specific instructions

SignalDesk Africa is a monorepo with two runnable services. Standard setup/run commands live in `README.md` (§3–5); this section only captures non-obvious caveats.

### Services
- Backend API — FastAPI in `apps/api/main.py`. Run from the repo root (imports use package paths like `apps.api.main`):
  `source venv/bin/activate && uvicorn apps.api.main:app --reload --port 8000` (health at `http://localhost:8000/health`).
- Web app — React + Vite in `apps/web`. `cd apps/web && npm run dev` (serves on port 3000). Reads backend URL from `VITE_API_URL`, falling back to `http://localhost:8000`.

### Non-obvious caveats
- No database or Docker needed for local dev. `packages/database/db.py` uses an in-memory store unless `DATABASE_URL` starts with `postgresql`. Postgres/PostGIS/pgvector are production-only.
- LLM synthesis is optional. Without `GEMINI_API_KEY`, `services/situation_engine/situation_service.py` falls back to deterministic rules-based synthesis. No key is required to run anything.
- Backend startup does a live news scrape over the network, but always falls back to a seeded benchmark payload if offline, so it boots and seeds situations either way (first startup takes a few extra seconds).
- The committed `venv/` was created on another machine with a hardcoded absolute path, so `source venv/bin/activate` can break `PATH`. The startup update script repairs it via `python3 -m venv venv`. If activation still misbehaves, either re-run `python3 -m venv venv` or invoke binaries directly (`venv/bin/uvicorn`, `venv/bin/python`).
- The repo tracks `venv/`, `apps/web/node_modules/`, and `__pycache__/`. Simply running the servers/tests dirties the working tree with bytecode and lockfile churn — ignore that noise and do not commit it.
- There are two similarly named dirs: `services/situation_engine` (underscore, the importable package used by the app) and `services/situation-engine` (hyphen, not importable). Edit the underscore one.

### Tests / lint / build
- Tests: `source venv/bin/activate && python -m pytest tests/` (also runnable individually, e.g. `python tests/test_intelligence_engine.py`).
- Lint: no linter is configured (no eslint/ruff/flake8 config; `apps/web/package.json` has no `lint` script).
- Web production build: `cd apps/web && npm run build` (dev uses `npm run dev`).
