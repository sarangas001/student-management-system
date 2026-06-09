import { Users, BookOpen, CalendarDays, Monitor, ArrowRight } from 'lucide-react';

const AdminDashboard = () => {
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
        {/* ── Recent Enrollments ── */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Enrollments</span>
            <button className="btn btn-sm cursor-pointer">
              <ArrowRight className="w-4 h-4 mr-1" /> View all
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>STUDENT</th>
                <th>COURSE</th>
                <th>DATE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>R. Perera</td>
                <td>CS301</td>
                <td>May 15</td>
                <td><span className="badge badge-green">Enrolled</span></td>
              </tr>
              <tr>
                <td>A. Silva</td>
                <td>MA201</td>
                <td>May 14</td>
                <td><span className="badge badge-green">Enrolled</span></td>
              </tr>
              <tr>
                <td>K. Fernando</td>
                <td>EN102</td>
                <td>May 13</td>
                <td><span className="badge badge-amber">Pending</span></td>
              </tr>
              <tr>
                <td>N. Jayasena</td>
                <td>CS401</td>
                <td>May 12</td>
                <td><span className="badge badge-green">Enrolled</span></td>
              </tr>
              <tr>
                <td>S. Wickrama</td>
                <td>CS301</td>
                <td>May 11</td>
                <td><span className="badge badge-blue">Processing</span></td>
              </tr>
            </tbody>
          </table>
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