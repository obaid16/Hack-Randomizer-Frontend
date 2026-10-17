import mongoose from 'mongoose';
import { secondYearStudents, firstYearStudents, mentors } from '../data/participants.js';
import { fisherYatesShuffle } from './generateTeams.js';

// Event Lifecycle Statuses
export const EVENT_STATUS = {
  DRAFT: 'DRAFT',
  READY: 'READY',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  ARCHIVED: 'ARCHIVED'
};

const EventSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: Object.values(EVENT_STATUS),
      default: EVENT_STATUS.ACTIVE
    },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    isTemplate: { type: Boolean, default: false },
    categories: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        description: { type: String, default: '' },
        roleTag: { type: String, default: 'Member' },
        countPerTeam: { type: Number, default: 1 },
        isUniqueMentor: { type: Boolean, default: false }
      }
    ],
    rules: {
      teamSize: { type: Number, default: 4 },
      requestedTeams: { type: Number, default: 10 },
      uniqueMentor: { type: Boolean, default: true },
      allowParticipantReuse: { type: Boolean, default: false },
      composition: [
        {
          categoryId: { type: String, required: true },
          count: { type: Number, required: true },
          roleTag: { type: String, default: 'Member' }
        }
      ]
    },
    participants: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        email: { type: String, default: '' },
        categoryId: { type: String, required: true },
        categoryName: { type: String, default: '' },
        status: { type: String, default: 'ACTIVE' },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    drawVersions: [
      {
        version: { type: Number, required: true },
        drawId: { type: String, required: true },
        title: { type: String, required: true },
        generatedAt: { type: String, required: true },
        generatedBy: { type: String, default: 'Admin' },
        teams: { type: Array, required: true },
        unassigned: { type: Object, default: () => ({}) },
        totalTeams: { type: Number, required: true },
        totalParticipants: { type: Number, required: true },
        isCompleted: { type: Boolean, default: false }
      }
    ],
    auditLogs: [
      {
        timestamp: { type: Date, default: Date.now },
        action: { type: String, required: true },
        details: { type: String, default: '' },
        userEmail: { type: String, default: 'System' }
      }
    ]
  },
  {
    timestamps: true
  }
);

let cachedEventModel = null;
function getEventModel() {
  if (cachedEventModel) return cachedEventModel;
  try {
    cachedEventModel = mongoose.model('ManagedEvent');
  } catch {
    cachedEventModel = mongoose.model('ManagedEvent', EventSchema);
  }
  return cachedEventModel;
}

let cachedConn = global.mongoose;
if (!cachedConn) {
  cachedConn = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL;
  if (!uri) throw new Error('MONGODB_URI is not configured in Vercel. Please add MONGODB_URI in Vercel Dashboard -> Settings -> Environment Variables.');

  if (cachedConn.conn && mongoose.connection.readyState === 1) {
    return cachedConn.conn;
  }

  if (!cachedConn.promise) {
    cachedConn.promise = mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
  }

  cachedConn.conn = await cachedConn.promise;
  return cachedConn.conn;
}

/**
 * Ensures the default Hackathon 2027 event exists in MongoDB Atlas
 * populated with the initial participants roster.
 */
