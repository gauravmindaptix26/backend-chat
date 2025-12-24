## ZegoCloud Token Server (Express)

This is a **separate backend** that generates ZegoCloud **ZIM Token04** securely.

### Why a backend is required

Zego token generation needs your **server secret**, which must **never** be shipped to the browser.

### Setup

1) Install dependencies:

```bash
cd backend
npm install
```

2) Create `.env` (copy from `.env.example`) and fill:
- `ZEGO_APP_ID`
- `ZEGO_SERVER_SECRET`

3) Start:

```bash
npm run dev
```

### Endpoint

`GET /api/zego/token?userID=<userID>`

Response:

```json
{ "token": "..." }
```

### Notes

- The token generator implementation lives in `backend/zego/token04.js`.
- If you have Zego’s official Token04 code snippet, paste it there (it’s the only safe/accurate source).

