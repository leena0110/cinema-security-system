import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import authService from '../../services/auth.service';
import TextType from '../TextType/TextType';
import StarBorder from '../StarBorder/StarBorder';
import FuzzyText from '../FuzzyText/FuzzyText';
import './Login.css';

const Login = ({ showAnimation = false }) => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [step, setStep] = useState(1); // 1: credentials, 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [otpData, setOtpData] = useState({
    userId: '',
    otp: '',
    maskedEmail: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtpData({
      ...otpData,
      otp: value
    });
    setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validation
      if (!formData.username || !formData.email || !formData.password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long');
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      const response = await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      setSuccess(response.message);
      setTimeout(() => {
        setIsRegister(false);
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.username || !formData.password) {
        setError('Please enter username and password');
        setLoading(false);
        return;
      }

      const response = await authService.login({
        username: formData.username,
        password: formData.password
      });

      if (response.data.requiresOTP) {
        setOtpData({
          userId: response.data.userId,
          otp: '',
          maskedEmail: response.data.email
        });
        setStep(2);
        setSuccess(response.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (otpData.otp.length !== 6) {
        setError('Please enter 6-digit OTP');
        setLoading(false);
        return;
      }

      const response = await authService.verifyOTP({
        userId: otpData.userId,
        otp: otpData.otp
      });

      login(response.data.token, response.data.user);
      navigate('/movies');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authService.resendOTP(otpData.userId);
      setSuccess(response.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setStep(1);
    setOtpData({ userId: '', otp: '', maskedEmail: '' });
    setError('');
    setSuccess('');
  };

  return (
    <div className="login-container">
      <StarBorder
        as="div"
        className="login-star-border"
        color="#b76e79"
        speed="8s"
        thickness={2}
      >
        <div className="login-box">
        <div className="login-header">
          <h1>
            {showAnimation ? (
              <TextType
                text="🎬 Cinema Booking"
                typingSpeed={75}
                loop={false}
                showCursor
                cursorCharacter="_"
                cursorBlinkDuration={0.5}
              />
            ) : (
              '🎬 Cinema Booking'
            )}
          </h1>
          <p>
            {showAnimation ? (
              <TextType
                text="Secure Seat Reservation System"
                typingSpeed={50}
                initialDelay={1500}
                loop={false}
                showCursor
                cursorCharacter="_"
                cursorBlinkDuration={0.5}
              />
            ) : (
              'Secure Seat Reservation System'
            )}
          </p>
        </div>

        {error && (
          <div className="alert alert-danger alert-fuzzy">
            <span className="alert-icon">⚠️</span>
            <FuzzyText
              fontSize="14px"
              fontWeight={600}
              fontFamily="Poppins, sans-serif"
              color="#dc2626"
              baseIntensity={0.2}
              hoverIntensity={0.5}
              enableHover
              fuzzRange={10}
              glitchMode
              glitchInterval={1500}
              glitchDuration={150}
              className="fuzzy-error-text"
            >
              {error}
            </FuzzyText>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span>✓</span>
            {success}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={isRegister ? handleRegister : handleLogin}>
            <h2>
              {showAnimation ? (
                <TextType
                  text={isRegister ? 'Create Account' : 'Welcome Back'}
                  typingSpeed={75}
                  initialDelay={3000}
                  loop={false}
                  showCursor
                  cursorCharacter="_"
                  cursorBlinkDuration={0.5}
                />
              ) : (
                isRegister ? 'Create Account' : 'Welcome Back'
              )}
            </h2>

            <div className="form-group">
              <label className="form-label">
                {showAnimation ? (
                  <TextType
                    text="Username"
                    typingSpeed={60}
                    initialDelay={4000}
                    loop={false}
                    showCursor={false}
                  />
                ) : (
                  'Username'
                )}
              </label>
              <input
                type="text"
                name="username"
                className="form-input"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            {isRegister && (
              <div className="form-group">
                <label className="form-label">
                  {showAnimation ? (
                    <TextType
                      text="Email"
                      typingSpeed={60}
                      initialDelay={4300}
                      loop={false}
                      showCursor={false}
                    />
                  ) : (
                    'Email'
                  )}
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                {showAnimation ? (
                  <TextType
                    text="Password"
                    typingSpeed={60}
                    initialDelay={isRegister ? 4600 : 4300}
                    loop={false}
                    showCursor={false}
                  />
                ) : (
                  'Password'
                )}
              </label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {isRegister && (
                <small className="form-hint">
                  Must be at least 8 characters
                </small>
              )}
            </div>

            {isRegister && (
              <div className="form-group">
                <label className="form-label">
                  {showAnimation ? (
                    <TextType
                      text="Confirm Password"
                      typingSpeed={60}
                      initialDelay={4900}
                      loop={false}
                      showCursor={false}
                    />
                  ) : (
                    'Confirm Password'
                  )}
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-input"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  Processing...
                </>
              ) : (
                isRegister ? 'Register' : 'Login'
              )}
            </button>

            <div className="login-footer">
              <p style={{ fontSize: '2rem', fontWeight: 600 }}>
                {isRegister ? 'Already have an account?' : "Don't have an account?"}
                <button
                  type="button"
                  className="link-button"
                  style={{ fontSize: '2rem', fontWeight: 700, marginLeft: '8px' }}
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError('');
                    setSuccess('');
                    setFormData({
                      username: '',
                      email: '',
                      password: '',
                      confirmPassword: ''
                    });
                  }}
                >
                  {isRegister ? 'Login' : 'Register'}
                </button>
              </p>
            </div>

            {/* Security Features section removed as requested */}
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <h2>Verify Your Identity</h2>
            <p className="otp-description">
              We've sent a 6-digit OTP to<br />
              <strong>{otpData.maskedEmail}</strong>
            </p>

            <div className="form-group">
              <label className="form-label">Enter OTP</label>
              <input
                type="text"
                className="form-input otp-input"
                placeholder="000000"
                value={otpData.otp}
                onChange={handleOtpChange}
                maxLength={6}
                required
              />
              <small className="form-hint">
                Valid for 5 minutes
              </small>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading || otpData.otp.length !== 6}
            >
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  Verifying...
                </>
              ) : (
                'Verify & Login'
              )}
            </button>

            <div className="otp-actions">
              <button
                type="button"
                className="link-button"
                onClick={handleResendOTP}
                disabled={loading}
              >
                Resend OTP
              </button>
              <button
                type="button"
                className="link-button"
                onClick={handleBackToLogin}
              >
                Back to Login
              </button>
            </div>

            <div className="otp-info">
              <p>🔐 <strong>Security Tips:</strong></p>
              <ul>
                <li>Never share your OTP with anyone</li>
                <li>Check your spam folder if you don't see the email</li>
                <li>Contact support if you don't receive the OTP</li>
              </ul>
            </div>
          </form>
        )}
      </div>
      </StarBorder>
    </div>
  );
};

export default Login;