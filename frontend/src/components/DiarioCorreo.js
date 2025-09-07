import React from 'react';
import styled from 'styled-components';
import { FiArrowLeft, FiCalendar, FiClock } from 'react-icons/fi';

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

function DiarioCorreo({ noticias, onBack, loading, error }) {
  const noticiaPrincipal = noticias.length > 0 ? noticias[0] : null;
  const noticiasSecundarias = noticias.slice(1);

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
          <BackButton onClick={onBack}>
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
        
        {!loading && !error && noticias.length > 0 && (
          <>
            {/* Hero Section */}
            <HeroSection>
              {noticiaPrincipal && (
                <HeroCard>
                  <HeroImage imageUrl={noticiaPrincipal.imagen_url}>
                    <HeroOverlay>
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
                    </HeroOverlay>
                  </HeroImage>
                </HeroCard>
              )}
            </HeroSection>

            {/* News Grid */}
            <NewsGrid>
              {noticiasSecundarias.map((noticia, index) => (
                <NewsCard key={index}>
                  <NewsImage imageUrl={noticia.imagen_url}>
                    <NewsOverlay>
                      <NewsCategory>{noticia.categoria}</NewsCategory>
                      <NewsTitle>{noticia.titulo}</NewsTitle>
                      <NewsMeta>
                        <MetaItem>
                          <FiCalendar />
                          {formatDate(noticia.fecha_publicacion)}
                        </MetaItem>
                      </NewsMeta>
                    </NewsOverlay>
                  </NewsImage>
                  <NewsContent>
                    <NewsExcerpt>
                      {noticia.contenido || 'Sin contenido disponible...'}
                    </NewsExcerpt>
                  </NewsContent>
                </NewsCard>
              ))}
            </NewsGrid>
          </>
        )}
      </MainContent>
    </Container>
  );
}

export default DiarioCorreo;
