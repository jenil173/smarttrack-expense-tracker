# Smart Expense Tracker MERN

A clean, beginner-friendly Smart Expense Tracker with a professional fintech dashboard. Built with the full MERN stack (MongoDB, Express, React, Node.js) and TailwindCSS.

## Project Structure

- `backend`: Node.js/Express server and MongoDB models.
- `frontend`: React app with Vite and TailwindCSS.

## Features

- **Authentication**: JWT-based secure auth and Bcrypt hashing.
- **Smart Dashboard**: Visual representation of your financial health, category breakdown (Doughnut chart), and monthly trends (Line chart).
- **Expense CRUD**: Add, edit, delete, and view expenses with manual inputs.
- **Natural Language Parsing (NLP)**: Simply type "Spent 200 on food" and the tracker automatically categorizes it.
- **Smart Insights**: Get feedback on your spending vs. income.
- **Admin Panel**: Manage users and view system-wide financial statistics.

## Setup Instructions

Make sure you have Node.js and MongoDB installed locally.

1. **Install Dependencies**
   Run the following command in the root folder to install both backend and frontend dependencies:
   ```bash
   npm run install-all
   ```
   Or install them manually:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Environment Variables**
   The `.env` files are auto-generated.
   - `backend/.env`: Configures MongoDB URI and JWT secrets.
   - `frontend/.env`: Configures the Vite API endpoint.

3. **Database Seeding**
   Populate the database with default users and sample data:
   ```bash
   cd backend
   npm run seed
   ```

4. **Run the Application**
   From the root folder, run the install command first (if you haven't), then launch both servers concurrently:
   
   ```bash
   # 1. Open a terminal in the root folder
   
   # 2. Install all dependencies for both backend and frontend (first time only)
   npm run install-all
   
   # 3. Seed the database (first time only)
   cd backend
   npm run seed
   cd ..
   
   # 4. Start the application (runs both frontend and backend)
   npm run dev
   ```
   
   - Frontend is available at: http://localhost:5173
   - Backend API is running at: http://localhost:5000

## API Endpoints List

### Authentication
- `POST /api/auth/register`: Register new user
- `POST /api/auth/login`: Login user
- `GET /api/auth/me`: Get current user info (Protected)

### Expenses
- `GET /api/expenses`: Get all expenses (Protected)
- `POST /api/expenses`: Add a new expense (Protected)
- `PUT /api/expenses/:id`: Update an expense (Protected)
- `DELETE /api/expenses/:id`: Delete an expense (Protected)
- `POST /api/expenses/nlp`: Add an expense via Natural Language (Protected)
- `GET /api/expenses/summary`: Get aggregated dashboard summary (Protected)

### Income
- `GET /api/income`: Get all incomes (Protected)
- `POST /api/income`: Add new income (Protected)
- `DELETE /api/income/:id`: Delete income (Protected)

### Admin
- `GET /api/admin/stats`: Get system-wide stats and users list (Admin Protected)

## Demo Accounts

The seed script creates the following demo accounts:
- **Admin**: `admin@tracker.com` / `admin123`
- **User**: `user1@tracker.com` / `user123`
