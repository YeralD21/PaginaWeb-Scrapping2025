import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { FiArrowLeft, FiCalendar, FiClock, FiExternalLink, FiFileText, FiTag, FiUser, FiHeart, FiTrendingUp, FiAlertTriangle, FiBookOpen, FiGlobe, FiMapPin, FiHash, FiShare2, FiEye, FiChevronDown, FiChevronUp, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import axios from 'axios';

// Animaciones
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

// Header ultra moderno
const Header = styled.header`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const BackButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
    animation: ${pulse} 0.6s ease-in-out;
  }
`;

const HeaderTitle = styled.h1`
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

// Layout principal más dinámico
const MainLayout = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 3rem;
  animation: ${fadeInUp} 0.8s ease-out;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr 300px;
    gap: 2rem;
  }

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 1rem;
  }
`;

// Contenedor principal del artículo
const ArticleMain = styled.main`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: ${slideIn} 0.6s ease-out;
`;

// Header del artículo mejorado
const ArticleHeader = styled.div`
  padding: 3rem 3rem 2rem 3rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  
  @media (max-width: 768px) {
    padding: 2rem 1.5rem 1.5rem 1.5rem;
  }
`;

const CategoryBadge = styled.span`
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  padding: 0.6rem 1.5rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: inline-block;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
  animation: ${pulse} 2s infinite;
`;

const ArticleTitle = styled.h1`
  font-size: 2.8rem;
  font-weight: 800;
  color: #2c3e50;
  line-height: 1.2;
  margin: 0 0 2rem 0;
  background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const ArticleMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 2.5rem;
  font-size: 0.95rem;
  color: #7f8c8d;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.8);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 1);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const DiarioName = styled.div`
  font-weight: 700;
  font-size: 1.2rem;
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
`;

// Imagen mejorada con overlay
const ArticleImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 450px;
  margin: 0 -3rem 2rem -3rem;
  overflow: hidden;
  
  @media (max-width: 768px) {
    height: 300px;
    margin: 0 -1.5rem 2rem -1.5rem;
  }
`;

const ArticleImage = styled.div`
  width: 100%;
  height: 100%;
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  background-size: cover;
  background-position: center;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }
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

// Contenido con mejor manejo de texto largo
const ArticleContent = styled.div`
  padding: 0 3rem 3rem 3rem;
  
  @media (max-width: 768px) {
    padding: 0 1.5rem 2rem 1.5rem;
  }
`;

const ContentSection = styled.div`
  margin-bottom: 2.5rem;
  animation: ${fadeInUp} 0.6s ease-out;
`;

const SectionTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #ecf0f1;
`;

// Contenido expandible para textos largos
const ExpandableContent = styled.div`
  position: relative;
  max-height: ${props => props.expanded ? 'none' : '400px'};
  overflow: hidden;
  transition: max-height 0.5s ease;
`;

const ContentText = styled.div`
  font-size: 1.15rem;
  line-height: 1.9;
  color: #2c3e50;
  text-align: justify;
  
  p {
    margin-bottom: 1.8rem;
    transition: all 0.3s ease;
  }
  
  p:hover {
    color: #34495e;
  }
  
  @media (max-width: 768px) {
    font-size: 1rem;
    line-height: 1.7;
  }
`;

const ExpandButton = styled.button`
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 2rem auto 0 auto;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(52, 152, 219, 0.6);
  }
`;

const FadeOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(transparent, rgba(255, 255, 255, 0.95));
  pointer-events: none;
  opacity: ${props => props.show ? 1 : 0};
  transition: opacity 0.3s ease;
`;

// Sidebar mejorada
const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  animation: ${slideIn} 0.8s ease-out 0.2s both;
`;

const SidebarCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }
`;

const SidebarTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding-bottom: 0.8rem;
  border-bottom: 2px solid #ecf0f1;
`;

// Información mejorada
const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.02);
    margin: 0 -1rem;
    padding: 1rem;
    border-radius: 8px;
  }
`;

const InfoLabel = styled.span`
  font-size: 0.9rem;
  color: #7f8c8d;
  font-weight: 600;
`;

const InfoValue = styled.span`
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 700;
  text-align: right;
`;

// Badges mejorados
const BadgesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-bottom: 2rem;
`;

const Badge = styled.span`
  background: ${props => {
    switch(props.type) {
      case 'alert-critica': return 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)';
      case 'alert-alta': return 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)';
      case 'alert-media': return 'linear-gradient(135deg, #f1c40f 0%, #f39c12 100%)';
      case 'alert-baja': return 'linear-gradient(135deg, #27ae60 0%, #229954 100%)';
      case 'sentiment-positivo': return 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)';
      case 'sentiment-negativo': return 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)';
      case 'sentiment-neutral': return 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)';
      case 'trending': return 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)';
      default: return 'linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%)';
    }
  }};
  color: ${props => props.type?.includes('media') ? '#2c3e50' : 'white'};
  padding: 0.6rem 1.2rem;
  border-radius: 25px;
  font-size: 0.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }
`;

