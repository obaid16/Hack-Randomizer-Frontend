/**
 * Comprehensive Automated Test Suite for Hackathon Team Draw Engine
 */

import { validateParticipants } from '../src/lib/validateParticipants.js';
import { generateTeams, fisherYatesShuffle } from '../src/lib/generateTeams.js';
import {
  getNextRevealTarget,
  calculateDrawProgress,
  canRevealSlot,
  SLOT_ROLES
} from '../src/lib/revealSequence.js';

let passedCount = 0;
let failedCount = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failedCount++;
  }
}

console.log('\n======================================================');
console.log(' RUNNING HACKATHON TEAM DRAW ENGINE TEST SUITE');
console.log('======================================================\n');

// 1. Validation Tests
console.log('--- 1. Validation Tests ---');

const emptyRes = validateParticipants([], [], []);
assert(!emptyRes.isValid, 'Empty participant lists fail validation');
assert(emptyRes.errors.length >= 3, 'Empty lists report errors for all missing categories');

const dupeRes = validateParticipants(
  ['Aarav', 'aarav'],
  ['Rhea', 'Kunal'],
  ['Dr. Sen']
);
assert(!dupeRes.isValid, 'Case-insensitive duplicates in second-years fail validation');
assert(dupeRes.errors.some(e => e.includes('Duplicate')), 'Reports duplicate name error');

const insufficientFy = validateParticipants(
  ['Aarav'],
  ['Rhea'], // Only 1 FY, needs 2
  ['Dr. Sen']
);
assert(!insufficientFy.isValid, 'Only 1 FY fails validation (minimum 2 needed for 1 team)');
assert(insufficientFy.maxTeams === 0, 'Max teams is 0 when FY < 2');

const validRes = validateParticipants(
  ['SY 1', 'SY 2', 'SY 3'],
  ['FY 1', 'FY 2', 'FY 3', 'FY 4', 'FY 5', 'FY 6', 'FY 7'], // 7 FY -> floor(7/2) = 3
  ['Mentor 1', 'Mentor 2', 'Mentor 3', 'Mentor 4'] // 4 Mentors
);
assert(validRes.isValid, 'Valid counts produce isValid = true');
assert(validRes.maxTeams === 3, 'maxTeams is correctly min(3, 3, 4) = 3');
assert(validRes.stats.leftoverFy === 1, 'Calculates 1 leftover FY student (7 - 3*2 = 1)');
assert(validRes.stats.leftoverMentors === 1, 'Calculates 1 leftover mentor (4 - 3 = 1)');

// 2. Team Generation Tests
console.log('\n--- 2. Team Generation Tests ---');

const syList = ['SY Alpha', 'SY Beta', 'SY Gamma', 'SY Delta'];
const fyList = ['FY A', 'FY B', 'FY C', 'FY D', 'FY E', 'FY F', 'FY G', 'FY H'];
const mentorList = ['Mentor 1', 'Mentor 2', 'Mentor 3', 'Mentor 4'];

const genResult = generateTeams(syList, fyList, mentorList);
assert(genResult.success, 'Team generation succeeds');
assert(genResult.teams.length === 4, 'Generates exactly 4 complete teams');

// Verify strict composition and unique mentor assignment
let allMentorsUnique = true;
let allSyUnique = true;
let allFyUnique = true;
const seenMentors = new Set();
const seenSy = new Set();
const seenFy = new Set();

genResult.teams.forEach((team) => {
  assert(team.members.length === 4, `${team.name} contains exactly 4 member slots`);

  const [sy, fy1, fy2, mentor] = team.members;

  assert(sy.role === 'SECOND_YEAR' && sy.slotIndex === 0, `${team.name} slot 0 is SECOND_YEAR`);
  assert(fy1.role === 'FIRST_YEAR_1' && fy1.slotIndex === 1, `${team.name} slot 1 is FIRST_YEAR_1`);
  assert(fy2.role === 'FIRST_YEAR_2' && fy2.slotIndex === 2, `${team.name} slot 2 is FIRST_YEAR_2`);
  assert(mentor.role === 'MENTOR' && mentor.slotIndex === 3, `${team.name} slot 3 is MENTOR`);

  if (seenMentors.has(mentor.name)) allMentorsUnique = false;
  seenMentors.add(mentor.name);

  if (seenSy.has(sy.name)) allSyUnique = false;
  seenSy.add(sy.name);

  if (seenFy.has(fy1.name) || seenFy.has(fy2.name) || fy1.name === fy2.name) allFyUnique = false;
  seenFy.add(fy1.name);
  seenFy.add(fy2.name);
});

