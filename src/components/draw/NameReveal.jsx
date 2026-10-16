'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Mechanical Ticker Name Reveal Component with Suspense Delay
 * 
 * Simulates a precision vertical mechanical drum/flip counter with extended
 * suspense, rolling through candidates before locking cleanly on the real name.
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

  // Mechanical ticker sequence steps passing through the reveal aperture
  const tickerSlots = [
    '· · · INITIATING DRAW · · ·',
    '■ ■ ■ SCANNING POOL ■ ■ ■',
    '· · · SHUFFLING CANDIDATES · · ·',
    '■ ■ ■ SYNCHRONIZING ■ ■ ■',
    '· · · LOCKING IN ROSTER · · ·',
    '— FINAL SELECTION —',
    name
  ];

  // Height of one slot line in viewport (mobile friendly)
  const slotHeight = isPresentation ? 40 : 30;
  // Total suspenseful animation duration in ms
  const ANIMATION_DURATION_MS = 1650;

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

      const timer = setTimeout(() => {
        setDisplayedName(name);
        setAnimating(false);
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }, ANIMATION_DURATION_MS);

      return () => clearTimeout(timer);
    } else if (!revealed) {
      prevRevealedRef.current = false;
      setDisplayedName('');
      setAnimating(false);
    }
  }, [revealed, name, shouldReduceMotion, onAnimationComplete]);

  return (
    <div
      className={`relative w-full overflow-hidden select-none transition-colors duration-200 ${
        isPresentation ? 'h-10' : 'h-8'
      } flex items-center`}
    >
      {/* 1. Concealed State */}
      {!revealed && !animating && (
        <div className="flex items-center justify-between w-full text-secondaryText text-xs font-mono">
          <span className="tracking-widest opacity-40 text-[11px] sm:text-xs truncate max-w-[140px] sm:max-w-none">
            · · · · · · · · · · · ·
          </span>
          <span
            className={`text-[10px] sm:text-[11px] font-sans px-2 py-0.5 rounded transition-all whitespace-nowrap shrink-0 ml-1.5 ${
              isTarget
                ? 'bg-accent-subtle text-accent font-semibold ring-1 ring-accent/30 animate-pulse'
                : 'text-secondaryText/60 bg-slate-100/80'
            }`}
          >
            {isTarget ? 'Ready to reveal' : 'Concealed'}
          </span>
        </div>
      )}

      {/* 2. Suspenseful Mechanical Rolling Animation */}
      {animating && !shouldReduceMotion && (
        <div className="w-full h-full relative overflow-hidden bg-slate-50/60 rounded px-1">
          {/* Top/bottom mechanical vignette shadows */}
          <div className="absolute inset-x-0 top-0 h-2.5 bg-gradient-to-b from-white via-white/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-2.5 bg-gradient-to-t from-white via-white/80 to-transparent z-10 pointer-events-none" />

          <motion.div
            initial={{ y: 0 }}
            animate={{ y: -(tickerSlots.length - 1) * slotHeight }}
            transition={{
              duration: 1.6,
              ease: [0.12, 0.95, 0.25, 1], // Slow, satisfying mechanical deceleration
            }}
            className="flex flex-col"
          >
            {tickerSlots.map((item, idx) => {
              const isFinal = idx === tickerSlots.length - 1;
              return (
                <div
                  key={idx}
                  style={{ height: `${slotHeight}px` }}
                  className={`flex items-center text-left truncate px-1 ${
                    isFinal
                      ? `font-bold text-primaryText ${
                          isPresentation
                            ? 'text-base sm:text-xl'
                            : 'text-xs sm:text-sm'
                        }`
                      : 'font-mono text-[10px] sm:text-xs text-accent font-medium tracking-wider'
                  }`}
                >
                  {item}
                </div>
              );
            })}
          </motion.div>
        </div>
      )}

      {/* 3. Revealed Stable Name */}
      {revealed && !animating && (
        <motion.div
          initial={{ opacity: shouldReduceMotion ? 1 : 0.4, scale: shouldReduceMotion ? 1 : 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="w-full flex items-center justify-between min-w-0"
        >
          <span
            className={`truncate font-semibold tracking-normal ${
              isPresentation
                ? 'text-base sm:text-xl text-primaryText font-bold'
                : isMentor
                ? 'text-xs sm:text-sm text-mentor-DEFAULT font-bold'
                : 'text-xs sm:text-sm text-primaryText'
            }`}
            title={displayedName || name}
          >
            {displayedName || name}
          </span>
          <span className="text-[9px] sm:text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded ml-2 uppercase shrink-0 font-medium">
            Revealed
          </span>
        </motion.div>
      )}
    </div>
  );
}
