import api from './api';

const securityService = {
  // Hash data
  hashData: async (data, algorithm = 'sha256') => {
    const response = await api.post('/security/hash', { data, algorithm });
    return response.data;
  },

  // Hash with salt (bcrypt + HMAC)
  hashWithSalt: async (data) => {
    const response = await api.post('/security/hash-with-salt', { data });
    return response.data;
  },

  // Encrypt data
  encryptData: async (data) => {
    const response = await api.post('/security/encrypt', { data });
    return response.data;
  },

  // Decrypt data
  decryptData: async (encryptedData, iv) => {
    const response = await api.post('/security/decrypt', { encryptedData, iv });
    return response.data;
  },

  // Hybrid encryption (RSA + AES)
  hybridEncrypt: async (data) => {
    const response = await api.post('/security/hybrid-encrypt', { data });
    return response.data;
  },

  // Encode data
  encodeData: async (data, encoding = 'base64') => {
    const response = await api.post('/security/encode', { data, encoding });
    return response.data;
  },

  // Generate QR code data
  generateQRCode: async (bookingData) => {
    const response = await api.post('/security/encode/qr', { bookingData });
    return response.data;
  },

  // Verify QR code
  verifyQRCode: async (qrData) => {
    const response = await api.post('/security/encode/verify-qr', { qrData });
    return response.data;
  },

  // Sign data
  signData: async (data) => {
    const response = await api.post('/security/sign', { data });
    return response.data;
  },

  // Verify signature
  verifySignature: async (data, signature) => {
    const response = await api.post('/security/verify-signature', { data, signature });
    return response.data;
  },

  // Generate RSA key pair
  generateRSAKeys: async () => {
    const response = await api.post('/security/key-exchange/generate-rsa');
    return response.data;
  },

  // Generate DH key pair
  generateDHKeys: async () => {
    const response = await api.post('/security/key-exchange/generate-dh');
    return response.data;
  },

  // Get access control matrix
  getAccessControlMatrix: async () => {
    const response = await api.get('/security/access-control/matrix');
    return response.data;
  },

  // Get access control policy
  getAccessControlPolicy: async () => {
    const response = await api.get('/security/access-control/policy');
    return response.data;
  },

  // Check permission
  checkPermission: async (object, action) => {
    const response = await api.post('/security/access-control/check', { object, action });
    return response.data;
  },

  // Get security overview
  getSecurityOverview: async () => {
    const response = await api.get('/security/overview');
    return response.data;
  }
};

export default securityService;