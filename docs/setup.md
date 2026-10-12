# Project Setup & MongoDB Atlas Configuration Guide

This guide provides step-by-step instructions for configuring your local environment, setting up a secure **MongoDB Atlas** database cluster, and connecting the application.

---

## 1. Prerequisites

Before starting, ensure you have the following installed on your system:

- **Python**: Version `3.10+` (recommended)
- **Node.js**: Version `18.0+` (recommended) and `npm`
- **Git**
- A web browser to access MongoDB Atlas and the web application

---

## 2. Setting Up MongoDB Atlas (Step-by-Step)

The project uses **PyMongo** to connect to MongoDB Atlas. Follow these steps to create and configure a free-tier MongoDB Atlas cluster.

### Step 2.1: Create an Atlas Account & Free-Tier Cluster
1. Navigate to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign up or log in.
2. Click **Create** to launch a new database deployment.
3. Choose the **M0 Free (Shared)** tier.
4. Select your preferred Cloud Provider (AWS, Google Cloud, or Azure) and a region closest to your physical location for low latency.
5. Click **Create Deployment**.

### Step 2.2: Create a Database User
1. In the MongoDB Atlas left-hand navigation menu, under **Security**, click **Database Access**.
2. Click the **Add New Database User** button.
3. Select **Password** as the authentication method.
4. Choose a username (e.g., `accessibility_admin`).
5. Generate or enter a strong, secure password.
   > **Important:** Save this password securely. You will need it in your connection string. Avoid using special symbols like `@`, `:`, or `/` in the password, or URL-encode them (`%40`, etc.) if needed.
6. Under **Database User Privileges**, select **Read and write to any database** (or create a custom role with read/write access to `accessible_learning_db`).
7. Click **Add User**.

### Step 2.3: Configure Secure Network Access (IP Whitelist)
> **Security Best Practice:** Restrict database access to your current development IP address. Do **not** leave network access open to the entire internet (`0.0.0.0/0`) in production or long-term development.

1. In the Atlas left navigation menu, under **Security**, click **Network Access**.
2. Click the **Add IP Address** button.
3. Click **Add Current IP Address**. Atlas will automatically detect and populate your current public IPv4 address.
4. Enter an optional comment (e.g., `Local Dev Machine`).
5. Click **Confirm**.
   *(Note: If your ISP assigns a dynamic IP that changes, you will need to update this entry if you lose connectivity).*

### Step 2.4: Obtain the Python Driver Connection String
1. In the Atlas left navigation menu, under **Deployment**, click **Database**.
2. On your cluster card, click the **Connect** button.
3. Under "Connect to your application", select **Drivers**.
4. Set:
   - **Driver:** `Python`
   - **Version:** `3.12 or later` (or matching your installed Python version)
5. Copy the connection string format displayed. It will look like:
   ```text
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
   ```

---

## 3. Configuring Local Environment Variables

### Backend Configuration
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Copy `.env.example` to create your local `.env`:
   ```bash
   # On Windows (PowerShell):
   Copy-Item .env.example .env

   # On Linux / macOS:
   cp .env.example .env
   ```
3. Open `backend/.env` in your text editor.
4. Update `MONGODB_URI` with your connection string, replacing:
   - `<username>` with your Atlas database username.
   - `<password>` with your Atlas database password.
   - Ensure the database name is specified, e.g.:
     ```env
     MONGODB_URI=mongodb+srv://accessibility_admin:YOUR_PASSWORD@cluster0.abcde.mongodb.net/accessible_learning_db?retryWrites=true&w=majority
     MONGODB_DATABASE=accessible_learning_db
     FRONTEND_ORIGIN=http://localhost:5173
     APP_ENV=development
     PORT=8000
     HOST=0.0.0.0
     ```
5. Save the file. **Do not commit `backend/.env` to Git.**

### Frontend Configuration
1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Copy `.env.example` to `.env`:
   ```bash
   # On Windows (PowerShell):
   Copy-Item .env.example .env

   # On Linux / macOS:
   cp .env.example .env
   ```
3. Verify that `VITE_API_BASE_URL=http://localhost:8000` is set.

---

## 4. Running the Backend and Verifying Connectivity

1. From the `backend/` folder, set up a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   
   # Activate virtual environment:
   # Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # Linux/macOS:
   source venv/bin/activate

   pip install -r requirements.txt
   ```
2. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
3. Test connectivity in your browser or terminal:
   - Application status: [http://localhost:8000/health](http://localhost:8000/health)
   - Swagger Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **Database Connection Check:** [http://localhost:8000/health/db](http://localhost:8000/health/db)

### Understanding `/health/db` Responses:
- **Connected (HTTP 200 OK):**
  ```json
  {
    "connected": true,
    "status": "connected",
    "database": "accessible_learning_db",
    "message": "Successfully connected and verified MongoDB Atlas connection."
  }
  ```
- **Unconfigured (HTTP 503 Service Unavailable):**
  ```json
  {
    "connected": false,
    "status": "unconfigured",
    "database": "accessible_learning_db",
    "message": "MongoDB URI is not configured or still contains placeholder values..."
  }
  ```
- **Unreachable / Network Timeout (HTTP 503 Service Unavailable):**
  ```json
  {
    "connected": false,
    "status": "unreachable",
    "database": "accessible_learning_db",
    "message": "MongoDB Atlas cluster unreachable (timed out)..."
  }
  ```
  *Troubleshooting tip:* If you receive `unreachable`, check that your current public IP address is added in the Atlas **Network Access** tab.

---

## 5. Running the Frontend

1. In a separate terminal, navigate to the `frontend/` folder:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Open [http://localhost:5173](http://localhost:5173) in your browser.
3. Click **"Test Backend Connection"** on the landing page to verify that the frontend communicates with the backend health endpoints.
