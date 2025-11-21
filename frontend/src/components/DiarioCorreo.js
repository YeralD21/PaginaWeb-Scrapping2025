import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiArrowLeft, FiCalendar, FiClock, FiFilter, FiChevronDown, FiX } from 'react-icons/fi';
import { useNoticiasDiario } from '../hooks/useNoticiasDiario';
import ChatBot from './ChatBot';

const Container = styled.div`
  min-height: 100vh;
  background: #f8f9fa; /* Fondo claro */
  font-family: 'Arial', 'Helvetica', sans-serif;
`;

const Header = styled.header`
  background: #dc3545; /* Rojo */
  color: white;
  padding: 2rem 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const BackButton = styled.button`
  background: white; /* Blanco */
  border: 2px solid white;
  color: #dc3545; /* Rojo */
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    background: #dc3545;
    color: white;
    border-color: #dc3545;
    transform: translateY(-2px);
  }
`;

const DiarioInfo = styled.div`
  flex: 1;
`;

const DiarioTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 900;
  margin: 0;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.5);
  font-family: 'Arial Black', sans-serif;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const DiarioSubtitle = styled.p`
  font-size: 1.3rem;
  margin: 0.5rem 0 0 0;
  opacity: 0.9;
  font-weight: 600;
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

// Layout principal similar a diariocorreo.pe
const MainLayout = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

// Noticia destacada grande (izquierda)
const FeaturedArticle = styled.article`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  }
`;

const FeaturedImage = styled.div`
  height: 500px;
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'};
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  flex: 0 0 auto;
`;

const FeaturedOverlay = styled.div`
  position: relative;
  padding: 1.75rem 2rem 1.5rem 2rem;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.85));
  color: white;
  z-index: 2;
`;

const FeaturedCategory = styled.span`
  background: #dc3545;
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: inline-block;
  margin-bottom: 0.75rem;
`;

const FeaturedTitle = styled.h2`
  font-size: 2.2rem;
  font-weight: 900;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.9);
  font-family: 'Arial Black', sans-serif;
`;

// Sidebar con cards verticales largos (derecha)
const SidebarNews = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SidebarCard = styled.article`
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 160px;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  }
`;

const SidebarImage = styled.div`
  height: 100px;
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'};
  background-size: cover;
  background-position: center;
  position: relative;
`;

const SidebarContent = styled.div`
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const SidebarCategory = styled.span`
  background: #dc3545;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-block;
  width: fit-content;
  margin-bottom: 0.5rem;
`;

const SidebarTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.3;
  color: #1f2937;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
`;

const SidebarMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.5rem;
`;

// Grid de cards pequeñas abajo (horizontales y verticales)
const BottomNewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SmallCard = styled.article`
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: ${props => props.horizontal ? 'row' : 'column'};
  height: ${props => props.horizontal ? '140px' : 'auto'};

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  }
`;

const SmallCardImage = styled.div`
  ${props => props.horizontal 
    ? `width: 200px; height: 140px; flex-shrink: 0;`
    : `height: 180px;`
  }
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'};
  background-size: cover;
  background-position: center;
  position: relative;
`;

const SmallCardContent = styled.div`
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const SmallCardCategory = styled.span`
  background: #dc3545;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-block;
  width: fit-content;
  margin-bottom: 0.5rem;
`;

const SmallCardTitle = styled.h3`
  font-size: ${props => props.horizontal ? '0.9rem' : '1rem'};
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
  color: #1f2937;
  display: -webkit-box;
  -webkit-line-clamp: ${props => props.horizontal ? '3' : '2'};
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
`;

const SmallCardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: #6b7280;
`;

const HeroSection = styled.section`
  margin-bottom: 3rem;
`;

const HeroCard = styled.article`
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  border: 3px solid #dc3545;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: linear-gradient(90deg, #dc3545 0%, #ffc107 50%, #dc3545 100%);
    z-index: 1;
  }
`;

const HeroImage = styled.div`
  position: relative;
  height: 450px;
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'};
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const HeroOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
  padding: 2rem;
  color: white;
`;

const HeroCategory = styled.span`
  background: #dc3545;
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 1rem;
  display: inline-block;
  box-shadow: 0 4px 15px rgba(220, 53, 69, 0.4);
`;

const HeroTitle = styled.h2`
  font-size: 2.8rem;
  font-weight: 900;
  margin: 0 0 1rem 0;
  line-height: 1.2;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.7);
  font-family: 'Arial Black', sans-serif;
  text-transform: uppercase;
