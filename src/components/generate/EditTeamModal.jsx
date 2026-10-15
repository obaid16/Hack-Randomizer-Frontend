'use client';

import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

export default function EditTeamModal({
  isOpen,
  onClose,
  team,
  generationId,
  availableStudents = [],
  availableMentors = [],
  onSave
}) {
  const [teamName, setTeamName] = useState('');
  const [secondYearId, setSecondYearId] = useState('');
  const [firstYearId1, setFirstYearId1] = useState('');
  const [firstYearId2, setFirstYearId2] = useState('');
  const [mentorId, setMentorId] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (team) {
      setTeamName(team.teamName || '');
      setSecondYearId(team.secondYearStudent?.studentRef || '');
      setFirstYearId1(team.firstYearStudents?.[0]?.studentRef || '');
      setFirstYearId2(team.firstYearStudents?.[1]?.studentRef || '');
      setMentorId(team.mentor?.mentorRef || '');
      setError(null);
    }
  }, [team, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Client-side validations for immediate user feedback
    if (!secondYearId) {
      setError('A second-year student is required.');
      return;
    }
    if (!firstYearId1 || !firstYearId2) {
      setError('Exactly 2 first-year students are required.');
      return;
    }
    if (firstYearId1 === firstYearId2) {
      setError('A team cannot contain the same first-year student twice.');
      return;
    }
    if (firstYearId1 === secondYearId || firstYearId2 === secondYearId) {
      setError('A student cannot be assigned as both first-year and second-year.');
      return;
    }
    if (!mentorId) {
      setError('An assigned mentor is required.');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        teamName,
        secondYearStudentId: secondYearId,
        firstYearStudentIds: [firstYearId1, firstYearId2],
        mentorId
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update team composition.');
    } finally {
      setLoading(false);
    }
  };

  const firstYearOptions = availableStudents.filter(
    (s) => s.academicYear === 'FIRST_YEAR' || s._id === firstYearId1 || s._id === firstYearId2
  );
  const secondYearOptions = availableStudents.filter(
    (s) => s.academicYear === 'SECOND_YEAR' || s._id === secondYearId
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Composition: ${team?.teamName || 'Team'}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            Save Changes
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <Alert type="error" message={error} />

        <div className="form-group">
          <label className="form-label">Team Name</label>
          <input
            type="text"
            className="form-input"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
          />
        </div>

        {/* Second Year Student */}
        <div className="form-group">
          <label className="form-label" style={{ color: '#7C3AED', fontWeight: 700 }}>
            Second-Year Student (Exactly 1) *
          </label>
          <select
            className="form-select"
            value={secondYearId}
            onChange={(e) => setSecondYearId(e.target.value)}
            required
          >
            <option value="">-- Select Second-Year Student --</option>
            {secondYearOptions.map((s) => (
              <option key={s._id} value={s._id}>
                {s.fullName} ({s.studentId}) {s.department ? `- ${s.department}` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* First Year Students */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" style={{ color: '#0284C7', fontWeight: 700 }}>
              First-Year Student 1 *
            </label>
            <select
              className="form-select"
              value={firstYearId1}
              onChange={(e) => setFirstYearId1(e.target.value)}
              required
            >
              <option value="">-- Select First-Year --</option>
              {firstYearOptions.map((s) => (
                <option key={s._id} value={s._id} disabled={s._id === firstYearId2}>
                  {s.fullName} ({s.studentId})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: '#0284C7', fontWeight: 700 }}>
              First-Year Student 2 *
            </label>
            <select
              className="form-select"
              value={firstYearId2}
              onChange={(e) => setFirstYearId2(e.target.value)}
              required
            >
              <option value="">-- Select First-Year --</option>
              {firstYearOptions.map((s) => (
                <option key={s._id} value={s._id} disabled={s._id === firstYearId1}>
                  {s.fullName} ({s.studentId})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mentor Selection */}
        <div className="form-group">
          <label className="form-label" style={{ color: '#D97706', fontWeight: 700 }}>
            Assigned Mentor (Shared Pool) *
          </label>
          <select
            className="form-select"
            value={mentorId}
            onChange={(e) => setMentorId(e.target.value)}
            required
          >
            <option value="">-- Select Active Mentor --</option>
            {availableMentors.map((m) => (
              <option key={m._id} value={m._id}>
                {m.fullName} ({m.mentorId}) {m.expertise?.length ? `- ${m.expertise.slice(0, 2).join(', ')}` : ''}
              </option>
            ))}
          </select>
        </div>
      </form>
    </Modal>
  );
}
