import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiArrowLeft, FiCalendar, FiClock, FiExternalLink, FiFileText, FiTag } from 'react-icons/fi';
import axios from 'axios';

const Container = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Header = styled.header`
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: white;
  padding: 2rem 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
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
  background: #dc3545;
  border: none;
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);

  &:hover {
    background: #c82333;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(220, 53, 69, 0.4);
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: white;
`;

const MainContent = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 3rem 2rem;
`;

const ArticleContainer = styled.article`
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15);
  }
`;

const ArticleImage = styled.div`
  position: relative;
  height: 500px;
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const ImageOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 2rem;
  color: white;
`;

const CategoryBadge = styled.span`
  background: #dc3545;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 1rem;
  display: inline-block;
`;

const ArticleTitle = styled.h2`
  font-size: 2.8rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  line-height: 1.2;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const ArticleMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  font-size: 1rem;
  opacity: 0.9;
  flex-wrap: wrap;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ArticleContent = styled.div`
  padding: 3rem;
`;

const ContentSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  color: #dc3545;
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ContentText = styled.div`
  font-size: 1.1rem;
  line-height: 1.8;
  color: #333;
  text-align: justify;
  margin-bottom: 1.5rem;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const InfoCard = styled.div`
  background: #f8f9fa;
  border-radius: 15px;
  padding: 1.5rem;
  border-left: 4px solid #dc3545;
  transition: all 0.3s ease;

  &:hover {
    background: #e9ecef;
    transform: translateY(-2px);
  }
