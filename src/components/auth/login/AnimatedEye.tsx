
import React, { useState, useEffect } from 'react';

interface AnimatedEyeProps {
  onAnimationComplete: () => void;
}

const AnimatedEye: React.FC<AnimatedEyeProps> = ({ onAnimationComplete }) => {
  const [phase, setPhase] = useState<'eyes' | 'looking-left' | 'looking-right' | 'expanding-modal'>('eyes');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setPhase('looking-left');
    }, 500);

    const timer2 = setTimeout(() => {
      setPhase('looking-right');
    }, 1200);

    const timer3 = setTimeout(() => {
      setPhase('expanding-modal');
    }, 1900);

    const timer4 = setTimeout(() => {
      onAnimationComplete();
    }, 3900);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
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

  const getTransform = () => {
    if (phase === 'expanding-modal') {
      return 'scale-x-2000 scale-y-2000';
    }
    return 'scale-x-100 scale-y-100';
  };

  const getDuration = () => {
    if (phase === 'expanding-modal') {
      return 'duration-2000';
    }
    return 'duration-300';
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`relative w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full border-4 border-blue-500 flex items-center justify-center transition-all ${getDuration()} ease-out origin-center ${getTransform()}`}>
        {phase !== 'expanding-modal' && (
          <>
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
          </>
        )}
        {phase === 'expanding-modal' && (
          <div className="text-white font-semibold opacity-0 animate-fade-in animation-delay-1000">
            Stock2Store
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimatedEye;
