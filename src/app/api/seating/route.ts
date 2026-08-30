import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (authHeader !== 'Bearer BM11062027') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const filePath = path.join(process.cwd(), 'data', 'seating.json');
    let seating = {};
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf8');
      seating = JSON.parse(fileData);
    }
    return NextResponse.json({ seating });
  } catch (error) {
    console.error('Error reading seating:', error);
    return NextResponse.json({ error: 'Error intern del servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (authHeader !== 'Bearer BM11062027') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const filePath = path.join(process.cwd(), 'data', 'seating.json');
    fs.writeFileSync(filePath, JSON.stringify(body.seating || {}, null, 2), 'utf8');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving seating:', error);
    return NextResponse.json({ error: 'Error al desar' }, { status: 500 });
  }
}
