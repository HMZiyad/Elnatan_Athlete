# Underrated Athlete Platform

A comprehensive platform connecting fans and athletes, featuring dynamic leaderboards, fan voting, ecommerce functionality, and an admin dashboard.

## Tech Stack
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Lucide React
- **Backend:** Go (Golang), PostgreSQL, Redis, Docker
- **Payments:** Stripe

---

## 🚀 Getting Started

Follow the instructions below to get both the frontend and backend running locally.

### 1. Prerequisites
Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/) & Docker Compose
- [Go](https://go.dev/) (optional, if running outside of Docker)

### 2. Running the Backend
The backend runs seamlessly within Docker, containing the Go API, PostgreSQL database, and Redis cache.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create your `.env` file (if it doesn't already exist):
   ```bash
   cp .env.example .env
   ```
   *(Ensure you populate the required environment variables like Database URL, Stripe keys, and JWT secrets)*

3. Start the backend services using Docker Compose:
   ```bash
   docker compose up --build -d
   ```

This will spin up:
- **Go API Server** (Port: `8080`)
- **PostgreSQL Database** (Port: `5432`)
- **Redis Cache** (Port: `6379`)

*(To view logs, you can run `docker compose logs -f`)*

### 3. Running the Frontend
The frontend is a Next.js application that runs independently and connects to the backend API.

1. Open a new terminal tab and navigate to the project root:
   ```bash
   cd Elnatan_Athlete
   ```
2. Install the necessary Node dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env` file (if it doesn't exist):
   ```bash
   cp .env.example .env
   ```
   Ensure your frontend `.env` points to the local backend, e.g.:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080/api
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### 4. Accessing the Application
Once both servers are running, you can access the platform at:
- **Fan Interface / Storefront:** [http://localhost:3000/fan](http://localhost:3000/fan)
- **Athlete Dashboard:** [http://localhost:3000/athlete](http://localhost:3000/athlete)
- **Admin Dashboard:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

---

## 🛠 Useful Commands

**Rebuilding the Backend:**
If you make changes to the Go files and need to rebuild the API container:
```bash
cd backend
docker compose up --build -d uag_api
```

**Shutting Down:**
To stop the backend database and API cleanly:
```bash
cd backend
docker compose down
```

**Database Access:**
To access the PostgreSQL database running inside Docker:
```bash
docker exec -it uag_postgres psql -U uag -d uag_db
```
