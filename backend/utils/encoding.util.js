class EncodingUtil {
  // Base64 Encoding
  static base64Encode(data) {
    return Buffer.from(data).toString('base64');
  }

  // Base64 Decoding
  static base64Decode(encodedData) {
    return Buffer.from(encodedData, 'base64').toString('utf8');
  }

  // Encode booking ID
  static encodeBookingId(id) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `BK${timestamp}${random}${id}`.toUpperCase();
  }
}

module.exports = EncodingUtil;