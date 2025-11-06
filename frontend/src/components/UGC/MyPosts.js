import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import ReactionBar from '../Community/ReactionBar';

const Container = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 1.5rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, ${props => props.color || '#667eea'} 0%, ${props => props.color2 || '#764ba2'} 100%);
  padding: 1.5rem;
  border-radius: 12px;
  color: white;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
`;

const PostsGrid = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const PostCard = styled.div`
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  transition: border-color 0.3s, transform 0.2s;

  &:hover {
    border-color: #667eea;
    transform: translateY(-2px);
  }
`;

const PostImage = styled.img`
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const PostTitle = styled.h3`
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
  font-weight: 600;
`;

const PostDescription = styled.div`
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
  font-style: italic;
`;

const PostSource = styled.div`
  color: #888;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
`;

const PostStatus = styled.span`
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-left: 1rem;
  ${props => {
    switch(props.status) {
      case 'pending_review':
        return 'background: #fff3cd; color: #856404;';
      case 'published':
        return 'background: #d4edda; color: #155724;';
      case 'rejected':
        return 'background: #f8d7da; color: #721c24;';
      case 'flagged':
        return 'background: #fff3cd; color: #856404;';
      default:
        return 'background: #d1ecf1; color: #0c5460;';
    }
  }}
`;

const PostHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const PostType = styled.span`
  background: #667eea;
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
`;

const PostDate = styled.span`
  color: #888;
  font-size: 0.9rem;
`;

const PostContent = styled.div`
  color: #555;
  margin-bottom: 1rem;
  line-height: 1.6;
`;

const PostMetrics = styled.div`
  display: flex;
  gap: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
  font-size: 0.9rem;
`;

const Metric = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
`;

const Loading = styled.div`
  text-align: center;
  padding: 3rem;
  color: #888;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #888;
  font-size: 1.1rem;
`;

const API_BASE = 'http://localhost:8000';

const TIPO_EMOJIS = {
  texto: '📝',
  imagen: '🖼️',
  video: '🎥',
  comentario: '💬',
  resena: '⭐',
  post: '📄',
  noticia: '📰'
};

function MyPosts({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_BASE}/ugc/my-posts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setData(response.data);
    } catch (err) {
      console.error('Error al cargar posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [token]);

  if (loading) {
    return (
      <Container>
        <Loading>Cargando tus publicaciones...</Loading>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container>
        <EmptyState>Error al cargar publicaciones</EmptyState>
      </Container>
    );
  }

  const { posts, stats } = data;

  return (
    <Container>
      <Title>📊 Mis Publicaciones</Title>

      <StatsGrid>
        <StatCard color="#667eea" color2="#764ba2">
          <StatValue>{stats.total_posts}</StatValue>
          <StatLabel>Total Posts</StatLabel>
        </StatCard>

        <StatCard color="#f093fb" color2="#f5576c">
          <StatValue>{stats.total_views}</StatValue>
          <StatLabel>👁️ Views</StatLabel>
        </StatCard>

        <StatCard color="#4facfe" color2="#00f2fe">
          <StatValue>{stats.total_clicks}</StatValue>
          <StatLabel>🖱️ Clicks</StatLabel>
        </StatCard>

        <StatCard color="#43e97b" color2="#38f9d7">
          <StatValue>${stats.total_ganancia}</StatValue>
          <StatLabel>💰 Ganancias</StatLabel>
        </StatCard>
      </StatsGrid>

      <PostsGrid>
        {posts.length === 0 ? (
          <EmptyState>
            No tienes publicaciones aún.<br/>
            ¡Crea tu primera publicación arriba!
          </EmptyState>
        ) : (
          posts.map(post => (
            <PostCard key={post.id}>
              <PostHeader>
                <div>
                  <PostType>
                    {TIPO_EMOJIS[post.tipo] || '📄'} {post.tipo.toUpperCase()}
                  </PostType>
                  <PostStatus status={post.estado}>
                    {post.estado === 'pending_review' && '⏳ Pendiente de Revisión'}
                    {post.estado === 'published' && '✅ Publicado'}
                    {post.estado === 'rejected' && '❌ Rechazado'}
                    {post.estado === 'flagged' && '🚩 Reportado'}
                  </PostStatus>
                </div>
                <PostDate>
                  {new Date(post.created_at).toLocaleDateString()}
                </PostDate>
              </PostHeader>

              {/* Mostrar imagen si es una noticia y tiene imagen */}
              {post.tipo === 'noticia' && post.imagen_url && (
                <PostImage 
                  src={post.imagen_url.startsWith('http') ? post.imagen_url : `http://localhost:8000${post.imagen_url}`}
                  alt={post.titulo || 'Imagen de noticia'}
                  onError={(e) => {
                    console.error('Error cargando imagen:', post.imagen_url);
                    e.target.style.display = 'none';
                  }}
                />
              )}

              {/* Mostrar título y descripción si es una noticia */}
              {post.tipo === 'noticia' && (
                <>
                  {post.titulo && <PostTitle>{post.titulo}</PostTitle>}
                  {post.descripcion && <PostDescription>"{post.descripcion}"</PostDescription>}
                  {post.fuente && <PostSource>📰 Fuente: {post.fuente}</PostSource>}
                </>
              )}

              <PostContent>
                {post.contenido.length > 200 
                  ? post.contenido.substring(0, 200) + '...' 
                  : post.contenido}
              </PostContent>

              <PostMetrics>
                <Metric>
                  👁️ <strong>{post.views}</strong> views
                </Metric>
                <Metric>
                  🖱️ <strong>{post.clicks}</strong> clicks
                </Metric>
                <Metric>
                  💰 <strong>${((post.views + post.clicks) * 0.01 * 0.3).toFixed(2)}</strong>
                </Metric>
              </PostMetrics>

              {/* Reacciones recibidas */}
              <div style={{ marginTop: '0.5rem' }}>
                <ReactionBar postId={post.id} />
              </div>
            </PostCard>
          ))
        )}
      </PostsGrid>
    </Container>
  );
}

export default MyPosts;

