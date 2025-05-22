import { useEffect } from 'react';
import { useTheme } from '../themeContext';
import './shootingStars.css';

export default function ShootingStars() {
  const { darkMode } = useTheme();
  
  return (
    <div className="shooting-stars-container">
      <div className={`background dark-mode ${darkMode ? 'visible' : 'hidden'}`}></div>
      <div className={`background light-mode ${darkMode ? 'hidden' : 'visible'}`}></div>
      <div className="night">
        {[...Array(80)].map((_, i) => (
          <div 
            key={i} 
            className={`twinkling_star ${darkMode ? 'dark-star' : 'light-star'}`}
          ></div>
        ))}
      </div>
    </div>
  );
}