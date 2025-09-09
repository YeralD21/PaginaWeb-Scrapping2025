import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiArrowLeft, FiCalendar, FiClock, FiFilter } from 'react-icons/fi';
import { useNoticiasDiario } from '../hooks/useNoticiasDiario';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  font-family: 'Inter', 'Segoe UI', 'Roboto', sans-serif;
`;

const Header = styled.header`
  background: #17a2b8; /* Teal color */
  color: white;
  padding: 3rem 0;
  box-shadow: 0 8px 32px rgba(23, 162, 184, 0.3);
  position: relative;
  overflow: hidden;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  position: relative;
  z-index: 1;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 1rem 2rem;
  border-radius: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(-1px);
  }
`;

const DiarioInfo = styled.div`
  flex: 1;
  text-align: center;
`;

const DiarioTitle = styled.h1`
  font-size: 4rem;
  font-weight: 900;
  margin: 0;
  letter-spacing: 2px;
  line-height: 1.1;
  font-family: 'Arial Black', 'Helvetica', sans-serif;
  text-transform: lowercase;
  text-align: center;
  
  .el-part {
    color: #ffc107; /* Amarillo */
    text-shadow: 
      2px 2px 0px #000,
      4px 4px 8px rgba(0, 0, 0, 0.5);
  }
  
  .popular-part {
    color: white;
    text-shadow: 
      2px 2px 0px #000,
      4px 4px 8px rgba(0, 0, 0, 0.5);
  }
`;

const DiarioSubtitle = styled.p`
  font-size: 1.3rem;
  margin: 1rem 0 0 0;
  opacity: 0.95;
  font-weight: 500;
  letter-spacing: 1px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
  color: white;
`;

const MainContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 3rem 2rem;
`;

// Layout moderno - Main article + Sidebar
const LayoutContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 4rem;
  margin-bottom: 4rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
`;

const MainArticle = styled.article`
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(102, 126, 234, 0.15);
  border: 1px solid rgba(102, 126, 234, 0.1);
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 32px 80px rgba(102, 126, 234, 0.25);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #667eea 100%);
    z-index: 1;
  }
`;

const MainImage = styled.div`
  position: relative;
  height: 300px;
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)'};
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.8) 100%);
    z-index: 1;
  }
`;

const MainOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
  padding: 2rem;
  color: white;
  z-index: 2;
`;

const MainCategory = styled.span`
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 1rem;
  display: inline-block;
  box-shadow: 0 4px 15px rgba(23, 162, 184, 0.4);
`;

const MainTitle = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 1rem 0;
  line-height: 1.2;
  text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.8);
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.2px;
`;

const MainMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  font-size: 1.1rem;
  opacity: 0.95;
  font-weight: 500;
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: rgba(255, 255, 255, 0.15);
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
  }
`;

const MainArticleContent = styled.div`
  padding: 1.5rem;
  background: white;
  border-top: 1px solid #e9ecef;
`;

const MainExcerpt = styled.p`
  color: #666;
  line-height: 1.6;
  margin: 0;
  font-size: 1rem;
  font-weight: 400;
  font-family: 'Inter', sans-serif;
  text-align: left;
  max-height: 120px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
`;

const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const SidebarTitle = styled.h3`
  font-size: 1.6rem;
  font-weight: 800;
  margin: 0 0 1.5rem 0;
  color: #17a2b8;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  text-shadow: 1px 1px 3px rgba(23, 162, 184, 0.3);
  font-family: 'Inter', sans-serif;
`;

const SidebarCard = styled.article`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(23, 162, 184, 0.1);
  border: 1px solid rgba(23, 162, 184, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #17a2b8 0%, #138496 50%, #17a2b8 100%);
    z-index: 1;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 15px 40px rgba(23, 162, 184, 0.2);
  }
`;

const SidebarImage = styled.div`
  height: 140px;
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)'};
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
    z-index: 1;
  }
`;

const SidebarOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 1rem;
  color: white;
  z-index: 2;
`;

const SidebarCategory = styled.span`
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.6rem;
  display: inline-block;
  box-shadow: 0 2px 8px rgba(23, 162, 184, 0.4);
