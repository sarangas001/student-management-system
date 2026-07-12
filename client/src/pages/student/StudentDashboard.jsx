import { useState, useEffect } from "react";
import {
  BookOpen,
  CalendarCheck,
  BarChart3,
  AlertTriangle,
  Megaphone,
  Clock,
  MapPin,
  Calendar,
  User,
  GraduationCap
} from "lucide-react";
import axios from "axios";
import { useAppContext } from "../../context/useAppContext";

const StudentDashboard = () => {
  const { backendUrl } = useAppContext();

  const [studentInfo, setStudentInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [statsRes, upcomingRes] = await Promise.all([
          axios.get(`${backendUrl}/api/student/dashboard/stats`, { withCredentials: true }),
          axios.get(`${backendUrl}/api/student/dashboard/upcoming-classes`, { withCredentials: true }),
        ]);

        if (statsRes.data.success) {
          setStudentInfo(statsRes.data.data.student);
          setStats(statsRes.data.data.stats);
          setCourses(statsRes.data.data.courses || []);
          setAnnouncements(statsRes.data.data.announcements || []);
        }
        if (upcomingRes.data.success) {
          setUpcoming(upcomingRes.data.data || []);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [backendUrl]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px", flexDirection: "column", gap: "10px" }}>
        <div style={{ width: "36px", height: "36px", border: "3px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <span style={{ color: "var(--text3)", fontSize: "14px" }}>Loading dashboard...</span>
      </div>
    );
  }

  return (
    <>
    
      {studentInfo && (
        <div className="card" style={{ padding: "20px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap", background: "linear-gradient(135deg, var(--surface) 0%, var(--surface2) 100%)", borderRadius: "12px", border: "1px solid var(--border)" }}>
          <div style={{ width: "50px", height: "50px", borderRadius: "50%", backgroundColor: "var(--primary-soft, #ede9fe)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={24} style={{ color: "var(--primary)" }} />
          </div>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "var(--text)" }}>
              Welcome, {studentInfo.firstName} {studentInfo.lastName}!
            </h2>
            <div style={{ display: "flex", gap: "20px", marginTop: "6px", flexWrap: "wrap", fontSize: "13px", color: "var(--text3)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <strong>ID:</strong> {studentInfo.studentId}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <GraduationCap size={14} /> <strong>Department:</strong> {studentInfo.department}
              </span>
              <span>
                <strong>Year of Study:</strong> Year {studentInfo.yearOfStudy}
              </span>
            </div>
          </div>
        </div>
      )}

      
      <div className="stat-row" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "20px" }}>
        <div className="stat-card">
          <div className="stat-icon si-blue"><BookOpen size={18} /></div>
          <div className="stat-label">Enrolled Courses</div>
          <div className="stat-val">{stats?.totalCourses ?? "—"}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon si-green"><CalendarCheck size={18} /></div>
          <div className="stat-label">My Attendance</div>
          <div className="stat-val">{stats ? `${stats.attendancePercentage}%` : "—"}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon si-amber"><BarChart3 size={18} /></div>
          <div className="stat-label">Current GPA</div>
          <div className="stat-val">{stats?.gpa != null ? stats.gpa : "N/A"}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon si-red"><AlertTriangle size={18} /></div>
          <div className="stat-label">At-Risk Courses</div>
          <div className="stat-val">{stats?.atRiskCount ?? "—"}</div>
        </div>
      </div>

     
      <div className="two-col" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
        {/* Courses Table */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <div className="card-header">
            <div className="card-title">My Enrolled Courses</div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>CODE</th>
                  <th>COURSE</th>
                  <th>TEACHER</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {courses.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", color: "var(--text3)", padding: "20px" }}>
                      No courses found.
                    </td>
                  </tr>
                ) : (
                  courses.map(c => (
                    <tr key={c.courseId}>
                      <td><strong>{c.code}</strong></td>
                      <td>{c.name}</td>
                      <td>{c.teacher}</td>
                      <td>
                        <span className={`badge ${c.status === "At Risk" ? "badge-amber" : "badge-green"}`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

       
          <div className="card">
            <div className="card-header">
              <div className="card-title">Announcements</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "10px 0" }}>
              {announcements.length === 0 ? (
                <div style={{ padding: "10px 16px", color: "var(--text3)", fontSize: "14px" }}>
                  No announcements. You're all on track! 
                </div>
              ) : (
                announcements.map((a, i) => (
                  <div key={i} className={`alert ${a.type === "warning" ? "alert-amber" : "alert-blue"}`} style={{ margin: 0 }}>
                    {a.type === "warning" ? <AlertTriangle size={16} /> : <Megaphone size={16} />}
                    <span>{a.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          
          <div className="card">
            <div className="card-header">
              <div className="card-title">Upcoming Classes</div>
            </div>
            {upcoming.length === 0 ? (
              <div style={{ padding: "16px", color: "var(--text3)", fontSize: "14px" }}>
                No upcoming classes found.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "10px 0" }}>
                {upcoming.slice(0, 5).map((cls, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--surface2)" }}>
                    <div style={{ flexShrink: 0, width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "var(--primary-soft, #ede9fe)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Calendar size={18} style={{ color: "var(--primary)" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: "600", fontSize: "13px", color: "var(--text)" }}>{cls.courseCode} — {cls.courseName}</div>
                      <div style={{ display: "flex", gap: "12px", marginTop: "4px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "12px", color: "var(--text3)", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Clock size={12} /> {cls.dayLabel ?? cls.day}, {cls.time}
                        </span>
                        <span style={{ fontSize: "12px", color: "var(--text3)", display: "flex", alignItems: "center", gap: "4px" }}>
                          <MapPin size={12} /> {cls.venue}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;