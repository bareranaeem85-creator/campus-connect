# Campus Connect

A Reddit-style community platform for **CS Department students**: topic-based clubs with discussion feeds, official department announcements, and an events calendar. Access depends on your role.

**Stack:** React 18 (Vite) · Node.js / Express · MongoDB (Mongoose) · JWT + bcrypt

---

## Features

### Clubs and community
- Browse and **search** all clubs, see member counts, and **join or leave** them
- Students **request new clubs** (name, description, reason) and track the status of their requests
- Admins **approve** a request (this creates the club, and the requester becomes its first member) or **reject** it
- Admins **assign or remove moderators** for each club
- Each club has its own **discussion feed**:
  - **Text posts** and **link posts**
  - **Comments** with **nested replies** (any depth, collapsible)
  - **Upvotes / downvotes** and sorting by New or Top
  - **Pinned posts** that stay at the top (pinned by moderators)
  - **Bookmarks**, shown as "Saved posts" on the Profile page
  - **Image / document sharing**: attach a PDF, image, Word, PowerPoint or text file (up to 2 MB). Images show as a preview.
- Only club members can post and comment

### Official announcements
- Admins create, edit and delete announcements (title, text, optional link, optional **uploaded attachment** or file link)
- Everyone sees them newest first, with the publication **date and time**

### Event calendar
- **Upcoming** and **Past** tabs, shown as a timeline
- Admins **create, edit, cancel / restore and delete** events (title, description, date, time, venue)
- Cancelled events show a red **CANCELLED** badge

### Home dashboard
- Stats (clubs, members, upcoming events)
- A feed from **your clubs**
- The latest announcements and the next events

---

## Roles and access control

| Capability | Student | Moderator | Admin (HOD / Head CR / Head GR) |
|---|:-:|:-:|:-:|
| Register / log in, edit profile | ✓ | ✓ | ✓ |
| Join / leave clubs, post, comment, reply, vote, bookmark | ✓ | ✓ | ✓ |
| Request a new club | ✓ | ✓ | ✓ |
| Delete **own** posts / comments | ✓ | ✓ | ✓ |
| Delete any post / comment, pin posts | — | **own clubs only** | all clubs |
| Approve / reject club requests | — | — | ✓ |
| Assign / remove moderators | — | — | ✓ |
| Publish announcements, manage events | — | — | ✓ |

**How access is enforced**
- **Backend:** every rule is checked on the server, not just hidden in the UI.
  - `protect` checks the login token (JWT) on each request.
  - `requireAdmin` blocks non-admins from admin routes.
  - `canModerate(user, club)` checks whether the user is in that club's `moderators` list (admins always pass).
- **Frontend:** buttons and pages are shown or hidden by role, using the same rules (`AuthContext.canModerate`, `RequireAdmin`).
- **Moderator is a per-club role.** Every account is either `student` or `admin`. A student becomes a moderator by being added to a club's `moderators` array, so moderator powers apply only to those clubs.
- New registrations are always **students**.

---

## Demo logins

All demo accounts use the password **`password123`**. On the login page, click an account to fill in its details.

| Role | Email |
|---|---|
| Admin · HOD | hod@campus.edu |
| Admin · Head CR | headcr@campus.edu |
| Admin · Head GR | headgr@campus.edu |
| Moderator (Web Dev Society, AI Circle) | moderator@campus.edu |
| Student | ali@campus.edu |
| Student (not in Cyber Security Club yet, so you can try joining) | fatima@campus.edu |

---

## Project structure

```
campus-connect/
├── client/                    React app (Vite)
│   └── src/
│       ├── api/client.js      fetch wrapper (adds the JWT, handles errors)
│       ├── context/           AuthContext (user, roles), UIContext (toasts, confirm dialog)
│       ├── components/        Navbar, Layout, PostCard, CommentThread, ClubCard, EventRow, ...
│       ├── pages/             Home, Clubs, ClubPage, PostDetail, NewPost, Announcements,
│       │                      Events, RequestClub, Admin, Profile, AuthPage
│       ├── styles/global.css  design system (CSS variables, components, motion)
│       └── utils/format.js    date/time helpers
├── server/
│   └── src/
│       ├── index.js           startup: connect DB, seed if empty, start listening
│       ├── app.js             Express app, routes, serves client/dist in production
│       ├── config/db.js       Mongo connection (in-memory fallback for development)
│       ├── models/            User, Club, ClubRequest, Post, Comment, Announcement, Event, Attachment
│       ├── controllers/       request handlers (business logic)
│       ├── routes/            URL → middleware → controller
│       ├── middleware/        auth.js (protect / requireAdmin / canModerate), error.js
│       ├── seed/              demo data + `npm run seed` script
│       └── utils/http.js      ApiError, asyncHandler, validation helpers
├── tasks/                     plan and task list
└── render.yaml                Render deployment blueprint
```

### API overview
| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/register` · `POST /api/auth/login` · `GET/PATCH /api/auth/me` |
| Clubs | `GET /api/clubs?q=` · `GET /api/clubs/:slug` · `POST /api/clubs/:id/join` · `POST /api/clubs/:id/leave` · `POST/DELETE /api/clubs/:id/moderators` (admin) |
| Club requests | `POST /api/club-requests` · `GET /api/club-requests/mine` · `GET /api/club-requests` (admin) · `POST /api/club-requests/:id/approve` / `reject` (admin) |
| Posts | `GET /api/posts?club=&sort=` · `GET /api/posts/feed` · `POST /api/posts` · `DELETE /api/posts/:id` · `PATCH /api/posts/:id/pin` · `POST /api/posts/:id/vote` · `POST /api/posts/:id/bookmark` |
| Comments | `GET/POST /api/posts/:id/comments` · `DELETE /api/comments/:id` |
| Announcements | `GET /api/announcements` · `POST/PUT/DELETE` (admin) |
| Events | `GET /api/events?when=upcoming
| Uploads | `POST /api/uploads` (logged in; base64 JSON, max 2 MB, allowed file types only) · `GET /api/uploads/:id` |\|past` · `POST/PUT/DELETE`, `PATCH /:id/status` (admin) |

---

## Run locally

You need **Node.js 18 or newer**.

```bash
npm run install:all      # installs server and client dependencies

# terminal 1: API on http://localhost:5000
npm run dev:server

# terminal 2: React app on http://localhost:5173 (sends /api requests to port 5000)
npm run dev:client
```

**Database:** if `server/.env` has no `MONGO_URI`, the server starts an **in-memory MongoDB** and loads the demo data automatically. You don't need to set anything up, but the data resets on every restart.

To keep data between restarts, copy `server/.env.example` to `server/.env` and set:

```
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/campus-connect
JWT_SECRET=<long random string>
```

The server loads the demo data the first time it connects to an **empty** database. To reset the database to the demo data at any time, run `npm run seed`.

---

## Deploy to Render (single service)

In production, Express serves the built React app, so everything runs as **one web service**.

1. Create a free **MongoDB Atlas** cluster. Under Network Access, allow `0.0.0.0/0`. Copy the connection string.
2. On Render, choose **New → Blueprint** and select this repo. Render reads `render.yaml`.
   Or set it up manually as a **Web Service**:
   - Build command: `npm run build`
   - Start command: `npm start`
3. Set these environment variables:
   - `MONGO_URI`: your Atlas connection string
   - `JWT_SECRET`: a long random string (the Blueprint generates one)
   - `NODE_ENV`: `production`
4. Deploy. On first start, the server loads the demo data into the empty database.
