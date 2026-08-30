"use client";

import { useState, useEffect } from 'react';

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    attending: 'yes',
    companions: 0,
    dietary: ''
  });
  const [status, setStatus] = useState('');

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Data i hora objectiu de la cerimònia: 11 de Juny de 2027 a les 12:30h
    const targetDate = new Date('2027-06-11T12:30:00');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          attending: formData.attending === 'yes',
          companions: parseInt(formData.companions.toString(), 10)
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
          minHeight: '92vh', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          alignItems: 'center',
          backgroundImage: 'linear-gradient(180deg, rgba(252, 251, 249, 0.45) 0%, rgba(252, 251, 249, 0.85) 100%), url("/bg.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          padding: '40px 20px'
        }}
      >
        <h1 style={{ 
          fontSize: 'clamp(3rem, 7vw, 5.5rem)', 
          margin: '0 0 15px 0', 
          color: 'var(--primary-color)',
          fontWeight: 500,
          lineHeight: 1.15
        }}>
          Benjami & Maria
        </h1>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '15px',
          marginBottom: '20px'
        }}>
          <span style={{ width: '40px', height: '1px', background: 'var(--accent-gold)' }}></span>
          <p style={{ 
            fontSize: '1.35rem', 
            fontFamily: 'var(--font-title)', 
            color: 'var(--text-muted)',
            letterSpacing: '1px'
          }}>
            11 de Juny de 2027 · Villa Retiro, Xerta
          </p>
          <span style={{ width: '40px', height: '1px', background: 'var(--accent-gold)' }}></span>
        </div>

        {/* Cuenta atrás para la ceremonia */}
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
          href="#rsvp" 
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

      {/* History Section with Blurred BenjaMaria.jpg background & photo frame */}
      <section id="historia" className="section blurred-section-bg" style={{ position: 'relative' }}>
        {/* Blurred background image layer */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url("/BenjaMaria.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(20px) brightness(0.95)',
            transform: 'scale(1.08)',
            zIndex: 0
          }}
        />
        {/* Soft overlay gradient */}
        <div className="blurred-section-overlay" />

        <div className="container section-content-relative">
          <h2 className="section-title">La Nostra Història</h2>

          <div className="glass-card" style={{ maxWidth: '850px', margin: '0 auto', textAlign: 'center' }}>
            {/* Diffused Photo Frame */}
            <div className="photo-showcase-wrap" style={{ maxWidth: '440px' }}>
              <div 
                className="photo-ambient-blur" 
                style={{ backgroundImage: 'url("/BenjaMaria.jpg")' }}
              />
              <img 
                src="/BenjaMaria.jpg" 
                alt="Benjamí i Maria a París" 
                className="photo-showcase-img"
                style={{ width: '100%', maxHeight: '420px', objectFit: 'cover' }}
              />
            </div>

            <h3 style={{ 
              fontSize: '2.2rem', 
              color: 'var(--primary-color)', 
              marginBottom: '15px',
              fontFamily: 'var(--font-title)'
            }}>
              Ens vam dir "Sí" a París
            </h3>

            <p style={{ 
              fontSize: '1.15rem', 
              color: 'var(--text-muted)', 
              maxWidth: '620px', 
              margin: '0 auto 15px auto',
              lineHeight: '1.8' 
            }}>
              Un viatge ple de màgia, mirades còmplices i una promesa eterna. 
              Sota la llum de París vam decidir començar el capítol més emocionant de les nostres vides, 
              i ara volem celebrar aquest amor amb totes les persones que més estimem.
            </p>

            <div style={{ marginTop: '25px' }}>
              <span style={{ 
                fontFamily: 'var(--font-title)', 
                fontStyle: 'italic', 
                fontSize: '1.25rem', 
                color: 'var(--accent-gold)' 
              }}>
                "El millor encara ha d'arribar..."
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section with Blurred entrada-villa-retiro.jpg background & photo frame */}
      <section id="ubicacio" className="section blurred-section-bg" style={{ position: 'relative' }}>
        {/* Blurred background image layer */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url("/entrada-villa-retiro.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(20px) brightness(0.95)',
            transform: 'scale(1.08)',
            zIndex: 0
          }}
        />
        {/* Soft overlay gradient */}
        <div className="blurred-section-overlay" />

        <div className="container section-content-relative">
          <h2 className="section-title">On i Quan</h2>

          <div className="glass-card" style={{ maxWidth: '850px', margin: '0 auto', textAlign: 'center' }}>
            {/* Diffused Photo Frame */}
            <div className="photo-showcase-wrap" style={{ maxWidth: '520px' }}>
              <div 
                className="photo-ambient-blur" 
                style={{ backgroundImage: 'url("/entrada-villa-retiro.jpg")' }}
              />
              <img 
                src="/entrada-villa-retiro.jpg" 
                alt="Entrada de Villa Retiro" 
                className="photo-showcase-img"
                style={{ width: '100%', maxHeight: '340px', objectFit: 'cover' }}
              />
            </div>

            <h3 style={{ 
              fontSize: '2.4rem', 
              color: 'var(--primary-color)', 
              marginBottom: '10px',
              fontFamily: 'var(--font-title)'
            }}>
              Hotel Villa Retiro
            </h3>

            <p style={{ 
              fontSize: '1.05rem', 
              textTransform: 'uppercase', 
              letterSpacing: '2px', 
              color: 'var(--accent-gold)', 
              marginBottom: '18px',
              fontWeight: 600 
            }}>
              Relais & Châteaux 5 Estrelles
            </p>

            <p style={{ fontSize: '1.15rem', color: 'var(--text-color)', marginBottom: '8px' }}>
              Carrer Camí dels Molins, 2 · 43592 Xerta, Tarragona
            </p>

            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '28px' }}>
              La cerimònia començarà puntualment a les <strong>12:30h</strong> als jardins principals.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
              <a 
                href="https://www.google.com/maps?rlz=1C1VDKB_esES975ES975&gs_lcrp=EgZjaHJvbWUqCggAEAAY4wIYgAQyCggAEAAY4wIYgAQyEwgBEC4YrwEYxwEYgAQYmAUYmQUyCAgCEAAYFhge0gEIMjEyNGowajeoAgCwAgA&um=1&ie=UTF-8&fb=1&gl=es&sa=X&geocode=KSunN9D45qASMWvNPrQk312g&daddr=Carrer+Cami+dels+Molins,+2,+43592+Xerta,+Tarragona" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-secondary"
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
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                Web de l'Espai
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Planning Section with Blurred Garden Background */}
      <section id="planning" className="section blurred-section-bg" style={{ position: 'relative' }}>
        {/* Blurred background image layer */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url("/jardin.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(20px) brightness(0.95)',
            transform: 'scale(1.08)',
            zIndex: 0
          }}
        />
        {/* Soft overlay gradient */}
        <div className="blurred-section-overlay" />

        <div className="container section-content-relative">
          <h2 className="section-title">El Gran Dia</h2>
          
          <div className="glass-card" style={{ maxWidth: '750px', margin: '0 auto' }}>
            <div style={{ position: 'relative', paddingLeft: '35px', borderLeft: '2px solid rgba(140, 115, 85, 0.3)' }}>
              
              <div style={{ marginBottom: '40px', position: 'relative' }}>
                <div style={{ 
                  position: 'absolute', 
                  left: '-44px', 
                  top: '4px', 
                  width: '16px', 
                  height: '16px', 
                  borderRadius: '50%', 
                  background: 'var(--accent-gold)',
                  border: '3px solid #fff',
                  boxShadow: '0 0 0 2px var(--primary-color)'
                }}></div>
                <span style={{ fontSize: '0.9rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: 600 }}>12:30h</span>
                <h3 style={{ fontSize: '1.6rem', margin: '4px 0 8px 0', color: 'var(--primary-color)' }}>Cerimònia</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>Donarem el "Sí, vull" acompanyats de la nostra família i amics als jardins de la finca.</p>
              </div>

              <div style={{ marginBottom: '40px', position: 'relative' }}>
                <div style={{ 
                  position: 'absolute', 
                  left: '-44px', 
                  top: '4px', 
                  width: '16px', 
                  height: '16px', 
                  borderRadius: '50%', 
                  background: 'var(--accent-gold)',
                  border: '3px solid #fff',
                  boxShadow: '0 0 0 2px var(--primary-color)'
                }}></div>
                <span style={{ fontSize: '0.9rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: 600 }}>13:45h</span>
                <h3 style={{ fontSize: '1.6rem', margin: '4px 0 8px 0', color: 'var(--primary-color)' }}>Còctel i Aperitius</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>Música en viu, refrigeri i pica-pica a l'aire lliure per començar a brindar.</p>
              </div>

              <div style={{ marginBottom: '40px', position: 'relative' }}>
                <div style={{ 
                  position: 'absolute', 
                  left: '-44px', 
                  top: '4px', 
                  width: '16px', 
                  height: '16px', 
                  borderRadius: '50%', 
                  background: 'var(--accent-gold)',
                  border: '3px solid #fff',
                  boxShadow: '0 0 0 2px var(--primary-color)'
                }}></div>
                <span style={{ fontSize: '0.9rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: 600 }}>15:30h</span>
                <h3 style={{ fontSize: '1.6rem', margin: '4px 0 8px 0', color: 'var(--primary-color)' }}>Banquet Nupcial</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>Una experiència gastronòmica d'alta cuina dissenyada per a l'ocasió.</p>
              </div>

              <div style={{ position: 'relative' }}>
                <div style={{ 
                  position: 'absolute', 
                  left: '-44px', 
                  top: '4px', 
                  width: '16px', 
                  height: '16px', 
                  borderRadius: '50%', 
                  background: 'var(--accent-gold)',
                  border: '3px solid #fff',
                  boxShadow: '0 0 0 2px var(--primary-color)'
                }}></div>
                <span style={{ fontSize: '0.9rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: 600 }}>18:00h</span>
                <h3 style={{ fontSize: '1.6rem', margin: '4px 0 8px 0', color: 'var(--primary-color)' }}>Festa i Barra Lliure</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>Ball, música, rialles i diversió fins que s'amagui la lluna.</p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* RSVP Section */}
      <section id="rsvp" className="section" style={{ backgroundColor: '#ffffff' }}>
        <div className="container">
          <h2 className="section-title">Confirmar Assistència</h2>
          
          <div className="glass-card" style={{ maxWidth: '640px', margin: '0 auto', background: '#fdfbf9' }}>
            {status === 'success' ? (
              <div className="text-center" style={{ padding: '40px 0' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(140, 115, 85, 0.15)',
                  color: 'var(--primary-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px auto',
                  fontSize: '1.8rem'
                }}>
                  ✓
                </div>
                <h3 style={{ color: 'var(--primary-color)', fontSize: '2.2rem', marginBottom: '12px' }}>Gràcies per confirmar!</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Hem rebut la teva resposta correctament. Ens veiem el Gran Dia!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <label className="form-label">Nom i Cognoms *</label>
                <input 
                  type="text" 
                  required 
                  className="input-field" 
                  placeholder="Ex. Joan Pérez"
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
                  <option value="yes">Sí, allà hi seré!</option>
                  <option value="no">No, ho sento molt</option>
                </select>

                {formData.attending === 'yes' && (
                  <>
                    <label className="form-label">Número d'acompanyants (addicionals a tu)</label>
                    <input 
                      type="number" 
                      min="0" 
                      className="input-field" 
                      value={formData.companions}
                      onChange={(e) => setFormData({...formData, companions: parseInt(e.target.value.toString(), 10) || 0})}
                    />

                    <label className="form-label">Al·lèrgies, intoleràncies o menú especial</label>
                    <textarea 
                      className="input-field" 
                      rows={3} 
                      placeholder="Ex. Celíac, vegetarià, al·lèrgic a la fruita seca..."
                      value={formData.dietary}
                      onChange={(e) => setFormData({...formData, dietary: e.target.value})}
                    ></textarea>
                  </>
                )}

                <div className="text-center mt-4">
                  <button type="submit" className="btn-primary" style={{ width: '100%', maxWidth: '320px' }} disabled={status === 'loading'}>
                    {status === 'loading' ? 'Enviant...' : 'Enviar Confirmació'}
                  </button>
                  {status === 'error' && (
                    <p style={{ color: '#d9534f', marginTop: '14px', fontSize: '0.95rem' }}>
                      Hi ha hagut un error en enviar la confirmació. Torna-ho a provar.
                    </p>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        backgroundColor: 'var(--primary-dark)', 
        color: '#fff', 
        textAlign: 'center', 
        padding: '45px 20px',
        borderTop: '1px solid rgba(217, 197, 178, 0.2)'
      }}>
        <p style={{ 
          margin: '0 0 10px 0', 
          fontSize: '1.6rem', 
          fontFamily: 'var(--font-title)',
          letterSpacing: '1px'
        }}>
          Benjami & Maria
        </p>
        <p style={{ 
          margin: 0, 
          fontSize: '0.9rem', 
          color: 'rgba(255, 255, 255, 0.7)',
          letterSpacing: '0.5px' 
        }}>
          11 de Juny de 2027 · Fet amb amor per a un dia inoblidable
        </p>
      </footer>
    </main>
  );
}
