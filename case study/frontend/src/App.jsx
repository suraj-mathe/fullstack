import { useState, useEffect } from "react";
import "./style.css";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "") + "/api";

const defaultFormData = {
  rollNumber: "",
  name: "",
  email: "",
  department: "Computer Science",
  year: 1,
  gpa: "",
  enrollmentStatus: "Active",
};

export default function App() {
  const [students, setStudents] = useState([]);
  const [reports, setReports] = useState([]);
  const [formData, setFormData] = useState(defaultFormData);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [alert, setAlert] = useState({ show: false, message: "", type: "info" });
  const [loading, setLoading] = useState(false);

  // Show temporary toast message
  const showAlert = (message, type = "success") => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "info" }), 4000);
  };

  // Fetch all students and department summary
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [studentsRes, reportRes] = await Promise.all([
        fetch(`${API_BASE}/students`),
        fetch(`${API_BASE}/reports/department-summary`),
      ]);

      if (studentsRes.ok) {
        const data = await studentsRes.json();
        setStudents(data);
      } else {
        throw new Error("Failed to load students from server");
      }

      if (reportRes.ok) {
        const reportData = await reportRes.json();
        setReports(reportData);
      }
    } catch (err) {
      showAlert(err.message || "Could not connect to API server", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Handle Form Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Form Submit: Add or Update
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic GPA validation
    const gpaNum = parseFloat(formData.gpa);
    if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 10) {
      return showAlert("Please enter a valid GPA between 0.0 and 10.0", "error");
    }

    const payload = {
      ...formData,
      year: Number(formData.year),
      gpa: gpaNum,
    };

    try {
      let res;
      if (editingId) {
        // Update student
        res = await fetch(`${API_BASE}/students/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new student
        res = await fetch(`${API_BASE}/students`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Operation failed");
      }

      showAlert(editingId ? "Student updated successfully!" : "New student registered!", "success");
      setFormData(defaultFormData);
      setEditingId(null);
      fetchAllData();
    } catch (err) {
      showAlert(err.message, "error");
    }
  };

  // Populate form for editing
  const handleEdit = (student) => {
    setEditingId(student._id);
    setFormData({
      rollNumber: student.rollNumber,
      name: student.name,
      email: student.email,
      department: student.department,
      year: student.year,
      gpa: student.gpa,
      enrollmentStatus: student.enrollmentStatus,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Cancel edit mode
  const cancelEdit = () => {
    setEditingId(null);
    setFormData(defaultFormData);
  };

  // Delete student
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      const res = await fetch(`${API_BASE}/students/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to delete student");

      showAlert("Student record deleted successfully", "success");
      if (editingId === id) cancelEdit();
      fetchAllData();
    } catch (err) {
      showAlert(err.message, "error");
    }
  };

  // Filter students based on search query and department
  const filteredStudents = students.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === "All" || item.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  // Calculate quick stats
  const totalStudents = students.length;
  const activeCount = students.filter((s) => s.enrollmentStatus === "Active").length;
  const overallAvgGpa =
    totalStudents > 0
      ? (students.reduce((sum, s) => sum + (s.gpa || 0), 0) / totalStudents).toFixed(2)
      : "0.00";

  return (
    <div className="container">
      {/* Header */}
      <header className="page-header">
        <div className="header-content">
          <h1>Student Management Portal</h1>
          <p className="subtitle">
            MongoDB Atlas &amp; Express REST API Case Study System
          </p>
        </div>
      </header>

      {/* Alert Notification */}
      {alert.show && (
        <div className={`alert-box alert-${alert.type}`}>
          <span>{alert.message}</span>
        </div>
      )}

      {/* Metrics Section */}
      <section className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Total Registered</div>
          <div className="stat-value">{totalStudents}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Students</div>
          <div className="stat-value active-val">{activeCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Campus Average GPA</div>
          <div className="stat-value">{overallAvgGpa}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Departments</div>
          <div className="stat-value">{reports.length}</div>
        </div>
      </section>

      {/* Department Analytics Aggregation Section */}
      {reports.length > 0 && (
        <section className="card report-section">
          <h2>Department Statistics (MongoDB Aggregation)</h2>
          <div className="dept-grid">
            {reports.map((dept) => (
              <div key={dept.department} className="dept-card">
                <h3>{dept.department}</h3>
                <div className="dept-metrics">
                  <div>
                    <span>Students:</span> <strong>{dept.totalStudents}</strong>
                  </div>
                  <div>
                    <span>Avg GPA:</span> <strong>{dept.averageGpa}</strong>
                  </div>
                  <div>
                    <span>Top GPA:</span> <strong>{dept.highestGpa}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Registration & Edit Form */}
      <section className="card form-section">
        <h2>{editingId ? "Update Student Information" : "Register New Student"}</h2>
        <form onSubmit={handleSubmit} className="student-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Roll Number *</label>
              <input
                type="text"
                name="rollNumber"
                required
                placeholder="e.g. 23CM401"
                value={formData.rollNumber}
                onChange={handleInputChange}
                disabled={Boolean(editingId)}
              />
            </div>

            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                required
                placeholder="Student full name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                required
                placeholder="name@college.edu"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Department *</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics">Electronics</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
              </select>
            </div>

            <div className="form-group">
              <label>Academic Year (1 - 4) *</label>
              <input
                type="number"
                name="year"
                min="1"
                max="4"
                required
                value={formData.year}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>GPA (0.00 - 10.00) *</label>
              <input
                type="number"
                name="gpa"
                step="0.01"
                min="0"
                max="10"
                required
                placeholder="e.g. 8.75"
                value={formData.gpa}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Enrollment Status</label>
              <select
                name="enrollmentStatus"
                value={formData.enrollmentStatus}
                onChange={handleInputChange}
              >
                <option value="Active">Active</option>
                <option value="Graduated">Graduated</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? "Save Changes" : "Add Student"}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="btn btn-secondary">
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Student List & Directory */}
      <section className="card list-section">
        <div className="list-header">
          <h2>Student Directory ({filteredStudents.length})</h2>

          <div className="filter-controls">
            <input
              type="text"
              placeholder="Search by name, roll, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="dept-select"
            >
              <option value="All">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics">Electronics</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="loading-text">Loading student records...</p>
        ) : filteredStudents.length === 0 ? (
          <p className="empty-text">No student records found matching your filters.</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Year</th>
                  <th>GPA</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <span className="badge-roll">{s.rollNumber}</span>
                    </td>
                    <td className="font-semibold">{s.name}</td>
                    <td>{s.email}</td>
                    <td>{s.department}</td>
                    <td>Year {s.year}</td>
                    <td>
                      <strong>{Number(s.gpa).toFixed(2)}</strong>
                    </td>
                    <td>
                      <span className={`status-tag status-${s.enrollmentStatus.toLowerCase()}`}>
                        {s.enrollmentStatus}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEdit(s)}
                          className="btn-sm btn-edit"
                          title="Edit Student"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(s._id, s.name)}
                          className="btn-sm btn-delete"
                          title="Delete Student"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
