import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const algorithm = 'aes-256-cbc';
const keyPath = path.join(process.cwd(), 'secret', 'encryption_key.txt');
const ivPath = path.join(process.cwd(), 'secret', 'encryption_iv.txt');

function getEncryptionKey(): Buffer {
  if (!fs.existsSync(keyPath)) {
    const key = crypto.randomBytes(32);
    fs.writeFileSync(keyPath, key);
    return key;
  }
  return fs.readFileSync(keyPath);
}

function getIV(): Buffer {
  if (!fs.existsSync(ivPath)) {
    const iv = crypto.randomBytes(16);
    fs.writeFileSync(ivPath, iv);
    return iv;
  }
  return fs.readFileSync(ivPath);
}

export function encryptPassword(password: string): string {
  const key = getEncryptionKey();
  const iv = getIV();
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export function decryptPassword(encryptedPassword: string): string {
  const key = getEncryptionKey();
  const iv = getIV();
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedPassword, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
