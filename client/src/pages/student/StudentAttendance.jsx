
import React, { useState, useEffect } from "react";
import { useAppContext } from "../../context/useAppContext";
import axios from "axios";
import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

const StudentAttendance = () => {
  const { backendUrl } = useAppContext();
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [detailedRecords, setDetailedRecords] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${backendUrl}/api/student/attendance/summary`, { withCredentials: true });
        if (data.success) {
          setAttendanceData(data.summary);
        } else {
          setError(data.message || "Failed to load attendance summary");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error loading attendance data");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [backendUrl]);

  const handleRowClick = async (courseId) => {
    if (selectedCourse === courseId) {
      setSelectedCourse(null);
      setDetailedRecords([]);
      return;
    }

    setSelectedCourse(courseId);
    setLoadingDetails(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/student/attendance/details?courseId=${courseId}`, { withCredentials: true });
      if (data.success) {
        setDetailedRecords(data.details);
      }
    } catch (err) {
      console.error("Error fetching detailed attendance:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const getBadgeClass = (percentage) => {
    if (percentage >= 90) return "attendance-badge green";
    if (percentage >= 75) return "attendance-badge light-green";
    return "attendance-badge yellow";
  };

  const atRiskCourses = attendanceData.filter((item) => item.percentage < 75);

  if (loading) {
    return (
      <div className="attendance-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "36px",
            height: "36px",
            border: "3px solid var(--border)",
            borderTopColor: "var(--primary)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }} />
          <span style={{ color: "var(--text3)", fontSize: "14px" }}>Loading attendance records...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="attendance-container">
        <div className="alert alert-red" style={{ display: "flex", alignItems: "center", gap: "10px", margin: "20px 0" }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="attendance-container">
      <div className="attendance-card">
        <h3 className="attendance-title">My Attendance Record</h3>
        
        {attendanceData.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text3)" }}>
            No courses found or attendance records marked yet.
          </div>
        ) : (
          <>
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>COURSE</th>
                  <th>TOTAL CLASSES</th>
                  <th>PRESENT</th>
                  <th>ABSENT</th>
                  <th>LATE</th>
                  <th>ATTENDANCE %</th>
                  <th style={{ width: "40px" }}></th>
                </tr>
              </thead>

              <tbody>
                {attendanceData.map((item, index) => (
                  <React.Fragment key={item.courseId || index}>
                    <tr 
                      onClick={() => handleRowClick(item.courseId)} 
                      style={{ cursor: "pointer", transition: "background 0.2s" }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--surface2)"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ""}
                    >
                      <td>
                        <strong>{item.courseCode}</strong> – {item.courseName}
                      </td>
                      <td>{item.total}</td>
                      <td>{item.present}</td>
                      <td>{item.absent}</td>
                      <td>{item.late}</td>
                      <td>
                        <span className={getBadgeClass(item.percentage)}>
                          {item.percentage}%
                        </span>
                      </td>
                      <td style={{ textAlign: "center", color: "var(--text3)" }}>
                        {selectedCourse === item.courseId ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </td>
                    </tr>
                    {selectedCourse === item.courseId && (
                      <tr>
                        <td colSpan="7" style={{ backgroundColor: "var(--surface2)", padding: "20px", borderBottom: "1px solid var(--border)" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "var(--text)" }}>
                              Detailed Sessions for {item.courseCode}
                            </h4>
                            {loadingDetails ? (
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text3)", fontSize: "13px" }}>
                                <div style={{
                                  width: "14px",
                                  height: "14px",
                                  border: "2px solid var(--border)",
                                  borderTopColor: "var(--primary)",
                                  borderRadius: "50%",
                                  animation: "spin 1s linear infinite"
                                }} />
                                Loading detailed records...
                              </div>
                            ) : detailedRecords.length === 0 ? (
                              <div style={{ color: "var(--text3)", fontSize: "13px" }}>No sessions found.</div>
                            ) : (
                              <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                                gap: "10px"
                              }}>
                                {detailedRecords.map((rec) => (
                                  <div 
                                    key={rec.id} 
                                    style={{
                                      backgroundColor: "var(--surface)",
                                      border: "1px solid var(--border)",
                                      borderRadius: "6px",
                                      padding: "10px 12px",
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center"
                                    }}
                                  >
                                    <span style={{ fontSize: "13px", fontWeight: "500", color: "var(--text2)" }}>
                                      {new Date(rec.date).toLocaleDateString(undefined, {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric"
                                      })}
                                    </span>
                                    <span style={{
                                      display: "inline-block",
                                      padding: "2px 8px",
                                      borderRadius: "999px",
                                      fontSize: "11px",
                                      fontWeight: "600",
                                      backgroundColor: 
                                        rec.status === "Present" ? "#dff6dd" : 
                                        rec.status === "Late" ? "#fff3cd" : 
                                        rec.status === "Absent" ? "#fde8e8" : "#e8f5e9",
                                      color: 
                                        rec.status === "Present" ? "#2e7d32" : 
                                        rec.status === "Late" ? "#856404" : 
                                        rec.status === "Absent" ? "#c81e1e" : "#388e3c"
                                    }}>
                                      {rec.status}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>

            {atRiskCourses.length > 0 && (
              <div className="warning-box">
                ⚠️ Your attendance in{" "}
                {atRiskCourses.map((c, i) => (
                  <span key={c.courseId}>
                    <strong>
                      {c.courseCode} – {c.courseName}
                    </strong>{" "}
                    ({c.percentage}%)
                    {i < atRiskCourses.length - 1 ? ", " : ""}
                  </span>
                ))} is below the required 75%. Please attend regularly to avoid academic penalty.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StudentAttendance;