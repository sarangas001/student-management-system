# Client Functions Overview

Based on the structure and state variables found in the React components under `client/src/pages`, the following backend functions/endpoints will need to be implemented to support the frontend functionality.

## 1. Admin Attendance (`AdminAttendance`)
* **`getCourses()`**: Fetch a list of all courses available.
* **`getAttendanceSummary(year, month)`**: Fetch an aggregated summary of attendance for a given month/year.
* **`getStudentsByCourse(courseId)`**: Fetch the list of students enrolled in a specific course.
* **`getAttendanceByDate(courseId, date)`**: Fetch the attendance records for a specific class on a specific date.
* **`saveAttendance(courseId, date, attendanceData)`**: Bulk update or create attendance records for a course on a specific date.

## 2. Admin Courses (`AdminCourses`)
* **`getAllCourses()`**: Fetch the list of all courses.
* **`createCourse(courseData)`**: Add a new course to the system.
* **`updateCourse(courseId, courseData)`**: Modify an existing course's details.
* **`deleteCourse(courseId)`**: Remove a course from the system.

## 3. Admin Dashboard (`AdminDashboard`)
* **`getDashboardStats()`**: Fetch high-level metrics (e.g., total students, total teachers, total courses, average attendance).
* **`getRecentActivities()`**: Fetch a feed of recent system events or notifications.

## 4. Admin Grades (`AdminGrades`)
* **`getGradesByCourseAndAssessment(courseId, assessmentType)`**: Fetch grades for all students in a specific course for a given assessment (e.g., Mid Exam, Final Exam).
* **`updateStudentGrade(studentId, courseId, assessmentType, score)`**: Update the grade of a specific student.

## 5. Admin Reports (`AdminReports`)
* **`generateReport(reportType, department)`**: Fetch aggregated data based on report type (e.g., "Attendance Report", "Performance Report") filtered by department.
* **`exportReport(reportType, format)`**: Potentially generate a downloadable CSV or PDF report.

## 6. Admin Students (`AdminStudents`)
* **`getAllStudents(department, year, searchQuery)`**: Fetch students, supporting filtering and searching.
* **`getStudentById(studentId)`**: Fetch detailed profile information for a specific student.
* **`createStudent(studentData)`**: Register a new student into the system.
* **`updateStudent(studentId, studentData)`**: Modify a student's profile information.
* **`deleteStudent(studentId)`**: Remove a student from the system.

## 7. Student Attendance (`StudentAttendance`)
* **`getStudentAttendanceSummary(studentId)`**: Fetch overall attendance percentage and summary for the logged-in student.
* **`getStudentAttendanceDetails(studentId, courseId)`**: Fetch detailed day-by-day attendance records for a specific course.

## 8. Student Dashboard (`StudentDashboard`)
* **`getStudentDashboardStats(studentId)`**: Fetch overview metrics for the student (e.g., overall GPA, overall attendance, upcoming assignments).
* **`getUpcomingClasses(studentId)`**: Fetch today's or tomorrow's class schedule.

## 9. Student Grades (`StudentGrades`)
* **`getStudentGrades(studentId)`**: Fetch all grades and assessments across all enrolled courses for the logged-in student.
* **`getStudentCGPA(studentId)`**: Fetch calculated GPA/CGPA.

## 10. Student Schedule (`StudentSchedule`)
* **`getStudentSchedule(studentId)`**: Fetch the weekly class timetable for the logged-in student.

## 11. Teacher Attendance (`TeacherAttendance`)
* **`getTeacherCourses(teacherId)`**: Fetch the courses assigned to the logged-in teacher.
* **`getClassRoster(courseId)`**: Fetch the list of students for a specific course to mark attendance.
* **`submitAttendance(courseId, date, attendanceData)`**: Save the marked attendance for the day.

## 12. Teacher Dashboard (`TeacherDashboard`)
* **`getTeacherDashboardStats(teacherId)`**: Fetch overview metrics for the teacher (e.g., pending grades, today's classes).
* **`getTodayClasses(teacherId)`**: Fetch the teacher's schedule for the current day.

## 13. Teacher Grades (`TeacherGrades`)
* **`getTeacherCourses(teacherId)`**: Fetch the courses taught by the teacher.
* **`getStudentsForGrading(courseId)`**: Fetch the student list for a course to input grades.
* **`submitGrades(courseId, assessmentType, gradesData, remarks)`**: Save or update student scores and remarks.
* **`publishGrades(courseId, assessmentType)`**: Mark the grades as published so students can see them.

## 14. Teacher Schedule (`TeacherSchedule`)
* **`getTeacherSchedule(teacherId)`**: Fetch the weekly teaching timetable.

## 15. AI Assistant (`AIAssistant`)
* **`sendChatMessage(userId, message)`**: Send a prompt to the AI backend and receive a response.
* **`getChatHistory(userId)`**: Fetch previous conversation history for the user's AI session.