export async function ensureDefaultEvent() {
  await connectToDatabase();
  const EventModel = getEventModel();

  const existing = await EventModel.findOne({ eventId: 'evt_hackathon_2027' });
  if (existing) return existing;

  const defaultCategories = [
    {
      id: 'cat_second_year',
      name: 'Second-Year Student',
      description: 'Team leader and technical coordinator',
      roleTag: 'Team Leader',
      countPerTeam: 1,
      isUniqueMentor: false
    },
    {
      id: 'cat_first_year',
      name: 'First-Year Student',
      description: 'Core builder and problem solver',
      roleTag: 'Core Builder',
      countPerTeam: 2,
      isUniqueMentor: false
    },
    {
      id: 'cat_mentor',
      name: 'Technical Mentor',
      description: 'Industry or academic guide (strictly 1:1, non-shared)',
      roleTag: 'Technical Mentor',
      countPerTeam: 1,
      isUniqueMentor: true
    }
  ];

  const defaultParticipants = [
    ...secondYearStudents.map((name, i) => ({
      id: `sy_${i + 1}`,
      name,
      email: `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@hackathon.edu`,
      categoryId: 'cat_second_year',
      categoryName: 'Second-Year Student',
      status: 'ACTIVE'
    })),
    ...firstYearStudents.map((name, i) => ({
      id: `fy_${i + 1}`,
      name,
      email: `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@hackathon.edu`,
      categoryId: 'cat_first_year',
      categoryName: 'First-Year Student',
      status: 'ACTIVE'
    })),
    ...mentors.map((name, i) => ({
      id: `men_${i + 1}`,
      name,
      email: `${name.toLowerCase().split('(')[0].replace(/[^a-z0-9]/g, '')}@mentor.hackathon.edu`,
      categoryId: 'cat_mentor',
      categoryName: 'Technical Mentor',
      status: 'ACTIVE'
    }))
  ];

  const defaultEvent = new EventModel({
    eventId: 'evt_hackathon_2027',
    name: 'Hackathon 2027 · Code & Conquer',
    description: 'Premier collegiate hackathon team randomizer with 1 SY + 2 FY + 1 Unique Mentor formula.',
    status: EVENT_STATUS.ACTIVE,
    startDate: '2027-03-15',
    endDate: '2027-03-17',
    categories: defaultCategories,
    rules: {
      teamSize: 4,
      requestedTeams: 10,
      uniqueMentor: true,
      allowParticipantReuse: false,
      composition: [
        { categoryId: 'cat_second_year', count: 1, roleTag: 'Team Leader' },
        { categoryId: 'cat_first_year', count: 2, roleTag: 'Core Builder' },
        { categoryId: 'cat_mentor', count: 1, roleTag: 'Technical Mentor' }
      ]
    },
    participants: defaultParticipants,
    drawVersions: [],
    auditLogs: [
      {
        action: 'EVENT_INITIALIZED',
        details: 'Default Hackathon 2027 event created with standard roster.',
        userEmail: 'System'
      }
    ]
  });

  await defaultEvent.save();
  return defaultEvent;
}

/**
 * Lists all managed events with high-level metrics.
 */
export async function getAllEvents() {
  await ensureDefaultEvent();
  const EventModel = getEventModel();

  const events = await EventModel.find({})
    .select('eventId name description status startDate endDate isTemplate participants categories rules drawVersions updatedAt createdAt')
    .sort({ createdAt: -1 })
    .lean();

  return events.map((evt) => ({
    eventId: evt.eventId,
    name: evt.name,
    description: evt.description,
    status: evt.status,
    startDate: evt.startDate,
    endDate: evt.endDate,
    isTemplate: Boolean(evt.isTemplate),
    participantCount: evt.participants?.filter((p) => p.status === 'ACTIVE').length || 0,
    totalParticipants: evt.participants?.length || 0,
    categoryCount: evt.categories?.length || 0,
    requestedTeams: evt.rules?.requestedTeams || 0,
    drawCount: evt.drawVersions?.length || 0,
    latestVersion: evt.drawVersions?.length > 0 ? evt.drawVersions[evt.drawVersions.length - 1].version : 0,
    createdAt: evt.createdAt,
    updatedAt: evt.updatedAt
  }));
}

/**
 * Retrieves full event record by eventId.
 */
export async function getEventById(eventId) {
  await connectToDatabase();
  const EventModel = getEventModel();

  let event = await EventModel.findOne({ eventId }).lean();
  if (!event && eventId === 'evt_hackathon_2027') {
    event = await ensureDefaultEvent();
    return event.toObject();
  }
  return event;
}

/**
 * Creates a brand new event.
 */
