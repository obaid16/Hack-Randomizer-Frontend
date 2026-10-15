'use client';

import { useState } from 'react';
import { UploadCloud, FileText, AlertTriangle, CheckCircle, Download } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { mentorsApi } from '@/lib/api';

export default function MentorBulkModal({ isOpen, onClose, onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setError(null);
      setReport(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const response = await mentorsApi.bulkUploadCsv(file);
      setReport(response.data);
      if (onImportSuccess && response.data?.successCount > 0) {
        onImportSuccess(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to upload CSV file.');
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleCsv = () => {
    const csvContent =
      'Full Name,Mentor ID,Email,Expertise\r\n' +
      'Dr. Ramesh Kumar,MTR-001,ramesh.kumar@college.edu,Cloud Architecture; AWS; DevOps\r\n' +
      'Prof. Sunita Sharma,MTR-002,sunita.sharma@college.edu,Machine Learning; Computer Vision\r\n' +
      'Dr. Arjun Balakrishnan,MTR-003,arjun.b@college.edu,Full Stack Web; Cybersecurity\r\n';

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_mentors_import.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setFile(null);
    setReport(null);
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Bulk Import Mentors (CSV)"
      maxWidth="640px"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            {report ? 'Close' : 'Cancel'}
          </Button>
          {!report && (
            <Button
              variant="primary"
              disabled={!file}
              loading={loading}
              onClick={handleUpload}
              icon={<UploadCloud size={16} />}
            >
              Upload Mentors
            </Button>
          )}
        </>
      }
    >
      <Alert type="error" message={error} />

      {!report ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: '#FEF3C7',
              border: '1px solid #FDE68A'
            }}
          >
            <div style={{ fontSize: '0.82rem', color: '#92400E', fontWeight: 500 }}>
              Download sample format with pre-configured headers.
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={downloadSampleCsv}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Download size={14} />
              <span>Sample CSV</span>
            </button>
          </div>

          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2.5rem 1.5rem',
              border: '2px dashed #CBD5E1',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              backgroundColor: '#F8FAFC',
              transition: 'all 0.15s ease'
            }}
          >
            <UploadCloud size={40} color="#D97706" style={{ marginBottom: '0.75rem' }} />
            <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.95rem' }}>
              {file ? file.name : 'Click to select Mentors CSV file'}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.25rem' }}>
              Supports .csv files up to 5MB
            </span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </label>

          {file && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                fontSize: '0.85rem',
                color: '#334155',
                padding: '0.75rem 1rem',
                background: '#F1F5F9',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #E2E8F0'
              }}
            >
              <FileText size={16} color="#D97706" />
              <span>Selected file: <strong>{file.name}</strong> ({Math.round(file.size / 1024)} KB)</span>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: report.failedCount === 0 ? '#DCFCE7' : '#FEF3C7',
              border: `1px solid ${report.failedCount === 0 ? '#BBF7D0' : '#FDE68A'}`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: report.failedCount === 0 ? '#15803D' : '#92400E' }}>
              {report.failedCount === 0 ? (
                <CheckCircle size={18} color="#15803D" />
              ) : (
                <AlertTriangle size={18} color="#92400E" />
              )}
              <span>Import Summary</span>
            </div>
            <p style={{ fontSize: '0.85rem', marginTop: '0.35rem', color: report.failedCount === 0 ? '#166534' : '#78350F' }}>
              Successfully imported <strong>{report.successCount}</strong> of <strong>{report.totalProcessed}</strong> records.
              {report.failedCount > 0 && ` ${report.failedCount} rows had errors.`}
            </p>
          </div>

          {report.failedCount > 0 && Array.isArray(report.errors) && (
            <div>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#B91C1C', marginBottom: '0.5rem' }}>
                Row-Level Issues:
              </h4>
              <div
                style={{
                  maxHeight: '180px',
                  overflowY: 'auto',
                  border: '1px solid #E2E8F0',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8rem'
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC' }}>
                      <th style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>Row</th>
                      <th style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>Mentor ID</th>
                      <th style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>Error Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.errors.map((item, idx) => (
                      <tr key={idx} style={{ background: '#FFFFFF' }}>
                        <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #E2E8F0', color: '#0F172A' }}>{item.row}</td>
                        <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #E2E8F0', color: '#0F172A', fontFamily: 'monospace' }}>{item.mentorId}</td>
                        <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #E2E8F0', color: '#B91C1C' }}>
                          {item.errors.join(', ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
