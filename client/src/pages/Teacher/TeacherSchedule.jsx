
import React from "react";

const TeacherSchedule = () => {
  return (
    <div className="page active" id="teacher-schedule">
      <div className="card">
        <div className="card-header">
          <span className="card-title">Weekly Timetable</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>DAY</th>
              <th>TIME</th>
              <th>COURSE</th>
              <th>ROOM</th>
              <th>STUDENTS</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Monday</td>
              <td>08:00 – 10:00</td>
              <td>CS301 — Software Engineering</td>
              <td>A201</td>
              <td>64</td>
            </tr>

            <tr>
              <td>Monday</td>
              <td>10:00 – 12:00</td>
              <td>CS401 — Data Structures</td>
              <td>B105</td>
              <td>58</td>
            </tr>

            <tr>
              <td>Wednesday</td>
              <td>08:00 – 10:00</td>
              <td>CS301 — Software Engineering</td>
              <td>A201</td>
              <td>64</td>
            </tr>

            <tr>
              <td>Wednesday</td>
              <td>14:00 – 16:00</td>
              <td>MA201 — Mathematics II</td>
              <td>C302</td>
              <td>72</td>
            </tr>

            <tr>
              <td>Thursday</td>
              <td>14:00 – 15:00</td>
              <td>Office Hours</td>
              <td>Staff Block</td>
              <td>—</td>
            </tr>

            <tr>
              <td>Friday</td>
              <td>10:00 – 12:00</td>
              <td>CS401 — Data Structures</td>
              <td>B105</td>
              <td>58</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherSchedule;