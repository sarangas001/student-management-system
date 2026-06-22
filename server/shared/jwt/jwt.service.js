const { generateToken, saveToken, clearToken } = require("./jwt.repo");

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
}



module.exports = new JWTService();