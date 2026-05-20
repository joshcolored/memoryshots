export function notFound(req, _res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

export function errorHandler(error, _req, res, _next) {
  const status = error.status || 500;
  res.status(status).json({
    message: error.message || 'Server error',
    errors: error.errors || undefined
  });
}
