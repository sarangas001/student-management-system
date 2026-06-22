
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
import { useEffect, useState } from 'react'
import Login from './pages/Login'
import { useAppContext } from './context/useAppContext'

function App() {
    const { isLoggedIn, role} = useAppContext();
    const [activePage, setActivePage] = useState(role ? `${role}-dashboard` : 'null-dashboard');

    useEffect(() => {
        if (role && activePage === 'null-dashboard') {
            setActivePage(`${role}-dashboard`);
        }
    }, [role, activePage]);

    const showPage = (page) => {
        setActivePage(page);
    }

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

      {/* <!-- Floating AI button --> */}
      <button id="ai-fab" title="AI Assistant"> <Bot />   </button>

      {/* <!-- Floating AI panel --> */}
      <AIFloatingPanel />

    </>
    
  )
}

export default App
