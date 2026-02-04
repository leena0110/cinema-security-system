const AccessControl = require('../models/AccessControl.model');
const accessControlUtil = require('../utils/accessControl.util');

// Initialize or update access control data in DB
const syncAccessControlToDB = async () => {
  // Matrix
  await AccessControl.findOneAndUpdate(
    { type: 'matrix' },
    { data: accessControlUtil.accessControlMatrix, updatedAt: new Date() },
    { upsert: true }
  );
  // ACL
  await AccessControl.findOneAndUpdate(
    { type: 'acl' },
    { data: accessControlUtil.acl, updatedAt: new Date() },
    { upsert: true }
  );
};

// Get current access control policy from DB
const getAccessControlPolicy = async (req, res) => {
  try {
    const matrix = await AccessControl.findOne({ type: 'matrix' });
    const acl = await AccessControl.findOne({ type: 'acl' });
    res.json({
      success: true,
      matrix: matrix ? matrix.data : null,
      acl: acl ? acl.data : null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching access control policy', error: error.message });
  }
};

module.exports = { syncAccessControlToDB, getAccessControlPolicy };