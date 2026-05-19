import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function WelcomePage() {
  const { addRepository, setCurrentRepo, removeRepository, config, setError } = useAppContext();
  const navigate = useNavigate();
  const [cloneUrl, setCloneUrl] = useState('');
  const [cloning, setCloning] = useState(false);
  const [cloneError, setCloneError] = useState('');
  const [initRemoteUrl, setInitRemoteUrl] = useState('');
  const [initializing, setInitializing] = useState(false);

  const handleOpenLocal = async () => {
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
    navigate('/changes');
  };

  const handleClone = async () => {
    if (!cloneUrl.trim()) return;
    setCloneError('');
    const dir = await window.electronAPI.file.selectDirectory();
    if (!dir) return;

    setCloning(true);
    try {
      const name = cloneUrl.trim().split('/').pop()?.replace('.git', '') || 'repo';
      const targetPath = `${dir}/${name}`;
      await window.electronAPI.git.clone(cloneUrl.trim(), targetPath);
      const repo: SavedRepository = {
        path: targetPath,
        name,
        lastOpened: new Date().toISOString(),
      };
      await addRepository(repo);
      setCurrentRepo(repo);
      navigate('/changes');
    } catch (err: any) {
      setCloneError(err.message);
    } finally {
      setCloning(false);
    }
  };

  const handleInitRepo = async () => {
    const dir = await window.electronAPI.file.selectDirectory();
    if (!dir) return;
    setInitializing(true);
    try {
      await window.electronAPI.git.init(dir);
      if (initRemoteUrl.trim()) {
        await window.electronAPI.git.addRemote(dir, 'origin', initRemoteUrl.trim());
      }
      const name = dir.split(/[\\/]/).pop() || dir;
      const repo: SavedRepository = {
        path: dir,
        name,
        lastOpened: new Date().toISOString(),
      };
      await addRepository(repo);
      setCurrentRepo(repo);
      navigate('/changes');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setInitializing(false);
      setInitRemoteUrl('');
    }
  };

  const handleOpenInVSCode = async (repoPath: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await window.electronAPI.shell.openInVSCode(repoPath);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleOpenInExplorer = async (repoPath: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await window.electronAPI.shell.openInExplorer(repoPath);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRemoveRepo = async (repoPath: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await removeRepository(repoPath);
  };

  return (
    <div className="welcome-page">
      <div className="welcome-content">
        <h1>Welcome to Gitea Desktop</h1>
        <p className="welcome-subtitle">Get started by opening a repository or cloning one from your Gitea server.</p>

        <div className="welcome-actions">
          <div className="welcome-card">
            <h3>Clone a Repository</h3>
            <div className="clone-form">
              <input
                type="text"
                placeholder="https://your-gitea.com/user/repo.git"
                value={cloneUrl}
                onChange={(e) => setCloneUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleClone()}
              />
              <button
                className="btn-primary"
                onClick={handleClone}
                disabled={cloning || !cloneUrl.trim()}
              >
                {cloning ? 'Cloning...' : 'Clone'}
              </button>
            </div>
            {cloneError && <p className="error-text">{cloneError}</p>}
          </div>

          <div className="welcome-card">
            <h3>Open a Local Repository</h3>
            <p>Choose a folder on your computer that contains a Git repository.</p>
            <button className="btn-secondary" onClick={handleOpenLocal}>
              Open Local Repository
            </button>
          </div>

          <div className="welcome-card">
            <h3>Create New Repository</h3>
            <p>Initialize a new Git repository in a local directory.</p>
            <div className="clone-form">
              <input
                type="text"
                placeholder="Remote URL (optional)"
                value={initRemoteUrl}
                onChange={(e) => setInitRemoteUrl(e.target.value)}
              />
              <button
                className="btn-primary"
                onClick={handleInitRepo}
                disabled={initializing}
              >
                {initializing ? 'Initializing...' : 'Init Repository'}
              </button>
            </div>
          </div>
        </div>

        {config.repositories.length > 0 && (
          <div className="recent-repos">
            <h3>Recent Repositories</h3>
            <div className="recent-repos-list">
              {config.repositories.map((repo) => (
                <div
                  key={repo.path}
                  className="recent-repo-item"
                  onClick={() => {
                    setCurrentRepo(repo);
                    navigate('/changes');
                  }}
                >
                  <div className="recent-repo-info">
                    <span className="recent-repo-name">{repo.name}</span>
                    <span className="recent-repo-path">{repo.path}</span>
                  </div>
                  <div className="recent-repo-actions">
                    <button
                      className="btn-icon"
                      onClick={(e) => handleOpenInVSCode(repo.path, e)}
                      title="Open in VS Code"
                    >
                      {'</>'}
                    </button>
                    <button
                      className="btn-icon"
                      onClick={(e) => handleOpenInExplorer(repo.path, e)}
                      title="Open in Explorer"
                    >
                      {'[ ]'}
                    </button>
                    <button
                      className="btn-icon btn-danger"
                      onClick={(e) => handleRemoveRepo(repo.path, e)}
                      title="Remove from list"
                    >
                      x
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
