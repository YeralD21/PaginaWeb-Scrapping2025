import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiArrowLeft, FiCalendar, FiClock } from 'react-icons/fi';
import { useNoticias } from '../hooks/useNoticias';

const Container = styled.div`
  min-height: 100vh;
  background: #f8f9fa; /* Fondo claro */
  font-family: 'Arial', 'Helvetica', sans-serif;
`;

const Header = styled.header`
  background: #28a745; /* Verde */
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
  color: #28a745; /* Verde */
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    background: #28a745;
    color: white;
    border-color: #28a745;
    transform: translateY(-2px);
  }
`;

const DiarioInfo = styled.div`
  flex: 1;
`;

const DiarioTitle = styled.h1`
  font-size: 3.2rem;
  font-weight: 800;
  margin: 0;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.5);
  font-family: 'Arial Black', sans-serif;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #ffc107; /* Amarillo */
`;

const DiarioSubtitle = styled.p`
  font-size: 1.2rem;
  margin: 0.5rem 0 0 0;
  opacity: 0.9;
  font-weight: 600;
  color: #ffc107; /* Amarillo */
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

// Layout estilo segunda imagen - Main article + Sidebar
const LayoutContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const MainArticle = styled.article`
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
  border: 3px solid #17a2b8;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: linear-gradient(90deg, #17a2b8 0%, #ffc107 50%, #17a2b8 100%);
    z-index: 1;
  }
`;

const MainImage = styled.div`
  position: relative;
  height: 400px;
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)'};
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const MainOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
  padding: 2rem;
  color: white;
`;

const MainCategory = styled.span`
  background: #17a2b8;
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 1rem;
  display: inline-block;
  box-shadow: 0 4px 15px rgba(23, 162, 184, 0.4);
`;

const MainTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 1rem 0;
  line-height: 1.2;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.7);
  font-family: 'Arial Black', sans-serif;
  text-transform: uppercase;
`;

const MainMeta = styled.div`
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

const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SidebarTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  color: white;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const SidebarCard = styled.article`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border: 2px solid #17a2b8;
  transition: all 0.3s ease;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #17a2b8 0%, #ffc107 50%, #17a2b8 100%);
    z-index: 1;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  }
`;

const SidebarImage = styled.div`
  height: 150px;
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)'};
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const SidebarOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 1rem;
  color: white;
`;

const SidebarCategory = styled.span`
  background: #17a2b8;
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
  display: inline-block;
`;

const SidebarTitleText = styled.h4`
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
  font-family: 'Arial Black', sans-serif;
`;

const SidebarMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 0.7rem;
  opacity: 0.9;
  font-weight: 600;
`;

const SidebarMetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const SidebarContent = styled.div`
  padding: 1rem;
`;

const SidebarExcerpt = styled.p`
  color: #333;
  line-height: 1.5;
  margin: 0;
  font-size: 0.85rem;
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
  color: #17a2b8;
  padding: 1rem;
  border-radius: 10px;
  margin: 2rem 0;
  text-align: center;
  font-weight: 600;
  border: 2px solid #17a2b8;
`;

function DiarioPopular() {
  const navigate = useNavigate();
  const { noticias: todasNoticias, loading, error } = useNoticias();
  
  // Filtrar noticias de El Popular
  const noticias = todasNoticias.filter(noticia => 
    noticia.diario === 'El Popular' || 
    noticia.diario_nombre === 'El Popular' ||
    noticia.nombre_diario === 'El Popular'
  );
  
  const noticiaPrincipal = noticias.length > 0 ? noticias[0] : null;
  const noticiasSecundarias = noticias.slice(1);

  const handleBack = () => {
    navigate('/');
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
            <DiarioTitle>El Popular</DiarioTitle>
            <DiarioSubtitle>Noticias que importan</DiarioSubtitle>
          </DiarioInfo>
        </HeaderContent>
      </Header>

      <MainContent>
        {loading && <LoadingSpinner>Cargando noticias de El Popular...</LoadingSpinner>}
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        {!loading && !error && noticias.length > 0 && (
          <>
            {/* Layout estilo segunda imagen */}
            <LayoutContainer>
              {/* Main Article */}
              <MainArticle>
                {noticiaPrincipal && (
                  <>
                    <MainImage imageUrl={noticiaPrincipal.imagen_url}>
                      <MainOverlay>
                        <MainCategory>{noticiaPrincipal.categoria}</MainCategory>
                        <MainTitle>{noticiaPrincipal.titulo}</MainTitle>
                        <MainMeta>
                          <MetaItem>
                            <FiCalendar />
                            {formatDate(noticiaPrincipal.fecha_publicacion)}
                          </MetaItem>
                          <MetaItem>
                            <FiClock />
                            {formatTime(noticiaPrincipal.fecha_publicacion)}
                          </MetaItem>
                        </MainMeta>
                      </MainOverlay>
                    </MainImage>
                  </>
                )}
              </MainArticle>

              {/* Sidebar */}
              <Sidebar>
                <SidebarTitle>Más Noticias</SidebarTitle>
                {noticiasSecundarias.slice(0, 5).map((noticia, index) => (
                  <SidebarCard key={index}>
                    <SidebarImage imageUrl={noticia.imagen_url}>
                      <SidebarOverlay>
                        <SidebarCategory>{noticia.categoria}</SidebarCategory>
                        <SidebarTitleText>{noticia.titulo}</SidebarTitleText>
                        <SidebarMeta>
                          <SidebarMetaItem>
                            <FiCalendar />
                            {formatDate(noticia.fecha_publicacion)}
                          </SidebarMetaItem>
                        </SidebarMeta>
                      </SidebarOverlay>
                    </SidebarImage>
                    <SidebarContent>
                      <SidebarExcerpt>
                        {noticia.contenido || 'Sin contenido disponible...'}
                      </SidebarExcerpt>
                    </SidebarContent>
                  </SidebarCard>
                ))}
              </Sidebar>
            </LayoutContainer>
          </>
        )}
      </MainContent>
    </Container>
  );
}

export default DiarioPopular;
