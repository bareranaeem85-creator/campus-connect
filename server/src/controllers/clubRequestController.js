const ClubRequest = require('../models/ClubRequest');
const Club = require('../models/Club');
const { createClubRecord } = require('./clubController');
const { ApiError, asyncHandler, requireFields, exactCI } = require('../utils/http');

// POST /api/club-requests — any logged-in user can suggest a club
exports.createRequest = asyncHandler(async (req, res) => {
  requireFields(req.body, ['name', 'description', 'reason']);
  const { name, description, reason } = req.body;
  if (await Club.exists({ slug: Club.slugify(name) })) throw new ApiError(409, 'A club with this name already exists');
  if (await ClubRequest.exists({ name: exactCI(name), status: 'pending' })) {
    throw new ApiError(409, 'A request for this club is already pending');
  }
  const request = await ClubRequest.create({ name, description, reason, requestedBy: req.user._id });
  res.status(201).json(request);
});

// GET /api/club-requests/mine
exports.myRequests = asyncHandler(async (req, res) => {
  const list = await ClubRequest.find({ requestedBy: req.user._id }).populate('club', 'slug').sort({ createdAt: -1 });
  res.json(list);
});

// GET /api/club-requests?status=pending  (admin)
exports.listRequests = asyncHandler(async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  const list = await ClubRequest.find(filter)
    .populate('requestedBy', 'name email')
    .populate('reviewedBy', 'name adminTitle')
    .sort({ status: -1, createdAt: -1 }); // "pending" sorts before approved/rejected
  res.json(list);
});

/** Loads a request and ensures it hasn't been reviewed yet. */
async function loadPending(id) {
  const request = await ClubRequest.findById(id);
  if (!request) throw new ApiError(404, 'Request not found');
  if (request.status !== 'pending') throw new ApiError(400, `Request already ${request.status}`);
  return request;
}

// POST /api/club-requests/:id/approve  (admin) — creates the club; requester becomes first member
exports.approveRequest = asyncHandler(async (req, res) => {
  const request = await loadPending(req.params.id);
  const club = await createClubRecord({
    name: request.name,
    description: request.description,
    createdBy: req.user._id,
    firstMember: request.requestedBy,
  });
  Object.assign(request, { status: 'approved', reviewedBy: req.user._id, club: club._id, reviewNote: req.body.note || '' });
  await request.save();
  res.json({ request, club });
});

// POST /api/club-requests/:id/reject  (admin)
exports.rejectRequest = asyncHandler(async (req, res) => {
  const request = await loadPending(req.params.id);
  Object.assign(request, { status: 'rejected', reviewedBy: req.user._id, reviewNote: req.body.note || '' });
  await request.save();
  res.json({ request });
});
