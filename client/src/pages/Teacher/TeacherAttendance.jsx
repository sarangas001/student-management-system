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
  const [messageType, setMessageType] = useState('success')
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [loadingStudents, setLoadingStudents] = useState(false)

  // Step 1: Get logged-in teacher profile
  useEffect(() => {
    axios.get(`${backendUrl}/api/auth/isLoggedIn`, { withCredentials: true })
      .then(({ data }) => {
        if (data.success && data.role === 'teacher' && data.user) {
          setTeacherId(data.user.teacherId)
        } else {
          setLoadingCourses(false)
        }
      })
      .catch(() => setLoadingCourses(false))
  }, [backendUrl])

  // Step 2: Fetch teacher's assigned courses
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
      if (active) setLoadingCourses(false)
    }).catch(() => { if (active) setLoadingCourses(false) })
    return () => { active = false }
  }, [backendUrl, teacherId])

  // Step 3: Fetch class roster when course changes
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
        setLoadingStudents(false)
      }
    }).catch(() => { if (active) setLoadingStudents(false) })
    return () => { active = false }
  }, [backendUrl, selectedCourse])

  const handleCourseChange = (e) => {
    const course = courses.find(c => c._id === e.target.value)
    setSelectedCourse(course || null)
    setSubmitted(false)
    setMessage('')
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
    if (!selectedCourse) {
      setMessageType('error')
      setMessage('Please select a course.')
      return
    }
    if (!date) {
      setMessageType('error')
      setMessage('Please select a date.')
      return
    }
    if (students.length === 0) {
      setMessageType('error')
      setMessage('No students to mark attendance for.')
      return
    }

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
        setMessageType('success')
        setMessage(`Attendance saved: ${data.totalRecords} record(s) updated for ${selectedCourse.code} on ${date}.`)
      })
      .catch(() => {
        setMessageType('error')
        setMessage('Error submitting attendance. Please try again.')
      })
      .finally(() => setSubmitting(false))
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px', border: '1px solid #d1d5db',
    borderRadius: '6px', fontSize: '14px', color: '#111827',
    backgroundColor: '#ffffff', outline: 'none', cursor: 'pointer', fontFamily: 'inherit'
  }

  if (loadingCourses) {
    return (
      <div style={{ backgroundColor: '#f0f4f8', minHeight: '100vh', padding: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: '#64748b' }}>Loading courses...</p>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#f0f4f8', minHeight: '100vh', padding: '16px' }}>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', width: '100%', boxSizing: 'border-box' }}>

        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '24px' }}>
          Mark Attendance
        </h2>

        {/* Controls Row - responsive with flexWrap */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 55%', minWidth: '200px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }} htmlFor="course-select">
              Select Course
            </label>
            <select id="course-select" value={selectedCourse?._id || ''} onChange={handleCourseChange} style={inputStyle}>
              {courses.length === 0
                ? <option>No courses assigned</option>
                : courses.map(c => <option key={c._id} value={c._id}>{c.code} — {c.name}</option>)
              }
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 35%', minWidth: '160px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }} htmlFor="date-input">
              Date
            </label>
            <input
              id="date-input" type="date" value={date}
              onChange={(e) => { setDate(e.target.value); setSubmitted(false) }}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Attendance Table */}
        <div style={{ overflowX: 'auto' }}>
          {loadingStudents ? (
            <p style={{ padding: '16px', color: '#6b7280' }}>Loading students...</p>
          ) : students.length === 0 ? (
            <p style={{ padding: '16px', color: '#6b7280' }}>
              {courses.length === 0 ? 'No courses assigned to your account.' : 'No students enrolled in this course.'}
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Student ID', 'Name', 'Present', 'Absent', 'Late'].map(h => (
                    <th key={h} style={{ textAlign: h === 'Student ID' || h === 'Name' ? 'left' : 'center', padding: '10px 12px', fontSize: '12px', fontWeight: '600', color: '#6b7280', borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.studentId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#374151' }}>{student.studentId}</td>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#111827', fontWeight: '500' }}>{student.firstName} {student.lastName}</td>
                    {['Present', 'Absent', 'Late'].map(status => (
                      <td key={status} style={{ padding: '12px', textAlign: 'center' }}>
                        <input
                          type="radio"
                          name={`attendance-${student.studentId}`}
                          value={status}
                          checked={attendance[student.studentId] === status}
                          onChange={() => handleAttendanceChange(student.studentId, status)}
                          aria-label={`Mark ${student.firstName} ${status}`}
                          style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Feedback message */}
        {message && (
          <div style={{
            marginTop: '16px', padding: '12px 16px', borderRadius: '8px',
            backgroundColor: messageType === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${messageType === 'success' ? '#86efac' : '#fca5a5'}`,
            color: messageType === 'success' ? '#166534' : '#991b1b',
            fontSize: '14px'
          }}>
            {submitted && messageType === 'success' ? '✅ ' : ''}{message}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '24px' }}>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitting || students.length === 0 || !teacherId}
            style={{ opacity: (submitting || students.length === 0) ? 0.6 : 1 }}
          >
            {submitting ? 'Submitting…' : '✔ Submit Attendance'}
          </button>
          <button className="btn btn-secondary" onClick={handleReset} disabled={students.length === 0}>
            ↺ Reset
          </button>
        </div>

      </div>
    </div>
  )
}

export default TeacherAttendance
