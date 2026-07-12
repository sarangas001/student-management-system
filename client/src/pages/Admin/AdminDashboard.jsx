import { useState, useEffect } from 'react';
import { Users, BookOpen, CalendarDays, Monitor, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useAppContext } from '../../context/useAppContext';

const typeLabels = {
  student_registered: { label: 'New Student', badgeClass: 'badge-blue' },
  attendance_marked:  { label: 'Attendance',  badgeClass: 'badge-amber' },
  grade_published:    { label: 'Grade',        badgeClass: 'badge-green' },
};

const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const AdminDashboard = () => {
  const { backendUrl } = useAppContext();
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState(null);

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [attendanceByCourse, setAttendanceByCourse] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/admin/dashboard/recent-activities`,
          { withCredentials: true }
        );
        if (data.success) {
          setActivities(data.activities);
        } else {
          setActivitiesError(data.message || 'Failed to load activities');
        }
      } catch (err) {
        setActivitiesError(err.message);
      } finally {
        setActivitiesLoading(false);
      }
    };

    const fetchStats = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/admin/dashboard/stats`,
          { withCredentials: true }
        );
        setStats(data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setStatsLoading(false);
      }
    };

    const fetchAttendanceByCourse = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/admin/dashboard/attendance-by-course`,
          { withCredentials: true }
        );
        if (data.success) {
          setAttendanceByCourse(data.data);
        }
      } catch (err) {
        console.error('Error fetching attendance by course:', err);
      } finally {
        setAttendanceLoading(false);
      }
    };

    fetchActivities();
    fetchStats();
    fetchAttendanceByCourse();
  }, [backendUrl]);

  const getBarColor = (percentage) => {
    if (percentage >= 85) return 'var(--blue)';
    if (percentage >= 75) return 'var(--green)';
    return 'var(--amber)';
  };

  return (
    <div className="page active" id="admin-dashboard">
      {/* ── Stat Row ── */}
      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-icon si-blue"><Users className="w-5 h-5" /></div>
          <div className="stat-label">Total Students</div>
          <div className="stat-val">{statsLoading ? '—' : stats?.totalStudents ?? 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon si-green"><BookOpen className="w-5 h-5" /></div>
          <div className="stat-label">Active Courses</div>
          <div className="stat-val">{statsLoading ? '—' : stats?.totalCourses ?? 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon si-amber"><CalendarDays className="w-5 h-5" /></div>
          <div className="stat-label">Avg Attendance</div>
          <div className="stat-val">{statsLoading ? '—' : `${stats?.avgAttendance ?? 0}%`}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon si-red"><Monitor className="w-5 h-5" /></div>
          <div className="stat-label">Teachers</div>
          <div className="stat-val">{statsLoading ? '—' : stats?.totalTeachers ?? 0}</div>
        </div>
      </div>

      <div className="two-col">
        {/* ── Recent Activities ── */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Activities</span>
            <button className="btn btn-sm cursor-pointer">
              <ArrowRight className="w-4 h-4 mr-1" /> View all
            </button>
          </div>

          {activitiesLoading && (
            <p style={{ padding: '16px', color: 'var(--muted)' }}>Loading activities…</p>
          )}

          {activitiesError && (
            <p style={{ padding: '16px', color: 'var(--red)' }}>{activitiesError}</p>
          )}

          {!activitiesLoading && !activitiesError && activities.length === 0 && (
            <p style={{ padding: '16px', color: 'var(--muted)' }}>No recent activities.</p>
          )}

          {!activitiesLoading && !activitiesError && activities.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>TYPE</th>
                  <th>DESCRIPTION</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity, idx) => {
                  const meta = typeLabels[activity.type] || { label: activity.type, badgeClass: 'badge-blue' };
                  return (
                    <tr key={idx}>
                      <td><span className={`badge ${meta.badgeClass}`}>{meta.label}</span></td>
                      <td>{activity.description}</td>
                      <td>{formatDate(activity.date)}</td>
                      <td>
                        {activity.status
                          ? <span className="badge badge-green">{activity.status}</span>
                          : <span className="badge badge-green">Done</span>
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Attendance by Course ── */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Attendance by Course</span>
          </div>

          {attendanceLoading && (
            <p style={{ padding: '16px', color: 'var(--muted)' }}>Loading attendance…</p>
          )}

          {!attendanceLoading && attendanceByCourse.length === 0 && (
            <p style={{ padding: '16px', color: 'var(--muted)' }}>No attendance records yet.</p>
          )}

          {!attendanceLoading && attendanceByCourse.map((item, idx) => (
            <div className="grade-bar-wrap" style={{ marginTop: idx === 0 ? '16px' : '24px' }} key={item.courseId}>
              <div className="grade-bar-label">
                <span>{item.code} — {item.name}</span>
                <span style={{ color: getBarColor(item.percentage), fontWeight: 600 }}>{item.percentage}%</span>
              </div>
              <div className="grade-bar-bg">
                <div className="grade-bar-fill" style={{ width: `${item.percentage}%`, background: getBarColor(item.percentage) }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