// Tags modernos
const TagsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
`;

const Tag = styled.span`
  background: rgba(255, 255, 255, 0.9);
  color: #2c3e50;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 2px solid #ecf0f1;
  transition: all 0.3s ease;

  &:hover {
    background: #3498db;
    color: white;
    border-color: #3498db;
    transform: translateY(-2px);
  }
`;

const KeywordTag = styled.span`
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.4);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(231, 76, 60, 0.6);
  }
`;

// Botón de acción mejorado
const ActionButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  padding: 1.2rem 2rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.3s ease;
  margin-top: 1.5rem;
  box-shadow: 0 6px 20px rgba(231, 76, 60, 0.4);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 35px rgba(231, 76, 60, 0.6);
    animation: ${pulse} 0.6s ease-in-out;
  }
`;

// Estados mejorados
const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  font-size: 1.2rem;
  color: #7f8c8d;
  flex-direction: column;
  gap: 1.5rem;
`;

const LoadingSpinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid #ecf0f1;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorContainer = styled.div`
  background: linear-gradient(135deg, #ff7675 0%, #fd79a8 100%);
  color: white;
  padding: 3rem;
  border-radius: 20px;
  text-align: center;
  margin: 2rem;
  box-shadow: 0 10px 30px rgba(255, 118, 117, 0.4);
`;

// Breadcrumb mejorado
const Breadcrumb = styled.nav`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  margin-bottom: 2rem;
  border-radius: 50px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  font-size: 0.9rem;
  color: #7f8c8d;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const BreadcrumbLink = styled.span`
  color: #3498db;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    color: #2980b9;
    text-decoration: underline;
  }
`;

// Resumen destacado mejorado
const ResumenCard = styled.div`
  background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%);
  padding: 2.5rem;
  border-radius: 20px;
  border-left: 6px solid #27ae60;
  box-shadow: 0 8px 25px rgba(39, 174, 96, 0.2);
  margin-bottom: 3rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent
    );
    animation: ${shimmer} 2s infinite;
  }
`;

const ResumenTitle = styled.h3`
  color: #27ae60;
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const ResumenText = styled.p`
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.8;
  color: #2c3e50;
  font-weight: 500;
`;

function NoticiaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contentExpanded, setContentExpanded] = useState(false);

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
    navigate(-1);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
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

  const toggleContent = () => {
    setContentExpanded(!contentExpanded);
  };

  const isContentLong = noticia?.contenido && noticia.contenido.length > 1000;

  if (loading) {
    return (
      <Container>
        <Header>
          <HeaderContent>
            <BackButton onClick={handleBack}>
              <FiArrowLeft />
              Volver
            </BackButton>
            <HeaderTitle>Cargando...</HeaderTitle>
          </HeaderContent>
        </Header>
        <LoadingContainer>
          <LoadingSpinner />
          <span style={{ fontSize: '1.2rem', fontWeight: '600' }}>Cargando detalles de la noticia...</span>
        </LoadingContainer>
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
            <HeaderTitle>Error</HeaderTitle>
          </HeaderContent>
        </Header>
        <ErrorContainer>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '2rem' }}>¡Oops! Algo salió mal</h2>
          <p style={{ fontSize: '1.1rem', margin: '0 0 2rem 0' }}>{error}</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={handleBack} style={{ 
              background: 'rgba(255, 255, 255, 0.2)', color: 'white', border: 'none', 
              padding: '1rem 2rem', borderRadius: '50px', cursor: 'pointer', fontWeight: '600'
            }}>
              <FiArrowLeft style={{ marginRight: '0.5rem' }} />
              Volver
            </button>
            <button onClick={handleBackToHome} style={{ 
              background: 'rgba(255, 255, 255, 0.9)', color: '#e74c3c', border: 'none', 
              padding: '1rem 2rem', borderRadius: '50px', cursor: 'pointer', fontWeight: '600'
            }}>
              <FiFileText style={{ marginRight: '0.5rem' }} />
              Ir al Inicio
            </button>
          </div>
        </ErrorContainer>
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
          <HeaderTitle>Detalle de Noticia</HeaderTitle>
        </HeaderContent>
      </Header>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
        <Breadcrumb>
          <BreadcrumbLink onClick={handleBackToHome}>🏠 Inicio</BreadcrumbLink>
          {' / '}
          <BreadcrumbLink onClick={handleBack}>📰 Noticias</BreadcrumbLink>
          {' / '}
          <span>📄 Detalle</span>
        </Breadcrumb>
      </div>

      <MainLayout>
        <ArticleMain>
          <ArticleHeader>
            <CategoryBadge>
              {noticia.categoria}
            </CategoryBadge>
            <ArticleTitle>{noticia.titulo}</ArticleTitle>
            <DiarioName>📰 {noticia.diario_nombre}</DiarioName>
            <ArticleMeta>
              <MetaItem>
                <FiCalendar />
                {formatDate(noticia.fecha_publicacion)}
              </MetaItem>
              <MetaItem>
                <FiClock />
                {formatTime(noticia.fecha_publicacion)}
              </MetaItem>
              {noticia.tiempo_lectura_min && (
                <MetaItem>
                  <FiBookOpen />
                  {noticia.tiempo_lectura_min} min
                </MetaItem>
              )}
            </ArticleMeta>

            {/* Badges de estado */}
            <BadgesContainer>
              {noticia.es_alerta && (
                <Badge type={`alert-${noticia.nivel_urgencia}`}>
                  <FiAlertTriangle />
                  Alerta {noticia.nivel_urgencia}
                </Badge>
              )}
              
              {noticia.sentimiento && (
                <Badge type={`sentiment-${noticia.sentimiento}`}>
                  <FiHeart />
                  {noticia.sentimiento === 'positivo' ? '😊' : 
                   noticia.sentimiento === 'negativo' ? '😞' : '😐'} 
                  {noticia.sentimiento}
                </Badge>
              )}
              
              {noticia.es_trending && (
                <Badge type="trending">
                  <FiTrendingUp />
                  Trending
                </Badge>
              )}
            </BadgesContainer>
          </ArticleHeader>

          {noticia.imagen_url && (
            <ArticleImageContainer>
              <ArticleImage imageUrl={noticia.imagen_url} />
            </ArticleImageContainer>
          )}

          <ArticleContent>
            {noticia.resumen_auto && (
              <ResumenCard>
                <ResumenTitle>
                  <FiBookOpen />
                  Resumen Ejecutivo
                </ResumenTitle>
                <ResumenText>
                  {noticia.resumen_auto}
                </ResumenText>
              </ResumenCard>
            )}

            {noticia.contenido && (
              <ContentSection>
                <SectionTitle>
                  <FiFileText />
                  Contenido Completo
                </SectionTitle>
                <ExpandableContent expanded={contentExpanded}>
                  <ContentText>
                    {noticia.contenido.split('\n').map((paragraph, index) => (
                      paragraph.trim() && <p key={index}>{paragraph}</p>
                    ))}
                  </ContentText>
                  <FadeOverlay show={isContentLong && !contentExpanded} />
                </ExpandableContent>
                
                {isContentLong && (
                  <ExpandButton onClick={toggleContent}>
                    {contentExpanded ? (
                      <>
                        <FiChevronUp />
                        Mostrar Menos
                      </>
                    ) : (
                      <>
                        <FiChevronDown />
                        Leer Más
                      </>
                    )}
                  </ExpandButton>
                )}
              </ContentSection>
            )}
          </ArticleContent>
        </ArticleMain>

        <Sidebar>
          {/* Información del artículo */}
          <SidebarCard>
            <SidebarTitle>
              <FiFileText />
              Información
            </SidebarTitle>
            <InfoItem>
              <InfoLabel>📰 Diario</InfoLabel>
              <InfoValue>{noticia.diario_nombre}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>🏷️ Categoría</InfoLabel>
              <InfoValue>{noticia.categoria}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>📅 Fecha</InfoLabel>
              <InfoValue>{formatDate(noticia.fecha_publicacion)}</InfoValue>
            </InfoItem>
            {noticia.autor && (
              <InfoItem>
                <InfoLabel>👤 Autor</InfoLabel>
                <InfoValue>{noticia.autor}</InfoValue>
              </InfoItem>
            )}
            {noticia.region && (
              <InfoItem>
                <InfoLabel>🌍 Región</InfoLabel>
                <InfoValue>{noticia.region}</InfoValue>
              </InfoItem>
            )}
          </SidebarCard>

          {/* Palabras clave */}
          {(noticia.palabras_clave && noticia.palabras_clave.length > 0) && (
            <SidebarCard>
              <SidebarTitle>
                <FiHash />
                Palabras Clave
              </SidebarTitle>
              <TagsList>
                {noticia.palabras_clave.map((keyword, index) => (
                  <KeywordTag key={index}>#{keyword}</KeywordTag>
                ))}
              </TagsList>
            </SidebarCard>
          )}

          {/* Tags */}
          {(noticia.tags && noticia.tags.length > 0) && (
            <SidebarCard>
              <SidebarTitle>
                <FiTag />
                Etiquetas
              </SidebarTitle>
              <TagsList>
                {noticia.tags.map((tag, index) => (
                  <Tag key={index}>{tag}</Tag>
                ))}
              </TagsList>
            </SidebarCard>
          )}

          {/* Botón de acción */}
          {noticia.enlace && (
            <SidebarCard>
              <ActionButton 
                href={noticia.enlace} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <FiExternalLink />
                Ver Noticia Original
              </ActionButton>
            </SidebarCard>
          )}
        </Sidebar>
      </MainLayout>
    </Container>
  );
}

export default NoticiaDetalle;