const Event = require('../models/Event');
const User = require('../models/User');
const Photo = require('../models/Photo');
const Gallery = require('../models/Gallery');

/**
 * POST /api/events
 * Create a new event (Admin only)
 */
const createEvent = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const event = await Event.create({
      name,
      description,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { event },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/events
 * List events (Admin: all events, Team Member: assigned events only)
 */
const getEvents = async (req, res, next) => {
  try {
    let query;

    if (req.user.role === 'admin') {
      query = Event.find({ createdBy: req.user._id });
    } else {
      query = Event.find({ teamMembers: req.user._id });
    }

    const events = await query
      .populate('createdBy', 'name email')
      .populate('teamMembers', 'name email')
      .sort({ createdAt: -1 });

    // Get photo counts for each event
    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        const totalPhotos = await Photo.countDocuments({ eventId: event._id });
        const selectedPhotos = await Photo.countDocuments({
          eventId: event._id,
          selected: true,
        });
        const gallery = await Gallery.findOne({ eventId: event._id });

        return {
          ...event.toObject(),
          totalPhotos,
          selectedPhotos,
          hasGallery: !!gallery,
          galleryPublished: gallery?.published || false,
        };
      })
    );

    res.json({
      success: true,
      data: { events: eventsWithCounts },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/events/:id
 * Get event details (with membership/ownership check)
 */
const getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('teamMembers', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Authorization check
    const isOwner = event.createdBy._id.toString() === req.user._id.toString();
    const isMember = event.teamMembers.some(
      (m) => m._id.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this event',
      });
    }

    // Get photo stats
    const totalPhotos = await Photo.countDocuments({ eventId: event._id });
    const selectedPhotos = await Photo.countDocuments({
      eventId: event._id,
      selected: true,
    });
    const gallery = await Gallery.findOne({ eventId: event._id });

    res.json({
      success: true,
      data: {
        event: {
          ...event.toObject(),
          totalPhotos,
          selectedPhotos,
          gallery: gallery ? gallery.toJSON() : null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/events/:id
 * Update event (Admin only, must own the event)
 */
const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or access denied',
      });
    }

    Object.assign(event, req.body);
    await event.save();

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: { event },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/events/:id
 * Delete event and all associated data (Admin only)
 */
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or access denied',
      });
    }

    // Delete associated photos and gallery
    await Photo.deleteMany({ eventId: event._id });
    await Gallery.deleteOne({ eventId: event._id });
    await Event.deleteOne({ _id: event._id });

    res.json({
      success: true,
      message: 'Event and all associated data deleted',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/events/:id/members
 * Add team member to event (Admin only)
 * Creates the team member account if it doesn't exist
 */
const addMember = async (req, res, next) => {
  try {
    const { email, name, password } = req.body;

    const event = await Event.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or access denied',
      });
    }

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      // Create new team member account
      if (!name || !password) {
        return res.status(400).json({
          success: false,
          message: 'Name and password are required to create a new team member',
        });
      }

      user = await User.create({
        name,
        email,
        password,
        role: 'team_member',
      });
    }

    // Check if already a member
    if (event.teamMembers.includes(user._id)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a team member of this event',
      });
    }

    // Check that we're not adding an admin as team member
    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot add an admin as a team member',
      });
    }

    event.teamMembers.push(user._id);
    await event.save();

    const populatedEvent = await Event.findById(event._id)
      .populate('teamMembers', 'name email');

    res.status(201).json({
      success: true,
      message: 'Team member added successfully',
      data: {
        member: { _id: user._id, name: user.name, email: user.email },
        event: populatedEvent,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/events/:id/members/:userId
 * Remove team member from event (Admin only)
 */
const removeMember = async (req, res, next) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or access denied',
      });
    }

    const memberIndex = event.teamMembers.indexOf(req.params.userId);
    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User is not a team member of this event',
      });
    }

    event.teamMembers.splice(memberIndex, 1);
    await event.save();

    res.json({
      success: true,
      message: 'Team member removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  addMember,
  removeMember,
};
