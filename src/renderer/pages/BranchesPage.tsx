import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

export default function BranchesPage() {
  const { currentRepo, currentBranch, refreshBranch, refreshStatus, setError } = useAppContext();
  const [branches, setBranches] = useState<BranchInfo | null>(null);
  const [newBranchName, setNewBranchName] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadBranches = async () => {
    if (!currentRepo) return;
    setLoading(true);
    try {
      const b = await window.electronAPI.git.getBranches(currentRepo.path);
      setBranches(b);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, [currentRepo]);

  if (!currentRepo) {
    return <div className="page-empty">Select a repository to manage branches.</div>;
  }

  const handleCheckout = async (branch: string) => {
    try {
      await window.electronAPI.git.checkout(currentRepo.path, branch);
      await refreshBranch();
      await refreshStatus();
      await loadBranches();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCreate = async () => {
    if (!newBranchName.trim()) return;
    try {
      await window.electronAPI.git.createBranch(currentRepo.path, newBranchName.trim());
      setNewBranchName('');
      setShowCreate(false);
      await refreshBranch();
      await loadBranches();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (branch: string) => {
    if (branch === currentBranch) return;
    try {
      await window.electronAPI.git.deleteBranch(currentRepo.path, branch);
      await loadBranches();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const localBranches = branches?.all.filter((b) => !b.startsWith('remotes/')) || [];
  const remoteBranches = branches?.all.filter((b) => b.startsWith('remotes/')) || [];

  return (
    <div className="branches-page">
      <div className="branches-toolbar">
        <h2>Branches</h2>
        <button className="btn-primary" onClick={() => setShowCreate(!showCreate)}>
          + New Branch
        </button>
      </div>

      {showCreate && (
        <div className="create-branch-form">
          <input
            type="text"
            placeholder="Branch name"
            value={newBranchName}
            onChange={(e) => setNewBranchName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
          <button className="btn-primary" onClick={handleCreate}>
            Create
          </button>
          <button className="btn-secondary" onClick={() => setShowCreate(false)}>
            Cancel
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <div className="branch-section">
            <h3>Local Branches</h3>
            <div className="branch-list">
              {localBranches.map((branch) => (
                <div
                  key={branch}
                  className={`branch-item ${branch === currentBranch ? 'current' : ''}`}
                >
                  <span className="branch-name">
                    {branch === currentBranch && <span className="current-marker">● </span>}
                    {branch}
                  </span>
                  <div className="branch-actions">
                    {branch !== currentBranch && (
                      <>
                        <button className="btn-small" onClick={() => handleCheckout(branch)}>
                          Checkout
                        </button>
                        <button className="btn-small btn-danger" onClick={() => handleDelete(branch)}>
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {remoteBranches.length > 0 && (
            <div className="branch-section">
              <h3>Remote Branches</h3>
              <div className="branch-list">
                {remoteBranches.map((branch) => (
                  <div key={branch} className="branch-item remote">
                    <span className="branch-name">{branch}</span>
                    <button
                      className="btn-small"
                      onClick={() => handleCheckout(branch.replace(/^remotes\/[^/]+\//, ''))}
                    >
                      Checkout
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
