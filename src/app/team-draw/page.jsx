'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  secondYearStudents,
  firstYearStudents,
  mentors
} from '@/data/participants';
import { validateParticipants } from '@/lib/validateParticipants';
import { generateTeams } from '@/lib/generateTeams';
import {
  calculateDrawProgress,
  getNextRevealTarget,
  canRevealSlot
} from '@/lib/revealSequence';
import { exportTeamsToPDF } from '@/lib/exportPdf';
import { drawsApi } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

// Event Draw Components
import AppHeader from '@/components/draw/AppHeader';
import HeroSection from '@/components/draw/HeroSection';
import DrawControls from '@/components/draw/DrawControls';
import DrawProgress from '@/components/draw/DrawProgress';
import TeamGrid from '@/components/draw/TeamGrid';
import UnassignedParticipants from '@/components/draw/UnassignedParticipants';
import PresentationMode from '@/components/draw/PresentationMode';
import ConfirmationDialog from '@/components/draw/ConfirmationDialog';
import ExportModal from '@/components/draw/ExportModal';
import CompletionCelebration from '@/components/draw/CompletionCelebration';
import { History, Sparkles, ArrowLeft, CheckCircle2, ShieldCheck, Shield, Database } from 'lucide-react';

export default function TeamDrawExperiencePage() {
  const { showToast } = useToast();

  // Validate participant configuration from data file
  const validation = useMemo(() => {
    return validateParticipants(secondYearStudents, firstYearStudents, mentors);
  }, []);

  // Main Draw Application State
  const [teams, setTeams] = useState([]);
  const [unassigned, setUnassigned] = useState({ secondYears: [], firstYears: [], mentors: [] });
  const [currentDrawId, setCurrentDrawId] = useState(null);
  const [isDrawActive, setIsDrawActive] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Modals & Overlay States
  const [showPresentation, setShowPresentation] = useState(false);
  const [presentationTeamIndex, setPresentationTeamIndex] = useState(0);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Derived progress calculations
  const progress = useMemo(() => {
    return calculateDrawProgress(teams);
  }, [teams]);

  // Restore active draw if session was refreshed
  useEffect(() => {
    setMounted(true);
    try {
      const cached = sessionStorage.getItem('active_hackathon_draw');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.teams?.length > 0) {
          setTeams(parsed.teams);
          setUnassigned(parsed.unassigned || { secondYears: [], firstYears: [], mentors: [] });
          setCurrentDrawId(parsed.drawId);
          setIsDrawActive(true);
          setIsSaved(Boolean(parsed.isSaved));
        }
      }
    } catch (e) {
      // Ignore session read error
    }
  }, []);

  /**
   * Action: Save Draw to Persistent Storage
   * Explicitly triggered when user clicks the "Save Draw" button.
   */
  const handleSaveDraw = useCallback(async () => {
    if (!teams || teams.length === 0) return;
    setIsSaving(true);
    try {
      const drawId = currentDrawId || `draw_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      if (!currentDrawId) setCurrentDrawId(drawId);

      const res = await drawsApi.save({
        drawId,
        title: `Hackathon 2027 Live Draw`,
        timestamp: new Date().toISOString(),
        teams,
        unassigned,
        isCompleted: progress.isAllRevealed
      });

      setIsSaved(true);

      // Cache saved state in session
      try {
        sessionStorage.setItem(
          'active_hackathon_draw',
          JSON.stringify({
            drawId,
            teams,
            unassigned,
            isCompleted: progress.isAllRevealed,
            isSaved: true
          })
        );
      } catch (e) {}

      showToast(
        '✓ Draw successfully saved to History! You can retrieve it anytime from Draw History.',
        'success'
      );
    } catch (err) {
      showToast(err.message || 'Failed to save draw record.', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [teams, unassigned, currentDrawId, progress.isAllRevealed, showToast]);

  /**
   * Action 1: Generate Teams
   * Creates unbiased randomized draw from participants configuration.
   */
  const handleGenerateTeams = useCallback(() => {
    try {
      const result = generateTeams(secondYearStudents, firstYearStudents, mentors);
      const drawId = `draw_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

      setTeams(result.teams);
      setUnassigned(result.unassigned);
      setCurrentDrawId(drawId);
      setIsDrawActive(true);
      setIsAnimating(false);
      setIsSaved(false);
      setPresentationTeamIndex(0);

      // Cache locally for refresh resilience (user will click Save Draw to save permanently)
      try {
        sessionStorage.setItem(
          'active_hackathon_draw',
          JSON.stringify({
            drawId,
            teams: result.teams,
            unassigned: result.unassigned,
            isCompleted: false,
            isSaved: false
          })
        );
      } catch (e) {}

      showToast(
        `Generated ${result.totalTeams} balanced teams. Click "Save Draw" to save to history, or start revealing!`,
        'success'
      );
    } catch (err) {
      showToast(err.message || 'Failed to generate teams.', 'error');
    }
  }, [showToast]);

  /**
   * Action 2: Reveal Next Member
   * Enforces strict sequential reveal order: SY -> FY1 -> FY2 -> Mentor
   */
  const handleRevealNext = useCallback(() => {
    if (isAnimating) return;

    const next = getNextRevealTarget(teams);
    if (!next) {
      showToast('All teams have already been completely revealed!', 'info');
      return;
    }

    setIsAnimating(true);

    const nextTeams = teams.map((team, tIdx) => {
      if (tIdx !== next.teamIndex) return team;

      const updatedMembers = team.members.map((member, sIdx) => {
        if (sIdx !== next.slotIndex) return member;
        return {
          ...member,
          revealed: true,
          revealedAt: new Date().toISOString()
        };
      });

      return {
        ...team,
        members: updatedMembers,
        isCompleted: updatedMembers.every((m) => m.revealed)
      };
    });

    setTeams(nextTeams);
    setPresentationTeamIndex(next.teamIndex);

    const isAllDone = nextTeams.every((t) => t.isCompleted);

    // Update local cache
    try {
      sessionStorage.setItem(
        'active_hackathon_draw',
        JSON.stringify({
          drawId: currentDrawId,
          teams: nextTeams,
          unassigned,
          isCompleted: isAllDone,
          isSaved
        })
      );
    } catch (e) {}

    // If draw was saved, sync progress to backend
    if (isSaved && currentDrawId) {
      drawsApi.update(currentDrawId, {
        teams: nextTeams,
        isCompleted: isAllDone
      }).catch(() => {});
    }

    // Release animation lock after reel finishes (~2600ms)
    setTimeout(() => {
      setIsAnimating(false);
    }, 2600);
  }, [teams, isAnimating, currentDrawId, unassigned, isSaved, showToast]);

  /**
   * Action 3: Reveal Entire Current Team Sequentially
   */
  const handleRevealTeam = useCallback((teamIdxToReveal = null) => {
    if (isAnimating) return;

    const targetIdx = teamIdxToReveal !== null ? teamIdxToReveal : progress.currentTeamIndex;
    const targetTeam = teams[targetIdx];
    if (!targetTeam) return;

    const unrevealedSlots = targetTeam.members
      .map((m, idx) => ({ ...m, idx }))
      .filter((m) => !m.revealed);

    if (unrevealedSlots.length === 0) {
      showToast('This team has already been fully revealed.', 'info');
      return;
    }

    setIsAnimating(true);

    unrevealedSlots.forEach((slot, sequenceStep) => {
      setTimeout(() => {
        setTeams((prevTeams) => {
          const updated = prevTeams.map((team, tIdx) => {
            if (tIdx !== targetIdx) return team;

            const updatedMembers = team.members.map((member, sIdx) => {
              if (sIdx !== slot.idx) return member;
              return {
                ...member,
                revealed: true,
                revealedAt: new Date().toISOString()
              };
            });

            return {
              ...team,
              members: updatedMembers,
              isCompleted: updatedMembers.every((m) => m.revealed)
            };
          });

          if (sequenceStep === unrevealedSlots.length - 1) {
            const isAllDone = updated.every((t) => t.isCompleted);
            try {
              sessionStorage.setItem(
                'active_hackathon_draw',
                JSON.stringify({
                  drawId: currentDrawId,
                  teams: updated,
                  unassigned,
                  isCompleted: isAllDone,
                  isSaved
                })
              );
            } catch (e) {}

            if (isSaved && currentDrawId) {
              drawsApi.update(currentDrawId, {
                teams: updated,
                isCompleted: isAllDone
              }).catch(() => {});
            }
          }

          return updated;
        });

        if (sequenceStep === unrevealedSlots.length - 1) {
          setTimeout(() => {
            setIsAnimating(false);
          }, 2600);
        }
      }, sequenceStep * 3200);
    });
  }, [teams, isAnimating, progress.currentTeamIndex, currentDrawId, unassigned, isSaved, showToast]);

  /**
   * Action 4: Slot Click Handler
   */
  const handleSlotClick = useCallback((teamIdx, slotIdx) => {
    if (isAnimating) return;

    const check = canRevealSlot(teams, teamIdx, slotIdx);
    if (!check.canReveal) {
      showToast(check.reason, 'warning');
      return;
    }

    handleRevealNext();
  }, [teams, isAnimating, handleRevealNext, showToast]);

  /**
   * Action 5: Reset Draw
   */
  const handleConfirmReset = useCallback(() => {
    setTeams([]);
    setUnassigned({ secondYears: [], firstYears: [], mentors: [] });
    setCurrentDrawId(null);
    setIsDrawActive(false);
    setIsAnimating(false);
    setIsSaved(false);
    setIsSaving(false);
    setShowResetDialog(false);
    setShowPresentation(false);
    try {
      sessionStorage.removeItem('active_hackathon_draw');
    } catch (e) {}
    showToast('Draw has been reset. You can now generate a new draw.', 'info');
  }, [showToast]);

  /**
   * Action 6: Direct PDF Export
   */
  const handleDirectPdfExport = useCallback(() => {
    try {
      exportTeamsToPDF(teams, unassigned, 'full-roster');
      showToast('Official Team Roster PDF downloaded successfully.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to export PDF.', 'error');
    }
  }, [teams, unassigned, showToast]);

  return (
    <div className="min-h-screen bg-canvas text-primaryText flex flex-col justify-between selection:bg-accent/20">
      <div>
        {/* Top Secondary Navigation: Breadcrumb, Save Action, and History Link */}
        <div className="bg-white/80 backdrop-blur-xs border-b border-border/80 px-4 sm:px-8 py-2.5 flex items-center justify-between gap-3 text-xs no-print">
          <div className="flex items-center gap-2 text-secondaryText truncate">
            <Link
              href="/"
              className="inline-flex items-center gap-1 hover:text-primaryText transition-colors font-medium"
            >
              <ArrowLeft size={13} />
              <span>Landing Page</span>
            </Link>
            <span>/</span>
            <span className="font-semibold text-primaryText">Live Team Draw</span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {isDrawActive && (
              isSaved ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                  <CheckCircle2 size={12} className="text-emerald-700" />
                  <span>Saved to History</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveDraw}
                  disabled={isSaving}
                  className="px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={12} />
                      <span>Save Draw</span>
                    </>
                  )}
                </button>
              )
            )}

            <Link
              href="/team-draw/history"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-canvas hover:bg-slate-100 border border-border text-primaryText font-semibold transition-colors"
            >
              <History size={13} className="text-secondaryText" />
              <span>Draw History</span>
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-canvas hover:bg-slate-100 border border-border text-primaryText font-semibold transition-colors"
              title="Admin Governance Dashboard"
            >
              <Shield size={13} className="text-accent" />
              <span>Admin</span>
            </Link>
          </div>
        </div>

        {/* Header */}
        <AppHeader
          status={progress.isAllRevealed ? 'Complete' : isDrawActive ? 'Drawing' : 'Ready'}
          isDrawActive={isDrawActive}
          isAllRevealed={progress.isAllRevealed}
          onReset={() => setShowResetDialog(true)}
        />

        <main className="app-container py-6 sm:py-8">
          {/* Hero / Generator Entry Section */}
          <HeroSection
            validation={validation}
            isDrawActive={isDrawActive}
            onGenerate={handleGenerateTeams}
            totalTeams={teams.length}
          />

          {/* Active Live Draw Area */}
          {isDrawActive && (
            <section aria-label="Team Draw Experience">
              {/* Printable Header for Print View */}
              <div className="hidden print:block print-header mb-6">
                <h1 className="text-2xl font-bold">Hackathon 2027 · Official Team Roster</h1>
                <p className="text-xs text-slate-600" suppressHydrationWarning>
                  Generated on {mounted ? new Date().toLocaleDateString() : 'Official Event'} · Composition: 1 Second-Year + 2 First-Years + 1 Unique Mentor
                </p>
              </div>

              {/* Draw Controls Toolbar with explicit Save Draw button */}
              <DrawControls
                isDrawActive={isDrawActive}
                isAllRevealed={progress.isAllRevealed}
                isAnimating={isAnimating}
                nextActionLabel={progress.nextActionLabel}
                onRevealNext={handleRevealNext}
                onRevealTeam={() => handleRevealTeam()}
                onResetDraw={() => setShowResetDialog(true)}
                onOpenExport={() => setShowExportModal(true)}
                onTogglePresentation={() => setShowPresentation(true)}
                onPrint={handleDirectPdfExport}
                onSaveDraw={handleSaveDraw}
                isSaved={isSaved}
                isSaving={isSaving}
              />

              {/* Progress Summary Banner */}
              <DrawProgress progress={progress} />

              {/* Completion Celebration (when 100% revealed) */}
              {progress.isAllRevealed && (
                <CompletionCelebration
                  totalTeams={progress.totalTeams}
                  onOpenExport={() => setShowExportModal(true)}
                  onPrint={handleDirectPdfExport}
                  onReset={() => setShowResetDialog(true)}
                  onSaveDraw={handleSaveDraw}
                  isSaved={isSaved}
                  isSaving={isSaving}
                />
              )}

              {/* Team Cards Grid with Signature Mechanical Counter Reel */}
              <TeamGrid
                teams={teams}
                currentTeamIndex={progress.currentTeamIndex}
                nextTarget={progress.nextTarget}
                isAnimating={isAnimating}
                onSlotClick={handleSlotClick}
                onRevealTeam={handleRevealTeam}
              />

              {/* Preserved Unassigned Participants */}
              <UnassignedParticipants unassigned={unassigned} />
            </section>
          )}
        </main>
      </div>

      {/* Minimal Footer */}
      <footer className="py-6 border-t border-border/80 text-center text-xs text-secondaryText no-print">
        <div className="app-container flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Hackathon Team Draw · College Event Production Edition</span>
          <span className="font-mono text-[11px] text-secondaryText/60">
            Strict 1:1 Unique Mentor Rule Active · Persistent Draw Records
          </span>
        </div>
      </footer>

      {/* Fullscreen Projector / Presentation Mode */}
      {showPresentation && (
        <PresentationMode
          teams={teams}
          currentTeamIndex={presentationTeamIndex}
          nextTarget={progress.nextTarget}
          isAnimating={isAnimating}
          isAllRevealed={progress.isAllRevealed}
          nextActionLabel={progress.nextActionLabel}
          onRevealNext={handleRevealNext}
          onRevealTeam={handleRevealTeam}
          onClose={() => setShowPresentation(false)}
          onSelectTeam={(idx) => setPresentationTeamIndex(idx)}
        />
      )}

      {/* Reset Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showResetDialog}
        title="Reset Current Draw?"
        message="Discarding the active draw view will clear currently displayed teams. Previously saved draws in Draw History will remain intact."
        confirmText="Yes, Reset Draw"
        cancelText="Keep Current Draw"
        confirmVariant="danger"
        onConfirm={handleConfirmReset}
        onCancel={() => setShowResetDialog(false)}
      />

      {/* PDF-Only Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        teams={teams}
        unassigned={unassigned}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
}
