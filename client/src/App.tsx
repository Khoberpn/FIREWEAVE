import React, { useState, useMemo, useCallback } from 'react';
import { useFirmsFeed } from './hooks';
import type { FireObservation, SourceDataset } from './api';
import Sidebar, { type ActiveNavKey } from './components/Sidebar';
import Header from './components/Header';
import OverviewDashboard from './components/overview/OverviewDashboard';
import FireAtlasView from './components/atlas/FireAtlasView';
import BurningActivityCalendar from './components/calendar/BurningActivityCalendar';
import HarmonizationLab from './components/harmonization/HarmonizationLab';
import FireSeasonIntelligence from './components/intelligence/FireSeasonIntelligence';
import RegionalReports from './components/reports/RegionalReports';
import DataMethodology from './components/methodology/DataMethodology';
import { DataHubView, ScenarioAnalysisView } from './components/NavigationViews';
import FiaAssistantModal from './components/FiaAssistantModal';
import { Bot } from 'lucide-react';

export default function App() {
  const [currentNav, setCurrentNav] = useState<ActiveNavKey>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isFiaOpen, setIsFiaOpen] = useState(false);

  const {
    windowDays,
    selected,
    feeds,
    refreshing,
    refresh,
  } = useFirmsFeed();

  // Aggregate all NASA FIRMS observations from all active sensors
  const allObservations = useMemo((): FireObservation[] => {
    const list: FireObservation[] = [];
    for (const source of Object.keys(feeds) as SourceDataset[]) {
      const feed = feeds[source];
      if (feed?.status === 'ready' && feed.result?.observations) {
        list.push(...feed.result.observations);
      }
    }
    return list;
  }, [feeds]);

  const handleRefresh = useCallback(() => {
    void refresh(windowDays, selected);
  }, [refresh, windowDays, selected]);

  return (
    <div className="fireweave-shell">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar
          currentKey={currentNav}
          onSelectKey={(key) => setCurrentNav(key)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 45 }}
          className="lg:hidden"
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div
            style={{ width: '18rem', height: '100%', backgroundColor: 'var(--bg-sidebar)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar
              currentKey={currentNav}
              onSelectKey={(key) => {
                setCurrentNav(key);
                setMobileDrawerOpen(false);
              }}
              collapsed={false}
              onToggleCollapse={() => setMobileDrawerOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="fireweave-content">
        <Header
          currentKey={currentNav}
          onOpenMobileMenu={() => setMobileDrawerOpen(true)}
          onSelectKey={(key) => setCurrentNav(key)}
          onOpenFia={() => setIsFiaOpen(true)}
        />

        <main className="fireweave-container">
          {/* 01. Overview Dashboard */}
          {currentNav === 'overview' && (
            <OverviewDashboard
              observations={allObservations}
              refreshing={refreshing}
              onRefresh={handleRefresh}
              onOpenFireAtlas={() => setCurrentNav('fire-atlas')}
              onOpenCalendar={() => setCurrentNav('activity-calendar')}
              onOpenHarmonization={() => setCurrentNav('harmonization-lab')}
              onOpenReports={() => setCurrentNav('regional-reports')}
            />
          )}

          {/* 02. Fire Atlas */}
          {currentNav === 'fire-atlas' && (
            <FireAtlasView
              observations={allObservations}
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          )}

          {/* 03. Burning Activity Calendar */}
          {currentNav === 'activity-calendar' && (
            <BurningActivityCalendar
              observations={allObservations}
            />
          )}

          {/* 04. Harmonization Lab */}
          {currentNav === 'harmonization-lab' && (
            <HarmonizationLab />
          )}

          {/* 05. Fire Season Intelligence */}
          {currentNav === 'fire-season' && (
            <FireSeasonIntelligence />
          )}

          {/* 06. Regional Reports */}
          {currentNav === 'regional-reports' && (
            <RegionalReports
              observations={allObservations}
            />
          )}

          {/* 07. Data & Methodology */}
          {currentNav === 'data-methodology' && (
            <DataMethodology />
          )}

          {/* Secondary Capabilities */}
          {currentNav === 'data-hub' && (
            <DataHubView />
          )}
          {currentNav === 'scenario-archive' && (
            <ScenarioAnalysisView />
          )}
        </main>
      </div>

      {/* Floating AI Assistant Button: Ask FIA */}
      <button
        type="button"
        onClick={() => setIsFiaOpen(true)}
        className="floating-lia-pill"
        style={{ background: 'linear-gradient(135deg, #0e2646 0%, #173b6c 50%, #dc2626 100%)' }}
        aria-label="Ask FIA Wildfire Intelligence Assistant"
      >
        <div className="avatar" style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#ffffff' }}>
          <Bot size={20} />
        </div>
        <div style={{ textAlign: 'left' }}>
          <div className="name" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Ask FIA</span>
            <span style={{ fontSize: '9px', padding: '1px 4px', borderRadius: '4px', background: '#f97316', color: '#fff' }}>AI</span>
          </div>
          <div className="desc">FIREWEAVE INTELLIGENT ASSISTANT</div>
        </div>
      </button>

      {/* FIA Interactive Modal Panel */}
      <FiaAssistantModal
        isOpen={isFiaOpen}
        onClose={() => setIsFiaOpen(false)}
        hotspotCount={allObservations.length}
      />
    </div>
  );
}
