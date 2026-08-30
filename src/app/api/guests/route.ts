import { NextResponse } from 'next/server';
import { readGuests, saveGuests } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  // Verifiquem el token d'autorització (contrasenya)
  const authHeader = request.headers.get('Authorization');
  
  if (authHeader !== 'Bearer BM11062027') {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 });
  }

  try {
    const guests = await readGuests();
    return NextResponse.json({ guests });
  } catch (error) {
    console.error('Error reading guests:', error);
    return NextResponse.json({ error: 'Error intern del servidor' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (authHeader !== 'Bearer BM11062027') {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Falta l’identificador del convidat' }, { status: 400 });
    }

    const guests = await readGuests();
    const updatedGuests = guests.filter((g: any) => g.id !== id);
    await saveGuests(updatedGuests);

    return NextResponse.json({ success: true, guests: updatedGuests });
  } catch (error) {
    console.error('Error deleting guest:', error);
    return NextResponse.json({ error: 'Error al eliminar el convidat' }, { status: 500 });
  }
}
