const crypto = require('crypto');

class DigitalSignatureUtil {
  constructor() {
    // Generate key pair for digital signatures
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });
    
    this.privateKey = privateKey;
    this.publicKey = publicKey;
  }

  // Create digital signature
  sign(data) {
    const sign = crypto.createSign('SHA256');
    sign.update(data);
    sign.end();
    return sign.sign(this.privateKey, 'hex');
  }

  // Verify digital signature
  verify(data, signature) {
    const verify = crypto.createVerify('SHA256');
    verify.update(data);
    verify.end();
    return verify.verify(this.publicKey, signature, 'hex');
  }

  // Sign booking data
  signBooking(bookingData) {
    const dataString = JSON.stringify(bookingData);
    return this.sign(dataString);
  }

  // Verify booking signature
  verifyBooking(bookingData, signature) {
    const dataString = JSON.stringify(bookingData);
    return this.verify(dataString, signature);
  }
}

module.exports = new DigitalSignatureUtil();