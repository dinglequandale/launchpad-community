import { useEffect, useState } from 'react';
import './LoadingBar.css';

const LoadingBar = ({ 
  speed = .05, 
  width = '100%', 
  height = '10px',
  backgroundColor = '#f3f3f3',
  progressColor = 'var(--accent)',
  borderRadius = '5px',
  onComplete = () => {}
}) => {
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
  
    useEffect(() => {
      // Reset progress when duration changes
    //   setProgress(0);
      setIsComplete(false);
      
      // Move startTime inside the effect
      const startTime = Date.now();
      
      const interval = setInterval(() => {
        setElapsedTime(elapsedTime+speed);
        const newProgress = Math.min((elapsedTime) * 100, 100);
        
        setProgress(newProgress);
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsComplete(true);
          onComplete();
          return;
        }
      }, 16); // ~60fps
  
      return () => clearInterval(interval);
    }, [speed, onComplete]);
  



  return (
    <div 
      className="loading-bar-container" 
      style={{ 
        width, 
        height, 
        backgroundColor, 
        borderRadius 
      }}
    >
      <div 
        className="loading-bar-progress" 
        style={{ 
          width: `${progress}%`,
          backgroundColor: progressColor,
          borderRadius
        }}
      />
    </div>
  );
};

export default LoadingBar;