`;

const SidebarTitleText = styled.h4`
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0.6rem 0;
  line-height: 1.3;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.1px;
`;

const SidebarMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.8rem;
  opacity: 0.95;
  font-weight: 500;
`;

const SidebarMetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const SidebarContent = styled.div`
  padding: 1rem;
`;

const SidebarExcerpt = styled.p`
  color: #666;
  line-height: 1.5;
  margin: 0;
  font-size: 0.85rem;
  font-weight: 400;
  font-family: 'Inter', sans-serif;
  max-height: 60px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  font-size: 1.4rem;
  color: #667eea;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
`;

const ErrorMessage = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.95) 100%);
  color: #667eea;
  padding: 2rem;
  border-radius: 20px;
  margin: 2rem 0;
  text-align: center;
  font-weight: 600;
  border: 1px solid rgba(102, 126, 234, 0.2);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.1);
  backdrop-filter: blur(20px);
`;

const FilterSection = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.95) 100%);
  padding: 2rem;
  border-radius: 20px;
  margin-bottom: 3rem;
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.1);
  backdrop-filter: blur(20px);
`;

const FilterTitle = styled.h3`
  margin: 0 0 1.5rem 0;
  color: #667eea;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
`;

const DateFilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
`;

const DateButton = styled.button`
  background: ${props => props.active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white'};
  color: ${props => props.active ? 'white' : '#667eea'};
  border: 2px solid ${props => props.active ? 'transparent' : '#667eea'};
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  box-shadow: ${props => props.active ? '0 8px 25px rgba(102, 126, 234, 0.4)' : '0 4px 15px rgba(102, 126, 234, 0.1)'};
  backdrop-filter: blur(20px);

  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
    color: white;
    border-color: transparent;
    transform: translateY(-3px);
    box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(-1px);
  }
`;

const NoNewsMessage = styled.div`
  text-align: center;
  padding: 4rem;
  color: #667eea;
  font-size: 1.3rem;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 249, 250, 0.8) 100%);
  border-radius: 20px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  backdrop-filter: blur(20px);
`;

function DiarioPopular() {
  const navigate = useNavigate();
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  
  const { 
    noticias, 
    fechasDisponibles, 
    loading, 
    error, 
    fetchNoticiasPorFecha 
  } = useNoticiasDiario('El Popular', fechaSeleccionada);
  
  const noticiaPrincipal = noticias.length > 0 ? noticias[0] : null;
  const noticiasSecundarias = noticias.slice(1);

  const handleBack = () => {
    navigate('/');
  };

  const handleFechaChange = (fecha) => {
    setFechaSeleccionada(fecha);
    fetchNoticiasPorFecha(fecha);
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
            <DiarioTitle>
              <span className="el-part">el</span> <span className="popular-part">Popular</span>
            </DiarioTitle>
            <DiarioSubtitle>Noticias que importan</DiarioSubtitle>
          </DiarioInfo>
        </HeaderContent>
      </Header>

      <MainContent>
        {loading && <LoadingSpinner>Cargando noticias de El Popular...</LoadingSpinner>}
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        {!loading && !error && fechasDisponibles.length > 0 && (
          <FilterSection>
            <FilterTitle>
              <FiFilter />
              Filtrar por fecha
            </FilterTitle>
            <DateFilterContainer>
              {fechasDisponibles.map((fecha) => (
                <DateButton
                  key={fecha.fecha}
                  active={fechaSeleccionada === fecha.fecha}
                  onClick={() => handleFechaChange(fecha.fecha)}
                >
                  {fecha.fecha_formateada} ({fecha.total_noticias})
                </DateButton>
              ))}
            </DateFilterContainer>
          </FilterSection>
        )}
        
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
                    <MainArticleContent>
                      <MainExcerpt>
                        {noticiaPrincipal.contenido || 'Sin contenido disponible...'}
                      </MainExcerpt>
                    </MainArticleContent>
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
        
        {!loading && !error && noticias.length === 0 && (
          <NoNewsMessage>
            No hay noticias disponibles para la fecha seleccionada.
          </NoNewsMessage>
        )}
      </MainContent>
    </Container>
  );
}

export default DiarioPopular;
