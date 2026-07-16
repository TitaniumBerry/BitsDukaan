# BITS Dukaan

A BITS-exclusive marketplace where students can buy and sell books, cycles, electronics, trunks, mattresses, and hostel essentials using verified institute accounts.

![JavaScript](https://img.shields.io/badge/javascript-ES6+-yellow)
![Cloudflare Pages](https://img.shields.io/badge/cloudflare-pages-orange)
![Cloudflare D1](https://img.shields.io/badge/database-d1-red)
![Google OAuth](https://img.shields.io/badge/auth-google%20oauth-blue)
![SQLite](https://img.shields.io/badge/sqlite-d1-blue)
![BITS Only](https://img.shields.io/badge/access-BITS%20Pilani-green)

---

## Live Demo

https://bitsdukaan.pages.dev

---

## What it does

BITS Dukaan is a student-to-student marketplace designed specifically for the BITS Pilani community. Students can list books, notes, electronics, cycles, trunks, furniture, and other hostel essentials for sale. Listings are visible to all users, while publishing is restricted to authenticated BITS Pilani accounts through Google OAuth.

---

## Features

- **BITS-only authentication** — restricted to `@pilani.bits-pilani.ac.in` accounts
- **Google OAuth login** — no OTPs or manual verification
- **Shared marketplace** — all listings stored centrally in Cloudflare D1
- **Create listings** — title, description, category, condition and pricing
- **Search & filtering** — category, branch, year and keyword filters
- **Seller contact information** — direct communication through phone numbers
- **My Listings dashboard** — manage your own listings
- **Mark as sold** — hide unavailable items
- **Delete listings** — remove outdated listings
- **Serverless architecture** — Cloudflare Pages Functions + D1

---

## Tech Stack

| Layer          | Technology                      |
| -------------- | ------------------------------- |
| Frontend       | HTML5, CSS3, Vanilla JavaScript |
| Authentication | Google OAuth 2.0                |
| Backend        | Cloudflare Pages Functions      |
| Database       | Cloudflare D1 (SQLite)          |
| Hosting        | Cloudflare Pages                |
| Infrastructure | Cloudflare Workers              |

---

## System Architecture

```text
User
 │
 ▼
Google OAuth
 │
 ▼
Session Cookie
 │
 ▼
Cloudflare Pages Functions
 │
 ├── /api/me
 ├── /api/listings
 ├── /api/create-listing
 ├── /api/toggle-sold
 └── /api/delete-listing
 │
 ▼
Cloudflare D1 Database
```

---

## Database Schema

```sql
CREATE TABLE listings (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  branch TEXT,
  year TEXT,
  campus TEXT,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  item_condition TEXT,
  seller_name TEXT NOT NULL,
  seller_phone TEXT NOT NULL,
  seller_email TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  sold INTEGER DEFAULT 0
);
```

---

## Project Structure

```text
BITS-Dukaan/
├── functions/
│   ├── api/
│   │   ├── me.js
│   │   ├── listings.js
│   │   ├── create-listing.js
│   │   ├── toggle-sold.js
│   │   └── delete-listing.js
│   ├── google/
│   │   ├── auth.js
│   │   └── callback.js
│
├── app.js
├── styles.css
├── index.html
└── README.md
```

---

## Security

- Only verified BITS Pilani Google accounts can publish listings.
- Authentication is handled through Google OAuth 2.0.
- Listing operations are executed through server-side API routes.
- Data is stored centrally in Cloudflare D1.
- Unauthorized users cannot create or manage listings.

---

## Contributors

### Rajay Vardhan Rai

Founder & Frontend Development

### Chirag Bajaj

Backend & Infrastructure

Designed and implemented:

- Google OAuth authentication
- Cloudflare Pages Functions
- D1 database integration
- API architecture
- Deployment infrastructure

---

## License

Built by students, for students.
