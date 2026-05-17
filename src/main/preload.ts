import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  git: {
    clone: (url: string, targetPath: string) =>
      ipcRenderer.invoke('git:clone', url, targetPath),
    getStatus: (repoPath: string) =>
      ipcRenderer.invoke('git:status', repoPath),
    stage: (repoPath: string, files: string[]) =>
      ipcRenderer.invoke('git:stage', repoPath, files),
    unstage: (repoPath: string, files: string[]) =>
      ipcRenderer.invoke('git:unstage', repoPath, files),
    commit: (repoPath: string, message: string) =>
      ipcRenderer.invoke('git:commit', repoPath, message),
    push: (repoPath: string, remote?: string, branch?: string) =>
      ipcRenderer.invoke('git:push', repoPath, remote, branch),
    pull: (repoPath: string, remote?: string, branch?: string) =>
      ipcRenderer.invoke('git:pull', repoPath, remote, branch),
    fetch: (repoPath: string) =>
      ipcRenderer.invoke('git:fetch', repoPath),
    getBranches: (repoPath: string) =>
      ipcRenderer.invoke('git:branches', repoPath),
    getCurrentBranch: (repoPath: string) =>
      ipcRenderer.invoke('git:current-branch', repoPath),
    checkout: (repoPath: string, branch: string) =>
      ipcRenderer.invoke('git:checkout', repoPath, branch),
    createBranch: (repoPath: string, branch: string) =>
      ipcRenderer.invoke('git:create-branch', repoPath, branch),
    deleteBranch: (repoPath: string, branch: string) =>
      ipcRenderer.invoke('git:delete-branch', repoPath, branch),
    getLog: (repoPath: string, maxCount?: number) =>
      ipcRenderer.invoke('git:log', repoPath, maxCount),
    getDiff: (repoPath: string, filePath?: string) =>
      ipcRenderer.invoke('git:diff', repoPath, filePath),
    getDiffStaged: (repoPath: string, filePath?: string) =>
      ipcRenderer.invoke('git:diff-staged', repoPath, filePath),
    getRemotes: (repoPath: string) =>
      ipcRenderer.invoke('git:remotes', repoPath),
    init: (repoPath: string) =>
      ipcRenderer.invoke('git:init', repoPath),
    addRemote: (repoPath: string, name: string, url: string) =>
      ipcRenderer.invoke('git:add-remote', repoPath, name, url),
  },
  gitea: {
    testConnection: (serverUrl: string, token: string) =>
      ipcRenderer.invoke('gitea:test-connection', serverUrl, token),
    listRepos: (serverUrl: string, token: string) =>
      ipcRenderer.invoke('gitea:list-repos', serverUrl, token),
    getRepo: (serverUrl: string, token: string, owner: string, repo: string) =>
      ipcRenderer.invoke('gitea:get-repo', serverUrl, token, owner, repo),
    createRepo: (serverUrl: string, token: string, options: any) =>
      ipcRenderer.invoke('gitea:create-repo', serverUrl, token, options),
  },
  file: {
    selectDirectory: () => ipcRenderer.invoke('file:select-directory'),
    readConfig: () => ipcRenderer.invoke('file:read-config'),
    writeConfig: (config: any) => ipcRenderer.invoke('file:write-config', config),
  },
});
