# Project Rules — Odoo Hackathon (OdooxLDEC)

## GSD Mode: ACTIVE
- Follow the GSD Hackathon Workflow skill for ALL development work
- Never write code without a spec or task breakdown
- Verify every change before moving on
- Keep atomic git commits

## Tech Stack (Locked)
- **Backend:** Django REST Framework (Python)
- **Frontend:** React + Vite + Tailwind CSS
- **Auth:** JWT (SimpleJWT)
- **Database:** PostgreSQL

## Project Structure
- Backend code lives in `backend/`
- Frontend code lives in `frontend/`
- Specs and plans go in `specs/`
- Single git branch for submission

## Development Rules
1. Always run the dev server to verify changes
2. Backend API at `http://localhost:8000`
3. Frontend dev at `http://localhost:5173` (proxies `/api/*` to backend)
4. Update task progress in real-time
5. Commit after each verified feature

## Hackathon Rules
- Add mentor's GitHub ID as collaborator when assigned
- All code on a single branch
- Team Leader handles submissions on the portal
- Submit GitHub repo link + demo video before deadline
