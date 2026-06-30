const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');

const makeToken = (payload) =>
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

describe('protect middleware', () => {
    it('returns 401 when no token cookie is present', async () => {
        const res = await request(app).get('/api/admin/students');
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it('returns 401 for a tampered token', async () => {
        const res = await request(app)
            .get('/api/admin/students')
            .set('Cookie', 'token=definitely.not.valid.jwt');
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });
});

describe('requireRole middleware', () => {
    it('returns 403 when a student token hits an admin route', async () => {
        const token = makeToken({ id: 'fakeid123', role: 'student' });
        const res = await request(app)
            .get('/api/admin/students')
            .set('Cookie', `token=${token}`);
        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
    });

    it('returns 403 when a teacher token hits an admin route', async () => {
        const token = makeToken({ id: 'fakeid456', role: 'teacher' });
        const res = await request(app)
            .get('/api/admin/students')
            .set('Cookie', `token=${token}`);
        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
    });

    it('returns 403 when an admin token hits a student route', async () => {
        const token = makeToken({ id: 'fakeid789', role: 'admin' });
        const res = await request(app)
            .get('/api/student/dashboard/stats')
            .set('Cookie', `token=${token}`);
        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
    });
});
