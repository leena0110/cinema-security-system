import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import Navigation from './Navigation';
import securityService from '../../services/security.service';
import './SecurityDashboard.css';

const SecurityDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Security Overview state
  const [securityOverview, setSecurityOverview] = useState(null);

  // Hashing state
  const [hashInput, setHashInput] = useState('');
  const [hashAlgorithm, setHashAlgorithm] = useState('sha256');
  const [useSalt, setUseSalt] = useState(false);

  // Encryption state
  const [encryptInput, setEncryptInput] = useState('');
  const [encryptedResult, setEncryptedResult] = useState(null);
  const [decryptData, setDecryptData] = useState('');
  const [decryptIv, setDecryptIv] = useState('');
  const [useHybrid, setUseHybrid] = useState(false);

  // Encoding state
  const [encodeInput, setEncodeInput] = useState('');
  const [encodingType, setEncodingType] = useState('base64');

  // Digital Signature state
  const [signInput, setSignInput] = useState('');
  const [signatureResult, setSignatureResult] = useState(null);
  const [verifyData, setVerifyData] = useState('');
  const [verifySignature, setVerifySignature] = useState('');

  // Access Control state
  const [accessMatrix, setAccessMatrix] = useState(null);
  const [accessPolicy, setAccessPolicy] = useState(null);
  const [checkObject, setCheckObject] = useState('');
  const [checkAction, setCheckAction] = useState('');

  // Key Exchange state
  const [keyExchangeResult, setKeyExchangeResult] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    // Load security overview on mount
    loadSecurityOverview();
  }, [isAuthenticated, navigate]);

  const loadSecurityOverview = async () => {
    try {
      const response = await securityService.getSecurityOverview();
      setSecurityOverview(response.securityOverview);
    } catch (err) {
      console.error('Failed to load security overview:', err);
    }
  };

  // Hashing Functions
  const handleHash = async () => {
    if (!hashInput.trim()) {
      setError('Please enter data to hash');
      return;
    }

    try {
      setLoading(true);
      setError('');
      let response;
      if (useSalt) {
        response = await securityService.hashWithSalt(hashInput);
        setResult({
          type: 'hash_salt',
          data: response
        });
      } else {
        response = await securityService.hashData(hashInput, hashAlgorithm);
        setResult({
          type: 'hash',
          data: response
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Hashing failed');
    } finally {
      setLoading(false);
    }
  };

  // Key Exchange Functions
  const handleGenerateRSAKeys = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await securityService.generateRSAKeys();
      setKeyExchangeResult(response);
      setResult({
        type: 'key_exchange',
        data: response
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Key generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDHKeys = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await securityService.generateDHKeys();
      setKeyExchangeResult(response);
      setResult({
        type: 'key_exchange_dh',
        data: response
      });
    } catch (err) {
      setError(err.response?.data?.message || 'DH key generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleHybridEncrypt = async () => {
    if (!encryptInput.trim()) {
      setError('Please enter data to encrypt');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const response = await securityService.hybridEncrypt(encryptInput);
      setResult({
        type: 'hybrid_encrypt',
        data: response
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Hybrid encryption failed');
    } finally {
      setLoading(false);
    }
  };

  // Access Control Policy
  const handleGetPolicy = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await securityService.getAccessControlPolicy();
      setAccessPolicy(response.policyDocument);
      setResult({
        type: 'policy',
        data: response
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch policy');
    } finally {
      setLoading(false);
    }
  };

  // Encryption Functions
  const handleEncrypt = async () => {
    if (!encryptInput.trim()) {
      setError('Please enter data to encrypt');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await securityService.encryptData(encryptInput);
      setEncryptedResult(response.encrypted);
      setResult({
        type: 'encrypt',
        data: response
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Encryption failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async () => {
    if (!decryptData.trim() || !decryptIv.trim()) {
      setError('Please enter encrypted data and IV');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await securityService.decryptData(decryptData, decryptIv);
      setResult({
        type: 'decrypt',
        data: response
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Decryption failed');
    } finally {
      setLoading(false);
    }
  };

  // Encoding Functions
  const handleEncode = async () => {
    if (!encodeInput.trim()) {
      setError('Please enter data to encode');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await securityService.encodeData(encodeInput, encodingType);
      setResult({
        type: 'encode',
        data: response
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Encoding failed');
    } finally {
      setLoading(false);
    }
  };

  // Digital Signature Functions
  const handleSign = async () => {
    if (!signInput.trim()) {
      setError('Please enter data to sign');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await securityService.signData(signInput);
      setSignatureResult(response.signature);
      setResult({
        type: 'sign',
        data: response
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Signing failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySignature = async () => {
    if (!verifyData.trim() || !verifySignature.trim()) {
      setError('Please enter data and signature to verify');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await securityService.verifySignature(verifyData, verifySignature);
      setResult({
        type: 'verify',
        data: response
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Access Control Functions
  const handleGetAccessMatrix = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await securityService.getAccessControlMatrix();
      setAccessMatrix(response);
      setResult({
        type: 'access_matrix',
        data: response
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch access matrix');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckPermission = async () => {
    if (!checkObject.trim() || !checkAction.trim()) {
      setError('Please enter object and action');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await securityService.checkPermission(checkObject, checkAction);
      setResult({
        type: 'permission_check',
        data: response
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Permission check failed');
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="security-panel">
            <h2>📋 Security Overview</h2>
            <p className="panel-description">
              Complete overview of all security features implemented in the Cinema Booking System.
            </p>

            {securityOverview ? (
              <div className="overview-grid">
                <div className="overview-card">
                  <h3>🔐 Authentication</h3>
                  <div className="overview-content">
                    <p><strong>Single-Factor:</strong> {securityOverview.authentication?.singleFactor?.method}</p>
                    <p><strong>Multi-Factor:</strong> {securityOverview.authentication?.multiFactor?.method}</p>
                    <p><strong>Standard:</strong> {securityOverview.authentication?.singleFactor?.standard}</p>
                  </div>
                </div>
                
                <div className="overview-card">
                  <h3>🔑 Authorization</h3>
                  <div className="overview-content">
                    <p><strong>Model:</strong> {securityOverview.authorization?.model}</p>
                    <p><strong>Subjects:</strong> {securityOverview.authorization?.subjects?.join(', ')}</p>
                    <p><strong>Objects:</strong> {securityOverview.authorization?.objects?.join(', ')}</p>
                  </div>
                </div>

                <div className="overview-card">
                  <h3>🔒 Encryption</h3>
                  <div className="overview-content">
                    <p><strong>Symmetric:</strong> {securityOverview.encryption?.symmetric}</p>
                    <p><strong>Asymmetric:</strong> {securityOverview.encryption?.asymmetric}</p>
                    <p><strong>Hybrid:</strong> {securityOverview.encryption?.hybrid}</p>
                    <p><strong>Key Exchange:</strong> {securityOverview.encryption?.keyExchange}</p>
                  </div>
                </div>

                <div className="overview-card">
                  <h3>#️⃣ Hashing</h3>
                  <div className="overview-content">
                    <p><strong>Passwords:</strong> {securityOverview.hashing?.passwords}</p>
                    <p><strong>Data Integrity:</strong> {securityOverview.hashing?.dataIntegrity}</p>
                    <p><strong>Message Auth:</strong> {securityOverview.hashing?.messageAuth}</p>
                  </div>
                </div>

                <div className="overview-card">
                  <h3>✍️ Digital Signature</h3>
                  <div className="overview-content">
                    <p><strong>Algorithm:</strong> {securityOverview.digitalSignature?.algorithm}</p>
                    <p><strong>Key Size:</strong> {securityOverview.digitalSignature?.keySize}</p>
                    <p><strong>Usage:</strong> {securityOverview.digitalSignature?.usage}</p>
                  </div>
                </div>

                <div className="overview-card">
                  <h3>📝 Encoding</h3>
                  <div className="overview-content">
                    <p><strong>Methods:</strong> {securityOverview.encoding?.methods?.join(', ')}</p>
                    <p><strong>QR Code:</strong> {securityOverview.encoding?.qrCode}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p>Loading security overview...</p>
            )}
          </div>
        );

      case 'hashing':
        return (
          <div className="security-panel">
            <h2>#️⃣ Hashing with Salt</h2>
            <p className="panel-description">
              Hash functions convert data into a fixed-size string. <strong>Salting</strong> adds random data before hashing to prevent rainbow table attacks.
            </p>

            <div className="form-group">
              <label className="form-label">Select Algorithm</label>
              <select
                className="form-input"
                value={hashAlgorithm}
                onChange={(e) => setHashAlgorithm(e.target.value)}
                disabled={useSalt}
              >
                <option value="sha256">SHA-256</option>
                <option value="sha512">SHA-512</option>
                <option value="md5">MD5 (Not recommended)</option>
              </select>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={useSalt}
                  onChange={(e) => setUseSalt(e.target.checked)}
                />
                <span>Use Salted Hashing (bcrypt + HMAC)</span>
              </label>
              <p className="form-hint">Recommended for passwords and sensitive data</p>
            </div>

            <div className="form-group">
              <label className="form-label">Input Data</label>
              <textarea
                className="form-input"
                rows="4"
                placeholder="Enter data to hash..."
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={handleHash}
              disabled={loading}
            >
              {loading ? 'Hashing...' : useSalt ? 'Generate Salted Hash' : 'Generate Hash'}
            </button>

            <div className="security-info">
              <h4>Why Use Salt?</h4>
              <ul>
                <li><strong>Prevents Rainbow Table Attacks:</strong> Pre-computed hash tables become useless</li>
                <li><strong>Unique Hashes:</strong> Same password produces different hashes for different users</li>
                <li><strong>bcrypt:</strong> Includes 12 rounds of salt automatically</li>
                <li><strong>HMAC:</strong> Keyed hashing for message authentication</li>
              </ul>
            </div>
          </div>
        );

      case 'encryption':
        return (
          <div className="security-panel">
            <h2>🔒 Encryption & Decryption</h2>
            <p className="panel-description">
              AES-256-CBC encryption is used to secure sensitive data. Encrypted data can only be decrypted with the correct key and IV.
            </p>

            <div className="encryption-section">
              <h3>Encrypt Data</h3>
              <div className="form-group">
                <label className="form-label">Data to Encrypt</label>
                <textarea
                  className="form-input"
                  rows="4"
                  placeholder="Enter sensitive data to encrypt..."
                  value={encryptInput}
                  onChange={(e) => setEncryptInput(e.target.value)}
                />
              </div>

              <button
                className="btn btn-primary"
                onClick={handleEncrypt}
                disabled={loading}
              >
                {loading ? 'Encrypting...' : 'Encrypt Data'}
              </button>
            </div>

            {encryptedResult && (
              <div className="divider-section">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setDecryptData(encryptedResult.encryptedData);
                    setDecryptIv(encryptedResult.iv);
                  }}
                >
                  Use in Decrypt →
                </button>
              </div>
            )}

            <div className="encryption-section">
              <h3>Decrypt Data</h3>
              <div className="form-group">
                <label className="form-label">Encrypted Data</label>
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder="Enter encrypted data..."
                  value={decryptData}
                  onChange={(e) => setDecryptData(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">IV (Initialization Vector)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter IV..."
                  value={decryptIv}
                  onChange={(e) => setDecryptIv(e.target.value)}
                />
              </div>

              <button
                className="btn btn-primary"
                onClick={handleDecrypt}
                disabled={loading}
              >
                {loading ? 'Decrypting...' : 'Decrypt Data'}
              </button>
            </div>

            <div className="security-info">
              <h4>Use Cases:</h4>
              <ul>
                <li>Protecting sensitive user data</li>
                <li>Secure data transmission</li>
                <li>Payment information encryption</li>
                <li>Booking details protection</li>
              </ul>
            </div>
          </div>
        );

      case 'encoding':
        return (
          <div className="security-panel">
            <h2>📝 Encoding</h2>
            <p className="panel-description">
              Encoding transforms data into a different format for transmission or storage. Unlike encryption, it's not for security but for data representation.
            </p>

            <div className="form-group">
              <label className="form-label">Select Encoding Type</label>
              <select
                className="form-input"
                value={encodingType}
                onChange={(e) => setEncodingType(e.target.value)}
              >
                <option value="base64">Base64</option>
                <option value="hex">Hexadecimal</option>
                <option value="url">URL Encoding</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Input Data</label>
              <textarea
                className="form-input"
                rows="4"
                placeholder="Enter data to encode..."
                value={encodeInput}
                onChange={(e) => setEncodeInput(e.target.value)}
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={handleEncode}
              disabled={loading}
            >
              {loading ? 'Encoding...' : 'Encode Data'}
            </button>

            <div className="security-info">
              <h4>Use Cases:</h4>
              <ul>
                <li>Binary data transmission over text protocols</li>
                <li>Embedding images in HTML/CSS</li>
                <li>URL parameter encoding</li>
                <li>Data serialization</li>
              </ul>
            </div>
          </div>
        );

      case 'signature':
        return (
          <div className="security-panel">
            <h2>✍️ Digital Signatures</h2>
            <p className="panel-description">
              Digital signatures use RSA cryptography to verify data authenticity and integrity. They ensure data hasn't been tampered with.
            </p>

            <div className="encryption-section">
              <h3>Sign Data</h3>
              <div className="form-group">
                <label className="form-label">Data to Sign</label>
                <textarea
                  className="form-input"
                  rows="4"
                  placeholder="Enter data to create signature..."
                  value={signInput}
                  onChange={(e) => setSignInput(e.target.value)}
                />
              </div>

              <button
                className="btn btn-primary"
                onClick={handleSign}
                disabled={loading}
              >
                {loading ? 'Signing...' : 'Create Signature'}
              </button>
            </div>

            {signatureResult && (
              <div className="divider-section">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setVerifyData(signInput);
                    setVerifySignature(signatureResult);
                  }}
                >
                  Use in Verify →
                </button>
              </div>
            )}

            <div className="encryption-section">
              <h3>Verify Signature</h3>
              <div className="form-group">
                <label className="form-label">Original Data</label>
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder="Enter original data..."
                  value={verifyData}
                  onChange={(e) => setVerifyData(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Signature</label>
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder="Enter signature to verify..."
                  value={verifySignature}
                  onChange={(e) => setVerifySignature(e.target.value)}
                />
              </div>

              <button
                className="btn btn-primary"
                onClick={handleVerifySignature}
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify Signature'}
              </button>
            </div>

            <div className="security-info">
              <h4>Use Cases:</h4>
              <ul>
                <li>Booking confirmation verification</li>
                <li>Document authentication</li>
                <li>Transaction integrity</li>
                <li>Non-repudiation proof</li>
              </ul>
            </div>
          </div>
        );

      case 'access':
        return (
          <div className="security-panel">
            <h2>🔑 Access Control</h2>
            <p className="panel-description">
              Role-Based Access Control (RBAC) manages permissions based on user roles. View your access matrix and check specific permissions.
            </p>

            <div className="encryption-section">
              <h3>Your Access Matrix</h3>
              <p>Current Role: <strong className="text-primary">{user?.role}</strong></p>
              
              <button
                className="btn btn-primary"
                onClick={handleGetAccessMatrix}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'View Access Matrix'}
              </button>

              {accessMatrix && (
                <div className="access-matrix-display">
                  <h4>Your Permissions:</h4>
                  <div className="permissions-grid">
                    {Object.entries(accessMatrix.permissions).map(([object, actions]) => (
                      <div key={object} className="permission-card">
                        <div className="permission-object">{object}</div>
                        <div className="permission-actions">
                          {actions.length > 0 ? (
                            actions.map(action => (
                              <span key={action} className="badge badge-success">
                                {action}
                              </span>
                            ))
                          ) : (
                            <span className="badge badge-danger">No Access</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="encryption-section">
              <h3>Check Specific Permission</h3>
              <div className="form-group">
                <label className="form-label">Object</label>
                <select
                  className="form-input"
                  value={checkObject}
                  onChange={(e) => setCheckObject(e.target.value)}
                >
                  <option value="">Select object...</option>
                  <option value="movies">Movies</option>
                  <option value="bookings">Bookings</option>
                  <option value="users">Users</option>
                  <option value="reports">Reports</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Action</label>
                <select
                  className="form-input"
                  value={checkAction}
                  onChange={(e) => setCheckAction(e.target.value)}
                >
                  <option value="">Select action...</option>
                  <option value="read">Read</option>
                  <option value="create">Create</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                </select>
              </div>

              <button
                className="btn btn-primary"
                onClick={handleCheckPermission}
                disabled={loading}
              >
                {loading ? 'Checking...' : 'Check Permission'}
              </button>
            </div>

            <div className="security-info">
              <h4>Role Hierarchy:</h4>
              <ul>
                <li><strong>User:</strong> Can view movies and manage own bookings</li>
                <li><strong>Manager:</strong> Can manage movies, bookings, and view reports</li>
                <li><strong>Admin:</strong> Full system access including user management</li>
              </ul>
            </div>
          </div>
        );

      case 'keyexchange':
        return (
          <div className="security-panel">
            <h2>🔑 Key Exchange Mechanisms</h2>
            <p className="panel-description">
              Key exchange allows two parties to securely establish a shared secret key over an insecure channel.
            </p>

            <div className="encryption-section">
              <h3>RSA Key Generation</h3>
              <p>Generate RSA-2048 key pair for asymmetric encryption and key exchange.</p>
              <button
                className="btn btn-primary"
                onClick={handleGenerateRSAKeys}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate RSA Keys'}
              </button>
            </div>

            <div className="encryption-section">
              <h3>Diffie-Hellman Key Exchange</h3>
              <p>Generate DH parameters for secure key exchange between parties.</p>
              <button
                className="btn btn-primary"
                onClick={handleGenerateDHKeys}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate DH Key Pair'}
              </button>
            </div>

            <div className="encryption-section">
              <h3>Hybrid Encryption (RSA + AES)</h3>
              <p>Combine RSA for key exchange with AES for data encryption.</p>
              <div className="form-group">
                <label className="form-label">Data to Encrypt</label>
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder="Enter data for hybrid encryption..."
                  value={encryptInput}
                  onChange={(e) => setEncryptInput(e.target.value)}
                />
              </div>
              <button
                className="btn btn-primary"
                onClick={handleHybridEncrypt}
                disabled={loading}
              >
                {loading ? 'Encrypting...' : 'Hybrid Encrypt'}
              </button>
            </div>

            <div className="security-info">
              <h4>How Key Exchange Works:</h4>
              <ul>
                <li><strong>RSA:</strong> Public key encrypts, private key decrypts</li>
                <li><strong>Diffie-Hellman:</strong> Both parties compute same secret independently</li>
                <li><strong>Hybrid:</strong> RSA exchanges AES key, AES encrypts data (best of both)</li>
              </ul>
            </div>
          </div>
        );

      case 'theory':
        return (
          <div className="security-panel">
            <h2>📚 Security Theory & Analysis</h2>
            <p className="panel-description">
              Understanding security levels, risks, and possible attacks is crucial for building secure applications.
            </p>

            <div className="theory-section">
              <h3>🔒 Security Levels</h3>
              <div className="security-levels">
                <div className="level-card level-1">
                  <h4>Level 1 - Basic</h4>
                  <p>Password-only authentication</p>
                  <span className="level-risk">High Risk</span>
                </div>
                <div className="level-card level-2">
                  <h4>Level 2 - Enhanced</h4>
                  <p>Password + MFA (OTP/Email)</p>
                  <span className="level-risk">Medium Risk</span>
                </div>
                <div className="level-card level-3 current">
                  <h4>Level 3 - Secure ✓</h4>
                  <p>MFA + Encryption + Digital Signatures</p>
                  <span className="level-risk">Low Risk</span>
                  <span className="current-badge">Current Implementation</span>
                </div>
              </div>
            </div>

            <div className="theory-section">
              <h3>⚠️ Security Risks & Mitigations</h3>
              <table className="risk-table">
                <thead>
                  <tr>
                    <th>Risk</th>
                    <th>Impact</th>
                    <th>Mitigation in Our System</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Weak Passwords</td>
                    <td>Account Compromise</td>
                    <td>bcrypt hashing (12 rounds) + Password policy</td>
                  </tr>
                  <tr>
                    <td>Session Hijacking</td>
                    <td>Unauthorized Access</td>
                    <td>JWT with 24h expiration + Secure storage</td>
                  </tr>
                  <tr>
                    <td>Data Tampering</td>
                    <td>Booking Fraud</td>
                    <td>Digital signatures on all bookings</td>
                  </tr>
                  <tr>
                    <td>Data Breach</td>
                    <td>Privacy Violation</td>
                    <td>AES-256 encryption for sensitive data</td>
                  </tr>
                  <tr>
                    <td>Privilege Escalation</td>
                    <td>Unauthorized Actions</td>
                    <td>Server-side RBAC + Access Control Matrix</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="theory-section">
              <h3>🎯 Possible Attacks & Countermeasures</h3>
              <div className="attack-grid">
                <div className="attack-card">
                  <h4>🔓 Brute Force Attack</h4>
                  <p><strong>Description:</strong> Trying all possible passwords</p>
                  <p><strong>Countermeasure:</strong> Account lockout after 5 failed attempts, bcrypt slow hashing</p>
                </div>
                <div className="attack-card">
                  <h4>🌈 Rainbow Table Attack</h4>
                  <p><strong>Description:</strong> Using pre-computed hash tables</p>
                  <p><strong>Countermeasure:</strong> Salted hashing with bcrypt (unique salt per password)</p>
                </div>
                <div className="attack-card">
                  <h4>🔄 Replay Attack</h4>
                  <p><strong>Description:</strong> Reusing captured authentication tokens</p>
                  <p><strong>Countermeasure:</strong> OTP expiration (5 min), JWT expiration (24h)</p>
                </div>
                <div className="attack-card">
                  <h4>👤 Man-in-the-Middle</h4>
                  <p><strong>Description:</strong> Intercepting communication</p>
                  <p><strong>Countermeasure:</strong> HTTPS, Encryption, Digital Signatures</p>
                </div>
                <div className="attack-card">
                  <h4>💉 SQL Injection</h4>
                  <p><strong>Description:</strong> Injecting malicious SQL queries</p>
                  <p><strong>Countermeasure:</strong> Mongoose ODM with parameterized queries</p>
                </div>
                <div className="attack-card">
                  <h4>📜 XSS Attack</h4>
                  <p><strong>Description:</strong> Injecting malicious scripts</p>
                  <p><strong>Countermeasure:</strong> React's automatic DOM escaping</p>
                </div>
              </div>
            </div>

            <div className="theory-section">
              <h3>📋 NIST SP 800-63-2 Compliance</h3>
              <div className="compliance-list">
                <div className="compliance-item">
                  <span className="check">✓</span>
                  <span>Password minimum 8 characters</span>
                </div>
                <div className="compliance-item">
                  <span className="check">✓</span>
                  <span>Multi-factor authentication (Password + OTP)</span>
                </div>
                <div className="compliance-item">
                  <span className="check">✓</span>
                  <span>Account lockout mechanism</span>
                </div>
                <div className="compliance-item">
                  <span className="check">✓</span>
                  <span>Secure password storage (bcrypt)</span>
                </div>
                <div className="compliance-item">
                  <span className="check">✓</span>
                  <span>Session management with expiration</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderResult = () => {
    if (!result) return null;

    return (
      <div className="result-panel">
        <h3>Result</h3>
        {result.type === 'hash' && (
          <div className="result-content">
            <div className="result-item">
              <span className="result-label">Algorithm:</span>
              <span className="result-value">{result.data.algorithm}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Original Data:</span>
              <span className="result-value">{result.data.originalData}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Hash:</span>
              <code className="result-code">{result.data.hash}</code>
            </div>
          </div>
        )}

        {result.type === 'encrypt' && (
          <div className="result-content">
            <div className="result-item">
              <span className="result-label">Original Data:</span>
              <span className="result-value">{result.data.originalData}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Encrypted Data:</span>
              <code className="result-code">{result.data.encrypted.encryptedData}</code>
            </div>
            <div className="result-item">
              <span className="result-label">IV:</span>
              <code className="result-code">{result.data.encrypted.iv}</code>
            </div>
            <div className="alert alert-info mt-2">
              <span>💡</span>
              Save both the encrypted data and IV to decrypt later
            </div>
          </div>
        )}

        {result.type === 'decrypt' && (
          <div className="result-content">
            <div className="result-item">
              <span className="result-label">Decrypted Data:</span>
              <span className="result-value success-text">{result.data.decryptedData}</span>
            </div>
          </div>
        )}

        {result.type === 'encode' && (
          <div className="result-content">
            <div className="result-item">
              <span className="result-label">Encoding Type:</span>
              <span className="result-value">{result.data.encoding}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Original Data:</span>
              <span className="result-value">{result.data.originalData}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Encoded Data:</span>
              <code className="result-code">{result.data.encoded}</code>
            </div>
          </div>
        )}

        {result.type === 'sign' && (
          <div className="result-content">
            <div className="result-item">
              <span className="result-label">Original Data:</span>
              <span className="result-value">{result.data.originalData}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Digital Signature:</span>
              <code className="result-code">{result.data.signature}</code>
            </div>
            <div className="alert alert-info mt-2">
              <span>💡</span>
              This signature can be used to verify data integrity
            </div>
          </div>
        )}

        {result.type === 'verify' && (
          <div className="result-content">
            <div className="result-item">
              <span className="result-label">Verification Status:</span>
              <span className={`badge ${result.data.isValid ? 'badge-success' : 'badge-danger'}`}>
                {result.data.isValid ? '✓ Valid Signature' : '✗ Invalid Signature'}
              </span>
            </div>
            <div className="alert alert-info mt-2">
              <span>{result.data.isValid ? '✓' : '✗'}</span>
              {result.data.isValid
                ? 'The signature is valid. Data has not been tampered with.'
                : 'The signature is invalid. Data may have been modified.'}
            </div>
          </div>
        )}

        {result.type === 'permission_check' && (
          <div className="result-content">
            <div className="result-item">
              <span className="result-label">Role:</span>
              <span className="result-value">{result.data.role}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Object:</span>
              <span className="result-value">{result.data.object}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Action:</span>
              <span className="result-value">{result.data.action}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Permission:</span>
              <span className={`badge ${result.data.hasPermission ? 'badge-success' : 'badge-danger'}`}>
                {result.data.hasPermission ? '✓ Allowed' : '✗ Denied'}
              </span>
            </div>
          </div>
        )}

        {result.type === 'hash_salt' && (
          <div className="result-content">
            <div className="result-item">
              <span className="result-label">Algorithm:</span>
              <span className="result-value">{result.data.algorithm}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Original Data:</span>
              <span className="result-value">{result.data.originalData}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Salt:</span>
              <code className="result-code">{result.data.salt}</code>
            </div>
            <div className="result-item">
              <span className="result-label">Hash:</span>
              <code className="result-code">{result.data.hash}</code>
            </div>
            <div className="alert alert-info mt-2">
              <span>🧂</span>
              Salt is automatically embedded in bcrypt hash for secure storage
            </div>
          </div>
        )}

        {result.type === 'key_exchange' && (
          <div className="result-content">
            <div className="result-item">
              <span className="result-label">Key Type:</span>
              <span className="result-value">RSA-2048</span>
            </div>
            <div className="result-item">
              <span className="result-label">Public Key (excerpt):</span>
              <code className="result-code">{result.data.publicKey?.substring(0, 100)}...</code>
            </div>
            <div className="result-item">
              <span className="result-label">Private Key (excerpt):</span>
              <code className="result-code">{result.data.privateKey?.substring(0, 100)}...</code>
            </div>
            <div className="alert alert-info mt-2">
              <span>🔑</span>
              Public key is shared openly; Private key must remain secret
            </div>
          </div>
        )}

        {result.type === 'key_exchange_dh' && (
          <div className="result-content">
            <div className="result-item">
              <span className="result-label">Key Type:</span>
              <span className="result-value">Diffie-Hellman</span>
            </div>
            <div className="result-item">
              <span className="result-label">Prime (p):</span>
              <code className="result-code">{result.data.prime?.substring(0, 50)}...</code>
            </div>
            <div className="result-item">
              <span className="result-label">Generator (g):</span>
              <code className="result-code">{result.data.generator}</code>
            </div>
            <div className="result-item">
              <span className="result-label">Public Key:</span>
              <code className="result-code">{result.data.publicKey?.substring(0, 50)}...</code>
            </div>
            <div className="alert alert-info mt-2">
              <span>🤝</span>
              Both parties can compute the same shared secret independently
            </div>
          </div>
        )}

        {result.type === 'hybrid_encrypt' && (
          <div className="result-content">
            <div className="result-item">
              <span className="result-label">Method:</span>
              <span className="result-value">Hybrid (RSA + AES-256)</span>
            </div>
            <div className="result-item">
              <span className="result-label">Encrypted AES Key:</span>
              <code className="result-code">{result.data.encryptedKey?.substring(0, 60)}...</code>
            </div>
            <div className="result-item">
              <span className="result-label">Encrypted Data:</span>
              <code className="result-code">{result.data.encryptedData?.substring(0, 60)}...</code>
            </div>
            <div className="result-item">
              <span className="result-label">IV:</span>
              <code className="result-code">{result.data.iv}</code>
            </div>
            <div className="alert alert-info mt-2">
              <span>🔐</span>
              RSA encrypts the AES key; AES encrypts the data for efficiency
            </div>
          </div>
        )}

        {result.type === 'policy' && (
          <div className="result-content">
            <div className="result-item">
              <span className="result-label">Policy Name:</span>
              <span className="result-value">{result.data.policyName}</span>
            </div>
            <h4 style={{marginTop: '15px'}}>Access Control Matrix:</h4>
            <table className="matrix-table">
              <thead>
                <tr>
                  <th>Subject / Object</th>
                  {result.data.objects?.map(obj => <th key={obj}>{obj}</th>)}
                </tr>
              </thead>
              <tbody>
                {result.data.subjects?.map(subj => (
                  <tr key={subj}>
                    <td><strong>{subj}</strong></td>
                    {result.data.objects?.map(obj => (
                      <td key={obj}>
                        {result.data.matrix?.[subj]?.[obj]?.join(', ') || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="alert alert-info mt-2">
              <span>📋</span>
              {result.data.justification}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Navigation />
      <div className="security-container">
        <div className="security-content">
          <div className="security-header">
            <h1>🔒 Security Dashboard</h1>
            <p>Explore cryptographic operations and access control mechanisms</p>
          </div>

          {error && (
            <div className="alert alert-danger">
              <span>⚠️</span>
              {error}
              <button className="alert-close" onClick={() => setError('')}>×</button>
            </div>
          )}

          <div className="security-tabs">
            <button
              className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('overview');
                setResult(null);
                setError('');
              }}
            >
              📋 Overview
            </button>
            <button
              className={`tab ${activeTab === 'hashing' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('hashing');
                setResult(null);
                setError('');
              }}
            >
              #️⃣ Hashing
            </button>
            <button
              className={`tab ${activeTab === 'encryption' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('encryption');
                setResult(null);
                setError('');
              }}
            >
              🔒 Encryption
            </button>
            <button
              className={`tab ${activeTab === 'keyexchange' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('keyexchange');
                setResult(null);
                setError('');
              }}
            >
              🔑 Key Exchange
            </button>
            <button
              className={`tab ${activeTab === 'encoding' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('encoding');
                setResult(null);
                setError('');
              }}
            >
              📝 Encoding
            </button>
            <button
              className={`tab ${activeTab === 'signature' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('signature');
                setResult(null);
                setError('');
              }}
            >
              ✍️ Digital Signature
            </button>
            <button
              className={`tab ${activeTab === 'access' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('access');
                setResult(null);
                setError('');
              }}
            >
              🔐 Access Control
            </button>
            <button
              className={`tab ${activeTab === 'theory' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('theory');
                setResult(null);
                setError('');
              }}
            >
              📚 Theory
            </button>
          </div>

          <div className="security-workspace">
            <div className="workspace-main">
              {renderTabContent()}
            </div>
            {result && (
              <div className="workspace-result">
                {renderResult()}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SecurityDashboard;