import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAppContext } from '../../context/useAppContext';

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TeacherSchedule = () => {
  const { backendUrl, user } = useAppContext();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!user || !user.teacherId) return;
      try {
        setLoading(true);
        const { data } = await axios.get(
          `${backendUrl}/api/teacher/schedule/${user.teacherId}`,
          { withCredentials: true }
        );
        // Sort by day order
        const sorted = (data.schedule || []).slice().sort(
          (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
        );
        setSchedule(sorted);
        setError(null);
      } catch (err) {
        console.error('Error fetching teacher schedule:', err);
        setError('Failed to load schedule. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [backendUrl, user]);

  return (
    <div className="page active" id="teacher-schedule">
      <div className="card">
        <div className="card-header">
          <span className="card-title">Weekly Timetable</span>
        </div>

        {loading && (
          <p style={{ padding: '24px', textAlign: 'center', color: 'var(--text2)' }}>
            Loading schedule…
          </p>
        )}

        {error && (
          <p style={{ padding: '16px', color: 'var(--red)', background: 'var(--red-bg)', margin: '12px 16px', borderRadius: '8px', border: '1px solid #fca5a5' }}>
            {error}
          </p>
        )}

        {!loading && !error && schedule.length === 0 && (
          <p style={{ padding: '24px', textAlign: 'center', color: 'var(--text2)' }}>
            No schedule found for your courses.
          </p>
        )}

        {!loading && !error && schedule.length > 0 && (
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
              {schedule.map((row, index) => (
                <tr key={row.courseId ? `${row.courseId}-${index}` : index}>
                  <td>{row.day}</td>
                  <td>{row.time}</td>
                  <td>{row.courseCode} — {row.courseName}</td>
                  <td>{row.room}</td>
                  <td>{row.studentCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TeacherSchedule;