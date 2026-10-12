# Generative AI for Automated Generation of Accessible Learning Materials for Hearing-Impaired Students

An AI-driven educational platform designed to convert standard learning content into accessible materials for Deaf and Hard-of-Hearing (DHH) students.

> **Project Phase:** Initial Architecture & Base Foundation Setup.  
> Application feature implementations (content ingestion, AI agents, ISL generation, quizzes) are unstaged for subsequent development phases.

---

## 1. Technology Stack

- **Frontend:** React 18, Vite, JavaScript, CSS
- **Backend:** Python 3.10+, FastAPI, Uvicorn
- **Database:** MongoDB Atlas
- **Driver:** PyMongo
- **Configuration:** Python-dotenv, Vite Environment Variables (`.env`)
- **Version Control:** Git

---

## 2. Project Directory Structure

```text
accessible-learning-ai/
│
├── frontend/                     # React + Vite client application
│   ├── public/                   # Static public assets (e.g., vite.svg)
│   ├── src/
│   │   ├── assets/               # Static visual and brand assets
│   │   ├── components/           # Reusable UI components (ready for teammate UI)
│   │   ├── pages/                # UI view pages (ready for teammate UI)
│   │   ├── layouts/              # Common UI wrappers and layout templates
│   │   ├── services/             # API client layer (configured with VITE_API_BASE_URL)
│   │   │   └── api.js
│   │   ├── hooks/                # Custom React hooks
│   │   ├── utils/                # Frontend helper utilities
│   │   ├── App.jsx               # Foundation status landing page
│   │   ├── index.css             # Base stylesheet
│   │   └── main.jsx              # React DOM mounting entry point
│   ├── .env.example              # Frontend environment template
│   ├── .gitignore                # Frontend-specific Git ignore rules
│   ├── index.html                # HTML template
│   ├── package.json              # NPM scripts and dependencies
│   └── vite.config.js            # Vite configuration
│
├── backend/                      # FastAPI Python backend application
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/           # Modular route endpoints
│   │   │       ├── health.py     # /health and /health/db routes
│   │   │       └── __init__.py   # Route aggregator
│   │   ├── core/                 # Core utilities and middleware
│   │   ├── database/             # MongoDB Atlas connection and verification
│   │   │   ├── connection.py     # PyMongo client, ping test, timeout handler
│   │   │   └── __init__.py
│   │   ├── models/               # Domain database models
│   │   ├── schemas/              # Pydantic validation schemas
│   │   ├── services/             # Backend business logic services
│   │   ├── agents/               # AI Agents placeholder directory
│   │   │   └── README.md
│   │   ├── utils/                # Backend helper utilities
│   │   ├── config.py             # Environment configuration loader
│   │   └── main.py               # Application entry point with CORS & lifespan
│   ├── tests/                    # Automated test suite
│   │   └── test_health.py        # Health and database check tests
│   ├── .env.example              # Backend environment template
│   ├── .gitignore                # Python-specific Git ignore rules
│   └── requirements.txt          # Python package dependencies
│
├── docs/                         # Detailed setup and architectural documentation
│   └── setup.md                  # Comprehensive MongoDB Atlas and network guide
│
├── .gitignore                    # Root Git ignore rules
└── README.md                     # Project overview and instructions
```

---

## 3. Prerequisites

- **Python** `3.10+` installed
- **Node.js** `18.0+` & `npm` installed
- **MongoDB Atlas** account (or local MongoDB instance for development)

---

## 4. Backend Setup & Run Instructions

### Step 4.1: Create Virtual Environment and Install Dependencies
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Windows (cmd):
.\venv\Scripts\activate.bat
# macOS / Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 4.2: Configure Environment Variables
Copy the `.env.example` file to `.env`:
```bash
# Windows (PowerShell):
Copy-Item .env.example .env

# macOS / Linux:
cp .env.example .env
```

Edit `backend/.env` with your settings:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/accessible_learning_db?retryWrites=true&w=majority
MONGODB_DATABASE=accessible_learning_db
FRONTEND_ORIGIN=http://localhost:5173
APP_ENV=development
PORT=8000
HOST=0.0.0.0
```

> **Note:** The backend boots safely even if `MONGODB_URI` is not yet configured. The database health endpoint (`/health/db`) will report status as `unconfigured` until valid Atlas credentials are provided.

### Step 4.3: Start the Backend Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- Interactive Swagger Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
- Alternative ReDoc Documentation: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 5. Frontend Setup & Run Instructions

### Step 5.1: Install Dependencies
Open a separate terminal:
```bash
# Navigate to frontend directory
cd frontend

# Install npm packages
npm install
```

### Step 5.2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
# Windows (PowerShell):
Copy-Item .env.example .env

# macOS / Linux:
cp .env.example .env
```

Ensure `VITE_API_BASE_URL` points to your backend instance:
```env
VITE_API_BASE_URL=http://localhost:8000
```

### Step 5.3: Start Frontend Dev Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 6. MongoDB Atlas Configuration Summary

For complete step-by-step instructions with screenshots and network settings, refer to [`docs/setup.md`](docs/setup.md).

Quick summary:
1. Create a free **M0 cluster** at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Security > Database Access**, add a database user with read/write permissions.
3. Under **Security > Network Access**, add your current development IP address (avoid `0.0.0.0/0` in shared environments).
4. Under **Deployment > Database**, click **Connect > Drivers > Python** and copy the URI.
5. Paste into `backend/.env` under `MONGODB_URI` with your actual password and database name.
6. Verify connection at `http://localhost:8000/health/db`.

---

## 7. Health Check Endpoints

| Endpoint | Method | Expected HTTP Status | Description |
|---|---|---|---|
| `/` | `GET` | 200 OK | Root info endpoint returning project title, status, and route links. |
| `/health` | `GET` | 200 OK | Application health check returning operational status and environment. |
| `/health/db` | `GET` | 200 OK / 503 Unavailable | Real-time database connection test via PyMongo `admin.command('ping')`. |
| `/docs` | `GET` | 200 OK | Built-in interactive Swagger UI. |

---

## 8. Troubleshooting Common Errors

### 1. `backend/.env` not taking effect
- Ensure the filename is precisely `.env` (not `.env.txt`).
- Restart the Uvicorn server after updating environment variables.

### 2. MongoDB connection timeout / `unreachable` on `/health/db`
- Check MongoDB Atlas **Network Access** IP whitelist. If your network IP has changed, add your new IP.
- Check that the username and password in `MONGODB_URI` do not contain unencoded special characters (`@`, `:`, `/`).
- Verify that your local network or firewall allows outbound traffic on port `27017`.

### 3. Frontend CORS Error (`Access-Control-Allow-Origin`)
- Check that `FRONTEND_ORIGIN` in `backend/.env` matches the frontend port (default `http://localhost:5173`).
- If running on a different port or network host, update `FRONTEND_ORIGIN` in `backend/.env` (supports comma-separated URLs).

### 4. Port 8000 or 5173 already in use
- Change `PORT=8001` in `backend/.env` or run `uvicorn app.main:app --port 8001`.
- Update `VITE_API_BASE_URL=http://localhost:8001` in `frontend/.env`.

---

## 9. Next Steps for Development Team

- **Frontend Teammate:** Add static UI components and view pages into `frontend/src/components/` and `frontend/src/pages/`.
- **Backend Team:** Implement modular domain routes in `backend/app/api/routes/` and business services in `backend/app/services/`.
- **AI / Model Team:** Staging agent architectures in `backend/app/agents/`.
