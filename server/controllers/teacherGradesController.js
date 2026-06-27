const Teacher = require('../module/teacherModel');
const Course = require('../module/courseModel');
const Student = require('../module/studentModel');
const Grade = require('../module/gradeModel');

const getTeacherIdentifier = (req) => {
  return req.query.teacherId || req.params.teacherId || req.body?.teacherId;
};

const getTeacherContext = async (teacherId) => {
  const teacher = await Teacher.findOne({ teacherId }).lean();

  if (!teacher) {
    return null;
  }

  const assignedCourses = await Course.find({
    $or: [
      { teacher: teacher._id },
      { _id: { $in: teacher.assignedCourses || [] } },
    ],
  })
    .select('_id code name credits department status teacher')
    .lean();

  const courseIdSet = new Set(assignedCourses.map((course) => String(course._id)));

  return {
    teacher,
    courses: assignedCourses,
    courseIdSet,
  };
};

const getTeacherCourses = async (req, res) => {
  try {
    const teacherId = getTeacherIdentifier(req);

    if (!teacherId) {
      return res.status(400).json({ message: 'teacherId is required' });
    }

    const context = await getTeacherContext(teacherId);

    if (!context) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    return res.status(200).json({
      message: 'Teacher courses fetched successfully',
      teacher: {
        teacherId: context.teacher.teacherId,
        firstName: context.teacher.firstName,
        lastName: context.teacher.lastName,
        department: context.teacher.department,
      },
      courses: context.courses,
    });
  } catch (error) {
    console.error('Error fetching teacher courses:', error);
    return res.status(500).json({
      message: 'Failed to fetch teacher courses',
      error: error.message,
    });
  }
};

const getStudentsForGrading = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({ message: 'courseId is required' });
    }

    const course = await Course.findById(courseId).select('_id code name teacher department').lean();

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const students = await Student.find({ enrolledCourses: courseId })
      .select('_id studentId firstName lastName email department yearOfStudy')
      .lean();

    return res.status(200).json({
      message: 'Students for grading fetched successfully',
      course,
      students,
    });
  } catch (error) {
    console.error('Error fetching students for grading:', error);
    return res.status(500).json({
      message: 'Failed to fetch students for grading',
      error: error.message,
    });
  }
};

const buildRemarkForStudent = (remarks, studentId, index) => {
  if (Array.isArray(remarks)) {
    return remarks[index] ?? '';
  }

  if (remarks && typeof remarks === 'object') {
    return remarks[studentId] ?? remarks[String(studentId)] ?? '';
  }

  if (typeof remarks === 'string') {
    return remarks;
  }

  return '';
};

const submitGrades = async (req, res) => {
  try {
    const teacherId = getTeacherIdentifier(req);
    const { courseId, assessmentType, gradesData, remarks } = req.body;

    if (!teacherId) {
      return res.status(400).json({ message: 'teacherId is required' });
    }

    if (!courseId || !assessmentType || !Array.isArray(gradesData) || gradesData.length === 0) {
      return res.status(400).json({
        message: 'courseId, assessmentType, and gradesData are required',
      });
    }

    const context = await getTeacherContext(teacherId);

    if (!context) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    if (!context.courseIdSet.has(String(courseId))) {
      return res.status(403).json({
        message: 'You are not assigned to this course',
      });
    }

    const course = await Course.findById(courseId).select('_id code name').lean();
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const studentIds = gradesData.map((entry) => entry.studentId);
    const students = await Student.find({ _id: { $in: studentIds }, enrolledCourses: courseId })
      .select('_id studentId firstName lastName')
      .lean();

    const allowedStudentIds = new Set(students.map((student) => String(student._id)));
    const operations = [];

    gradesData.forEach((entry, index) => {
      const studentId = String(entry.studentId);

      if (!allowedStudentIds.has(studentId)) {
        return;
      }

      operations.push(
        Grade.findOneAndUpdate(
          {
            student: entry.studentId,
            course: courseId,
            assessmentType,
          },
          {
            student: entry.studentId,
            course: courseId,
            assessmentType,
            marks: entry.marks,
            grade: entry.grade,
            remark: entry.remark ?? buildRemarkForStudent(remarks, studentId, index),
            published: false,
          },
          {
            upsert: true,
            new: true,
            runValidators: true,
            setDefaultsOnInsert: true,
          }
        )
      );
    });

    if (operations.length === 0) {
      return res.status(400).json({
        message: 'No valid student grades were provided',
      });
    }

    const savedGrades = await Promise.all(operations);

    return res.status(200).json({
      message: 'Grades submitted successfully',
      course,
      assessmentType,
      updatedCount: savedGrades.length,
      grades: savedGrades,
    });
  } catch (error) {
    console.error('Error submitting grades:', error);
    return res.status(500).json({
      message: 'Failed to submit grades',
      error: error.message,
    });
  }
};

const publishGrades = async (req, res) => {
  try {
    const teacherId = getTeacherIdentifier(req);
    const { courseId, assessmentType } = req.body;

    if (!teacherId) {
      return res.status(400).json({ message: 'teacherId is required' });
    }

    if (!courseId || !assessmentType) {
      return res.status(400).json({
        message: 'courseId and assessmentType are required',
      });
    }

    const context = await getTeacherContext(teacherId);

    if (!context) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    if (!context.courseIdSet.has(String(courseId))) {
      return res.status(403).json({
        message: 'You are not assigned to this course',
      });
    }

    const result = await Grade.updateMany(
      {
        course: courseId,
        assessmentType,
      },
      {
        $set: { published: true },
      }
    );

    return res.status(200).json({
      message: 'Grades published successfully',
      courseId,
      assessmentType,
      publishedCount: result.modifiedCount ?? result.nModified ?? 0,
    });
  } catch (error) {
    console.error('Error publishing grades:', error);
    return res.status(500).json({
      message: 'Failed to publish grades',
      error: error.message,
    });
  }
};

module.exports = {
  getTeacherCourses,
  getStudentsForGrading,
  submitGrades,
  publishGrades,
};
