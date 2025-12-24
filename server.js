import express from "express";
import cors from "cors";
import "dotenv/config";
import { sendExpressToken } from "./tokenHandler.js";

const app = express();

const allowOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: allowOrigin,
  })
);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/api/token", sendExpressToken);
// compatibility for older path
app.get("/api/zego/token", sendExpressToken);

const port = Number(process.env.PORT || 3001);
app.listen(port, () => console.log(`server: http://localhost:${port}`));
