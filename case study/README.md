# Student Management System

A full-stack web application designed for student tracking, enrollment status management, and departmental academic metrics using **React (Vite)**, **Node.js**, **Express.js**, and **MongoDB Atlas**.

---

## 📁 Project Directory Structure

```text
case study/
├── backend/
│   ├── .env.example              # Environment variables template
│   ├── package.json              # Express, Mongoose, CORS, Dotenv dependencies
│   └── server.js                 # REST API endpoints & MongoDB connection logic
├── frontend/
│   ├── .env.example              # Frontend Vite environment template
│   ├── index.html                # Single Page Application HTML root
│   ├── package.json              # React 18 & Vite build dependencies
│   ├── vite.config.js            # Vite configuration
│   └── src/
│       ├── App.jsx               # Student Dashboard & interactive forms
│       ├── main.jsx              # React 18 DOM mount point
│       └── style.css             # Responsive styling & layout
├── .gitignore                    # Git ignore file
└── README.md                     # Setup instructions & API documentation
```

---

## 🚀 Key Features

1. **MongoDB Atlas Integration:**
   - Cloud database connection using Mongoose.
   - Student collection with unique constraints (`rollNumber`, `email`).
   - Mongoose validation rules (GPA range: 0.0 - 10.0, Year: 1 - 4).

2. **Express.js RESTful API:**
   - **Health Check (`GET /api/health`):** Verifies database connection readiness.
   - **Full CRUD Support:**
     - `GET /api/students` - Retrieve student list (with optional department filter).
     - `GET /api/students/:id` - Fetch single student details.
     - `POST /api/students` - Register new student record.
     - `PUT /api/students/:id` - Update student information.
     - `DELETE /api/students/:id` - Remove student document.
   - **Aggregation Pipeline (`GET /api/reports/department-summary`):** Computes total students, average GPA, and highest GPA grouped by department.

3. **Interactive React 18 Frontend:**
   - Real-time KPI summary cards (Total Students, Active Count, Campus Average GPA).
   - Dynamic Department Analytics cards powered by MongoDB aggregation.
   - Integrated Add/Edit Student form with input validation.
   - Filter and search bar (search by name, roll number, or department).
   - Responsive and clean UI.

---

## 💻 Local Setup & Execution Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or above)
- npm (Node Package Manager)
- A MongoDB Atlas connection string (or local MongoDB running)

---

### Step 1: Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd "case study/backend"
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` configuration file:
   ```bash
   cp .env.example .env
   ```

4. Configure your `.env` file:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/student_db?retryWrites=true&w=majority
   DB_NAME=student_db
   FRONTEND_ORIGIN=http://localhost:5173
   ```

5. Start the backend server:
   ```bash
   npm start
   ```
   *The backend server will run at: `http://localhost:5000`*

---

### Step 2: Frontend Setup

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd "case study/frontend"
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` configuration file:
   ```bash
   cp .env.example .env
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend dashboard will be available at: `http://localhost:5173`*

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Check service health and database connection status |
| `GET` | `/api/students` | Get all student records (supports `?department=...`) |
| `GET` | `/api/students/:id` | Get details of a single student by ID |
| `POST` | `/api/students` | Create and register a new student record |
| `PUT` | `/api/students/:id` | Update an existing student's details |
| `DELETE` | `/api/students/:id` | Delete a student record |
| `GET` | `/api/reports/department-summary` | Aggregate statistics by department |

---

## 📄 License
This project is open-source and available under the [MIT License](https://opensource.org/licenses/MIT).
