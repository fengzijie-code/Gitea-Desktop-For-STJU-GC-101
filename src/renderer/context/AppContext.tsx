import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface AppState {
  config: AppConfig;
  currentRepo: SavedRepository | null;
  currentBranch: string;
  status: GitStatus | null;
  loading: boolean;
  error: string | null;
}

interface AppContextType extends AppState {
  setCurrentRepo: (repo: SavedRepository | null) => void;
  refreshStatus: () => Promise<void>;
  refreshBranch: () => Promise<void>;
  addRepository: (repo: SavedRepository) => Promise<void>;
  removeRepository: (path: string) => Promise<void>;
  addAccount: (account: GiteaAccount) => Promise<void>;
  removeAccount: (serverUrl: string) => Promise<void>;
  setError: (error: string | null) => void;
  updateConfig: (config: AppConfig) => Promise<void>;
  getRepoInfo: () => Promise<{ owner: string; repo: string } | null>;
  getActiveAccount: () => GiteaAccount | null;
}

const AppContext = createContext<AppContextType | null>(null);

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AppConfig>({ accounts: [], repositories: [] });
  const [currentRepo, setCurrentRepoState] = useState<SavedRepository | null>(null);
  const [currentBranch, setCurrentBranch] = useState('');
  const [status, setStatus] = useState<GitStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.electronAPI.file.readConfig().then(setConfig);
  }, []);

  const updateConfig = useCallback(async (newConfig: AppConfig) => {
    setConfig(newConfig);
    await window.electronAPI.file.writeConfig(newConfig);
  }, []);

  const refreshStatus = useCallback(async () => {
    if (!currentRepo) return;
    try {
      const s = await window.electronAPI.git.getStatus(currentRepo.path);
      setStatus(s);
    } catch (err: any) {
      setError(err.message);
    }
  }, [currentRepo]);

  const refreshBranch = useCallback(async () => {
    if (!currentRepo) return;
    try {
      const branch = await window.electronAPI.git.getCurrentBranch(currentRepo.path);
      setCurrentBranch(branch);
    } catch (err: any) {
      setError(err.message);
    }
  }, [currentRepo]);

  const setCurrentRepo = useCallback((repo: SavedRepository | null) => {
    setCurrentRepoState(repo);
    setStatus(null);
    setCurrentBranch('');
  }, []);

  useEffect(() => {
    if (currentRepo) {
      refreshStatus();
      refreshBranch();
    }
  }, [currentRepo, refreshStatus, refreshBranch]);

  const addRepository = useCallback(async (repo: SavedRepository) => {
    const newConfig = {
      ...config,
      repositories: [
        repo,
        ...config.repositories.filter((r) => r.path !== repo.path),
      ],
    };
    await updateConfig(newConfig);
  }, [config, updateConfig]);

  const removeRepository = useCallback(async (path: string) => {
    const newConfig = {
      ...config,
      repositories: config.repositories.filter((r) => r.path !== path),
    };
    await updateConfig(newConfig);
    if (currentRepo?.path === path) {
      setCurrentRepo(null);
    }
  }, [config, updateConfig, currentRepo, setCurrentRepo]);

  const addAccount = useCallback(async (account: GiteaAccount) => {
    const newConfig = {
      ...config,
      accounts: [
        account,
        ...config.accounts.filter((a) => a.serverUrl !== account.serverUrl),
      ],
    };
    await updateConfig(newConfig);
  }, [config, updateConfig]);

  const removeAccount = useCallback(async (serverUrl: string) => {
    const newConfig = {
      ...config,
      accounts: config.accounts.filter((a) => a.serverUrl !== serverUrl),
    };
    await updateConfig(newConfig);
  }, [config, updateConfig]);

  const getActiveAccount = useCallback((): GiteaAccount | null => {
    return config.accounts[0] || null;
  }, [config.accounts]);

  const getRepoInfo = useCallback(async (): Promise<{ owner: string; repo: string } | null> => {
    if (!currentRepo) return null;
    try {
      const remotes = await window.electronAPI.git.getRemotes(currentRepo.path);
      const origin = remotes.find((r: RemoteInfo) => r.name === 'origin');
      if (!origin) return null;
      const url = origin.refs.fetch || origin.refs.push;
      const match = url.match(/[/:]([^/:]+)\/([^/.]+?)(?:\.git)?$/);
      if (!match) return null;
      return { owner: match[1], repo: match[2] };
    } catch {
      return null;
    }
  }, [currentRepo]);

  return (
    <AppContext.Provider
      value={{
        config,
        currentRepo,
        currentBranch,
        status,
        loading,
        error,
        setCurrentRepo,
        refreshStatus,
        refreshBranch,
        addRepository,
        removeRepository,
        addAccount,
        removeAccount,
        setError,
        updateConfig,
        getRepoInfo,
        getActiveAccount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
