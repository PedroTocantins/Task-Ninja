# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

TaskNinja: a task-management REST API (Node.js + Express 5 + TypeScript strict). Phase 1 has only `GET /tasks`, backed by `data/tasks.json`. Planned: database (PostgreSQL/MongoDB), auth, full CRUD. The user writes new endpoints themselves following the existing patterns, so keep them consistent. Licensed GPL-3.0.

## Commands

- `npm run dev`: run with tsx in watch mode (reads `.env`; copy from `.env.example`)
- `npm run typecheck`: `tsc --noEmit`
- `npm run build` / `npm start`: compile to `dist/` and run it
- No test runner or linter is configured yet.

## Architecture

Controller → Service → Repository, wired manually in `src/container.ts` (the composition root; the only file that names concrete classes).

- `repositories/task.repository.ts` is the interface; `json-task.repository.ts` implements it, validating parsed JSON with a type guard (JSON is treated as `unknown`, so there is no `any`). A DB implementation should be a new class wired up in `container.ts`.
- Business rules (e.g. newest-first sorting) live in services, never in repositories or controllers.
- Controllers have no try/catch: Express 5 forwards rejected promises to `middlewares/error-handler.ts`.
- Errors: throw `AppError` subclasses (`src/errors/app-error.ts`) for expected failures. Anything else becomes a generic 500 and is logged.
- Response envelope (`src/types/api-response.ts`): success `{ data }`, failure `{ error: { code, message } }`.
- `app.ts` builds the app without listening (so tests can import it); `server.ts` listens.
- Config is read only through `src/config/env.ts`, never `process.env` directly.
