
import AdminDashboard from './pages/Admin/AdminDashboard'
import { TopBar } from './components/TopBar'
import { SideBar } from './components/SideBar'
import { AdminStudents } from './pages/Admin/AdminStudents'
import { AdminCourses } from './pages/Admin/AdminCourses'
import { AdminAttendance } from './pages/Admin/AdminAttendance'
import AdminGrades from './pages/Admin/AdminGrades'
import AdminReports from './pages/Admin/AdminReports'
import TeacherDashboard from './pages/Teacher/TeacherDashboard'
import TeacherAttendance from './pages/Teacher/TeacherAttendance'
import TeacherGrades from './pages/Teacher/TeacherGrades'
import TeacherSchedule from './pages/Teacher/TeacherSchedule'
import StudentDashboard from './pages/student/StudentDashboard'
import StudentAttendance from './pages/student/StudentAttendance'
import StudentGrades from './pages/student/StudentGrades'
import StudentSchedule from './pages/student/StudentSchedule'
import { Bot } from 'lucide-react'
import AIFloatingPanel from './components/AIFloatingPanel'
import AIAssistant from './pages/AIAssistant'
import { useState } from 'react'
import Login from './pages/Login'
import { useAppContext } from './context/useAppContext'

function App() {
    const { isLoggedIn, role} = useAppContext();
    const [activePage, setActivePage] = useState(role ? `${role}-dashboard` : 'null-dashboard');
    const [prevRole, setPrevRole] = useState(role);
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    if (role !== prevRole) {
        setPrevRole(role);
        if (role && activePage === 'null-dashboard') {
            setActivePage(`${role}-dashboard`);
        }
    }

    const showPage = (page) => {
        setActivePage(page);
        // Close floating panel when navigating to the full AI page
        if (page === 'ai-assistant') setIsPanelOpen(false);
    }

    const togglePanel = () => {
        // If on the full AI page, navigate away to home instead of showing mini panel
        if (activePage === 'ai-assistant') {
            setActivePage(`${role}-dashboard`);
            return;
        }
        setIsPanelOpen(prev => !prev);
    };

  if (!isLoggedIn) {
    return <Login />
  }

  

  return (
    <>
      <div className="layout">
        <SideBar role={role} activePage={activePage} showPage={(data) => showPage(data)} />
        <div className="main">
          <TopBar role={role} pageTitle={activePage.split('-').map(s => s[0].toUpperCase() + s.slice(1)).join(' ')} />
          
          <div className="content-area">
            {/* Admin Pages */}
            {role === 'admin' && activePage === 'admin-dashboard' && <AdminDashboard />}
            {role === 'admin' && activePage === 'admin-students' && <AdminStudents />}
            {role === 'admin' && activePage === 'admin-courses' && <AdminCourses />}
            {role === 'admin' && activePage === 'admin-attendance' && <AdminAttendance />}
            {role === 'admin' && activePage === 'admin-grades' && <AdminGrades />}
            {role === 'admin' && activePage === 'admin-reports' && <AdminReports />}

            {/* Teacher Pages */}
            {role === 'teacher' && activePage === 'teacher-dashboard' && <TeacherDashboard />}
            {role === 'teacher' && activePage === 'teacher-attendance' && <TeacherAttendance />}
            {role === 'teacher' && activePage === 'teacher-grades' && <TeacherGrades />}
            {role === 'teacher' && activePage === 'teacher-schedule' && <TeacherSchedule />}

            {/* Student Pages */}
            {role === 'student' && activePage === 'student-dashboard' && <StudentDashboard />}
            {role === 'student' && activePage === 'student-attendance' && <StudentAttendance />}
            {role === 'student' && activePage === 'student-grades' && <StudentGrades />}
            {role === 'student' && activePage === 'student-schedule' && <StudentSchedule />}

            {activePage === 'ai-assistant' && <AIAssistant role={role} />}
          </div>
        </div>
      </div >

      {/* Floating AI FAB button */}
      <button
        id="ai-fab"
        title={isPanelOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
        onClick={togglePanel}
        style={{ transition: 'transform .2s', transform: isPanelOpen ? 'rotate(15deg)' : 'none' }}
      >
        <Bot />
      </button>

      {/* Floating AI mini panel */}
      <AIFloatingPanel
        role={role}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />

    </>
    
  )
}

export default App
