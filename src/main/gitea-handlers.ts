import { ipcMain, net } from 'electron';

function giteaFetch(serverUrl: string, token: string, endpoint: string, options: any = {}): Promise<any> {
  const url = `${serverUrl.replace(/\/$/, '')}/api/v1${endpoint}`;
  return new Promise((resolve, reject) => {
    const request = net.request({
      method: options.method || 'GET',
      url,
    });

    request.setHeader('Authorization', `token ${token}`);
    request.setHeader('Content-Type', 'application/json');
    request.setHeader('Accept', 'application/json');

    request.on('response', (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk.toString();
      });
      response.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (response.statusCode && response.statusCode >= 400) {
            reject(new Error(parsed.message || `HTTP ${response.statusCode}`));
          } else {
            resolve(parsed);
          }
        } catch {
          if (response.statusCode && response.statusCode >= 400) {
            reject(new Error(`HTTP ${response.statusCode}`));
          } else {
            resolve(data);
          }
        }
      });
    });

    request.on('error', reject);

    if (options.body) {
      request.write(JSON.stringify(options.body));
    }

    request.end();
  });
}

export function registerGiteaHandlers() {
  ipcMain.handle('gitea:test-connection', async (_event, serverUrl: string, token: string) => {
    try {
      const user = await giteaFetch(serverUrl, token, '/user');
      return { success: true, user };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('gitea:list-repos', async (_event, serverUrl: string, token: string) => {
    return await giteaFetch(serverUrl, token, '/user/repos?limit=50&sort=updated');
  });

  ipcMain.handle('gitea:get-repo', async (_event, serverUrl: string, token: string, owner: string, repo: string) => {
    return await giteaFetch(serverUrl, token, `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
  });

  ipcMain.handle('gitea:create-repo', async (_event, serverUrl: string, token: string, options: any) => {
    return await giteaFetch(serverUrl, token, '/user/repos', {
      method: 'POST',
      body: options,
    });
  });

  ipcMain.handle('gitea:list-issues',
    async (_event, serverUrl: string, token: string, owner: string, repo: string, page?: number, state?: string) => {
      const p = page || 1;
      const s = state || 'all';
      return await giteaFetch(serverUrl, token,
        `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues?page=${p}&limit=20&state=${s}&type=issues&sort=created&direction=desc`
      );
    }
  );

  ipcMain.handle('gitea:get-issue-comments',
    async (_event, serverUrl: string, token: string, owner: string, repo: string, index: number) => {
      return await giteaFetch(serverUrl, token,
        `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues/${index}/comments`
      );
    }
  );

  ipcMain.handle('gitea:list-releases',
    async (_event, serverUrl: string, token: string, owner: string, repo: string) => {
      return await giteaFetch(serverUrl, token,
        `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/releases?limit=50`
      );
    }
  );

  ipcMain.handle('gitea:create-release',
    async (_event, serverUrl: string, token: string, owner: string, repo: string,
      options: { tag_name: string; name: string; body: string }) => {
      return await giteaFetch(serverUrl, token,
        `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/releases`,
        { method: 'POST', body: options }
      );
    }
  );
}
