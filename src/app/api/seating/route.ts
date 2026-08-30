import { NextResponse } from 'next/server';
import { readSeating, saveSeating } from '@/lib/storage';

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (authHeader !== 'Bearer BM11062027') {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 });
  }

  try {
    const seating = readSeating();
    return NextResponse.json({ seating });
  } catch (error) {
    console.error('Error reading seating:', error);
    return NextResponse.json({ error: 'Error intern del servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (authHeader !== 'Bearer BM11062027') {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 });
  }

  try {
    const body = await request.json();
    saveSeating(body.seating || {});
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving seating:', error);
    return NextResponse.json({ error: 'Error al desar' }, { status: 500 });
  }
}

