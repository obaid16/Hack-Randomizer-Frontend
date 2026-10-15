/**
 * EXPLICITLY LABELED DESIGN-ONLY FIXTURES
 * WARNING: These fixtures are strictly intended for isolated visual component prototyping
 * and design verification. They are NEVER used in production or as fake API fallbacks.
 */

export const DESIGN_ONLY_FIXTURES = Object.freeze({
  stats: {
    activeFirstYearStudents: 15,
    activeSecondYearStudents: 8,
    totalActiveStudents: 23,
    activeMentors: 4,
    possibleTeams: 7,
    savedGenerationsCount: 1,
    currentlyAssignedStudents: 21,
    currentlyUnassignedStudents: 2,
    mostRecentGeneration: {
      generationName: 'Visual Prototype Cohort Alpha',
      teamCount: 7,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString()
    }
  },
  sampleStudent: {
    _id: 'fixture-stu-001',
    fullName: 'Aryan Nair (Design Sample)',
    studentId: 'FY-CS-101',
    email: 'aryan.nair@college.edu',
    academicYear: 'FIRST_YEAR',
    department: 'Computer Science',
    skills: ['React', 'JavaScript', 'HTML/CSS'],
    status: 'ACTIVE'
  },
  sampleMentor: {
    _id: 'fixture-mtr-001',
    fullName: 'Dr. Ramesh Kumar (Design Sample)',
    mentorId: 'MTR-001',
    email: 'ramesh.kumar@college.edu',
    expertise: ['Cloud Architecture', 'DevOps', 'Distributed Systems'],
    status: 'ACTIVE'
  }
});
