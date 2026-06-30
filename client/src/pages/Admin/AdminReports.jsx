import { useState } from "react";
import axios from "axios";
import { useAppContext } from "../../context/useAppContext";

function AdminReports() {
  const { backendUrl } = useAppContext();

  const [reportType, setReportType] = useState("Attendance Report");
  const [department, setDepartment] = useState("All Departments");
  const [fromDate, setFromDate] = useState("2025-01-01");
  const [toDate, setToDate] = useState("2025-05-17");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleGenerate = () => {
    setLoading(true);
    setMessage("");
    setReport(null);
    axios.get(`${backendUrl}/api/admin/reports/generate`, {
      params: { reportType, department, fromDate, toDate },
      withCredentials: true
    }).then(({ data }) => {
      if (data.success) {
        setReport(data.report);
      } else {
        setMessage(data.message || "Failed to generate report.");
      }
    }).catch(() => setMessage("Error generating report."))
      .finally(() => setLoading(false));
  };

  const handleExportCSV = () => {
    axios.get(`${backendUrl}/api/admin/reports/export`, {
      params: { reportType, department, format: "csv" },
      withCredentials: true,
      responseType: "blob"
    }).then(({ data }) => {
      const url = URL.createObjectURL(new Blob([data], { type: "text/csv" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportType.replace(/ /g, "_")}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }).catch(() => setMessage("Error exporting report."));
  };

  const handleExportPDF = () => {
    if (!report) {
      handleGenerate();
    }
    setTimeout(() => window.print(), 500);
  };

  return (
    <div className="page active">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

        {/* Generate Reports */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Generate Reports</span>
          </div>

          <div className="form-group">
            <label>Report Type</label>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option>Attendance Report</option>
              <option>Student Performance Report</option>
              <option>Course Report</option>
              <option>Grade Report</option>
            </select>
          </div>

          <div className="form-group">
            <label>Department</label>
            <select value={department} onChange={(e) => setDepartment(e.target.value)}>
              <option>All Departments</option>
              <option>Software Engineering</option>
              <option>Computer Science</option>
              <option>Information Systems</option>
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginTop: "15px" }}>
            <div className="form-group">
              <label>From Date</label>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>To Date</label>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
          </div>

          {message && (
            <p style={{ color: "var(--red)", marginTop: "10px" }}>{message}</p>
          )}

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
              {loading ? "Generating…" : "Generate Report"}
            </button>
            <button className="btn" onClick={handleExportPDF}>
              <i className="ti ti-file-type-pdf"></i> Export PDF
            </button>
            <button className="btn" onClick={handleExportCSV}>
              <i className="ti ti-file-spreadsheet"></i> Export Excel
            </button>
          </div>
        </div>

        {/* Project Deliverables */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Project Deliverables</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { label: "GitHub Source Code Repository", done: true },
              { label: "Project Report (PDF)", done: true },
              { label: "Dockerfile & docker-compose.yml", done: true },
              { label: "CI/CD Pipeline Config (.yml)", done: true },
              { label: "Screenshots / Video Demo", done: false },
              { label: "Live Deployment Link (Render)", done: false },
            ].map(({ label, done }) => (
              <label key={label} style={{ display: "flex", alignItems: "center", gap: "10px", opacity: done ? 1 : 0.7 }}>
                <input type="checkbox" checked={done} readOnly />
                {label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Report Preview */}
      {report && (
        <div className="card" style={{ marginTop: "20px" }}>
          <div className="card-header">
            <span className="card-title">{report.title} — {report.department}</span>
          </div>
          {report.rows.length === 0 ? (
            <p style={{ padding: "16px", color: "var(--muted)" }}>No data found.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr>
                    {Object.keys(report.rows[0]).map(col => <th key={col}>{col.toUpperCase()}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {report.rows.map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((val, j) => <td key={j}>{val}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminReports;
