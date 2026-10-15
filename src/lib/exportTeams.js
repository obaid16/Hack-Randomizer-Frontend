/**
 * Generates and triggers CSV downloads of hackathon team rosters.
 * Supports two distinct modes:
 *  1. 'revealed-only': Safe for public broadcast / participants (unrevealed slots say "[Concealed]")
 *  2. 'full-roster': For internal organizers / administrators
 * 
 * @param {Array} teams - Array of team objects
 * @param {object} unassigned - Leftover participants
 * @param {string} mode - 'revealed-only' | 'full-roster'
 */
export function exportTeamsToCSV(teams = [], unassigned = {}, mode = 'revealed-only') {
  if (!Array.isArray(teams) || teams.length === 0) {
    throw new Error('No generated teams available to export.');
  }

  const isRevealedOnly = mode === 'revealed-only';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = isRevealedOnly
    ? `hackathon_teams_revealed_${timestamp}.csv`
    : `hackathon_teams_full_roster_${timestamp}.csv`;

  const rows = [];

  // Header metadata
  rows.push([
    'Team Number',
    'Team Name',
    'Second-Year Leader',
    'First-Year Student 01',
    'First-Year Student 02',
    'Assigned Mentor',
    'Team Status'
  ]);

  teams.forEach((team) => {
    const sy = team.members[0];
    const fy1 = team.members[1];
    const fy2 = team.members[2];
    const mentor = team.members[3];

    const getVal = (m) => {
      if (!m) return '';
      if (isRevealedOnly) {
        return m.revealed ? m.name : '[Concealed]';
      }
      return m.name;
    };

    const status = team.members.every((m) => m.revealed)
      ? 'Fully Revealed'
      : team.members.some((m) => m.revealed)
      ? 'Partially Revealed'
      : 'Concealed';

    rows.push([
      team.number,
      team.name,
      getVal(sy),
      getVal(fy1),
      getVal(fy2),
      getVal(mentor),
      status
    ]);
  });

  // Append Unassigned Participants section if present
  const hasLeftovers =
    (unassigned?.secondYears?.length || 0) > 0 ||
    (unassigned?.firstYears?.length || 0) > 0 ||
    (unassigned?.mentors?.length || 0) > 0;

  if (hasLeftovers) {
    rows.push([]);
    rows.push(['--- UNASSIGNED PARTICIPANTS ---']);
    rows.push(['Category', 'Name']);

    (unassigned.secondYears || []).forEach((name) => {
      rows.push(['Second-Year Student', name]);
    });
    (unassigned.firstYears || []).forEach((name) => {
      rows.push(['First-Year Student', name]);
    });
    (unassigned.mentors || []).forEach((name) => {
      rows.push(['Mentor', name]);
    });
  }

  // Format CSV with quote escaping
  const csvContent = rows
    .map((row) =>
      row
        .map((cell) => {
          const str = cell === null || cell === undefined ? '' : String(cell);
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(',')
    )
    .join('\r\n');

  // Trigger client download
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
