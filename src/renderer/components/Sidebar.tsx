import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import RepoSelector from './RepoSelector';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentRepo, currentBranch, status } = useAppContext();

  const navItems = [
    { path: '/changes', label: 'Changes', icon: '◎' },
    { path: '/history', label: 'History', icon: '⏱' },
    { path: '/branches', label: 'Branches', icon: '⑃' },
    { path: '/issues', label: 'Issues', icon: '!' },
    { path: '/releases', label: 'Releases', icon: '⬡' },
    { path: '/settings', label: 'Settings', icon: '⚙' },
  ];

  const changedCount = status ? status.files.length : 0;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="app-title">Gitea Desktop</h1>
      </div>

      <RepoSelector />

      {currentRepo && (
        <div className="branch-indicator">
          <span className="branch-icon">⑃</span>
          <span className="branch-name">{currentBranch || '...'}</span>
        </div>
      )}

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            disabled={!currentRepo && item.path !== '/settings'}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.path === '/changes' && changedCount > 0 && (
              <span className="badge">{changedCount}</span>
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
}
