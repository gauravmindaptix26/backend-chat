import { buildZegoToken } from "../zegoToken.js";

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const userId = String(req.query.userID || "").trim();
    if (!userId) return res.status(400).json({ error: "userID required" });

    const token = buildZegoToken(userId);
    return res.status(200).json({ token });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
