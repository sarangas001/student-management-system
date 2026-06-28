const { generateToken, saveToken, clearToken, decodeToken } = require("./jwt.repo");

class JWTService {
    generateToken(user_id, role) {
        return generateToken(user_id, role);
    }

    saveToken({ res, token }) {
        return saveToken({ res, token });
    }

    clearToken(res) {
        return clearToken(res);
    }

    decodeToken(token) {
        return decodeToken(token);
    }
}



module.exports = new JWTService();