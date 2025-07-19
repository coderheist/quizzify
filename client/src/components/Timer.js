import React, { useState, useEffect } from 'react';
import { FaClock } from 'react-icons/fa';

const Timer = ({ initialTime, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getColorClass = () => {
    const percentage = (timeLeft / initialTime) * 100;
    if (percentage <= 10) return 'text-red-600';
    if (percentage <= 25) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = () => {
    const percentage = (timeLeft / initialTime) * 100;
    if (percentage <= 10) return 'bg-red-500';
    if (percentage <= 25) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-lg">
      <div className={`flex items-center space-x-2 ${getColorClass()} font-mono text-lg font-semibold mb-2`}>
        <FaClock className="h-5 w-5" />
        <span>{formatTime(timeLeft)}</span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-1000 ${getProgressColor()}`}
          style={{ width: `${(timeLeft / initialTime) * 100}%` }}
        ></div>
      </div>
      
      {timeLeft <= 60 && (
        <p className="text-xs text-red-600 mt-1 animate-pulse">
          Time running out!
        </p>
      )}
    </div>
  );
};

export default Timer;