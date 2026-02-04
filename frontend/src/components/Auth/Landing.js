import React, { useRef, useState } from 'react';
import Login from './Login';
import SplitText from '../SplitText/SplitText';
import './Landing.css';

const Landing = () => {
  const containerRef = useRef(null);
  const loginSectionRef = useRef(null);
  const [showLogin, setShowLogin] = useState(false);

  const scrollToLogin = () => {
    setShowLogin(true);
    setTimeout(() => {
      loginSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div ref={containerRef} className="landing-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <SplitText
            text="Welcome to"
            className="hero-title"
            tag="h1"
            delay={30}
            splitType="chars"
          />
          
          <SplitText
            text="Secure Ticket Reservation System"
            className="hero-subtitle"
            tag="h2"
            delay={20}
            splitType="chars"
          />

          <div className="scroll-indicator" onClick={scrollToLogin}>
            <span className="scroll-text">Click to Login</span>
            <div className="scroll-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12l7 7 7-7"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Login Section */}
      <section ref={loginSectionRef} className={`login-section ${showLogin ? 'visible' : ''}`}>
        <Login showAnimation={showLogin} />
      </section>
    </div>
  );
};

export default Landing;
