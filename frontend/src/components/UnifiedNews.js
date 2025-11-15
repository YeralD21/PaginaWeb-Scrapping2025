import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiFileText, FiCalendar, FiTrendingUp, FiFilter } from 'react-icons/fi';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 20px;
  margin-bottom: 2rem;
  text-align: center;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-weight: 700;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  margin: 0;
  opacity: 0.95;
`;

const FilterBar = styled.div`
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

const FilterButton = styled.button`
  background: ${props => props.active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border: 2px solid ${props => props.active ? 'transparent' : '#e9ecef'};
  padding: 0.7rem 1.5rem;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #5568d3 0%, #663f9c 100%)' : '#f8f9fa'};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const NewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const NewsCard = styled.article`
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  }
`;

const NewsImage = styled.div`
  position: relative;
  height: 200px;
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
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.55));
  padding: 0.75rem 1rem;
  color: white;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
`;

const NewsBadge = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: ${props => props.type === 'scrapping' ? 'rgba(102, 126, 234, 0.9)' : 'rgba(118, 75, 162, 0.9)'};
  color: white;
  padding: 0.25rem 0.7rem;
  border-radius: 18px;
  font-size: 0.75rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const SourceBadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  padding: 0.25rem 0.7rem;
  border-radius: 18px;
  font-size: 0.75rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
`;

const NewsCategory = styled.span`
  background: #667eea;
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: inline-block;
`;

const NewsCardContent = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const NewsTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-shadow: ${props => props.onImage ? '1px 1px 2px rgba(0, 0, 0, 0.5)' : 'none'};
`;

const NewsMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.9rem;
  color: #666;
  margin-top: 1rem;
`;

const NewsDate = styled.span`
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const StatsRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #f0f0f0;
  font-size: 0.85rem;
  color: #999;
`;

const StatItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  font-size: 1.5rem;
  color: #667eea;
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 2rem;
  border-radius: 15px;
  text-align: center;
  font-size: 1.1rem;
  margin: 2rem 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const EmptyText = styled.p`
  font-size: 1.2rem;
  color: #666;
  margin: 0.5rem 0;
`;

