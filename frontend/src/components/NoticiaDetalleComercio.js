import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiShare2, FiBookmark, FiHeart, FiMessageCircle, FiArrowLeft, FiUser, FiCalendar, FiClock, FiEye } from 'react-icons/fi';

// Styled Components replicando el diseño de El Comercio
const DetalleContainer = styled.div`
  width: 100%;
  margin: 0;
  padding: 0;
  background: #ffffff;
  min-height: 100vh;
`;

const HeaderComercio = styled.header`
  background: #FFCB05;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const NavBarComercio = styled.nav`
  background: white;
  padding: 0.8rem 0;
  border-bottom: 1px solid #e0e0e0;
`;

const BreadcrumbContainer = styled.div`
  background: #f8f9fa;
  padding: 0.8rem 0;
  border-bottom: 1px solid #e0e0e0;
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 3rem;
`;

const ArticleContent = styled.article`
  background: white;
`;

const ArticleHeader = styled.header`
  margin-bottom: 2rem;
`;

const CategoryTag = styled.span`
  background: #dc3545;
  color: white;
  padding: 0.3rem 0.8rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: 'Arial', sans-serif;
`;

const ArticleTitle = styled.h1`
  font-family: 'Georgia', serif;
  font-size: 2.2rem;
  font-weight: 700;
  line-height: 1.3;
  color: #1a1a1a;
  margin: 1rem 0;
  letter-spacing: -0.5px;
`;

const ArticleSubtitle = styled.h2`
  font-family: 'Arial', sans-serif;
  font-size: 1.3rem;
  font-weight: 400;
  line-height: 1.4;
  color: #666;
  margin-bottom: 1.5rem;
`;

const ArticleMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem 0;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 2rem;
  font-family: 'Arial', sans-serif;
  font-size: 0.9rem;
  color: #666;
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DateInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SocialActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
`;

const ActionButton = styled.button`
  background: none;
  border: 1px solid #e0e0e0;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: #666;
  font-size: 0.8rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: #f8f9fa;
    border-color: #dc3545;
    color: #dc3545;
  }
`;

const ArticleImage = styled.img`
  width: 100%;
  height: 400px;
  object-fit: cover;
  margin-bottom: 1rem;
`;

const ImageCaption = styled.p`
  font-family: 'Arial', sans-serif;
  font-size: 0.9rem;
  color: #666;
  font-style: italic;
  margin-bottom: 2rem;
  line-height: 1.4;
`;

const ArticleBody = styled.div`
  font-family: 'Georgia', serif;
  font-size: 1.1rem;
  line-height: 1.5;
  color: #1a1a1a;
  max-width: 650px;
  margin: 0 auto;
  
  p {
    margin-bottom: 10px;
    text-align: left;
    line-height: 1.5;
    font-weight: 300;
  }
  
  strong {
    font-weight: 600;
  }
`;

const Sidebar = styled.aside`
  background: white;
`;

const SidebarSection = styled.div`
  margin-bottom: 2rem;
`;

const SidebarTitle = styled.h3`
  font-family: 'Georgia', serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #dc3545;
`;

const RelatedNews = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RelatedItem = styled.div`
  display: flex;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const RelatedImage = styled.img`
  width: 80px;
  height: 60px;
  object-fit: cover;
  flex-shrink: 0;
`;

const RelatedContent = styled.div`
  flex: 1;
`;

const RelatedTitle = styled.h4`
  font-family: 'Arial', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.3;
  color: #1a1a1a;
  margin-bottom: 0.3rem;
  cursor: pointer;
  
  &:hover {
    color: #dc3545;
  }
`;

const RelatedMeta = styled.div`
  font-family: 'Arial', sans-serif;
  font-size: 0.8rem;
  color: #666;
`;

const BackButton = styled.button`
  background: none;
  border: 1px solid #e0e0e0;
  padding: 0.8rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  margin-bottom: 2rem;
  
  &:hover {
    background: #f8f9fa;
    border-color: #dc3545;
    color: #dc3545;
  }
`;

const SubscriberSection = styled.div`
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: white;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  text-align: center;
`;

const SubscriberTitle = styled.h3`
  font-family: 'Georgia', serif;
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 1rem;
`;

const SubscriberText = styled.p`
  font-family: 'Arial', sans-serif;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
  opacity: 0.9;
