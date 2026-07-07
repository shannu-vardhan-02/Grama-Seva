# Village Connect

Minimal split deployment setup.

## Structure

- `client/` - React + Vite frontend for Vercel
- `server/` - Express backend for Render

## Run locally

### Frontend

```bash
cd client
npm install
npm run dev
```

### Backend

```bash
cd server
npm install
npm run dev
```

## Deploy

- Vercel root directory: `client`
- Render root directory: `server`
- Backend start command: `npm start`
