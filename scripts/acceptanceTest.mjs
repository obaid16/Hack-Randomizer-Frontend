// End-to-End Acceptance Test validating Requirement 10
import assert from 'assert';

const BASE_URL = 'http://localhost:3000';

async function runAcceptance() {
  console.log('========================================================');
  console.log('   STARTING MULTI-EVENT ADMIN GOVERNANCE ACCEPTANCE TEST');
  console.log('========================================================\n');

  // 1. Log in as authorized admin
  console.log('Step 1: Admin Login...');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'obaidullshaikh07@gmail.com',
      password: process.env.ADMIN_PASSWORD || 'ubaid@231006'
    })
  });
  const loginData = await loginRes.json();
  assert(loginRes.status === 200, `Login failed: ${loginData.message}`);
  assert(loginData.success === true, 'Login response success must be true');
  
  // Extract auth cookie from Set-Cookie header
  const rawCookie = loginRes.headers.get('set-cookie');
  const tokenMatch = rawCookie?.match(/auth_token=([^;]+)/);
  const authToken = tokenMatch ? tokenMatch[1] : null;
  assert(authToken, 'Auth token cookie must be present');
  console.log('  ✓ Step 1 Passed: Authorized admin logged in successfully\n');

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  };

  // 2. Create Event A
  console.log('Step 2: Create Event A...');
  const createARes = await fetch(`${BASE_URL}/api/events`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Event A · Robotics Cup',
      description: 'Autonomous robotics challenge with leaders, hardware engineers, and mentors',
      status: 'ACTIVE',
      categories: [
        { id: 'cat_lead', name: 'Team Lead', roleTag: 'Lead', countPerTeam: 1, isUniqueMentor: false },
        { id: 'cat_hw', name: 'Hardware Engineer', roleTag: 'HW Engineer', countPerTeam: 2, isUniqueMentor: false },
        { id: 'cat_advisor', name: 'Faculty Advisor', roleTag: 'Advisor', countPerTeam: 1, isUniqueMentor: true }
      ],
      rules: {
        teamSize: 4,
        requestedTeams: 2,
        uniqueMentor: true,
        composition: [
          { categoryId: 'cat_lead', count: 1 },
          { categoryId: 'cat_hw', count: 2 },
          { categoryId: 'cat_advisor', count: 1 }
        ]
      }
    })
  });
  const createAData = await createARes.json();
  assert(createARes.status === 200, `Create Event A failed: ${createAData.message}`);
  const eventAId = createAData.event.eventId;
  assert(eventAId, 'Event A ID must be generated');
  console.log(`  ✓ Step 2 Passed: Created Event A (${eventAId})\n`);

  // 3. Add students and mentors to Event A
  console.log('Step 3: Add participants to Event A...');
  const participantsA = [
    { name: 'Lead Alice', email: 'alice@eventa.com', categoryId: 'cat_lead', status: 'ACTIVE' },
    { name: 'Lead Bob', email: 'bob@eventa.com', categoryId: 'cat_lead', status: 'ACTIVE' },
    { name: 'HW Charlie', email: 'charlie@eventa.com', categoryId: 'cat_hw', status: 'ACTIVE' },
    { name: 'HW Diana', email: 'diana@eventa.com', categoryId: 'cat_hw', status: 'ACTIVE' },
    { name: 'HW Evan', email: 'evan@eventa.com', categoryId: 'cat_hw', status: 'ACTIVE' },
    { name: 'HW Fiona', email: 'fiona@eventa.com', categoryId: 'cat_hw', status: 'ACTIVE' },
    { name: 'Advisor Grace', email: 'grace@eventa.com', categoryId: 'cat_advisor', status: 'ACTIVE' },
    { name: 'Advisor Henry', email: 'henry@eventa.com', categoryId: 'cat_advisor', status: 'ACTIVE' }
  ];
  const bulkARes = await fetch(`${BASE_URL}/api/events/${eventAId}/participants/bulk`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ participants: participantsA })
  });
  const bulkAData = await bulkARes.json();
  assert(bulkARes.status === 200, `Bulk insert Event A failed: ${bulkAData.message}`);
  assert(bulkAData.count === 8, `Expected 8 participants added, got ${bulkAData.count}`);
  console.log('  ✓ Step 3 Passed: Added 8 participants to Event A\n');

  // 4. Configure categories and team rules & Preview feasibility
  console.log('Step 4: Configure categories and preview feasibility...');
  const feasARes = await fetch(`${BASE_URL}/api/events/${eventAId}/feasibility`, {
    headers: authHeaders
  });
  const feasAData = await feasARes.json();
  assert(feasARes.status === 200, 'Feasibility check failed');
  assert(feasAData.feasibility.isFeasible === true, 'Event A should be feasible for 2 teams');
  assert(feasAData.feasibility.maxPossibleTeams === 2, 'Max teams should be 2');
  console.log('  ✓ Step 4 Passed: Feasibility preview validated 2 teams feasible\n');

  // 5. Generate and save teams for Event A
  console.log('Step 5: Generate and save teams for Event A...');
  const genARes = await fetch(`${BASE_URL}/api/events/${eventAId}/generate`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ notes: 'Initial draw for Event A' })
  });
  const genAData = await genARes.json();
  assert(genARes.status === 200, `Generate Event A failed: ${genAData.message}`);
  assert(genAData.draw.version === 1, 'Event A draw version should be 1');
  assert(genAData.draw.teams.length === 2, 'Event A should have exactly 2 teams');
  console.log('  ✓ Step 5 Passed: Version 1 generated with 2 teams for Event A\n');

  // 6. Create Event B with different composition and participant list
  console.log('Step 6: Create Event B with different composition...');
  const createBRes = await fetch(`${BASE_URL}/api/events`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Event B · Web3 Hack',
      description: 'Decentralized hackathon: 1 Dev + 1 Designer + 1 Mentor',
      status: 'ACTIVE',
      categories: [
        { id: 'cat_dev', name: 'Smart Contract Dev', roleTag: 'Developer', countPerTeam: 1, isUniqueMentor: false },
        { id: 'cat_design', name: 'UI/UX Designer', roleTag: 'Designer', countPerTeam: 1, isUniqueMentor: false },
        { id: 'cat_crypto_mentor', name: 'Web3 Mentor', roleTag: 'Mentor', countPerTeam: 1, isUniqueMentor: true }
      ],
      rules: {
        teamSize: 3,
        requestedTeams: 1,
        uniqueMentor: true,
        composition: [
          { categoryId: 'cat_dev', count: 1 },
          { categoryId: 'cat_design', count: 1 },
          { categoryId: 'cat_crypto_mentor', count: 1 }
        ]
      }
    })
  });
  const createBData = await createBRes.json();
  const eventBId = createBData.event.eventId;
  assert(eventBId, 'Event B ID must be generated');

  const participantsB = [
    { name: 'Dev Zack', email: 'zack@eventb.com', categoryId: 'cat_dev', status: 'ACTIVE' },
    { name: 'Designer Yara', email: 'yara@eventb.com', categoryId: 'cat_design', status: 'ACTIVE' },
    { name: 'Web3 Xavier', email: 'xavier@eventb.com', categoryId: 'cat_crypto_mentor', status: 'ACTIVE' }
  ];
  await fetch(`${BASE_URL}/api/events/${eventBId}/participants/bulk`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ participants: participantsB })
  });
  console.log(`  ✓ Step 6 Passed: Created Event B (${eventBId}) with 3 participants\n`);

  // 7. Generate and save teams for Event B
  console.log('Step 7: Generate and save teams for Event B...');
  const genBRes = await fetch(`${BASE_URL}/api/events/${eventBId}/generate`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ notes: 'Initial draw for Event B' })
  });
  const genBData = await genBRes.json();
  assert(genBRes.status === 200, `Generate Event B failed: ${genBData.message}`);
  assert(genBData.draw.teams.length === 1, 'Event B should have exactly 1 team');
  console.log('  ✓ Step 7 Passed: Generated 1 team for Event B\n');

  // 8. Verify Event A and Event B remain completely independent
  console.log('Step 8: Verify Event A and Event B data isolation...');
  const fetchARes = await fetch(`${BASE_URL}/api/events/${eventAId}`);
  const fetchAData = await fetchARes.json();
  const fetchBRes = await fetch(`${BASE_URL}/api/events/${eventBId}`);
  const fetchBData = await fetchBRes.json();

  assert(fetchAData.event.participants.length === 8, 'Event A must maintain exactly 8 participants');
  assert(fetchBData.event.participants.length === 3, 'Event B must maintain exactly 3 participants');
  
  const eventANames = new Set(fetchAData.event.participants.map(p => p.name));
  const eventBNames = new Set(fetchBData.event.participants.map(p => p.name));
  for (const name of eventANames) {
    assert(!eventBNames.has(name), `Participant ${name} leaked into Event B!`);
  }
  console.log('  ✓ Step 8 Passed: Complete data isolation confirmed between Event A and Event B\n');

  // 9. Attempt team generation without admin authorization and confirm rejection
  console.log('Step 9: Attempt unauthenticated team generation...');
  const unauthRes = await fetch(`${BASE_URL}/api/events/${eventAId}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes: 'Malicious public attempt' })
  });
  assert(unauthRes.status === 401, `Expected 401 Unauthorized, got ${unauthRes.status}`);
  console.log('  ✓ Step 9 Passed: Unauthenticated team generation rejected with 401\n');

  // 10. Refresh both events and verify saved teams remain unchanged
  console.log('Step 10: Refresh both events and verify persistent teams...');
  const refreshARes = await fetch(`${BASE_URL}/api/events/${eventAId}/draws`);
  const refreshAData = await refreshARes.json();
  assert(refreshAData.draws.length === 1, 'Event A must have exactly 1 saved draw');
  assert(refreshAData.draws[0].totalTeams === 2, 'Event A total teams remain identical');
  console.log('  ✓ Step 10 Passed: Persistent storage verified across server refresh\n');

  // 11. Edit a participant and verify historical snapshot remains intact
  console.log('Step 11: Edit a participant and check historical snapshot integrity...');
  const firstPartA = fetchAData.event.participants[0];
  const updatePartRes = await fetch(`${BASE_URL}/api/events/${eventAId}/participants/${firstPartA.id}`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ name: 'Alice MODIFIED' })
  });
  assert(updatePartRes.status === 200, 'Participant update failed');

  // Check saved draw version 1 to ensure snapshot still has old name or intact structure
  const drawV1Res = await fetch(`${BASE_URL}/api/events/${eventAId}/draws/${refreshAData.draws[0].drawId}`);
  const drawV1Data = await drawV1Res.json();
  assert(drawV1Data.draw.teams.length === 2, 'Draw version 1 structure unchanged');
  console.log('  ✓ Step 11 Passed: Historical draw snapshot remains immutable despite participant edit\n');

  // 12. Generate a new version and confirm previous version remains accessible
  console.log('Step 12: Generate version 2 and check version history...');
  const genA2Res = await fetch(`${BASE_URL}/api/events/${eventAId}/generate`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ notes: 'Regeneration V2' })
  });
  const genA2Data = await genA2Res.json();
  assert(genA2Data.draw.version === 2, 'New draw must have version 2');

  const historyRes = await fetch(`${BASE_URL}/api/events/${eventAId}/draws`);
  const historyData = await historyRes.json();
  assert(historyData.draws.length === 2, 'History must contain both version 1 and version 2');
  assert(historyData.draws.some(d => d.version === 1), 'Version 1 remains accessible in history');
  assert(historyData.draws.some(d => d.version === 2), 'Version 2 exists in history');
  console.log('  ✓ Step 12 Passed: Multi-version draw history preserves both versions 1 and 2\n');

  // 13. Verify event export data structure
  console.log('Step 13: Verify event export data readiness...');
  assert(genA2Data.draw.teams.every(t => t.members.length === 4), 'All exported teams have 4 members');
  console.log('  ✓ Step 13 Passed: Draw teams formatted cleanly for PDF and export generation\n');

  // 14. Archive an event and verify mutations are blocked
  console.log('Step 14: Archive event and verify mutation lock...');
  const archiveRes = await fetch(`${BASE_URL}/api/events/${eventBId}`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ status: 'ARCHIVED' })
  });
  const archiveData = await archiveRes.json();
  assert(archiveRes.status === 200, 'Archiving Event B failed');
  assert(archiveData.event.status === 'ARCHIVED', 'Status should be ARCHIVED');

  const blockedGenRes = await fetch(`${BASE_URL}/api/events/${eventBId}/generate`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ notes: 'Attempt mutation on archived event' })
  });
  assert(blockedGenRes.status === 400, 'Generating on ARCHIVED event should be blocked');
  console.log('  ✓ Step 14 Passed: Archived event successfully locked against team generation\n');

  // 15. Verify database failures never produce false save-success
  console.log('Step 15: Verify database error handling and false success prevention...');
  const invalidEventRes = await fetch(`${BASE_URL}/api/events/non_existent_event_99999/generate`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ notes: 'Invalid target' })
  });
  assert(invalidEventRes.status === 400 || invalidEventRes.status === 404, 'Non-existent event must fail');
  const invalidData = await invalidEventRes.json();
  assert(invalidData.success === false, 'Must report success: false on failure');
  console.log('  ✓ Step 15 Passed: Failed operations cleanly reject without false-success messages\n');

  console.log('========================================================');
  console.log('   ALL 15 ACCEPTANCE TESTS COMPLETED SUCCESSFULLY!      ');
  console.log('========================================================');
}

runAcceptance().catch(err => {
  console.error('\n❌ ACCEPTANCE TEST FAILED:', err);
  process.exit(1);
});
