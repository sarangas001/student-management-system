import { Edit } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAppContext } from '../../context/useAppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const emptyCourseForm = {
  _id: '',
  code: '',
  name: '',
  teacher: '',
  credits: 3,
  department: '',
  status: 'Active',
};

export const AdminCourses = () => {
  const { backendUrl } = useAppContext();

  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Course modal state
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [courseForm, setCourseForm] = useState(emptyCourseForm);

  // Assign course state
  const [assignStudentId, setAssignStudentId] = useState('');
  const [assignCourseId, setAssignCourseId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [coursesRes, teachersRes, studentsRes] = await Promise.all([
        axios.get(`${backendUrl}/api/admin/courses`, { withCredentials: true }),
        axios.get(`${backendUrl}/api/teachers`, { withCredentials: true }),
        axios.get(`${backendUrl}/api/admin/students`, { withCredentials: true }),
      ]);

      if (coursesRes.data && coursesRes.data.success) setCourses(coursesRes.data.data);
      if (teachersRes.data && teachersRes.data.success) setTeachers(teachersRes.data.data);
      if (studentsRes.data && studentsRes.data.success) setStudents(studentsRes.data.data);
    } catch (error) {
      console.error('Error fetching courses page data:', error);
      toast.error('Failed to load courses data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchAll();
    };

    if (backendUrl) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendUrl]);

  const handleCourseInputChange = (e) => {
    const { name, value } = e.target;
    setCourseForm((prev) => ({ ...prev, [name]: value }));
  };

  const openAddCourseModal = () => {
    setIsEditingCourse(false);
    setCourseForm(emptyCourseForm);
    setShowCourseModal(true);
  };

  const openEditCourseModal = (course) => {
    setIsEditingCourse(true);
    setCourseForm({
      _id: course._id,
      code: course.code,
      name: course.name,
      teacher: course.teacher?._id || '',
      credits: course.credits,
      department: course.department,
      status: course.status,
    });
    setShowCourseModal(true);
  };

  const handleSaveCourse = async () => {
    const payload = {
      code: courseForm.code,
      name: courseForm.name,
      teacher: courseForm.teacher || null,
      credits: Number(courseForm.credits),
      department: courseForm.department,
      status: courseForm.status,
    };

    try {
      if (isEditingCourse) {
        const { data } = await axios.put(
          `${backendUrl}/api/admin/courses/${courseForm._id}`,
          payload,
          { withCredentials: true }
        );
        if (data.success) {
          setCourses((prev) => prev.map((c) => (c._id === data.data._id ? data.data : c)));
          toast.success('Course updated successfully!');
          setShowCourseModal(false);
        }
      } else {
        const { data } = await axios.post(`${backendUrl}/api/admin/courses`, payload, {
          withCredentials: true,
        });
        if (data.success) {
          setCourses((prev) => [...prev, data.data]);
          toast.success('Course created successfully!');
          setShowCourseModal(false);
        }
      }
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error(error.response?.data?.message || 'Failed to save course');
    }
  };

  const handleAssignCourse = async () => {
    if (!assignStudentId || !assignCourseId) {
      toast.error('Please select both a student and a course');
      return;
    }

    try {
      setAssigning(true);
      const { data } = await axios.post(
        `${backendUrl}/api/admin/students/${assignStudentId}/enroll`,
        { courseId: assignCourseId },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success('Course assigned to student successfully!');
        setAssignStudentId('');
        setAssignCourseId('');
      }
    } catch (error) {
      console.error('Error assigning course:', error);
      toast.error(error.response?.data?.message || 'Failed to assign course');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div>
      {/* ── Course Management Card ── */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Course Management</span>
          <button className="btn btn-primary cursor-pointer" onClick={openAddCourseModal}>
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
              <th>CREDITS</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Loading courses...</td>
              </tr>
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No courses found.</td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr key={course._id}>
                  <td>{course.code}</td>
                  <td>{course.name}</td>
                  <td>{course.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : 'Unassigned'}</td>
                  <td>{course.credits}</td>
                  <td>
                    <span className={`badge ${course.status === 'Active' ? 'badge-green' : 'badge-amber'}`}>
                      {course.status}
                    </span>
                  </td>
                  <td className='flex gap-2 items-center'>
                    <button className="btn btn-sm cursor-pointer" onClick={() => openEditCourseModal(course)}>
                      <Edit className='w-4 h-4 text-blue-500' />
                    </button>
                  </td>
                </tr>
              ))
            )}
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
            <select
              className="cursor-pointer"
              value={assignStudentId}
              onChange={(e) => setAssignStudentId(e.target.value)}
            >
              <option value="">-- Select a student --</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.studentId} — {s.firstName} {s.lastName}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Select Course</label>
            <select
              className="cursor-pointer"
              value={assignCourseId}
              onChange={(e) => setAssignCourseId(e.target.value)}
            >
              <option value="">-- Select a course --</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <button
            className="btn btn-primary cursor-pointer"
            onClick={handleAssignCourse}
            disabled={assigning}
          >
            <i className="ti ti-link"></i>{assigning ? 'Assigning...' : 'Assign Course'}
          </button>
        </div>
      </div>

      {/* ── Modal Overlay for Add / Edit Course ── */}
      {showCourseModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', margin: '20px', position: 'relative' }}>
            <div className="card-header">
              <span className="card-title">{isEditingCourse ? 'Edit Course' : 'New Course'}</span>
              <button
                className="btn btn-sm cursor-pointer"
                style={{ border: 'none', background: 'transparent' }}
                onClick={() => setShowCourseModal(false)}
              >
                <i className="ti ti-x" style={{ fontSize: '18px' }}></i>
              </button>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Course Code</label>
                <input type="text" name="code" value={courseForm.code} onChange={handleCourseInputChange} placeholder="CS301" />
              </div>
              <div className="form-group">
                <label>Course Name</label>
                <input type="text" name="name" value={courseForm.name} onChange={handleCourseInputChange} placeholder="Software Engineering" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Assigned Teacher</label>
                <select name="teacher" value={courseForm.teacher} onChange={handleCourseInputChange}>
                  <option value="">Unassigned</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.firstName} {t.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Credits</label>
                <input type="number" name="credits" min="1" max="6" value={courseForm.credits} onChange={handleCourseInputChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Department</label>
                <input type="text" name="department" value={courseForm.department} onChange={handleCourseInputChange} placeholder="CS" />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={courseForm.status} onChange={handleCourseInputChange}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button className="btn btn-primary cursor-pointer" onClick={handleSaveCourse}>
                <i className="ti ti-device-floppy"></i>{isEditingCourse ? 'Update Course' : 'Save Course'}
              </button>
              <button className="btn cursor-pointer" onClick={() => setShowCourseModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
