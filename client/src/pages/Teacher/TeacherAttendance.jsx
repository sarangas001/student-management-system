import { useState } from 'react'

const COURSES = [
  { id: 'CS301', label: 'CS301 — Software Engineering' },
  { id: 'CS302', label: 'CS302 — Database Management' },
  { id: 'CS303', label: 'CS303 — Operating Systems' },
]

const INITIAL_STUDENTS = [
  { id: 'FC222038', name: 'N.G.N.S. Niralgama' },
  { id: 'FC222039', name: 'G.A.L.H. Seneviratne' },
  { id: 'FC222015', name: 'K.G.A.K. Sathsarani' },
  { id: 'FC222016', name: 'R.D.R.P. Ranasinghe' },
  { id: 'FC222022', name: 'M.A. Samarakoon' },
]

function getTodayDate() {
  const today = new Date()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  return `${today.getFullYear()}-${mm}-${dd}`
}

const TeacherAttendance = () => {
  const [selectedCourse, setSelectedCourse] = useState(COURSES[0].id)
  const [date, setDate] = useState(getTodayDate())
  const [attendance, setAttendance] = useState(() => {
    const initial = {}
    INITIAL_STUDENTS.forEach((s) => { initial[s.id] = 'present' })
    return initial
  })
  const [submitted, setSubmitted] = useState(false)

  function handleAttendanceChange(studentId, status) {
    setAttendance((prev) => ({ ...prev, [studentId]: status }))
    setSubmitted(false)
  }

  function handleReset() {
    const reset = {}
    INITIAL_STUDENTS.forEach((s) => { reset[s.id] = 'present' })
    setAttendance(reset)
    setSubmitted(false)
  }

  function handleSubmit() {
    console.log('Submitting:', { course: selectedCourse, date, attendance })
    setSubmitted(true)
  }

  return (
    <div style={{ backgroundColor: '#f0f4f8', minHeight: '100vh', padding: '32px' }}>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', width: '100%' }}>

        {/* Page Title */}
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '24px' }}>
          Mark Attendance
        </h2>

        {/* --- Controls Row: Course + Date --- */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', alignItems: 'flex-start', width: '100%', marginBottom: '24px' }}>

          {/* Course dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '0 0 58%' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }} htmlFor="course-select">
              Select Course
            </label>
            <select
              id="course-select"
              value={selectedCourse}
              onChange={(e) => { setSelectedCourse(e.target.value); setSubmitted(false) }}
              style={{
                width: '100%',
                padding: '9px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#111827',
                backgroundColor: '#ffffff',
                outline: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              {COURSES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Date input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '0 0 40%' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }} htmlFor="date-input">
              Date
            </label>
            <input
              id="date-input"
              type="date"
              value={date}
              onChange={(e) => { setDate(e.target.value); setSubmitted(false) }}
              style={{
                width: '100%',
                padding: '9px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#111827',
                backgroundColor: '#ffffff',
                outline: 'none',
                fontFamily: 'inherit',
                cursor: 'pointer'
              }}
            />
          </div>

        </div>{/* end controls row */}

        {/* --- Attendance Table --- */}
        <div className="table-wrapper">
          <table className="attendance-table">
            <thead>
              <tr>
                <th className="col-id">Student ID</th>
                <th className="col-name">Name</th>
                <th className="col-status">Present</th>
                <th className="col-status">Absent</th>
                <th className="col-status">Late</th>
              </tr>
            </thead>
            <tbody>
              {INITIAL_STUDENTS.map((student) => (
                <tr key={student.id} className="student-row">
                  <td className="col-id student-id">{student.id}</td>
                  <td className="col-name student-name">{student.name}</td>
                  {['present', 'absent', 'late'].map((status) => (
                    <td key={status} className="col-status">
                      <input
                        type="radio"
                        name={`attendance-${student.id}`}
                        value={status}
                        checked={attendance[student.id] === status}
                        onChange={() => handleAttendanceChange(student.id, status)}
                        className="radio-input"
                        aria-label={`Mark ${student.name} ${status}`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>{/* end table-wrapper */}

        {/* --- Success Message --- */}
        {submitted && (
          <div className="success-message">
            ✅ Attendance submitted for <strong>{COURSES.find((c) => c.id === selectedCourse)?.label}</strong> on <strong>{date}</strong>.
          </div>
        )}

        {/* --- Buttons --- */}
        <div className="actions-row" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center', marginTop: '24px' }}>
          <button className="btn btn-primary" onClick={handleSubmit}>✔ Submit Attendance</button>
          <button className="btn btn-secondary" onClick={handleReset}>↺ Reset</button>
        </div>

      </div>{/* end white card */}
    </div>
  )
}

export default TeacherAttendance