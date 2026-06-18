import { Edit } from 'lucide-react';
import { useState } from 'react';

export const AdminCourses = () => {
  const [courses] = useState([
    { code: 'CS301', name: 'Software Engineering', teacher: 'Dr. Gunawardena', students: 64, credits: 3, status: 'Active' },
    { code: 'CS401', name: 'Data Structures', teacher: 'Ms. Perera', students: 58, credits: 3, status: 'Active' },
    { code: 'MA201', name: 'Mathematics II', teacher: 'Dr. Bandara', students: 72, credits: 4, status: 'Active' },
    { code: 'EN102', name: 'Technical English', teacher: 'Ms. Kumari', students: 80, credits: 2, status: 'Draft' },
  ]);

  return (
    <div>
      {/* ── Course Management Card ── */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Course Management</span>
          <button className="btn btn-primary cursor-pointer">
            <i className="ti ti-plus"></i>New Course
          </button>
        </div>

        {/* Courses Table */}
        <table>
          <thead>
            <tr>
              <th>CODE</th>
              <th>COURSE NAME</th>
              <th>ASSIGNED TEACHER</th>
              <th>STUDENTS</th>
              <th>CREDITS</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.code}>
                <td>{course.code}</td>
                <td>{course.name}</td>
                <td>{course.teacher}</td>
                <td>{course.students}</td>
                <td>{course.credits}</td>
                <td>
                  <span className={`badge ${course.status === 'Active' ? 'badge-green' : 'badge-amber'}`}>
                    {course.status}
                  </span>
                </td>
                <td className='flex gap-2 items-center'>
                  <button className="btn btn-sm cursor-pointer">
                    <Edit className='w-4 h-4 text-blue-500' />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Assign Course to Student Card ── */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <span className="card-title">Assign Course to Student</span>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Select Student</label>
            <select className="cursor-pointer">
              <option>FC222038 — N.G.N.S. Niralgama</option>
            </select>
          </div>
          <div className="form-group">
            <label>Select Course</label>
            <select className="cursor-pointer">
              <option>CS301 — Software Engineering</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <button className="btn btn-primary cursor-pointer">
            <i className="ti ti-link"></i>Assign Course
          </button>
        </div>
      </div>
    </div>
  );
};
