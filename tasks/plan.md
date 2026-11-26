# Campus Connect — Build Plan

**Stack:** React (Vite) · Node/Express · MongoDB (Mongoose) · JWT + bcrypt
**Layout:** one repo → `/client` (React) and `/server` (API). In production Express serves `client/dist`, so Render runs ONE web service.

## Architecture
```
Browser (React SPA)  ──fetch /api/*  + Bearer JWT──►  Express
                                                     ├─ middleware: protect (JWT) → requireAdmin / canModerate(club)
                                                     ├─ routes → controllers
                                                     └─ Mongoose models ──► MongoDB
```

## Data models
| Model | Key fields |
|---|---|
| User | name, email, passwordHash, role (`student`/`admin`), adminTitle (HOD / Head CR / Head GR), bookmarks |
| Club | name, slug, description, color, members[], moderators[], createdBy |
| ClubRequest | name, description, reason, requestedBy, status (pending/approved/rejected), reviewedBy |
| Post | club, author, type (text/link), title, body, url, upvotes[], downvotes[], pinned |
| Comment | post, author, parent (null = top-level → nested replies), body |
| Announcement | title, body, link, attachmentUrl, author, createdAt |
| Event | title, description, date, time, venue, status (scheduled/cancelled), createdBy |

"Moderator" is not a global role — a user is a moderator of a club if they are in `club.moderators`. Admins can moderate every club.

## Steps (stop + test after each, commit + push)
1. Backend setup, models, auth, roles, seed data
2. Clubs + club requests + moderator assignment
3. Posts, comments, nested replies (+ votes, pins, bookmarks)
4. Announcements + events
5. UI polish + responsive
6. README + Render deployment config
