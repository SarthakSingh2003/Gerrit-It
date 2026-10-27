import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('Backend API Integration Tests', () => {
  const app = createApp();

  it('GET /api/health returns 200 with service health metadata', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('Gerrit-It Backend');
    expect(res.body.cache).toBeDefined();
  });

  it('GET /api/version returns 200 with version and license', async () => {
    const res = await request(app).get('/api/version');
    expect(res.status).toBe(200);
    expect(res.body.license).toBe('GPL-3.0-or-later');
  });

  it('GET /api/repositories/classification returns categories and rules', async () => {
    const res = await request(app).get('/api/repositories/classification');
    expect(res.status).toBe(200);
    expect(res.body.data.categories).toBeInstanceOf(Array);
    expect(res.body.data.rules).toBeInstanceOf(Array);
    expect(res.body.meta.source).toBe('Gerrit-It Classifier');
  });

  it('GET /api/fixtures/sample-contributor returns curated fixture with valid schema', async () => {
    const res = await request(app).get('/api/fixtures/sample-contributor');
    expect(res.status).toBe(200);
    expect(res.body.data.contributor.accountId).toBe(458);
    expect(res.body.data.authored.merged).toBe(98);
    expect(res.body.data.reviews.distinctChangesReviewed).toBe(86);
    expect(res.body.data.categoryBreakdown).toBeInstanceOf(Array);
  });

  it('GET /api/fixtures/sample-repositories returns repo list', async () => {
    const res = await request(app).get('/api/fixtures/sample-repositories');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data[0].project).toBe('mediawiki/extensions/MassMessage');
  });

  it('POST /api/cohorts/analyze rejects empty identifiers with 400 validation error', async () => {
    const res = await request(app).post('/api/cohorts/analyze').send({ identifiers: [] });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/nonexistent returns 404 with structured error response', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('ENDPOINT_NOT_FOUND');
  });
});
