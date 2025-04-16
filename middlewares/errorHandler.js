// middlewares/errorHandler.js
function errorHandler(err, req, res, next) {
  console.error('API Error:', err.message);
  console.error(err.stack);
  
  // Determine status code based on error type
  let statusCode = 500;
  let message = 'Something went wrong!';
  
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  } else if (err.name === 'UnauthorizedError' || err.message.includes('unauthorized')) {
    statusCode = 401;
    message = 'Authentication error. Please log in again.';
  } else if (err.message.includes('not found')) {
    statusCode = 404;
    message = err.message;
  }
  
  // Send detailed response in development, simplified in production
  if (process.env.NODE_ENV === 'development') {
    res.status(statusCode).json({ 
      message,
      error: err.message,
      stack: err.stack 
    });
  } else {
    res.status(statusCode).json({ message });
  }
}

module.exports = errorHandler;