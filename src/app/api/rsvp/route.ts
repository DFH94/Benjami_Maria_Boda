import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validar datos básicos
    if (!data.name || data.attending === undefined) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
    }

    const newGuest = {
      id: Date.now().toString(),
      name: data.name,
      attending: data.attending,
      companions: data.companions || 0,
      dietary: data.dietary || '',
      createdAt: new Date().toISOString()
    };

    const filePath = path.join(process.cwd(), 'data', 'guests.json');
    
    let guests = [];
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf8');
      guests = JSON.parse(fileData);
    }
    
    guests.push(newGuest);
    
    // Asegurar que el directorio data exista
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }
    
    fs.writeFileSync(filePath, JSON.stringify(guests, null, 2));

    return NextResponse.json({ success: true, guest: newGuest });
  } catch (error) {
    console.error('Error saving RSVP:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