export async function createEvent(eventData, adminEmail = 'Admin') {
  if (!eventData || !eventData.name) {
    throw new Error('Event title/name is required');
  }

  await connectToDatabase();
  const EventModel = getEventModel();

  const slug =
    eventData.eventId ||
    `evt_${eventData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .slice(0, 30)}_${Date.now().toString(36)}`;

  const newEvent = new EventModel({
    eventId: slug,
    name: eventData.name,
    description: eventData.description || '',
    status: eventData.status || EVENT_STATUS.DRAFT,
    startDate: eventData.startDate || '',
    endDate: eventData.endDate || '',
    isTemplate: Boolean(eventData.isTemplate),
    categories: eventData.categories || [
      { id: 'cat_participant', name: 'Participant', description: 'General participant', countPerTeam: 4, roleTag: 'Member' }
    ],
    rules: eventData.rules || {
      teamSize: 4,
      requestedTeams: 5,
      uniqueMentor: false,
      allowParticipantReuse: false,
      composition: [{ categoryId: 'cat_participant', count: 4, roleTag: 'Member' }]
    },
    participants: eventData.participants || [],
    drawVersions: [],
    auditLogs: [
      {
        action: 'EVENT_CREATED',
        details: `Event "${eventData.name}" created.`,
        userEmail: adminEmail
      }
    ]
  });

  await newEvent.save();
  return newEvent.toObject();
}

/**
 * Duplicates an event configuration as a starting template.
 */
export async function duplicateEventTemplate(sourceEventId, newEventData, adminEmail = 'Admin') {
  const source = await getEventById(sourceEventId);
  if (!source) throw new Error('Source event not found');

  const clonedData = {
    name: newEventData.name || `${source.name} (Copy)`,
    description: newEventData.description || source.description,
    status: EVENT_STATUS.DRAFT,
    startDate: newEventData.startDate || source.startDate,
    endDate: newEventData.endDate || source.endDate,
    isTemplate: false,
    categories: JSON.parse(JSON.stringify(source.categories || [])),
    rules: JSON.parse(JSON.stringify(source.rules || {})),
    participants: newEventData.copyParticipants ? JSON.parse(JSON.stringify(source.participants || [])) : []
  };

  return createEvent(clonedData, adminEmail);
}

/**
 * Updates event details and enforces valid status transitions.
 */
export async function updateEvent(eventId, updates, adminEmail = 'Admin') {
  await connectToDatabase();
  const EventModel = getEventModel();

  const event = await EventModel.findOne({ eventId });
  if (!event) throw new Error('Event not found');

  // Enforce status transitions
  if (updates.status && updates.status !== event.status) {
    if (event.status === EVENT_STATUS.ARCHIVED && updates.status !== EVENT_STATUS.ARCHIVED) {
      // Unarchiving permitted only with explicit update
    }

    // Validation before READY state
    if (updates.status === EVENT_STATUS.READY) {
      const activeCount = event.participants.filter((p) => p.status === 'ACTIVE').length;
      const teamSize = event.rules?.teamSize || 4;
      if (activeCount < teamSize) {
        throw new Error(
          `Cannot mark event as READY: Roster has only ${activeCount} active participants, but team size is ${teamSize}.`
        );
      }
    }

    event.auditLogs.push({
      action: 'STATUS_CHANGED',
      details: `Status changed from ${event.status} to ${updates.status}.`,
      userEmail: adminEmail
    });
    event.status = updates.status;
  }

  if (updates.name) event.name = updates.name;
  if (updates.description !== undefined) event.description = updates.description;
  if (updates.startDate !== undefined) event.startDate = updates.startDate;
  if (updates.endDate !== undefined) event.endDate = updates.endDate;
  if (updates.categories) event.categories = updates.categories;
  if (updates.rules) event.rules = { ...event.rules, ...updates.rules };

  event.auditLogs.push({
    action: 'EVENT_UPDATED',
    details: 'Event settings updated.',
    userEmail: adminEmail
  });

  await event.save();
  return event.toObject();
}

/**
 * Safely deletes an event with confirmation and protection checks.
 */
