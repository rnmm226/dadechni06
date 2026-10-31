# Dadechni 🌍

**Your Complete Tunisia Experience Platform** — discover monuments, events, restaurants, transport, travel buddies, and more, all in one PWA.

---

## Running the project

### 1. Backend (Node.js + SQLite)

```bash
cd server
npm install
npm start
```

The API will be available at `http://localhost:3001`.

### 2. Frontend

Open `index.html` directly in a browser, **or** serve it via the backend (it's served automatically at `http://localhost:3001`).

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create a new account |
| POST | `/api/auth/login` | Login with email + password |
| GET  | `/api/auth/me` | Get current user (requires Bearer token) |
| GET  | `/api/users/count` | Total registered users |

---

## Stack

- **Frontend:** Vanilla HTML/CSS/JS — Progressive Web App (PWA)
- **Backend:** Node.js + Express
- **Database:** SQLite via `better-sqlite3`
- **Auth:** bcryptjs (password hashing) + JWT tokens

---

## Color Palette

Inspired by Tunisia's rich culture:

| Variable | Color | Inspiration |
|----------|-------|-------------|
| `--primary` | `#C8860A` | Saffron gold — spice markets |
| `--secondary` | `#7B3F00` | Terracotta brown — medina walls |
| `--accent` | `#D2691E` | Burnt sienna — pottery & zellige |
| `--light` | `#FAF3E0` | Warm parchment — desert sand |
| `--olive` | `#6B6E30` | Olive grove green — Sfax landscapes |
