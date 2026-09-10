const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name cannot exceed 100 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().lowercase().trim().required().messages({
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).max(128).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required',
  }),
  role: Joi.string().valid('admin', 'team_member').default('admin'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required().messages({
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

const createEventSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200).required().messages({
    'string.min': 'Event name must be at least 2 characters',
    'string.max': 'Event name cannot exceed 200 characters',
    'any.required': 'Event name is required',
  }),
  description: Joi.string().trim().max(1000).allow('').default(''),
});

const updateEventSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200),
  description: Joi.string().trim().max(1000).allow(''),
  status: Joi.string().valid('active', 'completed'),
}).min(1);

const addMemberSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required().messages({
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required',
  }),
  name: Joi.string().trim().min(2).max(100).messages({
    'string.min': 'Name must be at least 2 characters',
  }),
  password: Joi.string().min(6).max(128).messages({
    'string.min': 'Password must be at least 6 characters',
  }),
});

const createGallerySchema = Joi.object({
  title: Joi.string().trim().min(2).max(200).required().messages({
    'string.min': 'Gallery title must be at least 2 characters',
    'any.required': 'Gallery title is required',
  }),
  description: Joi.string().trim().max(500).allow('').default(''),
  pin: Joi.string()
    .pattern(/^\d{4,8}$/)
    .required()
    .messages({
      'string.pattern.base': 'PIN must be 4–8 digits',
      'any.required': 'Gallery PIN is required',
    }),
});

const updateGallerySchema = Joi.object({
  title: Joi.string().trim().min(2).max(200),
  description: Joi.string().trim().max(500).allow(''),
  pin: Joi.string().pattern(/^\d{4,8}$/).messages({
    'string.pattern.base': 'PIN must be 4–8 digits',
  }),
}).min(1);

const verifyPinSchema = Joi.object({
  pin: Joi.string().required().messages({
    'any.required': 'PIN is required',
  }),
});

const selectPhotosSchema = Joi.object({
  photoIds: Joi.array()
    .items(Joi.string().hex().length(24))
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one photo must be selected',
      'any.required': 'Photo IDs are required',
    }),
  selected: Joi.boolean().required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  createEventSchema,
  updateEventSchema,
  addMemberSchema,
  createGallerySchema,
  updateGallerySchema,
  verifyPinSchema,
  selectPhotosSchema,
};
