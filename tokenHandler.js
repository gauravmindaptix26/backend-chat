import { buildZegoToken } from "./zegoToken.js";

const allowOrigin = process.env.FRONTEND_ORIGIN || "*";

export function issueToken(rawUserId) {
  const userId = String(rawUserId || "").trim();
  if (!userId) throw new Error("userID required");
  return buildZegoToken(userId);
}

export function sendExpressToken(req, res) {
  try {
    const token = issueToken(req.query.userID || req.query.userid);
    return res.json({ token });
  } catch (e) {
    const status = e?.message === "userID required" ? 400 : 500;
    return res.status(status).json({ error: e?.message || "Token generation failed" });
  }
}

export function serverlessTokenHandler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", allowOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const token = issueToken(req.query.userID || req.query.userid);
    return res.status(200).json({ token });
  } catch (e) {
    const status = e?.message === "userID required" ? 400 : 500;
    return res.status(status).json({ error: e?.message || "Token generation failed" });
  }
}