function UnifiedNews() {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'scrapping', 'ugc'

  useEffect(() => {
    fetchAllNews();
  }, [filter]);

  const fetchAllNews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch both types of news
      const [scrappingNews, ugcNews] = await Promise.all([
        axios.get('http://localhost:8000/noticias?limit=50'),
        axios.get('http://localhost:8000/ugc/feed?limit=50')
      ]);

      // Combine and format news
      let combinedNews = [];
      
      // Add scrapping news
      if (scrappingNews.data && Array.isArray(scrappingNews.data)) {
        combinedNews = scrappingNews.data.map(n => ({
          ...n,
          type: 'scrapping',
          source: n.diario_nombre || n.diario || 'Diario',
          date: n.fecha_publicacion,
          category: n.categoria,
          title: n.titulo || n.title,
          imageUrl: n.imagen_url || n.image_url || n.imageUrl || null
        }));
      }

      // Add UGC news
      if (ugcNews.data && Array.isArray(ugcNews.data)) {
        const ugcFormatted = ugcNews.data.map(p => ({
          id: `ugc_${p.id}`,
          titulo: p.titulo || 'Sin título',
          title: p.titulo || 'Sin título',
          contenido: p.contenido,
          content: p.contenido,
          imagen_url: p.imagen_url,
          imageUrl: p.imagen_url,
          type: 'ugc',
          author_name: p.user_email || 'Usuario',
          source: `${p.user_email || 'Usuario'} - Comunidad`,
          fecha_publicacion: p.created_at,
          date: p.created_at,
          categoria: p.tipo || 'Comunidad',
          category: p.tipo || 'Comunidad',
          views: p.views || 0,
          clicks: p.clicks || 0,
          interacciones: p.interacciones || 0,
          interactions: p.interacciones || 0
        }));
        combinedNews = [...combinedNews, ...ugcFormatted];
      }

      // Sort by date (newest first)
      combinedNews.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Apply filter
      if (filter === 'scrapping') {
        combinedNews = combinedNews.filter(n => n.type === 'scrapping');
      } else if (filter === 'ugc') {
        combinedNews = combinedNews.filter(n => n.type === 'ugc');
      }

      setNews(combinedNews);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Error al cargar las noticias');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleNewsClick = (newsItem) => {
    if (newsItem.type === 'scrapping') {
      navigate(`/noticia/${newsItem.id}`);
    } else {
      // For UGC, navigate to community or show details
      navigate(`/comunidad`);
    }
  };

  return (
    <Container>
      <Header>
        <Title>
          <FiFileText />
          Noticias Unificadas
        </Title>
        <Subtitle>
          Todas las noticias: medios tradicionales y comunidad
        </Subtitle>
      </Header>

      <FilterBar>
        <FilterButton 
          active={filter === 'all'} 
          onClick={() => setFilter('all')}
        >
          <FiTrendingUp />
          Todas las Noticias ({news.filter(n => filter === 'all' || filter === 'scrapping' || filter === 'ugc').length})
        </FilterButton>
        <FilterButton 
          active={filter === 'scrapping'} 
          onClick={() => setFilter('scrapping')}
        >
          <FiFileText />
          Medios Tradicionales
        </FilterButton>
        <FilterButton 
          active={filter === 'ugc'} 
          onClick={() => setFilter('ugc')}
        >
          <FiFileText />
          Comunidad
        </FilterButton>
      </FilterBar>

      {loading && (
        <LoadingSpinner>
          Cargando noticias...
        </LoadingSpinner>
      )}

      {error && (
        <ErrorMessage>{error}</ErrorMessage>
      )}

      {!loading && !error && news.length === 0 && (
        <EmptyState>
          <EmptyIcon>📰</EmptyIcon>
          <EmptyText>No hay noticias disponibles</EmptyText>
          <EmptyText style={{ fontSize: '1rem' }}>
            {filter === 'all' ? 'Intenta cambiar los filtros' : `No hay noticias de ${filter === 'scrapping' ? 'medios tradicionales' : 'comunidad'}`}
          </EmptyText>
        </EmptyState>
      )}

      {!loading && !error && news.length > 0 && (
        <NewsGrid>
          {news.map((item, index) => (
            <NewsCard key={`${item.type}_${item.id || index}`} onClick={() => handleNewsClick(item)}>
              {item.imageUrl && (
                <NewsImage imageUrl={item.imageUrl}>
                  <NewsBadge type={item.type}>
                    {item.type === 'scrapping' ? '📰 Medio' : '👥 Comunidad'}
                  </NewsBadge>
                  <SourceBadge>{item.source}</SourceBadge>
                  <ImageOverlay />
                </NewsImage>
              )}
              {!item.imageUrl && (
                <NewsBadge type={item.type} style={{ position: 'relative', top: '0', left: '0' }}>
                  {item.type === 'scrapping' ? '📰 Medio' : '👥 Comunidad'}
                </NewsBadge>
              )}
              <NewsCardContent>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {!item.imageUrl && (
                    <SourceBadge style={{ position: 'relative', top: '0', right: '0', marginBottom: '0' }}>
                      {item.source}
                    </SourceBadge>
                  )}
                  <NewsCategory>
                    {item.category}
                  </NewsCategory>
                </div>
                <NewsTitle>{item.title || item.titulo}</NewsTitle>
                <NewsMeta>
                  <NewsDate>
                    <FiCalendar />
                    {formatDate(item.date)}
                  </NewsDate>
                </NewsMeta>
                {item.type === 'ugc' && (item.views || item.clicks || item.interactions) && (
                  <StatsRow>
                    {item.views > 0 && (
                      <StatItem>
                        👁️ {item.views} vistas
                      </StatItem>
                    )}
                    {item.clicks > 0 && (
                      <StatItem>
                        👆 {item.clicks} clicks
                      </StatItem>
                    )}
                    {item.interactions > 0 && (
                      <StatItem>
                        💬 {item.interactions} interacciones
                      </StatItem>
                    )}
                  </StatsRow>
                )}
              </NewsCardContent>
            </NewsCard>
          ))}
        </NewsGrid>
      )}
    </Container>
  );
}

export default UnifiedNews;

