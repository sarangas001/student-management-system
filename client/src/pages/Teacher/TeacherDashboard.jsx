import { useState, useEffect } from "react";
import {
  IconUsers,
  IconBook,
  IconCalendarEvent,
  IconFileAlert,
  IconAlertTriangle,
  IconBookUpload,
  IconX,
  IconCheck,
} from "@tabler/icons-react";
import axios from "axios";
import { useAppContext } from "../../context/useAppContext";
import { toast } from "react-toastify";

const dotColors = ["#1a5faa", "#2e7d32", "#e6a800", "#c81e1e"];

function TeacherDashboard() {
  const { backendUrl, user } = useAppContext();
  const [stats, setStats] = useState(null);
  const [todayClasses, setTodayClasses] = useState([]);
  const [attendanceAlerts, setAttendanceAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Register-to-Course modal state ────────────────────────────────────────
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [registering, setRegistering] = useState(false);

  const fetchDashboard = async () => {
    if (!user || !user.teacherId) return;
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${backendUrl}/api/teacher/dashboard/${user.teacherId}/stats`,
        { withCredentials: true }
      );
      setStats(data.stats);
      setTodayClasses(data.todayClasses || []);
      setAttendanceAlerts(data.attendanceAlerts || []);
    } catch (err) {
      console.error("Error fetching teacher dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchDashboard();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendUrl, user]);


  // ── Open modal: fetch unassigned courses ──────────────────────────────────
  const openRegisterModal = async () => {
    setSelectedCourseId('');
    setShowRegisterModal(true);
    setLoadingCourses(true);
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/teacher/dashboard/available-courses`,
        { withCredentials: true }
      );
      if (data.success) setAvailableCourses(data.data);
    } catch (err) {
      console.error("Error fetching available courses:", err);
      toast.error("Failed to load available courses");
    } finally {
      setLoadingCourses(false);
    }
  };

  // ── Submit registration ───────────────────────────────────────────────────
  const handleRegisterCourse = async () => {
    if (!selectedCourseId) {
      toast.error("Please select a course");
      return;
    }
    try {
      setRegistering(true);
      const { data } = await axios.post(
        `${backendUrl}/api/teacher/dashboard/register-course`,
        { courseId: selectedCourseId },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success(data.message || "Registered to course successfully!");
        setShowRegisterModal(false);
        fetchDashboard(); // refresh stats
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to register to course");
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="page active" id="teacher-dashboard">

      {/* ── Page header row with Register button ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button
          className="btn btn-primary cursor-pointer"
          onClick={openRegisterModal}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <IconBookUpload size={16} />
          Register to Course
        </button>
      </div>

      <div className="stat-row">

        <div className="stat-card">
          <div className="stat-icon si-blue">
            <IconUsers size={20} />
          </div>
          <div className="stat-label">My Students</div>
          <div className="stat-val">{loading ? '—' : stats?.myStudents ?? 0}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon si-green">
            <IconBook size={20} />
          </div>
          <div className="stat-label">My Courses</div>
          <div className="stat-val">{loading ? '—' : stats?.myCourses ?? 0}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon si-amber">
            <IconCalendarEvent size={20} />
          </div>
          <div className="stat-label">Today's Classes</div>
          <div className="stat-val">{loading ? '—' : stats?.todayClasses ?? 0}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon si-red">
            <IconFileAlert size={20} />
          </div>
          <div className="stat-label">Pending Grades</div>
          <div className="stat-val">{loading ? '—' : stats?.pendingGrades ?? 0}</div>
        </div>

      </div>

      <div className="two-col">

        <div className="card">
          <div className="card-header">
            <span className="card-title">Today's Schedule</span>
          </div>

          {loading && (
            <p style={{ padding: "16px", color: "var(--text2)" }}>Loading schedule…</p>
          )}

          {!loading && todayClasses.length === 0 && (
            <p style={{ padding: "16px", color: "var(--text2)" }}>No classes scheduled for today.</p>
          )}

          {!loading && todayClasses.map((cls, idx) => (
            <div className="sched-row" key={cls.id}>
              <div className="sched-time">—</div>
              <div
                className="sched-dot"
                style={{ background: dotColors[idx % dotColors.length] }}
              ></div>

              <div>
                <div className="sched-subj">
                  {cls.code} — {cls.name}
                </div>
                <div className="sched-room">
                  {cls.studentCount} students
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">
              Attendance Alerts
            </span>
          </div>

          {loading && (
            <p style={{ padding: "16px", color: "var(--text2)" }}>Loading alerts…</p>
          )}

          {!loading && attendanceAlerts.length === 0 && (
            <p style={{ padding: "16px", color: "var(--text2)" }}>No attendance alerts. All students are on track.</p>
          )}

          {!loading && attendanceAlerts.map((alert, idx) => (
            <div className="alert alert-amber" key={idx}>
              <IconAlertTriangle
                size={16}
                style={{ marginRight: "8px" }}
              />
              {alert.studentId} — {alert.studentName} attendance is at {alert.percentage}% in {alert.courseCode} — below required 75%.
            </div>
          ))}
        </div>

      </div>

      {/* ── Register to Course Modal ── */}
      {showRegisterModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', margin: '20px', position: 'relative' }}>

            {/* Modal header */}
            <div className="card-header">
              <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconBookUpload size={18} />
                Register to a Course
              </span>
              <button
                className="btn btn-sm cursor-pointer"
                style={{ border: 'none', background: 'transparent' }}
                onClick={() => setShowRegisterModal(false)}
              >
                <IconX size={18} />
              </button>
            </div>

            {/* Pre-filled teacher info */}
            <div className="form-row">
              <div className="form-group">
                <label>Teacher Name</label>
                <input
                  type="text"
                  value={user ? `${user.firstName} ${user.lastName}` : '—'}
                  readOnly
                  style={{ background: 'var(--bg2, #f4f6f8)', cursor: 'not-allowed', opacity: 0.75 }}
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  value={user?.department || '—'}
                  readOnly
                  style={{ background: 'var(--bg2, #f4f6f8)', cursor: 'not-allowed', opacity: 0.75 }}
                />
              </div>
            </div>

            {/* Course selector */}
            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Select Available Course</label>
                {loadingCourses ? (
                  <p style={{ color: 'var(--text2)', fontSize: '14px' }}>Loading courses…</p>
                ) : availableCourses.length === 0 ? (
                  <p style={{ color: 'var(--text2)', fontSize: '14px' }}>
                    No unassigned courses available at this time.
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
                        {c.code} — {c.name} ({c.credits} credits, {c.department})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button
                className="btn btn-primary cursor-pointer"
                onClick={handleRegisterCourse}
                disabled={registering || loadingCourses || availableCourses.length === 0}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <IconCheck size={16} />
                {registering ? 'Registering…' : 'Register'}
              </button>
              <button
                className="btn cursor-pointer"
                onClick={() => setShowRegisterModal(false)}
                disabled={registering}
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherDashboard;


