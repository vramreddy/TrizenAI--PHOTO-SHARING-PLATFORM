const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const gallerySchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: [true, 'Gallery title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    pinHash: {
      type: String,
      required: [true, 'Gallery PIN is required'],
    },
    published: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
    photoCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash PIN before saving
gallerySchema.pre('save', async function (next) {
  if (!this.isModified('pinHash')) return next();
  const salt = await bcrypt.genSalt(12);
  this.pinHash = await bcrypt.hash(this.pinHash, salt);
  next();
});

// Compare PIN method
gallerySchema.methods.comparePin = async function (candidatePin) {
  return bcrypt.compare(candidatePin, this.pinHash);
};

// Remove pinHash from JSON output
gallerySchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.pinHash;
  return obj;
};

module.exports = mongoose.model('Gallery', gallerySchema);
