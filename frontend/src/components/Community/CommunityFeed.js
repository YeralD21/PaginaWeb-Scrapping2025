import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import ReactionBar from './ReactionBar';

// Styled Components para el diseño elegante similar a user-dashboard
const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1f3a 0%, #2d3561 50%, #1a1f3a 100%);
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background: rgba(26, 31, 58, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(102, 126, 234, 0.2);
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
`;

const HeaderTitle = styled.h1`
  font-size: 1.5rem;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const HeaderSubtitle = styled.p`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0.25rem 0 0 0;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
  color: white;
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 1rem;

  &:hover {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%);
    border-color: rgba(102, 126, 234, 0.5);
    transform: translateY(-2px);
  }
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  flex: 1;
  width: 100%;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.95);
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 300;
  text-align: center;
  margin-bottom: 2rem;
`;

const Badge = styled.span`
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 700;
  margin-left: 1rem;
  box-shadow: 0 4px 15px rgba(245, 87, 108, 0.4);
`;

const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 0.8rem 1.8rem;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1rem;
  
  ${props => props.active ? `
    background: white;
    color: #667eea;
    box-shadow: 0 4px 15px rgba(255, 255, 255, 0.3);
  ` : `
    background: rgba(255, 255, 255, 0.2);
    color: white;
    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  `}
`;

const FeedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const PostCard = styled.div`
  background: rgba(26, 31, 58, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.3s;
  cursor: pointer;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 12px 40px rgba(102, 126, 234, 0.2);
    border-color: rgba(102, 126, 234, 0.4);
  }
`;

const PostImage = styled.img`
  width: 100%;
  height: 250px;
  object-fit: cover;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
`;

const PostContent = styled.div`
  padding: 1.5rem;
`;

const PostHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const PostType = styled.span`
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  ${props => {
    switch(props.tipo) {
      case 'noticia':
        return `
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        `;
      case 'imagen':
        return `
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
        `;
      case 'video':
        return `
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          color: white;
        `;
      case 'texto':
        return `
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
          color: white;
        `;
      default:
        return `
          background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
          color: white;
        `;
    }
  }}
`;

const PostDate = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
`;

const PostTitle = styled.h3`
  color: rgba(255, 255, 255, 0.95);
  font-size: 1.4rem;
  margin-bottom: 0.8rem;
  font-weight: 700;
  line-height: 1.3;
`;

const PostDescription = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
  margin-bottom: 1rem;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PostFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 2px solid rgba(102, 126, 234, 0.2);
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const AuthorAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
`;

const AuthorName = styled.div`
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  font-weight: 600;
`;

const MetricsGroup = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const Metric = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
`;

const ReportButton = styled.button`
  background: transparent;
  border: 2px solid #dc3545;
  color: #dc3545;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #dc3545;
    color: white;
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 4rem;
  color: white;
  font-size: 1.5rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.3rem;
  background: rgba(26, 31, 58, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
`;

const ModalHeader = styled.div`
  position: sticky;
  top: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const ModalBody = styled.div`
  padding: 2rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
  cursor: pointer;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  box-sizing: border-box;
  font-family: inherit;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const FullImage = styled.img`
  width: 100%;
  max-height: 500px;
  object-fit: contain;
  border-radius: 15px;
  margin-bottom: 2rem;
  background: #f5f5f5;
`;

const API_BASE = 'http://localhost:8000';

const TIPO_EMOJIS = {
  noticia: '📰',
  texto: '📝',
  imagen: '🖼️',
  video: '🎥',
  comentario: '💬',
  resena: '⭐',
  post: '📄'
};

function CommunityFeed() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingPost, setReportingPost] = useState(null);
  const [reportMotivo, setReportMotivo] = useState('');
  const [reportComentario, setReportComentario] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [viewedPosts, setViewedPosts] = useState(new Set()); // Para evitar registrar múltiples vistas

  useEffect(() => {
    fetchPosts();
  }, []);

  // Función para registrar una vista
  const registerView = async (postId) => {
    // Solo registrar si no se ha visto antes en esta sesión
    if (viewedPosts.has(postId)) return;
    
    try {
      await axios.post(`${API_BASE}/ugc/posts/${postId}/view`);
      setViewedPosts(prev => new Set([...prev, postId]));
      console.log(`👁️ Vista registrada para post ${postId}`);
    } catch (err) {
      console.error('Error registrando vista:', err);
    }
  };

  // Función para registrar un click (cuando se abre el modal)
  const registerClick = async (postId) => {
    try {
      await axios.post(`${API_BASE}/ugc/posts/${postId}/click`);
      console.log(`🖱️ Click registrado para post ${postId}`);
    } catch (err) {
      console.error('Error registrando click:', err);
    }
  };

  // Función para registrar una interacción (like, share, etc)
  const registerInteraction = async (postId) => {
    try {
      await axios.post(`${API_BASE}/ugc/posts/${postId}/interact`);
      console.log(`⭐ Interacción registrada para post ${postId}`);
    } catch (err) {
      console.error('Error registrando interacción:', err);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/ugc/feed`);
      setPosts(response.data);
    } catch (err) {
      console.error('Error al cargar publicaciones:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = filter === 'all' 
    ? posts 
    : posts.filter(post => post.tipo === filter);

  const getAuthorInitial = (email) => {
    return email ? email.charAt(0).toUpperCase() : '?';
  };

  const handleOpenReportModal = (post, e) => {
    e.stopPropagation(); // Evitar que abra el modal de detalle
    if (!user) {
      alert('⚠️ Debes iniciar sesión para reportar publicaciones');
      return;
    }
    setReportingPost(post);
    setShowReportModal(true);
    setReportMotivo('');
    setReportComentario('');
  };

  const handleSubmitReport = async () => {
    if (!reportMotivo) {
      alert('⚠️ Selecciona un motivo de reporte');
      return;
    }
    if (!reportComentario || reportComentario.trim().length < 10) {
      alert('⚠️ Proporciona una descripción detallada (mínimo 10 caracteres)');
      return;
    }

    setSubmittingReport(true);
    try {
      await axios.post(
        `${API_BASE}/ugc/report`,
        {
          post_id: reportingPost.id,
          motivo: reportMotivo,
          comentario: reportComentario.trim()
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      alert('✅ Reporte enviado exitosamente. Gracias por ayudar a mantener la comunidad segura.');
      setShowReportModal(false);
      setReportingPost(null);
      setReportMotivo('');
      setReportComentario('');
    } catch (err) {
      if (err.response?.status === 400) {
        alert('⚠️ ' + (err.response?.data?.detail || 'Ya has reportado esta publicación anteriormente'));
      } else {
        alert('❌ Error al enviar reporte: ' + (err.response?.data?.detail || err.message));
      }
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Loading>⏳ Cargando comunidad...</Loading>
      </Container>
    );
  }

  return (
    <AppContainer>
      {/* Header */}
      <Header>
        <HeaderContent>
          <HeaderLeft>
            <BackButton onClick={() => navigate('/')}>
              <FiArrowLeft />
              Volver
            </BackButton>
            <span style={{ fontSize: '2rem' }}>🌐</span>
            <div>
              <HeaderTitle>COMUNIDAD</HeaderTitle>
              <HeaderSubtitle>Contenido creado por nuestra comunidad de usuarios</HeaderSubtitle>
            </div>
          </HeaderLeft>
        </HeaderContent>
      </Header>

      <Container>

      <FilterBar>
        <FilterButton 
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        >
          🌟 Todos ({posts.length})
        </FilterButton>
        <FilterButton 
          active={filter === 'noticia'}
          onClick={() => setFilter('noticia')}
        >
          📰 Noticias ({posts.filter(p => p.tipo === 'noticia').length})
        </FilterButton>
        <FilterButton 
          active={filter === 'imagen'}
          onClick={() => setFilter('imagen')}
        >
          🖼️ Imágenes ({posts.filter(p => p.tipo === 'imagen').length})
        </FilterButton>
        <FilterButton 
          active={filter === 'video'}
          onClick={() => setFilter('video')}
        >
          🎥 Videos ({posts.filter(p => p.tipo === 'video').length})
        </FilterButton>
        <FilterButton 
          active={filter === 'texto'}
          onClick={() => setFilter('texto')}
        >
          📝 Textos ({posts.filter(p => p.tipo === 'texto').length})
        </FilterButton>
      </FilterBar>

      {filteredPosts.length === 0 ? (
        <EmptyState>
          {filter === 'all' 
            ? '📭 Aún no hay publicaciones en la comunidad' 
            : `📭 No hay publicaciones de tipo "${filter}"`}
        </EmptyState>
      ) : (
        <FeedGrid>
          {filteredPosts.map(post => (
            <PostCard 
              key={post.id} 
              onClick={() => {
                registerClick(post.id); // Registrar click al abrir modal
                setSelectedPost(post);
              }}
              onMouseEnter={() => registerView(post.id)} // Registrar vista cuando el mouse pasa sobre la tarjeta
            >
              {post.imagen_url && (
                <PostImage 
                  src={post.imagen_url.startsWith('http') ? post.imagen_url : `${API_BASE}${post.imagen_url}`}
                  alt={post.titulo || 'Imagen de publicación'}
                  onError={(e) => e.target.style.display = 'none'}
                />
              )}
              
              <PostContent>
                <PostHeader>
                  <PostType tipo={post.tipo}>
                    {TIPO_EMOJIS[post.tipo] || '📄'} {post.tipo.toUpperCase()}
                  </PostType>
                  <PostDate>
                    {new Date(post.created_at).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short'
                    })}
                  </PostDate>
                </PostHeader>

                {post.titulo && <PostTitle>{post.titulo}</PostTitle>}
                
                {post.descripcion && (
                  <PostDescription>{post.descripcion}</PostDescription>
                )}
                
                {!post.titulo && !post.descripcion && (
                  <PostDescription>
                    {post.contenido.substring(0, 150)}
                    {post.contenido.length > 150 && '...'}
                  </PostDescription>
                )}

                <PostFooter>
                  <AuthorInfo>
                    <AuthorAvatar>
                      {getAuthorInitial(post.user_email)}
                    </AuthorAvatar>
                    <AuthorName>
                      {post.user_email?.split('@')[0] || 'Usuario'}
                    </AuthorName>
                  </AuthorInfo>

                  <MetricsGroup>
                    <Metric>
                      👁️ {post.views || 0}
                    </Metric>
                    <Metric>
                      🖱️ {post.clicks || 0}
                    </Metric>
                  </MetricsGroup>
                </PostFooter>

                {/* Barra de Reacciones */}
                <div onClick={(e) => e.stopPropagation()}>
                  <ReactionBar postId={post.id} />
                </div>

                {/* Botón de reportar */}
                <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #f0f0f0' }}>
                  <ReportButton onClick={(e) => handleOpenReportModal(post, e)}>
                    🚩 Reportar
                  </ReportButton>
                </div>
              </PostContent>
            </PostCard>
          ))}
        </FeedGrid>
      )}

      {/* Modal de Detalle */}
      {selectedPost && (
        <ModalOverlay onClick={() => setSelectedPost(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <div>
                <h2 style={{margin: 0}}>
                  {TIPO_EMOJIS[selectedPost.tipo]} {selectedPost.titulo || 'Publicación'}
                </h2>
                <div style={{fontSize: '0.9rem', opacity: 0.9, marginTop: '0.5rem'}}>
                  Por: {selectedPost.user_email?.split('@')[0] || 'Usuario'} • {' '}
                  {new Date(selectedPost.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
              <CloseButton onClick={() => setSelectedPost(null)}>
                ✕
              </CloseButton>
            </ModalHeader>

            <ModalBody>
              {selectedPost.imagen_url && (
                <FullImage 
                  src={selectedPost.imagen_url.startsWith('http') 
                    ? selectedPost.imagen_url 
                    : `${API_BASE}${selectedPost.imagen_url}`}
                  alt={selectedPost.titulo || 'Imagen'}
                  onError={(e) => e.target.style.display = 'none'}
                />
              )}

              {selectedPost.descripcion && (
                <div style={{
                  color: '#666',
                  fontSize: '1.1rem',
                  fontStyle: 'italic',
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  background: '#f5f5f5',
                  borderRadius: '10px',
                  borderLeft: '4px solid #667eea'
                }}>
                  "{selectedPost.descripcion}"
                </div>
              )}

              {selectedPost.fuente && (
                <div style={{
                  color: '#888',
                  fontSize: '0.95rem',
                  marginBottom: '1.5rem'
                }}>
                  📰 Fuente: <strong>{selectedPost.fuente}</strong>
                </div>
              )}

              <div style={{
                color: '#333',
                fontSize: '1.05rem',
                lineHeight: '1.8',
                whiteSpace: 'pre-wrap'
              }}>
                {selectedPost.contenido}
              </div>

              <div style={{
                marginTop: '2rem',
                paddingTop: '1.5rem',
                borderTop: '2px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'space-around'
              }}>
                <Metric style={{fontSize: '1.1rem'}}>
                  👁️ {selectedPost.views || 0} vistas
                </Metric>
                <Metric style={{fontSize: '1.1rem'}}>
                  🖱️ {selectedPost.clicks || 0} clicks
                </Metric>
              </div>

              {/* Barra de Reacciones en el Modal */}
              <div style={{ marginTop: '1rem' }}>
                <ReactionBar postId={selectedPost.id} />
              </div>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Modal de Reportar */}
      {showReportModal && reportingPost && (
        <ModalOverlay onClick={() => setShowReportModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()} style={{maxWidth: '600px'}}>
            <ModalHeader style={{background: 'linear-gradient(135deg, #dc3545 0%, #ff6b6b 100%)'}}>
              <div>
                <h2 style={{margin: 0}}>
                  🚩 Reportar Publicación
                </h2>
                <div style={{fontSize: '0.9rem', opacity: 0.9, marginTop: '0.5rem'}}>
                  {reportingPost.titulo || 'Publicación'}
                </div>
              </div>
              <CloseButton onClick={() => setShowReportModal(false)}>
                ✕
              </CloseButton>
            </ModalHeader>

            <ModalBody>
              <div style={{marginBottom: '1.5rem'}}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  Motivo del reporte: *
                </label>
                <Select 
                  value={reportMotivo} 
                  onChange={(e) => setReportMotivo(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Selecciona un motivo...</option>
                  <option value="Información falsa o fake news">Información falsa o fake news</option>
                  <option value="Contenido sexual explícito">Contenido sexual explícito</option>
                  <option value="Violencia o contenido gráfico">Violencia o contenido gráfico</option>
                  <option value="Discurso de odio o discriminación">Discurso de odio o discriminación</option>
                  <option value="Spam o publicidad engañosa">Spam o publicidad engañosa</option>
                  <option value="Acoso o bullying">Acoso o bullying</option>
                  <option value="Incitación al delito">Incitación al delito</option>
                  <option value="Contenido inapropiado para menores">Contenido inapropiado para menores</option>
                  <option value="Plagio o violación de derechos de autor">Plagio o violación de derechos de autor</option>
                  <option value="Otro">Otro</option>
                </Select>
              </div>

              <div style={{marginBottom: '1.5rem'}}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  Descripción detallada: * (mínimo 10 caracteres)
                </label>
                <TextArea
                  value={reportComentario}
                  onChange={(e) => setReportComentario(e.target.value)}
                  placeholder="Describe por qué consideras que esta publicación debe ser reportada..."
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    padding: '0.8rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
                <div style={{
                  fontSize: '0.85rem',
                  color: '#666',
                  marginTop: '0.5rem'
                }}>
                  Caracteres: {reportComentario.length}
                </div>
              </div>

              <div style={{
                background: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.5rem',
                fontSize: '0.9rem',
                color: '#856404'
              }}>
                <strong>⚠️ Importante:</strong>
                <ul style={{margin: '0.5rem 0 0 0', paddingLeft: '1.5rem'}}>
                  <li>Solo puedes reportar una vez por publicación</li>
                  <li>Los reportes falsos pueden resultar en suspensión de tu cuenta</li>
                  <li>El equipo de moderación revisará tu reporte</li>
                </ul>
              </div>

              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => setShowReportModal(false)}
                  style={{
                    padding: '0.8rem 1.5rem',
                    border: '2px solid #6c757d',
                    background: 'white',
                    color: '#6c757d',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '1rem'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitReport}
                  disabled={submittingReport || !reportMotivo || reportComentario.length < 10}
                  style={{
                    padding: '0.8rem 1.5rem',
                    border: 'none',
                    background: submittingReport || !reportMotivo || reportComentario.length < 10 
                      ? '#ccc' 
                      : 'linear-gradient(135deg, #dc3545 0%, #ff6b6b 100%)',
                    color: 'white',
                    borderRadius: '8px',
                    cursor: submittingReport || !reportMotivo || reportComentario.length < 10 
                      ? 'not-allowed' 
                      : 'pointer',
                    fontWeight: '600',
                    fontSize: '1rem'
                  }}
                >
                  {submittingReport ? '⏳ Enviando...' : '🚩 Enviar Reporte'}
                </button>
              </div>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
      </Container>
    </AppContainer>
  );
}

export default CommunityFeed;
