
import React, { useState, useEffect } from 'react';

interface AnimatedEyeProps {
  onAnimationComplete: () => void;
}

const AnimatedEye: React.FC<AnimatedEyeProps> = ({ onAnimationComplete }) => {
  const [phase, setPhase] = useState<'eyes' | 'looking' | 'line' | 'expanding'>('eyes');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setPhase('looking');
    }, 500);

    const timer2 = setTimeout(() => {
      setPhase('line');
    }, 2000);

    const timer3 = setTimeout(() => {
      setPhase('expanding');
    }, 2500);

    const timer4 = setTimeout(() => {
      onAnimationComplete();
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onAnimationComplete]);

  const getEyePosition = () => {
    if (phase === 'looking') {
      return 'translate-x-1';
    }
    return 'translate-x-0';
  };

  if (phase === 'eyes' || phase === 'looking') {
    return (
      <div className="flex items-center justify-center">
        <div className="relative w-20 h-20 bg-white dark:bg-gray-800 rounded-full border-4 border-blue-500 flex items-center justify-center transition-all duration-500">
          {/* Left Eye */}
          <div className="absolute left-3 top-6">
            <div className="w-4 h-4 bg-gray-800 dark:bg-white rounded-full relative">
              <div className={`w-2 h-2 bg-blue-500 rounded-full absolute top-1 left-1 transition-transform duration-300 ${getEyePosition()}`}></div>
            </div>
          </div>
          {/* Right Eye */}
          <div className="absolute right-3 top-6">
            <div className="w-4 h-4 bg-gray-800 dark:bg-white rounded-full relative">
              <div className={`w-2 h-2 bg-blue-500 rounded-full absolute top-1 left-1 transition-transform duration-300 ${getEyePosition()}`}></div>
            </div>
          </div>
          {/* Mouth */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="w-6 h-3 border-b-2 border-gray-800 dark:border-white rounded-b-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'line') {
    return (
      <div className="flex items-center justify-center">
        <div className="w-1 h-20 bg-blue-500 animate-pulse"></div>
      </div>
    );
  }

  if (phase === 'expanding') {
    return (
      <div className="flex items-center justify-center">
        <div className="w-80 h-1 bg-blue-500 animate-pulse"></div>
      </div>
    );
  }

  return null;
};

export default AnimatedEye;
