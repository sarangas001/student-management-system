const schedule = [
  { day: 'Monday',    time: '08:00 – 10:00', course: 'CS301 — Software Engineering', room: 'A201', teacher: 'Dr. Gunawardena' },
  { day: 'Monday',    time: '14:00 – 16:00', course: 'EN102 — Technical English',     room: 'D104', teacher: 'Ms. Kumari' },
  { day: 'Tuesday',   time: '09:00 – 11:00', course: 'MA201 — Mathematics II',        room: 'C302', teacher: 'Dr. Bandara' },
  { day: 'Wednesday', time: '08:00 – 10:00', course: 'CS301 — Software Engineering', room: 'A201', teacher: 'Dr. Gunawardena' },
  { day: 'Thursday',  time: '10:00 – 12:00', course: 'CS401 — Data Structures',       room: 'B105', teacher: 'Ms. Perera' },
  { day: 'Friday',    time: '08:00 – 10:00', course: 'MA201 — Mathematics II',        room: 'C302', teacher: 'Dr. Bandara' },
]

const StudentSchedule = () => {
  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div className="card-title">My Class Timetable</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Day</th>
              <th>Time</th>
              <th>Course</th>
              <th>Room</th>
              <th>Teacher</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((item, idx) => (
              <tr key={idx}>
                <td>{item.day}</td>
                <td>{item.time}</td>
                <td>{item.course}</td>
                <td>{item.room}</td>
                <td>{item.teacher}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default StudentSchedule