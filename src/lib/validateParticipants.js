/**
 * Validates participant configuration arrays according to strict hackathon composition rules.
 * 
 * Rules:
 * - Exactly 1 Second-Year Student per team.
 * - Exactly 2 First-Year Students per team.
 * - Exactly 1 Unique Mentor per team (zero reuse across teams).
 * 
 * @param {string[]} secondYears - List of second-year student names
 * @param {string[]} firstYears - List of first-year student names
 * @param {string[]} mentorList - List of mentor names
 * @returns {object} Validation result containing status, errors, warnings, and capacity metrics
 */
export function validateParticipants(secondYears = [], firstYears = [], mentorList = []) {
  const errors = [];
  const warnings = [];

  const syClean = (Array.isArray(secondYears) ? secondYears : [])
    .map((name) => (typeof name === 'string' ? name.trim() : ''))
    .filter(Boolean);

  const fyClean = (Array.isArray(firstYears) ? firstYears : [])
    .map((name) => (typeof name === 'string' ? name.trim() : ''))
    .filter(Boolean);

  const mentorsClean = (Array.isArray(mentorList) ? mentorList : [])
    .map((name) => (typeof name === 'string' ? name.trim() : ''))
    .filter(Boolean);

  // Check for empty names dropped
  if (Array.isArray(secondYears) && syClean.length < secondYears.length) {
    warnings.push(`${secondYears.length - syClean.length} empty or blank entries in second-year students were ignored.`);
  }
  if (Array.isArray(firstYears) && fyClean.length < firstYears.length) {
    warnings.push(`${firstYears.length - fyClean.length} empty or blank entries in first-year students were ignored.`);
  }
  if (Array.isArray(mentorList) && mentorsClean.length < mentorList.length) {
    warnings.push(`${mentorList.length - mentorsClean.length} empty or blank entries in mentors were ignored.`);
  }

  // Duplicate detection helper
  const findDuplicates = (arr) => {
    const seen = new Set();
    const dupes = new Set();
    for (const item of arr) {
      const lower = item.toLowerCase();
      if (seen.has(lower)) {
        dupes.add(item);
      } else {
        seen.add(lower);
      }
    }
    return Array.from(dupes);
  };

  const syDupes = findDuplicates(syClean);
  const fyDupes = findDuplicates(fyClean);
  const mentorDupes = findDuplicates(mentorsClean);

  if (syDupes.length > 0) {
    errors.push(`Duplicate second-year student names detected: ${syDupes.join(', ')}.`);
  }
  if (fyDupes.length > 0) {
    errors.push(`Duplicate first-year student names detected: ${fyDupes.join(', ')}.`);
  }
  if (mentorDupes.length > 0) {
    errors.push(`Duplicate mentor names detected: ${mentorDupes.join(', ')}.`);
  }

  // Minimum participant threshold check
  if (syClean.length === 0) {
    errors.push('No second-year students configured. At least 1 is required.');
  }
  if (fyClean.length < 2) {
    errors.push(`Insufficient first-year students (${fyClean.length} found). At least 2 are required to form a single team.`);
  }
  if (mentorsClean.length === 0) {
    errors.push('No mentors configured. At least 1 unique mentor is required.');
  }

  // Calculate maximum complete teams possible
  const maxTeams = Math.min(
    syClean.length,
    Math.floor(fyClean.length / 2),
    mentorsClean.length
  );

  if (maxTeams === 0 && errors.length === 0) {
    errors.push('Unable to form even a single complete team with the provided participant counts.');
  }

  // Calculate unassigned participant numbers
  const leftoverSy = syClean.length - maxTeams;
  const leftoverFy = fyClean.length - maxTeams * 2;
  const leftoverMentors = mentorsClean.length - maxTeams;

  if (leftoverSy > 0 || leftoverFy > 0 || leftoverMentors > 0) {
    warnings.push(
      `Leftover participants will remain unassigned: ${leftoverSy} Second-Year(s), ${leftoverFy} First-Year(s), ${leftoverMentors} Mentor(s).`
    );
  }

  return {
    isValid: errors.length === 0 && maxTeams > 0,
    maxTeams,
    errors,
    warnings,
    stats: {
      secondYearsCount: syClean.length,
      firstYearsCount: fyClean.length,
      mentorsCount: mentorsClean.length,
      maxPossibleTeams: maxTeams,
      leftoverSy,
      leftoverFy,
      leftoverMentors
    },
    cleanedData: {
      secondYears: syClean,
      firstYears: fyClean,
      mentors: mentorsClean
    }
  };
}
