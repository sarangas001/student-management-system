// Set env vars before any module loads
process.env.NODE_ENV    = 'test';
process.env.PORT        = '3099';
process.env.JWT_SECRET  = 'test-secret-key-that-is-long-enough-for-jest-runs';
process.env.MONGO_URI   = 'mongodb://localhost:27017/sms-test';
process.env.CLIENT_URL  = 'http://localhost:5173';
process.env.LOG_LEVEL   = 'silent'; // suppress Winston output during tests
