import fs from 'fs';
import path from 'path';
import os from 'os';

// In-memory fallback
let memoryGuests: any[] = [];
let memorySeating: Record<string, any> = {};

function getLocalDataPath(filename: string): string {
  return path.join(process.cwd(), 'data', filename);
}

function getTmpPath(filename: string): string {
  return path.join(os.tmpdir(), filename);
}

export function readGuests(): any[] {
  // 1. Try local ./data/guests.json
  try {
    const localPath = getLocalDataPath('guests.json');
    if (fs.existsSync(localPath)) {
      const data = fs.readFileSync(localPath, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryGuests = parsed;
        return parsed;
      }
    }
  } catch {
    // Continue to next fallback
  }

  // 2. Try os.tmpdir()/guests.json
  try {
    const tmpPath = getTmpPath('guests.json');
    if (fs.existsSync(tmpPath)) {
      const data = fs.readFileSync(tmpPath, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryGuests = parsed;
        return parsed;
      }
    }
  } catch {
    // Continue to memory fallback
  }

  return memoryGuests;
}

export function saveGuests(guests: any[]): boolean {
  memoryGuests = guests;
  let savedSomewhere = false;

  // 1. Try saving to ./data/guests.json
  try {
    const localPath = getLocalDataPath('guests.json');
    const dir = path.dirname(localPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(localPath, JSON.stringify(guests, null, 2), 'utf8');
    savedSomewhere = true;
  } catch (err) {
    // Expected on read-only environments like Vercel Lambda
  }

  // 2. Try saving to os.tmpdir()/guests.json
  try {
    const tmpPath = getTmpPath('guests.json');
    const dir = path.dirname(tmpPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(tmpPath, JSON.stringify(guests, null, 2), 'utf8');
    savedSomewhere = true;
  } catch (err) {
    // Log if tmp also fails
  }

  return true;
}

export function readSeating(): Record<string, any> {
  // 1. Try local ./data/seating.json
  try {
    const localPath = getLocalDataPath('seating.json');
    if (fs.existsSync(localPath)) {
      const data = fs.readFileSync(localPath, 'utf8');
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        memorySeating = parsed;
        return parsed;
      }
    }
  } catch {
    // Continue to next fallback
  }

  // 2. Try os.tmpdir()/seating.json
  try {
    const tmpPath = getTmpPath('seating.json');
    if (fs.existsSync(tmpPath)) {
      const data = fs.readFileSync(tmpPath, 'utf8');
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        memorySeating = parsed;
        return parsed;
      }
    }
  } catch {
    // Continue to memory fallback
  }

  return memorySeating;
}

export function saveSeating(seating: Record<string, any>): boolean {
  memorySeating = seating;

  // 1. Try saving to ./data/seating.json
  try {
    const localPath = getLocalDataPath('seating.json');
    const dir = path.dirname(localPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(localPath, JSON.stringify(seating, null, 2), 'utf8');
  } catch {
    // Expected on read-only environments
  }

  // 2. Try saving to os.tmpdir()/seating.json
  try {
    const tmpPath = getTmpPath('seating.json');
    const dir = path.dirname(tmpPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(tmpPath, JSON.stringify(seating, null, 2), 'utf8');
  } catch {
    // Ignore
  }

  return true;
}
