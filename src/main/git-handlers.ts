import { ipcMain } from 'electron';
import simpleGit, { SimpleGit } from 'simple-git';

function getGit(repoPath: string): SimpleGit {
  return simpleGit(repoPath);
}

export function registerGitHandlers() {
  ipcMain.handle('git:clone', async (_event, url: string, targetPath: string) => {
    const git = simpleGit();
    await git.clone(url, targetPath);
    return { success: true };
  });

  ipcMain.handle('git:status', async (_event, repoPath: string) => {
    const git = getGit(repoPath);
    const status = await git.status();
    return {
      current: status.current,
      tracking: status.tracking,
      staged: status.staged,
      modified: status.modified,
      not_added: status.not_added,
      deleted: status.deleted,
      renamed: status.renamed,
      conflicted: status.conflicted,
      created: status.created,
      files: status.files.map((f) => ({
        path: f.path,
        index: f.index,
        working_dir: f.working_dir,
      })),
      ahead: status.ahead,
      behind: status.behind,
    };
  });

  ipcMain.handle('git:stage', async (_event, repoPath: string, files: string[]) => {
    const git = getGit(repoPath);
    await git.add(files);
    return { success: true };
  });

  ipcMain.handle('git:unstage', async (_event, repoPath: string, files: string[]) => {
    const git = getGit(repoPath);
    await git.reset(['HEAD', '--', ...files]);
    return { success: true };
  });

  ipcMain.handle('git:commit', async (_event, repoPath: string, message: string) => {
    const git = getGit(repoPath);
    const result = await git.commit(message);
    return { success: true, summary: result.summary };
  });

  ipcMain.handle('git:push', async (_event, repoPath: string, remote?: string, branch?: string) => {
    const git = getGit(repoPath);
    await git.push(remote || 'origin', branch);
    return { success: true };
  });

  ipcMain.handle('git:pull', async (_event, repoPath: string, remote?: string, branch?: string) => {
    const git = getGit(repoPath);
    const result = await git.pull(remote || 'origin', branch);
    return { success: true, summary: result.summary };
  });

  ipcMain.handle('git:fetch', async (_event, repoPath: string) => {
    const git = getGit(repoPath);
    await git.fetch();
    return { success: true };
  });

  ipcMain.handle('git:branches', async (_event, repoPath: string) => {
    const git = getGit(repoPath);
    const branches = await git.branch();
    return {
      all: branches.all,
      current: branches.current,
      branches: branches.branches,
    };
  });

  ipcMain.handle('git:current-branch', async (_event, repoPath: string) => {
    const git = getGit(repoPath);
    const branches = await git.branch();
    return branches.current;
  });

  ipcMain.handle('git:checkout', async (_event, repoPath: string, branch: string) => {
    const git = getGit(repoPath);
    await git.checkout(branch);
    return { success: true };
  });

  ipcMain.handle('git:create-branch', async (_event, repoPath: string, branch: string) => {
    const git = getGit(repoPath);
    await git.checkoutLocalBranch(branch);
    return { success: true };
  });

  ipcMain.handle('git:delete-branch', async (_event, repoPath: string, branch: string) => {
    const git = getGit(repoPath);
    await git.deleteLocalBranch(branch);
    return { success: true };
  });

  ipcMain.handle('git:log', async (_event, repoPath: string, maxCount?: number) => {
    const git = getGit(repoPath);
    const log = await git.log({ maxCount: maxCount || 50 });
    return log.all;
  });

  ipcMain.handle('git:diff', async (_event, repoPath: string, filePath?: string) => {
    const git = getGit(repoPath);
    if (filePath) {
      return await git.diff([filePath]);
    }
    return await git.diff();
  });

  ipcMain.handle('git:diff-staged', async (_event, repoPath: string, filePath?: string) => {
    const git = getGit(repoPath);
    if (filePath) {
      return await git.diff(['--cached', filePath]);
    }
    return await git.diff(['--cached']);
  });

  ipcMain.handle('git:remotes', async (_event, repoPath: string) => {
    const git = getGit(repoPath);
    return await git.getRemotes(true);
  });

  ipcMain.handle('git:init', async (_event, repoPath: string) => {
    const git = simpleGit(repoPath);
    await git.init();
    return { success: true };
  });

  ipcMain.handle('git:add-remote', async (_event, repoPath: string, name: string, url: string) => {
    const git = getGit(repoPath);
    await git.addRemote(name, url);
    return { success: true };
  });
}
