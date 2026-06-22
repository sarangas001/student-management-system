const jwt = require('jsonwebtoken');

const generateToken = (user_id, role) => {
    return jwt.sign({ id: user_id, role }, process.env.JWT_SECRET, { expiresIn: '1d' });
}

const saveToken = ({res, token}) => {
    res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
}

const clearToken = (res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict'
    });
}

const decodeToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid token');
    }
}

module.exports = {
    generateToken,
    saveToken,
    clearToken,
    decodeToken
};