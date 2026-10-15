/**
 * ==============================================================================
 * HACKATHON PARTICIPANTS CONFIGURATION
 * ==============================================================================
 * Edit the arrays below to configure the participants for your live team draw.
 * 
 * Composition Rules:
 *  - Every team requires:
 *      * Exactly 1 Second-Year Student (Team Leader)
 *      * Exactly 2 First-Year Students (Core Members)
 *      * Exactly 1 Mentor (Assigned uniquely, 1:1, never shared across teams)
 * 
 * The algorithm automatically computes the maximum possible complete teams:
 *   Math.min(secondYearStudents.length, Math.floor(firstYearStudents.length / 2), mentors.length)
 * 
 * Any remaining participants who cannot form a complete team are safely
 * preserved in the "Unassigned Participants" panel.
 * ==============================================================================
 */

/**
 * List of Second-Year Students (Team Leaders)
 * Each team gets exactly 1 second-year leader.
 */
export const secondYearStudents = [
  'Aarav Sharma',
  'Diya Patel',
  'Rohan Iyer',
  'Ananya Deshmukh',
  'Kabir Verma',
  'Pooja Nair',
  'Siddharth Rao',
  'Meera Joshi',
  'Vikram Malhotra',
  'Sneha Kulkarni'
];

/**
 * List of First-Year Students (Core Builders)
 * Each team gets exactly 2 first-year students.
 */
export const firstYearStudents = [
  'Arjun Mehta',
  'Tanvi Saxena',
  'Ishaan Gupta',
  'Rhea Sengupta',
  'Kunal Bhatia',
  'Shreya Pillai',
  'Aditya Roy',
  'Neha Agarwal',
  'Varun Chopra',
  'Kavya Menon',
  'Yash Trivedi',
  'Avani Choudhury',
  'Aryan Khanna',
  'Ritu Bansal',
  'Gaurav Sethi',
  'Tara Nambiar',
  'Manish Varma',
  'Simran Kaur',
  'Dhruv Mathur',
  'Pari Singhania',
  'Nikhil Bose',
  'Isha Kapoor'
];

/**
 * List of Hackathon Mentors
 * Each team gets exactly 1 unique mentor.
 * Mentors are NEVER shared or reused across teams in the same draw.
 */
export const mentors = [
  'Dr. Rajesh Sen (AI/ML & Systems)',
  'Prof. Sunita Reddy (Full-Stack & Cloud)',
  'Alex Chen (DevOps & Distributed Systems)',
  'Priya Ramanathan (UI/UX & Frontend)',
  'David Kumar (Mobile Apps & IoT)',
  'Dr. Kavita Narang (Cybersecurity & Cryptography)',
  'Marcus Vance (Web3 & Smart Contracts)',
  'Harish Sundaram (Data Engineering & Big Data)',
  'Elena Rostova (Game Engine & Computer Graphics)',
  'Anil Kothari (Product Architecture & Strategy)',
  'Deepa Venkat (Microservices & Go)',
  'Sanjay Chawla (Edge Computing & Embedded)'
];
