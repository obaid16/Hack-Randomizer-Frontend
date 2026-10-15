/**
 * Utilities for tracking, advancing, and validating the member reveal sequence.
 * 
 * Strict Reveal Order:
 * 1. Second-Year Student (Leader) -> slot 0
 * 2. First-Year Student 01 -> slot 1
 * 3. First-Year Student 02 -> slot 2
 * 4. Mentor -> slot 3
 */

export const SLOT_ROLES = [
  { index: 0, key: 'SECOND_YEAR', label: 'Second-Year Student', short: 'Second-Year' },
  { index: 1, key: 'FIRST_YEAR_1', label: 'First-Year Student 01', short: 'First-Year 01' },
  { index: 2, key: 'FIRST_YEAR_2', label: 'First-Year Student 02', short: 'First-Year 02' },
  { index: 3, key: 'MENTOR', label: 'Assigned Mentor', short: 'Mentor' }
];

/**
 * Finds the next eligible member to reveal across all teams.
 * 
 * @param {Array} teams - Array of team objects
 * @returns {object|null} Next reveal target or null if draw is complete
 */
export function getNextRevealTarget(teams = []) {
  if (!Array.isArray(teams) || teams.length === 0) return null;

  for (let teamIndex = 0; teamIndex < teams.length; teamIndex++) {
    const team = teams[teamIndex];
    for (let slotIndex = 0; slotIndex < team.members.length; slotIndex++) {
      const member = team.members[slotIndex];
      if (!member.revealed) {
        return {
          teamIndex,
          teamId: team.id,
          teamName: team.name,
          slotIndex,
          memberId: member.id,
          role: member.role,
          roleLabel: member.roleLabel,
          roleTag: member.roleTag
        };
      }
    }
  }

  return null; // All members revealed
}

/**
 * Calculates current draw statistics and progress indicators.
 * 
 * @param {Array} teams - Array of team objects
 * @returns {object} Comprehensive draw progress metrics
 */
export function calculateDrawProgress(teams = []) {
  if (!Array.isArray(teams) || teams.length === 0) {
    return {
      totalTeams: 0,
      teamsCompleted: 0,
      currentTeamIndex: 0,
      currentTeamName: null,
      currentTeamRevealedCount: 0,
      revealedMembersCount: 0,
      totalMembersCount: 0,
      remainingMembersCount: 0,
      percentage: 0,
      isAllRevealed: false,
      nextTarget: null,
      nextActionLabel: 'Generate Teams'
    };
  }

  const totalTeams = teams.length;
  const totalMembersCount = totalTeams * 4;
  let revealedMembersCount = 0;
  let teamsCompleted = 0;

  teams.forEach((t) => {
    const revealedSlots = t.members.filter((m) => m.revealed).length;
    revealedMembersCount += revealedSlots;
    if (revealedSlots === 4) {
      teamsCompleted += 1;
    }
  });

  const nextTarget = getNextRevealTarget(teams);
  const isAllRevealed = revealedMembersCount === totalMembersCount;
  const remainingMembersCount = totalMembersCount - revealedMembersCount;
  const percentage = totalMembersCount > 0 ? Math.round((revealedMembersCount / totalMembersCount) * 100) : 0;

  let currentTeamIndex = nextTarget ? nextTarget.teamIndex : Math.max(0, totalTeams - 1);
  let currentTeamName = teams[currentTeamIndex] ? teams[currentTeamIndex].name : null;
  let currentTeamRevealedCount = teams[currentTeamIndex]
    ? teams[currentTeamIndex].members.filter((m) => m.revealed).length
    : 0;

  // Dynamic button label according to current reveal target
  let nextActionLabel = 'Reveal Next Member';
  if (isAllRevealed) {
    nextActionLabel = 'Draw Complete';
  } else if (nextTarget) {
    switch (nextTarget.slotIndex) {
      case 0:
        nextActionLabel = `Reveal Second-Year Leader · ${nextTarget.teamName}`;
        break;
      case 1:
        nextActionLabel = `Reveal First-Year Student 01 · ${nextTarget.teamName}`;
        break;
      case 2:
        nextActionLabel = `Reveal First-Year Student 02 · ${nextTarget.teamName}`;
        break;
      case 3:
        nextActionLabel = `Reveal Mentor · ${nextTarget.teamName}`;
        break;
      default:
        nextActionLabel = `Reveal Member · ${nextTarget.teamName}`;
    }
  }

  return {
    totalTeams,
    teamsCompleted,
    currentTeamIndex,
    currentTeamName,
    currentTeamRevealedCount,
    revealedMembersCount,
    totalMembersCount,
    remainingMembersCount,
    percentage,
    isAllRevealed,
    nextTarget,
    nextActionLabel
  };
}

/**
 * Checks whether a specific team slot is eligible to be revealed right now.
 * Enforces the strict sequential reveal order.
 * 
 * @param {Array} teams - Teams list
 * @param {number} teamIndex - Target team index
 * @param {number} slotIndex - Target slot index (0, 1, 2, 3)
 * @returns {object} { canReveal: boolean, reason: string }
 */
export function canRevealSlot(teams, teamIndex, slotIndex) {
  const nextTarget = getNextRevealTarget(teams);
  if (!nextTarget) {
    return { canReveal: false, reason: 'All team members have already been revealed.' };
  }

  if (teamIndex !== nextTarget.teamIndex) {
    if (teamIndex > nextTarget.teamIndex) {
      return {
        canReveal: false,
        reason: `Please finish revealing ${nextTarget.teamName} before advancing to this team.`
      };
    }
    return {
      canReveal: false,
      reason: 'This member has already been revealed.'
    };
  }

  if (slotIndex !== nextTarget.slotIndex) {
    if (slotIndex > nextTarget.slotIndex) {
      const prevRole = SLOT_ROLES[nextTarget.slotIndex]?.label || 'previous member';
      return {
        canReveal: false,
        reason: `Please reveal the ${prevRole} first.`
      };
    }
    return {
      canReveal: false,
      reason: 'This member has already been revealed.'
    };
  }

  return { canReveal: true, reason: '' };
}
