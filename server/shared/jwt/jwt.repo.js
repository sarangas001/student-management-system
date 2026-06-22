const jwt = require('jsonwebtoken');

const generateToken = (user_id) => {
    return jwt.sign({ user_id }, process.env.JWT_SECRET, { expiresIn: '1d' });
}

const saveToken = ({res, token}) => {
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
}

const clearToken = (res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
    });
}

module.exports = {
    generateToken,
    saveToken,
    clearToken
};