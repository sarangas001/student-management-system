import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAppContext } from '../../context/useAppContext'

function getTodayDate() {
  const today = new Date()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  return `${today.getFullYear()}-${mm}-${dd}`
}

const TeacherAttendance = () => {
  const { backendUrl } = useAppContext()

  const [teacherId, setTeacherId] = useState(null)
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [students, setStudents] = useState([])
  const [date, setDate] = useState(getTodayDate())
  const [attendance, setAttendance] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  // Get logged-in teacher profile
  useEffect(() => {
    axios.get(`${backendUrl}/api/auth/isLoggedIn`, { withCredentials: true })
      .then(({ data }) => {
        if (data.success && data.role === 'teacher' && data.user) {
          setTeacherId(data.user.teacherId)
        }
      })
      .catch(console.error)
  }, [backendUrl])

  // Fetch teacher's assigned courses
  useEffect(() => {
    if (!teacherId) return
    let active = true
    axios.get(`${backendUrl}/api/teacher/attendance/courses`, {
      params: { teacherId },
      withCredentials: true
    }).then(({ data }) => {
      if (active && Array.isArray(data) && data.length > 0) {
        setCourses(data)
        setSelectedCourse(data[0])
      }
    }).catch(console.error)
    return () => { active = false }
  }, [backendUrl, teacherId])

  // Fetch enrolled students when course changes
  useEffect(() => {
    if (!selectedCourse) return
    let active = true
    axios.get(`${backendUrl}/api/teacher/attendance/roster/${selectedCourse._id}`, {
      withCredentials: true
    }).then(({ data }) => {
      if (active && Array.isArray(data)) {
        setStudents(data)
        const initial = {}
        data.forEach(s => { initial[s.studentId] = 'Present' })
        setAttendance(initial)
        setSubmitted(false)
        setMessage('')
      }
    }).catch(console.error)
    return () => { active = false }
  }, [backendUrl, selectedCourse])

  const handleCourseChange = (e) => {
    const course = courses.find(c => c._id === e.target.value)
    setSelectedCourse(course || null)
    setSubmitted(false)
  }

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }))
    setSubmitted(false)
  }

  const handleReset = () => {
    const reset = {}
    students.forEach(s => { reset[s.studentId] = 'Present' })
    setAttendance(reset)
    setSubmitted(false)
    setMessage('')
  }

  const handleSubmit = () => {
    if (!selectedCourse || !teacherId) return
    setSubmitting(true)
    setMessage('')
    const attendanceData = students.map(s => ({
      studentId: s.studentId,
      status: attendance[s.studentId] || 'Present'
    }))
    axios.post(`${backendUrl}/api/teacher/attendance`, {
      courseId: selectedCourse._id,
      teacherId,
      date,
      attendanceData
    }, { withCredentials: true })
      .then(({ data }) => {
        setSubmitted(true)
        setMessage(`Attendance submitted: ${data.totalRecords} record(s) saved.`)
      })
      .catch(() => setMessage('Error submitting attendance.'))
      .finally(() => setSubmitting(false))
  }

  return (
    <div style={{ backgroundColor: '#f0f4f8', minHeight: '100vh', padding: '32px' }}>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', width: '100%' }}>

        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '24px' }}>
          Mark Attendance
        </h2>

        {/* Controls Row: Course + Date */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', alignItems: 'flex-start', width: '100%', marginBottom: '24px' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '0 0 58%' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }} htmlFor="course-select">
              Select Course
            </label>
            <select
              id="course-select"
              value={selectedCourse?._id || ''}
              onChange={handleCourseChange}
              style={{
                width: '100%', padding: '9px 12px', border: '1px solid #d1d5db',
                borderRadius: '6px', fontSize: '14px', color: '#111827',
                backgroundColor: '#ffffff', outline: 'none', cursor: 'pointer', fontFamily: 'inherit'
              }}
            >
              {courses.length === 0
                ? <option>No courses assigned</option>
                : courses.map(c => (
                    <option key={c._id} value={c._id}>{c.code} — {c.name}</option>
                  ))
              }
            </select>
          </div>

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
                width: '100%', padding: '9px 12px', border: '1px solid #d1d5db',
                borderRadius: '6px', fontSize: '14px', color: '#111827',
                backgroundColor: '#ffffff', outline: 'none', fontFamily: 'inherit', cursor: 'pointer'
              }}
            />
          </div>
        </div>

        {/* Attendance Table */}
        <div className="table-wrapper">
          {students.length === 0 ? (
            <p style={{ padding: '16px', color: '#6b7280' }}>
              {selectedCourse ? 'No students enrolled in this course.' : 'Select a course to load students.'}
            </p>
          ) : (
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
                {students.map(student => (
                  <tr key={student.studentId} className="student-row">
                    <td className="col-id student-id">{student.studentId}</td>
                    <td className="col-name student-name">{student.firstName} {student.lastName}</td>
                    {['Present', 'Absent', 'Late'].map(status => (
                      <td key={status} className="col-status">
                        <input
                          type="radio"
                          name={`attendance-${student.studentId}`}
                          value={status}
                          checked={attendance[student.studentId] === status}
                          onChange={() => handleAttendanceChange(student.studentId, status)}
                          className="radio-input"
                          aria-label={`Mark ${student.firstName} ${status}`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Feedback */}
        {(submitted || message) && (
          <div className="success-message" style={{ color: message.includes('Error') ? '#dc2626' : undefined }}>
            {message || `✅ Attendance submitted for ${selectedCourse?.code} on ${date}.`}
          </div>
        )}

        {/* Buttons */}
        <div className="actions-row" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center', marginTop: '24px' }}>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting || students.length === 0}>
            {submitting ? 'Submitting…' : '✔ Submit Attendance'}
          </button>
          <button className="btn btn-secondary" onClick={handleReset}>↺ Reset</button>
        </div>

      </div>
    </div>
  )
}

export default TeacherAttendance
