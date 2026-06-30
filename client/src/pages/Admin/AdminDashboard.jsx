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

    fetchActivities();
  }, [backendUrl]);

  return (
    <div className="page active" id="admin-dashboard">
      {/* ── Stat Row ── */}
      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-icon si-blue"><Users className="w-5 h-5" /></div>
          <div className="stat-label">Total Students</div>
          <div className="stat-val">1,248</div>
          <div className="stat-delta">↑ 12 enrolled this month</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon si-green"><BookOpen className="w-5 h-5" /></div>
          <div className="stat-label">Active Courses</div>
          <div className="stat-val">34</div>
          <div className="stat-delta">↑ 3 new courses added</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon si-amber"><CalendarDays className="w-5 h-5" /></div>
          <div className="stat-label">Avg Attendance</div>
          <div className="stat-val">87%</div>
          <div className="stat-delta">↑ 2% vs last week</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon si-red"><Monitor className="w-5 h-5" /></div>
          <div className="stat-label">Teachers</div>
          <div className="stat-val">56</div>
          <div className="stat-delta" style={{ color: 'var(--green)' }}>Across 4 departments</div>
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

          <div className="grade-bar-wrap" style={{ marginTop: '16px' }}>
            <div className="grade-bar-label">
              <span>CS301 — Software Engineering</span>
              <span style={{ color: 'var(--green)', fontWeight: 600 }}>92%</span>
            </div>
            <div className="grade-bar-bg">
              <div className="grade-bar-fill" style={{ width: '92%', background: 'var(--blue)' }}></div>
            </div>
          </div>

          <div className="grade-bar-wrap" style={{ marginTop: '24px' }}>
            <div className="grade-bar-label">
              <span>MA201 — Mathematics II</span>
              <span style={{ color: 'var(--green)', fontWeight: 600 }}>85%</span>
            </div>
            <div className="grade-bar-bg">
              <div className="grade-bar-fill" style={{ width: '85%', background: 'var(--green)' }}></div>
            </div>
          </div>

          <div className="grade-bar-wrap" style={{ marginTop: '24px' }}>
            <div className="grade-bar-label">
              <span>EN102 — Technical English</span>
              <span style={{ color: '#d97706', fontWeight: 600 }}>78%</span>
            </div>
            <div className="grade-bar-bg">
              <div className="grade-bar-fill" style={{ width: '78%', background: 'var(--amber)' }}></div>
            </div>
          </div>

          <div className="grade-bar-wrap" style={{ marginTop: '24px' }}>
            <div className="grade-bar-label">
              <span>CS401 — Data Structures</span>
              <span style={{ color: 'var(--green)', fontWeight: 600 }}>90%</span>
            </div>
            <div className="grade-bar-bg">
              <div className="grade-bar-fill" style={{ width: '90%', background: 'var(--blue)' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
