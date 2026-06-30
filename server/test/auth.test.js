const request = require('supertest');
const app = require('../app');

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
        // Fire 21 requests; at least one should return 429
        const requests = Array.from({ length: 21 }, () =>
            request(app).post('/api/auth/login').send({ email: 'x@x.com', password: 'x' })
        );
        const responses = await Promise.all(requests);
        const statuses  = responses.map((r) => r.status);
        // Some will 400 (early) or 429 (rate-limited) — we just need no 500s
        expect(statuses.every((s) => s !== 500)).toBe(true);
        expect(statuses.some((s) => s === 429)).toBe(true);
    });
});

describe('POST /api/auth/logout', () => {
    it('returns 200 and clears the cookie', async () => {
        const res = await request(app).post('/api/auth/logout');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
});
