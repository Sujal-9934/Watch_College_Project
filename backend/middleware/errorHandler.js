const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('Error:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // MySQL errors
  if (err.code === 'ER_DUP_ENTRY') {
    const message = 'Duplicate entry';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'ER_NO_REFERENCED_ROW' || err.code === 'ER_ROW_IS_REFERENCED') {
    const message = 'Invalid reference';
    error = { message, statusCode: 400 };
  }

  // MySQL connection errors
  if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT') {
    const message = 'Database connection error. Please try again.';
    error = { message, statusCode: 503 };
  }

  if (err.code === 'ER_ACCESS_DENIED_ERROR') {
    const message = 'Database access denied';
    error = { message, statusCode: 500 };
  }

  // Default error
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = {
  errorHandler,
  notFound,
  asyncHandler
};
