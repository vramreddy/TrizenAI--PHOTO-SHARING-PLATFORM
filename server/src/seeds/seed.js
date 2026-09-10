const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Event = require('../models/Event');
const Photo = require('../models/Photo');
const Gallery = require('../models/Gallery');
const generateSlug = require('../utils/generateSlug');

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    await Photo.deleteMany({});
    await Gallery.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@snapshare.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('👤 Admin created: admin@snapshare.com / admin123');

    // Create Team Members
    const member1 = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@snapshare.com',
      password: 'member123',
      role: 'team_member',
    });

    const member2 = await User.create({
      name: 'Priya Patel',
      email: 'priya@snapshare.com',
      password: 'member123',
      role: 'team_member',
    });
    console.log('👥 Team members created');
    console.log('   - rahul@snapshare.com / member123');
    console.log('   - priya@snapshare.com / member123');

    // Create Event
    const event = await Event.create({
      name: 'Arjun & Priya Wedding',
      description: 'A beautiful destination wedding celebration at Udaipur Palace. Capturing moments of love, joy, and togetherness.',
      createdBy: admin._id,
      teamMembers: [member1._id, member2._id],
      status: 'active',
    });
    console.log('📅 Event created: Arjun & Priya Wedding');

    // Create a second event
    const event2 = await Event.create({
      name: 'TechConf 2026 Annual Summit',
      description: 'Annual technology conference featuring keynotes, workshops, and networking sessions.',
      createdBy: admin._id,
      teamMembers: [member1._id],
      status: 'active',
    });
    console.log('📅 Event created: TechConf 2026 Annual Summit');

    // Create sample photos
    const samplePhotos = [];
    const photoNames = [
      'ceremony_entrance.jpg', 'bride_portrait.jpg', 'groom_portrait.jpg',
      'ring_exchange.jpg', 'first_dance.jpg', 'family_group.jpg',
      'decoration_details.jpg', 'food_spread.jpg', 'guest_candid.jpg',
      'sunset_couple.jpg', 'haldi_ceremony.jpg', 'mehendi_art.jpg',
    ];

    for (let i = 0; i < photoNames.length; i++) {
      samplePhotos.push({
        eventId: event._id,
        uploadedBy: i % 2 === 0 ? member1._id : member2._id,
        filename: photoNames[i],
        originalName: photoNames[i],
        storageUrl: `https://images.unsplash.com/photo-${1519741497674 + i * 1000}?auto=format&fit=crop&w=1200&q=80`,
        thumbnailUrl: `https://images.unsplash.com/photo-${1519741497674 + i * 1000}?auto=format&fit=crop&w=400&q=80`,
        storagePublicId: `snapshare/events/demo/photo_${i}`,
        fileSize: Math.floor(Math.random() * 5000000) + 1000000,
        width: 1200,
        height: 800,
        mimeType: 'image/jpeg',
        selected: i < 8, // First 8 photos are selected
      });
    }

    await Photo.insertMany(samplePhotos);
    console.log(`📸 ${samplePhotos.length} sample photos created (${samplePhotos.filter(p => p.selected).length} selected)`);

    // Create Gallery with PIN
    const slug = generateSlug('Arjun & Priya Wedding');

    const gallery = await Gallery.create({
      eventId: event._id,
      title: 'Arjun & Priya Wedding Gallery',
      description: 'Cherished moments from a magical celebration of love',
      slug,
      pinHash: '482917',
      published: true,
      publishedAt: new Date(),
      photoCount: 8,
      createdBy: admin._id,
    });
    console.log(`\n🎨 Gallery created and published!`);
    console.log(`   URL: /gallery/${gallery.slug}`);
    console.log(`   PIN: 482917`);

    console.log('\n✅ Seed completed successfully!');
    return { admin, member1, member2, event, gallery };
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    throw error;
  }
};

if (require.main === module) {
  require('dotenv').config();
  mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
      console.log('✅ Connected to MongoDB');
      await seedData();
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ DB connection error:', err.message);
      process.exit(1);
    });
}

module.exports = { seedData };
