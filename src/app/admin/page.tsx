"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Guest {
  id: string;
  name: string;
  attending: boolean;
  companions: number;
  dietary?: string;
}

interface Attendee {
  id: string;
  name: string;
  isCompanion?: boolean;
  dietary?: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Tab state: 'guests' or 'seating'
  const [activeTab, setActiveTab] = useState<'guests' | 'seating'>('guests');

  // Seating plan state: mapping seat index (1..50) -> Attendee Name
  const [seating, setSeating] = useState<Record<number, string>>({});
  const [selectedAttendee, setSelectedAttendee] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [filterSearch, setFilterSearch] = useState<string>('');
  const [customGuestName, setCustomGuestName] = useState<string>('');

  const TOTAL_SEATS = 50;

  const fetchGuestsAndSeating = async (authToken: string) => {
    try {
      // 1. Fetch Guests
      const resGuests = await fetch('/api/guests', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (resGuests.ok) {
        const data = await resGuests.json();
        setGuests(data.guests || []);
      }

      // 2. Fetch Seating
      const resSeating = await fetch('/api/seating', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (resSeating.ok) {
        const data = await resSeating.json();
        setSeating(data.seating || {});
      }

      setAuthenticated(true);
      setError('');
    } catch {
      setError('Error de connexió');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/guests', {
        headers: {
          'Authorization': `Bearer ${password}`
        }
      });
      
      if (res.ok) {
        await fetchGuestsAndSeating(password);
      } else {
        setError('Contrasenya incorrecta');
      }
    } catch {
      setError('Error de connexió');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSeating = async () => {
    setSaveStatus('Desant...');
    try {
      const res = await fetch('/api/seating', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`
        },
        body: JSON.stringify({ seating })
      });
      if (res.ok) {
        setSaveStatus('✓ Desat correctament!');
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        setSaveStatus('Error al desar');
      }
    } catch {
      setSaveStatus('Error al desar');
    }
  };

  // Generate flat list of attendees (confirmed guests + companions + couple)
  const getConfirmedAttendees = (): Attendee[] => {
    const list: Attendee[] = [
      { id: 'nuvi-benja', name: 'Benjamí (Nuvi)' },
      { id: 'nuvia-maria', name: 'Maria (Núvia)' }
    ];

    guests
      .filter(g => g.attending)
      .forEach(g => {
        list.push({
          id: `guest-${g.id || g.name}`,
          name: g.name,
          dietary: g.dietary
        });

        const compCount = g.companions || 0;
        for (let i = 1; i <= compCount; i++) {
          list.push({
            id: `guest-${g.id || g.name}-comp-${i}`,
            name: `${g.name} (Acomp. ${i})`,
            isCompanion: true,
            dietary: g.dietary
          });
        }
      });

    return list;
  };

  const confirmedAttendees = getConfirmedAttendees();

  // Find seated attendees and unseated attendees
  const seatedNames = Object.values(seating);
  const unseatedAttendees = confirmedAttendees.filter(a => !seatedNames.includes(a.name));

  // Seat interaction handlers
  const handleAssignToSeat = (seatNum: number, attendeeName: string) => {
    setSeating(prev => {
      const updated = { ...prev };
      // If attendee was in another seat, remove from there first
      Object.keys(updated).forEach(k => {
        if (updated[Number(k)] === attendeeName) {
          delete updated[Number(k)];
        }
      });
      updated[seatNum] = attendeeName;
      return updated;
    });
    setSelectedAttendee(null);
  };

  const handleRemoveFromSeat = (seatNum: number) => {
    setSeating(prev => {
      const updated = { ...prev };
      delete updated[seatNum];
      return updated;
    });
  };

  const handleSeatClick = (seatNum: number) => {
    if (selectedAttendee) {
      handleAssignToSeat(seatNum, selectedAttendee);
    } else if (seating[seatNum]) {
      // If clicking an occupied seat, select that attendee to move them
      setSelectedAttendee(seating[seatNum]);
      handleRemoveFromSeat(seatNum);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, name: string) => {
    e.dataTransfer.setData('text/plain', name);
  };

  const handleDropOnSeat = (e: React.DragEvent, seatNum: number) => {
    e.preventDefault();
    const name = e.dataTransfer.getData('text/plain');
    if (name) {
      handleAssignToSeat(seatNum, name);
    }
  };

  const handleAutoAssign = () => {
    if (confirm('Vols omplir els seients buits automàticament amb els convidats pendents?')) {
      const updated = { ...seating };
      let unseated = unseatedAttendees.map(a => a.name);
      
      for (let i = 1; i <= TOTAL_SEATS; i++) {
        if (!updated[i] && unseated.length > 0) {
          updated[i] = unseated.shift()!;
        }
      }
      setSeating(updated);
    }
  };

  const handleClearSeating = () => {
    if (confirm('Segur que vols buidar tota la taula?')) {
      setSeating({});
    }
  };

  const handleAddCustomGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGuestName.trim()) return;
    const name = customGuestName.trim();
    if (!seatedNames.includes(name)) {
      setSelectedAttendee(name);
    }
    setCustomGuestName('');
  };

  const getInitials = (fullName: string): string => {
    if (!fullName) return '';
    
    // Nuvis
    if (fullName.includes('(Nuvi)')) {
      const clean = fullName.replace('(Nuvi)', '').trim();
      const parts = clean.split(/\s+/).filter(Boolean);
      return parts.map(p => p[0].toUpperCase()).join('.') + '. 👑';
    }
    if (fullName.includes('(Núvia)')) {
      const clean = fullName.replace('(Núvia)', '').trim();
      const parts = clean.split(/\s+/).filter(Boolean);
      return parts.map(p => p[0].toUpperCase()).join('.') + '. 👑';
    }

    // Acompanyants
    if (fullName.includes('(Acomp.')) {
      const match = fullName.match(/\(Acomp\.\s*(\d+)\)/);
      const num = match ? match[1] : '1';
      const clean = fullName.replace(/\(Acomp\..*?\)/, '').trim();
      const parts = clean.split(/\s+/).filter(Boolean);
      const inits = parts.map(p => p[0].toUpperCase()).join('.');
      return `${inits}. (+${num})`;
    }

    // Regular Name and Surnames
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase() + '.';
    }
    return parts.map(p => p[0].toUpperCase()).join('.') + '.';
  };

  if (!authenticated) {
    return (
      <main className="section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)' }}>
        <div className="glass-card text-center" style={{ maxWidth: '440px', width: '100%', padding: '45px 30px' }}>
          <div style={{
            width: '55px',
            height: '55px',
            borderRadius: '50%',
            background: 'rgba(140, 115, 85, 0.12)',
            color: 'var(--primary-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px auto'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>

          <h2 style={{ fontSize: '2.2rem', marginBottom: '8px', color: 'var(--primary-color)' }}>Accés Nuvis</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px' }}>
            Introdueix la teva clau d'accés per consultar la llista de convidats i la distribució de taules
          </p>

          <form onSubmit={handleLogin}>
            <input
              type="password"
              className="input-field"
              placeholder="Introdueix la contrasenya"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
            />
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: '100%', marginBottom: '15px' }}
              disabled={loading}
            >
              {loading ? 'Verificant...' : 'Entrar al Panell'}
            </button>
            {error && <p style={{ color: '#d9534f', marginTop: '10px', fontSize: '0.9rem' }}>{error}</p>}
          </form>

          <div style={{ marginTop: '25px', borderTop: '1px solid rgba(217, 197, 178, 0.4)', paddingTop: '18px' }}>
            <Link href="/" style={{ color: 'var(--primary-color)', fontSize: '0.9rem', textDecoration: 'underline' }}>
              ← Tornar a la Web del Casament
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const attendingGuests = guests.filter(g => g.attending);
  const totalAttending = attendingGuests.length + attendingGuests.reduce((acc, curr) => acc + (curr.companions || 0), 0);
  const totalDeclined = guests.filter(g => !g.attending).length;
  const totalOccupiedSeats = Object.keys(seating).length;

  return (
    <main className="section" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', padding: '40px 16px' }}>
      <div className="container" style={{ maxWidth: '1350px' }}>
        
        {/* Header bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary-color)', fontSize: '0.92rem', marginBottom: '8px', fontWeight: 500 }}>
              ← Tornar a la Web
            </Link>
            <h1 className="section-title" style={{ textAlign: 'left', margin: 0, fontSize: '2.4rem' }}>Panell dels Nuvis</h1>
          </div>

          {/* Tab selector buttons */}
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.9)', padding: '5px', borderRadius: '30px', border: '1px solid rgba(217, 197, 178, 0.6)', boxShadow: '0 4px 15px rgba(140, 115, 85, 0.08)' }}>
            <button
              onClick={() => setActiveTab('guests')}
              style={{
                padding: '10px 22px',
                borderRadius: '25px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: '0.92rem',
                fontWeight: 600,
                transition: 'all 0.3s ease',
                background: activeTab === 'guests' ? 'var(--primary-color)' : 'transparent',
                color: activeTab === 'guests' ? '#fff' : 'var(--text-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Llista de Convidats ({totalAttending})
            </button>

            <button
              onClick={() => setActiveTab('seating')}
              style={{
                padding: '10px 22px',
                borderRadius: '25px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: '0.92rem',
                fontWeight: 600,
                transition: 'all 0.3s ease',
                background: activeTab === 'seating' ? 'var(--primary-color)' : 'transparent',
                color: activeTab === 'seating' ? '#fff' : 'var(--text-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="10" rx="2"></rect>
                <line x1="6" y1="17" x2="6" y2="21"></line>
                <line x1="18" y1="17" x2="18" y2="21"></line>
                <line x1="6" y1="3" x2="6" y2="7"></line>
                <line x1="18" y1="3" x2="18" y2="7"></line>
              </svg>
              Situació de Taules ({totalOccupiedSeats}/50)
            </button>
          </div>
        </div>

        {/* TAB 1: LLISTA DE CONVIDATS */}
        {activeTab === 'guests' && (
          <div>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
              <div style={{ background: 'var(--primary-color)', color: '#fff', padding: '12px 24px', borderRadius: '30px', boxShadow: '0 4px 15px rgba(140, 115, 85, 0.2)' }}>
                <p style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>Total Confirmats: {totalAttending}</p>
              </div>
              <div style={{ background: '#fff', border: '1px solid rgba(217, 197, 178, 0.6)', color: 'var(--text-muted)', padding: '12px 20px', borderRadius: '30px' }}>
                <p style={{ fontSize: '0.95rem', margin: 0 }}>No assisteixen: {totalDeclined}</p>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '25px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(140, 115, 85, 0.3)', color: 'var(--primary-color)', fontFamily: 'var(--font-title)', fontSize: '1.15rem' }}>
                    <th style={{ padding: '16px 12px' }}>Nom i Cognoms</th>
                    <th style={{ padding: '16px 12px' }}>Assistència</th>
                    <th style={{ padding: '16px 12px' }}>Acompanyants</th>
                    <th style={{ padding: '16px 12px' }}>Restriccions / Al·lèrgies</th>
                  </tr>
                </thead>
                <tbody>
                  {guests.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: '35px 15px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        Encara no hi ha convidats registrats.
                      </td>
                    </tr>
                  ) : (
                    guests.map(guest => (
                      <tr key={guest.id} style={{ borderBottom: '1px solid rgba(217, 197, 178, 0.3)', transition: 'background 0.2s ease' }}>
                        <td style={{ padding: '16px 12px', fontWeight: 500 }}>{guest.name}</td>
                        <td style={{ padding: '16px 12px' }}>
                          <span style={{ 
                            background: guest.attending ? 'rgba(76, 175, 80, 0.12)' : 'rgba(244, 67, 54, 0.12)', 
                            color: guest.attending ? '#2e7d32' : '#c62828',
                            border: `1px solid ${guest.attending ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`,
                            padding: '4px 12px', 
                            borderRadius: '20px', 
                            fontSize: '0.85rem', 
                            fontWeight: 600 
                          }}>
                            {guest.attending ? '✓ Sí, assisteix' : '✗ No assisteix'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>
                          {guest.attending ? `+${guest.companions} addicionals` : '0'}
                        </td>
                        <td style={{ padding: '16px 12px', color: guest.dietary ? 'var(--text-color)' : 'var(--text-muted)' }}>
                          {guest.dietary || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: SITUACIÓ DE TAULES (PLÀNOL 50 COMENSALS) */}
        {activeTab === 'seating' && (
          <div>
            {/* Top Toolbar */}
            <div className="glass-card" style={{ padding: '18px 24px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-title)', fontSize: '1.4rem', color: 'var(--primary-color)', fontWeight: 600 }}>
                  Taula Imperial Principal
                </span>
                <span style={{ background: 'rgba(140, 115, 85, 0.12)', color: 'var(--primary-color)', padding: '5px 14px', borderRadius: '20px', fontSize: '0.88rem', fontWeight: 600 }}>
                  {totalOccupiedSeats} / {TOTAL_SEATS} Seients Ocupats ({TOTAL_SEATS - totalOccupiedSeats} lliures)
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                {selectedAttendee && (
                  <div style={{ background: 'var(--accent-gold)', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>Assignant: <strong>{selectedAttendee}</strong></span>
                    <button onClick={() => setSelectedAttendee(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                  </div>
                )}

                <button 
                  onClick={handleAutoAssign} 
                  className="btn-secondary" 
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  title="Omplir seients lliures amb convidats no ubicats"
                >
                  ⚡ Omplir automàtic
                </button>

                <button 
                  onClick={handleClearSeating} 
                  style={{ padding: '8px 16px', fontSize: '0.85rem', background: '#fff', border: '1px solid #d9534f', color: '#d9534f', borderRadius: '20px', cursor: 'pointer' }}
                >
                  Buidar Taula
                </button>

                <button 
                  onClick={handleSaveSeating} 
                  className="btn-primary" 
                  style={{ padding: '10px 22px', fontSize: '0.9rem' }}
                >
                  💾 Desar Plànol
                </button>
                {saveStatus && <span style={{ color: 'var(--primary-color)', fontWeight: 600, fontSize: '0.9rem' }}>{saveStatus}</span>}
              </div>
            </div>

            {/* Instruction banner */}
            <div style={{ background: 'rgba(217, 197, 178, 0.25)', borderLeft: '4px solid var(--accent-gold)', padding: '12px 18px', borderRadius: '8px', marginBottom: '25px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              💡 <strong>Com funciona:</strong> Pots <strong>arrossegar i deixar anar (drag & drop)</strong> qualsevol persona de la llista inferior a la cadira que vulguis, o fer <strong>clic sobre el nom</strong> i després clic sobre la cadira. Pots canviar de lloc els convidats fent clic sobre el seu seient.
            </div>

            {/* Banquet Table Visual Scheme */}
            <div className="glass-card" style={{ padding: '30px 15px', marginBottom: '30px', overflowX: 'auto' }}>
              <div style={{ minWidth: '1150px', padding: '10px 0' }}>
                
                {/* SIDE A (DALT: Seients 1 a 25) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(25, 1fr)', gap: '6px', marginBottom: '14px' }}>
                  {Array.from({ length: 25 }, (_, i) => i + 1).map(seatNum => {
                    const occupant = seating[seatNum];
                    const isNuvi = occupant?.includes('Nuvi') || occupant?.includes('Núvia');
                    const initials = occupant ? getInitials(occupant) : '';

                    return (
                      <div
                        key={seatNum}
                        className="seat-cell"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDropOnSeat(e, seatNum)}
                        onClick={() => handleSeatClick(seatNum)}
                        title={occupant ? `Seient #${seatNum}: ${occupant}` : `Seient #${seatNum} (Lliure)`}
                        style={{
                          background: occupant ? (isNuvi ? 'rgba(197, 160, 89, 0.22)' : 'rgba(255, 255, 255, 0.95)') : 'rgba(255, 255, 255, 0.5)',
                          border: occupant ? (isNuvi ? '2px solid var(--accent-gold)' : '1px solid var(--primary-color)') : '1px dashed rgba(140, 115, 85, 0.4)',
                          borderRadius: '10px',
                          padding: '8px 3px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          position: 'relative',
                          minHeight: '80px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: occupant ? '0 4px 10px rgba(140, 115, 85, 0.1)' : 'none',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {/* Hover Tooltip with Full Name */}
                        {occupant && (
                          <div className="seat-tooltip">
                            <span style={{ color: 'var(--accent-gold)', fontWeight: 600, marginRight: '4px' }}>#{seatNum}</span>
                            <span>{occupant}</span>
                          </div>
                        )}

                        {/* Top: Seat Number + Delete button */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2px' }}>
                          <span style={{ fontSize: '0.68rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>#{seatNum}</span>
                          {occupant && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFromSeat(seatNum);
                              }}
                              style={{ border: 'none', background: 'none', color: '#d9534f', cursor: 'pointer', fontSize: '0.75rem', padding: 0 }}
                              title="Alliberar seient"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {/* Center: Initials or Empty */}
                        {occupant ? (
                          <div style={{ margin: '2px 0' }}>
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '2px 4px',
                              borderRadius: '6px',
                              background: isNuvi ? 'rgba(197, 160, 89, 0.3)' : 'rgba(140, 115, 85, 0.1)',
                              color: isNuvi ? '#735118' : 'var(--primary-color)',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              fontFamily: 'var(--font-body)',
                              letterSpacing: '0.5px'
                            }}>
                              {initials}
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.65rem', color: 'rgba(140, 115, 85, 0.45)', margin: 'auto 0' }}>
                            Lliure
                          </span>
                        )}

                        <div style={{ width: '12px', height: '3px', background: 'var(--primary-light)', borderRadius: '2px', margin: '0 auto' }}></div>
                      </div>
                    );
                  })}
                </div>

                {/* THE RECTANGULAR TABLE CENTER */}
                <div style={{
                  background: 'linear-gradient(180deg, #d8c3ad 0%, #c4ab92 50%, #b89c81 100%)',
                  borderRadius: '12px',
                  padding: '14px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 8px 25px rgba(140, 115, 85, 0.2), inset 0 0 15px rgba(0,0,0,0.08)',
                  margin: '10px 0',
                  color: '#fff'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>
                    🌿 Espai Floral
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-title)', fontSize: '1.3rem', letterSpacing: '2px', textTransform: 'uppercase', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                      MESA IMPERIAL · BANQUET DE CASAMENT (50 PAX)
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>
                    🕯️ Candelabres
                  </div>
                </div>

                {/* SIDE B (BAIX: Seients 26 a 50) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(25, 1fr)', gap: '6px', marginTop: '14px' }}>
                  {Array.from({ length: 25 }, (_, i) => i + 26).map(seatNum => {
                    const occupant = seating[seatNum];
                    const isNuvi = occupant?.includes('Nuvi') || occupant?.includes('Núvia');
                    const initials = occupant ? getInitials(occupant) : '';

                    return (
                      <div
                        key={seatNum}
                        className="seat-cell"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDropOnSeat(e, seatNum)}
                        onClick={() => handleSeatClick(seatNum)}
                        title={occupant ? `Seient #${seatNum}: ${occupant}` : `Seient #${seatNum} (Lliure)`}
                        style={{
                          background: occupant ? (isNuvi ? 'rgba(197, 160, 89, 0.22)' : 'rgba(255, 255, 255, 0.95)') : 'rgba(255, 255, 255, 0.5)',
                          border: occupant ? (isNuvi ? '2px solid var(--accent-gold)' : '1px solid var(--primary-color)') : '1px dashed rgba(140, 115, 85, 0.4)',
                          borderRadius: '10px',
                          padding: '8px 3px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          position: 'relative',
                          minHeight: '80px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: occupant ? '0 4px 10px rgba(140, 115, 85, 0.1)' : 'none',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {/* Hover Tooltip with Full Name */}
                        {occupant && (
                          <div className="seat-tooltip">
                            <span style={{ color: 'var(--accent-gold)', fontWeight: 600, marginRight: '4px' }}>#{seatNum}</span>
                            <span>{occupant}</span>
                          </div>
                        )}

                        <div style={{ width: '12px', height: '3px', background: 'var(--primary-light)', borderRadius: '2px', margin: '0 auto' }}></div>

                        {/* Center: Initials or Empty */}
                        {occupant ? (
                          <div style={{ margin: '2px 0' }}>
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '2px 4px',
                              borderRadius: '6px',
                              background: isNuvi ? 'rgba(197, 160, 89, 0.3)' : 'rgba(140, 115, 85, 0.1)',
                              color: isNuvi ? '#735118' : 'var(--primary-color)',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              fontFamily: 'var(--font-body)',
                              letterSpacing: '0.5px'
                            }}>
                              {initials}
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.65rem', color: 'rgba(140, 115, 85, 0.45)', margin: 'auto 0' }}>
                            Lliure
                          </span>
                        )}

                        {/* Bottom: Seat Number + Delete button */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2px' }}>
                          <span style={{ fontSize: '0.68rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>#{seatNum}</span>
                          {occupant && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFromSeat(seatNum);
                              }}
                              style={{ border: 'none', background: 'none', color: '#d9534f', cursor: 'pointer', fontSize: '0.75rem', padding: 0 }}
                              title="Alliberar seient"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>

            {/* UNASSIGNED GUESTS TRAY */}
            <div className="glass-card" style={{ padding: '25px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', color: 'var(--primary-color)', margin: 0 }}>
                    Convidats pendents d'ubicar ({unseatedAttendees.length})
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
                    Fes clic o arrossega qualsevol convidat per assignar-li un seient
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {/* Search filter */}
                  <input
                    type="text"
                    placeholder="Filtrar per nom..."
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '20px',
                      border: '1px solid rgba(217, 197, 178, 0.6)',
                      fontSize: '0.88rem',
                      outline: 'none',
                      background: '#fff'
                    }}
                  />

                  {/* Add manual guest */}
                  <form onSubmit={handleAddCustomGuest} style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      placeholder="Afegir nom extra..."
                      value={customGuestName}
                      onChange={(e) => setCustomGuestName(e.target.value)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '20px',
                        border: '1px solid rgba(217, 197, 178, 0.6)',
                        fontSize: '0.88rem',
                        outline: 'none',
                        background: '#fff'
                      }}
                    />
                    <button type="submit" className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                      + Afegir
                    </button>
                  </form>
                </div>
              </div>

              {/* Chips container */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', minHeight: '60px', padding: '10px', background: 'rgba(252, 251, 249, 0.6)', borderRadius: '12px', border: '1px solid rgba(217, 197, 178, 0.4)' }}>
                {unseatedAttendees.length === 0 ? (
                  <p style={{ color: '#2e7d32', margin: 'auto', fontWeight: 600, fontSize: '0.95rem' }}>
                    🎉 Tots els convidats han estat ubicats a la taula!
                  </p>
                ) : (
                  unseatedAttendees
                    .filter(a => a.name.toLowerCase().includes(filterSearch.toLowerCase()))
                    .map(attendee => {
                      const isSelected = selectedAttendee === attendee.name;
                      const isNuvi = attendee.name.includes('Nuvi') || attendee.name.includes('Núvia');
                      return (
                        <div
                          key={attendee.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, attendee.name)}
                          onClick={() => setSelectedAttendee(isSelected ? null : attendee.name)}
                          style={{
                            background: isSelected ? 'var(--primary-color)' : (isNuvi ? 'rgba(197, 160, 89, 0.2)' : '#fff'),
                            color: isSelected ? '#fff' : 'var(--text-color)',
                            border: isSelected ? '1px solid var(--primary-color)' : (isNuvi ? '1px solid var(--accent-gold)' : '1px solid rgba(217, 197, 178, 0.8)'),
                            padding: '8px 16px',
                            borderRadius: '20px',
                            cursor: 'grab',
                            fontSize: '0.88rem',
                            fontWeight: isNuvi ? 700 : 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                            transition: 'all 0.2s ease',
                            userSelect: 'none'
                          }}
                        >
                          <span>{attendee.name}</span>
                          {attendee.dietary && (
                            <span style={{ fontSize: '0.72rem', background: isSelected ? 'rgba(255,255,255,0.25)' : 'rgba(244, 67, 54, 0.15)', color: isSelected ? '#fff' : '#c62828', padding: '2px 6px', borderRadius: '10px' }} title={`Restricció: ${attendee.dietary}`}>
                              ⚠️ Menú
                            </span>
                          )}
                        </div>
                      );
                    })
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}
