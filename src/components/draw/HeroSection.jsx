'use client';

import { motion } from 'framer-motion';
import { Sparkles, Users, GraduationCap, Shield, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';

/**
 * Hero Section for the Hackathon Team Draw Experience.
 * Beautifully responsive on mobile, tablet, and desktop screens with smooth entrance animations.
 */
export default function HeroSection({
  validation,
  isDrawActive = false,
  onGenerate = null,
  totalTeams = 0
}) {
  const { isValid, stats, errors, warnings } = validation;

  return (
    <div className="py-6 sm:py-10 md:py-12 border-b border-border/60 mb-6 sm:mb-8 no-print">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-3xl"
      >
        {/* Event Eyebrow Badge with subtle float */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-subtle border border-accent/20 text-accent text-[11px] sm:text-xs font-mono font-semibold tracking-wider uppercase mb-3 sm:mb-4 shadow-xs"
        >
          <Sparkles size={13} className="shrink-0 text-accent animate-spin-slow" />
          <span>HACKATHON 2027 · TEAM DRAW</span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="font-display font-extrabold text-2xl sm:text-4xl md:text-5xl text-primaryText leading-[1.2] sm:leading-[1.15] mb-2.5 sm:mb-3"
        >
          Every great team starts with a draw.
        </motion.h1>

        {/* Supporting Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-secondaryText text-sm sm:text-base md:text-lg leading-relaxed mb-5 sm:mb-6 font-normal"
        >
          Four names. One team. Let&apos;s see who builds together.
        </motion.p>

        {/* Participant Configuration & Capacity Overview */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-2.5 mb-5 sm:mb-6 text-xs font-medium"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-border text-primaryText shadow-xs justify-center sm:justify-start hover:border-accent/40 transition-colors">
            <Shield size={13} className="text-accent shrink-0" />
            <span><strong>{stats?.secondYearsCount || 0}</strong> Second-Years</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-border text-primaryText shadow-xs justify-center sm:justify-start hover:border-slate-300 transition-colors">
            <Users size={13} className="text-secondaryText shrink-0" />
            <span><strong>{stats?.firstYearsCount || 0}</strong> First-Years</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-border text-primaryText shadow-xs justify-center sm:justify-start hover:border-amber-300 transition-colors">
            <GraduationCap size={13} className="text-mentor-DEFAULT shrink-0" />
            <span><strong>{stats?.mentorsCount || 0}</strong> Mentors</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent text-white font-semibold justify-center sm:justify-start shadow-xs">
            <span>→ <strong>{stats?.maxPossibleTeams || 0}</strong> Complete Teams</span>
          </span>
        </motion.div>

        {/* Validation Errors If Configuration is Invalid */}
        {!isValid && errors && errors.length > 0 && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs mb-6 space-y-1">
            <div className="flex items-center gap-2 font-bold text-rose-900">
              <AlertTriangle size={15} className="shrink-0" />
              <span>Participant Configuration Requires Attention:</span>
            </div>
            <ul className="list-disc pl-5 space-y-0.5">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Main Focal Point Action Button Before Draw Starts */}
        {!isDrawActive ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <button
              type="button"
              onClick={onGenerate}
              disabled={!isValid}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-200 inline-flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-accent/20 min-h-[48px]"
            >
              <span>Generate Teams</span>
              <ArrowRight size={18} />
            </button>
            <p className="text-xs text-secondaryText mt-2 text-center sm:text-left">
              All teams will be initialized with concealed member slots ready for sequential draw.
            </p>
          </motion.div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-mono text-secondaryText bg-white border border-border rounded-lg px-3 py-2 w-fit shadow-xs">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse shrink-0" />
            <span>Live Draw Active · {totalTeams} Teams Initialized</span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
