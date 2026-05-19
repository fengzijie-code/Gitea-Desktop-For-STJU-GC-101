import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function RepoSelector() {
  const { config, currentRepo, setCurrentRepo, addRepository, removeRepository } = useAppContext();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleOpen = async () => {
    const dir = await window.electronAPI.file.selectDirectory();
    if (!dir) return;
    const name = dir.split(/[\\/]/).pop() || dir;
    const repo: SavedRepository = {
      path: dir,
      name,
      lastOpened: new Date().toISOString(),
    };
    await addRepository(repo);
    setCurrentRepo(repo);
    setShowDropdown(false);
    navigate('/changes');
  };

  const handleClone = () => {
    navigate('/');
    setShowDropdown(false);
  };

  const handleSelect = (repo: SavedRepository) => {
    setCurrentRepo(repo);
    setShowDropdown(false);
    navigate('/changes');
  };

  const handleRemove = async (repoPath: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await removeRepository(repoPath);
  };

  return (
    <div className="repo-selector">
      <button
        className="repo-selector-btn"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <span className="repo-name">
          {currentRepo ? currentRepo.name : 'Select Repository'}
        </span>
        <span className="dropdown-arrow">▾</span>
      </button>

      {showDropdown && (
        <div className="repo-dropdown">
          <div className="repo-dropdown-actions">
            <button onClick={handleOpen}>Open Local Repository</button>
            <button onClick={handleClone}>Clone Repository</button>
          </div>
          {config.repositories.length > 0 && (
            <div className="repo-dropdown-list">
              <div className="repo-dropdown-label">Recent Repositories</div>
              {config.repositories.map((repo) => (
                <div
                  key={repo.path}
                  className={`repo-dropdown-item ${currentRepo?.path === repo.path ? 'active' : ''}`}
                  onClick={() => handleSelect(repo)}
                >
                  <div className="repo-dropdown-item-info">
                    <span className="repo-item-name">{repo.name}</span>
                    <span className="repo-item-path">{repo.path}</span>
                  </div>
                  <button
                    className="btn-icon repo-remove-btn"
                    onClick={(e) => handleRemove(repo.path, e)}
                    title="Remove from list"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
