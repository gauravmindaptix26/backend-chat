import crypto from "node:crypto";

function rndNum(min, max) {
  return Math.floor(min + Math.random() * (max - min));
}

function makeRandomIv() {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
  let iv = "";
  for (let i = 0; i < 16; i++) {
    iv += chars[Math.floor(Math.random() * chars.length)];
  }
  return iv;
}

function getAlgorithm(secret) {
  const len = Buffer.from(secret).length;
  if (len === 16) return "aes-128-cbc";
  if (len === 24) return "aes-192-cbc";
  if (len === 32) return "aes-256-cbc";
  throw new Error("ZEGO_SERVER_SECRET must be 16/24/32 chars");
}

export function buildZegoToken(userId) {
  const appId = Number(process.env.ZEGO_APP_ID);
  const secret = process.env.ZEGO_SERVER_SECRET;
  const expire = Number(process.env.ZEGO_TOKEN_EXPIRE_SECONDS || 3600);

  if (!appId) throw new Error("ZEGO_APP_ID missing");
  if (!secret) throw new Error("ZEGO_SERVER_SECRET missing");

  const ctime = Math.floor(Date.now() / 1000);

  const tokenInfo = {
    app_id: appId,
    user_id: userId,
    nonce: rndNum(-2147483648, 2147483647),
    ctime,
    expire: ctime + expire,
    payload: "",
  };

  const iv = makeRandomIv();
  const cipher = crypto.createCipheriv(
    getAlgorithm(secret),
    Buffer.from(secret),
    Buffer.from(iv)
  );

  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(tokenInfo)),
    cipher.final(),
  ]);

  return "04" + Buffer.concat([
    Buffer.from(iv),
    encrypted
  ]).toString("base64");
}
