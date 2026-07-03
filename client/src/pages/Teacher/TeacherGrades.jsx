import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAppContext } from '../../context/useAppContext';

const ASSESSMENT_TYPES = [
  { id: 'Final Exam', label: 'Final Exam' },
  { id: 'Mid Exam',   label: 'Mid Exam' },
  { id: 'Assignment', label: 'Assignment' },
  { id: 'Quiz',       label: 'Quiz' },
];

function getGrade(score) {
  if (score === '' || score === null || score === undefined) return null;
  const s = Number(score);
  if (s >= 90) return { letter: 'A+', color: '#16a34a', bg: '#f0fdf4' };
  if (s >= 80) return { letter: 'A',  color: '#16a34a', bg: '#f0fdf4' };
  if (s >= 70) return { letter: 'B',  color: '#2563eb', bg: '#eff6ff' };
  if (s >= 60) return { letter: 'C',  color: '#d97706', bg: '#fffbeb' };
  if (s >= 50) return { letter: 'D',  color: '#ea580c', bg: '#fff7ed' };
  return             { letter: 'F',  color: '#dc2626', bg: '#fef2f2' };
}

function getRemarks(score) {
  if (score === '' || score === null || score === undefined) return '';
  const s = Number(score);
  if (s >= 90) return 'Outstanding';
  if (s >= 80) return 'Excellent';
  if (s >= 70) return 'Good';
  if (s >= 60) return 'Average';
  if (s >= 50) return 'Needs review';
  return 'Failed';
}

