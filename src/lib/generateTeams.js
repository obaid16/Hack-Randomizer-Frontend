import { validateParticipants } from './validateParticipants.js';

/**
 * Modern Fisher-Yates (Knuth) Shuffle algorithm.
 * Guarantees unbiased O(N) uniform pseudo-random distribution.
 * 
 * @param {Array} array - Array to shuffle
 * @returns {Array} New shuffled array without mutating the original
 */
export function fisherYatesShuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generates randomized hackathon teams obeying strict composition and reveal rules.
 * 
 * Strict Composition Rules:
 *  - Exactly 1 Second-Year Student (Leader)
 *  - Exactly 2 First-Year Students (Core Members)
 *  - Exactly 1 Unique Mentor (Never shared or reused across teams)
 * 
 * Strict Reveal Order per Team:
 *  1. Second-Year Student (slot 0)
 *  2. First-Year Student 01 (slot 1)
 *  3. First-Year Student 02 (slot 2)
 *  4. Mentor (slot 3)
 * 
 * @param {string[]} secondYears - Second-year student names
 * @param {string[]} firstYears - First-year student names
 * @param {string[]} mentors - Mentor names
 * @returns {object} { success, teams, unassigned, validation }
 */
export function generateTeams(secondYears, firstYears, mentors) {
  const validation = validateParticipants(secondYears, firstYears, mentors);

  if (!validation.isValid) {
    throw new Error(
      validation.errors.join(' ') || 'Participant list is insufficient to generate valid teams.'
    );
  }

  const { maxTeams } = validation;
  const { secondYears: syClean, firstYears: fyClean, mentors: mentorsClean } = validation.cleanedData;

  // Independent Fisher-Yates shuffles for fair distribution
  const shuffledSy = fisherYatesShuffle(syClean);
  const shuffledFy = fisherYatesShuffle(fyClean);
  const shuffledMentors = fisherYatesShuffle(mentorsClean);

  const teams = [];

  for (let i = 0; i < maxTeams; i++) {
    const teamNum = i + 1;
    const paddedNum = teamNum < 10 ? `0${teamNum}` : `${teamNum}`;

    const syMember = shuffledSy[i];
    const fyMember1 = shuffledFy[i * 2];
    const fyMember2 = shuffledFy[i * 2 + 1];
    const mentorMember = shuffledMentors[i];

    const team = {
      id: `team-${teamNum}`,
      number: teamNum,
      name: `TEAM ${paddedNum}`,
      isCompleted: false,
      members: [
        {
          id: `team-${teamNum}-slot-0`,
          slotIndex: 0,
          role: 'SECOND_YEAR',
          roleLabel: 'Second-Year Student',
          roleTag: 'Team Leader',
          name: syMember,
          revealed: false,
          revealedAt: null
        },
        {
          id: `team-${teamNum}-slot-1`,
          slotIndex: 1,
          role: 'FIRST_YEAR_1',
          roleLabel: 'First-Year Student 01',
          roleTag: 'Core Builder',
          name: fyMember1,
          revealed: false,
          revealedAt: null
        },
        {
          id: `team-${teamNum}-slot-2`,
          slotIndex: 2,
          role: 'FIRST_YEAR_2',
          roleLabel: 'First-Year Student 02',
          roleTag: 'Core Builder',
          name: fyMember2,
          revealed: false,
          revealedAt: null
        },
        {
          id: `team-${teamNum}-slot-3`,
          slotIndex: 3,
          role: 'MENTOR',
          roleLabel: 'Assigned Mentor',
          roleTag: 'Technical Mentor',
          name: mentorMember,
          revealed: false,
          revealedAt: null
        }
      ]
    };

    teams.push(team);
  }

  // Preserve leftover participants with zero loss
  const unassigned = {
    secondYears: shuffledSy.slice(maxTeams),
    firstYears: shuffledFy.slice(maxTeams * 2),
    mentors: shuffledMentors.slice(maxTeams)
  };

  return {
    success: true,
    generatedAt: new Date().toISOString(),
    totalTeams: maxTeams,
    teams,
    unassigned,
    validation
  };
}
