import crypto from "crypto";

function rndNum(min, max) {
  return Math.ceil(min + (max - min) * Math.random());
}

function makeRandomIv() {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
  const result = [];
  for (let i = 0; i < 16; i++) result.push(chars.charAt(Math.floor(Math.random() * chars.length)));
  return result.join("");
}

function getAlgorithm(secretStr) {
  const keyLen = Buffer.from(secretStr).length;
  if (keyLen === 16) return "aes-128-cbc";
  if (keyLen === 24) return "aes-192-cbc";
  if (keyLen === 32) return "aes-256-cbc";
  throw new Error("ZEGO_SERVER_SECRET must be 16/24/32 bytes (usually 32 chars)");
}

function aesEncrypt(plainText, secret, iv) {
  const algorithm = getAlgorithm(secret);
  const key = Buffer.from(secret);
  const ivBuf = Buffer.from(iv);
  const cipher = crypto.createCipheriv(algorithm, key, ivBuf);
  return Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
}

// Token04 generator (per Zego docs)
export function generateToken04(appId, userId, secret, effectiveTimeInSeconds, payload = "") {
  if (!appId || typeof appId !== "number") throw new Error("appID invalid");
  if (!userId || typeof userId !== "string") throw new Error("userId invalid");
  if (!secret || typeof secret !== "string") throw new Error("secret invalid");
  if (!effectiveTimeInSeconds || typeof effectiveTimeInSeconds !== "number")
    throw new Error("effectiveTimeInSeconds invalid");

  const createTime = Math.floor(Date.now() / 1000);

  const tokenInfo = {
    app_id: appId,
    user_id: userId,
    nonce: rndNum(-2147483648, 2147483647),
    ctime: createTime,
    expire: createTime + effectiveTimeInSeconds,
    payload: payload || "",
  };

  const plainText = JSON.stringify(tokenInfo);
  const iv = makeRandomIv();
  const encryptBuf = aesEncrypt(plainText, secret, iv);

  const b1 = new Uint8Array(8);
  const b2 = new Uint8Array(2);
  const b3 = new Uint8Array(2);

  new DataView(b1.buffer).setBigInt64(0, BigInt(tokenInfo.expire), false);
  new DataView(b2.buffer).setUint16(0, iv.length, false);
  new DataView(b3.buffer).setUint16(0, encryptBuf.byteLength, false);

  const buf = Buffer.concat([
    Buffer.from(b1),
    Buffer.from(b2),
    Buffer.from(iv),
    Buffer.from(b3),
    Buffer.from(encryptBuf),
  ]);

  return "04" + buf.toString("base64");
}

// Helper for endpoints
export function buildZegoToken(userId) {
  const appId = Number(process.env.ZEGO_APP_ID);
  const secret = process.env.ZEGO_SERVER_SECRET;
  const expireSeconds = Number(process.env.ZEGO_TOKEN_EXPIRE_SECONDS || 3600);

  if (!appId) throw new Error("ZEGO_APP_ID missing/invalid in backend/.env");
  if (!secret) throw new Error("ZEGO_SERVER_SECRET missing in backend/.env");

  return generateToken04(appId, userId, secret, expireSeconds, "");
}
