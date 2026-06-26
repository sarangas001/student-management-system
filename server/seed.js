const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Student = require('./module/studentModel');
const Course = require('./module/courseModel');
const Attendance = require('./module/attendanceModel');

const MONGO_URI = process.env.MONGO_URI;

console.log('Using MongoDB URI:', MONGO_URI);

const seed = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error('MONGO_URI is not defined in the env file');
    }

    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully.');

    // Clear old data for these test entries
    const testEmail = 'sathsarani@gmail.com';
    const testStudentId = 'FC222016';
    await Student.deleteOne({ email: testEmail });
    await Student.deleteOne({ studentId: testStudentId });

    // Seed Courses
    const coursesToSeed = [
      { code: 'CS301', name: 'Software Engineering', department: 'Computing', credits: 3 },
      { code: 'CS302', name: 'Data Structure', department: 'Computing', credits: 3 },
      { code: 'MA201', name: 'Mathematics II', department: 'Computing', credits: 3 },
      { code: 'EN102', name: 'Technical English', department: 'Computing', credits: 2 }
    ];

    const seededCourses = [];
    for (const c of coursesToSeed) {
      let course = await Course.findOne({ code: c.code });
      if (course) {
        // Update it
        course.name = c.name;
        course.department = c.department;
        course.credits = c.credits;
        await course.save();
      } else {
        course = new Course(c);
        await course.save();
      }
      seededCourses.push(course);
    }
    console.log('Seeded courses.');

    // Seed Student
    const hashedPassword = await bcrypt.hash('password123', 10);
    const student = new Student({
      studentId: testStudentId,
      firstName: 'Sathsarani',
      lastName: 'Rupasinghe',
      email: testEmail,
      password: hashedPassword,
      department: 'Computing',
      yearOfStudy: 2,
      enrolledCourses: seededCourses.map(c => c._id)
    });
    const savedStudent = await student.save();
    console.log('Seeded Student Sathsarani:', savedStudent._id);

    // Clear previous attendance for this student
    await Attendance.deleteMany({ student: savedStudent._id });

    // Seed Attendance
    // CS301: 20 sessions (19 Present, 1 Absent) => 95%
    const cs301 = seededCourses.find(c => c.code === 'CS301');
    for (let i = 1; i <= 20; i++) {
      const attendance = new Attendance({
        course: cs301._id,
        student: savedStudent._id,
        date: new Date(2026, 5, i), // June 2026
        status: i === 20 ? 'Absent' : 'Present',
        markedBy: savedStudent._id, // Just reference student for mock marker
        markerModel: 'Admin'
      });
      await attendance.save();
    }

    // CS302: 20 sessions (17 Present, 2 Absent, 1 Late) => 90%
    const cs302 = seededCourses.find(c => c.code === 'CS302');
    for (let i = 1; i <= 20; i++) {
      let status = 'Present';
      if (i === 19 || i === 20) status = 'Absent';
      else if (i === 18) status = 'Late';

      const attendance = new Attendance({
        course: cs302._id,
        student: savedStudent._id,
        date: new Date(2026, 5, i),
        status: status,
        markedBy: savedStudent._id,
        markerModel: 'Admin'
      });
      await attendance.save();
    }

    // MA201: 20 sessions (13 Present, 6 Absent, 1 Late) => 70%
    const ma201 = seededCourses.find(c => c.code === 'MA201');
    for (let i = 1; i <= 20; i++) {
      let status = 'Present';
      if (i >= 15) status = 'Absent'; // 6 Absents
      else if (i === 14) status = 'Late';

      const attendance = new Attendance({
        course: ma201._id,
        student: savedStudent._id,
        date: new Date(2026, 5, i),
        status: status,
        markedBy: savedStudent._id,
        markerModel: 'Admin'
      });
      await attendance.save();
    }

    // EN102: 20 sessions (18 Present, 2 Absent) => 90%
    const en102 = seededCourses.find(c => c.code === 'EN102');
    for (let i = 1; i <= 20; i++) {
      const attendance = new Attendance({
        course: en102._id,
        student: savedStudent._id,
        date: new Date(2026, 5, i),
        status: i >= 19 ? 'Absent' : 'Present',
        markedBy: savedStudent._id,
        markerModel: 'Admin'
      });
      await attendance.save();
    }

    console.log('Seeded Attendance logs successfully.');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

seed();
