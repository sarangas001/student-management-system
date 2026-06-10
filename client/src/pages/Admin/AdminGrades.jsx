import  { useState } from "react";

function AdminGrades() {
  const gradeData = {
  CSE301: {
    "Mid Exam": [
      { id: "FC222010", name: "Methmini", marks: 85, grade: "A", remark: "Excellent", badge: "badge-green" },
      { id: "FC222015", name: "Sathsarani", marks: 72, grade: "B", remark: "Good", badge: "badge-blue" },
      { id: "FC222032", name: "Daraniyagala", marks: 91, grade: "A+", remark: "Outstanding", badge: "badge-green" },
    ],

    "Final Exam": [
      { id: "FC222010", name: "Methmini", marks: 90, grade: "A+", remark: "Outstanding", badge: "badge-green" },
      { id: "FC222015", name: "Sathsarani", marks: 80, grade: "A", remark: "Excellent", badge: "badge-green" },
      { id: "FC222032", name: "Daraniyagala", marks: 88, grade: "A", remark: "Excellent", badge: "badge-green" },
    ],

    Assignment: [
      { id: "FC222010", name: "Methmini", marks: 86, grade: "A", remark: "Excellent", badge: "badge-green" },
      { id: "FC222015", name: "Sathsarani", marks: 76, grade: "B+", remark: "Good", badge: "badge-blue" },
      { id: "FC222032", name: "Daraniyagala", marks: 81, grade: "A", remark: "Excellent", badge: "badge-green" },
    ],
  },

  CCS401: {
    "Mid Exam": [
      { id: "FC222022", name: "Samarakoon", marks: 78, grade: "B+", remark: "Good", badge: "badge-blue" },
      { id: "FC222038", name: "Niralgama", marks: 65, grade: "B-", remark: "Average", badge: "badge-blue" },
      { id: "FC222039", name: "Seneviratne", marks: 92, grade: "A+", remark: "Outstanding", badge: "badge-green" },
    ],

    "Final Exam": [
      { id: "FC222022", name: "Samarakoon", marks: 84, grade: "A", remark: "Excellent", badge: "badge-green" },
      { id: "FC222038", name: "Niralgama", marks: 75, grade: "B+", remark: "Good", badge: "badge-blue" },
      { id: "FC222039", name: "Seneviratne", marks: 95, grade: "A+", remark: "Outstanding", badge: "badge-green" },
    ],

    Assignment: [
      { id: "FC222022", name: "Samarakoon", marks: 80, grade: "A", remark: "Excellent", badge: "badge-green" },
      { id: "FC222038", name: "Niralgama", marks: 71, grade: "B", remark: "Good", badge: "badge-blue" },
      { id: "FC222039", name: "Seneviratne", marks: 89, grade: "A", remark: "Excellent", badge: "badge-green" },
    ],
  },

  CIS501: {
    "Mid Exam": [
      { id: "FC222016", name: "Ranasinghe", marks: 69, grade: "B-", remark: "Average", badge: "badge-blue" },
    ],

    "Final Exam": [
      { id: "FC222016", name: "Ranasinghe", marks: 82, grade: "A", remark: "Excellent", badge: "badge-green" },
    ],

    Assignment: [
      { id: "FC222016", name: "Ranasinghe", marks: 88, grade: "A", remark: "Excellent", badge: "badge-green" },
    ],
  },
};

  const [selectedCourse, setSelectedCourse] = useState("CSE301");
  const [selectedAssessment, setSelectedAssessment] = useState("Mid Exam");

  const students =
    gradeData[selectedCourse]?.[selectedAssessment] || [];

  return (
    <div className="page active">
      <div className="card">
        <div className="card-header">
          <span className="card-title">Grade Management</span>
        </div>

        {/* Filters */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginBottom: "25px",
          }}
        >
          <div className="form-group">
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              Course
            </label>

            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="CSE301">
                CSE301 — Software Engineering
              </option>

              <option value="CCS401">
                CCS401 — Computer Science
              </option>

              <option value="CIS501">
                CIS501 — Information System
              </option>
            </select>
          </div>

          <div className="form-group">
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              Assessment
            </label>

            <select
              value={selectedAssessment}
              onChange={(e) =>
                setSelectedAssessment(e.target.value)
              }
            >
              <option value="Mid Exam">Mid Exam</option>
              <option value="Final Exam">Final Exam</option>
              <option value="Assignment">Assignment</option>
              
              
                
            </select>
          </div>
        </div>

        {/* Table */}
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
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
  {students.map((student) => (
    <tr
      key={`${selectedCourse}-${selectedAssessment}-${student.id}`}
    >
      <td>{student.id}</td>

      <td>{student.name}</td>

      <td>
        <input
          type="number"
          className="inline-input"
          value={student.marks}
          readOnly
        />
      </td>

      <td>
        <span className={`badge ${student.badge}`}>
          {student.grade}
        </span>
      </td>

      <td>{student.remark}</td>
    </tr>
  ))}
</tbody>
          </table>
        </div>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            gap: "15px",
            marginTop: "25px",
          }}
        >
          <button className="btn btn-primary">
            <i className="ti ti-device-floppy"></i>
            Save Grades
          </button>

          <button className="btn">
            <i className="ti ti-file-type-pdf"></i>
            Export Results
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminGrades;