# Backend Development & API Integration

## Overview

References:

* `/docs/CLIENT_FUNCTION.md`
* `/docs/MODEL.md`

Technology Stack:

* Node.js
* Express.js
* MongoDB
* Mongoose

Architecture:

```text
Routes
  ↓
Controllers
  ↓
Services
  ↓
Models
  ↓
MongoDB
```

---

# Team Task Allocation

## Ravindu - AI Assistant Module

### Functions

* `sendChatMessage(userId, message)`
* `getChatHistory(userId)`

### Route

```text
/api/ai-assistant
```

### Models

* AIAssistant

---

## Rukshan - Admin Attendance Module

### Functions

* `getCourses()`
* `getAttendanceSummary(year, month)`
* `getStudentsByCourse(courseId)`
* `getAttendanceByDate(courseId, date)`
* `saveAttendance(courseId, date, attendanceData)`

### Route

```text
/api/admin/attendance
```

### Models

* Course
* Student
* Attendance

---

## Rashmi - Admin Courses & Dashboard Module

### Functions

#### Admin Courses

* `getAllCourses()`
* `createCourse(courseData)`
* `updateCourse(courseId, courseData)`
* `deleteCourse(courseId)`

#### Admin Dashboard

* `getDashboardStats()`

### Routes

```text
/api/admin/courses
/api/admin/dashboard
```

### Models

* Course
* Student
* Teacher
* Attendance

---

## Lisara - Admin Grades & Reports Module

### Functions

#### Admin Dashboard

* `getRecentActivities()`

#### Admin Grades

* `getGradesByCourseAndAssessment(courseId, assessmentType)`
* `updateStudentGrade(studentId, courseId, assessmentType, score)`

#### Admin Reports

* `generateReport(reportType, department)`
* `exportReport(reportType, format)`

### Routes

```text
/api/admin/grades
/api/admin/reports
/api/admin/dashboard
```

### Models

* Grade
* Student
* Course
* Attendance

---

## Kavindya - Admin Students Module

### Functions

* `getAllStudents(department, year, searchQuery)`
* `getStudentById(studentId)`
* `createStudent(studentData)`
* `updateStudent(studentId, studentData)`
* `deleteStudent(studentId)`

### Route

```text
/api/admin/students
```

### Models

* Student

---

## Niluni - Student Module

### Functions

#### Student Attendance

* `getStudentAttendanceSummary(studentId)`
* `getStudentAttendanceDetails(studentId, courseId)`

#### Student Dashboard

* `getStudentDashboardStats(studentId)`
* `getUpcomingClasses(studentId)`

#### Student Grades

* `getStudentGrades(studentId)`

### Routes

```text
/api/student/attendance
/api/student/dashboard
/api/student/grades
```

### Models

* Student
* Attendance
* Grade
* Course

---

## Radsminduwari - Student & Teacher Module

### Functions

#### Student Grades

* `getStudentCGPA(studentId)`

#### Student Schedule

* `getStudentSchedule(studentId)`

#### Teacher Attendance

* `getTeacherCourses(teacherId)`
* `getClassRoster(courseId)`
* `submitAttendance(courseId, date, attendanceData)`

### Routes

```text
/api/student/grades
/api/student/schedule
/api/teacher/attendance
```

### Models

* Student
* Course
* Attendance
* Grade
* Teacher

---

## Saranga - Teacher Dashboard, Grades & Schedule Module

### Functions

#### Teacher Dashboard

* `getTeacherDashboardStats(teacherId)`
* `getTodayClasses(teacherId)`

#### Teacher Grades

* `getTeacherCourses(teacherId)`
* `getStudentsForGrading(courseId)`
* `submitGrades(courseId, assessmentType, gradesData, remarks)`
* `publishGrades(courseId, assessmentType)`

#### Teacher Schedule

* `getTeacherSchedule(teacherId)`

### Routes

```text
/api/teacher/dashboard
/api/teacher/grades
/api/teacher/schedule
```

### Models

* Teacher
* Course
* Grade
* Student

---

# Backend Development Flow

For every assigned function:

## 1. Create Route

Example:

```javascript
app.use("/api/admin/courses", require("./routes/adminCourses.routes"));
```

---

## 2. Create Router

Example:

```text
routes/adminCourses.routes.js
```

Responsibilities:

* Define API endpoints
* Validate route parameters
* Call controller methods

---

## 3. Create Controller

Example:

```text
controllers/adminCourses.controller.js
```

Responsibilities:

* Handle requests
* Handle responses
* Error handling
* Call service methods

---

## 4. Create Service Layer

Example:

```text
services/adminCourses.service.js
```

Responsibilities:

* Business logic
* Database queries
* Data processing

---

## 5. Use Models

Example:

```text
models/Course.js
models/Student.js
models/Teacher.js
```

Responsibilities:

* MongoDB interaction
* Mongoose schema handling

---

# Branch Naming Convention

Create a separate branch for your assigned task.

Examples:

```bash
feature/admin-attendance
feature/admin-courses
feature/admin-students
feature/student-dashboard
feature/teacher-grades
feature/ai-assistant
```

---

# Commit Message Convention

Examples:

```bash
feat: add getAllCourses endpoint
feat: implement attendance summary API
feat: add student dashboard statistics
fix: attendance filtering issue
refactor: move grade logic to service layer
```

---

# Pull Request Requirements

Before submitting:

* Route created
* Controller created
* Service created
* Database queries completed
* API tested using Postman
* Proper error handling added
* Code pushed to feature branch

PR Description must include:

* Assigned module
* Implemented functions
* API endpoints
* Related CLIENT_FUNCTION.md reference

---

# Deadline

📅 Deadline: 26.06.2026

Please complete implementation, testing, and PR submission before the deadline.
