import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

const DEFAULT_INSECURE_KEY = 'default-insecure-key-change-in-production';

@Injectable()
export class EncryptionService {
  private algorithm: string;
  private encryptionKey: string;
  private ivLength: number;

  constructor() {
    this.algorithm = process.env.ENCRYPTION_ALGORITHM || 'aes-256-cbc';

    const rawKey = process.env.ENCRYPTION_KEY;
    if (process.env.NODE_ENV === 'production' && !rawKey) {
      throw new Error('ENCRYPTION_KEY must be set in production');
    }

    this.encryptionKey = this.normalizeKey(rawKey || DEFAULT_INSECURE_KEY);
    this.ivLength = parseInt(process.env.ENCRYPTION_IV_LENGTH || '16', 10);
  }

  /**
   * aes-256-cbc requires a key of exactly 32 bytes. A raw 32-character key is
   * used verbatim (backwards compatible); any other length is digested to a
   * 32-byte hex key. Previously only keys shorter than 32 characters were
   * hashed, so a 32+ character key (including the default fallback and the
   * common 64-character hex key) was passed through unchanged and made
   * `createCipheriv` throw "Invalid key length".
   */
  private normalizeKey(rawKey: string): string {
    if (this.algorithm === 'aes-256-cbc' && rawKey.length !== 32) {
      return crypto.createHash('sha256').update(rawKey, 'utf8').digest('hex').slice(0, 32);
    }
    return rawKey;
  }

  encrypt(text: string): { encryptedText: string; iv: string } {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(this.encryptionKey), iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
      encryptedText: encrypted,
      iv: iv.toString('hex'),
    };
  }

  decrypt(encryptedText: string, iv: string): string {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      Buffer.from(this.encryptionKey),
      Buffer.from(iv, 'hex'),
    );

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  hash(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  generateKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