assert(allMentorsUnique, 'Strict Mentor Uniqueness: Zero mentor reuse across any teams');
assert(allSyUnique, 'Strict SY Uniqueness: Each leader assigned to exactly 1 team');
assert(allFyUnique, 'Strict FY Uniqueness: No first-year assigned to multiple slots');

// 3. Reveal Sequence and State Progression Tests
console.log('\n--- 3. Reveal Sequence & State Progression Tests ---');

const mockTeams = JSON.parse(JSON.stringify(genResult.teams));

// Initially all concealed
let target = getNextRevealTarget(mockTeams);
assert(target.teamIndex === 0 && target.slotIndex === 0, 'First reveal target is Team 1, slot 0 (SY leader)');

let progress = calculateDrawProgress(mockTeams);
assert(progress.revealedMembersCount === 0, 'Initial revealed count is 0');
assert(progress.teamsCompleted === 0, 'Initial completed teams is 0');
assert(progress.remainingMembersCount === 16, 'Initial remaining count is 16');

// Attempting to reveal slot 1 out of order should be rejected
let slotCheck = canRevealSlot(mockTeams, 0, 1);
assert(!slotCheck.canReveal, 'Slot click rejection: cannot reveal slot 1 before slot 0');

// Reveal slot 0 of team 0
mockTeams[0].members[0].revealed = true;
target = getNextRevealTarget(mockTeams);
assert(target.teamIndex === 0 && target.slotIndex === 1, 'Next target moves to Team 1, slot 1 (FY 01)');

// Reveal slot 1 of team 0
mockTeams[0].members[1].revealed = true;
target = getNextRevealTarget(mockTeams);
assert(target.teamIndex === 0 && target.slotIndex === 2, 'Next target moves to Team 1, slot 2 (FY 02)');

// Reveal slot 2 of team 0
mockTeams[0].members[2].revealed = true;
target = getNextRevealTarget(mockTeams);
assert(target.teamIndex === 0 && target.slotIndex === 3, 'Next target moves to Team 1, slot 3 (Mentor)');

// Reveal slot 3 of team 0 (Completes Team 1!)
mockTeams[0].members[3].revealed = true;
progress = calculateDrawProgress(mockTeams);
assert(progress.teamsCompleted === 1, 'Completing all 4 slots marks 1 team completed');

// Target should now advance to Team 2, slot 0
target = getNextRevealTarget(mockTeams);
assert(target.teamIndex === 1 && target.slotIndex === 0, 'Target automatically advances to Team 2, slot 0');

// Reveal all remaining members
for (let t = 1; t < mockTeams.length; t++) {
  for (let s = 0; s < 4; s++) {
    mockTeams[t].members[s].revealed = true;
  }
}

progress = calculateDrawProgress(mockTeams);
assert(progress.isAllRevealed, 'Progress reports isAllRevealed = true when all members revealed');
assert(progress.teamsCompleted === 4, 'Reports all 4 teams completed');
assert(progress.remainingMembersCount === 0, '0 remaining members count');
assert(getNextRevealTarget(mockTeams) === null, 'getNextRevealTarget returns null when draw is finished');

// 4. Uneven Participant Count & Unassigned Retention
console.log('\n--- 4. Leftover Retention Tests ---');
const unevenSy = ['SY 1', 'SY 2']; // 2
const unevenFy = ['FY 1', 'FY 2', 'FY 3', 'FY 4', 'FY 5']; // 5 -> 2 pairs, 1 leftover
const unevenMentors = ['M 1', 'M 2', 'M 3']; // 3 -> 1 leftover

