import { NextResponse } from 'next/server';
import { readGuests } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  // Verifiquem el token d'autorització (contrasenya)
  const authHeader = request.headers.get('Authorization');
  
  if (authHeader !== 'Bearer BM11062027') {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 });
  }

  try {
    const guests = readGuests();
    return NextResponse.json({ guests });
  } catch (error) {
    console.error('Error reading guests:', error);
    return NextResponse.json({ error: 'Error intern del servidor' }, { status: 500 });
  }
}
