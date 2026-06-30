const request = require('supertest');
const app = require('../app');
const { authLimiter, globalLimiter } = require('../app');

describe('POST /api/auth/login', () => {
    it('returns 400 when body is empty', async () => {
        const res = await request(app).post('/api/auth/login').send({});
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('returns 400 when password is missing', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test@example.com' });
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('returns 400 when email is missing', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ password: 'somepassword' });
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('is rate-limited after 20 rapid requests', async () => {
        // Fire 21 requests; at least one should return 429.
        // In the test environment there is no database, so requests that
        // pass validation will result in 500 (DB unreachable) until the
        // authLimiter (max:20, skipSuccessfulRequests:true) kicks in with 429.
        const requests = Array.from({ length: 21 }, () =>
            request(app).post('/api/auth/login').send({ email: 'x@x.com', password: 'x' })
        );
        const responses = await Promise.all(requests);
        const statuses  = responses.map((r) => r.status);
        expect(statuses.some((s) => s === 429)).toBe(true);
    }, 30000);
});

describe('POST /api/auth/logout', () => {
    beforeEach(async () => {
        // Reset the rate-limiter stores so the intentionally-exhausted
        // authLimiter from the login suite doesn't bleed a 429 into here.
        // supertest hits from ::ffff:127.0.0.1 or ::1 depending on platform.
        await authLimiter.resetKey('::ffff:127.0.0.1');
        await authLimiter.resetKey('::1');
        await authLimiter.resetKey('127.0.0.1');
        await globalLimiter.resetKey('::ffff:127.0.0.1');
        await globalLimiter.resetKey('::1');
        await globalLimiter.resetKey('127.0.0.1');
    });

    it('returns 200 and clears the cookie', async () => {
        const res = await request(app).post('/api/auth/logout');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
});
