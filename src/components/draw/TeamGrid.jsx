'use client';

import { motion } from 'framer-motion';
import TeamCard from './TeamCard';

/**
 * Responsive Team Grid Container with staggered entry transitions.
 */
export default function TeamGrid({
  teams = [],
  currentTeamIndex = 0,
  nextTarget = null,
  isAnimating = false,
  onSlotClick = null,
  onRevealTeam = null,
  isPresentation = false
}) {
  if (!teams || teams.length === 0) return null;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {teams.map((team, idx) => (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.4) }}
          >
            <TeamCard
              team={team}
              teamIndex={idx}
              currentTeamIndex={currentTeamIndex}
              nextTarget={nextTarget}
              isAnimating={isAnimating}
              onSlotClick={onSlotClick}
              onRevealTeam={onRevealTeam}
              isPresentation={isPresentation}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
