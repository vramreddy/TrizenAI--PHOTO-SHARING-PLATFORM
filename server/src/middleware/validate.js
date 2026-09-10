/**
 * Joi validation middleware factory
 * @param {Object} schema - Joi schema
 * @param {string} property - 'body', 'query', or 'params'
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, ''),
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    // Replace with validated and sanitized values
    req[property] = value;
    next();
  };
};

module.exports = validate;