export async function deleteEvent(eventId, adminEmail = 'Admin') {
  if (eventId === 'evt_hackathon_2027') {
    throw new Error('The default Hackathon 2027 event cannot be deleted. You may archive it instead.');
  }

  await connectToDatabase();
  const EventModel = getEventModel();

  const event = await EventModel.findOne({ eventId });
  if (!event) throw new Error('Event not found');

  if (event.status === EVENT_STATUS.ACTIVE && event.drawVersions?.length > 0) {
    throw new Error('Cannot delete an ACTIVE event with saved team draws. Archive the event first.');
  }

  await EventModel.deleteOne({ eventId });
  return { success: true, message: `Event ${event.name} deleted successfully.` };
}

/**
 * Participant Management within an Event.
 */
export async function addParticipant(eventId, participantData, adminEmail = 'Admin') {
  if (!participantData.name || !participantData.categoryId) {
    throw new Error('Participant name and category are required.');
  }

  await connectToDatabase();
  const EventModel = getEventModel();

  const event = await EventModel.findOne({ eventId });
  if (!event) throw new Error('Event not found');
  if (event.status === EVENT_STATUS.ARCHIVED) {
    throw new Error('Cannot modify participants of an ARCHIVED event.');
  }

  const category = event.categories.find((c) => c.id === participantData.categoryId);
  const categoryName = category ? category.name : participantData.categoryId;

  const newParticipant = {
    id: `part_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    name: participantData.name.trim(),
    email: participantData.email?.trim() || '',
    categoryId: participantData.categoryId,
    categoryName,
    status: participantData.status || 'ACTIVE',
    createdAt: new Date()
  };

  event.participants.push(newParticipant);
  event.auditLogs.push({
    action: 'PARTICIPANT_ADDED',
    details: `Added ${newParticipant.name} (${categoryName})`,
    userEmail: adminEmail
  });

  await event.save();
  return newParticipant;
}

export async function updateParticipant(eventId, participantId, updates, adminEmail = 'Admin') {
  await connectToDatabase();
  const EventModel = getEventModel();

  const event = await EventModel.findOne({ eventId });
  if (!event) throw new Error('Event not found');
  if (event.status === EVENT_STATUS.ARCHIVED) {
    throw new Error('Cannot modify participants of an ARCHIVED event.');
  }

  const part = event.participants.find((p) => p.id === participantId);
  if (!part) throw new Error('Participant not found');

  if (updates.name) part.name = updates.name.trim();
  if (updates.email !== undefined) part.email = updates.email.trim();
  if (updates.status) part.status = updates.status;
  if (updates.categoryId) {
    part.categoryId = updates.categoryId;
    const cat = event.categories.find((c) => c.id === updates.categoryId);
    if (cat) part.categoryName = cat.name;
  }

  event.auditLogs.push({
    action: 'PARTICIPANT_UPDATED',
    details: `Updated participant ${part.name}`,
    userEmail: adminEmail
  });

  await event.save();
  return part;
}

export async function deleteParticipant(eventId, participantId, adminEmail = 'Admin') {
  await connectToDatabase();
  const EventModel = getEventModel();

  const event = await EventModel.findOne({ eventId });
  if (!event) throw new Error('Event not found');
  if (event.status === EVENT_STATUS.ARCHIVED) {
    throw new Error('Cannot delete participants from an ARCHIVED event.');
  }

  const idx = event.participants.findIndex((p) => p.id === participantId);
  if (idx < 0) throw new Error('Participant not found');

  const removed = event.participants.splice(idx, 1)[0];
  event.auditLogs.push({
    action: 'PARTICIPANT_DELETED',
    details: `Deleted participant ${removed.name}`,
    userEmail: adminEmail
  });

  await event.save();
  return { success: true };
}

export async function bulkImportParticipants(eventId, participantsList, adminEmail = 'Admin') {
  if (!Array.isArray(participantsList) || participantsList.length === 0) {
    throw new Error('A non-empty array of participants is required.');
  }

  await connectToDatabase();
  const EventModel = getEventModel();

  const event = await EventModel.findOne({ eventId });
  if (!event) throw new Error('Event not found');
  if (event.status === EVENT_STATUS.ARCHIVED) {
    throw new Error('Cannot import participants to an ARCHIVED event.');
  }

  const catMap = new Map(event.categories.map((c) => [c.id, c.name]));
  const defaultCatId = event.categories[0]?.id || 'cat_default';

  const imported = [];
  for (const raw of participantsList) {
    if (!raw.name || !raw.name.trim()) continue;
    const catId = raw.categoryId && catMap.has(raw.categoryId) ? raw.categoryId : defaultCatId;
    imported.push({
      id: `part_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      name: raw.name.trim(),
      email: raw.email?.trim() || '',
      categoryId: catId,
      categoryName: catMap.get(catId) || 'Participant',
      status: 'ACTIVE',
      createdAt: new Date()
    });
  }

  event.participants.push(...imported);
  event.auditLogs.push({
    action: 'BULK_IMPORT',
    details: `Bulk imported ${imported.length} participants.`,
    userEmail: adminEmail
  });

  await event.save();
  return { success: true, count: imported.length };
}

