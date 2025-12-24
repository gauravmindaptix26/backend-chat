import { generateZegoToken } from "../zegoToken.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId, roomId } = req.body;

    if (!userId || !roomId) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const token = generateZegoToken(userId, roomId);

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
