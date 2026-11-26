# Task List

## 1. Backend foundation
- [x] Express app, env config, Mongo connection (dev fallback: in-memory Mongo)
- [x] Models: User, Club, ClubRequest, Post, Comment, Announcement, Event
- [x] Auth: register / login / me (bcrypt + JWT)
- [x] Middleware: protect, requireAdmin, club moderator check, error handler
- [x] Seed script: 3 admins, 1 moderator, 2 students, 4 clubs, posts, comments, announcements, events
- [x] Client scaffold: Vite + React Router, API helper, auth context, login/register pages

## 2. Clubs
- [x] List/search clubs, club detail, join/leave, member count
- [x] Club requests (student submit, admin approve → creates club / reject)
- [x] Admin assigns / removes moderators

## 3. Discussions
- [x] Posts (text/link) — members only
- [x] Comments + nested replies
- [x] Moderator/admin delete + pin; votes; bookmarks

## 4. Department
- [x] Announcements CRUD (admin), public list newest first
- [x] Events: upcoming/past tabs, admin create/edit/cancel

## 5. Polish
- [x] Responsive navbar, toasts, confirm dialogs, loading/empty states, motion

## 6. Ship
- [x] README, render.yaml, production static serving
