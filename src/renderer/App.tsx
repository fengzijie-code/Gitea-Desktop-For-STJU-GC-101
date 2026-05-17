import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import Sidebar from './components/Sidebar';
import WelcomePage from './pages/WelcomePage';
import ChangesPage from './pages/ChangesPage';
import HistoryPage from './pages/HistoryPage';
import BranchesPage from './pages/BranchesPage';
import IssuesPage from './pages/IssuesPage';
import ReleasesPage from './pages/ReleasesPage';
import SettingsPage from './pages/SettingsPage';
import './styles/global.css';

function AppContent() {
  const { currentRepo } = useAppContext();

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={
            currentRepo ? <Navigate to="/changes" /> : <WelcomePage />
          } />
          <Route path="/changes" element={<ChangesPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/branches" element={<BranchesPage />} />
          <Route path="/issues" element={<IssuesPage />} />
          <Route path="/releases" element={<ReleasesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
