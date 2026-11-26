const User = require('../models/User');
const Club = require('../models/Club');
const ClubRequest = require('../models/ClubRequest');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Announcement = require('../models/Announcement');
const Event = require('../models/Event');

// Demo accounts (also shown on the login page). Shared password keeps demos simple.
const DEMO_PASSWORD = 'password123';

const daysFromNow = (n) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d;
};
const hoursAgo = (n) => new Date(Date.now() - n * 3600 * 1000);

/** Wipes all collections and inserts demo data. */
async function seedDatabase() {
  await Promise.all(
    [User, Club, ClubRequest, Post, Comment, Announcement, Event].map((M) => M.deleteMany({}))
  );

  // ---- Users ----
  const mk = (name, email, extra = {}) => User.create({ name, email, password: DEMO_PASSWORD, ...extra });
  const hod = await mk('Dr. Ayesha Khan', 'hod@campus.edu', { role: 'admin', adminTitle: 'HOD' });
  const headCR = await mk('Bilal Ahmed', 'headcr@campus.edu', { role: 'admin', adminTitle: 'Head CR' });
  const headGR = await mk('Sana Malik', 'headgr@campus.edu', { role: 'admin', adminTitle: 'Head GR' });
  const mod = await mk('Hamza Raza', 'moderator@campus.edu', { bio: 'Moderator of Web Dev Society & AI Circle.' });
  const ali = await mk('Ali Hassan', 'ali@campus.edu', { bio: '3rd year CS. Loves competitive programming.' });
  const fatima = await mk('Fatima Noor', 'fatima@campus.edu', { bio: 'Frontend dev & UI nerd.' });
  const students = [mod, ali, fatima];

  // ---- Clubs ----
  const clubData = [
    { name: 'Web Dev Society', description: 'Build for the web — React, Node, design systems and weekly project showcases.', color: '#B5EAB5', mods: [mod] },
    { name: 'AI Circle', description: 'Machine learning paper reads, Kaggle squads and hands-on model building.', color: '#F4C99B', mods: [mod] },
    { name: 'Competitive Programming', description: 'Contest prep, problem sets and ICPC team practice every weekend.', color: '#C9D7F2', mods: [] },
    { name: 'Cyber Security Club', description: 'CTFs, secure coding workshops and talks from industry folks.', color: '#EBC3C3', mods: [] },
  ];
  const clubs = {};
  for (const c of clubData) {
    clubs[c.name] = await Club.create({
      name: c.name,
      slug: Club.slugify(c.name),
      description: c.description,
      color: c.color,
      members: students.map((s) => s._id),
      moderators: c.mods.map((m) => m._id),
      createdBy: hod._id,
    });
  }
  // Fatima isn't in Cyber Security yet, so the "Join" flow can be demoed.
  await Club.updateOne({ _id: clubs['Cyber Security Club']._id }, { $pull: { members: fatima._id } });

  // ---- Posts ----
  const web = clubs['Web Dev Society'];
  const ai = clubs['AI Circle'];
  const cp = clubs['Competitive Programming'];
  const p1 = await Post.create({ club: web._id, author: mod._id, title: 'Welcome to Web Dev Society — read before posting', body: 'Share projects, ask questions, and keep it kind. Showcase Fridays start next week!', pinned: true, upvotes: [ali._id, fatima._id], createdAt: hoursAgo(72) });
  const p2 = await Post.create({ club: web._id, author: fatima._id, type: 'link', title: 'Great free course on modern CSS layout', url: 'https://web.dev/learn/css', body: 'Covers grid, flexbox and container queries.', upvotes: [ali._id, mod._id], createdAt: hoursAgo(20) });
  const p3 = await Post.create({ club: ai._id, author: ali._id, title: 'Anyone up for the Kaggle playground competition?', body: 'Looking for 2 teammates. I have some experience with XGBoost.', upvotes: [fatima._id], createdAt: hoursAgo(9) });
  await Post.create({ club: cp._id, author: ali._id, title: 'Weekly problem set #4 is up', body: 'Focus this week: graphs and shortest paths. Discuss solutions after Sunday.', createdAt: hoursAgo(4) });

  // ---- Comments (with nested replies) ----
  const c1 = await Comment.create({ post: p1._id, author: ali._id, body: 'Excited for showcase Fridays!' });
  await Comment.create({ post: p1._id, author: mod._id, parent: c1._id, body: 'Bring your side project, Ali 🙂' });
  const c2 = await Comment.create({ post: p2._id, author: ali._id, body: 'The container queries module is gold.' });
  await Comment.create({ post: p2._id, author: fatima._id, parent: c2._id, body: 'Right? Finally clicked for me.' });
  await Comment.create({ post: p3._id, author: fatima._id, body: 'Count me in!' });
  await Post.updateOne({ _id: p1._id }, { commentCount: 2 });
  await Post.updateOne({ _id: p2._id }, { commentCount: 2 });
  await Post.updateOne({ _id: p3._id }, { commentCount: 1 });

  // ---- Club request (pending, for admin demo) ----
  await ClubRequest.create({ name: 'Game Dev Guild', description: 'Unity, Godot and game jams.', reason: 'Many students want to build games together and join global game jams.', requestedBy: fatima._id });

  // ---- Announcements ----
  await Announcement.create({ title: 'Mid-term examination schedule released', body: 'The mid-term schedule for all CS sections is now available. Please check your section timings carefully.', attachmentUrl: 'https://example.com/midterm-schedule.pdf', author: hod._id, createdAt: hoursAgo(30) });
  await Announcement.create({ title: 'Lab 3 closed for maintenance on Friday', body: 'Lab 3 will be unavailable this Friday from 9 AM to 1 PM. Use Lab 1 for scheduled sessions.', author: headCR._id, createdAt: hoursAgo(6) });
  await Announcement.create({ title: 'Internship fair registrations open', body: 'Register before the deadline to secure a slot with partner companies.', link: 'https://example.com/internship-fair', author: headGR._id, createdAt: hoursAgo(1) });

  // ---- Events (past + upcoming + one cancelled) ----
  await Event.insertMany([
    { title: 'Orientation for new batch', description: 'Welcome session for incoming CS students.', date: daysFromNow(-20), time: '10:00', venue: 'Main Auditorium', createdBy: hod._id },
    { title: 'Alumni tech talk', description: 'Alumni from industry share their career journeys.', date: daysFromNow(-5), time: '14:00', venue: 'Seminar Hall B', createdBy: headGR._id },
    { title: 'Department Hackathon', description: '24-hour hackathon open to all CS students. Teams of up to 4.', date: daysFromNow(4), time: '09:00', venue: 'CS Block, Labs 1–4', createdBy: headCR._id },
    { title: 'Career counselling session', description: 'One-on-one guidance for final year students.', date: daysFromNow(9), time: '11:30', venue: 'Room 204', createdBy: hod._id },
    { title: 'Sports gala (CS vs EE)', description: 'Friendly cricket match.', date: daysFromNow(12), time: '15:00', venue: 'University Ground', status: 'cancelled', createdBy: headGR._id },
  ]);

  console.log('✓ Seeded demo data (password for all demo accounts: %s)', DEMO_PASSWORD);
}

module.exports = { seedDatabase, DEMO_PASSWORD };
