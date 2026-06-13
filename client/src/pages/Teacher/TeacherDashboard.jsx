import React from "react";
import {
  IconUsers,
  IconBook,
  IconCalendarEvent,
  IconFileAlert,
  IconAlertTriangle
} from "@tabler/icons-react";

function TeacherDashboard() {
  return (
    <div className="page active" id="teacher-dashboard">

      <div className="stat-row">

        <div className="stat-card">
          <div className="stat-icon si-blue">
            <IconUsers size={20} />
          </div>
          <div className="stat-label">My Students</div>
          <div className="stat-val">142</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon si-green">
            <IconBook size={20} />
          </div>
          <div className="stat-label">My Courses</div>
          <div className="stat-val">3</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon si-amber">
            <IconCalendarEvent size={20} />
          </div>
          <div className="stat-label">Today's Classes</div>
          <div className="stat-val">2</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon si-red">
            <IconFileAlert size={20} />
          </div>
          <div className="stat-label">Pending Grades</div>
          <div className="stat-val">28</div>
        </div>

      </div>

      <div className="two-col">

        <div className="card">
          <div className="card-header">
            <span className="card-title">Today's Schedule</span>
          </div>

          <div className="sched-row">
            <div className="sched-time">08:00 AM</div>
            <div
              className="sched-dot"
              style={{ background: "#1a5faa" }}
            ></div>

            <div>
              <div className="sched-subj">
                CS301 — Software Engineering
              </div>
              <div className="sched-room">
                Room A201 · 64 students
              </div>
            </div>
          </div>

          <div className="sched-row">
            <div className="sched-time">10:00 AM</div>
            <div
              className="sched-dot"
              style={{ background: "#2e7d32" }}
            ></div>

            <div>
              <div className="sched-subj">
                CS401 — Data Structures
              </div>
              <div className="sched-room">
                Room B105 · 58 students
              </div>
            </div>
          </div>

          <div className="sched-row">
            <div className="sched-time">02:00 PM</div>
            <div
              className="sched-dot"
              style={{ background: "#9aa0b4" }}
            ></div>

            <div>
              <div
                className="sched-subj"
                style={{ color: "#9aa0b4" }}
              >
                Office Hours
              </div>

              <div className="sched-room">
                Staff Block — Room 3
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">
              Attendance Alerts
            </span>
          </div>

          <div className="alert alert-amber">
            <IconAlertTriangle
              size={16}
              style={{ marginRight: "8px" }}
            />
            FC222016 — Ranasinghe has missed 4 consecutive
            classes in CS301.
          </div>

          <div className="alert alert-amber">
            <IconAlertTriangle
              size={16}
              style={{ marginRight: "8px" }}
            />
            FC222022 — Samarakoon attendance is at 65% —
            below required 75%.
          </div>
        </div>

      </div>
    </div>
  );
}

export default TeacherDashboard;
