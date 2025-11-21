import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiCalendar, FiClock, FiRefreshCw, FiStar, FiTrendingUp, FiBarChart2, FiGlobe, FiMapPin, FiHome, FiLayers, FiFileText, FiPlay, FiShare2, FiBookmark, FiHeart, FiMessageCircle, FiExternalLink, FiImage, FiArrowLeft } from 'react-icons/fi';
import ChatBot from './ChatBot';

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

const FiltersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const CategoryFilter = styled.div`
  display: flex;
  gap: 0.5rem;
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

const DateFilter = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const DateLabel = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
`;

const DateSelect = styled.select`
  padding: 0.6rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  color: #333;
  min-width: 200px;

  &:hover {
    border-color: #cc0000;
  }

  &:focus {
    outline: none;
    border-color: #cc0000;
    box-shadow: 0 0 0 3px rgba(204, 0, 0, 0.1);
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin: 3rem 0;
  flex-wrap: wrap;
`;

const PaginationButton = styled.button`
  background: ${props => props.active ? '#cc0000' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border: 2px solid ${props => props.active ? '#cc0000' : '#e0e0e0'};
  padding: 0.6rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: ${props => props.active ? '600' : '400'};
  min-width: 40px;

  &:hover:not(:disabled) {
    background: ${props => props.active ? '#b30000' : '#f8f9fa'};
    border-color: #cc0000;
    color: ${props => props.active ? 'white' : '#cc0000'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PaginationEllipsis = styled.span`
  padding: 0.6rem 0.5rem;
  color: #666;
  font-weight: 600;
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
  const navigate = useNavigate();
  const [noticias, setNoticias] = useState([]);
  const [noticiasFiltradas, setNoticiasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [fechasDisponibles, setFechasDisponibles] = useState([]);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [noticiaSeleccionada, setNoticiaSeleccionada] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [noticiasPorPagina] = useState(12);

  useEffect(() => {
    loadNoticiasCNN();
    loadFechasDisponibles();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [noticias, categoriaSeleccionada, fechaSeleccionada]);

  const loadNoticiasCNN = async () => {
    try {
      setLoading(true);
      // Cargar más noticias para tener suficiente para filtrar
      const response = await fetch('http://localhost:8000/noticias?diario=CNN en Español&limit=1000');
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

  const loadFechasDisponibles = async () => {
    try {
      const response = await fetch('http://localhost:8000/noticias/fechas-disponibles/CNN en Español');
      const data = await response.json();
      if (data && data.fechas) {
        // Extraer solo las fechas (el endpoint devuelve objetos con propiedad 'fecha')
        const fechas = data.fechas.map(item => typeof item === 'string' ? item : item.fecha).filter(Boolean);
        // Ordenar fechas de más reciente a más antigua
        const fechasOrdenadas = fechas.sort((a, b) => new Date(b) - new Date(a));
        setFechasDisponibles(fechasOrdenadas);
      }
    } catch (error) {
      console.error('Error cargando fechas disponibles:', error);
    }
  };

  const aplicarFiltros = () => {
    let filtradas = [...noticias];

    // Filtrar por categoría
    if (categoriaSeleccionada !== 'Todas') {
      filtradas = filtradas.filter(noticia => noticia.categoria === categoriaSeleccionada);
    }

    // Filtrar por fecha
    if (fechaSeleccionada) {
      filtradas = filtradas.filter(noticia => {
        if (!noticia.fecha_publicacion) return false;
        const fechaNoticia = new Date(noticia.fecha_publicacion).toISOString().split('T')[0];
        return fechaNoticia === fechaSeleccionada;
      });
    }

    // Ordenar por fecha de publicación (más recientes primero)
    filtradas.sort((a, b) => {
      const fechaA = new Date(a.fecha_publicacion || a.fecha_extraccion);
      const fechaB = new Date(b.fecha_publicacion || b.fecha_extraccion);
      return fechaB - fechaA;
    });

    setNoticiasFiltradas(filtradas);
    setPaginaActual(1); // Resetear a primera página cuando cambian los filtros
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

  // Calcular paginación
  const totalPaginas = Math.ceil(noticiasFiltradas.length / noticiasPorPagina);
  const indiceInicio = (paginaActual - 1) * noticiasPorPagina;
  const indiceFin = indiceInicio + noticiasPorPagina;
  const noticiasAMostrar = noticiasFiltradas.slice(indiceInicio, indiceFin);

  const handleCambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

  // Generar array de números de página para mostrar
  const obtenerNumerosPagina = () => {
    const paginas = [];
    const maxPaginasVisibles = 7;
    
    if (totalPaginas <= maxPaginasVisibles) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPaginas; i++) {
        paginas.push(i);
      }
    } else {
      // Mostrar páginas con elipsis
      if (paginaActual <= 3) {
        // Al inicio
        for (let i = 1; i <= 4; i++) paginas.push(i);
        paginas.push('...');
        paginas.push(totalPaginas);
      } else if (paginaActual >= totalPaginas - 2) {
        // Al final
        paginas.push(1);
        paginas.push('...');
        for (let i = totalPaginas - 3; i <= totalPaginas; i++) paginas.push(i);
      } else {
        // En el medio
        paginas.push(1);
        paginas.push('...');
        for (let i = paginaActual - 1; i <= paginaActual + 1; i++) paginas.push(i);
        paginas.push('...');
        paginas.push(totalPaginas);
      }
    }
    
    return paginas;
  };

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
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '0.6rem 1.2rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              fontFamily: 'Arial, sans-serif',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.3)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            }}
          >
            <FiArrowLeft style={{ fontSize: '1rem' }} />
            Volver al Menú
          </button>
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
          <div style={{ width: '140px' }}></div> {/* Espaciador para centrar el logo */}
        </div>
      </div>

      {/* Layout principal */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        
        {/* Filtros */}
        <FiltersContainer>
          {/* Filtro de fecha */}
          <DateFilter>
            <DateLabel>
              <FiCalendar style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Filtrar por fecha:
            </DateLabel>
            <DateSelect
              value={fechaSeleccionada}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
            >
              <option value="">Todas las fechas</option>
              {fechasDisponibles.map((fecha) => (
                <option key={fecha} value={fecha}>
                  {formatDate(fecha)}
                </option>
              ))}
            </DateSelect>
            {fechaSeleccionada && (
              <button
                onClick={() => setFechaSeleccionada('')}
                style={{
                  background: '#f0f0f0',
                  border: '1px solid #ddd',
                  padding: '0.6rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  color: '#666'
                }}
              >
                Limpiar filtro
              </button>
            )}
          </DateFilter>

          {/* Información de resultados */}
          <div style={{ fontSize: '0.9rem', color: '#666' }}>
            Mostrando {noticiasAMostrar.length} de {noticiasFiltradas.length} noticias
            {fechaSeleccionada && ` (filtradas por fecha)`}
            {categoriaSeleccionada !== 'Todas' && ` (filtradas por categoría: ${categoriaSeleccionada})`}
          </div>
        </FiltersContainer>

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


        {/* Paginación */}
        {totalPaginas > 1 && (
          <PaginationContainer>
            <PaginationButton
              onClick={() => handleCambiarPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
            >
              ← Anterior
            </PaginationButton>

            {obtenerNumerosPagina().map((pagina, index) => {
              if (pagina === '...') {
                return <PaginationEllipsis key={`ellipsis-${index}`}>...</PaginationEllipsis>;
              }
              return (
                <PaginationButton
                  key={pagina}
                  active={paginaActual === pagina}
                  onClick={() => handleCambiarPagina(pagina)}
                >
                  {pagina}
                </PaginationButton>
              );
            })}

            <PaginationButton
              onClick={() => handleCambiarPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
            >
              Siguiente →
            </PaginationButton>
          </PaginationContainer>
        )}

        {/* Información de paginación */}
        {totalPaginas > 1 && (
          <div style={{ textAlign: 'center', color: '#666', fontSize: '0.9rem', marginTop: '-2rem', marginBottom: '2rem' }}>
            Página {paginaActual} de {totalPaginas}
          </div>
        )}
      </div>

      {/* CSS para animaciones */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <ChatBot context="cnn" />
    </CNNContainer>
  );
};

export default DiarioCNN;
