/** 404 for unknown API routes. */
const notFound = (req, res) => res.status(404).json({ message: `Route not found: ${req.originalUrl}` });

/** Central error handler: turns any thrown error into a clean JSON message. */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  let status = err.status || 500;
  let message = err.message || 'Something went wrong';

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path}`;
  } else if (err.code === 11000) {
    status = 409;
    message = `${Object.keys(err.keyValue).join(', ')} already exists`;
  }

  if (status === 500) console.error(err);
  res.status(status).json({ message });
};

module.exports = { notFound, errorHandler };
