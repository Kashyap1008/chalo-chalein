# 🚀 Hackathon Starter Pack

> **Django REST Framework + React + Vite + Tailwind CSS + JWT Auth + PostgreSQL**

A fully wired full-stack starter pack so you can skip the boilerplate and start building your killer feature immediately.

---

## 📁 Project Structure

```
OdooxLDEC/
├── backend/                    # Django REST Framework
│   ├── core/                   # Project settings & root URLs
│   │   ├── settings.py         # DRF, JWT, CORS, PostgreSQL config
│   │   ├── urls.py             # Root URL configuration
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── accounts/               # User auth app (ready to use)
│   │   ├── models.py           # Custom User model (email-based login)
│   │   ├── serializers.py      # Register, Profile, ChangePassword
│   │   ├── views.py            # Register, Profile, Logout views
│   │   ├── urls.py             # Auth API routes
│   │   └── admin.py
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env                    # Environment variables (local dev)
│   └── .env.example
│
├── frontend/                   # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── api/axios.js        # Axios instance with JWT interceptors
│   │   ├── context/AuthContext.jsx  # Auth state management
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── DashboardPage.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css           # Tailwind + custom theme
│   ├── index.html
│   ├── vite.config.js          # Vite + Tailwind + API proxy
│   └── package.json
│
└── .gitignore
```

---

## 🏁 Quick Setup

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **PostgreSQL** running locally

### 1. Database Setup

```sql
-- In psql or pgAdmin:
CREATE DATABASE hackathon_db;
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Edit .env if needed (DB credentials, etc.)

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start server
python manage.py runserver
```

Backend runs at: **http://localhost:8000**

### 3. Frontend Setup

```bash
cd frontend

# Dependencies are already installed, but if needed:
npm install

# Start dev server
npm run dev
```

Frontend runs at: **http://localhost:5173**

> The Vite dev server proxies `/api/*` requests to Django on port 8000, so no CORS issues in development.

---

## 🔑 API Endpoints

| Method | Endpoint                      | Description       | Auth Required |
|--------|-------------------------------|--------------------|:---:|
| POST   | `/api/auth/register/`         | Register new user  | ❌ |
| POST   | `/api/auth/login/`            | Get JWT tokens     | ❌ |
| POST   | `/api/auth/token/refresh/`    | Refresh access token | ❌ |
| GET    | `/api/auth/profile/`          | Get user profile   | ✅ |
| PUT    | `/api/auth/profile/`          | Update profile     | ✅ |
| POST   | `/api/auth/change-password/`  | Change password    | ✅ |
| POST   | `/api/auth/logout/`           | Blacklist refresh token | ✅ |

---

## 🧩 Adding a New Feature (Cheat Sheet)

### Backend — New Django App

```bash
cd backend
python manage.py startapp your_app
```

1. Add `'your_app'` to `INSTALLED_APPS` in `core/settings.py`
2. Create models in `your_app/models.py`
3. Create serializers in `your_app/serializers.py`
4. Create views in `your_app/views.py`
5. Add URLs in `your_app/urls.py`
6. Include in `core/urls.py`:
   ```python
   path('api/your-app/', include('your_app.urls')),
   ```
7. Run `python manage.py makemigrations && python manage.py migrate`

### Frontend — New Page

1. Create `src/pages/YourPage.jsx`
2. Add route in `App.jsx`:
   ```jsx
   <Route path="/your-page" element={<YourPage />} />
   ```
3. Use the API client:
   ```jsx
   import api from '../api/axios';
   const { data } = await api.get('/your-app/endpoint/');
   ```

---

## ⚡ What's Pre-Configured

- ✅ **Custom User Model** — Email-based login, extensible
- ✅ **JWT Authentication** — Access + Refresh tokens with auto-refresh
- ✅ **CORS** — Frontend ↔ Backend communication
- ✅ **Axios Interceptors** — Auto-attach tokens, silent refresh on 401
- ✅ **Auth Context** — Login/Register/Logout state management
- ✅ **Protected Routes** — Route guard component
- ✅ **Dark Theme** — Sleek glassmorphism UI
- ✅ **Toast Notifications** — Success/error feedback
- ✅ **API Proxy** — Vite proxies `/api/*` to Django
- ✅ **Token Blacklisting** — Secure logout

---

Good luck at the hackathon! 🎉
