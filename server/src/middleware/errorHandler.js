import AppError from '../utils/AppError.js';

const errorHandler = (err, req, res, next) => {
  // Known operational error (thrown intentionally)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }

  // MySQL duplicate entry
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Username or email already taken' });
  }

  // Unknown / programming error — don't leak details
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
};

export default errorHandler;
