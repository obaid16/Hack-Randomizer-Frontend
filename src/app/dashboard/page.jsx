'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi, eventsApi } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

// Admin Components
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import DashboardHomeView from '@/components/admin/DashboardHomeView';
import EventOverviewView from '@/components/admin/EventOverviewView';
import ParticipantsView from '@/components/admin/ParticipantsView';
import CategoriesView from '@/components/admin/CategoriesView';
import TeamRulesView from '@/components/admin/TeamRulesView';
import TeamFormationView from '@/components/admin/TeamFormationView';
import TeamsView from '@/components/admin/TeamsView';
import DrawHistoryView from '@/components/admin/DrawHistoryView';
import ReportsView from '@/components/admin/ReportsView';
import AuditTrailView from '@/components/admin/AuditTrailView';
import AllEventsView from '@/components/admin/AllEventsView';
import EventSettingsView from '@/components/admin/EventSettingsView';
import EventWizardModal from '@/components/admin/EventWizardModal';

// Modal for Admin Profile
import { Shield, Mail, Key, Clock, CheckCircle2 } from 'lucide-react';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  // Authentication State
  const [admin, setAdmin] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Multi-Event State
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [currentEventLoading, setCurrentEventLoading] = useState(false);

  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Wizard & Profile Modals
  const [showEventWizard, setShowEventWizard] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Read initial query params if present
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const eventParam = searchParams.get('eventId');
    if (tabParam) setActiveTab(tabParam);
    if (eventParam) setSelectedEventId(eventParam);
  }, [searchParams]);

  // 1. Authenticate Admin
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await authApi.getMe();
        if (res.success && res.admin) {
          setAdmin(res.admin);
        } else {
          router.push('/login');
        }
      } catch {
        router.push('/login');
      } finally {
        setAuthLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  // 2. Fetch Events
  const loadEvents = useCallback(async () => {
    setEventsLoading(true);
    try {
      const res = await eventsApi.getAll();
      if (res.success) {
        const list = res.events || [];
        setEvents(list);

        // If no selected event yet, select the first active or latest event
        setSelectedEventId((prev) => {
          if (prev && list.some((e) => e.eventId === prev)) {
            return prev;
          }
          return list.length > 0 ? list[0].eventId : null;
        });
      }
    } catch (err) {
      showToast(err.message || 'Failed to load events', 'error');
    } finally {
      setEventsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (admin) {
      loadEvents();
    }
  }, [admin, loadEvents]);

  // 3. Fetch Single Event Details
  const loadCurrentEvent = useCallback(
    async (evtId) => {
      if (!evtId) {
        setCurrentEvent(null);
        return;
      }
      setCurrentEventLoading(true);
      try {
        const res = await eventsApi.getById(evtId);
        if (res.success) {
          setCurrentEvent(res.event);
        }
      } catch (err) {
        showToast(err.message || 'Failed to load event details', 'error');
      } finally {
        setCurrentEventLoading(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    if (selectedEventId) {
      loadCurrentEvent(selectedEventId);
    } else {
      setCurrentEvent(null);
    }
  }, [selectedEventId, loadCurrentEvent]);

  // Navigation Handler
  const handleNavigate = (tab) => {
    if (tab === 'profile') {
      setShowProfileModal(true);
      return;
    }
    setActiveTab(tab);
    setMobileNavOpen(false);

    // Update browser URL query params without full reload
    const params = new URLSearchParams(window.location.search);
    params.set('tab', tab);
    if (selectedEventId) params.set('eventId', selectedEventId);
    window.history.pushState(null, '', `?${params.toString()}`);
  };

  // Event Switcher Handler
  const handleSelectEvent = (evtId) => {
    setSelectedEventId(evtId);
    const params = new URLSearchParams(window.location.search);
    params.set('eventId', evtId);
    params.set('tab', activeTab);
    window.history.pushState(null, '', `?${params.toString()}`);
  };

  // Logout Handler
  const handleLogout = async () => {
    try {
      await authApi.logout();
      showToast('Logged out successfully', 'success');
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  // Contextual Header Action Click
  const handleHeaderAction = () => {
    if (activeTab === 'participants') {
      // Handled inside ParticipantsView
    } else if (activeTab === 'formation') {
      // Trigger team formation
    } else {
      setShowEventWizard(true);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F7F7F4] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-neutral-500">Authenticating Administrator...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F4] flex flex-col antialiased text-[#20211F]">
      <div className="flex flex-1 relative">
        {/* Persistent 260px Left Sidebar */}
        <AdminSidebar
          activeTab={activeTab}
          onNavigate={handleNavigate}
          currentEvent={currentEvent}
          mobileOpen={mobileNavOpen}
          onCloseMobile={() => setMobileNavOpen(false)}
          onLogout={handleLogout}
          admin={admin}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 md:pl-[260px]">
          {/* Slim Top Header */}
          <AdminHeader
            activeTab={activeTab}
            events={events}
            selectedEventId={selectedEventId}
            onSelectEvent={handleSelectEvent}
            currentEvent={currentEvent}
            admin={admin}
            onOpenMobileNav={() => setMobileNavOpen(true)}
            onHeaderAction={handleHeaderAction}
            onLogout={handleLogout}
            onOpenProfile={() => setShowProfileModal(true)}
          />

          {/* Main Content Workspace */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardHomeView
                events={events}
                selectedEventId={selectedEventId}
                onSelectEvent={handleSelectEvent}
                onCreateEvent={() => setShowEventWizard(true)}
                onNavigate={handleNavigate}
                onRefresh={loadEvents}
              />
            )}

            {activeTab === 'overview' && (
              <EventOverviewView
                currentEvent={currentEvent}
                onNavigate={handleNavigate}
                onCreateParticipant={() => handleNavigate('participants')}
              />
            )}

            {activeTab === 'participants' && (
              <ParticipantsView
                currentEvent={currentEvent}
                onRefresh={() => loadCurrentEvent(selectedEventId)}
              />
            )}

            {activeTab === 'categories' && (
              <CategoriesView
                currentEvent={currentEvent}
                onRefresh={() => loadCurrentEvent(selectedEventId)}
              />
            )}

            {activeTab === 'rules' && (
              <TeamRulesView
                currentEvent={currentEvent}
                onRefresh={() => loadCurrentEvent(selectedEventId)}
                onNavigate={handleNavigate}
              />
            )}

            {activeTab === 'formation' && (
              <TeamFormationView
                currentEvent={currentEvent}
                onRefresh={() => {
                  loadCurrentEvent(selectedEventId);
                  loadEvents();
                }}
                onNavigate={handleNavigate}
              />
            )}

            {activeTab === 'teams' && (
              <TeamsView currentEvent={currentEvent} onNavigate={handleNavigate} />
            )}

            {activeTab === 'history' && <DrawHistoryView currentEvent={currentEvent} />}

            {activeTab === 'reports' && <ReportsView currentEvent={currentEvent} />}

            {activeTab === 'audit' && <AuditTrailView currentEvent={currentEvent} />}

            {(activeTab === 'events' || activeTab === 'templates') && (
              <AllEventsView
                events={events}
                selectedEventId={selectedEventId}
                onSelectEvent={handleSelectEvent}
                onCreateEvent={() => setShowEventWizard(true)}
                onRefresh={loadEvents}
                onNavigate={handleNavigate}
              />
            )}

            {activeTab === 'settings' && (
              <EventSettingsView
                currentEvent={currentEvent}
                onRefresh={() => {
                  loadCurrentEvent(selectedEventId);
                  loadEvents();
                }}
                onNavigate={handleNavigate}
              />
            )}
          </main>
        </div>
      </div>

      {/* 5-Step Event Wizard Modal */}
      <EventWizardModal
        isOpen={showEventWizard}
        onClose={() => setShowEventWizard(false)}
        onCreated={(newEvent) => {
          showToast(`Event "${newEvent.name}" created successfully!`, 'success');
          loadEvents();
          setSelectedEventId(newEvent.eventId);
          handleNavigate('overview');
        }}
      />

      {/* Admin Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-neutral-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="font-bold text-neutral-900 text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600" />
                Administrator Profile
              </h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-neutral-400 hover:text-neutral-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
                <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-base">
                  {admin?.email ? admin.email.substring(0, 2).toUpperCase() : 'AD'}
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 text-sm">Super Administrator</h4>
                  <p className="text-xs text-neutral-500">{admin?.email || 'Admin User'}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-neutral-50 rounded-lg flex items-center justify-between">
                  <span className="text-neutral-500">Role Authority</span>
                  <span className="font-semibold text-neutral-900">Governance Root / Full Access</span>
                </div>
                <div className="p-2.5 bg-neutral-50 rounded-lg flex items-center justify-between">
                  <span className="text-neutral-500">Persistent Storage</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    MongoDB Atlas Connected
                  </span>
                </div>
                <div className="p-2.5 bg-neutral-50 rounded-lg flex items-center justify-between">
                  <span className="text-neutral-500">Security Architecture</span>
                  <span className="font-semibold text-neutral-900">HTTP-Only JWT + Bcrypt</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-100 flex justify-end">
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7F7F4] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
