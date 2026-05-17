interface GitAPI {
  clone(url: string, targetPath: string): Promise<{ success: boolean }>;
  getStatus(repoPath: string): Promise<GitStatus>;
  stage(repoPath: string, files: string[]): Promise<{ success: boolean }>;
  unstage(repoPath: string, files: string[]): Promise<{ success: boolean }>;
  commit(repoPath: string, message: string): Promise<{ success: boolean; summary: any }>;
  push(repoPath: string, remote?: string, branch?: string): Promise<{ success: boolean }>;
  pull(repoPath: string, remote?: string, branch?: string): Promise<{ success: boolean; summary: any }>;
  fetch(repoPath: string): Promise<{ success: boolean }>;
  getBranches(repoPath: string): Promise<BranchInfo>;
  getCurrentBranch(repoPath: string): Promise<string>;
  checkout(repoPath: string, branch: string): Promise<{ success: boolean }>;
  createBranch(repoPath: string, branch: string): Promise<{ success: boolean }>;
  deleteBranch(repoPath: string, branch: string): Promise<{ success: boolean }>;
  getLog(repoPath: string, maxCount?: number): Promise<LogEntry[]>;
  getDiff(repoPath: string, filePath?: string): Promise<string>;
  getDiffStaged(repoPath: string, filePath?: string): Promise<string>;
  getRemotes(repoPath: string): Promise<RemoteInfo[]>;
  init(repoPath: string): Promise<{ success: boolean }>;
  addRemote(repoPath: string, name: string, url: string): Promise<{ success: boolean }>;
}

interface GiteaAPI {
  testConnection(serverUrl: string, token: string): Promise<{ success: boolean; user?: any; error?: string }>;
  listRepos(serverUrl: string, token: string): Promise<any[]>;
  getRepo(serverUrl: string, token: string, owner: string, repo: string): Promise<any>;
  createRepo(serverUrl: string, token: string, options: any): Promise<any>;
}

interface FileAPI {
  selectDirectory(): Promise<string | null>;
  readConfig(): Promise<AppConfig>;
  writeConfig(config: AppConfig): Promise<{ success: boolean }>;
}

interface GitStatus {
  current: string | null;
  tracking: string | null;
  staged: string[];
  modified: string[];
  not_added: string[];
  deleted: string[];
  renamed: any[];
  conflicted: string[];
  created: string[];
  files: { path: string; index: string; working_dir: string }[];
  ahead: number;
  behind: number;
}

interface BranchInfo {
  all: string[];
  current: string;
  branches: Record<string, any>;
}

interface LogEntry {
  hash: string;
  date: string;
  message: string;
  author_name: string;
  author_email: string;
}

interface RemoteInfo {
  name: string;
  refs: { fetch: string; push: string };
}

interface AppConfig {
  accounts: GiteaAccount[];
  repositories: SavedRepository[];
}

interface GiteaAccount {
  serverUrl: string;
  token: string;
  username: string;
  avatarUrl?: string;
}

interface SavedRepository {
  path: string;
  name: string;
  lastOpened: string;
}

declare global {
  interface Window {
    electronAPI: {
      git: GitAPI;
      gitea: GiteaAPI;
      file: FileAPI;
    };
  }
}

export {};
