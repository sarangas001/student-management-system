

import { useState } from "react";

function AdminReports() {
  const [reportType, setReportType] = useState("Attendance Report");
  const [department, setDepartment] = useState("All Departments");

  return (
    <div className="page active">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
        }}
      >
        {/* Generate Reports */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Generate Reports</span>
          </div>

          <div className="form-group">
            <label>Report Type</label>

            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option>Attendance Report</option>
              <option>Student Performance Report</option>
              <option>Course Report</option>
              <option>Grade Report</option>
            </select>
          </div>

          <div className="form-group">
            <label>Department</label>

            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option>All Departments</option>
              <option>Software Engineering</option>
              <option>Computer Science</option>
              <option>Information Systems</option>
            </select>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
              marginTop: "15px",
            }}
          >
            <div className="form-group">
              <label>From Date</label>

              <input
                type="date"
                defaultValue="2025-01-01"
              />
            </div>

            <div className="form-group">
              <label>To Date</label>

              <input
                type="date"
                defaultValue="2025-05-17"
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "20px",
            }}
          >
            <button className="btn btn-primary">
              <i className="ti ti-file-type-pdf"></i>
              Export PDF
            </button>

            <button className="btn">
              <i className="ti ti-file-spreadsheet"></i>
              Export Excel
            </button>
          </div>
        </div>

        {/* Project Deliverables */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              Project Deliverables
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <input
                type="checkbox"
                checked
                readOnly
              />
              GitHub Source Code Repository
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <input
                type="checkbox"
                checked
                readOnly
              />
              Project Report (PDF)
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <input
                type="checkbox"
                checked
                readOnly
              />
              Dockerfile & docker-compose.yml
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <input
                type="checkbox"
                checked
                readOnly
              />
              CI/CD Pipeline Config (.yml)
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                opacity: "0.7",
              }}
            >
              <input type="checkbox" />
              Screenshots / Video Demo
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                opacity: "0.7",
              }}
            >
              <input type="checkbox" />
              Live Deployment Link (Render)
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminReports;