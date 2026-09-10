const router = require('express').Router();
const {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  addMember,
  removeMember,
} = require('../controllers/event.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createEventSchema, updateEventSchema, addMemberSchema } = require('../utils/validators');

// All event routes require authentication
router.use(authenticate);

router.post('/', authorizeAdmin, validate(createEventSchema), createEvent);
router.get('/', getEvents);
router.get('/:id', getEvent);
router.put('/:id', authorizeAdmin, validate(updateEventSchema), updateEvent);
router.delete('/:id', authorizeAdmin, deleteEvent);

// Team member management
router.post('/:id/members', authorizeAdmin, validate(addMemberSchema), addMember);
router.delete('/:id/members/:userId', authorizeAdmin, removeMember);

module.exports = router;
