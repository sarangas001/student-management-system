import { useState } from 'react'

const COURSES = [
  { id: 'CS301', label: 'CS301 — Software Engineering' },
  { id: 'CS302', label: 'CS302 — Database Management' },
  { id: 'CS303', label: 'CS303 — Operating Systems' },
]

const ASSESSMENT_TYPES = [
  { id: 'final', label: 'Final Exam' },
  { id: 'mid', label: 'Mid Exam' },
  { id: 'assignment', label: 'Assignment' },
  { id: 'quiz', label: 'Quiz' },
]

const INITIAL_STUDENTS = [
  { id: 'FC222038', name: 'Niralgama' },
  { id: 'FC222039', name: 'Seneviratne' },
  { id: 'FC222015', name: 'Sathsarani' },
  { id: 'FC222016', name: 'Ranasinghe' },
  { id: 'FC222022', name: 'Samarakoon' },
]

// Automatically calculate grade based on score
function getGrade(score) {
  if (score === '' || score === null) return null
  const s = Number(score)
  if (s >= 90) return { letter: 'A+', color: '#16a34a', bg: '#f0fdf4' }
  if (s >= 80) return { letter: 'A',  color: '#16a34a', bg: '#f0fdf4' }
  if (s >= 70) return { letter: 'B',  color: '#2563eb', bg: '#eff6ff' }
  if (s >= 60) return { letter: 'C',  color: '#d97706', bg: '#fffbeb' }
  if (s >= 50) return { letter: 'D',  color: '#ea580c', bg: '#fff7ed' }
  return       { letter: 'F',  color: '#dc2626', bg: '#fef2f2' }
}

// Automatically suggest remarks based on score
function getRemarks(score) {
  if (score === '' || score === null) return ''
  const s = Number(score)
  if (s >= 90) return 'Outstanding'
  if (s >= 80) return 'Excellent'
  if (s >= 70) return 'Good'
  if (s >= 60) return 'Average'
  if (s >= 50) return 'Needs review'
  return 'Failed'
}

const TeacherEnterGrades = () => {
  const [selectedCourse, setSelectedCourse] = useState(COURSES[0].id)
  const [assessmentType, setAssessmentType] = useState(ASSESSMENT_TYPES[0].id)
  const [published, setPublished] = useState(false)

  // Store score for each student
 const [scores, setScores] = useState({
    'FC222038': '85',
    'FC222039': '72',
    'FC222015': '91',
    'FC222016': '58',
    'FC222022': '92',
  })

  const [remarks, setRemarks] = useState({
    'FC222038': 'Excellent',
    'FC222039': 'Good',
    'FC222015': 'Outstanding',
    'FC222016': 'Needs review',
    'FC222022': 'Excellent',
  })

  function handleScoreChange(studentId, value) {
    // Only allow numbers 0-100
    if (value === '' || (Number(value) >= 0 && Number(value) <= 100)) {
      setScores((prev) => ({ ...prev, [studentId]: value }))
      // Auto-fill remarks when score changes
      setRemarks((prev) => ({ ...prev, [studentId]: getRemarks(value) }))
      setPublished(false)
    }
  }

  function handleRemarksChange(studentId, value) {
    setRemarks((prev) => ({ ...prev, [studentId]: value }))
    setPublished(false)
  }

  function handlePublish() {
    console.log('Publishing grades:', { course: selectedCourse, assessmentType, scores, remarks })
    setPublished(true)
  }

  return (
    <div style={{ backgroundColor: '#f0f4f8', minHeight: '100vh', padding: '32px' }}>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', width: '100%' }}>

        {/* Page Title */}
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '24px' }}>
          Enter Grades
        </h2>

        {/* --- Controls Row: Course + Assessment Type --- */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', alignItems: 'flex-start', width: '100%', marginBottom: '24px' }}>

          {/* Course dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '0 0 58%' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }} htmlFor="course-select">
              Course
            </label>
            <select
              id="course-select"
              value={selectedCourse}
              onChange={(e) => { setSelectedCourse(e.target.value); setPublished(false) }}
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

          {/* Assessment Type dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '0 0 40%' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }} htmlFor="assessment-select">
              Assessment Type
            </label>
            <select
              id="assessment-select"
              value={assessmentType}
              onChange={(e) => { setAssessmentType(e.target.value); setPublished(false) }}
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
              {ASSESSMENT_TYPES.map((a) => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          </div>

        </div>{/* end controls row */}

        {/* --- Grades Table --- */}
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  Student
                </th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  Score (/100)
                </th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  Auto Grade
                </th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  Remarks
                </th>
              </tr>
            </thead>
            <tbody>
              {INITIAL_STUDENTS.map((student) => {
                const grade = getGrade(scores[student.id])
                return (
                  <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9' }}>

                    {/* Student name */}
                    <td style={{ padding: '14px 16px', color: '#1e293b', fontWeight: '500' }}>
                      {student.id} — {student.name}
                    </td>

                    {/* Score input box */}
                    <td style={{ padding: '14px 16px' }}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={scores[student.id]}
                        onChange={(e) => handleScoreChange(student.id, e.target.value)}
                        placeholder="—"
                        style={{
                          width: '80px',
                          padding: '7px 10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          color: '#111827',
                          outline: 'none',
                          fontFamily: 'inherit',
                          textAlign: 'center'
                        }}
                      />
                    </td>

                    {/* Auto Grade badge */}
                    <td style={{ padding: '14px 16px' }}>
                      {grade ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: grade.bg,
                          color: grade.color,
                          fontSize: '12px',
                          fontWeight: '700',
                          border: `1px solid ${grade.color}33`
                        }}>
                          {grade.letter}
                        </span>
                      ) : (
                        <span style={{ color: '#cbd5e1' }}>—</span>
                      )}
                    </td>

                    {/* Remarks input box */}
                    <td style={{ padding: '14px 16px' }}>
                      <input
                        type="text"
                        value={remarks[student.id]}
                        onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                        placeholder="—"
                        style={{
                          width: '150px',
                          padding: '7px 10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          color: '#111827',
                          outline: 'none',
                          fontFamily: 'inherit'
                        }}
                      />
                    </td>

                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>{/* end table */}

        {/* --- Success Message --- */}
        {published && (
          <div style={{ marginTop: '16px', backgroundColor: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '8px', padding: '12px 16px', color: '#166534', fontSize: '14px' }}>
            ✅ Grades published successfully for <strong>{COURSES.find((c) => c.id === selectedCourse)?.label}</strong>.
          </div>
        )}

        {/* --- Publish Button --- */}
        <div style={{ marginTop: '24px' }}>
          <button
            onClick={handlePublish}
            style={{
              padding: '11px 24px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            ☰ Publish Grades
          </button>
        </div>

      </div>{/* end white card */}
    </div>
  )
}

export default TeacherEnterGrades