import fs from 'fs';
import path from 'path';
import os from 'os';
import { Redis } from '@upstash/redis';

// In-memory fallback
let memoryGuests: any[] = [];
let memorySeating: Record<string, any> = {};

let redisClient: Redis | null = null;

function getRedis(): Redis | null {
  if (redisClient) return redisClient;

  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || 'https://still-troll-249032.upstash.io';
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || 'gQAAAAAAABzTAAtgcDJlMjQ5ZjhkMTkwNTA0OWE4OGY0NTc0MjlNThjODA5Mw';

  if (url && token) {
    try {
      redisClient = new Redis({ url, token });
      return redisClient;
    } catch (e) {
      console.error('Error connecting to Upstash Redis/KV:', e);
    }
  }
  return null;
}

function getLocalDataPath(filename: string): string {
  return path.join(process.cwd(), 'data', filename);
}

function getTmpPath(filename: string): string {
  return path.join(os.tmpdir(), filename);
}

export async function readGuests(): Promise<any[]> {
  // 1. Try Upstash Redis / Vercel KV if configured
  const redis = getRedis();
  if (redis) {
    try {
      const data = await redis.get<any[]>('wedding_guests');
      if (Array.isArray(data)) {
        memoryGuests = data;
        return data;
      }
      return [];
    } catch (err) {
      console.error('Redis readGuests error:', err);
    }
  }

  // 2. Try local ./data/guests.json
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
    // Continue
  }

  // 3. Try os.tmpdir()/guests.json
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
    // Continue
  }

  return memoryGuests;
}

export async function saveGuests(guests: any[]): Promise<boolean> {
  memoryGuests = guests;

  // 1. Try saving to Upstash Redis / Vercel KV
  const redis = getRedis();
  if (redis) {
    try {
      await redis.set('wedding_guests', guests);
    } catch (err) {
      console.error('Redis saveGuests error:', err);
    }
  }

  // 2. Try saving to ./data/guests.json
  try {
    const localPath = getLocalDataPath('guests.json');
    const dir = path.dirname(localPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(localPath, JSON.stringify(guests, null, 2), 'utf8');
  } catch {
    // Expected on read-only environments like Vercel Lambda
  }

  // 3. Try saving to os.tmpdir()/guests.json
  try {
    const tmpPath = getTmpPath('guests.json');
    const dir = path.dirname(tmpPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(tmpPath, JSON.stringify(guests, null, 2), 'utf8');
  } catch {
    // Ignore
  }

  return true;
}

export async function readSeating(): Promise<Record<string, any>> {
  // 1. Try Upstash Redis / Vercel KV
  const redis = getRedis();
  if (redis) {
    try {
      const data = await redis.get<Record<string, any>>('wedding_seating');
      if (data && typeof data === 'object') {
        memorySeating = data;
        return data;
      }
      return {};
    } catch (err) {
      console.error('Redis readSeating error:', err);
    }
  }

  // 2. Try local ./data/seating.json
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
    // Continue
  }

  // 3. Try os.tmpdir()/seating.json
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
    // Continue
  }

  return memorySeating;
}

export async function saveSeating(seating: Record<string, any>): Promise<boolean> {
  memorySeating = seating;

  // 1. Try saving to Upstash Redis / Vercel KV
  const redis = getRedis();
  if (redis) {
    try {
      await redis.set('wedding_seating', seating);
    } catch (err) {
      console.error('Redis saveSeating error:', err);
    }
  }

  // 2. Try saving to ./data/seating.json
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

  // 3. Try saving to os.tmpdir()/seating.json
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
