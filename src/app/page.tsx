"use client";

import { useState, useEffect } from 'react';

interface CompanionDetail {
  name: string;
  isChild: boolean;
  mainCourse: string;
}

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    attending: 'yes',
    companions: 0,
    mainCourse: 'Carn',
    dietary: ''
  });
  const [companionDetails, setCompanionDetails] = useState<CompanionDetail[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [dietaryOther, setDietaryOther] = useState('');
  const [status, setStatus] = useState('');
  const [copiedIban, setCopiedIban] = useState(false);

  const handleCompanionsChange = (count: number) => {
    const safeCount = Math.max(0, Math.min(10, count));
    setFormData(prev => ({ ...prev, companions: safeCount }));
    setCompanionDetails(prev => {
      const updated: CompanionDetail[] = [];
      for (let i = 0; i < safeCount; i++) {
        if (prev[i]) {
          updated.push(prev[i]);
        } else {
          updated.push({ name: '', isChild: false, mainCourse: 'Carn' });
        }
      }
      return updated;
    });
  };

  const handleUpdateCompanion = (index: number, field: keyof CompanionDetail, value: any) => {
    setCompanionDetails(prev => {
      const updated = [...prev];
      if (field === 'isChild' && value === true) {
        updated[index] = { ...updated[index], isChild: true, mainCourse: 'Menú Infantil' };
      } else if (field === 'isChild' && value === false) {
        updated[index] = { ...updated[index], isChild: false, mainCourse: 'Carn' };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const DIETARY_OPTIONS = [
    { id: 'celiac', label: 'Sense Gluten / Celíac' },
    { id: 'lactose', label: 'Intolerància a la Lactosa' },
    { id: 'vegetarian', label: 'Menú Vegetarià' },
    { id: 'vegan', label: 'Menú Vegà' },
    { id: 'nuts', label: 'Al·lèrgia a la Fruita Seca' },
    { id: 'seafood', label: 'Al·lèrgia al Marisc / Peix' },
    { id: 'none', label: 'Cap (Menú Estàndard)' },
  ];

  const handleToggleDietary = (label: string, id: string) => {
    if (id === 'none') {
      setSelectedDietary(['Cap (Menú Estàndard)']);
      return;
    }
    
    let updated = selectedDietary.filter(item => item !== 'Cap (Menú Estàndard)');
    if (updated.includes(label)) {
      updated = updated.filter(item => item !== label);
    } else {
      updated.push(label);
    }
    setSelectedDietary(updated);
  };

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Data i hora objectiu de la cerimònia (Tarda-Nit): 11 de Juny de 2027 a les 18:00h
    const targetDate = new Date('2027-06-11T18:00:00');

    const updateCountdown = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyIban = (iban: string) => {
    navigator.clipboard.writeText(iban);
    setCopiedIban(true);
    setTimeout(() => setCopiedIban(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    const compiledDietary = formData.attending === 'yes'
      ? (dietaryOther.trim() || 'Cap')
      : '';

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          attending: formData.attending === 'yes',
          companions: parseInt(formData.companions.toString(), 10) || 0,
          companionDetails: formData.attending === 'yes' ? companionDetails : [],
          mainCourse: formData.mainCourse || 'Carn',
          dietary: compiledDietary
        })
      });
      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <main>
      {/* Hero Section */}
      <section 
        className="section text-center animate-fade-in" 
        style={{ 
          minHeight: '94vh', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          alignItems: 'center',
          backgroundImage: 'linear-gradient(180deg, rgba(250, 248, 245, 0.4) 0%, rgba(250, 248, 245, 0.85) 100%), url("/bg.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          padding: '50px 20px'
        }}
      >
        {/* Monogram Crest */}
        <div className="hero-crest">
          <span className="hero-crest-text">B&M</span>
        </div>

        <p style={{
          fontSize: '0.85rem',
          letterSpacing: '5px',
          textTransform: 'uppercase',
          color: 'var(--accent-gold)',
          fontWeight: 600,
          marginBottom: '10px'
        }}>
          Celebrem l'Amor
        </p>

        <h1 style={{ 
          fontSize: 'clamp(3.4rem, 8vw, 6.2rem)', 
          margin: '0 0 10px 0', 
          color: 'var(--primary-color)',
          fontWeight: 400,
          fontFamily: 'var(--font-serif)',
          lineHeight: 1.1,
          letterSpacing: '1px'
        }}>
          Benjami <span style={{ fontFamily: 'var(--font-script)', fontSize: 'clamp(2.5rem, 6vw, 4.8rem)', color: 'var(--accent-gold)', margin: '0 4px' }}>&</span> Maria
        </h1>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '15px',
          margin: '12px 0 25px 0'
        }}>
          <span style={{ width: '45px', height: '1px', background: 'var(--accent-gold)' }}></span>
          <p style={{ 
            fontSize: '1.25rem', 
            fontFamily: 'var(--font-cinzel)', 
            color: 'var(--text-muted)',
            letterSpacing: '2px',
            margin: 0
          }}>
            11 · JUNY · 2027
          </p>
          <span style={{ width: '45px', height: '1px', background: 'var(--accent-gold)' }}></span>
        </div>

        <p style={{
          fontSize: '1.05rem',
          color: 'var(--primary-dark)',
          letterSpacing: '1px',
          marginBottom: '28px',
          fontWeight: 500
        }}>
          Hotel Villa Retiro · Xerta, Tarragona
        </p>

        {/* Countdown */}
        <div className="countdown-container">
          <div className="countdown-box">
            <span className="countdown-number">{timeLeft.days}</span>
            <span className="countdown-label">Dies</span>
          </div>
          <span className="countdown-separator">:</span>
          <div className="countdown-box">
            <span className="countdown-number">{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="countdown-label">Hores</span>
          </div>
          <span className="countdown-separator">:</span>
          <div className="countdown-box">
            <span className="countdown-number">{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="countdown-label">Minuts</span>
          </div>
          <span className="countdown-separator">:</span>
          <div className="countdown-box">
            <span className="countdown-number">{String(timeLeft.seconds).padStart(2, '0')}</span>
            <span className="countdown-label">Segons</span>
          </div>
        </div>

        <a 
          href="#formulari" 
          className="btn-primary"
          style={{ marginTop: '5px' }}
        >
          Confirmar Assistència
        </a>
      </section>

      {/* Professional Horizontal Menu */}
      <nav className="navbar-wrapper">
        <div className="navbar-container">
          <ul className="nav-links">
            <li>
              <a href="#historia" className="nav-link-item">
                La Nostra Història
              </a>
            </li>
            <li>
              <a href="#ubicacio" className="nav-link-item">
                On i Quan
              </a>
            </li>
            <li>
              <a href="#planning" className="nav-link-item">
                El Gran Dia
              </a>
            </li>
            <li>
              <a href="#detalls" className="nav-link-item">
                Detalls
              </a>
            </li>
            <li>
              <a href="#formulari" className="nav-link-item">
                Formulari
              </a>
            </li>
            <li>
              <a href="/admin" className="nav-link-item nav-link-admin" title="Accés privat per a la parella">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                Accés Nuvis
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* White spacer */}
      <div className="section-spacer" />

      {/* History Section with Blurred BenjaMaria.jpg background & photo frame */}
      <section id="historia" className="section blurred-section-bg">
        {/* Blurred background image layer */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url("/BenjaMaria.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(22px) brightness(0.96)',
            transform: 'scale(1.1)',
            zIndex: 0
          }}
        />
        {/* Soft overlay gradient */}
        <div className="blurred-section-overlay" />

        <div className="container section-content-relative">
          <p className="text-center" style={{ fontSize: '0.85rem', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: 600, marginBottom: '6px' }}>
            El Nostre Viatge
          </p>
          <h2 className="section-title">La Nostra Història</h2>

          <div className="glass-card" style={{ maxWidth: '960px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'center' }}>
              
              {/* Left: Fine Art Photo Frame */}
              <div className="text-center">
                <div className="fine-art-photo-wrap" style={{ maxWidth: '380px' }}>
                  <div 
                    className="photo-ambient-blur" 
                    style={{ backgroundImage: 'url("/BenjaMaria.jpg")' }}
                  />
                  <img 
                    src="/BenjaMaria.jpg" 
                    alt="Benjamí i Maria a París" 
                    className="fine-art-photo"
                    style={{ width: '100%', maxHeight: '440px', objectFit: 'cover' }}
                  />
                </div>
              </div>

              {/* Right: Narrative Story */}
              <div>
                <span style={{ 
                  fontFamily: 'var(--font-script)', 
                  fontSize: '2.5rem', 
                  color: 'var(--accent-gold)',
                  display: 'block',
                  lineHeight: 1,
                  marginBottom: '10px'
                }}>
                  París, ciutat de l'amor
                </span>

                <h3 style={{ 
                  fontSize: '2.3rem', 
                  color: 'var(--primary-color)', 
                  marginBottom: '16px',
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 500,
                  lineHeight: 1.2
                }}>
                  Ens vam dir "Sí" a París
                </h3>

                <p style={{ 
                  fontSize: '1.08rem', 
                  color: 'var(--text-color)', 
                  marginBottom: '16px',
                  lineHeight: '1.8' 
                }}>
                  Hi ha moments que canvien el destí per sempre. Sota la màgia dels carrers de París i la llum dels seus capvespres, vam decidir que el millor viatge de tots és el que recorrerem junts.
                </p>

                <p style={{ 
                  fontSize: '1.02rem', 
                  color: 'var(--text-muted)', 
                  marginBottom: '26px',
                  lineHeight: '1.8' 
                }}>
                  Aquest 11 de juny celebrem la nostra promesa, envoltats de les persones que han format part de la nostra vida i que fan que aquest dia sigui immensament especial.
                </p>

                {/* Milestone Chips */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ background: 'rgba(197, 155, 78, 0.12)', border: '1px solid rgba(197, 155, 78, 0.3)', color: 'var(--primary-dark)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600 }}>
                    La primera mirada
                  </span>
                  <span style={{ background: 'rgba(197, 155, 78, 0.12)', border: '1px solid rgba(197, 155, 78, 0.3)', color: 'var(--primary-dark)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600 }}>
                    La promesa a París
                  </span>
                  <span style={{ background: 'rgba(197, 155, 78, 0.12)', border: '1px solid rgba(197, 155, 78, 0.3)', color: 'var(--primary-dark)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600 }}>
                    El Gran Dia
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* White spacer */}
      <div className="section-spacer" />

      {/* Location Section with Blurred entrada-villa-retiro.jpg background & photo frame */}
      <section id="ubicacio" className="section blurred-section-bg">
        {/* Blurred background image layer */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url("/entrada-villa-retiro.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(22px) brightness(0.96)',
            transform: 'scale(1.1)',
            zIndex: 0
          }}
        />
        {/* Soft overlay gradient */}
        <div className="blurred-section-overlay" />

        <div className="container section-content-relative">
          <p className="text-center" style={{ fontSize: '0.85rem', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: 600, marginBottom: '6px' }}>
            El Lloc del Somni
          </p>
          <h2 className="section-title">On i Quan</h2>

          <div className="glass-card" style={{ maxWidth: '960px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'center' }}>
              
              {/* Left: Venue fine art photo */}
              <div className="text-center">
                <div className="fine-art-photo-wrap" style={{ maxWidth: '420px' }}>
                  <div 
                    className="photo-ambient-blur" 
                    style={{ backgroundImage: 'url("/entrada-villa-retiro.jpg")' }}
                  />
                  <img 
                    src="/entrada-villa-retiro.jpg" 
                    alt="Entrada de Villa Retiro" 
                    className="fine-art-photo"
                    style={{ width: '100%', maxHeight: '350px', objectFit: 'cover' }}
                  />
                </div>
              </div>

              {/* Right: Venue description & info */}
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(197, 155, 78, 0.15)', color: 'var(--accent-gold-dark)', padding: '5px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Relais & Châteaux · 5 Estrelles
                </div>

                <h3 style={{ 
                  fontSize: '2.5rem', 
                  color: 'var(--primary-color)', 
                  marginBottom: '8px',
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 500
                }}>
                  Hotel Villa Retiro
                </h3>

                <p style={{ fontSize: '1.05rem', color: 'var(--text-color)', marginBottom: '8px', fontWeight: 500 }}>
                  Carrer Camí dels Molins, 2 · 43592 Xerta, Tarragona
                </p>

                <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', marginBottom: '22px' }}>
                  La cerimònia començarà a les <strong>18:00h</strong> als jardins botànics de la finca amb la màgia del capvespre. Us preguem arribar amb 15 minuts d'antelació per acomodar-vos amb tranquil·litat.
                </p>

                {/* Practical Guest Badges */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '25px' }}>
                  <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(197, 155, 78, 0.25)', fontSize: '0.85rem' }}>
                    <strong>Pàrquing:</strong> Privat i gratuït dins del recinte.
                  </div>
                  <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(197, 155, 78, 0.25)', fontSize: '0.85rem' }}>
                    <strong>Allotjament:</strong> Disponibilitat a l'hotel i a Xerta.
                  </div>
                </div>

                {/* CTAs Horizontally Aligned */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', alignItems: 'center' }}>
                  <a 
                    href="https://www.google.com/maps?rlz=1C1VDKB_esES975ES975&gs_lcrp=EgZjaHJvbWUqCggAEAAY4wIYgAQyCggAEAAY4wIYgAQyEwgBEC4YrwEYxwEYgAQYmAUYmQUyCAgCEAAYFhge0gEIMjEyNGowajeoAgCwAgA&um=1&ie=UTF-8&fb=1&gl=es&sa=X&geocode=KSunN9D45qASMWvNPrQk312g&daddr=Carrer+Cami+dels+Molins,+2,+43592+Xerta,+Tarragona" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-secondary"
                    style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '8px', 
                      padding: '12px 18px', 
                      fontSize: '0.92rem',
                      textAlign: 'center',
                      width: '100%',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    Obrir a Google Maps
                  </a>

                  <a 
                    href="https://hotelvillaretiro.com/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-secondary"
                    style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '8px', 
                      padding: '12px 18px', 
                      fontSize: '0.92rem',
                      textAlign: 'center',
                      width: '100%',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="2" y1="12" x2="22" y2="12"/>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                    Web de Villa Retiro
                  </a>
                </div>

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* White spacer */}
      <div className="section-spacer" />

      {/* Planning Section with Blurred Garden Background */}
      <section id="planning" className="section blurred-section-bg">
        {/* Blurred background image layer */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url("/jardin.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(22px) brightness(0.96)',
            transform: 'scale(1.1)',
            zIndex: 0
          }}
        />
        {/* Soft overlay gradient */}
        <div className="blurred-section-overlay" />

        <div className="container section-content-relative">
          <p className="text-center" style={{ fontSize: '0.85rem', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: 600, marginBottom: '6px' }}>
            Itinerari del Casament · Tarda & Nit
          </p>
          <h2 className="section-title">El Gran Dia</h2>
          
          <div className="glass-card" style={{ maxWidth: '820px', margin: '0 auto' }}>
            <div style={{ position: 'relative', paddingLeft: '40px', borderLeft: '2px solid rgba(197, 155, 78, 0.35)' }}>
              
              {/* Event 1 */}
              <div style={{ marginBottom: '45px', position: 'relative' }}>
                <div className="timeline-node" />
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.88rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: 700, fontFamily: 'var(--font-cinzel)' }}>
                    18:00h
                  </span>
                  <span style={{ background: 'rgba(197, 155, 78, 0.15)', color: 'var(--primary-dark)', padding: '2px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 600 }}>
                    Jardins de la Finca
                  </span>
                </div>
                <h3 style={{ fontSize: '1.75rem', margin: '0 0 8px 0', color: 'var(--primary-color)', fontFamily: 'var(--font-serif)' }}>
                  La Cerimònia Civil
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.02rem', margin: 0, lineHeight: 1.7 }}>
                  El moment més màgic. Donarem el "Sí, vull" amb la llum daurada del capvespre sota els arbres centenaris de Villa Retiro.
                </p>
              </div>

              {/* Event 2 */}
              <div style={{ marginBottom: '45px', position: 'relative' }}>
                <div className="timeline-node" />
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.88rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: 700, fontFamily: 'var(--font-cinzel)' }}>
                    19:15h
                  </span>
                  <span style={{ background: 'rgba(197, 155, 78, 0.15)', color: 'var(--primary-dark)', padding: '2px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 600 }}>
                    Terrassa & Jardins
                  </span>
                </div>
                <h3 style={{ fontSize: '1.75rem', margin: '0 0 8px 0', color: 'var(--primary-color)', fontFamily: 'var(--font-serif)' }}>
                  Còctel al Capvespre & Aperitius
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.02rem', margin: 0, lineHeight: 1.7 }}>
                  Música en viu, copes de benvinguda i una selecció gastronòmica exquisida per començar a brindar mentre cau el sol.
                </p>
              </div>

              {/* Event 3 */}
              <div style={{ marginBottom: '45px', position: 'relative' }}>
                <div className="timeline-node" />
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.88rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: 700, fontFamily: 'var(--font-cinzel)' }}>
                    21:00h
                  </span>
                  <span style={{ background: 'rgba(197, 155, 78, 0.15)', color: 'var(--primary-dark)', padding: '2px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 600 }}>
                    Saló Noble & Espelmes
                  </span>
                </div>
                <h3 style={{ fontSize: '1.75rem', margin: '0 0 8px 0', color: 'var(--primary-color)', fontFamily: 'var(--font-serif)' }}>
                  Sopar de Gala Nupcial
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.02rem', margin: 0, lineHeight: 1.7 }}>
                  Una vetllada gastronòmica inoblidable d'alta cuina, acompanyada d'una cuidada selecció de vins i discursos emotius.
                </p>
              </div>

              {/* Event 4 */}
              <div style={{ position: 'relative' }}>
                <div className="timeline-node" />
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.88rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: 700, fontFamily: 'var(--font-cinzel)' }}>
                    23:30h
                  </span>
                  <span style={{ background: 'rgba(197, 155, 78, 0.15)', color: 'var(--primary-dark)', padding: '2px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 600 }}>
                    Pista de Ball Nocturna
                  </span>
                </div>
                <h3 style={{ fontSize: '1.75rem', margin: '0 0 8px 0', color: 'var(--primary-color)', fontFamily: 'var(--font-serif)' }}>
                  Ball Nupcial, Festa & Barra Lliure
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.02rem', margin: 0, lineHeight: 1.7 }}>
                  Primer ball dels nuvis sota les llums de festa! DJ en directe, barra lliure de copes i còctels, photocall i ball fins a la matinada.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* White spacer */}
      <div className="section-spacer" />

      {/* Section: Detalls Importants (Guest Guide) */}
      <section id="detalls" className="section" style={{ backgroundColor: 'var(--bg-color)' }}>
        <div className="container">
          <p className="text-center" style={{ fontSize: '0.85rem', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: 600, marginBottom: '6px' }}>
            Guia per als Convidats
          </p>
          <h2 className="section-title">Detalls Importants</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', maxWidth: '1000px', margin: '0 auto' }}>
            
            {/* Card 1: Dress Code */}
            <div className="glass-card-sm text-center">
              <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(197, 155, 78, 0.12)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--primary-color)', marginBottom: '10px' }}>Codi de Vestimenta</h3>
              <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                Elegància de Tarda-Nit / Cocktail
              </p>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                En ser un casament de tarda-nit, recomanem vestits elegants llargs o midi, i tratges foscos o de gala. <em>(Si us plau, reserveu el color blanc per a la núvia)</em>.
              </p>
            </div>

            {/* Card 2: Regals & Viatge */}
            <div className="glass-card-sm text-center">
              <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(197, 155, 78, 0.12)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 12 20 22 4 22 4 12"></polyline>
                  <rect x="2" y="7" width="20" height="5"></rect>
                  <line x1="12" y1="22" x2="12" y2="7"></line>
                  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
                  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--primary-color)', marginBottom: '10px' }}>Llista de Casament</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.6 }}>
                El millor regal és compartir aquest dia amb vosaltres. Si voleu col·laborar amb el nostre viatge de noces, us deixem el nostre número de compte:
              </p>
              <button 
                onClick={() => handleCopyIban('ES76 0049 1500 0512 3456 7890')}
                className="copy-pill-btn"
                title="Fes clic per copiar l'IBAN"
              >
                <span>ES76 ···· 7890</span>
                <span>{copiedIban ? '✓ Copiat!' : 'Copiar'}</span>
              </button>
            </div>

            {/* Card 3: Xarxes i Fotos */}
            <div className="glass-card-sm text-center">
              <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(197, 155, 78, 0.12)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--primary-color)', marginBottom: '10px' }}>Fotos & Moments</h3>
              <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--accent-gold)', letterSpacing: '1px', marginBottom: '8px' }}>
                #BenjaiMaria2027
              </p>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                Etiqueteu les vostres fotos i vídeos a Instagram amb el nostre hashtag per crear junts el millor àlbum de records!
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* White spacer */}
      <div className="section-spacer" />

      {/* Formulari Section */}
      <section id="formulari" className="section" style={{ backgroundColor: '#ffffff' }}>
        <div className="container">
          <p className="text-center" style={{ fontSize: '0.85rem', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: 600, marginBottom: '6px' }}>
            T'esperem amb Il·lusió
          </p>
          <h2 className="section-title">Confirmar Assistència</h2>
          
          <div className="glass-card" style={{ maxWidth: '660px', margin: '0 auto', background: '#fdfcf9', border: '1px solid rgba(197, 155, 78, 0.35)' }}>
            
            <p className="text-center" style={{ color: 'var(--text-muted)', fontSize: '0.98rem', marginBottom: '28px' }}>
              Preguem confirmar la teva assistència abans de l'<strong>1 de Maig de 2027</strong> per facilitar l'organització del banquet.
            </p>

            {status === 'success' ? (
              <div className="text-center" style={{ padding: '40px 10px' }}>
                <div style={{
                  width: '65px',
                  height: '65px',
                  borderRadius: '50%',
                  background: 'rgba(197, 155, 78, 0.15)',
                  color: 'var(--primary-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px auto',
                  fontSize: '2rem'
                }}>
                  ✓
                </div>
                <h3 style={{ color: 'var(--primary-color)', fontSize: '2.4rem', marginBottom: '12px', fontFamily: 'var(--font-serif)' }}>
                  Gràcies per confirmar!
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                  Hem registrat la teva resposta correctament. Ens fa una il·lusió immensa viure aquest dia junts!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <label className="form-label">Nom i Cognoms *</label>
                <input 
                  type="text" 
                  required 
                  className="input-field" 
                  placeholder="Ex. Joan Pérez Garcia"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />

                <label className="form-label">Assistiràs al casament? *</label>
                <select 
                  className="input-field"
                  value={formData.attending}
                  onChange={(e) => setFormData({...formData, attending: e.target.value})}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="yes">Sí, confirmaré l'assistència</option>
                  <option value="no">No podré assistir</option>
                </select>

                {formData.attending === 'yes' && (
                  <>
                    <label className="form-label">Número d'acompanyants (addicionals a tu)</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="10"
                      className="input-field" 
                      value={formData.companions}
                      onChange={(e) => handleCompanionsChange(parseInt(e.target.value, 10) || 0)}
                    />

                    {/* Unfolded Companion Details List */}
                    {formData.companions > 0 && (
                      <div className="companion-cards-container">
                        <p style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--primary-color)', margin: '4px 0 2px 0' }}>
                          Detall dels acompanyants:
                        </p>
                        {companionDetails.map((comp, idx) => (
                          <div key={idx} className="companion-detail-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--primary-color)' }}>
                                Acompanyant #{idx + 1}
                              </span>

                              {/* Two Radio Buttons: Adult vs Nen / Infant */}
                              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'rgba(197, 155, 78, 0.08)', padding: '4px 12px', borderRadius: '15px', border: '1px solid rgba(197, 155, 78, 0.25)' }}>
                                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.84rem', cursor: 'pointer', fontWeight: 500 }}>
                                  <input 
                                    type="radio"
                                    name={`comp-type-${idx}`}
                                    checked={!comp.isChild}
                                    onChange={() => handleUpdateCompanion(idx, 'isChild', false)}
                                    style={{ accentColor: 'var(--primary-color)', cursor: 'pointer' }}
                                  />
                                  <span>Adult</span>
                                </label>
                                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.84rem', cursor: 'pointer', fontWeight: 500 }}>
                                  <input 
                                    type="radio"
                                    name={`comp-type-${idx}`}
                                    checked={comp.isChild}
                                    onChange={() => handleUpdateCompanion(idx, 'isChild', true)}
                                    style={{ accentColor: 'var(--primary-color)', cursor: 'pointer' }}
                                  />
                                  <span>Nen / Infant</span>
                                </label>
                              </div>
                            </div>

                            {/* Text field for companion name */}
                            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                              Nom i cognoms de l'acompanyant:
                            </label>
                            <input 
                              type="text"
                              className="input-field"
                              style={{ marginBottom: '10px', fontSize: '0.9rem' }}
                              placeholder={`Ex. Nom de l'acompanyant #${idx + 1}`}
                              value={comp.name}
                              onChange={(e) => handleUpdateCompanion(idx, 'name', e.target.value)}
                            />

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', paddingTop: '4px', borderTop: '1px dashed rgba(197, 155, 78, 0.2)' }}>
                              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Plat:</span>
                              <div className="companion-dish-select">
                                {comp.isChild ? (
                                  <span style={{ fontSize: '0.82rem', color: 'var(--accent-gold-dark)', fontWeight: 600, background: 'rgba(197, 155, 78, 0.15)', padding: '3px 10px', borderRadius: '12px' }}>
                                    Menú Infantil
                                  </span>
                                ) : (
                                  <>
                                    <label className="companion-dish-option">
                                      <input 
                                        type="radio"
                                        name={`comp-dish-${idx}`}
                                        value="Carn"
                                        checked={comp.mainCourse === 'Carn'}
                                        onChange={() => handleUpdateCompanion(idx, 'mainCourse', 'Carn')}
                                      />
                                      <span>Carn</span>
                                    </label>
                                    <label className="companion-dish-option">
                                      <input 
                                        type="radio"
                                        name={`comp-dish-${idx}`}
                                        value="Peix"
                                        checked={comp.mainCourse === 'Peix'}
                                        onChange={() => handleUpdateCompanion(idx, 'mainCourse', 'Peix')}
                                      />
                                      <span>Peix</span>
                                    </label>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Main Course Selector (Carn o Peix) */}
                    <label className="form-label" style={{ marginTop: '10px' }}>
                      Plat Principal *
                    </label>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                      Tria la teva opció de segon plat per al banquet:
                    </p>
                    <div className="dish-selector-grid">
                      <label className={`dish-option-card ${formData.mainCourse === 'Carn' ? 'selected' : ''}`}>
                        <input 
                          type="radio" 
                          name="mainCourse" 
                          value="Carn" 
                          checked={formData.mainCourse === 'Carn'} 
                          onChange={() => setFormData({...formData, mainCourse: 'Carn'})}
                          className="dish-radio-native"
                        />
                        <span>Opció Carn</span>
                      </label>

                      <label className={`dish-option-card ${formData.mainCourse === 'Peix' ? 'selected' : ''}`}>
                        <input 
                          type="radio" 
                          name="mainCourse" 
                          value="Peix" 
                          checked={formData.mainCourse === 'Peix'} 
                          onChange={() => setFormData({...formData, mainCourse: 'Peix'})}
                          className="dish-radio-native"
                        />
                        <span>Opció Peix</span>
                      </label>
                    </div>

                    <label className="form-label" style={{ marginTop: '16px' }}>
                      Al·lèrgies, intoleràncies o observacions dietètiques (opcional)
                    </label>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                      Indica si tu o algun dels teus acompanyants té alguna al·lèrgia, celiaquia, intolerància o requereix menú especial:
                    </p>
                    <textarea 
                      className="input-field"
                      placeholder="Ex. Celíac (sense gluten), intolerant a la lactosa, vegetarià, al·lèrgia a la fruita seca..."
                      value={dietaryOther}
                      onChange={(e) => setDietaryOther(e.target.value)}
                      rows={3}
                      style={{ 
                        width: '100%', 
                        padding: '12px 14px', 
                        borderRadius: '10px', 
                        border: '1px solid rgba(197, 155, 78, 0.35)', 
                        fontFamily: 'var(--font-body)', 
                        fontSize: '0.92rem',
                        resize: 'vertical',
                        background: '#ffffff'
                      }}
                    />
                  </>
                )}

                <div className="text-center mt-4">
                  <button type="submit" className="btn-primary" style={{ width: '100%', maxWidth: '340px' }} disabled={status === 'loading'}>
                    {status === 'loading' ? 'Enviant confirmació...' : 'Enviar Confirmació'}
                  </button>
                  {status === 'error' && (
                    <p style={{ color: '#d9534f', marginTop: '14px', fontSize: '0.95rem' }}>
                      Hi ha hagut un error en enviar la confirmació. Si us plau, torna-ho a provar.
                    </p>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* White spacer */}
      <div className="section-spacer" />

      {/* Footer */}
      <footer style={{ 
        backgroundColor: 'var(--primary-dark)', 
        color: '#ffffff', 
        textAlign: 'center', 
        padding: '55px 20px 45px 20px',
        borderTop: '1px solid rgba(197, 155, 78, 0.3)',
        position: 'relative'
      }}>
        <div className="hero-crest" style={{ width: '60px', height: '60px', margin: '0 auto 15px auto', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(197, 155, 78, 0.6)' }}>
          <span className="hero-crest-text" style={{ fontSize: '1.8rem', color: 'var(--accent-gold-light)' }}>B&M</span>
        </div>

        <p style={{ 
          margin: '0 0 10px 0', 
          fontSize: '2rem', 
          fontFamily: 'var(--font-serif)',
          letterSpacing: '1px'
        }}>
          Benjami & Maria
        </p>

        <p style={{ 
          margin: '0 0 25px 0', 
          fontSize: '0.92rem', 
          color: 'var(--accent-gold-light)',
          letterSpacing: '2px',
          fontFamily: 'var(--font-cinzel)'
        }}>
          11 DE JUNY DE 2027 · HOTEL VILLA RETIRO
        </p>

        <p style={{ 
          margin: 0, 
          fontSize: '0.85rem', 
          color: 'rgba(255, 255, 255, 0.6)',
          letterSpacing: '0.5px' 
        }}>
          Dissenyat amb molt d'amor per a un dia inoblidable
        </p>
      </footer>
    </main>
  );
}
