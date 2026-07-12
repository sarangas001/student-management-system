import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAppContext } from '../../context/useAppContext'

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const StudentSchedule = () => {
  const { backendUrl, user } = useAppContext();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!user || !user.studentId) return;
      try {
        setLoading(true);
        const { data } = await axios.get(
          `${backendUrl}/api/student/schedule`,
          { params: { studentId: user.studentId }, withCredentials: true }
        );
        const sorted = (data.schedule || []).slice().sort(
          (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
        );
        setSchedule(sorted);
      } catch (err) {
        console.error('Error fetching schedule:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [backendUrl, user]);

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div className="card-title">My Class Timetable</div>
        </div>

        {loading && (
          <p style={{ padding: '24px', textAlign: 'center', color: 'var(--text2)' }}>Loading schedule…</p>
        )}

        {!loading && schedule.length === 0 && (
          <p style={{ padding: '24px', textAlign: 'center', color: 'var(--text2)' }}>No classes scheduled.</p>
        )}

        {!loading && schedule.length > 0 && (
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
                <tr key={item.courseId ? `${item.courseId}-${idx}` : idx}>
                  <td>{item.day}</td>
                  <td>{item.time}</td>
                  <td>{item.courseCode} — {item.courseName}</td>
                  <td>{item.room}</td>
                  <td>{item.teacher}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default StudentSchedule
