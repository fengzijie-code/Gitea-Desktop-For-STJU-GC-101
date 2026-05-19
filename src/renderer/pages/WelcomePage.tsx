import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function WelcomePage() {
  const { addRepository, setCurrentRepo, setError } = useAppContext();
  const navigate = useNavigate();
  const [cloneUrl, setCloneUrl] = useState('');
  const [cloning, setCloning] = useState(false);
  const [cloneError, setCloneError] = useState('');
  const [initializing, setInitializing] = useState(false);

  const [repoName, setRepoName] = useState('');
  const [repoDescription, setRepoDescription] = useState('');
  const [repoLocalPath, setRepoLocalPath] = useState('');
  const [gitignoreTemplate, setGitignoreTemplate] = useState('');
  const [licenseTemplate, setLicenseTemplate] = useState('');
  const [initRemoteUrl, setInitRemoteUrl] = useState('');
  const [gitignoreOptions, setGitignoreOptions] = useState<string[]>([]);
  const [licenseOptions, setLicenseOptions] = useState<string[]>([]);

  useEffect(() => {
    window.electronAPI.git.getInitTemplates().then((templates) => {
      setGitignoreOptions(templates.gitignoreTemplates);
      setLicenseOptions(templates.licenseTemplates);
    });
  }, []);

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

  const handleSelectPath = async () => {
    const dir = await window.electronAPI.file.selectDirectory();
    if (dir) setRepoLocalPath(dir);
  };

  const handleInitRepo = async () => {
    if (!repoName.trim() || !repoLocalPath.trim()) return;
    setInitializing(true);
    try {
      const authorName = await window.electronAPI.git.getUserName();
      const result = await window.electronAPI.git.init({
        name: repoName.trim(),
        description: repoDescription.trim(),
        localPath: repoLocalPath.trim(),
        gitignoreTemplate,
        licenseTemplate,
        authorName: authorName || undefined,
      });
      const repoPath = result.repoPath;
      if (initRemoteUrl.trim()) {
        await window.electronAPI.git.addRemote(repoPath, 'origin', initRemoteUrl.trim());
      }
      const repo: SavedRepository = {
        path: repoPath,
        name: repoName.trim(),
        lastOpened: new Date().toISOString(),
      };
      await addRepository(repo);
      setCurrentRepo(repo);
      navigate('/changes');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setInitializing(false);
    }
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
            <div className="create-repo-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  placeholder="my-project"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  placeholder="A short description (optional)"
                  value={repoDescription}
                  onChange={(e) => setRepoDescription(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Local Path</label>
                <div className="path-selector">
                  <input
                    type="text"
                    placeholder="Select a folder..."
                    value={repoLocalPath}
                    readOnly
                  />
                  <button className="btn-secondary" onClick={handleSelectPath}>Browse</button>
                </div>
                {repoLocalPath && repoName && (
                  <span className="path-preview">
                    Repository will be created at: {repoLocalPath}/{repoName}
                  </span>
                )}
              </div>
              <div className="form-row-2col">
                <div className="form-group">
                  <label>.gitignore Template</label>
                  <select
                    value={gitignoreTemplate}
                    onChange={(e) => setGitignoreTemplate(e.target.value)}
                  >
                    <option value="">None</option>
                    {gitignoreOptions.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>License</label>
                  <select
                    value={licenseTemplate}
                    onChange={(e) => setLicenseTemplate(e.target.value)}
                  >
                    <option value="">None</option>
                    {licenseOptions.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Remote URL (optional)</label>
                <input
                  type="text"
                  placeholder="https://your-gitea.com/user/repo.git"
                  value={initRemoteUrl}
                  onChange={(e) => setInitRemoteUrl(e.target.value)}
                />
              </div>
              <button
                className="btn-primary btn-create-repo"
                onClick={handleInitRepo}
                disabled={initializing || !repoName.trim() || !repoLocalPath.trim()}
              >
                {initializing ? 'Creating...' : 'Create Repository'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
