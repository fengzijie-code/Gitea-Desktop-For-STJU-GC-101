import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import CommitForm from '../components/CommitForm';

export default function ChangesPage() {
  const { currentRepo, status, refreshStatus, refreshBranch, currentBranch, setError } = useAppContext();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [diff, setDiff] = useState('');
  const [pushing, setPushing] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [committing, setCommitting] = useState(false);

  useEffect(() => {
    if (!selectedFile || !currentRepo) {
      setDiff('');
      return;
    }
    const isStaged = status?.staged.includes(selectedFile);
    const fetchDiff = async () => {
      try {
        const d = isStaged
          ? await window.electronAPI.git.getDiffStaged(currentRepo.path, selectedFile)
          : await window.electronAPI.git.getDiff(currentRepo.path, selectedFile);
        setDiff(d);
      } catch {
        setDiff('');
      }
    };
    fetchDiff();
  }, [selectedFile, currentRepo, status]);

  if (!currentRepo) {
    return <div className="page-empty">Select a repository to view changes.</div>;
  }

  const unstagedFiles = status?.files.filter(
    (f) => f.working_dir !== ' ' && f.working_dir !== '?'
  ) || [];
  const untrackedFiles = status?.files.filter(
    (f) => f.working_dir === '?' || f.index === '?'
  ) || [];
  const stagedFiles = status?.files.filter(
    (f) => f.index !== ' ' && f.index !== '?' && f.index !== '!'
  ) || [];

  const handleStage = async (files: string[]) => {
    try {
      await window.electronAPI.git.stage(currentRepo.path, files);
      await refreshStatus();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUnstage = async (files: string[]) => {
    try {
      await window.electronAPI.git.unstage(currentRepo.path, files);
      await refreshStatus();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleStageAll = () => {
    const all = [...unstagedFiles, ...untrackedFiles].map((f) => f.path);
    if (all.length > 0) handleStage(all);
  };

  const handleUnstageAll = () => {
    const all = stagedFiles.map((f) => f.path);
    if (all.length > 0) handleUnstage(all);
  };

  const handleCommit = async (message: string, options?: { allowEmpty?: boolean }) => {
    if (!message.trim()) return;
    setCommitting(true);
    try {
      await window.electronAPI.git.commit(currentRepo.path, message.trim(), options);
      await refreshStatus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCommitting(false);
    }
  };

  const handlePush = async () => {
    setPushing(true);
    try {
      await window.electronAPI.git.push(currentRepo.path, 'origin', currentBranch || undefined);
      await refreshStatus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPushing(false);
    }
  };

  const handlePull = async () => {
    setPulling(true);
    try {
      await window.electronAPI.git.pull(currentRepo.path, 'origin', currentBranch || undefined);
      await refreshStatus();
      await refreshBranch();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPulling(false);
    }
  };

  const handleOpenInVSCode = async () => {
    if (!currentRepo) return;
    try {
      await window.electronAPI.shell.openInVSCode(currentRepo.path);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleOpenInExplorer = async () => {
    if (!currentRepo) return;
    try {
      await window.electronAPI.shell.openInExplorer(currentRepo.path);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStatusLabel = (index: string, workingDir: string) => {
    if (workingDir === '?') return 'Untracked';
    if (workingDir === 'M') return 'Modified';
    if (workingDir === 'D') return 'Deleted';
    if (index === 'A') return 'Added';
    if (index === 'M') return 'Modified';
    if (index === 'D') return 'Deleted';
    if (index === 'R') return 'Renamed';
    return 'Changed';
  };

  return (
    <div className="changes-page">
      <div className="changes-toolbar">
        <h2>Changes</h2>
        <div className="toolbar-actions">
          <button onClick={handlePull} disabled={pulling} title="Pull">
            {pulling ? 'Pulling...' : '↓ Pull'}
          </button>
          <button onClick={handlePush} disabled={pushing} title="Push">
            {pushing ? 'Pushing...' : '↑ Push'}
          </button>
          <button onClick={refreshStatus} title="Refresh">
            ⟳ Refresh
          </button>
          <button onClick={handleOpenInVSCode} title="Open in VS Code">
            {'</>'} VS Code
          </button>
          <button onClick={handleOpenInExplorer} title="Open in Explorer">
            Explorer
          </button>
        </div>
      </div>

      {status && (
        <div className="sync-status">
          {status.ahead > 0 && <span className="ahead">↑ {status.ahead} ahead</span>}
          {status.behind > 0 && <span className="behind">↓ {status.behind} behind</span>}
        </div>
      )}

      <div className="changes-content">
        <div className="file-lists">
          <div className="file-section">
            <div className="file-section-header">
              <h3>Staged ({stagedFiles.length})</h3>
              {stagedFiles.length > 0 && (
                <button className="btn-small" onClick={handleUnstageAll}>Unstage All</button>
              )}
            </div>
            <div className="file-list">
              {stagedFiles.map((f) => (
                <div
                  key={`staged-${f.path}`}
                  className={`file-item ${selectedFile === f.path ? 'selected' : ''}`}
                  onClick={() => setSelectedFile(f.path)}
                >
                  <span className={`file-status status-${f.index.toLowerCase()}`}>
                    {getStatusLabel(f.index, ' ')}
                  </span>
                  <span className="file-path">{f.path}</span>
                  <button
                    className="btn-icon"
                    onClick={(e) => { e.stopPropagation(); handleUnstage([f.path]); }}
                    title="Unstage"
                  >−</button>
                </div>
              ))}
            </div>
          </div>

          <div className="file-section">
            <div className="file-section-header">
              <h3>Changed ({unstagedFiles.length + untrackedFiles.length})</h3>
              {(unstagedFiles.length + untrackedFiles.length) > 0 && (
                <button className="btn-small" onClick={handleStageAll}>Stage All</button>
              )}
            </div>
            <div className="file-list">
              {[...unstagedFiles, ...untrackedFiles].map((f) => (
                <div
                  key={`changed-${f.path}`}
                  className={`file-item ${selectedFile === f.path ? 'selected' : ''}`}
                  onClick={() => setSelectedFile(f.path)}
                >
                  <span className={`file-status status-${f.working_dir.toLowerCase()}`}>
                    {getStatusLabel(' ', f.working_dir)}
                  </span>
                  <span className="file-path">{f.path}</span>
                  <button
                    className="btn-icon"
                    onClick={(e) => { e.stopPropagation(); handleStage([f.path]); }}
                    title="Stage"
                  >+</button>
                </div>
              ))}
            </div>
          </div>

          <CommitForm
            currentBranch={status?.current || 'branch'}
            stagedCount={stagedFiles.length}
            committing={committing}
            onCommit={handleCommit}
          />
        </div>

        <div className="diff-panel">
          {selectedFile ? (
            <>
              <div className="diff-header">{selectedFile}</div>
              <pre className="diff-content">{diff || 'No diff available (new or binary file)'}</pre>
            </>
          ) : (
            <div className="diff-placeholder">Select a file to view changes</div>
          )}
        </div>
      </div>
    </div>
  );
}
