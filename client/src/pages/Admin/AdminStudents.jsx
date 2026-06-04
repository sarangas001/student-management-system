import { useState, useEffect, useMemo } from 'react';

export const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    department: 'Computing',
    year: '1st Year',
    status: 'Active'
  });
  
  const [isEditing, setIsEditing] = useState(false);

  // Simulated backend API calls
  const fetchStudents = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 'FC222010', name: 'R.A.D.S. Methmini', department: 'SE', year: '1', email: 'methmini@usj.ac.lk', status: 'Active' },
          { id: 'FC222015', name: 'K.G.A.K. Sathsarani', department: 'SE', year: '1', email: 'sathsarani@usj.ac.lk', status: 'Active' },
          { id: 'FC222016', name: 'R.D.R.P. Ranasinghe', department: 'IS', year: '2', email: 'ranasinghe@usj.ac.lk', status: 'Active' },
          { id: 'FC222022', name: 'M.A. Samarakoon', department: 'CS', year: '1', email: 'samarakoon@usj.ac.lk', status: 'On Leave' },
          { id: 'FC222032', name: 'R.S. Daraniyagala', department: 'SE', year: '3', email: 'daraniyagala@usj.ac.lk', status: 'Active' },
          { id: 'FC222038', name: 'N.G.N.S. Niralgama', department: 'CS', year: '3', email: 'niralgama@usj.ac.lk', status: 'Active' },
          { id: 'FC222039', name: 'G.A.L.H. Seneviratne', department: 'CS', year: '2', email: 'seneviratne@usj.ac.lk', status: 'Active' }
        ]);
      }, 2000);
    });
  };

  const addStudentAPI = async (studentData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, data: studentData });
      }, 500);
    });
  };

  const updateStudentAPI = async (studentData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, data: studentData });
      }, 500);
    });
  };

  const deleteStudentAPI = async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, id });
      }, 500);
    });
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchStudents();
      setStudents(data);
      setLoading(false);
    };

    loadData();
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const departmentMatch = selectedDepartment === '' || student.department === selectedDepartment;
      const yearMatch = selectedYear === '' || student.year === selectedYear;
      return departmentMatch && yearMatch;
    });
  }, [students, selectedDepartment, selectedYear]);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({
      id: '',
      name: '',
      email: '',
      department: 'SE',
      year: '1st Year',
      status: 'Active'
    });
    setShowModal(true);
  };

  const handleEditStudent = (id) => {
    const studentToEdit = students.find(s => s.id === id);
    if (studentToEdit) {
      setIsEditing(true);
      setFormData(studentToEdit);
      setShowModal(true);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      await deleteStudentAPI(id);
      setStudents(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleSaveStudent = async () => {
    if (isEditing) {
      const result = await updateStudentAPI(formData);
      if (result.success) {
        setStudents(prev => prev.map(s => s.id === formData.id ? formData : s));
      }
    } else {
      const result = await addStudentAPI(formData);
      if (result.success) {
        setStudents(prev => [...prev, formData]);
      }
    }
    setShowModal(false);
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
          <input type="text" placeholder="Search by name or student ID..." />
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
                    <td>{student.year}</td>
                  <td>{student.email}</td>
                  <td>
                    <span className={`badge ${student.status === 'Active' ? 'badge-green' : 'badge-amber'}`}>
                      {student.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm cursor-pointer" onClick={() => handleEditStudent(student.id)}>
                      Edit
                    </button>
                    <button className="btn btn-sm cursor-pointer" onClick={() => handleDeleteStudent(student.id)}>
                      Delete
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
