import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiArrowLeft, FiCalendar, FiClock, FiFilter, FiTrendingUp, FiEye, FiShare2 } from 'react-icons/fi';
import { useNoticiasDiario } from '../hooks/useNoticiasDiario';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdf4 100%);
  font-family: 'Inter', 'Segoe UI', 'Roboto', sans-serif;
  position: relative;
  
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(5, 150, 105, 0.05) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }
`;

const Header = styled.header`
  background: linear-gradient(135deg, #059669 0%, #10b981 50%, #22c55e 100%);
  color: white;
  padding: 4rem 0;
  box-shadow: 0 20px 60px rgba(5, 150, 105, 0.3);
  position: relative;
  overflow: hidden;
  z-index: 1;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 70% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  gap: 3rem;
  position: relative;
  z-index: 2;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 1.2rem 2.5rem;
  border-radius: 60px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-weight: 700;
  font-size: 1.1rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(30px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.4);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.6s;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.3);
    
    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(-2px) scale(1.02);
  }
`;

const DiarioInfo = styled.div`
  flex: 1;
  text-align: center;
  position: relative;
`;

const DiarioTitle = styled.h1`
  font-size: 5rem;
  font-weight: 900;
  margin: 0;
  letter-spacing: 3px;
  line-height: 1;
  font-family: 'Inter', 'Arial Black', sans-serif;
  text-transform: uppercase;
  text-align: center;
  position: relative;
  
  .el-part {
    color: #fbbf24;
    text-shadow: 
      3px 3px 0px #000,
      6px 6px 12px rgba(0, 0, 0, 0.6);
    display: inline-block;
    transform: rotate(-2deg);
    margin-right: 0.5rem;
  }
  
  .popular-part {
    color: white;
    text-shadow: 
      3px 3px 0px #000,
      6px 6px 12px rgba(0, 0, 0, 0.6);
    display: inline-block;
    transform: rotate(1deg);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 200px;
    height: 4px;
    background: linear-gradient(90deg, transparent, #fbbf24, transparent);
    border-radius: 2px;
  }
`;

const DiarioSubtitle = styled.p`
  font-size: 1.5rem;
  margin: 2rem 0 0 0;
  opacity: 0.95;
  font-weight: 600;
  letter-spacing: 2px;
  text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.5);
  color: white;
  text-transform: uppercase;
  position: relative;
  
  &::before {
    content: '✦';
    margin-right: 1rem;
    color: #fbbf24;
    font-size: 1.2rem;
  }
  
  &::after {
    content: '✦';
    margin-left: 1rem;
    color: #fbbf24;
    font-size: 1.2rem;
  }
`;

const MainContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 4rem 2rem;
  position: relative;
  z-index: 1;
`;

// Layout de cards independientes
const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2.5rem;
  margin-bottom: 4rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const NewsCard = styled.article`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 
    0 15px 50px rgba(5, 150, 105, 0.1),
    0 5px 20px rgba(16, 185, 129, 0.05);
  border: 2px solid rgba(34, 197, 94, 0.15);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  backdrop-filter: blur(20px);
  cursor: pointer;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #059669 0%, #10b981 25%, #22c55e 50%, #16a34a 75%, #15803d 100%);
    z-index: 1;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.02) 0%, transparent 50%);
    pointer-events: none;
    z-index: 1;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 
      0 25px 80px rgba(5, 150, 105, 0.2),
      0 10px 40px rgba(16, 185, 129, 0.15);
    border-color: rgba(34, 197, 94, 0.3);
  }
`;

const CardImage = styled.div`
  height: 200px;
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'linear-gradient(135deg, #059669 0%, #10b981 50%, #22c55e 100%)'};
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.6) 100%);
    z-index: 1;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(5, 150, 105, 0.1) 0%, transparent 50%);
    z-index: 1;
  }
`;

const CardOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 1.5rem;
  color: white;
  z-index: 2;
`;

const CardCategory = styled.span`
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  margin-bottom: 0.8rem;
  display: inline-block;
  box-shadow: 0 4px 15px rgba(5, 150, 105, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  position: relative;
  
  &::before {
    content: '✦';
    margin-right: 0.3rem;
    color: #fbbf24;
    font-size: 0.7rem;
  }
`;

const CardTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 800;
  margin: 0 0 0.8rem 0;
  line-height: 1.3;
  text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.8);
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.2px;
`;

const CardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.8rem;
  opacity: 0.95;
  font-weight: 600;
`;

const CardMetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.15);
  padding: 0.4rem 0.8rem;
  border-radius: 15px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
  }
`;

const CardContent = styled.div`
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.98);
`;

const CardExcerpt = styled.p`
  color: #4b5563;
  line-height: 1.6;
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  max-height: 80px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 15px;
    background: linear-gradient(transparent, rgba(255, 255, 255, 0.98));
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  font-size: 1.6rem;
  color: #059669;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 24px;
  margin: 2rem 0;
  box-shadow: 0 20px 60px rgba(5, 150, 105, 0.1);
  border: 2px solid rgba(34, 197, 94, 0.2);
  backdrop-filter: blur(20px);
  
  &::before {
    content: '✦';
    margin-right: 1rem;
    color: #fbbf24;
    font-size: 1.8rem;
    animation: spin 2s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.95) 100%);
  color: #dc2626;
  padding: 3rem;
  border-radius: 24px;
  margin: 2rem 0;
  text-align: center;
  font-weight: 700;
  border: 2px solid rgba(220, 38, 38, 0.2);
  box-shadow: 0 15px 50px rgba(220, 38, 38, 0.1);
  backdrop-filter: blur(20px);
  font-size: 1.2rem;
  position: relative;
  
  &::before {
    content: '⚠';
    display: block;
    font-size: 3rem;
    margin-bottom: 1rem;
    color: #fbbf24;
  }
`;

const FilterSection = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.95) 100%);
  padding: 3rem;
  border-radius: 28px;
  margin-bottom: 4rem;
  box-shadow: 
    0 20px 60px rgba(5, 150, 105, 0.1),
    0 8px 30px rgba(16, 185, 129, 0.05);
  border: 2px solid rgba(34, 197, 94, 0.15);
  backdrop-filter: blur(20px);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #059669 0%, #10b981 25%, #22c55e 50%, #16a34a 75%, #15803d 100%);
    border-radius: 28px 28px 0 0;
  }
