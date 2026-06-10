
const attendanceData = [
  {
    course: "CS301 – Software Engineering",
    total: 20,
    present: 19,
    absent: 1,
    late: 0,
    percentage: 95,
  },
  {
    course: "CS302 – Data Structure",
    total: 20,
    present: 17,
    absent: 2,
    late: 1,
    percentage: 85,
  },
  {
    course: "MA201 – Mathematics II",
    total: 20,
    present: 14,
    absent: 5,
    late: 1,
    percentage: 70,
  },
  {
    course: "EN102 – Technical English",
    total: 20,
    present: 18,
    absent: 2,
    late: 0,
    percentage: 90,
  },
];

const StudentAttendance = () => {
  const getBadgeClass = (percentage) => {
    if (percentage >= 90) return "attendance-badge green";
    if (percentage >= 75) return "attendance-badge light-green";
    return "attendance-badge yellow";
  };

  return (
    <div className="attendance-container">
      <div className="attendance-card">
        <h3 className="attendance-title">My Attendance Record</h3>

        <table className="attendance-table">
          <thead>
            <tr>
              <th>COURSE</th>
              <th>TOTAL CLASSES</th>
              <th>PRESENT</th>
              <th>ABSENT</th>
              <th>LATE</th>
              <th>ATTENDANCE %</th>
            </tr>
          </thead>

          <tbody>
            {attendanceData.map((item, index) => (
              <tr key={index}>
                <td>{item.course}</td>
                <td>{item.total}</td>
                <td>{item.present}</td>
                <td>{item.absent}</td>
                <td>{item.late}</td>
                <td>
                  <span className={getBadgeClass(item.percentage)}>
                    {item.percentage}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="warning-box">
          ⚠️ Your attendance in MA201 – Mathematics II is at 70%, which is below the required 75%. Please attend regularly to avoid academic penalty.
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;