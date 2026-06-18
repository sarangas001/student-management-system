# Database Data Models (Modules) Overview

Based on the frontend components and the `CLIENT_FUNCTION.md` requirements, the MongoDB database requires the following core collections (modules). The schemas outline the necessary fields to support the client application's functionality.

## 1. Student Model
This module will store the profile and academic details of the students.
* **`studentId`** (String): Unique identifier (e.g., "FC222038").
* **`firstName`** (String): Student's first name.
* **`lastName`** (String): Student's last name.
* **`email`** (String): Contact email (often used for login).
* **`password`** (String): Hashed password for authentication.
* **`department`** (String): The department they belong to (e.g., "Computer Science").
* **`yearOfStudy`** (Number): Current year of study (1, 2, 3, 4).
* **`enrolledCourses`** (Array of ObjectIds): References to the `Course` module.

## 2. Teacher Model
This module will store the profile details of the teaching staff.
* **`teacherId`** (String): Unique identifier.
* **`firstName`** (String): Teacher's first name.
* **`lastName`** (String): Teacher's last name.
* **`email`** (String): Contact email.
* **`password`** (String): Hashed password.
* **`department`** (String): Department they teach in.
* **`assignedCourses`** (Array of ObjectIds): References to the `Course` module.

## 3. Admin Model
This module will store administrator accounts.
* **`adminId`** (String): Unique identifier.
* **`firstName`** (String): Admin's first name.
* **`lastName`** (String): Admin's last name.
* **`email`** (String): Contact email.
* **`password`** (String): Hashed password.

## 4. Course Model
This module represents the subjects or classes being taught.
* **`code`** (String): Course code (e.g., "CS301").
* **`name`** (String): Course name (e.g., "Software Engineering").
* **`teacher`** (ObjectId): Reference to the `Teacher` module.
* **`credits`** (Number): Credit value of the course.
* **`status`** (String): Current status (e.g., "Active", "Draft").
* **`department`** (String): Department offering the course.

## 5. Attendance Model
This module will track the daily attendance for courses.
* **`course`** (ObjectId): Reference to the `Course` module.
* **`student`** (ObjectId): Reference to the `Student` module.
* **`date`** (Date): The date of the class.
* **`status`** (String): Enum ("Present", "Absent", "Late", "Excused").
* **`markedBy`** (ObjectId): Reference to the `Teacher` or `Admin` who marked it.

## 6. Grade Model
This module will record student performance in various assessments.
* **`student`** (ObjectId): Reference to the `Student` module.
* **`course`** (ObjectId): Reference to the `Course` module.
* **`assessmentType`** (String): Enum ("Mid Exam", "Final Exam", "Assignment", "Quiz").
* **`marks`** (Number): The numerical score achieved (e.g., 85).
* **`grade`** (String): The letter grade (e.g., "A", "B+", "C").
* **`remark`** (String): Teacher's feedback (e.g., "Excellent", "Needs Improvement").
* **`published`** (Boolean): Whether the grade is visible to the student.

## 7. AIAssistant Model
This module will track the chat history for the AI Assistant feature.
* **`user`** (ObjectId): Reference to the user (Student/Teacher/Admin) interacting with the AI.
* **`userRole`** (String): The role of the user.
* **`messages`** (Array of Objects): 
  * `role` (String): "user" or "assistant".
  * `content` (String): The text content of the message.
  * `timestamp` (Date): When the message was sent.
* **`sessionStartedAt`** (Date): Timestamp of when the chat session started.
