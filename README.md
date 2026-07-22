# Mobile POS — Charge Mart Manager

Battery shop POS app with separate **frontend** and **backend**.

## Project structure

```
├── backend/     # Express + MongoDB API (port 5050)
├── src/         # React frontend (TanStack Start)
└── public/
```

## Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Set `MONGODB_URI` in `backend/.env`.

### Frontend

```bash
npm install
npm run dev
```

Frontend proxies `/api` to `http://localhost:5050`.

## Scripts

| Location | Command | Description |
|----------|---------|-------------|
| Root | `npm run dev` | Frontend dev server |
| Root | `npm run dev:backend` | Backend dev server |
| `backend/` | `npm run dev` | Backend with watch |
