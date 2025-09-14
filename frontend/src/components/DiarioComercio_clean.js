import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiCalendar, FiClock, FiRefreshCw, FiStar, FiTrendingUp, FiBarChart2, FiGlobe, FiMapPin, FiHome, FiLayers, FiFileText, FiPlay, FiShare2, FiBookmark, FiHeart, FiMessageCircle } from 'react-icons/fi';
import NoticiaDetalleComercio from './NoticiaDetalleComercio';

// Styled Components
const ComercioContainer = styled.div`
  width: 100%;
  margin: 0;
  padding: 0;
  background: #ffffff;
  min-height: 100vh;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: #666;
`;

const DiarioComercio = () => {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [fechasDisponibles, setFechasDisponibles] = useState([]);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [noticiaSeleccionada, setNoticiaSeleccionada] = useState(null);
  const [mostrarSeccionSuscripcion, setMostrarSeccionSuscripcion] = useState(false);

  useEffect(() => {
    loadNoticiasComercio();
    loadFechasDisponibles();
  }, []);

  const loadNoticiasComercio = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/noticias?limit=100');
      const data = await response.json();
      
      // Filtrar noticias de El Comercio
      const noticiasComercio = (data.noticias || data || []).filter(noticia => 
        noticia.diario_nombre === 'El Comercio' || 
        (noticia.diario && noticia.diario.nombre === 'El Comercio')
      );
      
      setNoticias(noticiasComercio);
    } catch (error) {
      console.error('Error cargando noticias:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFechasDisponibles = async () => {
    try {
      const response = await fetch('http://localhost:8000/noticias/fechas-disponibles');
      const data = await response.json();
      setFechasDisponibles(data.fechas || []);
      if (data.fechas && data.fechas.length > 0) {
        setFechaSeleccionada(data.fechas[0].fecha);
      }
    } catch (error) {
      console.error('Error cargando fechas:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleNoticiaClick = (noticia) => {
    setNoticiaSeleccionada(noticia.id);
    setMostrarDetalle(true);
  };

  const handleVolverALista = () => {
    setMostrarDetalle(false);
    setNoticiaSeleccionada(null);
  };

  // Si se debe mostrar el detalle de la noticia
  if (mostrarDetalle && noticiaSeleccionada) {
    return (
      <NoticiaDetalleComercio
        noticiaId={noticiaSeleccionada}
        onBack={handleVolverALista}
        onNoticiaClick={handleNoticiaClick}
      />
    );
  }

  // Si se debe mostrar la sección de suscripción
  if (mostrarSeccionSuscripcion) {
    return (
      <ComercioContainer>
        {/* Header de suscripción */}
        <div style={{
          background: '#FFCB05',
          padding: '1rem 0',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <img src="/images/logos/comercio.png" alt="El Comercio" style={{ height: '40px' }} />
            <button
              onClick={() => setMostrarSeccionSuscripcion(false)}
              style={{
                background: 'none',
                border: '1px solid #1a1a1a',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}
            >
              ← Volver
            </button>
          </div>
        </div>

        {/* Contenido de suscripción */}
        <div style={{
          backgroundImage: 'url(/images/logos/suscripciioncomercio.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '3rem',
            borderRadius: '8px',
            maxWidth: '600px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#1a1a1a',
              marginBottom: '1rem',
              fontFamily: 'Georgia, serif'
            }}>
              ¡SUSCRÍBETE A EL COMERCIO!
            </h1>
            <p style={{
              fontSize: '1.2rem',
              color: '#666',
              marginBottom: '2rem',
              lineHeight: '1.6',
              fontFamily: 'Arial, sans-serif'
            }}>
              Accede a contenido exclusivo, análisis profundos y las mejores historias del periodismo peruano.
            </p>
            <div style={{
              background: '#FFCB05',
              padding: '2rem',
              borderRadius: '8px',
              marginBottom: '2rem'
            }}>
              <h2 style={{
                fontSize: '1.8rem',
                fontWeight: '700',
                color: '#1a1a1a',
                marginBottom: '1rem',
                fontFamily: 'Georgia, serif'
              }}>
                PLAN DIGITAL ANUAL
              </h2>
              <div style={{
                fontSize: '3rem',
                fontWeight: '700',
                color: '#1a1a1a',
                marginBottom: '0.5rem',
                fontFamily: 'Arial, sans-serif'
              }}>
                S/ 4 AL MES
              </div>
              <p style={{
                fontSize: '1rem',
                color: '#666',
                marginBottom: '1.5rem',
                fontFamily: 'Arial, sans-serif'
              }}>
                Pago único de S/ 48 al año
              </p>
              <button style={{
                background: '#1a1a1a',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '4px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontFamily: 'Arial, sans-serif'
              }}>
                Suscríbete ahora
              </button>
            </div>
          </div>
        </div>
      </ComercioContainer>
    );
  }

  // Filtrar noticias por fecha si está seleccionada
  const noticiasFiltradas = fechaSeleccionada 
    ? noticias.filter(noticia => {
        const noticiaFecha = new Date(noticia.fecha_publicacion).toISOString().split('T')[0];
        return noticiaFecha === fechaSeleccionada;
      })
    : noticias;

  if (loading) {
    return (
      <ComercioContainer>
        <LoadingSpinner>
          <FiRefreshCw style={{ animation: 'spin 1s linear infinite', marginRight: '0.5rem' }} />
          Cargando noticias...
        </LoadingSpinner>
      </ComercioContainer>
    );
  }

  if (noticias.length === 0) {
    return (
      <ComercioContainer>
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h2 style={{ color: '#666', marginBottom: '1rem' }}>No hay noticias disponibles</h2>
          <button 
            onClick={loadNoticiasComercio}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '0.8rem 1.5rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Reintentar
          </button>
        </div>
      </ComercioContainer>
    );
  }

  return (
    <ComercioContainer>
      {/* Header principal */}
      <div style={{
        background: '#FFCB05',
        padding: '1rem 0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <img src="/images/logos/comercio.png" alt="El Comercio" style={{ height: '60px', width: 'auto', maxWidth: '400px', objectFit: 'contain' }} />
          <button
            onClick={() => setMostrarSeccionSuscripcion(true)}
            style={{
              background: '#1a1a1a',
              color: 'white',
              border: 'none',
              padding: '0.8rem 1.5rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              fontFamily: 'Arial, sans-serif'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#333';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#1a1a1a';
            }}
          >
            ¡SUSCRÍBETE!
          </button>
        </div>
      </div>

      {/* Barra de navegación */}
      <div style={{
        background: 'white',
        padding: '0.8rem 0',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.5rem',
            fontSize: '0.9rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            <a href="#ultimo" style={{ color: '#1a1a1a', textDecoration: 'none' }}>LO ÚLTIMO</a>
            <span style={{ color: '#ccc', fontSize: '0.8rem' }}>•</span>
            <a href="#deportes" style={{ color: '#1a1a1a', textDecoration: 'none' }}>DEPORTES</a>
            <span style={{ color: '#ccc', fontSize: '0.8rem' }}>•</span>
            <a href="#economia" style={{ color: '#1a1a1a', textDecoration: 'none' }}>ECONOMÍA</a>
            <span style={{ color: '#ccc', fontSize: '0.8rem' }}>•</span>
            <a href="#mundo" style={{ color: '#1a1a1a', textDecoration: 'none' }}>MUNDO</a>
          </div>
        </div>
      </div>

      {/* Barra de noticias en vivo */}
      <div style={{
        background: '#000000',
        color: 'white',
        padding: '0.6rem 0',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              background: '#dc3545',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }}></div>
            <span style={{ color: '#dc3545', fontWeight: '700' }}>Copa Davis</span>
            <span>•</span>
            <span>Perú vs Venezuela</span>
          </div>
        </div>
      </div>

      {/* Barra de noticias en vivo blanca */}
      <div style={{
        background: 'white',
        color: '#1a1a1a',
        padding: '0.6rem 0',
        textAlign: 'center',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            <span style={{ color: '#dc3545', fontWeight: '700' }}>EN VIVO</span>
            <span>•</span>
            <span>Real Madrid vs Real Sociedad</span>
          </div>
        </div>
      </div>

      {/* Filtro de fechas */}
      <div style={{
        background: '#f8f9fa',
        padding: '0.8rem 0',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: '600',
            fontFamily: 'Arial, sans-serif'
          }}>
            <FiCalendar style={{ fontSize: '1rem' }} />
            Filtrar por fecha
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            {fechasDisponibles.map((fecha) => (
              <button
                key={fecha.fecha}
                onClick={() => setFechaSeleccionada(fecha.fecha)}
                style={{
                  background: fechaSeleccionada === fecha.fecha ? '#2c5530' : 'white',
                  color: fechaSeleccionada === fecha.fecha ? 'white' : '#333',
                  border: `2px solid ${fechaSeleccionada === fecha.fecha ? '#2c5530' : '#e0e0e0'}`,
                  padding: '0.4rem 0.8rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontFamily: 'Arial, sans-serif'
                }}
              >
                <FiClock style={{ fontSize: '0.7rem' }} />
                {fecha.fecha_formateada} ({fecha.total_noticias})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Layout principal como El Comercio oficial */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 2rem' }}>
        
        {/* Bloque principal destacado */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '2fr 1fr', 
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          
          {/* Noticia principal destacada */}
          <div 
            onClick={() => noticiasFiltradas[0] && handleNoticiaClick(noticiasFiltradas[0])}
            style={{ 
              background: 'white',
              borderRadius: '4px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ position: 'relative' }}>
              <img 
                src={noticiasFiltradas[0]?.imagen_url || '/images/congreso.jpeg'} 
                alt={noticiasFiltradas[0]?.titulo}
                style={{ 
                  width: '100%', 
                  height: '300px', 
                  objectFit: 'cover' 
                }}
              />
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{
                fontSize: '0.8rem',
                fontWeight: '700',
                color: '#dc3545',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '0.8rem',
                fontFamily: 'Arial, sans-serif'
              }}>
                {noticiasFiltradas[0]?.categoria || 'MUNDO'}
              </div>
              <h1 style={{
                fontSize: '1.8rem',
                fontWeight: '700',
                color: '#1a1a1a',
                margin: '0 0 1rem 0',
                lineHeight: '1.2',
                fontFamily: 'Georgia, serif'
              }}>
                {noticiasFiltradas[0]?.titulo || 'El Papa León XIV recibe a El Comercio y RPP en el Vaticano'}
              </h1>
              <p style={{
                fontSize: '1rem',
                color: '#666',
                margin: '0 0 1rem 0',
                lineHeight: '1.5',
                fontFamily: 'Arial, sans-serif'
              }}>
                {noticiasFiltradas[0]?.descripcion || 'En la víspera de su cumpleaños número 70, León XIV tuvo un emotivo momento de cercanía con el Perú y recordó el tiempo que pasó aquí.'}
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                color: '#999',
                fontFamily: 'Arial, sans-serif'
              }}>
                <FiClock style={{ fontSize: '0.8rem' }} />
                {formatDate(noticiasFiltradas[0]?.fecha_publicacion)}
              </div>
            </div>
          </div>

          {/* Columna derecha - Noticias secundarias */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Noticia secundaria 1 */}
            <div 
              onClick={() => noticiasFiltradas[1] && handleNoticiaClick(noticiasFiltradas[1])}
              style={{ 
                background: 'white',
                borderRadius: '4px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ padding: '1rem' }}>
                <div style={{
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  color: '#dc3545',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '0.5rem',
                  fontFamily: 'Arial, sans-serif'
                }}>
                  {noticiasFiltradas[1]?.categoria || '¡PERÚ AVANZA EN LA DAVIS!'}
                </div>
                <h3 style={{
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  color: '#1a1a1a',
                  margin: '0 0 0.8rem 0',
                  lineHeight: '1.3',
                  fontFamily: 'Georgia, serif'
                }}>
                  {noticiasFiltradas[1]?.titulo || 'Ignacio Buse vence 2-1 a Nuno Borges y clasifica a Perú a las Qualifiers de la Copa Davis'}
                </h3>
              </div>
              <div style={{ padding: '0 1rem 1rem' }}>
                <img 
                  src={noticiasFiltradas[1]?.imagen_url || '/images/congreso.jpeg'} 
                  alt={noticiasFiltradas[1]?.titulo}
                  style={{ 
                    width: '100%', 
                    height: '120px', 
                    objectFit: 'cover',
                    borderRadius: '2px'
                  }}
                />
              </div>
            </div>

            {/* Noticia secundaria 2 */}
            <div 
              onClick={() => noticiasFiltradas[2] && handleNoticiaClick(noticiasFiltradas[2])}
              style={{ 
                background: 'white',
                borderRadius: '4px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ padding: '1rem' }}>
                <div style={{
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  color: '#dc3545',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '0.5rem',
                  fontFamily: 'Arial, sans-serif'
                }}>
                  {noticiasFiltradas[2]?.categoria || 'TE LO CUENTO'}
                </div>
                <h3 style={{
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  color: '#1a1a1a',
                  margin: '0 0 0.5rem 0',
                  lineHeight: '1.3',
                  fontFamily: 'Georgia, serif'
                }}>
                  {noticiasFiltradas[2]?.titulo || 'Malaver, no eres tú, una crónica de Fernando Vivas sobre el ministro del Interior'}
                </h3>
                <p style={{
                  fontSize: '0.8rem',
                  color: '#666',
                  margin: '0 0 0.5rem 0',
                  fontFamily: 'Arial, sans-serif'
                }}>
                  {noticiasFiltradas[2]?.autor || 'Fernando Vivas'}
                </p>
                <div style={{
                  background: '#FFD700',
                  color: '#1a1a1a',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '3px',
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  display: 'inline-block',
                  fontFamily: 'Arial, sans-serif'
                }}>
                  ★ Solo para suscriptores
                </div>
              </div>
              <div style={{ padding: '0 1rem 1rem' }}>
                <img 
                  src={noticiasFiltradas[2]?.imagen_url || '/images/congreso.jpeg'} 
                  alt={noticiasFiltradas[2]?.titulo}
                  style={{ 
                    width: '100%', 
                    height: '120px', 
                    objectFit: 'cover',
                    borderRadius: '2px'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sección LO ÚLTIMO como bloque separado */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '2fr 1fr', 
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          
          {/* Columna izquierda - Más noticias */}
          <div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1a1a1a',
              margin: '0 0 1.5rem 0',
              fontFamily: 'Georgia, serif',
              borderBottom: '2px solid #dc3545',
              paddingBottom: '0.5rem'
            }}>
              Más noticias
            </h2>
            
            {/* Grid de noticias adicionales */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '1.5rem'
            }}>
              {noticiasFiltradas.slice(3, 7).map((noticia, index) => (
                <div 
                  key={noticia.id}
                  onClick={() => handleNoticiaClick(noticia)}
                  style={{ 
                    background: 'white',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <img 
                    src={noticia.imagen_url || '/images/congreso.jpeg'} 
                    alt={noticia.titulo}
                    style={{ 
                      width: '100%', 
                      height: '120px', 
                      objectFit: 'cover' 
                    }}
                  />
                  <div style={{ padding: '1rem' }}>
                    <div style={{
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      color: '#dc3545',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '0.5rem',
                      fontFamily: 'Arial, sans-serif'
                    }}>
                      {noticia.categoria}
                    </div>
                    <h3 style={{
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      color: '#1a1a1a',
                      margin: '0 0 0.5rem 0',
                      lineHeight: '1.3',
                      fontFamily: 'Georgia, serif'
                    }}>
                      {noticia.titulo}
                    </h3>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.75rem',
                      color: '#999',
                      fontFamily: 'Arial, sans-serif'
                    }}>
                      <FiClock style={{ fontSize: '0.7rem' }} />
                      {formatDate(noticia.fecha_publicacion)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Columna derecha - LO ÚLTIMO */}
          <div>
            <h2 style={{
              fontSize: '1.2rem',
              fontWeight: '700',
              color: '#1a1a1a',
              margin: '0 0 1rem 0',
              fontFamily: 'Arial, sans-serif',
              borderLeft: '4px solid #dc3545',
              paddingLeft: '1rem'
            }}>
              LO ÚLTIMO
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {noticiasFiltradas.slice(6, 11).map((noticia, index) => (
                <div 
                  key={noticia.id} 
                  onClick={() => handleNoticiaClick(noticia)}
                  style={{
                    padding: '0.5rem 0',
                    borderBottom: index < 4 ? '1px solid #f0f0f0' : 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#666',
                    marginBottom: '0.25rem',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    {new Date().getHours()}:{String(new Date().getMinutes() + index).padStart(2, '0')}
                  </div>
                  <h4 style={{
                    fontSize: '0.85rem',
                    fontWeight: '400',
                    color: '#1a1a1a',
                    margin: '0',
                    lineHeight: '1.3',
                    fontFamily: 'Arial, sans-serif',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#dc3545';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#1a1a1a';
                  }}
                  >
                    {noticia.titulo}
                  </h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Suscriptores */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        color: 'white',
        padding: '3rem 0',
        marginTop: '2rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '700',
              marginBottom: '1rem',
              fontFamily: 'Georgia, serif'
            }}>
              Accede a contenido exclusivo
            </h2>
            <p style={{
              fontSize: '1.1rem',
              marginBottom: '2rem',
              opacity: 0.9,
              fontFamily: 'Arial, sans-serif'
            }}>
              Análisis profundos y las mejores historias del periodismo peruano
            </p>
            <button style={{
              background: '#FFCB05',
              color: '#1a1a1a',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '4px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontFamily: 'Arial, sans-serif'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#FFD700';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#FFCB05';
              e.target.style.transform = 'translateY(0)';
            }}
            >
              Suscríbete ahora
            </button>
          </div>
        </div>
      </div>

    </ComercioContainer>
  );
};

export default DiarioComercio;

