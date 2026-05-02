function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const message = status === 500 ? 'Internal server error' : err.message;

  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${status}: ${err.message}`);
  if (status === 500) console.error(err.stack);

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && status === 500 ? { detail: err.message } : {}),
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

function asyncWrap(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { errorHandler, notFoundHandler, asyncWrap };
