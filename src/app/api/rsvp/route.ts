import { NextResponse } from 'next/server';
import { readGuests, saveGuests } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validar dades bàsiques
    if (!data.name || data.attending === undefined) {
      return NextResponse.json({ error: 'Falten dades obligatòries' }, { status: 400 });
    }

    const newGuest = {
      id: Date.now().toString(),
      name: data.name.trim(),
      attending: data.attending,
      companions: data.companions || 0,
      companionDetails: Array.isArray(data.companionDetails) ? data.companionDetails : [],
      mainCourse: data.mainCourse || 'Carn',
      dietary: data.dietary || '',
      createdAt: new Date().toISOString()
    };

    const guests = readGuests();
    guests.push(newGuest);
    saveGuests(guests);

    return NextResponse.json({ success: true, guest: newGuest });
  } catch (error) {
    console.error('Error saving RSVP:', error);
    return NextResponse.json({ error: 'Error intern del servidor' }, { status: 500 });
  }
}