`;

const HeroMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  font-size: 1rem;
  opacity: 0.9;
  font-weight: 600;
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  backdrop-filter: blur(10px);
`;

const NewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
`;

const NewsCard = styled.article`
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border: 2px solid #dc3545;
  transition: all 0.3s ease;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #dc3545 0%, #ffc107 50%, #dc3545 100%);
    z-index: 1;
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  }
`;

const NewsImage = styled.div`
  position: relative;
  height: 250px;
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'};
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const NewsOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 1.5rem;
  color: white;
`;

const NewsCategory = styled.span`
  background: #dc3545;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.8rem;
  display: inline-block;
`;

const NewsTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
  font-family: 'Arial Black', sans-serif;
`;

const NewsMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.8rem;
  opacity: 0.9;
  font-weight: 600;
`;

const NewsContent = styled.div`
  padding: 1.5rem;
`;

const NewsExcerpt = styled.p`
  color: #333;
  line-height: 1.6;
  margin: 0;
  font-size: 0.95rem;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  max-height: 4.5em;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: white;
  font-weight: 600;
`;

const ErrorMessage = styled.div`
  background: rgba(255, 255, 255, 0.9);
  color: #dc3545;
  padding: 1rem;
  border-radius: 10px;
  margin: 2rem 0;
  text-align: center;
  font-weight: 600;
  border: 2px solid #dc3545;
`;

const FilterSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

const FilterTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #dc3545;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DateFilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
`;

const DateButton = styled.button`
  background: ${props => props.active ? '#dc3545' : 'white'};
  color: ${props => props.active ? 'white' : '#dc3545'};
  border: 2px solid #dc3545;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    background: #dc3545;
    color: white;
    transform: translateY(-1px);
  }
`;

const NoNewsMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.1rem;
`;

function DiarioCorreo() {
  const navigate = useNavigate();
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [mostrarFiltroFechas, setMostrarFiltroFechas] = useState(false);
  const filtroRef = useRef(null);
  
  const { 
    noticias, 
    fechasDisponibles, 
    loading, 
    error, 
    fetchNoticiasPorFecha 
  } = useNoticiasDiario('Diario Correo', fechaSeleccionada);
  
  // Cerrar el modal al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mostrarFiltroFechas && filtroRef.current && !filtroRef.current.contains(event.target)) {
        const target = event.target;
        const isFilterButton = target.closest('button')?.textContent?.includes('Buscar por fecha') || 
                              target.closest('button')?.textContent?.includes('Limpiar filtro');
        
        if (!isFilterButton) {
          setMostrarFiltroFechas(false);
        }
      }
    };

    if (mostrarFiltroFechas) {
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mostrarFiltroFechas]);
  
  // Ordenar noticias por fecha (más recientes primero) - Diario Correo no usa imágenes
  const noticiasOrdenadas = [...noticias].sort((a, b) => {
    const fechaA = new Date(a.fecha_publicacion || a.fecha_extraccion);
    const fechaB = new Date(b.fecha_publicacion || b.fecha_extraccion);
    return fechaB - fechaA; // Más recientes primero
  });

  const noticiaPrincipal = noticiasOrdenadas.length > 0 ? noticiasOrdenadas[0] : null;
  const noticiasSecundarias = noticiasOrdenadas.slice(1);

  const handleBack = () => {
    navigate('/');
  };

  const handleFechaChange = (fecha) => {
    setFechaSeleccionada(fecha);
    fetchNoticiasPorFecha(fecha);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container>
      <Header>
        <HeaderContent>
          <BackButton onClick={handleBack}>
            <FiArrowLeft />
            Volver
          </BackButton>
          <DiarioInfo>
            <DiarioTitle>Diario Correo</DiarioTitle>
            <DiarioSubtitle>La voz del pueblo peruano</DiarioSubtitle>
          </DiarioInfo>
        </HeaderContent>
      </Header>

      <MainContent>
        {loading && <LoadingSpinner>Cargando noticias de Diario Correo...</LoadingSpinner>}
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        {!loading && !error && fechasDisponibles.length > 0 && (
          <FilterSection style={{ position: 'relative' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              marginBottom: '0.5rem'
            }}>
              <button
                onClick={() => setMostrarFiltroFechas(!mostrarFiltroFechas)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: fechaSeleccionada ? '#dc3545' : 'white',
                  color: fechaSeleccionada ? 'white' : '#dc3545',
                  border: `2px solid ${fechaSeleccionada ? '#dc3545' : '#dc3545'}`,
                  padding: '0.6rem 1.2rem',
                  borderRadius: '25px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontFamily: 'Arial, sans-serif',
                  boxShadow: fechaSeleccionada ? '0 2px 8px rgba(220, 53, 69, 0.2)' : '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <FiCalendar style={{ fontSize: '1rem' }} />
                {fechaSeleccionada 
                  ? fechasDisponibles.find(f => f.fecha === fechaSeleccionada)?.fecha_formateada || 'Fecha seleccionada'
                  : 'Buscar por fecha'}
                <FiChevronDown style={{ 
                  fontSize: '0.8rem',
                  transform: mostrarFiltroFechas ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease'
                }} />
              </button>
              
              {fechaSeleccionada && (
                <button
                  onClick={() => {
                    setFechaSeleccionada(null);
                    setMostrarFiltroFechas(false);
                    fetchNoticiasPorFecha(null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    background: 'transparent',
                    color: '#666',
                    border: 'none',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '15px',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontFamily: 'Arial, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#f0f0f0';
                    e.target.style.color = '#333';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = '#666';
                  }}
                >
                  <FiX style={{ fontSize: '0.8rem' }} />
                  Limpiar filtro
                </button>
              )}
            </div>

            {/* Modal/Dropdown de fechas */}
            {mostrarFiltroFechas && (
              <div
                ref={filtroRef}
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '0.5rem',
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  border: '1px solid #e0e0e0',
                  zIndex: 1000,
                  maxHeight: '70vh',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Header del modal */}
                <div style={{
                  padding: '1rem 1.5rem',
                  borderBottom: '1px solid #e0e0e0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#f8f9fa'
                }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#dc3545',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <FiCalendar />
                    Seleccionar fecha ({fechasDisponibles.length} fechas disponibles)
                  </h3>
                  <button
                    onClick={() => setMostrarFiltroFechas(false)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      fontSize: '1.2rem',
                      color: '#666',
                      cursor: 'pointer',
                      padding: '0.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '4px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#e0e0e0';
                      e.target.style.color = '#333';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#666';
                    }}
                  >
                    <FiX />
                  </button>
                </div>

                {/* Contenido del modal - Fechas agrupadas por mes */}
                <div style={{
                  padding: '1rem',
                  overflowY: 'auto',
                  maxHeight: 'calc(70vh - 80px)'
                }}>
                  {(() => {
                    // Agrupar fechas por mes/año
                    const fechasAgrupadas = {};
                    fechasDisponibles.forEach(fecha => {
                      const fechaObj = new Date(fecha.fecha);
                      const mesAno = fechaObj.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
                      if (!fechasAgrupadas[mesAno]) {
                        fechasAgrupadas[mesAno] = [];
                      }
                      fechasAgrupadas[mesAno].push(fecha);
                    });

                    // Ordenar meses (más reciente primero)
                    const mesesOrdenados = Object.keys(fechasAgrupadas).sort((a, b) => {
                      const fechaA = new Date(fechasAgrupadas[a][0].fecha);
                      const fechaB = new Date(fechasAgrupadas[b][0].fecha);
                      return fechaB - fechaA;
                    });

                    return mesesOrdenados.map(mesAno => (
                      <div key={mesAno} style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{
                          margin: '0 0 0.8rem 0',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          color: '#dc3545',
                          textTransform: 'capitalize',
                          paddingBottom: '0.5rem',
                          borderBottom: '2px solid #dc3545'
                        }}>
                          {mesAno}
                        </h4>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                          gap: '0.5rem'
                        }}>
                          {fechasAgrupadas[mesAno]
                            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                            .map((fecha) => (
                              <button
                                key={fecha.fecha}
                                onClick={() => {
                                  handleFechaChange(fecha.fecha);
                                  setMostrarFiltroFechas(false);
                                }}
                                style={{
                                  background: fechaSeleccionada === fecha.fecha ? '#dc3545' : '#f8f9fa',
                                  color: fechaSeleccionada === fecha.fecha ? 'white' : '#dc3545',
                                  border: `2px solid ${fechaSeleccionada === fecha.fecha ? '#dc3545' : '#dc3545'}`,
                                  padding: '0.6rem 0.8rem',
                                  borderRadius: '8px',
                                  fontSize: '0.8rem',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  gap: '0.2rem',
                                  fontFamily: 'Arial, sans-serif',
                                  textAlign: 'center'
                                }}
                                onMouseEnter={(e) => {
                                  if (fechaSeleccionada !== fecha.fecha) {
                                    e.target.style.background = '#ffe6e6';
                                    e.target.style.borderColor = '#dc3545';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (fechaSeleccionada !== fecha.fecha) {
                                    e.target.style.background = '#f8f9fa';
                                    e.target.style.borderColor = '#dc3545';
                                  }
                                }}
                              >
                                <span>{fecha.fecha_formateada}</span>
                                <span style={{
                                  fontSize: '0.7rem',
                                  opacity: 0.8,
                                  fontWeight: '500'
                                }}>
                                  {fecha.total_noticias} noticias
                                </span>
                              </button>
                            ))}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}
          </FilterSection>
        )}
        
        {!loading && !error && noticias.length > 0 && (
          <>
            {/* Layout principal: Noticia destacada + Sidebar */}
            <MainLayout>
              {/* Noticia destacada grande (primera noticia con imagen) */}
              {noticiaPrincipal && (
                <FeaturedArticle onClick={() => navigate(`/noticia/${noticiaPrincipal.id}`)}>
                  <FeaturedImage imageUrl={noticiaPrincipal.imagen_url}>
                    <FeaturedOverlay>
                      <FeaturedCategory>{noticiaPrincipal.categoria}</FeaturedCategory>
                      <FeaturedTitle>{noticiaPrincipal.titulo || 'Sin título'}</FeaturedTitle>
                      <HeroMeta style={{ marginTop: '0.75rem', marginBottom: 0 }}>
                        <MetaItem>
                          <FiCalendar />
                          {formatDate(noticiaPrincipal.fecha_publicacion)}
                        </MetaItem>
                        <MetaItem>
                          <FiClock />
                          {formatTime(noticiaPrincipal.fecha_publicacion)}
                        </MetaItem>
                      </HeroMeta>
                    </FeaturedOverlay>
                  </FeaturedImage>
                </FeaturedArticle>
              )}

              {/* Sidebar con cards verticales largos (siguientes 3 noticias) */}
              <SidebarNews>
                {noticiasSecundarias.slice(0, 3).map((noticia, index) => (
                  <SidebarCard key={index} onClick={() => navigate(`/noticia/${noticia.id}`)}>
                    {noticia.imagen_url && (
                      <SidebarImage imageUrl={noticia.imagen_url} />
                    )}
                    <SidebarContent>
                      <div>
                        <SidebarCategory>{noticia.categoria}</SidebarCategory>
                        <SidebarTitle>{noticia.titulo || 'Sin título'}</SidebarTitle>
                      </div>
                      <SidebarMeta>
                        <span>
                          <FiCalendar style={{ marginRight: '0.25rem' }} />
                          {formatDate(noticia.fecha_publicacion)}
                        </span>
                      </SidebarMeta>
                    </SidebarContent>
                  </SidebarCard>
                ))}
              </SidebarNews>
            </MainLayout>

            {/* Grid de cards pequeñas abajo (resto de noticias) */}
            {noticiasSecundarias.length > 3 && (
              <BottomNewsGrid>
                {noticiasSecundarias.slice(3).map((noticia, index) => {
                  // Alternar entre cards horizontales y verticales
                  const isHorizontal = index % 3 === 0;
                  
                  return (
                    <SmallCard 
                      key={index + 5} 
                      horizontal={isHorizontal}
                      onClick={() => navigate(`/noticia/${noticia.id}`)}
                    >
                      {noticia.imagen_url && (
                        <SmallCardImage 
                          imageUrl={noticia.imagen_url} 
                          horizontal={isHorizontal}
                        />
                      )}
                      <SmallCardContent>
                        <div>
                          <SmallCardCategory>{noticia.categoria}</SmallCardCategory>
                          <SmallCardTitle horizontal={isHorizontal}>
                            {noticia.titulo || 'Sin título'}
                          </SmallCardTitle>
                        </div>
                        <SmallCardMeta>
                          <span>
                            <FiCalendar style={{ marginRight: '0.25rem' }} />
                            {formatDate(noticia.fecha_publicacion)}
                          </span>
                        </SmallCardMeta>
                      </SmallCardContent>
                    </SmallCard>
                  );
                })}
              </BottomNewsGrid>
            )}
          </>
        )}
        
        {!loading && !error && noticias.length === 0 && (
          <NoNewsMessage>
            No hay noticias disponibles para la fecha seleccionada.
          </NoNewsMessage>
        )}
      </MainContent>
      <ChatBot context="correo" />
    </Container>
  );
}

export default DiarioCorreo;
