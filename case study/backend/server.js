const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/student_db";
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: FRONTEND_ORIGIN.split(",").map((item) => item.trim()),
    credentials: true,
  })
);

// Database Connection
mongoose
  .connect(MONGODB_URI, {
    dbName: process.env.DB_NAME || "student_db",
  })
  .then(() => console.log(" Successfully connected to MongoDB Atlas"))
  .catch((err) => console.error(" MongoDB connection error:", err.message));

// Student Data Schema
const studentSchema = new mongoose.Schema(
  {
    rollNumber: {
      type: String,
      required: [true, "Roll Number is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      enum: ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil"],
    },
    year: {
      type: Number,
      required: [true, "Academic year is required"],
      min: [1, "Year must be between 1 and 4"],
      max: [4, "Year must be between 1 and 4"],
    },
    gpa: {
      type: Number,
      required: [true, "GPA is required"],
      min: [0, "GPA cannot be negative"],
      max: [10, "GPA cannot exceed 10.0"],
    },
    enrollmentStatus: {
      type: String,
      enum: ["Active", "Graduated", "Suspended"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
studentSchema.index({ rollNumber: 1 }, { unique: true });
studentSchema.index({ department: 1 });

const Student = mongoose.model("Student", studentSchema);

// ---------------- ROUTES ---------------- //

// 1. Health & DB Status Check
app.get("/api/health", (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    status: "success",
    message: "Student Management System API is active",
    database: isConnected ? "Connected" : "Disconnected",
    timestamp: new Date().toISOString(),
  });
});

// 2. Get All Students (Optional filter by department)
app.get("/api/students", async (req, res) => {
  try {
    const filter = {};
    if (req.query.department) {
      filter.department = req.query.department;
    }
    const students = await Student.find(filter).sort({ rollNumber: 1 });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch students", error: error.message });
  }
});

// 3. Get Single Student by ID
app.get("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student record not found" });
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(400).json({ message: "Invalid student ID format", error: error.message });
  }
});

// 4. Create New Student
app.post("/api/students", async (req, res) => {
  try {
    const newStudent = await Student.create(req.body);
    res.status(201).json(newStudent);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "Record";
      return res.status(400).json({
        message: `A student with this ${field} already exists.`,
      });
    }
    res.status(400).json({ message: error.message });
  }
});

// 5. Update Existing Student
app.put("/api/students/:id", async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 6. Delete Student
app.delete("/api/students/:id", async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    if (!deletedStudent) {
      return res.status(404).json({ message: "Student record not found" });
    }
    res.status(200).json({ message: "Student removed successfully", id: req.params.id });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 7. Department Summary Aggregation
app.get("/api/reports/department-summary", async (req, res) => {
  try {
    const summary = await Student.aggregate([
      {
        $group: {
          _id: "$department",
          totalStudents: { $sum: 1 },
          averageGpa: { $avg: "$gpa" },
          highestGpa: { $max: "$gpa" },
        },
      },
      {
        $project: {
          _id: 0,
          department: "$_id",
          totalStudents: 1,
          averageGpa: { $round: ["$averageGpa", 2] },
          highestGpa: 1,
        },
      },
      {
        $sort: { totalStudents: -1 },
      },
    ]);
    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: "Failed to generate report", error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(` Server is running on port ${PORT}`);
});
