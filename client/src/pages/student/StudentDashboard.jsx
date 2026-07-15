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
  GraduationCap,
  PlusCircle,
  X,
  CheckCircle
} from "lucide-react";
import axios from "axios";
import { useAppContext } from "../../context/useAppContext";
import { toast } from "react-toastify";

const StudentDashboard = () => {
  const { backendUrl } = useAppContext();

  const [studentInfo, setStudentInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Enroll Course Modal State ──
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

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

  useEffect(() => {
    (async () => {
      await fetchAll();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendUrl]);

  // ── Open modal & load available courses ──
  const openEnrollModal = async () => {
    setSelectedCourseId("");
    setShowEnrollModal(true);
    setLoadingCourses(true);
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/student/dashboard/available-courses`,
        { withCredentials: true }
      );
      if (data.success) {
        setAvailableCourses(data.data);
      }
    } catch (err) {
      console.error("Error loading available courses:", err);
      toast.error("Failed to load available courses");
    } finally {
      setLoadingCourses(false);
    }
  };

  // ── Enroll Course Handler ──
  const handleEnrollCourse = async () => {
    if (!selectedCourseId) {
      toast.error("Please select a course to enroll");
      return;
    }
    try {
      setEnrolling(true);
      const { data } = await axios.post(
        `${backendUrl}/api/student/dashboard/enroll-course`,
        { courseId: selectedCourseId },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success(data.message || "Enrolled successfully!");
        setShowEnrollModal(false);
        await fetchAll(); // refresh list & stats
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to enroll in course");
    } finally {
      setEnrolling(false);
    }
  };

  const selectedCourseDetails = availableCourses.find((c) => c._id === selectedCourseId);

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

          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
            <button
              className="btn btn-primary cursor-pointer"
              onClick={openEnrollModal}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <PlusCircle size={16} />
              Enroll in Course
            </button>
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

      {/* ── Enroll Course Modal ── */}
      {showEnrollModal && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div className="card" style={{ width: "100%", maxWidth: "520px", margin: "20px", position: "relative" }}>

            {/* Modal Header */}
            <div className="card-header">
              <span className="card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <PlusCircle size={18} />
                Enroll in a New Course
              </span>
              <button
                className="btn btn-sm cursor-pointer"
                style={{ border: "none", background: "transparent" }}
                onClick={() => setShowEnrollModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Course Selector */}
            <div className="form-row" style={{ marginTop: "10px" }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Select Available Course</label>
                {loadingCourses ? (
                  <p style={{ color: "var(--text3)", fontSize: "14px" }}>Loading courses…</p>
                ) : availableCourses.length === 0 ? (
                  <p style={{ color: "var(--text3)", fontSize: "14px" }}>
                    No available courses for your department/status at this time.
                  </p>
                ) : (
                  <select
                    className="cursor-pointer"
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                  >
                    <option value="">— Select a course —</option>
                    {availableCourses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.code} — {c.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Selected Course Details */}
            {selectedCourseDetails && (
              <div style={{
                marginTop: "16px",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                backgroundColor: "var(--surface2)",
                fontSize: "13px",
                display: "flex",
                flexDirection: "column",
                gap: "6px"
              }}>
                <h4 style={{ margin: 0, fontWeight: "600", fontSize: "14px", color: "var(--text)" }}>Course Details</h4>
                <div><strong>Code:</strong> {selectedCourseDetails.code}</div>
                <div><strong>Name:</strong> {selectedCourseDetails.name}</div>
                <div><strong>Credits:</strong> {selectedCourseDetails.credits} Credits</div>
                <div><strong>Department:</strong> {selectedCourseDetails.department}</div>
                <div><strong>Instructor:</strong> {selectedCourseDetails.teacher ? `${selectedCourseDetails.teacher.firstName} ${selectedCourseDetails.teacher.lastName}` : "Unassigned"}</div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "8px", marginTop: "20px" }}>
              <button
                className="btn btn-primary cursor-pointer"
                onClick={handleEnrollCourse}
                disabled={enrolling || loadingCourses || !selectedCourseId}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <CheckCircle size={16} />
                {enrolling ? "Enrolling…" : "Confirm Enrollment"}
              </button>
              <button
                className="btn cursor-pointer"
                onClick={() => setShowEnrollModal(false)}
                disabled={enrolling}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentDashboard;