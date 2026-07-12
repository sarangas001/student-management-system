import { useState, useEffect } from "react";
import axios from "axios";
import { useAppContext } from "../../context/useAppContext";

const badgeForGrade = (grade) => {
  if (!grade) return 'badge-blue';
  if (grade.startsWith('A')) return 'badge-green';
  if (grade.startsWith('B')) return 'badge-blue';
  return 'badge-amber';
};

function AdminGrades() {
  const { backendUrl } = useAppContext();

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedAssessment, setSelectedAssessment] = useState('Mid Exam');
  const [students, setStudents] = useState([]);
  const [editedMarks, setEditedMarks] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Separate loading/error state per section so failures are visible
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState('');
  const [gradesLoading, setGradesLoading] = useState(false);
  const [gradesError, setGradesError] = useState('');

  useEffect(() => {
    let active = true;
    axios.get(`${backendUrl}/api/admin/grades/courses`, { withCredentials: true })
      .then(({ data }) => {
        if (!active) return;
        if (data.success) {
          setCourses(data.courses);
          if (data.courses.length > 0) {
            setSelectedCourse(data.courses[0]._id);
          } else {
            setCoursesError('No courses found. Add a course first (Admin -> Courses) before grades can load.');
          }
        } else {
          setCoursesError(data.message || 'Failed to load courses.');
        }
      })
      .catch((err) => {
        if (!active) return;
        const status = err.response?.status;
        const serverMsg = err.response?.data?.message;
        if (status === 401 || status === 403) {
          setCoursesError('You are not authorized. Please log in as an admin and try again.');
        } else {
          setCoursesError(serverMsg || err.message || 'Could not reach the server.');
        }
        console.error('Failed to fetch courses:', err);
      })
      .finally(() => {
        if (active) setCoursesLoading(false);
      });

    return () => { active = false; };
  }, [backendUrl]);

  useEffect(() => {
    if (!selectedCourse) return;
    let active = true;

    // Defer state updates to avoid react-hooks/set-state-in-effect warning
    Promise.resolve().then(() => {
      if (active) {
        setGradesLoading(true);
        setGradesError('');
      }
    });

    axios.get(`${backendUrl}/api/admin/grades`, {
      params: { courseId: selectedCourse, assessmentType: selectedAssessment },
      withCredentials: true
    }).then(({ data }) => {
      if (!active) return;
      if (data.success) {
        setStudents(data.grades);
        setEditedMarks({});
        setMessage('');
      } else {
        setGradesError(data.message || 'Failed to load grades.');
        setStudents([]);
      }
    }).catch((err) => {
      if (!active) return;
      const status = err.response?.status;
      const serverMsg = err.response?.data?.message;
      if (status === 401 || status === 403) {
        setGradesError('You are not authorized to view grades.');
      } else {
        setGradesError(serverMsg || err.message || 'Could not reach the server.');
      }
      setStudents([]);
      console.error('Failed to fetch grades:', err);
    }).finally(() => {
      if (active) setGradesLoading(false);
    });

    return () => { active = false; };
  }, [backendUrl, selectedCourse, selectedAssessment, refreshKey]);

  const handleMarksChange = (studentMongoId, value) => {
    setEditedMarks(prev => ({ ...prev, [studentMongoId]: value }));
  };

  const handleSave = () => {
    // Validate all edited marks on frontend first (ignore unused key using leading underscore)
    for (const [, marks] of Object.entries(editedMarks)) {
      const numericMarks = Number(marks);
      if (marks === '' || isNaN(numericMarks) || numericMarks < 0 || numericMarks > 100) {
        setMessage('Error: Marks must be a number between 0 and 100.');
        return;
      }
    }

    setSaving(true);
    setMessage('');
    const updates = Object.entries(editedMarks).map(([studentMongoId, marks]) =>
      axios.put(
        `${backendUrl}/api/admin/grades/student/${studentMongoId}`,
        { courseId: selectedCourse, assessmentType: selectedAssessment, marks: Number(marks) },
        { withCredentials: true }
      )
    );

    Promise.all(updates)
      .then(() => {
        setMessage('Grades saved successfully!');
        setEditedMarks({});
        setRefreshKey(k => k + 1);
      })
      .catch((err) => {
        const serverMsg = err.response?.data?.message || err.message;
        setMessage(`Error saving grades: ${serverMsg || 'Unknown error'}`);
        console.error('Failed to save grades:', err);
      })
      .finally(() => setSaving(false));
  };

  return (
    <div className="page active">
      <div className="card">
        <div className="card-header">
          <span className="card-title">Grade Management</span>
        </div>

        {/* Filters */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "10px" }}>
          <div className="form-group">
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              disabled={coursesLoading || courses.length === 0}
            >
              {courses.length === 0 && <option value="">No courses available</option>}
              {courses.map(c => (
                <option key={c._id} value={c._id}>{c.code} - {c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Assessment</label>
            <select value={selectedAssessment} onChange={(e) => setSelectedAssessment(e.target.value)}>
              <option value="Mid Exam">Mid Exam</option>
              <option value="Final Exam">Final Exam</option>
              <option value="Assignment">Assignment</option>
              <option value="Quiz">Quiz</option>
            </select>
          </div>
        </div>

        {/* Visible error / status messages instead of silent console.error */}
        {coursesError && (
          <div className="alert alert-amber" style={{ marginBottom: '15px' }}>
            <i className="ti ti-alert-triangle"></i>
            <div>{coursesError}</div>
          </div>
        )}
        {gradesError && (
          <div className="alert alert-amber" style={{ marginBottom: '15px' }}>
            <i className="ti ti-alert-triangle"></i>
            <div>{gradesError}</div>
          </div>
        )}

        {/* Table */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "12px", overflow: "auto" }}>
          <table style={{ minWidth: '700px', width: '100%' }}>
            <thead>
              <tr>
                <th>STUDENT ID</th>
                <th>NAME</th>
                <th>MARKS (/100)</th>
                <th>GRADE</th>
                <th>REMARKS</th>
              </tr>
            </thead>
            <tbody>
              {gradesLoading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '16px', color: 'var(--muted)' }}>
                    Loading grades...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '16px', color: 'var(--muted)' }}>
                    {selectedCourse ? 'No grades found for this course and assessment' : 'Select a course to view grades'}
                  </td>
                </tr>
              ) : students.map((g) => {
                const mongoId = g.student?._id;
                const currentMarks = editedMarks[mongoId] !== undefined ? editedMarks[mongoId] : g.marks;
                return (
                  <tr key={g._id}>
                    <td>{g.student?.studentId}</td>
                    <td>{g.student?.firstName} {g.student?.lastName}</td>
                    <td>
                      <input
                        type="number"
                        className="inline-input"
                        min="0"
                        max="100"
                        value={currentMarks}
                        onChange={(e) => handleMarksChange(mongoId, e.target.value)}
                      />
                    </td>
                    <td>
                      <span className={`badge ${badgeForGrade(g.grade)}`}>{g.grade}</span>
                    </td>
                    <td>{g.remark}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "15px", marginTop: "25px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving || Object.keys(editedMarks).length === 0}
          >
            <i className="ti ti-device-floppy"></i>
            {saving ? 'Saving...' : 'Save Grades'}
          </button>
          <button className="btn">
            <i className="ti ti-file-type-pdf"></i>
            Export Results
          </button>
        </div>

        {message && (
          <div className={`alert ${message.toLowerCase().includes('error') ? 'alert-amber' : 'alert-green'}`} style={{ marginTop: '15px' }}>
            <i className={message.toLowerCase().includes('error') ? 'ti ti-alert-circle' : 'ti ti-circle-check'}></i>
            <div>{message}</div>
          </div>
        )}
      </div>

      {/* Basic responsiveness: stack filters on narrow screens */}
      <style>{`
        @media (max-width: 640px) {
          .card > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default AdminGrades;
