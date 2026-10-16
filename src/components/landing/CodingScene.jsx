'use client';

import { motion } from 'framer-motion';
import { Terminal, Code2, Users, Cpu, Sparkles, Check, Shield, GraduationCap, Laptop } from 'lucide-react';

/**
 * Custom Animated Coding & Collaboration Environment Visual for the Landing Hero.
 * 
 * Features:
 * - Central realistic code editor with syntax-colored team allocation algorithm.
 * - Progressive typing / line reveal effect with blinking cursor.
 * - Stylized developer silhouettes and workstation nodes (Leader, 2 Builders, Mentor).
 * - Animated SVG connection circuits and collaboration lines.
 * - Floating compilation badges and terminal diagnostics.
 * - Zero heavy external 3D libraries — ultra fast, smooth, and 100% mobile responsive.
 */
export default function CodingScene() {
  const codeLines = [
    { num: 1, code: 'import { shuffle } from "crypto/engine";', color: 'text-slate-400' },
    { num: 2, code: 'export function assembleTeam(pool) {', color: 'text-purple-300 font-semibold' },
    { num: 3, code: '  const leader = pool.secondYears.pop();', color: 'text-indigo-300' },
    { num: 4, code: '  const builders = pool.firstYears.splice(0, 2);', color: 'text-emerald-300' },
    { num: 5, code: '  const mentor = pool.mentors.claimUnique();', color: 'text-amber-300 font-semibold' },
    { num: 6, code: '  return { leader, builders, mentor };', color: 'text-blue-300' },
    { num: 7, code: '}', color: 'text-purple-300 font-semibold' }
  ];

  return (
    <div className="relative w-full max-w-xl mx-auto select-none">
      {/* Background Subtle Tech Radial Glow */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-accent/10 via-transparent to-accent/5 rounded-3xl blur-2xl pointer-events-none" />

      {/* Main Container Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
        className="relative bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden p-3 sm:p-5"
      >
        {/* Editor Window Chrome Bar */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="font-mono text-[11px] text-slate-400 ml-2">teamBalancer.js</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE COMPILE</span>
            </span>
          </div>
        </div>

        {/* Code Lines with Progressive Entrance */}
        <div className="font-mono text-[11px] sm:text-xs leading-relaxed space-y-1 mb-4 bg-slate-950/60 rounded-xl p-3 sm:p-4 border border-slate-800/60 overflow-x-auto">
          {codeLines.map((line, i) => (
            <motion.div
              key={line.num}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.35 + i * 0.1 }}
              className="flex items-center gap-3"
            >
              <span className="text-slate-600 select-none w-4 text-right text-[10px] shrink-0">
                {line.num}
              </span>
              <span className={`${line.color} whitespace-pre`}>{line.code}</span>
            </motion.div>
          ))}

          {/* Active Terminal Cursor Blink */}
          <div className="flex items-center gap-3 pt-0.5">
            <span className="text-slate-600 select-none w-4 text-right text-[10px] shrink-0">8</span>
            <span className="inline-block w-2 h-4 bg-accent animate-pulse" />
          </div>
        </div>

        {/* Abstract Developer Workstation Nodes & Connection Diagram */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 pt-2 border-t border-slate-800/80">
          {/* Node 1: Leader */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            className="p-2 sm:p-2.5 rounded-lg bg-slate-800/70 border border-indigo-500/30 flex flex-col items-center text-center text-slate-200"
          >
            <div className="w-6 h-6 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-500/40 flex items-center justify-center mb-1">
              <Shield size={12} />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold truncate">2nd-Yr</span>
            <span className="text-[9px] text-slate-400 truncate">Leader</span>
          </motion.div>

          {/* Node 2: Builder 1 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.9 }}
            className="p-2 sm:p-2.5 rounded-lg bg-slate-800/70 border border-slate-700 flex flex-col items-center text-center text-slate-200"
          >
            <div className="w-6 h-6 rounded-full bg-slate-900 text-slate-300 border border-slate-600 flex items-center justify-center mb-1">
              <Users size={12} />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold truncate">1st-Yr</span>
            <span className="text-[9px] text-slate-400 truncate">Builder</span>
          </motion.div>

          {/* Node 3: Builder 2 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 1.0 }}
            className="p-2 sm:p-2.5 rounded-lg bg-slate-800/70 border border-slate-700 flex flex-col items-center text-center text-slate-200"
          >
            <div className="w-6 h-6 rounded-full bg-slate-900 text-slate-300 border border-slate-600 flex items-center justify-center mb-1">
              <Users size={12} />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold truncate">1st-Yr</span>
            <span className="text-[9px] text-slate-400 truncate">Builder</span>
          </motion.div>

          {/* Node 4: Dedicated Mentor */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 1.1 }}
            className="p-2 sm:p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40 flex flex-col items-center text-center text-amber-200"
          >
            <div className="w-6 h-6 rounded-full bg-amber-950 text-amber-400 border border-amber-500/50 flex items-center justify-center mb-1">
              <GraduationCap size={12} />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold truncate">Mentor</span>
            <span className="text-[9px] text-amber-400/80 truncate">1:1 Guide</span>
          </motion.div>
        </div>

        {/* Floating Diagnostic Badges */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="mt-3 pt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-400"
        >
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Entropy: Fisher-Yates</span>
          </span>
          <span className="inline-flex items-center gap-1 text-slate-300">
            <Check size={11} className="text-emerald-400" />
            <span>Unique Mentors: 100% Enforced</span>
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
