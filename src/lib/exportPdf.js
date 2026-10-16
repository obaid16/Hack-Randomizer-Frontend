/**
 * Generates an executive, print-perfect PDF document of the hackathon team draw.
 * Direct PDF download only (no Excel or CSV).
 * Uses SSR-safe dynamic imports so node server-rendering is never interrupted.
 * 
 * @param {Array} teams - Array of team objects
 * @param {object} unassigned - Leftover participants
 * @param {string} mode - 'revealed-only' | 'full-roster'
 */
export async function exportTeamsToPDF(teams = [], unassigned = {}, mode = 'full-roster') {
  if (typeof window === 'undefined') return;
  if (!Array.isArray(teams) || teams.length === 0) {
    throw new Error('No generated teams available to export.');
  }

  // Dynamically import jsPDF and autoTable exclusively on client
  const { default: jsPDF } = await import('jspdf');
  const autoTableModule = await import('jspdf-autotable');
  const autoTable = autoTableModule.default || autoTableModule;

  const isRevealedOnly = mode === 'revealed-only';
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const timestamp = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  // 1. Executive Editorial Header Banner
  doc.setFillColor(32, 33, 31); // #20211F
  doc.rect(0, 0, pageWidth, 56, 'F');

  // Accent Brand Strip
  doc.setFillColor(91, 91, 214); // #5B5BD6
  doc.rect(0, 56, pageWidth, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('HACKATHON 2027 · OFFICIAL TEAM ALLOCATION', 40, 35);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(200, 200, 210);
  doc.text(
    isRevealedOnly ? 'BROADCAST VIEW (REVEALED SLOTS)' : 'ORGANIZER MASTER ROSTER (FULL TEAMS)',
    pageWidth - 40,
    35,
    { align: 'right' }
  );

  // 2. Metadata Sub-bar
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(110, 112, 107);
  doc.text(`Generated: ${timestamp} · Composition: 1 Second-Year + 2 First-Years + 1 Dedicated Mentor`, 40, 78);
  doc.text(`Total Teams: ${teams.length} · Unique Mentors Enforced`, pageWidth - 40, 78, { align: 'right' });

  // 3. Format Data for AutoTable
  const tableRows = teams.map((team) => {
    const sy = team.members[0];
    const fy1 = team.members[1];
    const fy2 = team.members[2];
    const mentor = team.members[3];

    const getVal = (m) => {
      if (!m) return '—';
      if (isRevealedOnly) {
        return m.revealed ? m.name : '[Concealed]';
      }
      return m.name;
    };

    const isComplete = team.members.every((m) => m.revealed);
    const statusText = isComplete
      ? 'Fully Revealed'
      : team.members.some((m) => m.revealed)
      ? 'Partially Drawn'
      : 'Concealed';

    return [
      `#${team.number < 10 ? '0' + team.number : team.number}`,
      team.name,
      getVal(sy),
      getVal(fy1),
      getVal(fy2),
      getVal(mentor),
      statusText
    ];
  });

  autoTable(doc, {
    startY: 92,
    head: [[
      'Team #',
      'Team Name',
      'Second-Year Leader',
      'First-Year Builder 01',
      'First-Year Builder 02',
      'Technical Mentor',
      'Draw Status'
    ]],
    body: tableRows,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 6,
      textColor: [32, 33, 31],
      lineColor: [229, 231, 235],
      lineWidth: 0.5
    },
    headStyles: {
      fillColor: [247, 247, 244],
      textColor: [32, 33, 31],
      fontStyle: 'bold',
      lineColor: [209, 213, 219],
      lineWidth: 0.8
    },
    columnStyles: {
      0: { cellWidth: 50, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 100, fontStyle: 'bold', textColor: [91, 91, 214] },
      2: { cellWidth: 140 },
      3: { cellWidth: 135 },
      4: { cellWidth: 135 },
      5: { cellWidth: 130, textColor: [180, 83, 9] },
      6: { cellWidth: 70, halign: 'center', fontSize: 8 }
    },
    alternateRowStyles: {
      fillColor: [253, 253, 252]
    },
    margin: { left: 40, right: 40 },
    didDrawPage: (data) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      const str = `Page ${doc.internal.getNumberOfPages()} · Hackathon Team Randomizer · Official PDF Record`;
      doc.text(str, pageWidth / 2, pageHeight - 20, { align: 'center' });
    }
  });

  // 4. Unassigned Participants Table (if any)
  const hasLeftovers =
    (unassigned?.secondYears?.length || 0) > 0 ||
    (unassigned?.firstYears?.length || 0) > 0 ||
    (unassigned?.mentors?.length || 0) > 0;

  if (hasLeftovers) {
    const unassignedRows = [];
    (unassigned.secondYears || []).forEach((n) => unassignedRows.push(['Second-Year Student', n]));
    (unassigned.firstYears || []).forEach((n) => unassignedRows.push(['First-Year Student', n]));
    (unassigned.mentors || []).forEach((n) => unassignedRows.push(['Technical Mentor', n]));

    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 24 : 120;

    if (finalY + 100 > pageHeight) {
      doc.addPage();
    }

    autoTable(doc, {
      startY: finalY + 100 > pageHeight ? 40 : finalY,
      head: [['Unassigned Participant Pool', 'Participant Name']],
      body: unassignedRows,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 8,
        cellPadding: 5,
        textColor: [80, 80, 80]
      },
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [51, 65, 85],
        fontStyle: 'bold'
      },
      margin: { left: 40, right: 40 }
    });
  }

  // Save the PDF file
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = isRevealedOnly
    ? `hackathon_teams_revealed_${dateStr}.pdf`
    : `hackathon_teams_master_roster_${dateStr}.pdf`;

  doc.save(fileName);
}