`;

const InfoLabel = styled.div`
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 600;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoValue = styled.div`
  font-size: 1rem;
  color: #333;
  font-weight: 500;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.a`
  background: ${props => props.primary ? '#dc3545' : 'white'};
  color: ${props => props.primary ? 'white' : '#dc3545'};
  border: 2px solid #dc3545;
  padding: 1rem 2rem;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(220, 53, 69, 0.2);

  &:hover {
    background: ${props => props.primary ? '#c82333' : '#dc3545'};
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(220, 53, 69, 0.3);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  font-size: 1.2rem;
  color: #666;
`;

const ErrorContainer = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 2rem;
  border-radius: 15px;
  text-align: center;
  margin: 2rem 0;
  border: 1px solid #f5c6cb;
`;

const Breadcrumb = styled.div`
  background: white;
  padding: 1rem 2rem;
  border-radius: 15px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  font-size: 0.9rem;
  color: #6c757d;
`;

const BreadcrumbLink = styled.span`
  color: #dc3545;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

function NoticiaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNoticia = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8000/noticias/${id}`);
        setNoticia(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching noticia:', error);
        if (error.response?.status === 404) {
          setError('Noticia no encontrada');
        } else {
          setError('Error al cargar la noticia');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchNoticia();
    }
  }, [id]);

  const handleBack = () => {
    navigate(-1); // Volver a la página anterior
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <HeaderContent>
            <BackButton onClick={handleBack}>
              <FiArrowLeft />
              Volver
            </BackButton>
            <Title>Cargando Noticia...</Title>
          </HeaderContent>
        </Header>
        <MainContent>
          <LoadingContainer>
            <FiClock style={{ animation: 'spin 1s linear infinite' }} />
            Cargando detalles de la noticia...
          </LoadingContainer>
        </MainContent>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <HeaderContent>
            <BackButton onClick={handleBack}>
              <FiArrowLeft />
              Volver
            </BackButton>
            <Title>Error</Title>
          </HeaderContent>
        </Header>
        <MainContent>
          <ErrorContainer>
            <h3>¡Oops! Algo salió mal</h3>
            <p>{error}</p>
            <ActionButtons>
              <ActionButton onClick={handleBack}>
                <FiArrowLeft />
                Volver
              </ActionButton>
              <ActionButton primary onClick={handleBackToHome}>
                <FiFileText />
                Ir al Inicio
              </ActionButton>
            </ActionButtons>
          </ErrorContainer>
        </MainContent>
      </Container>
    );
  }

  if (!noticia) {
    return null;
  }

  return (
    <Container>
      <Header>
        <HeaderContent>
          <BackButton onClick={handleBack}>
            <FiArrowLeft />
            Volver
          </BackButton>
          <Title>Detalle de Noticia</Title>
        </HeaderContent>
      </Header>

      <MainContent>
        <Breadcrumb>
          <BreadcrumbLink onClick={handleBackToHome}>Inicio</BreadcrumbLink>
          {' > '}
          <BreadcrumbLink onClick={handleBack}>Noticias</BreadcrumbLink>
          {' > '}
          <span>Detalle</span>
        </Breadcrumb>

        <ArticleContainer>
          {noticia.imagen_url && (
            <ArticleImage imageUrl={noticia.imagen_url}>
              <ImageOverlay>
                <CategoryBadge>
                  <FiTag />
                  {noticia.categoria}
                </CategoryBadge>
                <ArticleTitle>{noticia.titulo}</ArticleTitle>
                <ArticleMeta>
                  <MetaItem>
                    <FiFileText />
                    {noticia.diario_nombre}
                  </MetaItem>
                  <MetaItem>
                    <FiCalendar />
                    {formatDate(noticia.fecha_publicacion)}
                  </MetaItem>
                  <MetaItem>
                    <FiClock />
                    {formatTime(noticia.fecha_publicacion)}
                  </MetaItem>
                </ArticleMeta>
              </ImageOverlay>
            </ArticleImage>
          )}

          <ArticleContent>
            {!noticia.imagen_url && (
              <ContentSection>
                <CategoryBadge>
                  <FiTag />
                  {noticia.categoria}
                </CategoryBadge>
                <ArticleTitle style={{ color: '#333', fontSize: '2.2rem', marginBottom: '1.5rem' }}>
                  {noticia.titulo}
                </ArticleTitle>
                <ArticleMeta style={{ color: '#666', marginBottom: '2rem' }}>
                  <MetaItem>
                    <FiFileText />
                    {noticia.diario_nombre}
                  </MetaItem>
                  <MetaItem>
                    <FiCalendar />
                    {formatDate(noticia.fecha_publicacion)}
                  </MetaItem>
                  <MetaItem>
                    <FiClock />
                    {formatTime(noticia.fecha_publicacion)}
                  </MetaItem>
                </ArticleMeta>
              </ContentSection>
            )}

            <InfoGrid>
              <InfoCard>
                <InfoLabel>Diario</InfoLabel>
                <InfoValue>{noticia.diario_nombre}</InfoValue>
              </InfoCard>
              <InfoCard>
                <InfoLabel>Categoría</InfoLabel>
                <InfoValue>{noticia.categoria}</InfoValue>
              </InfoCard>
              <InfoCard>
                <InfoLabel>Fecha de Publicación</InfoLabel>
                <InfoValue>{formatDate(noticia.fecha_publicacion)}</InfoValue>
              </InfoCard>
              <InfoCard>
                <InfoLabel>Fecha de Extracción</InfoLabel>
                <InfoValue>{formatDate(noticia.fecha_extraccion)}</InfoValue>
              </InfoCard>
            </InfoGrid>

            {noticia.contenido && (
              <ContentSection>
                <SectionTitle>
                  <FiFileText />
                  Contenido
                </SectionTitle>
                <ContentText>
                  {noticia.contenido}
                </ContentText>
              </ContentSection>
            )}

            <ActionButtons>
              {noticia.enlace && (
                <ActionButton 
                  href={noticia.enlace} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  primary
                >
                  <FiExternalLink />
                  Ver Noticia Original
                </ActionButton>
              )}
              <ActionButton onClick={handleBack}>
                <FiArrowLeft />
                Volver a Noticias
              </ActionButton>
              <ActionButton onClick={handleBackToHome}>
                <FiFileText />
                Ir al Inicio
              </ActionButton>
            </ActionButtons>
          </ArticleContent>
        </ArticleContainer>
      </MainContent>
    </Container>
  );
}

export default NoticiaDetalle;
