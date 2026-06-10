
import {
  BookOpen,
  CalendarCheck,
  BarChart3,
  AlertCircle,
  Megaphone,
  TriangleAlert,
} from "lucide-react";

const StudentDashboard = () => {
  return (
    <>
      {/* Stats Row */}
      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-icon si-blue">
            <BookOpen size={18} />
          </div>
          <div className="stat-label">Enrolled Courses</div>
          <div className="stat-val">5</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon si-green">
            <CalendarCheck size={18} />
          </div>
          <div className="stat-label">My Attendance</div>
          <div className="stat-val">88%</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon si-amber">
            <BarChart3 size={18} />
          </div>
          <div className="stat-label">Current GPA</div>
          <div className="stat-val">3.6</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon si-red">
            <AlertCircle size={18} />
          </div>
          <div className="stat-label">Pending Tasks</div>
          <div className="stat-val">2</div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="two-col">
        {/* Courses */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">My Enrolled Courses</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>CODE</th>
                <th>COURSE</th>
                <th>TEACHER</th>
                <th>STATUS</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>CS301</td>
                <td>Software Engineering</td>
                <td>Dr. Gunawardena</td>
                <td>
                  <span className="badge badge-green">On Track</span>
                </td>
              </tr>

              <tr>
                <td>CS401</td>
                <td>Data Structures</td>
                <td>Ms. Perera</td>
                <td>
                  <span className="badge badge-blue">On Track</span>
                </td>
              </tr>

              <tr>
                <td>MA201</td>
                <td>Mathematics II</td>
                <td>Dr. Bandara</td>
                <td>
                  <span className="badge badge-amber">At Risk</span>
                </td>
              </tr>

              <tr>
                <td>EN102</td>
                <td>Technical English</td>
                <td>Ms. Kumari</td>
                <td>
                  <span className="badge badge-green">On Track</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Announcements */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Announcements</div>
          </div>

          <div className="alert alert-blue">
            <Megaphone size={16} />
            <span>
              CS301 Mid-exam scheduled for May 24. Review chapters 4–8.
            </span>
          </div>

          <div className="alert alert-green">
            <Megaphone size={16} />
            <span>
              Assignment 2 for CS401 due May 20. Submit via GitHub repository.
            </span>
          </div>

          <div className="alert alert-amber">
            <TriangleAlert size={16} />
            <span>
              MA201 attendance is below 75%. Attend regularly to avoid
              penalty.
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;