const Joi = require('joi');

const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const messages = error.details.map(d => d.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        next();
    };
};

const registerSchema = Joi.object({
    role: Joi.string().valid('admin', 'student', 'teacher').required(),
    adminId: Joi.when('role', { is: 'admin', then: Joi.string().required() }),
    studentId: Joi.when('role', { is: 'student', then: Joi.string().required() }),
    teacherId: Joi.when('role', { is: 'teacher', then: Joi.string().required() }),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    department: Joi.when('role', { is: Joi.valid('student', 'teacher'), then: Joi.string().required() }),
    yearOfStudy: Joi.when('role', { is: 'student', then: Joi.number().min(1).max(6).required() }),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

module.exports = { validate, registerSchema, loginSchema };
