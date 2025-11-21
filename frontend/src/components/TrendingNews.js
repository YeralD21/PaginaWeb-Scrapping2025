import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { FiTrendingUp, FiAlertTriangle, FiClock, FiHeart, FiEye, FiShare2, FiArrowLeft } from 'react-icons/fi';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1f3a 0%, #2d3561 50%, #1a1f3a 100%);
  padding: 2rem;
`;

const Header = styled.header`
  background: rgba(26, 31, 58, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(102, 126, 234, 0.2);
  color: white;
  padding: 1.5rem 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  border-radius: 16px;
  margin-bottom: 2rem;
  position: sticky;
  top: 1rem;
  z-index: 100;
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
`;

const BackButton = styled.button`
  background: rgba(102, 126, 234, 0.2);
  color: white;
  border: 1px solid rgba(102, 126, 234, 0.3);
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.3);
    border-color: rgba(102, 126, 234, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }
`;

const TitleSection = styled.div`
  flex: 1;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  margin: 0;
  font-weight: 300;
`;

const MainContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const FilterSection = styled.div`
  background: rgba(26, 31, 58, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(102, 126, 234, 0.2);
  padding: 1.5rem;
  border-radius: 16px;
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const FilterLabel = styled.div`
  font-weight: 600;
  color: white;
`;

const FilterSelect = styled.select`
  padding: 0.6rem 1rem;
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 8px;
  font-size: 0.9rem;
  color: white;
  transition: all 0.3s ease;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: rgba(102, 126, 234, 0.5);
    background: rgba(102, 126, 234, 0.2);
  }

  option {
    background: #1a1f3a;
    color: white;
  }
`;

// Layout variado tipo masonry - estilo diario compacto
const MasonryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 0.6rem;
  align-items: start;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 0.8rem;
  }
  
  @media (min-width: 1200px) {
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 0.8rem;
  }
`;

// Tarjeta grande (featured)
const LargeCard = styled.article`
  grid-column: span 2;
  background: rgba(26, 31, 58, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: ${props => props.height || 'fit-content'};
  min-height: ${props => props.minHeight || '380px'};
  max-height: ${props => props.maxHeight || '420px'};

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(102, 126, 234, 0.2);
    border-color: rgba(102, 126, 234, 0.4);
  }

  @media (max-width: 768px) {
    grid-column: span 1;
    min-height: ${props => props.minHeight || '280px'};
    max-height: ${props => props.maxHeight || '320px'};
  }
`;

// Tarjeta mediana
const MediumCard = styled.article`
  grid-column: span 1;
  background: rgba(26, 31, 58, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: ${props => props.height || 'fit-content'};
  min-height: ${props => props.minHeight || '280px'};
  max-height: ${props => props.maxHeight || '320px'};

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(102, 126, 234, 0.2);
    border-color: rgba(102, 126, 234, 0.4);
  }
`;

// Tarjeta pequeña
const SmallCard = styled.article`
  grid-column: span 1;
  background: rgba(26, 31, 58, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: ${props => props.height || 'fit-content'};
  min-height: ${props => props.minHeight || '220px'};
  max-height: ${props => props.maxHeight || '260px'};

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(102, 126, 234, 0.2);
    border-color: rgba(102, 126, 234, 0.4);
  }
