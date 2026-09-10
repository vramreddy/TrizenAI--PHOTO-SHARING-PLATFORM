const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../app');
const Event = require('../models/Event');
const Photo = require('../models/Photo');
const Gallery = require('../models/Gallery');
const generateSlug = require('../utils/generateSlug');
const { setup, clearDB, teardown, createTestUser } = require('./setup');

beforeAll(setup);
afterEach(clearDB);
afterAll(teardown);

describe('Gallery API', () => {
  let admin, adminToken, event, gallery;

  beforeEach(async () => {
    const result = await createTestUser({ role: 'admin', email: 'admin@test.com' });
    admin = result.user;
    adminToken = result.token;

    event = await Event.create({
      name: 'Test Wedding',
      createdBy: admin._id,
    });

    // Create selected photos
    for (let i = 0; i < 5; i++) {
      await Photo.create({
        eventId: event._id,
        uploadedBy: admin._id,
        filename: `photo_${i}.jpg`,
        originalName: `photo_${i}.jpg`,
        storageUrl: `https://example.com/photo_${i}.jpg`,
        storagePublicId: `test/photo_${i}`,
        selected: true,
      });
    }
  });

  describe('POST /api/events/:eventId/gallery', () => {
    it('should allow admin to create gallery', async () => {
      const res = await request(app)
        .post(`/api/events/${event._id}/gallery`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Test Gallery', pin: '123456' });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.gallery.title).toBe('Test Gallery');
      expect(res.body.data.gallery.slug).toBeDefined();
    });

    it('should reject team member from creating gallery', async () => {
      const { token: memberToken } = await createTestUser({
        role: 'team_member',
        email: 'member@test.com',
      });

      const res = await request(app)
        .post(`/api/events/${event._id}/gallery`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ title: 'Test Gallery', pin: '123456' });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('Gallery PIN verification', () => {
    beforeEach(async () => {
      const slug = generateSlug('Test Wedding');

      gallery = await Gallery.create({
        eventId: event._id,
        title: 'Test Gallery',
        slug,
        pinHash: '482917',
        published: true,
        publishedAt: new Date(),
        photoCount: 5,
        createdBy: admin._id,
      });
    });

    it('should grant access with correct PIN', async () => {
      const res = await request(app)
        .post(`/api/gallery/${gallery.slug}/verify`)
        .send({ pin: '482917' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.galleryToken).toBeDefined();
    });

    it('should reject incorrect PIN', async () => {
      const res = await request(app)
        .post(`/api/gallery/${gallery.slug}/verify`)
        .send({ pin: '000000' });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Incorrect PIN');
    });

    it('should return photos with valid gallery token', async () => {
      const verifyRes = await request(app)
        .post(`/api/gallery/${gallery.slug}/verify`)
        .send({ pin: '482917' });

      const galleryToken = verifyRes.body.data.galleryToken;

      const photosRes = await request(app)
        .get(`/api/gallery/${gallery.slug}/photos`)
        .set('Authorization', `Gallery ${galleryToken}`);

      expect(photosRes.statusCode).toBe(200);
      expect(photosRes.body.data.photos.length).toBe(5);
    });

    it('should reject photos request without gallery token', async () => {
      const res = await request(app)
        .get(`/api/gallery/${gallery.slug}/photos`);

      expect(res.statusCode).toBe(401);
    });

    it('should return 404 for unpublished gallery', async () => {
      gallery.published = false;
      await gallery.save();

      const res = await request(app)
        .post(`/api/gallery/${gallery.slug}/verify`)
        .send({ pin: '482917' });

      expect(res.statusCode).toBe(404);
    });
  });
});
