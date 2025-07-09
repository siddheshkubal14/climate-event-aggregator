process.env.API_KEY = 'test-api-key';

import express from 'express';
import request from 'supertest';
import authMiddleware from '../middlewares/auth.js';
import { expect } from 'chai';

describe('Auth Middleware', () => {
    const app = express();
    app.get('/test', authMiddleware, (_req: express.Request, res: express.Response): void => { res.send('Authorized'); });

    it('rejects request without Authorization header', async () => {
        const res = await request(app).get('/test');
        expect(res.status).to.equal(403);
    });

    it('rejects request with invalid API key', async () => {
        const res = await request(app).get('/test').set('Authorization', 'Bearer wrong-key');
        expect(res.status).to.equal(403);
    });
});
