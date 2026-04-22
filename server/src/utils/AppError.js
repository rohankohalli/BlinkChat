// Custom error class that carries an HTTP status code
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // distinguishes known errors from bugs
  }
}

export default AppError;
