import { Download } from 'lucide-react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAppContext } from '../../context/useAppContext'

const barColors = ['#1a5faa', '#2e7d32', '#e6a800', '#c81e1e', '#7c3aed']

const ASSESSMENT_FIELD = {
  'Mid Exam': 'midExam',
  'Final Exam': 'finalExam',
  Assignment: 'assignment',
};

const gradeClassFor = (grade) => {
  if (grade === 'A' || grade === 'A-') return 'badge-green';
  if (grade === 'B+' || grade === 'B' || grade === 'B-') return 'badge-blue';
  if (grade === 'F') return 'badge-red';
  return 'badge-amber';
};

const letterGradeFor = (total) => {
  if (total >= 80) return 'A';
  if (total >= 75) return 'A-';
  if (total >= 70) return 'B+';
  if (total >= 65) return 'B';
  if (total >= 60) return 'B-';
  if (total >= 55) return 'C+';
  if (total >= 50) return 'C';
  if (total >= 45) return 'C-';
  if (total >= 40) return 'D';
  return 'F';
};

const groupGradesByCourse = (grades) => {
  const byCourse = new Map();

  grades.forEach((g) => {
    if (!g.course) return;
    const key = g.course._id;
    if (!byCourse.has(key)) {
      byCourse.set(key, {
        code: g.course.code,
        name: g.course.name,
        midExam: null,
        finalExam: null,
        assignment: null,
      });
    }
    const field = ASSESSMENT_FIELD[g.assessmentType];
    if (field) {
      byCourse.get(key)[field] = g.marks;
    }
  });

  return Array.from(byCourse.values()).map((course) => {
    const marks = [course.midExam, course.finalExam, course.assignment].filter(
      (m) => m !== null && m !== undefined
    );
    const total = marks.length > 0
      ? Math.round((marks.reduce((sum, m) => sum + m, 0) / marks.length) * 10) / 10
      : 0;
    const grade = marks.length > 0 ? letterGradeFor(total) : '—';

    return { ...course, total, grade, gradeClass: gradeClassFor(grade) };
  });
};

const StudentGrades = () => {
  const { backendUrl, user } = useAppContext();
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      if (!user || !user.studentId) return;
      try {
        setLoading(true);
        const { data } = await axios.get(
          `${backendUrl}/api/student/grades`,
          { params: { studentId: user.studentId }, withCredentials: true }
        );
        setGrades(groupGradesByCourse(Array.isArray(data) ? data : []));
      } catch (err) {
        console.error('Error fetching grades:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [backendUrl, user]);

  return (
    <div>
      {/* Grade Report Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">My Grade Report</div>
          <button className="btn btn-sm">
            <Download size={14} /> Download
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Course</th>
              <th>Mid Exam</th>
              <th>Final Exam</th>
              <th>Assignment</th>
              <th>Total</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Loading grades...</td>
              </tr>
            ) : grades.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No grades recorded yet.</td>
              </tr>
            ) : (
              grades.map((g) => (
                <tr key={g.code}>
                  <td>{g.code} — {g.name}</td>
                  <td>{g.midExam ?? '—'}</td>
                  <td>{g.finalExam ?? '—'}</td>
                  <td>{g.assignment ?? '—'}</td>
                  <td>{g.total}</td>
                  <td><span className={`badge ${g.gradeClass}`}>{g.grade}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Performance Overview */}
      {!loading && grades.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Performance Overview</div>
          </div>
          {grades.map((g, i) => (
            <div className="grade-bar-wrap" key={g.code}>
              <div className="grade-bar-label">
                <span>{g.code} — {g.name}</span>
                <span style={{ color: barColors[i % barColors.length], fontWeight: 600 }}>
                  {g.grade} ({g.total}%)
                </span>
              </div>
              <div className="grade-bar-bg">
                <div
                  className="grade-bar-fill"
                  style={{ width: `${g.total}%`, background: barColors[i % barColors.length] }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default StudentGrades
