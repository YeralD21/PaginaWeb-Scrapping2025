import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { FiTrendingUp, FiAlertTriangle, FiClock, FiHeart, FiEye, FiShare2 } from 'react-icons/fi';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
`;

const FilterSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 15px;
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const FilterLabel = styled.div`
  font-weight: 600;
  color: #333;
`;

const FilterSelect = styled.select`
  padding: 0.5rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #dc3545;
  }
`;

const TrendingGrid = styled.div`
  display: grid;
  gap: 2rem;
  margin-bottom: 3rem;
`;

const FeaturedNews = styled.div`
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  }
`;

const FeaturedImage = styled.div`
  height: 400px;
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  background-size: cover;
  background-position: center;
  position: relative;
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

const BadgeContainer = styled.div`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
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
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
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
  padding: 0.4rem 0.8rem;
  border-radius: 15px;
  font-size: 0.7rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
`;

const FeaturedCategory = styled.div`
  background: #dc3545;
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 1rem;
  display: inline-block;
`;

const FeaturedTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  line-height: 1.3;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const FeaturedMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  font-size: 0.9rem;
  opacity: 0.9;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const FeaturedContent = styled.div`
  padding: 2rem;
`;

const FeaturedExcerpt = styled.p`
  color: #666;
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
`;

const KeywordsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const Keyword = styled.span`
  background: #f8f9fa;
  color: #495057;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid #e9ecef;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

const ActionButton = styled.button`
  background: ${props => props.primary ? '#dc3545' : 'transparent'};
  color: ${props => props.primary ? 'white' : '#dc3545'};
  border: 2px solid #dc3545;
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${props => props.primary ? '#c82333' : '#dc3545'};
    color: white;
    transform: translateY(-2px);
  }
`;

const SecondaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
`;

const NewsCard = styled.div`
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  }
`;

const NewsImage = styled.div`
  height: 200px;
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  background-size: cover;
  background-position: center;
  position: relative;
`;

const NewsOverlay = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.3rem;
`;

const SmallBadge = styled.div`
  background: ${props => props.color || '#dc3545'};
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
`;

const NewsContent = styled.div`
  padding: 1.5rem;
`;

const NewsCategory = styled.div`
  background: #dc3545;
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  display: inline-block;
  margin-bottom: 0.8rem;
`;

const NewsTitle = styled.h3`
  font-size: 1.1rem;
  color: #333;
  margin: 0 0 0.8rem 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const NewsMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.8rem;
  color: #666;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  font-size: 1.1rem;
  color: #666;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
`;

const getSentimentEmoji = (sentiment) => {
  switch(sentiment) {
    case 'positivo': return '😊';
    case 'negativo': return '😞';
    default: return '😐';
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const TrendingNews = () => {
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
      setNoticias(response.data);
    } catch (error) {
      console.error('Error fetching trending news:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Cargando noticias trending...</LoadingSpinner>
      </Container>
    );
  }

  const featuredNews = noticias[0];
  const secondaryNews = noticias.slice(1);

  return (
    <Container>
      <Header>
        <Title>
          <FiTrendingUp />
          Noticias Trending
        </Title>
        <Subtitle>
          Las noticias más importantes y de mayor impacto del momento
        </Subtitle>
      </Header>

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
          <FiTrendingUp size={64} color="#ccc" />
          <h3>No hay noticias trending disponibles</h3>
          <p>Intenta cambiar los filtros o vuelve más tarde</p>
        </EmptyState>
      ) : (
        <TrendingGrid>
          {featuredNews && (
            <FeaturedNews>
              <FeaturedImage imageUrl={featuredNews.imagen_url}>
                <BadgeContainer>
                  {featuredNews.es_alerta && (
                    <UrgencyBadge level={featuredNews.nivel_urgencia}>
                      <FiAlertTriangle size={14} />
                      {featuredNews.nivel_urgencia}
                    </UrgencyBadge>
                  )}
                  {featuredNews.sentimiento && (
                    <SentimentBadge sentiment={featuredNews.sentimiento}>
                      {getSentimentEmoji(featuredNews.sentimiento)}
                    </SentimentBadge>
                  )}
                </BadgeContainer>
                
                <ImageOverlay>
                  <FeaturedCategory>{featuredNews.categoria}</FeaturedCategory>
                  <FeaturedTitle>{featuredNews.titulo}</FeaturedTitle>
                  <FeaturedMeta>
                    <MetaItem>
                      <FiClock />
                      {formatDate(featuredNews.fecha_publicacion)}
                    </MetaItem>
                    <MetaItem>
                      <FiEye />
                      {featuredNews.tiempo_lectura_min || 1} min lectura
                    </MetaItem>
                    <MetaItem>
                      {featuredNews.diario_nombre}
                    </MetaItem>
                  </FeaturedMeta>
                </ImageOverlay>
              </FeaturedImage>

              <FeaturedContent>
                {featuredNews.contenido && (
                  <FeaturedExcerpt>{featuredNews.contenido.substring(0, 300)}...</FeaturedExcerpt>
                )}
                
                {featuredNews.keywords_alerta && featuredNews.keywords_alerta.length > 0 && (
                  <KeywordsList>
                    {featuredNews.keywords_alerta.map((keyword, index) => (
                      <Keyword key={index}>#{keyword}</Keyword>
                    ))}
                  </KeywordsList>
                )}

                <ActionButtons>
                  <ActionButton primary onClick={() => window.open(featuredNews.enlace, '_blank')}>
                    <FiEye />
                    Leer Completa
                  </ActionButton>
                  <ActionButton onClick={() => navigator.share && navigator.share({
                    title: featuredNews.titulo,
                    url: featuredNews.enlace
                  })}>
                    <FiShare2 />
                    Compartir
                  </ActionButton>
                </ActionButtons>
              </FeaturedContent>
            </FeaturedNews>
          )}

          <SecondaryGrid>
            {secondaryNews.map((noticia) => (
              <NewsCard key={noticia.id} onClick={() => window.open(noticia.enlace, '_blank')}>
                <NewsImage imageUrl={noticia.imagen_url}>
                  <NewsOverlay>
                    {noticia.es_alerta && (
                      <SmallBadge color={
                        noticia.nivel_urgencia === 'critica' ? '#dc3545' :
                        noticia.nivel_urgencia === 'alta' ? '#fd7e14' :
                        noticia.nivel_urgencia === 'media' ? '#ffc107' : '#6c757d'
                      }>
                        <FiAlertTriangle size={10} />
                      </SmallBadge>
                    )}
                    {noticia.sentimiento && (
                      <SmallBadge color={
                        noticia.sentimiento === 'positivo' ? '#28a745' :
                        noticia.sentimiento === 'negativo' ? '#dc3545' : '#6c757d'
                      }>
                        {getSentimentEmoji(noticia.sentimiento)}
                      </SmallBadge>
                    )}
                  </NewsOverlay>
                </NewsImage>

                <NewsContent>
                  <NewsCategory>{noticia.categoria}</NewsCategory>
                  <NewsTitle>{noticia.titulo}</NewsTitle>
                  
                  <NewsMeta>
                    <MetaItem>
                      <FiClock size={12} />
                      {formatDate(noticia.fecha_publicacion)}
                    </MetaItem>
                    <MetaItem>
                      {noticia.tiempo_lectura_min || 1} min
                    </MetaItem>
                    <MetaItem>
                      {noticia.diario_nombre}
                    </MetaItem>
                  </NewsMeta>
                </NewsContent>
              </NewsCard>
            ))}
          </SecondaryGrid>
        </TrendingGrid>
      )}
    </Container>
  );
};

export default TrendingNews;
