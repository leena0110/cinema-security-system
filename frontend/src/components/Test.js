import React from 'react';

const Test = () => {
  return (
    <div style={{ 
      background: 'white', 
      padding: '50px',
      borderRadius: '10px',
      textAlign: 'center',
      margin: '100px auto',
      maxWidth: '500px'
    }}>
      <h1>Test Component Working!</h1>
      <p>If you can see this, React is rendering correctly.</p>
      <p>Check the routes in App.js</p>
    </div>
  );
};

export default Test;