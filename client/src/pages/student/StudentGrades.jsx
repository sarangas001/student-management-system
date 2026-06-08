import { Download } from 'lucide-react'

const grades = [
  { code: 'CS301', name: 'Software Engineering', midExam: 78, finalExam: 85, assignment: 90, total: 84.3, grade: 'A', gradeClass: 'badge-green' },
  { code: 'CS401', name: 'Data Structures',      midExam: 72, finalExam: 70, assignment: 80, total: 74,   grade: 'B+', gradeClass: 'badge-blue' },
  { code: 'MA201', name: 'Mathematics II',        midExam: 58, finalExam: null, assignment: 65, total: 61.5, grade: 'C+', gradeClass: 'badge-amber' },
  { code: 'EN102', name: 'Technical English',     midExam: 88, finalExam: 82, assignment: 95, total: 88.3, grade: 'A',  gradeClass: 'badge-green' },
]

const barColors = ['#1a5faa', '#2e7d32', '#e6a800', '#1a5faa']

const StudentGrades = () => {
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
            {grades.map((g) => (
              <tr key={g.code}>
                <td>{g.code} — {g.name}</td>
                <td>{g.midExam}</td>
                <td>{g.finalExam ?? '—'}</td>
                <td>{g.assignment}</td>
                <td>{g.total}</td>
                <td><span className={`badge ${g.gradeClass}`}>{g.grade}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Performance Overview */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Performance Overview</div>
        </div>
        {grades.map((g, i) => (
          <div className="grade-bar-wrap" key={g.code}>
            <div className="grade-bar-label">
              <span>{g.code} — {g.name}</span>
              <span style={{ color: barColors[i], fontWeight: 600 }}>
                {g.grade} ({g.total}%)
              </span>
            </div>
            <div className="grade-bar-bg">
              <div
                className="grade-bar-fill"
                style={{ width: `${g.total}%`, background: barColors[i] }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StudentGrades