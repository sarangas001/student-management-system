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

  useEffect(() => {
    axios.get(`${backendUrl}/api/admin/grades/courses`, { withCredentials: true })
      .then(({ data }) => {
        if (data.success && data.courses.length > 0) {
          setCourses(data.courses);
          setSelectedCourse(data.courses[0]._id);
        }
      })
      .catch(console.error);
  }, [backendUrl]);

  useEffect(() => {
    if (!selectedCourse) return;
    let active = true;
    axios.get(`${backendUrl}/api/admin/grades`, {
      params: { courseId: selectedCourse, assessmentType: selectedAssessment },
      withCredentials: true
    }).then(({ data }) => {
      if (active) {
        setStudents(data.success ? data.grades : []);
        setEditedMarks({});
        setMessage('');
      }
    }).catch(console.error);
    return () => { active = false; };
  }, [backendUrl, selectedCourse, selectedAssessment, refreshKey]);

  const handleMarksChange = (studentMongoId, value) => {
    setEditedMarks(prev => ({ ...prev, [studentMongoId]: value }));
  };

  const handleSave = () => {
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
        setRefreshKey(k => k + 1);
      })
      .catch(() => setMessage('Error saving grades.'))
      .finally(() => setSaving(false));
  };

  return (
    <div className="page active">
      <div className="card">
        <div className="card-header">
          <span className="card-title">Grade Management</span>
        </div>

        {/* Filters */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "25px" }}>
          <div className="form-group">
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Course</label>
            <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
              {courses.map(c => (
                <option key={c._id} value={c._id}>{c.code} — {c.name}</option>
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

        {/* Table */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
          <table>
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
              {students.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '16px', color: 'var(--muted)' }}>
                    No grades found for this course and assessment
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
        <div style={{ display: "flex", gap: "15px", marginTop: "25px", alignItems: "center" }}>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving || Object.keys(editedMarks).length === 0}
          >
            <i className="ti ti-device-floppy"></i>
            {saving ? 'Saving…' : 'Save Grades'}
          </button>
          <button className="btn">
            <i className="ti ti-file-type-pdf"></i>
            Export Results
          </button>
          {message && (
            <span style={{ color: message.includes('Error') ? 'var(--red)' : 'var(--green)' }}>
              {message}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminGrades;
