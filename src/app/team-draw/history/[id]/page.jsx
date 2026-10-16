'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  Shield,
  User,
  GraduationCap,
  Users,
  AlertCircle,
  Database
} from 'lucide-react';
import { drawsApi } from '@/lib/api';
import { exportTeamsToPDF } from '@/lib/exportPdf';
import { useToast } from '@/context/ToastContext';

export default function SavedDrawDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();

  const [draw, setDraw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [storageType, setStorageType] = useState('file_storage');

  const drawId = params?.id;

  const fetchDrawDetail = useCallback(async () => {
    if (!drawId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await drawsApi.getById(drawId);
      if (res.draw) {
        setDraw(res.draw);
        setStorageType(res.storage || 'file_storage');
      } else {
        setError('Draw record was not found.');
      }
    } catch (err) {
      setError(err.message || 'Failed to load draw details.');
    } finally {
      setLoading(false);
    }
  }, [drawId]);

  useEffect(() => {
    fetchDrawDetail();
  }, [fetchDrawDetail]);

  const handleDownloadPdf = () => {
    if (!draw) return;
    try {
      exportTeamsToPDF(draw.teams, draw.unassigned, 'full-roster');
      showToast('Official PDF Roster downloaded.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to generate PDF.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-primaryText flex flex-col justify-between selection:bg-accent/20">
      <div>
        {/* Navigation Breadcrumb */}
        <header className="bg-white border-b border-border px-4 sm:px-8 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-secondaryText truncate">
            <Link href="/" className="hover:text-primaryText transition-colors font-medium">
              Home
            </Link>
            <span>/</span>
            <Link href="/team-draw" className="hover:text-primaryText transition-colors font-medium">
              Team Draw
            </Link>
            <span>/</span>
            <Link href="/team-draw/history" className="hover:text-primaryText transition-colors font-medium">
              History
            </Link>
            <span>/</span>
            <span className="font-semibold text-primaryText font-mono truncate">{drawId}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/team-draw/history"
              className="px-3 py-1.5 rounded-lg border border-border bg-slate-50 hover:bg-slate-100 text-primaryText text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft size={13} />
              <span>Back to History</span>
            </Link>
          </div>
        </header>

        <main className="app-container py-8 sm:py-10">
          {/* Loading */}
          {loading && (
            <div className="py-20 text-center">
              <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin mx-auto mb-3" />
              <p className="text-xs text-secondaryText font-mono">Loading saved draw data...</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="p-8 rounded-2xl bg-white border border-border max-w-md mx-auto text-center shadow-xs">
              <AlertCircle size={24} className="text-rose-500 mx-auto mb-2" />
              <h3 className="font-bold text-base mb-1">Draw Record Not Found</h3>
              <p className="text-xs text-secondaryText mb-5">{error}</p>
              <Link
                href="/team-draw/history"
                className="px-4 py-2 rounded-lg bg-accent text-white text-xs font-semibold inline-flex items-center gap-1.5"
              >
                Return to History
              </Link>
            </div>
          )}

          {/* Draw Details View */}
          {!loading && !error && draw && (
            <div>
              {/* Header Card */}
              <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-xs mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono uppercase bg-accent-subtle text-accent px-2 py-0.5 rounded font-bold border border-accent/20">
                      SAVED DRAW RECORD
                    </span>
                    <span className="text-[11px] font-mono text-secondaryText/70">
                      ID: {draw.drawId}
                    </span>
                  </div>

                  <h1 className="font-display font-black text-2xl sm:text-3xl text-primaryText mb-1.5">
                    {draw.title || 'Official Hackathon Draw'}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-secondaryText">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar size={13} className="text-accent" />
                      <span>
                        {new Date(draw.timestamp || draw.createdAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <Users size={13} className="text-accent" />
                      <span>{draw.teams?.length || 0} Teams Generated</span>
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <Database size={13} className="text-accent" />
                      <span>{storageType === 'mongodb' ? 'MongoDB Atlas' : 'Persistent Storage'}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    className="px-5 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                  >
                    <Download size={16} />
                    <span>Download Official PDF</span>
                  </button>
                </div>
              </div>

              {/* Teams Grid */}
              <div className="mb-10">
                <div className="flex items-center justify-between pb-3 mb-5 border-b border-border/80">
                  <h2 className="font-display font-bold text-lg text-primaryText">
                    Team Allocations ({draw.teams?.length || 0})
                  </h2>
                  <span className="text-xs text-secondaryText font-mono">
                    1 Leader + 2 Builders + 1 Mentor per team
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {(draw.teams || []).map((team) => {
                    const sy = team.members[0];
                    const fy1 = team.members[1];
                    const fy2 = team.members[2];
                    const mentor = team.members[3];

                    return (
                      <div
                        key={team.id || team.number}
                        className="bg-white rounded-xl border border-border p-5 shadow-xs flex flex-col justify-between"
                      >
                        <div>
                          {/* Team Title */}
                          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-border/70">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-secondaryText/70 bg-slate-100 px-2 py-0.5 rounded">
                                #{team.number < 10 ? `0${team.number}` : team.number}
                              </span>
                              <h3 className="font-display font-bold text-sm sm:text-base text-primaryText">
                                {team.name}
                              </h3>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              Locked
                            </span>
                          </div>

                          {/* Member Slots */}
                          <div className="space-y-2">
                            {/* Second Year Leader */}
                            <div className="p-2.5 rounded-lg bg-accent-subtle/30 border border-accent/20">
                              <div className="flex items-center justify-between text-[10px] font-mono uppercase text-accent mb-0.5">
                                <span className="inline-flex items-center gap-1 font-bold">
                                  <Shield size={11} />
                                  <span>2nd Yr Leader</span>
                                </span>
                              </div>
                              <p className="font-bold text-xs sm:text-sm text-primaryText truncate">
                                {sy?.name || '—'}
                              </p>
                            </div>

                            {/* First Year 1 */}
                            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                              <div className="flex items-center justify-between text-[10px] font-mono uppercase text-secondaryText mb-0.5">
                                <span className="inline-flex items-center gap-1">
                                  <User size={11} />
                                  <span>1st Yr Builder</span>
                                </span>
                              </div>
                              <p className="font-medium text-xs sm:text-sm text-primaryText truncate">
                                {fy1?.name || '—'}
                              </p>
                            </div>

                            {/* First Year 2 */}
                            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                              <div className="flex items-center justify-between text-[10px] font-mono uppercase text-secondaryText mb-0.5">
                                <span className="inline-flex items-center gap-1">
                                  <User size={11} />
                                  <span>1st Yr Builder</span>
                                </span>
                              </div>
                              <p className="font-medium text-xs sm:text-sm text-primaryText truncate">
                                {fy2?.name || '—'}
                              </p>
                            </div>

                            {/* Dedicated Mentor */}
                            <div className="p-2.5 rounded-lg bg-amber-50/50 border border-amber-200">
                              <div className="flex items-center justify-between text-[10px] font-mono uppercase text-amber-900 mb-0.5">
                                <span className="inline-flex items-center gap-1 font-bold">
                                  <GraduationCap size={11} />
                                  <span>Assigned Mentor</span>
                                </span>
                              </div>
                              <p className="font-bold text-xs sm:text-sm text-amber-950 truncate">
                                {mentor?.name || '—'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Leftover Participants Section (if present) */}
              {draw.unassigned &&
                ((draw.unassigned.secondYears?.length || 0) > 0 ||
                  (draw.unassigned.firstYears?.length || 0) > 0 ||
                  (draw.unassigned.mentors?.length || 0) > 0) && (
                  <div className="bg-white rounded-xl border border-border p-6 shadow-xs">
                    <h3 className="font-display font-bold text-sm text-primaryText mb-3">
                      Unassigned Participant Pool
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      {(draw.unassigned.secondYears || []).map((n, i) => (
                        <div key={i} className="p-2 bg-slate-50 rounded border border-slate-200">
                          <span className="text-[10px] text-secondaryText block">Second-Year</span>
                          <span className="font-semibold text-primaryText">{n}</span>
                        </div>
                      ))}
                      {(draw.unassigned.firstYears || []).map((n, i) => (
                        <div key={i} className="p-2 bg-slate-50 rounded border border-slate-200">
                          <span className="text-[10px] text-secondaryText block">First-Year</span>
                          <span className="font-semibold text-primaryText">{n}</span>
                        </div>
                      ))}
                      {(draw.unassigned.mentors || []).map((n, i) => (
                        <div key={i} className="p-2 bg-amber-50/60 rounded border border-amber-200">
                          <span className="text-[10px] text-amber-800 block">Mentor</span>
                          <span className="font-semibold text-amber-950">{n}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="py-6 border-t border-border/80 text-center text-xs text-secondaryText">
        <div className="app-container flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Hackathon Draw Detail · College Event Production Edition</span>
          <span className="font-mono text-[11px] text-secondaryText/60">
            Immutable Historical Record · PDF Export Ready
          </span>
        </div>
      </footer>
    </div>
  );
}
