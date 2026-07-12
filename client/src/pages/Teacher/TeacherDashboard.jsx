import { useState, useEffect } from "react";
import {
  IconUsers,
  IconBook,
  IconCalendarEvent,
  IconFileAlert,
  IconAlertTriangle
} from "@tabler/icons-react";
import axios from "axios";
import { useAppContext } from "../../context/useAppContext";

const dotColors = ["#1a5faa", "#2e7d32", "#e6a800", "#c81e1e"];

function TeacherDashboard() {
  const { backendUrl, user } = useAppContext();
  const [stats, setStats] = useState(null);
  const [todayClasses, setTodayClasses] = useState([]);
  const [attendanceAlerts, setAttendanceAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchDashboard();
  }, [backendUrl, user]);

  return (
    <div className="page active" id="teacher-dashboard">

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
    </div>
  );
}

export default TeacherDashboard;