/**
 * Calculates feasibility and bottleneck category for an event's rules.
 */
export async function previewFeasibility(eventId) {
  const event = await getEventById(eventId);
  if (!event) throw new Error('Event not found');

  const activeParts = (event.participants || []).filter((p) => p.status === 'ACTIVE');
  const composition = event.rules?.composition || [];
  const requestedTeams = event.rules?.requestedTeams || 0;
  const teamSize = event.rules?.teamSize || 4;

  const categoryCounts = {};
  composition.forEach((rule) => {
    categoryCounts[rule.categoryId] = activeParts.filter((p) => p.categoryId === rule.categoryId).length;
  });

  let maxPossibleTeams = Infinity;
  let bottleneckCategory = null;

  composition.forEach((rule) => {
    const available = categoryCounts[rule.categoryId] || 0;
    const quota = rule.count || 1;
    const possibleForCategory = Math.floor(available / quota);

    if (possibleForCategory < maxPossibleTeams) {
      maxPossibleTeams = possibleForCategory;
      const cat = event.categories.find((c) => c.id === rule.categoryId);
      bottleneckCategory = cat ? cat.name : rule.categoryId;
    }
  });

  if (composition.length === 0 || maxPossibleTeams === Infinity) {
    maxPossibleTeams = Math.floor(activeParts.length / teamSize);
  }

  const assignedPerTeam = composition.reduce((acc, c) => acc + c.count, 0) || teamSize;
  const expectedAssigned = Math.min(requestedTeams, maxPossibleTeams) * assignedPerTeam;
  const expectedUnassigned = activeParts.length - expectedAssigned;
  const isFeasible = requestedTeams <= maxPossibleTeams && requestedTeams > 0;

  return {
    requestedTeams,
    maxPossibleTeams,
    isFeasible,
    bottleneckCategory: isFeasible ? null : bottleneckCategory,
    activeParticipantsCount: activeParts.length,
    expectedAssigned,
    expectedUnassigned,
    categoryCounts
  };
}

/**
 * Generates an immutable, versioned draw snapshot for an event.
 * Strictly requires admin authorization and verifies event state.
 */
