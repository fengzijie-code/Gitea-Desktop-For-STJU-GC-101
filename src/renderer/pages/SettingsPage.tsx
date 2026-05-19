import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

export default function SettingsPage() {
  const { config, addAccount, removeAccount } = useAppContext();
  const [serverUrl, setServerUrl] = useState('');
  const [token, setToken] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTest = async () => {
    if (!serverUrl.trim() || !token.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      const result = await window.electronAPI.gitea.testConnection(
        serverUrl.trim(),
        token.trim()
      );
      if (result.success) {
        setTestResult({ success: true, message: `Connected as ${result.user.login}` });
      } else {
        setTestResult({ success: false, message: result.error || 'Connection failed' });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setTesting(false);
    }
  };

  const handleAdd = async () => {
    if (!serverUrl.trim() || !token.trim()) return;
    setTesting(true);
    try {
      const result = await window.electronAPI.gitea.testConnection(
        serverUrl.trim(),
        token.trim()
      );
      if (result.success) {
        await addAccount({
          serverUrl: serverUrl.trim(),
          token: token.trim(),
          username: result.user.login,
          avatarUrl: result.user.avatar_url,
        });
        setServerUrl('');
        setToken('');
        setTestResult(null);
      } else {
        setTestResult({ success: false, message: result.error || 'Connection failed' });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="settings-page">
      <h2>Settings</h2>

      <section className="settings-section">
        <h3>Gitea Accounts</h3>

        {config.accounts.length > 0 && (
          <div className="account-list">
            {config.accounts.map((account) => (
              <div key={account.serverUrl} className="account-item">
                <div className="account-info">
                  {account.avatarUrl && (
                    <img className="account-avatar" src={account.avatarUrl} alt="" />
                  )}
                  <div>
                    <div className="account-username">{account.username}</div>
                    <div className="account-server">{account.serverUrl}</div>
                  </div>
                </div>
                <button
                  className="btn-small btn-danger"
                  onClick={() => removeAccount(account.serverUrl)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="add-account-form">
          <h4>Add Account</h4>
          <div className="form-group">
            <label>Server URL</label>
            <input
              type="text"
              placeholder="https://your-gitea-instance.com"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Access Token</label>
            <input
              type="password"
              placeholder="Your Gitea personal access token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>

          {testResult && (
            <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
              {testResult.message}
            </div>
          )}

          <div className="form-actions">
            <button
              className="btn-secondary"
              onClick={handleTest}
              disabled={testing || !serverUrl.trim() || !token.trim()}
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </button>
            <button
              className="btn-primary"
              onClick={handleAdd}
              disabled={testing || !serverUrl.trim() || !token.trim()}
            >
              Add Account
            </button>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h3>About</h3>
        <p>Gitea Desktop v1.3.0</p>
        <p>A desktop client for Gitea, inspired by GitHub Desktop.</p>
      </section>
    </div>
  );
}