`;

const SubscriberButton = styled.button`
  background: #FFCB05;
  color: #1a1a1a;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #FFD700;
    transform: translateY(-1px);
  }
`;

const NoticiaDetalleComercio = ({ noticiaId, onBack, onNoticiaClick }) => {
  const navigate = useNavigate();
  const [noticia, setNoticia] = useState(null);
  const [noticiasRelacionadas, setNoticiasRelacionadas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Función para manejar el retroceso
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1); // Retroceder en el historial
    }
  };

  useEffect(() => {
    if (noticiaId) {
      loadNoticiaDetalle();
      loadNoticiasRelacionadas();
    }
  }, [noticiaId]);

  const loadNoticiaDetalle = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/noticias/${noticiaId}`);
      if (response.ok) {
        const data = await response.json();
        setNoticia(data);
      }
    } catch (error) {
      console.error('Error cargando noticia:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNoticiasRelacionadas = async () => {
    try {
      const response = await fetch('http://localhost:8000/noticias?diario=El Comercio&limit=5');
      if (response.ok) {
        const data = await response.json();
        const noticias = Array.isArray(data) ? data : data.noticias || [];
        // Filtrar para no incluir la noticia actual
        const relacionadas = noticias.filter(n => n.id !== parseInt(noticiaId)).slice(0, 4);
        setNoticiasRelacionadas(relacionadas);
      }
    } catch (error) {
      console.error('Error cargando noticias relacionadas:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para manejar clic en noticia relacionada
  const handleRelatedNoticiaClick = (relacionada) => {
    if (onNoticiaClick) {
      onNoticiaClick(relacionada);
    }
  };

  if (loading) {
    return (
      <DetalleContainer>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '1.2rem',
          color: '#666'
        }}>
          Cargando noticia...
        </div>
      </DetalleContainer>
    );
  }

  if (!noticia) {
    return (
      <DetalleContainer>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '1.2rem',
          color: '#666'
        }}>
          Noticia no encontrada
        </div>
      </DetalleContainer>
    );
  }

  return (
    <DetalleContainer>
      {/* Header */}
      <HeaderComercio>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img 
            src="/images/logos/comercio.png" 
            alt="EL COMERCIO"
            style={{
              height: '40px',
              width: 'auto',
              objectFit: 'contain'
            }}
          />
        </div>
      </HeaderComercio>

      {/* Navegación */}
      <NavBarComercio>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          fontSize: '0.9rem',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          <a href="#ultimo" style={{ color: '#1a1a1a', textDecoration: 'none' }}>LO ÚLTIMO</a>
          <span style={{ color: '#ccc', fontSize: '0.8rem' }}>•</span>
          <a href="#deportes" style={{ color: '#1a1a1a', textDecoration: 'none' }}>DEPORTES</a>
          <span style={{ color: '#ccc', fontSize: '0.8rem' }}>•</span>
          <a href="#economia" style={{ color: '#1a1a1a', textDecoration: 'none' }}>ECONOMÍA</a>
          <span style={{ color: '#ccc', fontSize: '0.8rem' }}>•</span>
          <a href="#mundo" style={{ color: '#1a1a1a', textDecoration: 'none' }}>MUNDO</a>
        </div>
      </NavBarComercio>

      {/* Breadcrumb */}
      <BreadcrumbContainer>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
          fontSize: '0.8rem',
          color: '#666',
          fontFamily: 'Arial, sans-serif'
        }}>
          NOVEDADES / Noticias
        </div>
      </BreadcrumbContainer>

      {/* Contenido Principal */}
      <MainContent>
        {/* Artículo */}
        <ArticleContent>
          <BackButton onClick={handleBack}>
            <FiArrowLeft />
            Volver a noticias
          </BackButton>

          <ArticleHeader>
            <CategoryTag>{noticia.categoria || 'NOTICIAS'}</CategoryTag>
            <ArticleTitle>{noticia.titulo}</ArticleTitle>
            {noticia.resumen && (
              <ArticleSubtitle>{noticia.resumen}</ArticleSubtitle>
            )}
          </ArticleHeader>

          <ArticleMeta>
            <AuthorInfo>
              <FiUser size={14} />
              <span>{noticia.autor || 'Redacción EC'}</span>
            </AuthorInfo>
            <DateInfo>
              <FiCalendar size={14} />
              <span>{formatDate(noticia.fecha_publicacion)}</span>
            </DateInfo>
            <DateInfo>
              <FiClock size={14} />
              <span>{formatTime(noticia.fecha_publicacion)}</span>
            </DateInfo>
            <SocialActions>
              <ActionButton>
                <FiShare2 size={14} />
                Compartir
              </ActionButton>
              <ActionButton>
                <FiBookmark size={14} />
                Guardar
              </ActionButton>
              <ActionButton>
                <FiHeart size={14} />
                Me gusta
              </ActionButton>
            </SocialActions>
          </ArticleMeta>

          {noticia.imagen_url && (
            <>
              <ArticleImage 
                src={noticia.imagen_url} 
                alt={noticia.titulo}
                onError={(e) => {
                  e.target.src = '/images/congreso.jpeg'; // Imagen por defecto
                }}
              />
              <ImageCaption>
                {noticia.descripcion_imagen || `Imagen relacionada con: ${noticia.titulo}`}
              </ImageCaption>
            </>
          )}

          <ArticleBody>
            {noticia.contenido ? (
              noticia.contenido
                .split('\n\n') // Dividir por párrafos dobles
                .filter(parrafo => parrafo.trim()) // Filtrar párrafos vacíos
                .map((parrafo, index) => (
                  <p key={index}>
                    {parrafo
                      .split('\n') // Dividir líneas dentro del párrafo
                      .map(linea => linea.trim()) // Limpiar espacios
                      .filter(linea => linea) // Filtrar líneas vacías
                      .join(' ') // Unir líneas con espacios
                    }
                  </p>
                ))
            ) : (
              <p>Contenido no disponible.</p>
            )}
          </ArticleBody>

          {/* Enlace a noticia original */}
          {noticia.enlace && (
            <div style={{
              marginTop: '2rem',
              padding: '1rem',
              background: '#f8f9fa',
              borderRadius: '4px',
              fontSize: '0.9rem',
              fontFamily: 'Arial, sans-serif'
            }}>
              <strong>Fuente:</strong>{' '}
              <a 
                href={noticia.enlace} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#dc3545', textDecoration: 'none' }}
              >
                Ver noticia original en El Comercio
              </a>
            </div>
          )}
        </ArticleContent>

        {/* Sidebar */}
        <Sidebar>
          {/* Sección para suscriptores */}
          <SubscriberSection>
            <SubscriberTitle>PARA SUSCRIPTORES</SubscriberTitle>
            <SubscriberText>
              Accede a contenido exclusivo, análisis profundos y las mejores historias del periodismo peruano.
            </SubscriberText>
            <SubscriberButton>
              Suscríbete ahora
            </SubscriberButton>
          </SubscriberSection>

          {/* Noticias relacionadas */}
          {noticiasRelacionadas.length > 0 && (
            <SidebarSection>
              <SidebarTitle>Más noticias</SidebarTitle>
              <RelatedNews>
                {noticiasRelacionadas.map((relacionada, index) => (
                  <RelatedItem 
                    key={relacionada.id || index}
                    onClick={() => handleRelatedNoticiaClick(relacionada)}
                    style={{ cursor: 'pointer' }}
                  >
                    {relacionada.imagen_url && (
                      <RelatedImage 
                        src={relacionada.imagen_url} 
                        alt={relacionada.titulo}
                        onError={(e) => {
                          e.target.src = '/images/congreso.jpeg';
                        }}
                      />
                    )}
                    <RelatedContent>
                      <RelatedTitle>
                        {relacionada.titulo}
                      </RelatedTitle>
                      <RelatedMeta>
                        {formatDate(relacionada.fecha_publicacion)}
                      </RelatedMeta>
                    </RelatedContent>
                  </RelatedItem>
                ))}
              </RelatedNews>
            </SidebarSection>
          )}
        </Sidebar>
      </MainContent>
    </DetalleContainer>
  );
};

export default NoticiaDetalleComercio;
