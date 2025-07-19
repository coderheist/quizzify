import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  initialTime: number; // in seconds
  onTimeUp: () => void;
}

const Timer: React.FC<TimerProps> = ({ initialTime, onTimeUp }) => {
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

  const formatTime = (seconds: number) => {
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

  return (
    <div className={`flex items-center space-x-2 ${getColorClass()} font-mono text-lg font-semibold`}>
      <Clock className="h-5 w-5" />
      <span>{formatTime(timeLeft)}</span>
    </div>
  );
};

export default Timer;