`;

const NewsImage = styled.div`
  width: 100%;
  height: ${props => props.height || '250px'};
  background: ${props => props.imageUrl 
    ? `url(${props.imageUrl})` 
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  background-size: cover;
  background-position: center;
  position: relative;
  flex-shrink: 0;
`;

const ImageOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 1rem 1.5rem;
  color: white;
`;

const BadgeContainer = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const UrgencyBadge = styled.div`
  background: ${props => {
    switch(props.level) {
      case 'critica': return 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
      case 'alta': return 'linear-gradient(135deg, #fd7e14 0%, #e55a00 100%)';
      case 'media': return 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)';
      default: return 'linear-gradient(135deg, #6c757d 0%, #545b62 100%)';
    }
  }};
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
`;

const SentimentBadge = styled.div`
  background: ${props => {
    switch(props.sentiment) {
      case 'positivo': return 'linear-gradient(135deg, #28a745 0%, #1e7e34 100%)';
      case 'negativo': return 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
      default: return 'linear-gradient(135deg, #6c757d 0%, #545b62 100%)';
    }
  }};
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: 10px;
  font-size: 0.65rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
`;

const TrendingBadge = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
`;

const NewsContent = styled.div`
  padding: 1.2rem 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  justify-content: flex-start;
`;

const NewsCategory = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-block;
  width: fit-content;
`;

const NewsTitle = styled.h3`
  font-size: ${props => props.size === 'large' ? '1.4rem' : props.size === 'medium' ? '1.1rem' : '0.95rem'};
  font-weight: 700;
  margin: 0;
  line-height: 1.25;
  color: white;
  display: -webkit-box;
  -webkit-line-clamp: ${props => props.size === 'large' ? 3 : props.size === 'medium' ? 2 : 2};
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex-shrink: 0;
`;

const NewsExcerpt = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: ${props => props.size === 'large' ? '0.95rem' : '0.85rem'};
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: ${props => props.size === 'large' ? 3 : props.size === 'medium' ? 2 : 2};
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex-shrink: 0;
`;

const NewsMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  flex-wrap: wrap;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(102, 126, 234, 0.2);
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(26, 31, 58, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 16px;
`;

const getSentimentEmoji = (sentiment) => {
  switch(sentiment) {
    case 'positivo': return '😊';
    case 'negativo': return '😞';
    default: return '😐';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible';
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Función para determinar el tamaño de la tarjeta basado en el índice
const getCardSize = (index, total, hasImage, contentLength) => {
  // Patrón variado: grande, mediano, pequeño, mediano, pequeño, grande, etc.
  const pattern = index % 6;
  
  // Altura de imagen fija según tipo (compacta)
  const imageHeight = hasImage 
    ? (pattern === 0 || pattern === 5 ? 240 : pattern === 1 || pattern === 3 ? 180 : 140) 
    : 0;
  
  // Altura de contenido basada en longitud del texto
  const textLength = contentLength || 0;
  const contentHeight = Math.min(Math.max(textLength / 30, 40), 90);
  
  // Padding y espaciado interno (muy reducido)
  const padding = 60; // padding top + bottom + gaps
  
  // Altura total estimada
  const totalHeight = imageHeight + contentHeight + padding;
  
  if (pattern === 0 || pattern === 5) {
    return { 
      type: 'large', 
      height: `${totalHeight}px`,
      minHeight: hasImage ? '380px' : '260px',
      maxHeight: hasImage ? '420px' : '320px'
    };
  } else if (pattern === 1 || pattern === 3) {
    return { 
      type: 'medium', 
      height: `${totalHeight}px`,
      minHeight: hasImage ? '280px' : '220px',
      maxHeight: hasImage ? '320px' : '260px'
    };
  } else {
    return { 
      type: 'small', 
      height: `${totalHeight}px`,
      minHeight: hasImage ? '220px' : '180px',
      maxHeight: hasImage ? '260px' : '220px'
    };
  }
};

const TrendingNews = () => {
  const navigate = useNavigate();
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoria, setCategoria] = useState('');
  const [limit, setLimit] = useState(20);

  const categorias = ['Deportes', 'Economía', 'Espectáculos', 'Mundo', 'Política'];

  useEffect(() => {
    fetchTrendingNews();
  }, [categoria, limit]);

  const fetchTrendingNews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoria) params.append('categoria', categoria);
      params.append('limit', limit);

      const response = await axios.get(`http://localhost:8000/trending/noticias?${params}`);
      setNoticias(response.data || []);
    } catch (error) {
      console.error('Error fetching trending news:', error);
      setNoticias([]);
    } finally {
      setLoading(false);
    }
  };

  // Mezclar noticias para un layout más aleatorio
  const shuffledNews = useMemo(() => {
    const shuffled = [...noticias];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [noticias]);

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Cargando noticias trending...</LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderContent>
          <BackButton onClick={() => navigate('/')}>
            <FiArrowLeft />
            Volver
          </BackButton>
          <TitleSection>
            <Title>
              <FiTrendingUp />
              Noticias Trending
            </Title>
            <Subtitle>
              Las noticias más importantes y de mayor impacto del momento
            </Subtitle>
          </TitleSection>
          <div style={{ width: '140px' }}></div>
        </HeaderContent>
      </Header>

      <MainContent>
        <FilterSection>
          <FilterLabel>Filtrar por:</FilterLabel>
          <FilterSelect value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            <option value="">Todas las categorías</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </FilterSelect>
          
          <FilterLabel>Mostrar:</FilterLabel>
          <FilterSelect value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
            <option value={10}>10 noticias</option>
            <option value={20}>20 noticias</option>
            <option value={50}>50 noticias</option>
          </FilterSelect>
        </FilterSection>

        {noticias.length === 0 ? (
          <EmptyState>
            <FiTrendingUp size={64} style={{ opacity: 0.5, marginBottom: '1rem' }} />
            <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>No hay noticias trending disponibles</h3>
            <p>Intenta cambiar los filtros o vuelve más tarde</p>
          </EmptyState>
        ) : (
          <MasonryGrid>
            {shuffledNews.map((noticia, index) => {
              const hasImage = !!noticia.imagen_url;
              const contentLength = noticia.contenido ? noticia.contenido.length : 0;
              const cardSize = getCardSize(index, shuffledNews.length, hasImage, contentLength);
              const CardComponent = cardSize.type === 'large' ? LargeCard : 
                                   cardSize.type === 'medium' ? MediumCard : SmallCard;
              
              const excerpt = noticia.contenido 
                ? noticia.contenido.substring(0, cardSize.type === 'large' ? 180 : cardSize.type === 'medium' ? 120 : 80)
                : '';

              const imageHeight = cardSize.type === 'large' ? '240px' : cardSize.type === 'medium' ? '180px' : '140px';
              
              return (
                <CardComponent
                  key={noticia.id}
                  height={cardSize.height}
                  minHeight={cardSize.minHeight}
                  maxHeight={cardSize.maxHeight}
                  onClick={() => window.open(noticia.enlace, '_blank')}
                >
                  <NewsImage imageUrl={noticia.imagen_url} height={imageHeight}>
                    <TrendingBadge>
                      <FiTrendingUp size={12} />
                      Trending
                    </TrendingBadge>
                    <BadgeContainer>
                      {noticia.es_alerta && (
                        <UrgencyBadge level={noticia.nivel_urgencia || 'media'}>
                          <FiAlertTriangle size={12} />
                          {noticia.nivel_urgencia || 'Alerta'}
                        </UrgencyBadge>
                      )}
                      {noticia.sentimiento && (
                        <SentimentBadge sentiment={noticia.sentimiento}>
                          {getSentimentEmoji(noticia.sentimiento)}
                        </SentimentBadge>
                      )}
                    </BadgeContainer>
                    {cardSize.type === 'large' && (
                      <ImageOverlay>
                        <NewsCategory>{noticia.categoria}</NewsCategory>
                        <NewsTitle size="large" style={{ color: 'white', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>
                          {noticia.titulo}
                        </NewsTitle>
                        <NewsMeta style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                          <MetaItem>
                            <FiClock size={14} />
                            {formatDate(noticia.fecha_publicacion)}
                          </MetaItem>
                          <MetaItem>
                            <FiEye size={14} />
                            {noticia.tiempo_lectura_min || 1} min lectura
                          </MetaItem>
                          <MetaItem>
                            {noticia.diario_nombre}
                          </MetaItem>
                        </NewsMeta>
                      </ImageOverlay>
                    )}
                  </NewsImage>

                  <NewsContent>
                    {cardSize.type !== 'large' && (
                      <NewsCategory>{noticia.categoria}</NewsCategory>
                    )}
                    {cardSize.type !== 'large' && (
                      <NewsTitle size={cardSize.type}>
                        {noticia.titulo}
                      </NewsTitle>
                    )}
                    {excerpt && (
                      <NewsExcerpt size={cardSize.type}>
                        {excerpt}...
                      </NewsExcerpt>
                    )}
                    <NewsMeta>
                      <MetaItem>
                        <FiClock size={12} />
                        {formatDate(noticia.fecha_publicacion)}
                      </MetaItem>
                      {cardSize.type !== 'small' && (
                        <MetaItem>
                          <FiEye size={12} />
                          {noticia.tiempo_lectura_min || 1} min
                        </MetaItem>
                      )}
                      <MetaItem>
                        {noticia.diario_nombre}
                      </MetaItem>
                    </NewsMeta>
                  </NewsContent>
                </CardComponent>
              );
            })}
          </MasonryGrid>
        )}
      </MainContent>
    </Container>
  );
};

export default TrendingNews;
