'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Shield,
  Users,
  GraduationCap,
  History,
  CheckCircle2,
  Code2,
  FileText,
  Sliders,
  Layers,
  ChevronDown
} from 'lucide-react';
import CodingScene from '@/components/landing/CodingScene';

export default function HackathonLandingPage() {
  const currentYear = new Date().getFullYear();

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-primaryText flex flex-col justify-between selection:bg-accent/20">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-40 bg-canvas/90 backdrop-blur-md border-b border-border/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Wordmark */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
            <span className="font-display font-black text-base sm:text-lg tracking-tight text-primaryText group-hover:text-accent transition-colors">
              HACKATHON 2027
            </span>
            <span className="hidden sm:inline text-[11px] font-mono text-secondaryText/60 px-1.5 py-0.2 rounded bg-slate-100 border border-border">
              PORTAL
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-secondaryText">
            <a href="#about" className="hover:text-primaryText transition-colors">
              About
            </a>
            <a href="#formula" className="hover:text-primaryText transition-colors">
              Team Formula
            </a>
            <a href="#how-it-works" className="hover:text-primaryText transition-colors">
              How It Works
            </a>
            <Link
              href="/team-draw/history"
              className="hover:text-primaryText transition-colors inline-flex items-center gap-1"
            >
              <History size={13} />
              <span>Draw History</span>
            </Link>
          </nav>

          {/* Primary CTA */}
          <div className="flex items-center gap-3">
            <Link
              href="/team-draw/history"
              className="md:hidden p-2 rounded-lg text-secondaryText hover:text-primaryText hover:bg-slate-100 transition-colors"
              title="Draw History"
            >
              <History size={17} />
            </Link>
            <Link
              href="/team-draw"
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all inline-flex items-center gap-1.5 active:scale-[0.98]"
            >
              <span>Enter Team Draw</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Sections */}
      <main>
        {/* 2. Hero Section */}
        <section className="relative overflow-hidden pt-10 sm:pt-16 md:pt-20 pb-16 sm:pb-24 border-b border-border/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
              {/* Left Column: Editorial Headline & Copy */}
              <div className="lg:col-span-6 max-w-xl text-center lg:text-left mx-auto lg:mx-0">
                {/* Small Eyebrow Label */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-subtle border border-accent/20 text-accent text-[11px] sm:text-xs font-mono font-bold tracking-wider uppercase mb-4 sm:mb-5 shadow-2xs"
                >
                  <Sparkles size={13} className="text-accent" />
                  <span>HACKATHON 2027 · TEAM FORMATION</span>
                </motion.div>

                {/* Main Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="font-display font-extrabold text-3xl sm:text-5xl md:text-[3.25rem] text-primaryText leading-[1.15] mb-4 sm:mb-5 tracking-tight"
                >
                  Great ideas start with the right team.
                </motion.h1>

                {/* Supporting Description */}
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-secondaryText text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8 font-normal"
                >
                  Bringing creative minds, emerging developers, and experienced mentors together to build what comes next.
                </motion.p>

                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4"
                >
                  <Link
                    href="/team-draw"
                    className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all inline-flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <span>Enter Team Draw</span>
                    <ArrowRight size={17} />
                  </Link>

                  <button
                    type="button"
                    onClick={scrollToHowItWorks}
                    className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-border text-primaryText font-semibold text-xs sm:text-sm transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>How It Works</span>
                    <ChevronDown size={15} className="text-secondaryText" />
                  </button>
                </motion.div>
              </div>

              {/* Right Column: Animated Coding & Collaboration Environment Visual */}
              <div className="lg:col-span-6 w-full">
                <CodingScene />
              </div>
            </div>
          </div>
        </section>

        {/* 3. Section A — About the Hackathon */}
        <section id="about" className="py-16 sm:py-24 border-b border-border/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-8">
            <div className="max-w-2xl mb-12">
              <span className="text-xs font-mono font-bold text-accent uppercase tracking-wider block mb-2">
                01 · THE VISION
              </span>
              <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-primaryText leading-snug mb-3">
                One challenge. Different minds. Shared ambition.
              </h2>
              <p className="text-secondaryText text-sm sm:text-base leading-relaxed">
                The hackathon brings students together to collaborate, develop innovative solutions, and learn through building real projects under expert technical mentorship.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="bg-white rounded-2xl border border-border p-6 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-accent-subtle text-accent flex items-center justify-center mb-4 border border-accent/20">
                  <Shield size={20} />
                </div>
                <h3 className="font-display font-bold text-base text-primaryText mb-1.5">
                  Experienced Leadership
                </h3>
                <p className="text-xs sm:text-sm text-secondaryText leading-relaxed">
                  Every team is anchored by a second-year student who brings project clarity, architectural perspective, and organizational momentum.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-border p-6 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-primaryText flex items-center justify-center mb-4 border border-border">
                  <Users size={20} />
                </div>
                <h3 className="font-display font-bold text-base text-primaryText mb-1.5">
                  Dual Core Builders
                </h3>
                <p className="text-xs sm:text-sm text-secondaryText leading-relaxed">
                  Two first-year students pair up on every team, bringing fresh creative approaches, relentless drive, and hands-on implementation.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-border p-6 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-mentor-DEFAULT flex items-center justify-center mb-4 border border-amber-200">
                  <GraduationCap size={20} />
                </div>
                <h3 className="font-display font-bold text-base text-primaryText mb-1.5">
                  Dedicated Mentorship
                </h3>
                <p className="text-xs sm:text-sm text-secondaryText leading-relaxed">
                  A dedicated technical mentor is matched 1:1 with each team to remove roadblocks, advise on architecture, and guide deployment.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Section B — The Team Formula */}
        <section id="formula" className="py-16 sm:py-24 bg-white border-b border-border/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-8">
            <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
              <span className="text-xs font-mono font-bold text-accent uppercase tracking-wider block mb-2">
                02 · SYSTEMATIC BALANCE
              </span>
              <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-primaryText leading-snug mb-3">
                Four people. One team.
              </h2>
              <p className="text-secondaryText text-sm sm:text-base leading-relaxed">
                Every team combines experienced student perspective, fresh ideas, and dedicated mentorship.
              </p>
            </div>

            {/* 4 Distinct Elegant Formula Blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
              {/* Block 1: Leader */}
              <div className="rounded-2xl border-2 border-accent/30 bg-accent-subtle/20 p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold text-accent bg-accent-subtle px-2 py-0.5 rounded border border-accent/20">
                      SLOT 01
                    </span>
                    <Shield size={18} className="text-accent" />
                  </div>
                  <h3 className="font-display font-bold text-base text-primaryText mb-1">
                    Second-Year Student
                  </h3>
                  <span className="text-[11px] font-mono text-accent font-semibold block mb-2">
                    Team Leader
                  </span>
                  <p className="text-xs text-secondaryText leading-relaxed">
                    Guides team technical scope, milestone roadmap, and repository coordination.
                  </p>
                </div>
              </div>

              {/* Block 2: Builder 1 */}
              <div className="rounded-2xl border border-border bg-canvas p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold text-secondaryText bg-slate-200/80 px-2 py-0.5 rounded">
                      SLOT 02
                    </span>
                    <Users size={18} className="text-secondaryText" />
                  </div>
                  <h3 className="font-display font-bold text-base text-primaryText mb-1">
                    First-Year Student
                  </h3>
                  <span className="text-[11px] font-mono text-secondaryText font-semibold block mb-2">
                    Core Builder 01
                  </span>
                  <p className="text-xs text-secondaryText leading-relaxed">
                    Drives UI development, workflow design, and core interactive feature creation.
                  </p>
                </div>
              </div>

              {/* Block 3: Builder 2 */}
              <div className="rounded-2xl border border-border bg-canvas p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold text-secondaryText bg-slate-200/80 px-2 py-0.5 rounded">
                      SLOT 03
                    </span>
                    <Users size={18} className="text-secondaryText" />
                  </div>
                  <h3 className="font-display font-bold text-base text-primaryText mb-1">
                    First-Year Student
                  </h3>
                  <span className="text-[11px] font-mono text-secondaryText font-semibold block mb-2">
                    Core Builder 02
                  </span>
                  <p className="text-xs text-secondaryText leading-relaxed">
                    Focuses on business logic, API integrations, and collaborative implementation.
                  </p>
                </div>
              </div>

              {/* Block 4: Dedicated Mentor (with visual distinction) */}
              <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/40 p-5 sm:p-6 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                      SLOT 04 · 1:1 RULE
                    </span>
                    <GraduationCap size={18} className="text-mentor-DEFAULT" />
                  </div>
                  <h3 className="font-display font-bold text-base text-amber-950 mb-1">
                    Dedicated Mentor
                  </h3>
                  <span className="text-[11px] font-mono text-amber-800 font-semibold block mb-2">
                    Technical Advisor
                  </span>
                  <p className="text-xs text-secondaryText leading-relaxed">
                    Assigned uniquely to exactly one team. Never shared or reused across teams.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-border text-center max-w-xl mx-auto">
              <p className="text-xs font-mono text-secondaryText">
                Strict Equality Formula: <strong>1 SY + 2 FY + 1 Unique Mentor = Complete Hackathon Unit</strong>
              </p>
            </div>
          </div>
        </section>

        {/* 5. Section C — How It Works */}
        <section id="how-it-works" className="py-16 sm:py-24 border-b border-border/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-8">
            <div className="max-w-2xl mb-12 sm:mb-16">
              <span className="text-xs font-mono font-bold text-accent uppercase tracking-wider block mb-2">
                03 · THREE-STEP FLOW
              </span>
              <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-primaryText leading-snug mb-3">
                How It Works
              </h2>
              <p className="text-secondaryText text-sm sm:text-base leading-relaxed">
                From initial roster validation to live stage reveals and official PDF export.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Step 01 */}
              <div className="bg-white rounded-2xl border border-border p-6 sm:p-7 shadow-xs relative">
                <span className="font-display font-black text-3xl sm:text-4xl text-accent/30 block mb-3">
                  01
                </span>
                <h3 className="font-display font-bold text-lg text-primaryText mb-2">
                  Prepare
                </h3>
                <p className="text-xs sm:text-sm text-secondaryText leading-relaxed">
                  The organizer adds the predefined student and mentor names to the participant configuration file with automatic eligibility checks.
                </p>
              </div>

              {/* Step 02 */}
              <div className="bg-white rounded-2xl border border-border p-6 sm:p-7 shadow-xs relative">
                <span className="font-display font-black text-3xl sm:text-4xl text-accent/30 block mb-3">
                  02
                </span>
                <h3 className="font-display font-bold text-lg text-primaryText mb-2">
                  Draw
                </h3>
                <p className="text-xs sm:text-sm text-secondaryText leading-relaxed">
                  Teams are randomized and their members are revealed one at a time through an authentic, suspenseful mechanical slot reel animation.
                </p>
              </div>

              {/* Step 03 */}
              <div className="bg-white rounded-2xl border border-border p-6 sm:p-7 shadow-xs relative">
                <span className="font-display font-black text-3xl sm:text-4xl text-accent/30 block mb-3">
                  03
                </span>
                <h3 className="font-display font-bold text-lg text-primaryText mb-2">
                  Save & Export
                </h3>
                <p className="text-xs sm:text-sm text-secondaryText leading-relaxed">
                  The completed roster is saved permanently to portal history and can be instantly downloaded as an executive print-ready PDF.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Section D — Call to Action */}
        <section className="py-20 sm:py-28 bg-white border-b border-border/80 text-center">
          <div className="max-w-2xl mx-auto px-4 sm:px-8">
            <span className="text-xs font-mono font-bold text-accent uppercase tracking-wider block mb-3">
              LIVE EVENT READY
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-primaryText tracking-tight mb-3">
              Ready to discover your team?
            </h2>
            <p className="text-secondaryText text-sm sm:text-base leading-relaxed mb-8">
              Let the draw begin.
            </p>
            <Link
              href="/team-draw"
              className="px-8 py-4 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold text-base shadow-md hover:shadow-xl transition-all inline-flex items-center gap-2.5 active:scale-[0.98]"
            >
              <span>Open Team Draw</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      {/* 7. Section E — Minimal Professional Footer */}
      <footer className="py-8 bg-canvas text-secondaryText text-xs border-t border-border/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <span className="font-display font-bold text-primaryText block">
              Hackathon 2027 · Team Formation Portal
            </span>
            <span className="text-[11px] text-secondaryText/70">
              Built for ideas that bring people together.
            </span>
          </div>

          <div className="flex items-center gap-5 font-medium">
            <Link href="/" className="hover:text-primaryText transition-colors">
              Home
            </Link>
            <Link href="/team-draw" className="hover:text-primaryText transition-colors">
              Team Draw
            </Link>
            <Link href="/team-draw/history" className="hover:text-primaryText transition-colors">
              Draw History
            </Link>
          </div>

          <div className="text-[11px] font-mono text-secondaryText/60">
            © {currentYear} Hackathon Event Operations.
          </div>
        </div>
      </footer>
    </div>
  );
}
