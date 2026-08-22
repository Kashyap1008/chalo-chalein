# ✈️ Chalo Chalein (chalo-chalein)

> **Smart Travel Itinerary Builder & Budget Planner**  
> *Built for the 8-Hour Hackathon (9:00 AM – 5:00 PM)*

---

## 📌 About the Project

**Chalo Chalein** is a collaborative travel planning web application that allows users to seamlessly plan multi-city trips, organize day-by-day itineraries, track activity and stay budgets in real-time, and share read-only itineraries with friends or family via a public link.

### 🌟 Core Demo Features

1. **Authentication & Profile Management**: Secure JWT login, registration, and user profiles.
2. **Trip & Itinerary Builder**: Create trips, add city stops, date ranges, and schedule daily activities.
3. **Real-time Budget Calculator**: Automated aggregate calculation of stay, travel, activity, and meal costs.
4. **City & Activity Discovery**: Searchable catalog of destinations and activities with cost & duration indices.
5. **Public Itinerary Sharing**: Shareable read-only itinerary link for external viewers.

---

## 🛠️ Tech Stack

- **Backend**: Django REST Framework (DRF), SimpleJWT Auth, PostgreSQL / SQLite
- **Frontend**: React 18, Vite, Tailwind CSS, Axios (with JWT Interceptors)
- **Deployment & Tooling**: Git (Single-branch setup with atomic commits)

---

## 👥 Team Work Division & Roles

| Member | Focus Area | Responsibilities |
|---|---|---|
| **Member A** | Backend (Auth & Users) | JWT Auth (`accounts` app), User Profile CRUD, Admin/Analytics stats |
| **Member B** | Backend (Trips, Itinerary & Budget) | `trips` app (Trip/Stop/TripActivity CRUD), `catalog` app (City/Activity seed & search), Budget aggregation API |
| **Member C** | Frontend Lead (Auth & Trip Scaffolding) | Axios + JWT wrapper, Router, Tailwind theme, Auth views, Dashboard, Create Trip UI |
| **Member D** | Frontend (Itinerary & Discovery UI) | Itinerary Builder, City & Activity Search, Budget Breakdown charts/UI, Public Share Page |

---

## 📁 Repository Structure

```
chalo-chalein/
├── backend/                    # Django REST Framework Backend
│   ├── core/                   # Project config & root routing
│   ├── accounts/               # Auth, User model, Profile endpoints
│   ├── trips/                  # Trips, Stops, TripActivities & Budget APIs
│   ├── catalog/                # Cities, Activities seed data & search APIs
│   └── manage.py
│
├── frontend/                   # React + Vite + Tailwind Frontend
│   ├── src/
│   │   ├── api/                # Axios wrapper with JWT token auto-refresh
│   │   ├── context/            # AuthContext provider
│   │   ├── pages/              # Auth, Dashboard, Itinerary, Discovery pages
│   │   └── components/         # Reusable UI components & Navbar
│   └── package.json
└── README.md
```

---

## 🚀 Quickstart Guide

### 1. Backend Setup (Django DRF)

```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

*Backend runs at `http://127.0.0.1:8000/`*

### 2. Frontend Setup (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

*Frontend runs at `http://localhost:5173/`*

---

## ⏰ Hackathon Schedule (9:00 AM – 5:00 PM)

- **09:00 – 09:30**: Kickoff, Lock ERD, Repo init & initial push
- **09:30 – 12:00**: Sprint 1 — Auth E2E, Base Models, Frontend Routing Shell, Seed Data Catalog
- **12:00 – 12:30**: Sync Point 1 & Integration Check
- **12:30 – 15:00**: Sprint 2 — Itinerary Builder UI, Budget Calculation API, Search & Discovery
- **15:00 – 15:20**: Sync Point 2 & Feature Freeze Triage
- **15:20 – 16:15**: Budget Charts, Public Link Sharing, Auth/CORS Polish
- **16:15 – 16:45**: Bug Fixes Only (No new features)
- **16:45 – 17:00**: Seed Demo Data & Final Demo Run
