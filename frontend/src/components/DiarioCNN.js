import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiCalendar, FiClock, FiRefreshCw, FiStar, FiTrendingUp, FiBarChart2, FiGlobe, FiMapPin, FiHome, FiLayers, FiFileText, FiPlay, FiShare2, FiBookmark, FiHeart, FiMessageCircle, FiExternalLink, FiImage } from 'react-icons/fi';

// Styled Components
const CNNContainer = styled.div`
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

const CategoryFilter = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const CategoryButton = styled.button`
  background: ${props => props.active ? '#cc0000' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border: 2px solid ${props => props.active ? '#cc0000' : '#e0e0e0'};
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;

  &:hover {
    background: ${props => props.active ? '#b30000' : '#f8f9fa'};
    border-color: #cc0000;
    color: ${props => props.active ? 'white' : '#cc0000'};
  }
`;

const LoadMoreButton = styled.button`
  background: #cc0000;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 2rem auto;
  display: block;

  &:hover {
    background: #b30000;
    transform: translateY(-2px);
  }
`;

// Nuevos componentes para el diseño mejorado
const HeroCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 2rem;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  }
`;

const MediumCard = styled.div`
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  }
`;

const SmallCard = styled.div`
  background: white;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const TextOnlyCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid #cc0000;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-left-color: #b30000;
  }
`;

const ImageFallback = styled.div`
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 2rem;
`;

const ResponsiveGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const HeroGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const SidebarGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
`;

const DiarioCNN = () => {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [noticiaSeleccionada, setNoticiaSeleccionada] = useState(null);
  const [noticiasCargadas, setNoticiasCargadas] = useState(12);
  const [cargandoMas, setCargandoMas] = useState(false);

  const categorias = ['Todas', 'Mundo', 'Deportes', 'Economía'];

  useEffect(() => {
    loadNoticiasCNN();
  }, []);

  const loadNoticiasCNN = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/noticias?diario=CNN en Español&limit=100');
      const data = await response.json();
      
      // Filtrar noticias de CNN en Español
      const noticiasCNN = (data || []).filter(noticia => 
        noticia.diario_nombre === 'CNN en Español'
      );
      
      setNoticias(noticiasCNN);
    } catch (error) {
      console.error('Error cargando noticias de CNN:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleNoticiaClick = (noticia) => {
    setNoticiaSeleccionada(noticia);
    setMostrarDetalle(true);
  };

  const handleVolverALista = () => {
    setMostrarDetalle(false);
    setNoticiaSeleccionada(null);
  };

  const handleCargarMas = () => {
    setCargandoMas(true);
    setTimeout(() => {
      setNoticiasCargadas(prev => prev + 12);
      setCargandoMas(false);
    }, 1000);
  };

  const handleVerOriginal = () => {
    if (noticiaSeleccionada?.enlace) {
      window.open(noticiaSeleccionada.enlace, '_blank');
    }
  };

  // Función para verificar si una imagen es válida
  const isValidImage = (imageUrl) => {
    return imageUrl && imageUrl !== 'No Image' && imageUrl.startsWith('http');
  };

  // Función para renderizar imagen con fallback
  const renderImage = (imageUrl, alt, style = {}) => {
    if (isValidImage(imageUrl)) {
      return (
        <img 
          src={imageUrl} 
          alt={alt}
          style={style}
          loading="lazy"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      );
    }
    return null;
  };

  // Función para renderizar fallback de imagen
  const renderImageFallback = (style = {}) => {
    return (
      <ImageFallback style={{ ...style, display: 'none' }}>
        <FiImage />
      </ImageFallback>
    );
  };

  // Función para clasificar noticias por tipo de card
  const classifyNews = (newsList) => {
    const hero = newsList[0] || null;
    const sidebar = newsList.slice(1, 4);
    const medium = newsList.slice(4, 7);
    const small = newsList.slice(7, 13);
    const textOnly = newsList.slice(13).filter(noticia => !isValidImage(noticia.imagen_url));
    const remaining = newsList.slice(13).filter(noticia => isValidImage(noticia.imagen_url));

    return { hero, sidebar, medium, small, textOnly, remaining };
  };

  // Filtrar noticias por categoría
  const noticiasFiltradas = categoriaSeleccionada === 'Todas' 
    ? noticias 
    : noticias.filter(noticia => noticia.categoria === categoriaSeleccionada);

  const noticiasAMostrar = noticiasFiltradas.slice(0, noticiasCargadas);

  // Si se debe mostrar el detalle de la noticia
  if (mostrarDetalle && noticiaSeleccionada) {
    return (
      <CNNContainer>
        {/* Header de CNN */}
        <div style={{
          background: '#cc0000',
          padding: '1rem 0',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                background: 'white', 
                color: '#cc0000', 
                padding: '0.5rem 1rem', 
                borderRadius: '4px', 
                fontWeight: '700',
                fontSize: '1.2rem'
              }}>
                CNN
              </div>
              <span style={{ color: 'white', fontSize: '1.1rem', fontWeight: '600' }}>en Español</span>
            </div>
            <button
              onClick={handleVolverALista}
              style={{
                background: 'none',
                border: '1px solid white',
                color: 'white',
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

        {/* Contenido del detalle */}
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <img 
              src={noticiaSeleccionada.imagen_url || '/images/cnn-default.jpg'} 
              alt={noticiaSeleccionada.titulo}
              style={{ 
                width: '100%', 
                height: '400px', 
                objectFit: 'cover' 
              }}
            />
            <div style={{ padding: '2rem' }}>
              <div style={{
                fontSize: '0.9rem',
                fontWeight: '700',
                color: '#cc0000',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '1rem'
              }}>
                {noticiaSeleccionada.categoria || 'NOTICIAS'}
              </div>
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: '#1a1a1a',
                margin: '0 0 1.5rem 0',
                lineHeight: '1.2',
                fontFamily: 'Georgia, serif'
              }}>
                {noticiaSeleccionada.titulo}
              </h1>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '2rem',
                fontSize: '0.9rem',
                color: '#666'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiClock />
                  {formatDate(noticiaSeleccionada.fecha_publicacion)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiGlobe />
                  CNN en Español
                </div>
              </div>
              <div style={{
                fontSize: '1.1rem',
                lineHeight: '1.6',
                color: '#333',
                marginBottom: '2rem',
                fontFamily: 'Arial, sans-serif'
              }}>
                {noticiaSeleccionada.contenido || noticiaSeleccionada.resumen_auto || 'Contenido no disponible.'}
              </div>
              <button
                onClick={handleVerOriginal}
                style={{
                  background: '#cc0000',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#b30000';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#cc0000';
                }}
              >
                <FiExternalLink />
                Ver noticia original en CNN
              </button>
            </div>
          </div>
        </div>
      </CNNContainer>
    );
  }

  if (loading) {
    return (
      <CNNContainer>
        <LoadingSpinner>
          <FiRefreshCw style={{ animation: 'spin 1s linear infinite', marginRight: '0.5rem' }} />
          Cargando noticias de CNN...
        </LoadingSpinner>
      </CNNContainer>
    );
  }

  if (noticias.length === 0) {
    return (
      <CNNContainer>
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h2 style={{ color: '#666', marginBottom: '1rem' }}>No hay noticias disponibles</h2>
          <button 
            onClick={loadNoticiasCNN}
            style={{
              background: '#cc0000',
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
      </CNNContainer>
    );
  }

  return (
    <CNNContainer>
      {/* Header principal de CNN */}
      <div style={{
        background: '#cc0000',
        padding: '1.5rem 0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              background: 'white', 
              color: '#cc0000', 
              padding: '0.8rem 1.5rem', 
              borderRadius: '6px', 
              fontWeight: '700',
              fontSize: '1.8rem',
              fontFamily: 'Arial, sans-serif'
            }}>
              CNN
            </div>
            <span style={{ color: 'white', fontSize: '1.5rem', fontWeight: '600', fontFamily: 'Arial, sans-serif' }}>en Español</span>
          </div>
        </div>
      </div>

      {/* Layout principal */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        
        {/* Filtros de categoría */}
        <CategoryFilter>
          {categorias.map((categoria) => (
            <CategoryButton
              key={categoria}
              active={categoriaSeleccionada === categoria}
              onClick={() => setCategoriaSeleccionada(categoria)}
            >
              {categoria}
            </CategoryButton>
          ))}
        </CategoryFilter>

        {/* Diseño jerárquico como CNN Español */}
        {noticiasAMostrar.length > 0 && (() => {
          const { hero, sidebar, medium, small, textOnly, remaining } = classifyNews(noticiasAMostrar);
          
          return (
            <>
              {/* Hero Section */}
              {hero && (
                <HeroGrid>
                  <HeroCard onClick={() => handleNoticiaClick(hero)}>
                    <div style={{ position: 'relative' }}>
                      {renderImage(hero.imagen_url, hero.titulo, { 
                        width: '100%', 
                        height: '400px', 
                        objectFit: 'cover' 
                      })}
                      {renderImageFallback({ 
                        width: '100%', 
                        height: '400px' 
                      })}
                      <div style={{
                        position: 'absolute',
                        top: '1.5rem',
                        left: '1.5rem',
                        background: '#cc0000',
                        color: 'white',
                        padding: '0.8rem 1.5rem',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {hero.categoria || 'NOTICIAS'}
                      </div>
                    </div>
                    <div style={{ padding: '2.5rem' }}>
                      <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: '700',
                        color: '#1a1a1a',
                        margin: '0 0 1.5rem 0',
                        lineHeight: '1.2',
                        fontFamily: 'Georgia, serif'
                      }}>
                        {hero.titulo}
                      </h1>
                      <p style={{
                        fontSize: '1.2rem',
                        color: '#666',
                        margin: '0 0 2rem 0',
                        lineHeight: '1.6',
                        fontFamily: 'Arial, sans-serif'
                      }}>
                        {hero.contenido?.substring(0, 250) + '...' || 'Descripción no disponible.'}
                      </p>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.5rem',
                        fontSize: '1rem',
                        color: '#999',
                        fontFamily: 'Arial, sans-serif'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FiClock />
                          {formatDate(hero.fecha_publicacion)}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FiGlobe />
                          CNN en Español
                        </div>
                      </div>
                    </div>
                  </HeroCard>

                  {/* Sidebar */}
                  <SidebarGrid>
                    {sidebar.map((noticia, index) => (
                      <MediumCard key={noticia.id} onClick={() => handleNoticiaClick(noticia)}>
                        <div style={{ padding: '1.5rem' }}>
                          <div style={{
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            color: '#cc0000',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '1rem'
                          }}>
                            {noticia.categoria}
                          </div>
                          <h3 style={{
                            fontSize: '1.2rem',
                            fontWeight: '700',
                            color: '#1a1a1a',
                            margin: '0 0 1rem 0',
                            lineHeight: '1.3',
                            fontFamily: 'Georgia, serif'
                          }}>
                            {noticia.titulo}
                          </h3>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.9rem',
                            color: '#999'
                          }}>
                            <FiClock />
                            {formatDate(noticia.fecha_publicacion)}
                          </div>
                        </div>
                        <div style={{ padding: '0 1.5rem 1.5rem' }}>
                          {renderImage(noticia.imagen_url, noticia.titulo, { 
                            width: '100%', 
                            height: '140px', 
                            objectFit: 'cover',
                            borderRadius: '6px'
                          })}
                          {renderImageFallback({ 
                            width: '100%', 
                            height: '140px',
                            borderRadius: '6px'
                          })}
                        </div>
                      </MediumCard>
                    ))}
                  </SidebarGrid>
                </HeroGrid>
              )}

              {/* Medium Cards Section */}
              {medium.length > 0 && (
                <ResponsiveGrid>
                  {medium.map((noticia) => (
                    <MediumCard key={noticia.id} onClick={() => handleNoticiaClick(noticia)}>
                      {renderImage(noticia.imagen_url, noticia.titulo, { 
                        width: '100%', 
                        height: '200px', 
                        objectFit: 'cover' 
                      })}
                      {renderImageFallback({ 
                        width: '100%', 
                        height: '200px' 
                      })}
                      <div style={{ padding: '1.5rem' }}>
                        <div style={{
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          color: '#cc0000',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          marginBottom: '1rem'
                        }}>
                          {noticia.categoria}
                        </div>
                        <h3 style={{
                          fontSize: '1.1rem',
                          fontWeight: '700',
                          color: '#1a1a1a',
                          margin: '0 0 1rem 0',
                          lineHeight: '1.3',
                          fontFamily: 'Georgia, serif'
                        }}>
                          {noticia.titulo}
                        </h3>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.8rem',
                          color: '#999'
                        }}>
                          <FiClock />
                          {formatDate(noticia.fecha_publicacion)}
                        </div>
                      </div>
                    </MediumCard>
                  ))}
                </ResponsiveGrid>
              )}

              {/* Small Cards Section */}
              {small.length > 0 && (
                <ResponsiveGrid>
                  {small.map((noticia) => (
                    <SmallCard key={noticia.id} onClick={() => handleNoticiaClick(noticia)}>
                      {renderImage(noticia.imagen_url, noticia.titulo, { 
                        width: '100%', 
                        height: '150px', 
                        objectFit: 'cover' 
                      })}
                      {renderImageFallback({ 
                        width: '100%', 
                        height: '150px' 
                      })}
                      <div style={{ padding: '1rem' }}>
                        <div style={{
                          fontSize: '0.7rem',
                          fontWeight: '700',
                          color: '#cc0000',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          marginBottom: '0.8rem'
                        }}>
                          {noticia.categoria}
                        </div>
                        <h4 style={{
                          fontSize: '0.95rem',
                          fontWeight: '700',
                          color: '#1a1a1a',
                          margin: '0 0 0.8rem 0',
                          lineHeight: '1.3',
                          fontFamily: 'Georgia, serif'
                        }}>
                          {noticia.titulo}
                        </h4>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.75rem',
                          color: '#999'
                        }}>
                          <FiClock />
                          {formatDate(noticia.fecha_publicacion)}
                        </div>
                      </div>
                    </SmallCard>
                  ))}
                </ResponsiveGrid>
              )}

              {/* Text Only Cards Section */}
              {textOnly.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#1a1a1a',
                    margin: '0 0 1.5rem 0',
                    fontFamily: 'Georgia, serif',
                    borderBottom: '2px solid #cc0000',
                    paddingBottom: '0.5rem'
                  }}>
                    Más noticias
                  </h3>
                  <ResponsiveGrid>
                    {textOnly.map((noticia) => (
                      <TextOnlyCard key={noticia.id} onClick={() => handleNoticiaClick(noticia)}>
                        <div style={{
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          color: '#cc0000',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          marginBottom: '1rem'
                        }}>
                          {noticia.categoria}
                        </div>
                        <h4 style={{
                          fontSize: '1.1rem',
                          fontWeight: '700',
                          color: '#1a1a1a',
                          margin: '0 0 1rem 0',
                          lineHeight: '1.3',
                          fontFamily: 'Georgia, serif'
                        }}>
                          {noticia.titulo}
                        </h4>
                        <p style={{
                          fontSize: '0.9rem',
                          color: '#666',
                          margin: '0 0 1rem 0',
                          lineHeight: '1.5',
                          fontFamily: 'Arial, sans-serif'
                        }}>
                          {noticia.contenido?.substring(0, 150) + '...' || 'Descripción no disponible.'}
                        </p>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.8rem',
                          color: '#999'
                        }}>
                          <FiClock />
                          {formatDate(noticia.fecha_publicacion)}
                        </div>
                      </TextOnlyCard>
                    ))}
                  </ResponsiveGrid>
                </div>
              )}

              {/* Remaining Cards */}
              {remaining.length > 0 && (
                <ResponsiveGrid>
                  {remaining.map((noticia) => (
                    <SmallCard key={noticia.id} onClick={() => handleNoticiaClick(noticia)}>
                      {renderImage(noticia.imagen_url, noticia.titulo, { 
                        width: '100%', 
                        height: '150px', 
                        objectFit: 'cover' 
                      })}
                      {renderImageFallback({ 
                        width: '100%', 
                        height: '150px' 
                      })}
                      <div style={{ padding: '1rem' }}>
                        <div style={{
                          fontSize: '0.7rem',
                          fontWeight: '700',
                          color: '#cc0000',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          marginBottom: '0.8rem'
                        }}>
                          {noticia.categoria}
                        </div>
                        <h4 style={{
                          fontSize: '0.95rem',
                          fontWeight: '700',
                          color: '#1a1a1a',
                          margin: '0 0 0.8rem 0',
                          lineHeight: '1.3',
                          fontFamily: 'Georgia, serif'
                        }}>
                          {noticia.titulo}
                        </h4>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.75rem',
                          color: '#999'
                        }}>
                          <FiClock />
                          {formatDate(noticia.fecha_publicacion)}
                        </div>
                      </div>
                    </SmallCard>
                  ))}
                </ResponsiveGrid>
              )}
            </>
          );
        })()}


        {/* Botón cargar más */}
        {noticiasAMostrar.length < noticiasFiltradas.length && (
          <LoadMoreButton onClick={handleCargarMas} disabled={cargandoMas}>
            {cargandoMas ? (
              <>
                <FiRefreshCw style={{ animation: 'spin 1s linear infinite', marginRight: '0.5rem' }} />
                Cargando...
              </>
            ) : (
              'Cargar más noticias'
            )}
          </LoadMoreButton>
        )}
      </div>

      {/* CSS para animaciones */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </CNNContainer>
  );
};

export default DiarioCNN;
