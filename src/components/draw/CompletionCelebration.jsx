'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle2, Download, Printer, RotateCcw } from 'lucide-react';

/**
 * Professional Completion Banner with subtle native canvas particle burst.
 * Zero external library dependencies, zero performance lag.
 */
export default function CompletionCelebration({
  totalTeams = 0,
  onOpenExport,
  onPrint,
  onReset,
  onSaveDraw = null,
  isSaved = false,
  isSaving = false
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrame;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Create 45 subtle celebration particles in editorial colors
    const colors = ['#5B5BD6', '#277A55', '#D97706', '#0284C7', '#7C3AED'];
    const particles = Array.from({ length: 45 }).map(() => ({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8 - 2,
      size: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      decay: Math.random() * 0.015 + 0.008
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach((p) => {
        if (p.alpha > 0) {
          alive = true;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.1; // gravity
          p.alpha -= p.decay;

          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      if (alive) {
        animationFrame = requestAnimationFrame(render);
      }
    };

    render();

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative overflow-hidden bg-white rounded-2xl border-2 border-success/30 p-6 sm:p-8 shadow-elevated mb-8 text-center"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      <div className="relative z-10 max-w-xl mx-auto">
        <div className="w-12 h-12 rounded-full bg-success-subtle text-success border border-success/30 flex items-center justify-center mx-auto mb-3 shadow-xs">
          <Award size={24} />
        </div>

        <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-primaryText mb-2">
          Hackathon Draw Successfully Concluded!
        </h3>

        <p className="text-secondaryText text-sm sm:text-base leading-relaxed mb-6">
          All <strong>{totalTeams} teams</strong> have been fully revealed with balanced leadership, dual first-year builders, and dedicated technical mentors.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {onSaveDraw && (
            <button
              type="button"
              onClick={onSaveDraw}
              disabled={isSaving}
              className={`px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all inline-flex items-center gap-2 shadow-xs cursor-pointer ${
                isSaved
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isSaved ? (
                <>
                  <CheckCircle2 size={15} className="text-emerald-700" />
                  <span>Saved to History</span>
                </>
              ) : isSaving ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>Save Draw to History</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={onOpenExport}
            className="px-5 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs sm:text-sm font-semibold transition-colors inline-flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Download size={15} />
            <span>Export PDF</span>
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="px-4 py-2.5 rounded-lg bg-canvas hover:bg-slate-100 text-primaryText text-xs sm:text-sm font-semibold border border-border transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <Printer size={15} />
            <span>Print Final Teams</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2.5 rounded-lg text-rose-700 hover:bg-rose-50 border border-rose-200 text-xs sm:text-sm font-semibold transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw size={15} />
            <span>Start Fresh Draw</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