const TeacherEnterGrades = () => {
  const { backendUrl } = useAppContext();

  const [teacherId, setTeacherId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [assessmentType, setAssessmentType] = useState(ASSESSMENT_TYPES[0].id);
  const [students, setStudents] = useState(null);
  const [scores, setScores] = useState({});
  const [remarks, setRemarks] = useState({});
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  // Step 1: fetch teacher profile on mount
  useEffect(() => {
    axios.get(`${backendUrl}/api/auth/isLoggedIn`, { withCredentials: true, timeout: 10000 })
      .then(({ data }) => {
        if (data.success && data.role === 'teacher' && data.user && data.user.teacherId) {
          setTeacherId(data.user.teacherId);
        } else {
          setAuthError(true);
          setLoading(false);
        }
      })
      .catch(() => { setAuthError(true); setLoading(false); });
  }, [backendUrl]);

  // Step 2: fetch assigned courses once teacherId is known
  useEffect(() => {
    if (!teacherId) return;
    let active = true;
    axios.get(`${backendUrl}/api/teacher/grades/courses`, {
      params: { teacherId },
      withCredentials: true,
      timeout: 10000
    }).then(({ data }) => {
      if (active) {
        const list = data.courses || [];
        setCourses(list);
        if (list.length > 0) setSelectedCourse(list[0]._id);
        setLoading(false);
      }
    }).catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [backendUrl, teacherId]);

  // Step 3: fetch enrolled students when course changes
  useEffect(() => {
    if (!selectedCourse) return;
    let active = true;
    axios.get(`${backendUrl}/api/teacher/grades/students/${selectedCourse}`, {
      withCredentials: true
    }).then(({ data }) => {
      if (active) {
        const list = data.students || [];
        setStudents(list);
        const initScores = {};
        const initRemarks = {};
        list.forEach(s => { initScores[s._id] = ''; initRemarks[s._id] = ''; });
        setScores(initScores);
        setRemarks(initRemarks);
      }
    }).catch(() => { if (active) setStudents([]); });
    return () => { active = false; };
  }, [backendUrl, selectedCourse]);

  function handleScoreChange(studentId, value) {
    if (value === '' || (Number(value) >= 0 && Number(value) <= 100)) {
      setScores(prev => ({ ...prev, [studentId]: value }));
      setRemarks(prev => ({ ...prev, [studentId]: getRemarks(value) }));
      setStatusMsg(null);
    }
  }

  function handleRemarksChange(studentId, value) {
    setRemarks(prev => ({ ...prev, [studentId]: value }));
    setStatusMsg(null);
  }

  function buildGradesData() {
    return students
      .filter(s => scores[s._id] !== '')
      .map(s => {
        const gradeObj = getGrade(scores[s._id]);
        return {
          studentId: s._id,
          marks: Number(scores[s._id]),
          grade: gradeObj ? gradeObj.letter : 'F',
          remark: remarks[s._id] || ''
        };
      });
  }

  function handleSaveDraft() {
    if (!selectedCourse || !teacherId) return;
    const gradesData = buildGradesData();
    if (gradesData.length === 0) {
      setStatusMsg({ type: 'error', text: 'Please enter at least one score before saving.' });
      return;
    }
    setActionLoading(true);
    axios.post(`${backendUrl}/api/teacher/grades/`, {
      teacherId, courseId: selectedCourse, assessmentType, gradesData
    }, { withCredentials: true })
      .then(({ data }) => setStatusMsg({ type: 'success', text: `Draft saved for ${data.updatedCount} student(s).` }))
      .catch(() => setStatusMsg({ type: 'error', text: 'Failed to save grades draft.' }))
      .finally(() => setActionLoading(false));
  }

  function handlePublish() {
    if (!selectedCourse || !teacherId) return;
    setActionLoading(true);
    const gradesData = buildGradesData();
    const saveStep = gradesData.length > 0
      ? axios.post(`${backendUrl}/api/teacher/grades/`, {
          teacherId, courseId: selectedCourse, assessmentType, gradesData
        }, { withCredentials: true })
      : Promise.resolve();

    saveStep
      .then(() => axios.put(`${backendUrl}/api/teacher/grades/publish`, {
        teacherId, courseId: selectedCourse, assessmentType
      }, { withCredentials: true }))
      .then(({ data }) => setStatusMsg({ type: 'success', text: `Grades published for ${data.publishedCount} student(s).` }))
      .catch(() => setStatusMsg({ type: 'error', text: 'Failed to publish grades.' }))
      .finally(() => setActionLoading(false));
  }

  if (loading) {
    return (
      <div style={{ backgroundColor: '#f0f4f8', minHeight: '100vh', padding: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: '#64748b' }}>Loading courses...</p>
      </div>
    );
  }

  if (authError) {
    return (
      <div style={{ backgroundColor: '#f0f4f8', minHeight: '100vh', padding: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: '#ef4444' }}>Please log in as a teacher to view grades.</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f0f4f8', minHeight: '100vh', padding: '32px' }}>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', width: '100%' }}>

        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '24px' }}>
          Enter Grades
        </h2>

        {/* Controls Row */}
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-start', width: '100%', marginBottom: '24px' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '0 0 58%' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }} htmlFor="course-select">Course</label>
            <select
              id="course-select"
              value={selectedCourse}
              onChange={(e) => { setSelectedCourse(e.target.value); setStudents(null); setScores({}); setRemarks({}); setStatusMsg(null); }}
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', color: '#111827', backgroundColor: '#ffffff', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {courses.length === 0
                ? <option>No courses assigned</option>
                : courses.map(c => <option key={c._id} value={c._id}>{c.code} — {c.name}</option>)
              }
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '0 0 40%' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }} htmlFor="assessment-select">Assessment Type</label>
            <select
              id="assessment-select"
              value={assessmentType}
              onChange={(e) => { setAssessmentType(e.target.value); setStatusMsg(null); }}
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', color: '#111827', backgroundColor: '#ffffff', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {ASSESSMENT_TYPES.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
            </select>
          </div>
        </div>

        {/* Grades Table */}
        <div style={{ width: '100%', overflowX: 'auto' }}>
          {courses.length === 0 ? (
            <p style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>No courses assigned to your account.</p>
          ) : students === null ? (
            <p style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>Loading student list...</p>
          ) : students.length === 0 ? (
            <p style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>No students enrolled in this course.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  {['Student', 'Score (/100)', 'Auto Grade', 'Remarks'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map(student => {
                  const grade = getGrade(scores[student._id]);
                  return (
                    <tr key={student._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px', color: '#1e293b', fontWeight: '500' }}>
                        {student.studentId} — {student.firstName} {student.lastName}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <input
                          type="number" min="0" max="100"
                          value={scores[student._id] ?? ''}
                          onChange={(e) => handleScoreChange(student._id, e.target.value)}
                          placeholder="—"
                          style={{ width: '80px', padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', color: '#111827', outline: 'none', fontFamily: 'inherit', textAlign: 'center' }}
                        />
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {grade ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: grade.bg, color: grade.color, fontSize: '12px', fontWeight: '700', border: `1px solid ${grade.color}33` }}>
                            {grade.letter}
                          </span>
                        ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <input
                          type="text"
                          value={remarks[student._id] ?? ''}
                          onChange={(e) => handleRemarksChange(student._id, e.target.value)}
                          placeholder="—"
                          style={{ width: '200px', padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', color: '#111827', outline: 'none', fontFamily: 'inherit' }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div style={{ marginTop: '16px', backgroundColor: statusMsg.type === 'success' ? '#f0fdf4' : '#fef2f2', border: `1.5px solid ${statusMsg.type === 'success' ? '#86efac' : '#fca5a5'}`, borderRadius: '8px', padding: '12px 16px', color: statusMsg.type === 'success' ? '#166534' : '#991b1b', fontSize: '14px' }}>
            {statusMsg.text}
          </div>
        )}

        {/* Action Buttons */}
        {students !== null && students.length > 0 && (
          <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
            <button onClick={handleSaveDraft} disabled={actionLoading}
              style={{ padding: '11px 24px', backgroundColor: '#ffffff', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', opacity: actionLoading ? 0.7 : 1 }}>
              💾 Save Draft
            </button>
            <button onClick={handlePublish} disabled={actionLoading}
              style={{ padding: '11px 24px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', opacity: actionLoading ? 0.7 : 1 }}>
              📢 Publish Grades
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default TeacherEnterGrades;