const unevenGen = generateTeams(unevenSy, unevenFy, unevenMentors);
assert(unevenGen.teams.length === 2, 'Generates min(2, 2, 3) = 2 teams');
assert(unevenGen.unassigned.secondYears.length === 0, '0 leftover SY');
assert(unevenGen.unassigned.firstYears.length === 1, 'Safely preserves 1 leftover FY');
assert(unevenGen.unassigned.mentors.length === 1, 'Safely preserves 1 leftover Mentor');

// 5. Dynamic Categories & Multi-Event Feasibility Tests
console.log('\n--- 5. Dynamic Categories & Feasibility Tests ---');

// Mock Multi-Event Feasibility Calculator
function calculateDynamicFeasibility(participants, composition, requestedTeams) {
  let maxPossible = Infinity;
  let bottleneck = null;

  composition.forEach((rule) => {
    const available = participants.filter((p) => p.categoryId === rule.categoryId).length;
    const possible = Math.floor(available / rule.count);
    if (possible < maxPossible) {
      maxPossible = possible;
      bottleneck = rule.categoryId;
    }
  });

  const isFeasible = requestedTeams <= maxPossible && requestedTeams > 0;
  return { maxPossible, isFeasible, bottleneck: isFeasible ? null : bottleneck };
}

// Test with 3 custom categories: Developer (2 per team), Designer (1 per team), Judge (1 per team)
const customComposition = [
  { categoryId: 'cat_dev', count: 2 },
  { categoryId: 'cat_des', count: 1 },
  { categoryId: 'cat_judge', count: 1 }
];

const mockCustomParticipants = [
  // 6 Developers -> 3 teams
  { name: 'Dev 1', categoryId: 'cat_dev' },
  { name: 'Dev 2', categoryId: 'cat_dev' },
  { name: 'Dev 3', categoryId: 'cat_dev' },
  { name: 'Dev 4', categoryId: 'cat_dev' },
  { name: 'Dev 5', categoryId: 'cat_dev' },
  { name: 'Dev 6', categoryId: 'cat_dev' },
  // 2 Designers -> 2 teams (Bottleneck!)
  { name: 'Des 1', categoryId: 'cat_des' },
  { name: 'Des 2', categoryId: 'cat_des' },
  // 5 Judges -> 5 teams
  { name: 'Judge 1', categoryId: 'cat_judge' },
  { name: 'Judge 2', categoryId: 'cat_judge' },
  { name: 'Judge 3', categoryId: 'cat_judge' },
  { name: 'Judge 4', categoryId: 'cat_judge' },
  { name: 'Judge 5', categoryId: 'cat_judge' }
];

const feasResult1 = calculateDynamicFeasibility(mockCustomParticipants, customComposition, 2);
assert(feasResult1.isFeasible, 'Dynamic category feasibility returns true when requested count <= max');
assert(feasResult1.maxPossible === 2, 'Calculates correct bottleneck limit (2 Designers limit teams to 2)');

const feasResult2 = calculateDynamicFeasibility(mockCustomParticipants, customComposition, 3);
assert(!feasResult2.isFeasible, 'Dynamic category feasibility detects impossible request (requested 3, max 2)');
assert(feasResult2.bottleneck === 'cat_des', 'Identifies correct bottleneck category (cat_des)');

// 6. Security & JWT Session Tests
console.log('\n--- 6. Security & Session Tests ---');
import jwt from 'jsonwebtoken';
const TEST_JWT_SECRET = 'test-secret-key-32890123';
const adminPayload = { email: 'admin@example.org', role: 'ADMIN' };
const testToken = jwt.sign(adminPayload, TEST_JWT_SECRET, { expiresIn: '1h' });
const verified = jwt.verify(testToken, TEST_JWT_SECRET);
assert(verified.email === 'admin@example.org', 'Signs and verifies admin JWT correctly');

let rejectedTampered = false;
try {
  jwt.verify(testToken, 'wrong-secret');
} catch {
  rejectedTampered = true;
}
assert(rejectedTampered, 'Rejects invalid or tampered JWT credentials');

console.log('\n======================================================');
console.log(` TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
console.log('======================================================\n');

if (failedCount > 0) {
  process.exit(1);
}