`;

const FilterTitle = styled.h3`
  margin: 0 0 2rem 0;
  color: #059669;
  font-size: 1.6rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-weight: 800;
  font-family: 'Inter', sans-serif;
  text-transform: uppercase;
  letter-spacing: 1px;
  
  &::before {
    content: '✦';
    color: #fbbf24;
    font-size: 1.4rem;
  }
`;

const DateFilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: center;
`;

const DateButton = styled.button`
  background: ${props => props.active ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : 'rgba(255, 255, 255, 0.9)'};
  color: ${props => props.active ? 'white' : '#059669'};
  border: 2px solid ${props => props.active ? 'transparent' : 'rgba(34, 197, 94, 0.3)'};
  padding: 1rem 2rem;
  border-radius: 35px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 700;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  box-shadow: ${props => props.active ? '0 12px 35px rgba(5, 150, 105, 0.4)' : '0 8px 25px rgba(5, 150, 105, 0.1)'};
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.6s;
  }

  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : 'linear-gradient(135deg, #059669 0%, #10b981 100%)'};
    color: white;
    border-color: transparent;
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 16px 50px rgba(5, 150, 105, 0.4);
    
    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(-2px) scale(1.02);
  }
`;

const NoNewsMessage = styled.div`
  text-align: center;
  padding: 5rem;
  color: #059669;
  font-size: 1.4rem;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.9) 100%);
  border-radius: 28px;
  border: 2px solid rgba(34, 197, 94, 0.2);
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 60px rgba(5, 150, 105, 0.1);
  position: relative;
  
  &::before {
    content: '📰';
    display: block;
    font-size: 4rem;
    margin-bottom: 1.5rem;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 3px;
    background: linear-gradient(90deg, transparent, #059669, transparent);
    border-radius: 2px;
  }
`;

function DiarioPopular() {
  const navigate = useNavigate();
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  
  const { 
    noticias, 
    fechasDisponibles, 
    loading, 
    error, 
    fetchNoticiasPorFecha 
  } = useNoticiasDiario('El Popular', fechaSeleccionada);
  
  // Ordenar noticias: primero las que tienen imagen, luego las que no tienen
  const noticiasOrdenadas = [...noticias].sort((a, b) => {
    const aTieneImagen = a.imagen_url && a.imagen_url.trim() !== '';
    const bTieneImagen = b.imagen_url && b.imagen_url.trim() !== '';
    
    // Si ambas tienen imagen o ambas no tienen imagen, mantener orden original
    if (aTieneImagen === bTieneImagen) {
      return 0;
    }
    
    // Si a tiene imagen y b no, a va primero
    if (aTieneImagen && !bTieneImagen) {
      return -1;
    }
    
    // Si b tiene imagen y a no, b va primero
    return 1;
  });

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
            <DiarioTitle>
              <span className="el-part">el</span> <span className="popular-part">Popular</span>
            </DiarioTitle>
            <DiarioSubtitle>Noticias que importan</DiarioSubtitle>
          </DiarioInfo>
        </HeaderContent>
      </Header>

      <MainContent>
        {loading && <LoadingSpinner>Cargando noticias de El Popular...</LoadingSpinner>}
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        {!loading && !error && fechasDisponibles.length > 0 && (
          <FilterSection>
            <FilterTitle>
              <FiFilter />
              Filtrar por fecha
            </FilterTitle>
            <DateFilterContainer>
              {fechasDisponibles.map((fecha) => (
                <DateButton
                  key={fecha.fecha}
                  active={fechaSeleccionada === fecha.fecha}
                  onClick={() => handleFechaChange(fecha.fecha)}
                >
                  {fecha.fecha_formateada} ({fecha.total_noticias})
                </DateButton>
              ))}
            </DateFilterContainer>
          </FilterSection>
        )}
        
        {!loading && !error && noticias.length > 0 && (
          <CardsGrid>
            {noticiasOrdenadas.map((noticia, index) => (
              <NewsCard key={index} onClick={() => navigate(`/noticia/${noticia.id}`)}>
                <CardImage imageUrl={noticia.imagen_url}>
                  <CardOverlay>
                    <CardCategory>{noticia.categoria}</CardCategory>
                    <CardTitle>{noticia.titulo}</CardTitle>
                    <CardMeta>
                      <CardMetaItem>
                        <FiCalendar />
                        {formatDate(noticia.fecha_publicacion)}
                      </CardMetaItem>
                      <CardMetaItem>
                        <FiClock />
                        {formatTime(noticia.fecha_publicacion)}
                      </CardMetaItem>
                    </CardMeta>
                  </CardOverlay>
                </CardImage>
                <CardContent>
                  <CardExcerpt>
                    {noticia.contenido || 'Sin contenido disponible...'}
                  </CardExcerpt>
                </CardContent>
              </NewsCard>
            ))}
          </CardsGrid>
        )}
        
        {!loading && !error && noticias.length === 0 && (
          <NoNewsMessage>
            No hay noticias disponibles para la fecha seleccionada.
          </NoNewsMessage>
        )}
      </MainContent>
    </Container>
  );
}

export default DiarioPopular;
 