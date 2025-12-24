import express from "express";
import cors from "cors";
import "dotenv/config";
import { buildZegoToken } from "./zcloud/token04.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  })
);

app.get("/health", (req, res) => res.json({ ok: true }));

// local convenience route
app.get("/api/zego/token", (req, res) => {
  try {
    const userID = String(req.query.userID || "").trim();
    if (!userID) return res.status(400).json({ error: "userID required" });

    const token = buildZegoToken(userID);
    return res.json({ token });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Token generation failed" });
  }
});

const port = Number(process.env.PORT || 3001);
app.listen(port, () => console.log(`✅ Local server: http://localhost:${port}`));
