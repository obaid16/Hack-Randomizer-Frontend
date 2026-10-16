'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  secondYearStudents,
  firstYearStudents,
  mentors
} from '@/data/participants';
import { playMechanicalTick, playLockChime } from '@/lib/soundFx';

/**
 * Authentic Mechanical Counter / Slot Machine Name Reel Component
 * 
 * Simulates a high-speed mechanical drum counter from casino/arcade draw games:
 * - Spins through 18 candidate names from the actual roster.
 * - Starts with high-speed rotation and subtle motion blur.
 * - Smoothly decelerates with mechanical friction.
 * - Rebounds and locks into place with physical overshoot bounce and audio click.
 */
export default function NameReveal({
  name,
  role = 'SECOND_YEAR',
  revealed = false,
  isTarget = false,
  isMentor = false,
  onAnimationComplete = null,
  isPresentation = false
}) {
  // Phased state machine: 'concealed' | 'rolling' | 'locked'
  const [status, setStatus] = useState(() => (revealed ? 'locked' : 'concealed'));
  const [justLocked, setJustLocked] = useState(false);
  const prevRevealedRef = useRef(revealed);

  // Height of each slot item in the mechanical drum
  const slotHeight = isPresentation ? 44 : 34;
  const TOTAL_DURATION_SEC = 2.4; // 2.4s of authentic counter game spin
  const TOTAL_DURATION_MS = TOTAL_DURATION_SEC * 1000;

  // Synchronous phase transition during render:
  // If revealed transitions from false to true, immediately switch to 'rolling'.
  // This guarantees zero single-frame flash of the final name before the reel spins!
  if (!prevRevealedRef.current && revealed) {
    prevRevealedRef.current = true;
    if (status !== 'rolling' && status !== 'locked') {
      setStatus('rolling');
    }
  } else if (prevRevealedRef.current && !revealed) {
    prevRevealedRef.current = false;
    if (status !== 'concealed') {
      setStatus('concealed');
    }
  }

  // Generate an authentic 18-item reel of candidate names from the roster
  const reelItems = useMemo(() => {
    let pool = firstYearStudents;
    if (role === 'SECOND_YEAR') pool = secondYearStudents;
    if (role === 'MENTOR') pool = mentors;

    // Pick 17 candidate names shuffled
    const poolCopy = [...pool].filter((n) => n !== name);
    const shuffled = [];
    while (shuffled.length < 17) {
      const remaining = poolCopy.length > 0 ? [...poolCopy] : [...pool];
      for (let i = remaining.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
      }
      shuffled.push(...remaining);
    }

    // 17 candidate items + 1 final target winning name
    return [...shuffled.slice(0, 17), name];
  }, [name, role]);

  useEffect(() => {
    if (status === 'rolling') {
      setJustLocked(false);

      // Play decelerating mechanical ratchet clicks as the reel spins
      const tickIntervals = [
        60, 130, 200, 280, 360, 450, 550, 660, 780, 920, 1070, 1240, 1430, 1640, 1870, 2120
      ];
      const tickTimers = tickIntervals.map((ms, idx) => {
        return setTimeout(() => {
          playMechanicalTick(0.9 + idx * 0.05);
        }, ms);
      });

      // Reel settles and locks into place
      const lockTimer = setTimeout(() => {
        setStatus('locked');
        setJustLocked(true);
        playLockChime();

        if (onAnimationComplete) {
          onAnimationComplete();
        }

        setTimeout(() => setJustLocked(false), 1500);
      }, TOTAL_DURATION_MS);

      return () => {
        tickTimers.forEach(clearTimeout);
        clearTimeout(lockTimer);
      };
    }
  }, [status, TOTAL_DURATION_MS, onAnimationComplete]);

  return (
    <div
      className={`relative w-full overflow-hidden select-none transition-all duration-300 ${
        isPresentation ? 'h-11' : 'h-9'
      } flex items-center rounded-lg`}
    >
      {/* 1. Concealed State (Before Trigger) */}
      {status === 'concealed' && (
        <div className="flex items-center justify-between w-full text-secondaryText text-xs font-mono px-1">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse" />
            <span className="tracking-widest opacity-40 text-[11px] sm:text-xs truncate max-w-[140px] sm:max-w-none">
              · · · · · · · · · · · ·
            </span>
          </div>
          <span
            className={`text-[10px] sm:text-[11px] font-sans px-2.5 py-0.5 rounded-full transition-all whitespace-nowrap shrink-0 ml-1.5 ${
              isTarget
                ? 'bg-accent text-white font-bold ring-2 ring-accent/30 shadow-xs animate-bounce'
                : 'text-secondaryText/60 bg-slate-100'
            }`}
          >
            {isTarget ? 'Click to Roll' : 'Concealed'}
          </span>
        </div>
      )}

      {/* 2. Authentic Mechanical Slot Reel Spinner */}
      {status === 'rolling' && (
        <div className="w-full h-full relative overflow-hidden bg-slate-900/90 rounded-md border border-slate-700 shadow-inner px-2">
          {/* Slot Machine 3D Cylinder Depth Shadows */}
          <div className="absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-20 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20 pointer-events-none" />

          {/* Central Target Reticle Indicator Brackets */}
          <div className="absolute inset-y-0 left-0 w-1 bg-accent z-20 animate-pulse" />
          <div className="absolute inset-y-0 right-0 w-1 bg-accent z-20 animate-pulse" />

          {/* Vertical Reel Strip Moving Downwards */}
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: -(reelItems.length - 1) * slotHeight }}
            transition={{
              duration: TOTAL_DURATION_SEC,
              ease: [0.15, 0.9, 0.22, 1.0], // Authentic casino slot reel deceleration curve
            }}
            className="flex flex-col"
          >
            {reelItems.map((itemName, idx) => {
              const isFinal = idx === reelItems.length - 1;
              return (
                <div
                  key={idx}
                  style={{ height: `${slotHeight}px` }}
                  className={`flex items-center text-left truncate px-2 font-display ${
                    isFinal
                      ? `font-black text-amber-300 drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)] ${
                          isPresentation ? 'text-lg sm:text-2xl' : 'text-sm sm:text-base'
                        }`
                      : `font-semibold text-slate-300/80 ${
                          isPresentation ? 'text-sm sm:text-base' : 'text-xs'
                        }`
                  }`}
                >
                  <span className="truncate">{itemName}</span>
                </div>
              );
            })}
          </motion.div>
        </div>
      )}

      {/* 3. Revealed Final State with Celebration Micro-Animation */}
      {status === 'locked' && (
        <motion.div
          initial={{ opacity: 0.5, scale: 0.95 }}
          animate={{
            opacity: 1,
            scale: justLocked ? [1, 1.03, 1] : 1,
          }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full flex items-center justify-between min-w-0 px-0.5"
        >
          <span
            className={`truncate font-bold tracking-normal ${
              isPresentation
                ? 'text-base sm:text-xl text-primaryText font-extrabold'
                : isMentor
                ? 'text-xs sm:text-sm text-mentor-DEFAULT font-bold'
                : 'text-xs sm:text-sm text-primaryText'
            }`}
            title={name}
          >
            {name}
          </span>

          <motion.span
            initial={justLocked ? { scale: 0, rotate: -15 } : false}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className={`text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded-full ml-2 uppercase shrink-0 font-bold border ${
              justLocked
                ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-sm animate-pulse'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            {justLocked ? '⭐ Winner Locked' : 'Revealed'}
          </motion.span>
        </motion.div>
      )}
    </div>
  );
}
