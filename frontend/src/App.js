import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { FiFileText, FiBarChart2, FiFilter, FiRefreshCw, FiCalendar } from 'react-icons/fi';
import DiarioComercio from './components/DiarioComercio';
import DiarioCorreo from './components/DiarioCorreo';
import DiarioPopular from './components/DiarioPopular';
import Comparativa from './components/Comparativa';

const Container = styled.div`
  width: 100%;
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  min-height: 100vh;
  background: #f8f9fa;
  position: relative;
`;

const Header = styled.header`
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: white;
  padding: 2rem 0;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: sticky;
    top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  margin: 0;
  opacity: 0.8;
  font-weight: 300;
`;

const Navigation = styled.nav`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1.5rem;
`;

const NavButton = styled.button`
  background: ${props => props.active ? '#dc3545' : 'transparent'};
  color: white;
  border: 2px solid ${props => props.active ? '#dc3545' : 'rgba(255, 255, 255, 0.3)'};
  padding: 0.8rem 2rem;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${props => props.active ? '#c82333' : 'rgba(255, 255, 255, 0.1)'};
    border-color: ${props => props.active ? '#c82333' : 'rgba(255, 255, 255, 0.5)'};
  }
`;

const FiltersSection = styled.div`
  background: white;
  padding: 1.5rem 0;
  border-bottom: 1px solid #e9ecef;
  position: sticky;
  top: 120px;
  z-index: 99;
`;

const FiltersContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const FilterButton = styled.button`
  background: white;
  border: 2px solid #e9ecef;
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    border-color: #dc3545;
    color: #dc3545;
  }
`;

const DiarioFilterButton = styled.button`
  background: ${props => props.active ? '#dc3545' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border: 2px solid ${props => props.active ? '#dc3545' : '#e9ecef'};
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;

  &:hover {
    background: ${props => props.active ? '#c82333' : '#f8f9fa'};
    border-color: #dc3545;
    color: ${props => props.active ? 'white' : '#dc3545'};
  }
`;

const CategoriaDropdown = styled.div`
  position: relative;
  display: inline-block;
`;

const CategoriaDropdownContent = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 200px;
  margin-top: 0.5rem;
  overflow: hidden;
`;

const CategoriaOption = styled.button`
  width: 100%;
  background: white;
  border: none;
  padding: 0.8rem 1rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  color: #333;
  border-bottom: 1px solid #f1f3f4;

  &:hover {
    background: #f8f9fa;
    color: #dc3545;
  }

  &:last-child {
    border-bottom: none;
  }

  &.active {
    background: #dc3545;
    color: white;
  }
`;

const DateFilter = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const DateButton = styled.button`
  background: ${props => props.active ? '#dc3545' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border: 2px solid ${props => props.active ? '#dc3545' : '#e9ecef'};
  padding: 0.6rem 1rem;
  border-radius: 15px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;

  &:hover {
    background: ${props => props.active ? '#c82333' : '#f8f9fa'};
    border-color: #dc3545;
  }
`;

const MainContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 2rem 2rem 1rem;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1rem;
  align-items: start;
`;

const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: sticky;
  top: 120px;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  
  &::-webkit-scrollbar {
    display: none; /* WebKit */
  }
`;

const RightPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

// Panel izquierdo - Noticias sin imágenes
const LeftPanelTitle = styled.h3`
  color: #dc3545;
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  text-align: center;
  border-bottom: 2px solid #dc3545;
  padding-bottom: 0.5rem;
`;

const TextNewsCard = styled.article`
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border-left: 4px solid #dc3545;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    border-left-color: #c82333;
  }
`;

const TextNewsCardLarge = styled(TextNewsCard)`
  padding: 1.5rem;
  border-left-width: 6px;
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
`;

const TextNewsCardSmall = styled(TextNewsCard)`
  padding: 0.8rem;
  border-left-width: 3px;
  background: linear-gradient(135deg, #fff 0%, #fefefe 100%);
`;

const TextNewsTitle = styled.h4`
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const TextNewsTitleLarge = styled(TextNewsTitle)`
  font-size: 1rem;
  -webkit-line-clamp: 3;
`;

const TextNewsTitleSmall = styled(TextNewsTitle)`
  font-size: 0.8rem;
  -webkit-line-clamp: 2;
`;

const TextNewsMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #6c757d;
`;

const TextNewsMetaLarge = styled(TextNewsMeta)`
  font-size: 0.8rem;
  margin-top: 0.8rem;
`;

const TextNewsMetaSmall = styled(TextNewsMeta)`
  font-size: 0.7rem;
  margin-top: 0.4rem;
`;

const TextNewsCategory = styled.span`
  background: #dc3545;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const TextNewsDate = styled.span`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: #6c757d;
`;

const TextNewsDiario = styled.span`
  color: #dc3545;
  font-weight: 600;
  font-size: 0.7rem;
`;

// Hero Section - Noticia Principal
const HeroSection = styled.section`
  margin-bottom: 3rem;
`;

const HeroCard = styled.article`
  position: relative;
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
  }
