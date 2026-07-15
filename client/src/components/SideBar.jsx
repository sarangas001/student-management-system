import { BookOpenCheck, Bot, CalendarCheck, ChartBar, Clock, File, LayoutDashboard, Pencil, User2 } from "lucide-react";

export const SideBar = ({ role, user, activePage, showPage }) => {
    const fullName = user ? `${user.firstName} ${user.lastName}` : (
        role === 'admin' ? 'Admin User' : role === 'teacher' ? 'Teacher User' : 'Student User'
    );
    const initials = user
        ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
        : (role === 'admin' ? 'AD' : role === 'teacher' ? 'TE' : 'ST');

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
                <LayoutDashboard className="w-4 h-4"/> Dashboard
            </div>
            <div className={`nav-item  ${(role === 'admin' && activePage === 'admin-students') ? 'active' : ''} `} onClick={() => showPage('admin-students')}>
                <User2 className="w-4 h-4" /> Students
            </div>
            <div className={`nav-item  ${(role === 'admin' && activePage === 'admin-courses') ? 'active' : ''} `} onClick={() => showPage('admin-courses')}>
                <BookOpenCheck className="w-4 h-4" /> Courses
            </div>
            <div className="nav-section">Management</div>
            <div className={`nav-item  ${(role === 'admin' && activePage === 'admin-attendance') ? 'active' : ''} `} onClick={() => showPage('admin-attendance')}>
                <CalendarCheck className="w-4 h-4" /> Attendance
            </div>
            <div className={`nav-item  ${(role === 'admin' && activePage === 'admin-grades') ? 'active' : ''} `} onClick={() => showPage('admin-grades')}>
                <ChartBar className="w-4 h-4" /> Grades
            </div>
            <div className={`nav-item  ${(role === 'admin' && activePage === 'admin-reports') ? 'active' : ''} `} onClick={() => showPage('admin-reports')}>
                <File className="w-4 h-4" />Reports
            </div>
            <div className="nav-section">AI</div>
            <div className={`nav-item ai-nav-item ${activePage === 'ai-assistant' ? 'active' : ''}`} onClick={() => showPage('ai-assistant')}>
                <Bot className="w-4 h-4" />AI Assistant<span className="ai-badge">NEW</span>
            </div>
        </div>
    )}
    {/* <!-- Teacher Nav --> */}
    {
        role === 'teacher' && (
        <div id="nav-teacher">
            <div className="nav-section">My classNamees</div>
            <div className={`nav-item  ${(role === 'teacher' && activePage === 'teacher-dashboard') ? 'active' : ''} `} onClick={() => showPage('teacher-dashboard')}>
                <LayoutDashboard className="w-4 h-4" />Dashboard
            </div>
            <div className={`nav-item  ${(role === 'teacher' && activePage === 'teacher-attendance') ? 'active' : ''} `} onClick={() => showPage('teacher-attendance')}>
                <CalendarCheck className="w-4 h-4" />Mark Attendance
            </div>
            <div className={`nav-item  ${(role === 'teacher' && activePage === 'teacher-grades') ? 'active' : ''} `} onClick={() => showPage('teacher-grades')}>
                <Pencil className="w-4 h-4" />Enter Grades
            </div>
            <div className={`nav-item  ${(role === 'teacher' && activePage === 'teacher-schedule') ? 'active' : ''} `} onClick={() => showPage('teacher-schedule')}>
                <Clock className="w-4 h-4" />My Schedule
            </div>
            <div className="nav-section">AI</div>
            <div className={`nav-item ai-nav-item ${activePage === 'ai-assistant' ? 'active' : ''}`} onClick={() => showPage('ai-assistant')}>
                <Bot className="w-4 h-4" />AI Assistant<span className="ai-badge">NEW</span>
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
                <LayoutDashboard className="w-4 h-4" /> Dashboard
            </div>
            <div className={`nav-item  ${(role === 'student' && activePage === 'student-attendance') ? 'active' : ''} `} onClick={() => showPage('student-attendance')}>
                <CalendarCheck className="w-4 h-4" /> My Attendance
            </div>
            <div className={`nav-item  ${(role === 'student' && activePage === 'student-grades') ? 'active' : ''} `} onClick={() => showPage('student-grades')}>
                <ChartBar className="w-4 h-4" /> My Grades
            </div>
            <div className={`nav-item  ${(role === 'student' && activePage === 'student-schedule') ? 'active' : ''} `} onClick={() => showPage('student-schedule')}>
                <Clock className="w-4 h-4" /> Schedule
            </div>
            <div className="nav-section">AI</div>
            <div className={`nav-item ai-nav-item ${activePage === 'ai-assistant' ? 'active' : ''}`} onClick={() => showPage('ai-assistant')}>
               <Bot className="w-4 h-4" />AI Assistant<span className="ai-badge">NEW</span>
            </div>
        </div>
        )
    }
        
            <div className="sidebar-bottom">
            <div className="user-chip">
                <div className="avatar" id="user-avatar">{initials}</div>
                <div>
                <div className="user-name" id="user-name">{fullName}</div>
                <div className="user-role-label" id="user-role-label">{role === 'admin' ? 'Administrator' : role === 'teacher' ? 'Teacher' : 'Student'}</div>
                </div>
            </div>
        </div>
    </div>
    )};