const request = require('supertest');
const app = require('../app');
const Event = require('../models/Event');
const { setup, clearDB, teardown, createTestUser } = require('./setup');

beforeAll(setup);
afterEach(clearDB);
afterAll(teardown);

describe('Event API', () => {
  describe('POST /api/events', () => {
    it('should allow admin to create event', async () => {
      const { token } = await createTestUser({ role: 'admin' });

      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test Wedding', description: 'A test event' });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.event.name).toBe('Test Wedding');
    });

    it('should reject team member from creating event', async () => {
      const { token } = await createTestUser({ role: 'team_member' });

      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test Event' });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/events', () => {
    it('should return admin events', async () => {
      const { user, token } = await createTestUser({ role: 'admin' });
      await Event.create({ name: 'Event 1', createdBy: user._id });
      await Event.create({ name: 'Event 2', createdBy: user._id });

      const res = await request(app)
        .get('/api/events')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.events.length).toBe(2);
    });

    it('should return only assigned events for team member', async () => {
      const { user: admin } = await createTestUser({ role: 'admin', email: 'admin@t.com' });
      const { user: member, token: memberToken } = await createTestUser({
        role: 'team_member',
        email: 'member@t.com',
      });

      await Event.create({ name: 'Assigned Event', createdBy: admin._id, teamMembers: [member._id] });
      await Event.create({ name: 'Other Event', createdBy: admin._id });

      const res = await request(app)
        .get('/api/events')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.events.length).toBe(1);
      expect(res.body.data.events[0].name).toBe('Assigned Event');
    });
  });

  describe('GET /api/events/:id', () => {
    it('should block access to unrelated event', async () => {
      const { user: admin } = await createTestUser({ role: 'admin', email: 'admin@t.com' });
      const { token: memberToken } = await createTestUser({
        role: 'team_member',
        email: 'member@t.com',
      });

      const event = await Event.create({ name: 'Private Event', createdBy: admin._id });

      const res = await request(app)
        .get(`/api/events/${event._id}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.statusCode).toBe(403);
    });
  });
});