`;

const HeroImage = styled.div`
  position: relative;
  height: 500px;
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const HeroOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 2rem;
  color: white;
`;

const HeroTimeBadge = styled.div`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.3);
`;

const HeroCategory = styled.span`
  background: #dc3545;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 1rem;
  display: inline-block;
`;

const HeroTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  line-height: 1.2;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const HeroMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.9rem;
  opacity: 0.9;
`;

const HeroDate = styled.span`
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

// Secondary News Grid
const SecondarySection = styled.section`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.8rem;
    font-weight: 700;
  margin: 0 0 2rem 0;
    color: #333;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 3px solid #dc3545;
  padding-bottom: 0.5rem;
  display: inline-block;
`;

const NewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
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
  height: 250px;
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const NewsOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 1.5rem;
  color: white;
`;

const NewsTimeBadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
`;

const NewsCategory = styled.span`
  background: #dc3545;
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.8rem;
  display: inline-block;
`;

const NewsTitle = styled.h4`
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
`;

const NewsMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 0.8rem;
  opacity: 0.9;
`;

const NewsDate = styled.span`
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const NewsContent = styled.div`
  padding: 1.5rem;
`;

const NewsExcerpt = styled.p`
  color: #666;
  line-height: 1.6;
  margin: 0;
  font-size: 0.95rem;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 10px;
  margin: 2rem 0;
  text-align: center;
