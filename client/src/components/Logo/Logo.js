import React from 'react';
import Tilt from 'react-parallax-tilt';
import './Logo.css';
import brain from './brain.png';
const Logo = () => {
  return (
    <div className="ma4 mt0">
      <Tilt>
        <div
          className="Tilt br2 shadow-2 pa4"
          style={{ height: 150, width: 150 }}
        >
          <img src={brain} alt="logo" />
        </div>
      </Tilt>
    </div>
  );
};

export default Logo;
