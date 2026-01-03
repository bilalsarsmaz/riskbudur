import fs from 'fs/promises';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'src', 'data', 'settings.json');

export interface SystemSettings {
    maintenanceMode: boolean;
    uptimeStartDate: string; // ISO string
}

const DEFAULT_SETTINGS: SystemSettings = {
    maintenanceMode: false,
    uptimeStartDate: new Date().toISOString(),
};

async function ensureDirectory() {
    const dir = path.dirname(SETTINGS_FILE);
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }
}

async function readSettings(): Promise<SystemSettings> {
    try {
        await ensureDirectory();
        const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch (error) {
        // If file doesn't exist, return defaults (and maybe write them)
        return DEFAULT_SETTINGS;
    }
}

async function writeSettings(settings: SystemSettings): Promise<void> {
    await ensureDirectory();
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
}

export async function getSystemSettings(): Promise<SystemSettings> {
    return readSettings();
}

export async function updateSystemSettings(newSettings: Partial<SystemSettings>): Promise<SystemSettings> {
    const current = await readSettings();
    const updated = { ...current, ...newSettings };
    await writeSettings(updated);
    return updated;
}
