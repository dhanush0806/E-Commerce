const { apiResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error('[Global Error]:', err.stack || err);

  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  return apiResponse(res, status, false, message);
};

module.exports = errorHandler;
