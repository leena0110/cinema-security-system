const crypto = require('crypto');

class EncryptionUtil {
  constructor() {
    this.algorithm = 'aes-256-cbc';
    // AES-256 requires a 32-byte key
    // If ENCRYPTION_KEY is a hex string (64 chars), convert from hex
    // Otherwise generate a random 32-byte key
    const envKey = process.env.ENCRYPTION_KEY;
    if (envKey && envKey.length === 64) {
      // Hex string - convert to buffer
      this.key = Buffer.from(envKey, 'hex');
    } else if (envKey && envKey.length === 32) {
      // Already 32 bytes
      this.key = Buffer.from(envKey);
    } else {
      // Generate random key
      this.key = crypto.randomBytes(32);
    }
  }

  // AES Encryption (Base64 output)
  encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(text, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return {
      iv: iv.toString('hex'),
      encryptedData: encrypted.toString('base64') // Store as base64
    };
  }

  // AES Decryption (Base64 input)
  decrypt(encryptedData, iv) {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(iv, 'hex')
    );
    const encryptedBuffer = Buffer.from(encryptedData, 'base64');
    let decrypted = decipher.update(encryptedBuffer, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  // Encrypt booking details
  encryptBookingData(bookingData) {
    const dataString = JSON.stringify(bookingData);
    return this.encrypt(dataString);
  }

  // Decrypt booking details
  decryptBookingData(encryptedData, iv) {
    const decrypted = this.decrypt(encryptedData, iv);
    return JSON.parse(decrypted);
  }
}

module.exports = new EncryptionUtil();