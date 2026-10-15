'use client';

import { Sparkles, Users, GraduationCap, Shield, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';

/**
 * Hero Section for the Hackathon Team Draw Experience.
 */
export default function HeroSection({
  validation,
  isDrawActive = false,
  onGenerate = null,
  totalTeams = 0
}) {
  const { isValid, stats, errors, warnings } = validation;

  return (
    <div className="py-8 sm:py-12 border-b border-border/60 mb-8 no-print">
      <div className="max-w-3xl">
        {/* Event Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-subtle border border-accent/20 text-accent text-xs font-mono font-semibold tracking-wider uppercase mb-4">
          <Sparkles size={13} />
          <span>HACKATHON 2027 · TEAM DRAW</span>
        </div>

        {/* Main Heading */}
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl tracking-tight text-primaryText leading-[1.15] mb-3">
          Every great team starts with a draw.
        </h1>

        {/* Supporting Subtitle */}
        <p className="text-secondaryText text-base sm:text-lg leading-relaxed mb-6 font-normal">
          Four names. One team. Let&apos;s see who builds together.
        </p>

        {/* Participant Configuration & Capacity Overview */}
        <div className="flex flex-wrap items-center gap-2.5 mb-6 text-xs font-medium">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-border text-primaryText shadow-xs">
            <Shield size={13} className="text-accent" />
            <span><strong>{stats?.secondYearsCount || 0}</strong> Second-Years</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-border text-primaryText shadow-xs">
            <Users size={13} className="text-secondaryText" />
            <span><strong>{stats?.firstYearsCount || 0}</strong> First-Years</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-border text-primaryText shadow-xs">
            <GraduationCap size={13} className="text-mentor-DEFAULT" />
            <span><strong>{stats?.mentorsCount || 0}</strong> Unique Mentors</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white font-semibold">
            <span>→ Produces <strong>{stats?.maxPossibleTeams || 0}</strong> Complete Teams</span>
          </span>
        </div>

        {/* Validation Errors If Configuration is Invalid */}
        {!isValid && errors && errors.length > 0 && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs mb-6 space-y-1">
            <div className="flex items-center gap-2 font-bold text-rose-900">
              <AlertTriangle size={15} />
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
          <div>
            <button
              type="button"
              onClick={onGenerate}
              disabled={!isValid}
              className="px-7 py-3.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold text-base shadow-md transition-all duration-150 inline-flex items-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-accent/20"
            >
              <span>Generate Teams</span>
              <ArrowRight size={18} />
            </button>
            <p className="text-xs text-secondaryText mt-2">
              All teams will be initialized with concealed member slots ready for sequential draw.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-mono text-secondaryText">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span>Live Draw Session Active · {totalTeams} Teams Initialized</span>
          </div>
        )}
      </div>
    </div>
  );
}
