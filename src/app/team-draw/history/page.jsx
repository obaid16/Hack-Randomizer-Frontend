'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  History,
  ArrowLeft,
  Download,
  Eye,
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
  Database,
  Calendar,
  Users,
  AlertCircle
} from 'lucide-react';
import { drawsApi } from '@/lib/api';
import { exportTeamsToPDF } from '@/lib/exportPdf';
import { useToast } from '@/context/ToastContext';

export default function DrawHistoryPage() {
  const { showToast } = useToast();
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [storageType, setStorageType] = useState('file_storage');

  const fetchDraws = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Timeout safety to prevent infinite loading state
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Connection timed out while loading records.')), 9000)
    );

    try {
      const res = await Promise.race([drawsApi.getAll(), timeoutPromise]);
      setDraws(res.draws || []);
      setStorageType(res.storage || 'file_storage');
    } catch (err) {
      setError(err.message || 'Unable to retrieve draw history.');
      showToast('Failed to load draw history from server.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchDraws();
  }, [fetchDraws]);

  const handleDownloadPdf = (draw) => {
    try {
      exportTeamsToPDF(draw.teams, draw.unassigned, 'full-roster');
      showToast(`Downloaded PDF for ${draw.title}`, 'success');
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
            <Link
              href="/"
              className="hover:text-primaryText transition-colors font-medium"
            >
              Home
            </Link>
            <span>/</span>
            <Link
              href="/team-draw"
              className="hover:text-primaryText transition-colors font-medium"
            >
              Team Draw
            </Link>
            <span>/</span>
            <span className="font-semibold text-primaryText">Draw History</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchDraws}
              disabled={loading}
              className="p-1.5 rounded-lg border border-border bg-slate-50 hover:bg-slate-100 text-secondaryText hover:text-primaryText transition-colors cursor-pointer"
              title="Refresh list"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <Link
              href="/team-draw"
              className="px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white font-semibold text-xs transition-colors inline-flex items-center gap-1.5 shadow-xs"
            >
              <Plus size={14} />
              <span>New Draw</span>
            </Link>
          </div>
        </header>

        <main className="app-container py-8 sm:py-10">
          {/* Page Heading Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-border/80">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent-subtle text-accent text-[11px] font-mono font-bold uppercase mb-2 border border-accent/20">
                <History size={12} />
                <span>ARCHIVAL RECORDS</span>
              </div>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-primaryText">
                Previously Saved Team Draws
              </h1>
              <p className="text-secondaryText text-xs sm:text-sm mt-1">
                Access, review, and download official PDF rosters for all previously generated hackathon teams.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-secondaryText shrink-0">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-border">
                <Database size={12} className="text-accent" />
                <span>{storageType === 'mongodb' ? 'MongoDB Atlas' : 'Persistent Storage'}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-border">
                {loading ? (
                  <span className="text-secondaryText/70">Syncing...</span>
                ) : (
                  <>
                    <strong className="text-primaryText">{draws.length}</strong>{' '}
                    <span>{draws.length === 1 ? 'record' : 'records'}</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="py-16 text-center">
              <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin mx-auto mb-3" />
              <p className="text-xs text-secondaryText font-mono">Loading saved draw records...</p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="p-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 max-w-lg mx-auto text-center">
              <AlertCircle size={24} className="text-rose-600 mx-auto mb-2" />
              <h3 className="font-bold text-sm mb-1">Failed to Load Draw History</h3>
              <p className="text-xs text-rose-700 mb-4">{error}</p>
              <button
                type="button"
                onClick={fetchDraws}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && draws.length === 0 && (
            <div className="py-16 px-4 text-center max-w-md mx-auto bg-white rounded-2xl border border-border shadow-xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-secondaryText flex items-center justify-center mx-auto mb-3">
                <History size={22} />
              </div>
              <h3 className="font-display font-bold text-lg text-primaryText mb-1">
                No saved draws yet.
              </h3>
              <p className="text-xs text-secondaryText leading-relaxed mb-6">
                Generate your first team draw to see it here. Each draw preserves exact team allocations permanently.
              </p>
              <Link
                href="/team-draw"
                className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-colors"
              >
                <Plus size={15} />
                <span>Create a Draw</span>
              </Link>
            </div>
          )}

          {/* Draw Records Grid */}
          {!loading && !error && draws.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {draws.map((draw, idx) => {
                const dateFormatted = new Date(draw.timestamp || draw.createdAt).toLocaleDateString(
                  'en-US',
                  {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }
                );
                const isComplete = Boolean(draw.isCompleted);

                return (
                  <motion.div
                    key={draw.drawId || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="bg-white rounded-xl border border-border hover:border-accent/40 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top status & date */}
                      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-border/70 text-xs">
                        <span className="font-mono text-[11px] text-secondaryText inline-flex items-center gap-1">
                          <Calendar size={12} />
                          <span suppressHydrationWarning>{dateFormatted}</span>
                        </span>

                        {isComplete ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 size={11} />
                            <span>Fully Drawn</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <Clock size={11} />
                            <span>In Progress</span>
                          </span>
                        )}
                      </div>

                      {/* Title & Metadata */}
                      <h3 className="font-display font-bold text-base text-primaryText mb-1 line-clamp-1">
                        {draw.title || 'Official Hackathon Draw'}
                      </h3>
                      <p className="font-mono text-[11px] text-secondaryText/70 mb-4 truncate">
                        ID: {draw.drawId}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 rounded-lg p-2.5 mb-4 border border-border/60">
                        <div>
                          <span className="text-[10px] uppercase font-mono text-secondaryText block">Teams</span>
                          <span className="font-bold text-primaryText text-sm">{draw.totalTeams || draw.teams?.length || 0}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-mono text-secondaryText block">Participants</span>
                          <span className="font-bold text-primaryText text-sm">
                            {draw.totalParticipants || (draw.teams?.length || 0) * 4}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-3 border-t border-border/80">
                      <Link
                        href={`/team-draw/history/${draw.drawId}`}
                        className="flex-1 px-3 py-2 rounded-lg bg-canvas hover:bg-slate-100 text-primaryText font-semibold text-xs border border-border transition-colors inline-flex items-center justify-center gap-1.5"
                      >
                        <Eye size={13} className="text-secondaryText" />
                        <span>View Teams</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDownloadPdf(draw)}
                        className="px-3 py-2 rounded-lg bg-accent-subtle hover:bg-accent-subtle/80 text-accent font-semibold text-xs border border-accent/20 transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        title="Download official PDF for this draw"
                      >
                        <Download size={13} />
                        <span>PDF</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="py-6 border-t border-border/80 text-center text-xs text-secondaryText">
        <div className="app-container flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Hackathon Draw Archives · College Event Production Edition</span>
          <span className="font-mono text-[11px] text-secondaryText/60">
            Immutable Historical Integrity Enforced
          </span>
        </div>
      </footer>
    </div>
  );
}
