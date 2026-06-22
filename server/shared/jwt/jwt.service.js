const { generateToken, saveToken, clearToken, decodeToken } = require("./jwt.repo");

class JWTService {
    generateToken(payload) {
        return generateToken(payload);
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