export const SideBar = ({ role, activePage, showPage }) => {
    return (
    //   <!-- SIDEBAR -->
    <div className="sidebar">
        <div className="sidebar-logo">
        <div className="logo-mark"><i className="ti ti-school"></i>SMS Portal</div>
        <div className="logo-sub">Student Management System · USJ</div>
        </div>

    {/* <!-- Admin Nav --> */}
    { role === 'admin' && (
        <div id="nav-admin">
            <div className="nav-section">Main</div>
            <div className={`nav-item  ${(role === 'admin' && activePage === 'admin-dashboard') ? 'active' : ''} `} onClick={() => showPage('admin-dashboard')}>
                <i className="ti ti-layout-dashboard"></i> Dashboard
            </div>
            <div className={`nav-item  ${(role === 'admin' && activePage === 'admin-students') ? 'active' : ''} `} onClick={() => showPage('admin-students')}>
                <i className="ti ti-users"></i>Students
            </div>
            <div className={`nav-item  ${(role === 'admin' && activePage === 'admin-courses') ? 'active' : ''} `} onClick={() => showPage('admin-courses')}>
                <i className="ti ti-book"></i>Courses
            </div>
            <div className="nav-section">Management</div>
            <div className={`nav-item  ${(role === 'admin' && activePage === 'admin-attendance') ? 'active' : ''} `} onClick={() => showPage('admin-attendance')}>
                <i className="ti ti-calendar-check"></i>Attendance
            </div>
            <div className={`nav-item  ${(role === 'admin' && activePage === 'admin-grades') ? 'active' : ''} `} onClick={() => showPage('admin-grades')}>
                <i className="ti ti-report-analytics"></i>Grades
            </div>
            <div className={`nav-item  ${(role === 'admin' && activePage === 'admin-reports') ? 'active' : ''} `} onClick={() => showPage('admin-reports')}>
                <i className="ti ti-file-export"></i>Reports
            </div>
            <div className="nav-section">AI</div>
            <div className={`nav-item ai-nav-item ${activePage === 'ai-assistant' ? 'active' : ''}`} onClick={() => showPage('ai-assistant')}>
                <i className="ti ti-robot"></i>AI Assistant<span className="ai-badge">NEW</span>
            </div>
        </div>
    )}
    {/* <!-- Teacher Nav --> */}
    {
        role === 'teacher' && (
        <div id="nav-teacher">
            <div className="nav-section">My classNamees</div>
            <div className={`nav-item  ${(role === 'teacher' && activePage === 'teacher-dashboard') ? 'active' : ''} `} onClick={() => showPage('teacher-dashboard')}>
                <i className="ti ti-layout-dashboard"></i>Dashboard
            </div>
            <div className={`nav-item  ${(role === 'teacher' && activePage === 'teacher-attendance') ? 'active' : ''} `} onClick={() => showPage('teacher-attendance')}>
                <i className="ti ti-calendar-check"></i>Mark Attendance
            </div>
            <div className={`nav-item  ${(role === 'teacher' && activePage === 'teacher-grades') ? 'active' : ''} `} onClick={() => showPage('teacher-grades')}>
                <i className="ti ti-pencil"></i>Enter Grades
            </div>
            <div className={`nav-item  ${(role === 'teacher' && activePage === 'teacher-schedule') ? 'active' : ''} `} onClick={() => showPage('teacher-schedule')}>
                <i className="ti ti-clock"></i>My Schedule
            </div>
            <div className="nav-section">AI</div>
            <div className={`nav-item ai-nav-item ${activePage === 'ai-assistant' ? 'active' : ''}`} onClick={() => showPage('ai-assistant')}>
                <i className="ti ti-robot"></i>AI Assistant<span className="ai-badge">NEW</span>
            </div>
        </div>
        )
    }
        
    {/* <!-- Student Nav --> */}
    {
        role === 'student' && (
        <div id="nav-student" >
            <div className="nav-section">My Portal</div>
            <div className={`nav-item  ${(role === 'student' && activePage === 'student-dashboard') ? 'active' : ''} `} onClick={() => showPage('student-dashboard')}>
                <i className="ti ti-layout-dashboard"></i>Dashboard
            </div>
            <div className={`nav-item  ${(role === 'student' && activePage === 'student-attendance') ? 'active' : ''} `} onClick={() => showPage('student-attendance')}>
                <i className="ti ti-calendar"></i>My Attendance
            </div>
            <div className={`nav-item  ${(role === 'student' && activePage === 'student-grades') ? 'active' : ''} `} onClick={() => showPage('student-grades')}>
                <i className="ti ti-chart-bar"></i>My Grades
            </div>
            <div className={`nav-item  ${(role === 'student' && activePage === 'student-schedule') ? 'active' : ''} `} onClick={() => showPage('student-schedule')}>
                <i className="ti ti-clock"></i>Schedule
            </div>
            <div className="nav-section">AI</div>
            <div className={`nav-item ai-nav-item ${activePage === 'ai-assistant' ? 'active' : ''}`} onClick={() => showPage('ai-assistant')}>
                <i className="ti ti-robot"></i>AI Assistant<span className="ai-badge">NEW</span>
            </div>
        </div>
        )
    }
        
            <div className="sidebar-bottom">
            <div className="user-chip">
                <div className="avatar" id="user-avatar">{role === 'admin' ? 'AD' : role === 'teacher' ? 'TE' : 'ST'}</div>
                <div>
                <div className="user-name" id="user-name">{role === 'admin' ? 'Admin User' : role === 'teacher' ? 'Teacher User' : 'Student User'}</div>
                <div className="user-role-label" id="user-role-label">{role === 'admin' ? 'Administrator' : role === 'teacher' ? 'Teacher' : 'Student'}</div>
                </div>
            </div>
        </div>
    </div>
    )};