const AppError = require('../utils/AppError');

const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query
    });

    if (!result.success) {
      const message = result.error.issues[0]?.message || 'Datos invalidos';
      return next(new AppError(message, 400));
    }

    req.body = result.data.body || req.body;
    req.params = result.data.params || req.params;
    next();
  };
};

module.exports = validate;
