import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

export default function HistoryPage() {
  const { currentRepo, setError } = useAppContext();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentRepo) return;
    setLoading(true);
    window.electronAPI.git
      .getLog(currentRepo.path, 100)
      .then((entries) => setLogs(entries))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [currentRepo]);

  if (!currentRepo) {
    return <div className="page-empty">Select a repository to view history.</div>;
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="history-page">
      <h2>History</h2>
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="commit-list">
          {logs.map((entry) => (
            <div key={entry.hash} className="commit-item">
              <div className="commit-header">
                <span className="commit-message">{entry.message}</span>
                <span className="commit-hash">{entry.hash.substring(0, 7)}</span>
              </div>
              <div className="commit-meta">
                <span className="commit-author">{entry.author_name}</span>
                <span className="commit-date">{formatDate(entry.date)}</span>
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="page-empty">No commits yet.</div>
          )}
        </div>
      )}
    </div>
  );
}
