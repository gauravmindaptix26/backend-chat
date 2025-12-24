import { buildZegoToken } from "../../zcloud/token04.js";
export default function handler(req, res) {
  const allowOrigin = process.env.FRONTEND_ORIGIN || "*";

  res.setHeader("Access-Control-Allow-Origin", allowOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const userID = req.query.userID || req.query.userid;
    if (!userID) return res.status(400).json({ error: "userID required" });

    const token = buildZegoToken(String(userID));
    return res.status(200).json({ token });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Token generation failed" });
  }
}
