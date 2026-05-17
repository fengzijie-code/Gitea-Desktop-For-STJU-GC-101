import { ipcMain, dialog, app } from 'electron';
import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(app.getPath('userData'), 'config.json');

export function registerFileHandlers() {
  ipcMain.handle('file:select-directory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    });
    if (result.canceled) return null;
    return result.filePaths[0];
  });

  ipcMain.handle('file:read-config', async () => {
    try {
      if (fs.existsSync(CONFIG_PATH)) {
        const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
        return JSON.parse(data);
      }
    } catch {
      // ignore
    }
    return { accounts: [], repositories: [] };
  });

  ipcMain.handle('file:write-config', async (_event, config: any) => {
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    return { success: true };
  });
}
