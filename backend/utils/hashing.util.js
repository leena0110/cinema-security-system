const crypto = require('crypto');
const bcrypt = require('bcryptjs');

class HashingUtil {
  // SHA-256 hashing for data integrity verification
  static sha256(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // bcrypt hashing with salt for password storage
  static async bcryptHash(data, rounds = 12) {
    const salt = await bcrypt.genSalt(rounds);
    return await bcrypt.hash(data, salt);
  }

  // bcrypt compare for password verification
  static async bcryptCompare(data, hash) {
    return await bcrypt.compare(data, hash);
  }

  // Hash booking data for integrity verification
  static hashBookingData(bookingData) {
    const dataString = JSON.stringify(bookingData);
    return this.sha256(dataString);
  }
}

module.exports = HashingUtil;