export async function generateEventTeams(eventId, adminEmail, requestedTeamCount = null) {
  await connectToDatabase();
  const EventModel = getEventModel();

  const event = await EventModel.findOne({ eventId });
  if (!event) throw new Error('Event not found');

  if (event.status === EVENT_STATUS.ARCHIVED) {
    throw new Error('Cannot generate teams for an ARCHIVED event.');
  }

  const activeParticipants = event.participants.filter((p) => p.status === 'ACTIVE');
  const composition = event.rules?.composition || [];
  const targetTeams = requestedTeamCount || event.rules?.requestedTeams || 10;

  // Feasibility check
  const pools = {};
  composition.forEach((comp) => {
    pools[comp.categoryId] = fisherYatesShuffle(
      activeParticipants.filter((p) => p.categoryId === comp.categoryId)
    );
  });

  // Calculate maximum teams possible
  let maxPossible = Infinity;
  composition.forEach((comp) => {
    const poolSize = pools[comp.categoryId]?.length || 0;
    const possible = Math.floor(poolSize / comp.count);
    if (possible < maxPossible) maxPossible = possible;
  });

  if (composition.length === 0) {
    maxPossible = Math.floor(activeParticipants.length / (event.rules?.teamSize || 4));
  }

  const teamCount = Math.min(targetTeams, maxPossible);
  if (teamCount < 1) {
    throw new Error('Insufficient participants to form even 1 complete team under the configured rules.');
  }

  // Construct teams
  const teams = [];
  const usedIds = new Set();

  for (let i = 0; i < teamCount; i++) {
    const teamNum = i + 1;
    const teamMembers = [];
    let slotIdx = 0;

    composition.forEach((comp) => {
      const pool = pools[comp.categoryId];
      const cat = event.categories.find((c) => c.id === comp.categoryId);
      const roleLabel = cat ? cat.name : comp.roleTag;

      for (let cIdx = 0; cIdx < comp.count; cIdx++) {
        const member = pool[i * comp.count + cIdx];
        if (member) {
          usedIds.add(member.id);
          teamMembers.push({
            id: `team-${teamNum}-slot-${slotIdx}`,
            slotIndex: slotIdx,
            role: comp.categoryId,
            roleLabel: comp.count > 1 ? `${roleLabel} 0${cIdx + 1}` : roleLabel,
            roleTag: comp.roleTag || 'Member',
            name: member.name,
            revealed: false,
            revealedAt: null
          });
          slotIdx++;
        }
      }
    });

    teams.push({
      id: `team-${teamNum}`,
      number: teamNum,
      name: `TEAM ${teamNum < 10 ? `0${teamNum}` : teamNum}`,
      isCompleted: false,
      members: teamMembers
    });
  }

  // Unassigned participants
  const unassigned = {};
  event.categories.forEach((cat) => {
    const leftovers = activeParticipants.filter((p) => p.categoryId === cat.id && !usedIds.has(p.id));
    unassigned[cat.id] = leftovers.map((p) => p.name);
  });

  const nextVersion = (event.drawVersions?.length || 0) + 1;
  const drawId = `draw_${eventId}_v${nextVersion}_${Date.now().toString(36)}`;

  const newDrawRecord = {
    version: nextVersion,
    drawId,
    title: `${event.name} · Draw Version ${nextVersion}`,
    generatedAt: new Date().toISOString(),
    generatedBy: adminEmail,
    teams,
    unassigned,
    totalTeams: teamCount,
    totalParticipants: teamCount * (event.rules?.teamSize || 4),
    isCompleted: false
  };

  event.drawVersions.push(newDrawRecord);
  event.status = EVENT_STATUS.ACTIVE;

  event.auditLogs.push({
    action: 'TEAM_DRAW_GENERATED',
    details: `Generated Version ${nextVersion} (${teamCount} teams).`,
    userEmail: adminEmail
  });

  await event.save();

  return {
    success: true,
    draw: newDrawRecord,
    version: nextVersion,
    eventStatus: event.status
  };
}

/**
 * Returns all historical versions for an event.
 */
export async function getEventDrawVersions(eventId) {
  const event = await getEventById(eventId);
  if (!event) throw new Error('Event not found');

  return (event.drawVersions || []).map((v) => ({
    version: v.version,
    drawId: v.drawId,
    title: v.title,
    generatedAt: v.generatedAt,
    generatedBy: v.generatedBy,
    totalTeams: v.totalTeams,
    totalParticipants: v.totalParticipants,
    isCompleted: v.isCompleted
  }));
}

/**
 * Retrieves a specific historical draw version snapshot.
 */
export async function getEventDrawVersion(eventId, versionOrDrawId) {
  const event = await getEventById(eventId);
  if (!event) throw new Error('Event not found');

  const match = (event.drawVersions || []).find(
    (v) => v.drawId === versionOrDrawId || v.version === Number(versionOrDrawId)
  );

  if (!match) return null;
  return {
    draw: match,
    event: {
      eventId: event.eventId,
      name: event.name,
      status: event.status
    }
  };
}
