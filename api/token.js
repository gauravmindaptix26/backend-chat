import { createRemoteJWKSet, jwtVerify } from "jose";
import { buildZegoToken } from "../zegoToken.js";

const sanitizeUserId = (raw) =>
  String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._@-]/g, "_")
    .slice(0, 64);

let jwks = null;

async function verifyAuth0Token(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) throw new Error("Missing Authorization bearer token");

  const domain = process.env.AUTH0_DOMAIN;
  const audience = process.env.AUTH0_AUDIENCE || process.env.AUTH0_CLIENT_ID;
  if (!domain) throw new Error("AUTH0_DOMAIN not configured");
  if (!audience) throw new Error("AUTH0_AUDIENCE or AUTH0_CLIENT_ID not configured");

  const issuer = `https://${domain}/`;
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`${issuer}.well-known/jwks.json`));
  }

  const { payload } = await jwtVerify(token, jwks, { issuer, audience });
  return payload;
}

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  (async () => {
    try {
      const claims = await verifyAuth0Token(req);
      const rawUserId = claims.email || claims.sub;
      const userId = sanitizeUserId(rawUserId);

      if (!userId) {
        return res.status(400).json({ error: "Could not derive userID from Auth0 token" });
      }

      const token = buildZegoToken(userId);
      return res.status(200).json({ token, userId });
    } catch (e) {
      const status = e.message?.includes("Missing Authorization") ? 401 : 500;
      return res.status(status).json({ error: e.message || "Token generation failed" });
    }
  })();
}
