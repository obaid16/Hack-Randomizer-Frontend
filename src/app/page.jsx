'use client';

import { useState, useMemo, useCallback } from 'react';
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

export default function TeamDrawPage() {
  const { showToast } = useToast();

  // Validate participant configuration from data file
  const validation = useMemo(() => {
    return validateParticipants(secondYearStudents, firstYearStudents, mentors);
  }, []);

  // Main Draw Application State
  const [teams, setTeams] = useState([]);
  const [unassigned, setUnassigned] = useState({ secondYears: [], firstYears: [], mentors: [] });
  const [isDrawActive, setIsDrawActive] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Modals & Overlay States
  const [showPresentation, setShowPresentation] = useState(false);
  const [presentationTeamIndex, setPresentationTeamIndex] = useState(0);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Derived progress calculations
  const progress = useMemo(() => {
    return calculateDrawProgress(teams);
  }, [teams]);

  /**
   * Action 1: Generate Teams
   * Creates unbiased randomized draw from participants configuration.
   */
  const handleGenerateTeams = useCallback(() => {
    try {
      const result = generateTeams(secondYearStudents, firstYearStudents, mentors);
      setTeams(result.teams);
      setUnassigned(result.unassigned);
      setIsDrawActive(true);
      setIsAnimating(false);
      setPresentationTeamIndex(0);
      showToast(
        `Generated ${result.totalTeams} balanced teams. Ready to draw names!`,
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
    if (isAnimating) return; // Prevent double-click race conditions

    const next = getNextRevealTarget(teams);
    if (!next) {
      showToast('All teams have already been completely revealed!', 'info');
      return;
    }

    setIsAnimating(true);

    setTeams((prevTeams) => {
      const nextTeams = prevTeams.map((team, tIdx) => {
        if (tIdx !== next.teamIndex) return team;

        const updatedMembers = team.members.map((member, sIdx) => {
          if (sIdx !== next.slotIndex) return member;
          return {
            ...member,
            revealed: true,
            revealedAt: new Date().toISOString()
          };
        });

        const isCompleted = updatedMembers.every((m) => m.revealed);
        return {
          ...team,
          members: updatedMembers,
          isCompleted
        };
      });

      return nextTeams;
    });

    // Update presentation view focus to follow the active draw
    setPresentationTeamIndex(next.teamIndex);

    // Release animation lock after reveal completes (~850ms)
    setTimeout(() => {
      setIsAnimating(false);
    }, 850);
  }, [teams, isAnimating, showToast]);

  /**
   * Action 3: Reveal Entire Current Team Sequentially
   * Auto-reveals all remaining unrevealed slots in the active team one by one with pauses.
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

    // Sequence unrevealed members with 900ms delay between each reveal
    unrevealedSlots.forEach((slot, sequenceStep) => {
      setTimeout(() => {
        setTeams((prevTeams) => {
          return prevTeams.map((team, tIdx) => {
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
        });

        // Release animation lock after final member in sequence finishes
        if (sequenceStep === unrevealedSlots.length - 1) {
          setTimeout(() => {
            setIsAnimating(false);
          }, 850);
        }
      }, sequenceStep * 900);
    });
  }, [teams, isAnimating, progress.currentTeamIndex, showToast]);

  /**
   * Action 4: Slot Click Handler
   * Allows clicking a slot directly ONLY IF it is the next valid slot in sequence.
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
    setIsDrawActive(false);
    setIsAnimating(false);
    setShowResetDialog(false);
    setShowPresentation(false);
    showToast('Draw has been reset. You can now generate a new draw.', 'info');
  }, [showToast]);

  /**
   * Action 6: Print Roster
   */
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="min-h-screen bg-canvas text-primaryText flex flex-col justify-between selection:bg-accent/20">
      <div>
        {/* Header */}
        <AppHeader
          status={progress.isAllRevealed ? 'Complete' : isDrawActive ? 'Drawing' : 'Ready'}
          isDrawActive={isDrawActive}
          isAllRevealed={progress.isAllRevealed}
          onReset={() => setShowResetDialog(true)}
        />

        <main className="app-container py-6 sm:py-8">
          {/* Printable Header for Print View */}
          <div className="hidden print:block print-header">
            <h1 className="text-2xl font-bold">Hackathon 2027 · Official Team Roster</h1>
            <p className="text-xs text-slate-600">
              Generated on {new Date().toLocaleDateString()} · Composition: 1 Second-Year + 2 First-Years + 1 Unique Mentor
            </p>
          </div>

          {/* Hero Section */}
          <HeroSection
            validation={validation}
            isDrawActive={isDrawActive}
            onGenerate={handleGenerateTeams}
            totalTeams={teams.length}
          />

          {/* Active Live Draw Area */}
          {isDrawActive && (
            <section aria-label="Team Draw Experience">
              {/* Draw Controls Toolbar */}
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
                onPrint={handlePrint}
              />

              {/* Progress Summary Banner */}
              <DrawProgress progress={progress} />

              {/* Completion Celebration (when 100% revealed) */}
              {progress.isAllRevealed && (
                <CompletionCelebration
                  totalTeams={progress.totalTeams}
                  onOpenExport={() => setShowExportModal(true)}
                  onPrint={handlePrint}
                  onReset={() => setShowResetDialog(true)}
                />
              )}

              {/* Team Cards Grid */}
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
            Strict 1:1 Unique Mentor Rule Active · Zero Participant Loss
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
        message="Discarding the current draw will clear all revealed team rosters. You will need to click 'Generate Teams' to start a fresh draw."
        confirmText="Yes, Reset Draw"
        cancelText="Keep Current Draw"
        confirmVariant="danger"
        onConfirm={handleConfirmReset}
        onCancel={() => setShowResetDialog(false)}
      />

      {/* CSV Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        teams={teams}
        unassigned={unassigned}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
}
