import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { FiArrowLeft, FiCalendar, FiClock, FiFilter } from 'react-icons/fi';
import { useNoticiasDiario } from '../hooks/useNoticiasDiario';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  font-family: 'Georgia', 'Times New Roman', serif;
`;

const Header = styled.header`
  background: #FFD700; /* Amarillo */
  color: #000000; /* Negro */
  padding: 2rem 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
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
  background: #000000; /* Negro */
  border: 2px solid #000000;
  color: #FFD700; /* Amarillo */
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    background: #FFD700;
    color: #000000;
    border-color: #FFD700;
    transform: translateY(-2px);
  }
`;

const DiarioInfo = styled.div`
  flex: 1;
`;

const DiarioTitle = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  font-family: 'Georgia', serif;
  color: #000000; /* Negro */
`;

const DiarioSubtitle = styled.p`
  font-size: 1.2rem;
  margin: 0.5rem 0 0 0;
  opacity: 0.9;
  font-style: italic;
  color: #000000; /* Negro */
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const HeroSection = styled.section`
  margin-bottom: 3rem;
`;

const HeroCard = styled.article`
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-left: 5px solid #1a472a;
`;

const HeroImage = styled.div`
  position: relative;
  height: 400px;
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'linear-gradient(135deg, #1a472a 0%, #2d5a3d 100%)'};
  background-size: cover;
  background-position: center;
`;

const HeroContent = styled.div`
  padding: 2rem;
`;

const HeroCategory = styled.span`
  background: #1a472a;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 3px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 1rem;
  display: inline-block;
`;

const HeroTitle = styled.h2`
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  line-height: 1.3;
  color: #1a472a;
  font-family: 'Georgia', serif;
`;

const HeroMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  font-size: 0.9rem;
  color: #666;
  border-top: 1px solid #e9ecef;
  padding-top: 1rem;
  margin-top: 1rem;
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const NewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const NewsCard = styled.article`
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-left: 3px solid #1a472a;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const NewsImage = styled.div`
  height: 200px;
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'linear-gradient(135deg, #1a472a 0%, #2d5a3d 100%)'};
  background-size: cover;
  background-position: center;
`;

const NewsContent = styled.div`
  padding: 1.5rem;
`;

const NewsCategory = styled.span`
  background: #e8f5e8;
  color: #1a472a;
  padding: 0.2rem 0.6rem;
  border-radius: 3px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 0.8rem;
  display: inline-block;
`;

const NewsTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.8rem 0;
  line-height: 1.4;
  color: #1a472a;
  font-family: 'Georgia', serif;
`;

const NewsExcerpt = styled.p`
  color: #666;
  line-height: 1.6;
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
`;

const NewsMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.8rem;
  color: #888;
  border-top: 1px solid #f1f3f4;
  padding-top: 0.8rem;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: #1a472a;
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 5px;
  margin: 2rem 0;
  text-align: center;
`;

const FilterSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const FilterTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #1a472a;
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
  background: ${props => props.active ? '#1a472a' : 'white'};
  color: ${props => props.active ? 'white' : '#1a472a'};
  border: 2px solid #1a472a;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    background: #1a472a;
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

function DiarioComercio() {
  const navigate = useNavigate();
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  
  const { 
    noticias, 
    fechasDisponibles, 
    loading, 
    error, 
    fetchNoticiasPorFecha 
  } = useNoticiasDiario('El Comercio', fechaSeleccionada);
  
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
            <DiarioTitle>El Comercio</DiarioTitle>
            <DiarioSubtitle>El decano de la prensa peruana</DiarioSubtitle>
          </DiarioInfo>
        </HeaderContent>
      </Header>

      <MainContent>
        {loading && <LoadingSpinner>Cargando noticias de El Comercio...</LoadingSpinner>}
        
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
          <>
            {/* Hero Section */}
            <HeroSection>
              {noticiaPrincipal && (
                <HeroCard>
                  <HeroImage imageUrl={noticiaPrincipal.imagen_url} />
                  <HeroContent>
                    <HeroCategory>{noticiaPrincipal.categoria}</HeroCategory>
                    <HeroTitle>{noticiaPrincipal.titulo}</HeroTitle>
                    <HeroMeta>
                      <MetaItem>
                        <FiCalendar />
                        {formatDate(noticiaPrincipal.fecha_publicacion)}
                      </MetaItem>
                      <MetaItem>
                        <FiClock />
                        {formatTime(noticiaPrincipal.fecha_publicacion)}
                      </MetaItem>
                    </HeroMeta>
                  </HeroContent>
                </HeroCard>
              )}
            </HeroSection>

            {/* News Grid */}
            <NewsGrid>
              {noticiasSecundarias.map((noticia, index) => (
                <NewsCard key={index}>
                  <NewsImage imageUrl={noticia.imagen_url} />
                  <NewsContent>
                    <NewsCategory>{noticia.categoria}</NewsCategory>
                    <NewsTitle>{noticia.titulo}</NewsTitle>
                    <NewsExcerpt>
                      {noticia.contenido || 'Sin contenido disponible...'}
                    </NewsExcerpt>
                    <NewsMeta>
                      <MetaItem>
                        <FiCalendar />
                        {formatDate(noticia.fecha_publicacion)}
                      </MetaItem>
                    </NewsMeta>
                  </NewsContent>
                </NewsCard>
              ))}
            </NewsGrid>
          </>
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

export default DiarioComercio;
