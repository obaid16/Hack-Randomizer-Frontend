'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Mechanical Ticker Name Reveal Component
 * 
 * Simulates a precision vertical mechanical drum/flip counter settling on the
 * participant's real name without altering layout height or leaking unrevealed names.
 */
export default function NameReveal({
  name,
  revealed = false,
  isTarget = false,
  isMentor = false,
  onAnimationComplete = null,
  isPresentation = false
}) {
  const shouldReduceMotion = useReducedMotion();
  const [animating, setAnimating] = useState(false);
  const [displayedName, setDisplayedName] = useState(revealed ? name : '');
  const prevRevealedRef = useRef(revealed);

  useEffect(() => {
    // Detect transition from concealed -> revealed
    if (!prevRevealedRef.current && revealed) {
      prevRevealedRef.current = true;

      if (shouldReduceMotion) {
        setDisplayedName(name);
        if (onAnimationComplete) onAnimationComplete();
        return;
      }

      setAnimating(true);

      // Duration: 850ms total sequence
      const timer = setTimeout(() => {
        setDisplayedName(name);
        setAnimating(false);
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }, 850);

      return () => clearTimeout(timer);
    } else if (!revealed) {
      prevRevealedRef.current = false;
      setDisplayedName('');
      setAnimating(false);
    }
  }, [revealed, name, shouldReduceMotion, onAnimationComplete]);

  // Subtle mechanical ticker text steps passing through the reveal aperture
  const tickerSlots = [
    '· · · ROLLING · · ·',
    '■ ■ ■ ■ ■ ■ ■ ■ ■',
    '— VERIFYING —',
    name
  ];

  // Height of one line in viewport
  const slotHeight = isPresentation ? 36 : 26;

  return (
    <div
      className={`relative w-full overflow-hidden select-none transition-colors duration-200 ${
        isPresentation ? 'h-9' : 'h-7'
      } flex items-center`}
    >
      {!revealed && !animating && (
        <div className="flex items-center justify-between w-full text-secondaryText text-xs font-mono">
          <span className="tracking-widest opacity-40">· · · · · · · · · · · ·</span>
          <span
            className={`text-[11px] font-sans px-2 py-0.5 rounded transition-all ${
              isTarget
                ? 'bg-accent-subtle text-accent font-semibold ring-1 ring-accent/30 animate-pulse'
                : 'text-secondaryText/60'
            }`}
          >
            {isTarget ? 'Click to reveal' : 'Concealed'}
          </span>
        </div>
      )}

      {animating && !shouldReduceMotion && (
        <div className="w-full h-full relative overflow-hidden">
          {/* Subtle top/bottom mechanical vignette shadows */}
          <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none opacity-80" />
          <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none opacity-80" />

          <motion.div
            initial={{ y: 0 }}
            animate={{ y: -(tickerSlots.length - 1) * slotHeight }}
            transition={{
              duration: 0.82,
              ease: [0.16, 1, 0.3, 1], // Custom overshoot deceleration curve
            }}
            className="flex flex-col"
          >
            {tickerSlots.map((item, idx) => {
              const isFinal = idx === tickerSlots.length - 1;
              return (
                <div
                  key={idx}
                  style={{ height: `${slotHeight}px` }}
                  className={`flex items-center text-left ${
                    isFinal
                      ? `font-bold ${isPresentation ? 'text-lg text-primaryText' : 'text-sm text-primaryText'}`
                      : 'font-mono text-xs text-secondaryText/60 tracking-wider'
                  }`}
                >
                  {item}
                </div>
              );
            })}
          </motion.div>
        </div>
      )}

      {revealed && !animating && (
        <motion.div
          initial={{ opacity: shouldReduceMotion ? 1 : 0.6, y: shouldReduceMotion ? 0 : 2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full flex items-center justify-between"
        >
          <span
            className={`truncate font-semibold tracking-tight ${
              isPresentation
                ? 'text-lg text-primaryText font-bold'
                : isMentor
                ? 'text-sm text-mentor-DEFAULT font-bold'
                : 'text-sm text-primaryText'
            }`}
            title={displayedName || name}
          >
            {displayedName || name}
          </span>
          <span className="text-[10px] font-mono text-secondaryText/50 ml-2 uppercase shrink-0">
            Revealed
          </span>
        </motion.div>
      )}
    </div>
  );
}
