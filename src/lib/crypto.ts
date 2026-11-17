import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer | null {
  const raw = process.env.DATA_ENCRYPTION_KEY;
  if (!raw) return null;
  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    return Buffer.from(raw, "hex");
  }
  return crypto.createHash("sha256").update(raw).digest();
}

export function encryptSensitiveField(plaintext: string): string {
  const key = getKey();
  if (!key) {
    // Fallback marker when key is not configured in dev
    return `plain:${Buffer.from(plaintext, "utf8").toString("base64")}`;
  }
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptSensitiveField(payload: string): string {
  if (!payload) return "";
  if (payload.startsWith("plain:")) {
    return Buffer.from(payload.slice(6), "base64").toString("utf8");
  }
  const key = getKey();
  if (!key) return "[ENCRYPTED]";
  const [ivHex, tagHex, dataHex] = payload.split(":");
  if (!ivHex || !tagHex || !dataHex) return "";
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(ivHex, "hex")
  );
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

export function maskGstin(gstin: string): string {
  const clean = gstin.trim().toUpperCase();
  if (clean.length !== 15) return clean;
  return `${clean.slice(0, 2)}*****${clean.slice(7, 12)}***`;
}