`;

// Componente para la vista principal
function MainView() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('noticias');
  const [noticias, setNoticias] = useState([]);
  const [fechasDisponibles, setFechasDisponibles] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [mostrarCategorias, setMostrarCategorias] = useState(false);
  const [diarioFiltro, setDiarioFiltro] = useState(null);
  const [mostrarDiarios, setMostrarDiarios] = useState(false);
  const [categoriasDisponibles, setCategoriasDisponibles] = useState([]);

  useEffect(() => {
      fetchFechasDisponibles();
      fetchCategoriasDisponibles();
  }, []);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mostrarCategorias && !event.target.closest('.categoria-dropdown')) {
        setMostrarCategorias(false);
      }
      if (mostrarDiarios && !event.target.closest('.diario-dropdown')) {
        setMostrarDiarios(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mostrarCategorias, mostrarDiarios]);

  useEffect(() => {
    if (fechasDisponibles.length > 0 && !fechaSeleccionada) {
      setFechaSeleccionada(fechasDisponibles[0].fecha);
    }
  }, [fechasDisponibles]);

  useEffect(() => {
    if (fechaSeleccionada) {
      fetchNoticiasPorFecha(fechaSeleccionada);
    }
  }, [fechaSeleccionada]);

  const fetchFechasDisponibles = async () => {
    try {
      const response = await axios.get('http://localhost:8000/noticias/fechas-disponibles');
      setFechasDisponibles(response.data.fechas);
    } catch (error) {
      console.error('Error fetching fechas:', error);
      setError('Error al cargar las fechas disponibles');
    }
  };

  const fetchCategoriasDisponibles = async () => {
    try {
      const response = await axios.get('http://localhost:8000/categorias-disponibles');
      setCategoriasDisponibles(response.data.categorias);
    } catch (error) {
      console.error('Error fetching categorias:', error);
      setError('Error al cargar las categorías disponibles');
    }
  };

  const fetchNoticiasPorFecha = async (fecha) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/noticias/por-fecha?fecha=${fecha}`);
      setNoticias(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching noticias:', error);
      setError('Error al cargar las noticias');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (fechaSeleccionada) {
      fetchNoticiasPorFecha(fechaSeleccionada);
    }
  };

  const handleDiarioFilter = (diario) => {
    if (diario === 'todos') {
      navigate('/');
    } else {
      // Navegar a la ruta específica del diario
      const rutaDiario = diario.toLowerCase().replace(/\s+/g, '-');
      navigate(`/diario/${rutaDiario}`);
    }
  };

  const handleComparativa = () => {
    navigate('/comparativa');
  };

  const handleBackToGeneral = () => {
    navigate('/');
  };

  const handleCategoriaFilter = (categoria) => {
    if (categoria === 'todas') {
      setCategoriaSeleccionada(null);
    } else {
      setCategoriaSeleccionada(categoria);
    }
    setMostrarCategorias(false);
  };

  const handleDiarioFiltro = (diario) => {
    if (diario === 'todos') {
      setDiarioFiltro(null);
    } else {
      setDiarioFiltro(diario);
    }
    setMostrarDiarios(false);
  };

  const toggleMostrarDiarios = () => {
    setMostrarDiarios(!mostrarDiarios);
  };

  const toggleMostrarCategorias = () => {
    setMostrarCategorias(!mostrarCategorias);
  };

  // Las categorías se cargan desde el endpoint /categorias-disponibles

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
    // Verificar si la fecha tiene hora válida (no es 00:00:00)
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    // Si la hora es 00:00, puede que no tenga hora específica
    if (hours === 0 && minutes === 0) {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit'
      });
    }
    
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filtrar noticias por categoría y diario si están seleccionados
  let noticiasAMostrar = noticias;
  
  if (categoriaSeleccionada) {
    noticiasAMostrar = noticiasAMostrar.filter(noticia => noticia.categoria === categoriaSeleccionada);
  }
  
  if (diarioFiltro) {
    noticiasAMostrar = noticiasAMostrar.filter(noticia => 
      noticia.diario === diarioFiltro || 
      noticia.diario_nombre === diarioFiltro ||
      noticia.nombre_diario === diarioFiltro
    );
  }

  // Ordenar noticias: primero las que tienen imagen, luego las que no tienen
  noticiasAMostrar = noticiasAMostrar.sort((a, b) => {
    const aTieneImagen = a.imagen_url && a.imagen_url.trim() !== '';
    const bTieneImagen = b.imagen_url && b.imagen_url.trim() !== '';
    
    // Si ambas tienen imagen o ambas no tienen imagen, mantener orden original
    if (aTieneImagen === bTieneImagen) {
      return 0;
    }
    
    // Si a tiene imagen y b no, a va primero
    if (aTieneImagen && !bTieneImagen) {
      return -1;
    }
    
    // Si b tiene imagen y a no, b va primero
    return 1;
  });

  // Obtener noticia principal (primera noticia)
  const noticiaPrincipal = noticiasAMostrar.length > 0 ? noticiasAMostrar[0] : null;
  
  // Obtener noticias secundarias (resto)
  const noticiasSecundarias = noticiasAMostrar.slice(1);
  
  // Separar noticias sin imágenes para el panel izquierdo
  const noticiasSinImagen = noticiasAMostrar.filter(noticia => 
    !noticia.imagen_url || noticia.imagen_url.trim() === ''
  );


  return (
    <Container>
        <Header>
        <HeaderContent>
          <Title>Diarios Peruanos</Title>
        <Subtitle>Plataforma de noticias con Web Scraping</Subtitle>
          <Navigation>
        <NavButton 
          active={activeTab === 'noticias'} 
          onClick={() => setActiveTab('noticias')}
        >
          <FiFileText />
          Noticias
        </NavButton>
        <NavButton 
              onClick={handleComparativa}
              style={{ background: '#dc3545', color: 'white' }}
        >
          <FiBarChart2 />
          Comparativa
        </NavButton>
          </Navigation>
        </HeaderContent>
      </Header>

      <FiltersSection>
        <FiltersContent>
          <FilterGroup>
            <CategoriaDropdown className="categoria-dropdown">
              <FilterButton onClick={toggleMostrarCategorias}>
                <FiFilter />
                {categoriaSeleccionada || 'Todas las categorías'}
              </FilterButton>
              {mostrarCategorias && (
                <CategoriaDropdownContent>
                  <CategoriaOption 
                    className={!categoriaSeleccionada ? 'active' : ''}
                    onClick={() => handleCategoriaFilter('todas')}
                  >
                    Todas las categorías
                  </CategoriaOption>
                  {categoriasDisponibles.map((categoria) => (
                    <CategoriaOption 
                      key={categoria}
                      className={categoriaSeleccionada === categoria ? 'active' : ''}
                      onClick={() => handleCategoriaFilter(categoria)}
                    >
                      {categoria}
                    </CategoriaOption>
                  ))}
                </CategoriaDropdownContent>
              )}
            </CategoriaDropdown>
            
            {/* Dropdown de Diarios para filtro combinado */}
            <CategoriaDropdown className="diario-dropdown">
              <FilterButton onClick={toggleMostrarDiarios}>
                <FiFilter />
                {diarioFiltro || 'Todos los diarios'}
              </FilterButton>
              {mostrarDiarios && (
                <CategoriaDropdownContent>
                  <CategoriaOption 
                    className={!diarioFiltro ? 'active' : ''}
                    onClick={() => handleDiarioFiltro('todos')}
                  >
                    Todos los diarios
                  </CategoriaOption>
                  <CategoriaOption 
                    className={diarioFiltro === 'El Comercio' ? 'active' : ''}
                    onClick={() => handleDiarioFiltro('El Comercio')}
                  >
                    El Comercio
                  </CategoriaOption>
                  <CategoriaOption 
                    className={diarioFiltro === 'Diario Correo' ? 'active' : ''}
                    onClick={() => handleDiarioFiltro('Diario Correo')}
                  >
                    Diario Correo
                  </CategoriaOption>
                  <CategoriaOption 
                    className={diarioFiltro === 'El Popular' ? 'active' : ''}
                    onClick={() => handleDiarioFiltro('El Popular')}
                  >
                    El Popular
                  </CategoriaOption>
                </CategoriaDropdownContent>
              )}
            </CategoriaDropdown>
            
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: '600' }}>Navegar a:</span>
              <DiarioFilterButton 
                active={location.pathname === '/'}
                onClick={() => handleDiarioFilter('todos')}
              >
                Todos
              </DiarioFilterButton>
              <DiarioFilterButton 
                active={location.pathname === '/diario/el-comercio'}
                onClick={() => handleDiarioFilter('El Comercio')}
              >
                El Comercio
              </DiarioFilterButton>
              <DiarioFilterButton 
                active={location.pathname === '/diario/diario-correo'}
                onClick={() => handleDiarioFilter('Diario Correo')}
              >
                Diario Correo
              </DiarioFilterButton>
              <DiarioFilterButton 
                active={location.pathname === '/diario/el-popular'}
                onClick={() => handleDiarioFilter('El Popular')}
              >
                El Popular
              </DiarioFilterButton>
            </div>
          </FilterGroup>
          
          <DateFilter>
            <FiCalendar />
                  {fechasDisponibles.map((fecha) => (
                    <DateButton
                      key={fecha.fecha}
                      active={fechaSeleccionada === fecha.fecha}
                onClick={() => setFechaSeleccionada(fecha.fecha)}
                    >
                {fecha.fecha_formateada} ({fecha.total_noticias})
                    </DateButton>
                  ))}
          </DateFilter>

          <FilterButton onClick={handleRefresh}>
            <FiRefreshCw />
            Actualizar
          </FilterButton>
        </FiltersContent>
      </FiltersSection>

      <MainContent>
        {loading && <LoadingSpinner>Cargando noticias...</LoadingSpinner>}
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        {!loading && !error && noticias.length > 0 && (
          <>
            {/* Panel izquierdo - Noticias sin imágenes */}
            <LeftPanel>
              <LeftPanelTitle>📰 Más Noticias</LeftPanelTitle>
              {noticiasSinImagen.map((noticia, index) => {
                // Alternar entre diferentes tamaños de cards
                const cardType = index % 3;
                const CardComponent = cardType === 0 ? TextNewsCardLarge : 
                                    cardType === 1 ? TextNewsCard : TextNewsCardSmall;
                const TitleComponent = cardType === 0 ? TextNewsTitleLarge : 
                                     cardType === 1 ? TextNewsTitle : TextNewsTitleSmall;
                const MetaComponent = cardType === 0 ? TextNewsMetaLarge : 
                                    cardType === 1 ? TextNewsMeta : TextNewsMetaSmall;
                
                return (
                  <CardComponent key={index}>
                    <TitleComponent>{noticia.titulo}</TitleComponent>
                    <MetaComponent>
                      <div>
                        <TextNewsCategory>{noticia.categoria}</TextNewsCategory>
                        <TextNewsDiario>{noticia.diario}</TextNewsDiario>
                      </div>
                      <TextNewsDate>
                        <FiCalendar />
                        {formatDate(noticia.fecha_publicacion)}
                      </TextNewsDate>
                    </MetaComponent>
                  </CardComponent>
                );
              })}
            </LeftPanel>

            {/* Panel derecho - Noticias con imágenes */}
            <RightPanel>
            {/* Información de filtros activos */}
            {(categoriaSeleccionada || diarioFiltro) && (
                    <div style={{ 
                background: '#e3f2fd', 
                padding: '1rem', 
                borderRadius: '10px', 
                marginBottom: '2rem',
                border: '1px solid #2196f3'
              }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#1976d2' }}>Filtros Activos:</h4>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {categoriaSeleccionada && (
                            <span style={{ 
                      background: '#dc3545', 
                      color: 'white', 
                      padding: '0.3rem 0.8rem', 
                                borderRadius: '15px',
                      fontSize: '0.9rem'
                              }}>
                      Categoría: {categoriaSeleccionada}
                    </span>
                  )}
                  {diarioFiltro && (
                                <span style={{ 
                      background: '#28a745', 
                                  color: 'white', 
                      padding: '0.3rem 0.8rem', 
                      borderRadius: '15px',
                      fontSize: '0.9rem'
                    }}>
                      Diario: {diarioFiltro}
                                </span>
                  )}
                              </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#666' }}>
                  Mostrando {noticiasAMostrar.length} noticias
                          </div>
                        </div>
            )}

            {/* Hero Section - Noticia Principal */}
            <HeroSection>
              {noticiaPrincipal && (
                <HeroCard>
                  <HeroImage imageUrl={noticiaPrincipal.imagen_url}>
                    <HeroTimeBadge>
                      {formatTime(noticiaPrincipal.fecha_publicacion)}
                    </HeroTimeBadge>
                    <HeroOverlay>
                      <HeroCategory>{noticiaPrincipal.categoria}</HeroCategory>
                      <HeroTitle>{noticiaPrincipal.titulo}</HeroTitle>
                      <HeroMeta>
                        <span>{noticiaPrincipal.diario}</span>
                        <HeroDate>
                          <FiCalendar />
                          {formatDate(noticiaPrincipal.fecha_publicacion)}
                        </HeroDate>
                      </HeroMeta>
                    </HeroOverlay>
                  </HeroImage>
                </HeroCard>
              )}
            </HeroSection>

            {/* Secondary News Grid */}
            <SecondarySection>
              <SectionTitle>Más Noticias</SectionTitle>
              <NewsGrid>
                {noticiasSecundarias.map((noticia, index) => (
                  <NewsCard key={index}>
                    <NewsImage imageUrl={noticia.imagen_url}>
                      <NewsTimeBadge>
                        {formatTime(noticia.fecha_publicacion)}
                      </NewsTimeBadge>
                      <NewsOverlay>
                        <NewsCategory>{noticia.categoria}</NewsCategory>
                        <NewsTitle>{noticia.titulo}</NewsTitle>
                        <NewsMeta>
                          <span>{noticia.diario}</span>
                          <NewsDate>
                            <FiCalendar />
                            {formatDate(noticia.fecha_publicacion)}
                          </NewsDate>
                        </NewsMeta>
                      </NewsOverlay>
                    </NewsImage>
                    <NewsContent>
                      <NewsExcerpt>
                        {noticia.contenido || 'Sin contenido disponible...'}
                      </NewsExcerpt>
                    </NewsContent>
                  </NewsCard>
                ))}
              </NewsGrid>
            </SecondarySection>
            </RightPanel>
        </>
      )}
      </MainContent>
    </Container>
  );
}

// Componente principal con rutas
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainView />} />
        <Route path="/diario/el-comercio" element={<DiarioComercio />} />
        <Route path="/diario/diario-correo" element={<DiarioCorreo />} />
        <Route path="/diario/el-popular" element={<DiarioPopular />} />
        <Route path="/comparativa" element={<Comparativa />} />
      </Routes>
    </Router>
  );
}

export default App;
