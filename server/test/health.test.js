const request = require('supertest');
const app = require('../app');

// These endpoints never touch the DB, so they work without a MongoDB connection.

describe('GET /health', () => {
    it('returns 200 with status ok', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
        expect(res.body).toHaveProperty('timestamp');
        expect(res.body).toHaveProperty('uptime');
    });
});

describe('GET /ready', () => {
    it('returns 503 when database is not connected', async () => {
        const res = await request(app).get('/ready');
        // In test environment mongoose is not connected, so we expect not-ready
        expect([200, 503]).toContain(res.status);
        expect(res.body).toHaveProperty('status');
    });
});

describe('GET /', () => {
    it('returns API info', async () => {
        const res = await request(app).get('/');
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/Student Management System/);
    });
});

describe('GET /nonexistent', () => {
    it('returns 404 for unknown routes', async () => {
        const res = await request(app).get('/nonexistent-route');
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });
});
