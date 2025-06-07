
import React, { useState, useEffect } from 'react';

interface AnimatedEyeProps {
  onAnimationComplete: () => void;
}

const AnimatedEye: React.FC<AnimatedEyeProps> = ({ onAnimationComplete }) => {
  const [phase, setPhase] = useState<'eyes' | 'looking-left' | 'looking-right' | 'collapsing' | 'line' | 'expanding'>('eyes');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setPhase('looking-left');
    }, 500);

    const timer2 = setTimeout(() => {
      setPhase('looking-right');
    }, 1200);

    const timer3 = setTimeout(() => {
      setPhase('collapsing');
    }, 1900);

    const timer4 = setTimeout(() => {
      setPhase('line');
    }, 2400);

    const timer5 = setTimeout(() => {
      setPhase('expanding');
    }, 2600);

    const timer6 = setTimeout(() => {
      onAnimationComplete();
    }, 3100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(timer6);
    };
  }, [onAnimationComplete]);

  const getEyePosition = () => {
    if (phase === 'looking-left') {
      return '-translate-x-1';
    }
    if (phase === 'looking-right') {
      return 'translate-x-1';
    }
    return 'translate-x-0';
  };

  const getFaceTransform = () => {
    if (phase === 'collapsing') {
      return 'scale-x-0 scale-y-100';
    }
    if (phase === 'line') {
      return 'scale-x-0 scale-y-100';
    }
    return 'scale-x-100 scale-y-100';
  };

  if (phase === 'eyes' || phase === 'looking-left' || phase === 'looking-right' || phase === 'collapsing') {
    return (
      <div className="flex items-center justify-center">
        <div className={`relative w-20 h-20 bg-white dark:bg-gray-800 rounded-full border-4 border-blue-500 flex items-center justify-center transition-all duration-500 origin-center ${getFaceTransform()}`}>
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
        <div className="w-80 h-1 bg-blue-500 animate-pulse transition-all duration-500"></div>
      </div>
    );
  }

  return null;
};

export default AnimatedEye;
