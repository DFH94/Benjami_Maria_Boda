import fs from 'fs';
import path from 'path';
import os from 'os';

// In-memory fallback
let memoryGuests: any[] = [];
let memorySeating: Record<string, any> = {};

function getFilePath(filename: string): string {
  const tmpPath = path.join(os.tmpdir(), filename);
  const cwdPath = path.join(process.cwd(), 'data', filename);

  // In development, try to use process.cwd()/data if writable
  if (process.env.NODE_ENV === 'development') {
    try {
      const dir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      return cwdPath;
    } catch {
      return tmpPath;
    }
  }

  // In Vercel / serverless production, process.cwd() is read-only, so use /tmp
  try {
    if (fs.existsSync(cwdPath) && !fs.existsSync(tmpPath)) {
      const initial = fs.readFileSync(cwdPath, 'utf8');
      fs.writeFileSync(tmpPath, initial, 'utf8');
    }
  } catch {
    // Ignore seed errors
  }

  return tmpPath;
}

export function readGuests(): any[] {
  try {
    const filePath = getFilePath('guests.json');
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        memoryGuests = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error('Warning reading guests file:', err);
  }
  return memoryGuests;
}

export function saveGuests(guests: any[]): boolean {
  memoryGuests = guests;
  try {
    const filePath = getFilePath('guests.json');
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(guests, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Warning writing guests file (stored in memory):', err);
    return true;
  }
}

export function readSeating(): Record<string, any> {
  try {
    const filePath = getFilePath('seating.json');
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(data);
      memorySeating = parsed;
      return parsed;
    }
  } catch (err) {
    console.error('Warning reading seating file:', err);
  }
  return memorySeating;
}

export function saveSeating(seating: Record<string, any>): boolean {
  memorySeating = seating;
  try {
    const filePath = getFilePath('seating.json');
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(seating, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Warning writing seating file (stored in memory):', err);
    return true;
  }
}
