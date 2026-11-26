/** Error carrying an HTTP status code; thrown from controllers/middleware. */
class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/** Wraps async route handlers so rejected promises reach the error handler. */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/** Throws 400 if any of the listed body fields are missing/blank. */
function requireFields(body, fields) {
  const missing = fields.filter((f) => !body[f] || !String(body[f]).trim());
  if (missing.length) throw new ApiError(400, `Missing required field(s): ${missing.join(', ')}`);
}

/** Basic http(s) URL validation for links / attachments. */
function isValidUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

module.exports = { ApiError, asyncHandler, requireFields, isValidUrl };
