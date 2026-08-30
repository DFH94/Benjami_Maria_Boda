import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  // Verificamos el auth token (contraseña) en los headers
  const authHeader = request.headers.get('Authorization');
  
  if (authHeader !== 'Bearer BM11062027') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const filePath = path.join(process.cwd(), 'data', 'guests.json');
    
    let guests = [];
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf8');
      guests = JSON.parse(fileData);
    }

    return NextResponse.json({ guests });
  } catch (error) {
    console.error('Error reading guests:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
