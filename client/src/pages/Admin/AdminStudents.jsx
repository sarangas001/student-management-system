import { Edit, Trash2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../context/useAppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

export const AdminStudents = () => {
  const { backendUrl } = useAppContext();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    _id: '',
    id: '',
    name: '',
    email: '',
    department: 'SE',
    year: '1',
    status: 'Active',
    password: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);

  // API calls using axios and backendUrl
  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/admin/students`, {
        withCredentials: true
      });
      if (response.data && response.data.success) {
        return response.data.data.map(student => ({
          _id: student._id,
          id: student.studentId,
          name: `${student.firstName} ${student.lastName}`,
          email: student.email,
          department: student.department,
          year: student.yearOfStudy ? String(student.yearOfStudy) : '1',
          status: 'Active'
        }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching students:", error);
      return [];
    }
  };

  const addStudentAPI = async (studentData) => {
    try {
      const nameParts = studentData.name.trim().split(' ');
      const firstName = nameParts[0] || 'Student';
      const lastName = nameParts.slice(1).join(' ') || 'Name';

      const payload = {
        studentId: studentData.id,
        firstName,
        lastName,
        email: studentData.email,
        password: studentData.password || 'tempPassword123',
        department: studentData.department,
        yearOfStudy: Number(studentData.year)
      };

      const response = await axios.post(`${backendUrl}/api/admin/students`, payload, {
        withCredentials: true
      });

      if (response.data && response.data.success) {
        const newStudent = response.data.data;
        return {
          success: true,
          data: {
            _id: newStudent._id,
            id: newStudent.studentId,
            name: `${newStudent.firstName} ${newStudent.lastName}`,
            email: newStudent.email,
            department: newStudent.department,
            year: newStudent.yearOfStudy ? String(newStudent.yearOfStudy) : '1',
            status: 'Active'
          }
        };
      }
      return { success: false };
    } catch (error) {
      console.error("Error adding student:", error);
      toast.error(error.response?.data?.message || "Failed to add student");
      return { success: false };
    }
  };

  const updateStudentAPI = async (studentData) => {
    try {
      const nameParts = studentData.name.trim().split(' ');
      const firstName = nameParts[0] || 'Student';
      const lastName = nameParts.slice(1).join(' ') || 'Name';

      const payload = {
        studentId: studentData.id,
        firstName,
        lastName,
        email: studentData.email,
        department: studentData.department,
        yearOfStudy: Number(studentData.year)
      };

      const response = await axios.put(`${backendUrl}/api/admin/students/${studentData._id}`, payload, {
        withCredentials: true
      });

      if (response.data && response.data.success) {
        const updatedStudent = response.data.data;
        return {
          success: true,
          data: {
            _id: updatedStudent._id,
            id: updatedStudent.studentId,
            name: `${updatedStudent.firstName} ${updatedStudent.lastName}`,
            email: updatedStudent.email,
            department: updatedStudent.department,
            year: updatedStudent.yearOfStudy ? String(updatedStudent.yearOfStudy) : '1',
            status: 'Active'
          }
        };
      }
      return { success: false };
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error(error.response?.data?.message || "Failed to update student");
      return { success: false };
    }
  };

  const deleteStudentAPI = async (dbId) => {
    try {
      const response = await axios.delete(`${backendUrl}/api/admin/students/${dbId}`, {
        withCredentials: true
      });
      return { success: response.data && response.data.success };
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error(error.response?.data?.message || "Failed to delete student");
      return { success: false };
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchStudents();
      setStudents(data);
      setLoading(false);
    };

    if (backendUrl) {
      loadData();
    }
  }, [backendUrl]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const departmentMatch = selectedDepartment === '' || student.department === selectedDepartment;
      const yearMatch = selectedYear === '' || student.year === selectedYear;
      const searchMatch = !searchQuery || 
        student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.name.toLowerCase().includes(searchQuery.toLowerCase());
      return departmentMatch && yearMatch && searchMatch;
    });
  }, [students, selectedDepartment, selectedYear, searchQuery]);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({
      _id: '',
      id: '',
      name: '',
      email: '',
      department: 'SE',
      year: '1',
      status: 'Active',
      password: ''
    });
    setShowModal(true);
  };

  const handleEditStudent = (id) => {
    const studentToEdit = students.find(s => s.id === id);
    if (studentToEdit) {
      setIsEditing(true);
      setFormData({
        ...studentToEdit,
        password: ''
      });
      setShowModal(true);
    }
  };

  const handleDeleteStudent = async (student) => {
    if (window.confirm(`Are you sure you want to delete student ${student.name}?`)) {
      const result = await deleteStudentAPI(student._id);
      if (result.success) {
        setStudents(prev => prev.filter(s => s.id !== student.id));
        toast.success(`Student ${student.name} deleted successfully!`);
      }
    }
  };

  const handleSaveStudent = async () => {
    if (isEditing) {
      const result = await updateStudentAPI(formData);
      if (result.success) {
        setStudents(prev => prev.map(s => s.id === formData.id ? result.data : s));
        setShowModal(false);
        toast.success("Student updated successfully!");
      }
    } else {
      const result = await addStudentAPI(formData);
      if (result.success) {
        setStudents(prev => [...prev, result.data]);
        setShowModal(false);
        toast.success("Student added successfully!");
      }
    }
  };

  return (
    <div>

      {/* ── Student Records Card ── */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Student Records</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn">
              <i className="ti ti-filter"></i>Filter
            </button>
            <button className="btn btn-primary cursor-pointer" onClick={openAddModal}>
              <i className="ti ti-plus"></i>Add Student
            </button>
          </div>
        </div>

        {/* Search / Filter Bar */}
        <div className="search-wrap">
          <input type="text" placeholder="Search by name or student ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <select className='cursor-pointer' value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
            <option value="">All Departments</option>
            <option value="CS">CS</option>
            <option value="SE">SE</option>
            <option value="IS">IS</option>
          </select>
          <select className='cursor-pointer' value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
            <option value="">All Years</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
          </select>
        </div>

        {/* Students Table */}
        <table>
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Full Name</th>
              <th>Department</th>
              <th>Year</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>Loading students...</td>
              </tr>
            ) : (
              filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No students found.</td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>{student.id}</td>
                    <td>{student.name}</td>
                    <td>{student.department}</td>
                    <td>{student.year === '1' ? '1st Year' : student.year === '2' ? '2nd Year' : student.year === '3' ? '3rd Year' : `${student.year}th Year`}</td>
                    <td>{student.email}</td>
                    <td>
                      <span className={`badge ${student.status === 'Active' ? 'badge-green' : 'badge-amber'}`}>
                        {student.status}
                      </span>
                    </td>
                    <td className='flex gap-2 items-center'>
                      <button className="btn btn-sm cursor-pointer" onClick={() => handleEditStudent(student.id)}>
                        <Edit className='w-4 h-4 text-blue-500' />
                      </button>
                      <button className="btn btn-sm cursor-pointer" onClick={() => handleDeleteStudent(student)}>
                        <Trash2 className='w-4 h-4 text-red-500' />
                      </button>
                    </td>
                  </tr>
                ))
              )
            )}
          </tbody>
        </table>
      </div>

      {/* ── Modal Overlay for Add / Edit Student ── */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          {/* ── Add / Edit Student Card (as Modal Content) ── */}
          <div className="card" style={{ width: '100%', maxWidth: '600px', margin: '20px', position: 'relative' }}>
            <div className="card-header">
              <span className="card-title">{isEditing ? 'Edit Student' : 'Add Student'}</span>
              <button 
                className="btn btn-sm cursor-pointer" 
                style={{ border: 'none', background: 'transparent' }} 
                onClick={() => setShowModal(false)}
              >
                <i className="ti ti-x" style={{ fontSize: '18px' }}></i>
              </button>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Student ID</label>
                <input type="text" name="id" value={formData.id} onChange={handleInputChange} placeholder="FC222xxx" disabled={isEditing} />
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Full name" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input type="text" name="email" value={formData.email} onChange={handleInputChange} placeholder="student@usj.ac.lk" />
              </div>
              <div className="form-group">
                <label>Department</label>
                <select name="department" value={formData.department} onChange={handleInputChange}>
                  <option value="CS">CS</option>
                  <option value="SE">SE</option>
                  <option value="IS">IS</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Academic Year</label>
                <select name="year" value={formData.year} onChange={handleInputChange}>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="Active">Active</option>
                </select>
              </div>
            </div>

            {!isEditing && (
              <div className="form-row">
                <div className="form-group" style={{ width: '100%' }}>
                  <label>Password</label>
                  <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Enter password" />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button className="btn btn-primary cursor-pointer" onClick={handleSaveStudent}>
                <i className="ti ti-device-floppy"></i>{isEditing ? 'Update Student' : 'Save Student'}
              </button>
              <button className="btn cursor-pointer" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
