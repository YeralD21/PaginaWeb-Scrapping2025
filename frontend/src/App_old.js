import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { FiFileText, FiBarChart2, FiFilter, FiRefreshCw } from 'react-icons/fi';
import NewspaperLayout from './NewspaperLayout';

const Container = styled.div`
  width: 100%;
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  min-height: 100vh;
  background-image: url('/images/congreso.jpeg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
  position: relative;

  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(3px);
    z-index: -1;
  }
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: calc(100% - 75px);
  margin: 0 0 0 20px;
  padding: 20px 0;
  box-sizing: border-box;
`;

const Header = styled.header`
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 2.5rem;
  border-radius: 25px;
  margin: 0 auto 2rem auto;
  text-align: center;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.2);
  width: fit-content;
  max-width: 90%;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%);
    pointer-events: none;
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2.8rem;
  font-weight: 800;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
`;

const Subtitle = styled.p`
  margin: 0.5rem 0 0 0;
  font-size: 1.2rem;
  opacity: 0.9;
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 1;
`;

const Nav = styled.nav`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 0 auto 2rem auto;
  width: fit-content;
  max-width: 90%;
`;

const NavButton = styled.button`
  background: ${props => props.active ? 
    'linear-gradient(135deg, rgba(102, 126, 234, 0.4) 0%, rgba(118, 75, 162, 0.4) 100%)' : 
    'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)'
  };
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: ${props => props.active ? 'white' : '#667eea'};
  padding: 1rem 2rem;
  border-radius: 30px;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.4s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
  font-size: 1.1rem;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }

  &:hover {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.5) 0%, rgba(118, 75, 162, 0.5) 100%);
    color: white;
    transform: translateY(-3px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  }
`;

const Filters = styled.div`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 1.5rem;
  border-radius: 20px;
  margin: 0 auto 2rem auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  width: fit-content;
  max-width: 90%;
`;

const Select = styled.select`
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #333;
  padding: 0.5rem;
  border-radius: 15px;
  font-size: 1rem;
  min-width: 150px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

  &:focus {
    outline: none;
    border-color: rgba(102, 126, 234, 0.5);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Button = styled.button`
  background: rgba(102, 126, 234, 0.3);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 15px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

  &:hover {
    background: rgba(102, 126, 234, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
`;

const NewsGrid = styled.div`
  display: grid;
  grid-template-columns: ${props => props.singleColumn ? '1fr' : '1fr 1fr 1fr'};
  gap: 2rem;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  
  @media (max-width: 1400px) {
    gap: 1.5rem;
  }
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const DiarioColumn = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  padding: 1.5rem;
  min-height: 400px;
  box-sizing: border-box;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
`;

const DiarioHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e1e5e9;
`;

const DiarioLogo = styled.img`
  width: 100%;
  max-height: 120px;
  object-fit: contain;
`;

const DiarioNewsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const NewsCard = styled.article`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  box-sizing: border-box;
  width: 100%;
  overflow: hidden;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
`;

const NewsImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 15px;
  margin-bottom: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
`;

const DefaultImage = styled.div`
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
  border-radius: 15px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  font-size: 3rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

const NewsTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.2rem;
  line-height: 1.4;
`;

const NewsContent = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const NewsMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #333;
  font-weight: 500;
`;

const Category = styled.span`
  background: #667eea;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const Diario = styled.span`
  font-weight: 600;
  color: #667eea;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatsCard = styled.div`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 2rem;
  border-radius: 25px;
  margin-bottom: 2rem;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%);
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }
`;

const StatsTitle = styled.h3`
  margin: 0 0 1.5rem 0;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.3rem;
  font-weight: 700;
  position: relative;
  z-index: 1;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const StatsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  position: relative;
  z-index: 1;
  
  thead th {
    background: rgba(102, 126, 234, 0.2);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    padding: 1rem;
    text-align: left;
    font-weight: 700;
    color: #2c3e50;
    border-radius: 10px 10px 0 0;
  }
  
  tbody tr {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }
    
    &:nth-child(even) {
      background: rgba(255, 255, 255, 0.05);
    }
  }
  
  td {
    padding: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #333;
    font-weight: 500;
  }
`;

const StatsRow = styled.tr`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
  
  &:nth-child(even) {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const StatsCell = styled.td`
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #333;
  font-weight: 500;
  position: relative;
  z-index: 1;
`;

const Loading = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

const Error = styled.div`
  background: #fee;
  color: #c33;
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: 1rem;
  border: 1px solid #fcc;
`;

const DateFilterSection = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 1.5rem;
  border-radius: 20px;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  width: 100%;
`;

const DateFilterTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DateButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const DateButton = styled.button`
  background: ${props => props.active ? 'rgba(102, 126, 234, 0.3)' : 'rgba(255, 255, 255, 0.2)'};
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: ${props => props.active ? 'white' : '#667eea'};
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

  &:hover {
    background: rgba(102, 126, 234, 0.4);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
`;

const ClearDateButton = styled.button`
  background: rgba(220, 53, 69, 0.3);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

  &:hover {
    background: rgba(220, 53, 69, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
`;

const SelectedDateInfo = styled.div`
  background: rgba(102, 126, 234, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 1rem;
  border-radius: 15px;
  margin-top: 1rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
`;

function App() {
  const [activeTab, setActiveTab] = useState('noticias');
  const [noticias, setNoticias] = useState([]);
  const [comparativa, setComparativa] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    categoria: '',
    diario: ''
  });
  const [fechasDisponibles, setFechasDisponibles] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [noticiasPorFecha, setNoticiasPorFecha] = useState([]);
  const [mostrarFechas, setMostrarFechas] = useState(false);
  const [analisisFechas, setAnalisisFechas] = useState(null);
  const [mostrarAnalisis, setMostrarAnalisis] = useState(false);

  const API_BASE_URL = 'http://localhost:8000';

  useEffect(() => {
    if (activeTab === 'noticias') {
      fetchNoticias();
      fetchFechasDisponibles();
    } else if (activeTab === 'comparativa') {
      fetchComparativa();
    }
  }, [activeTab, filters]);

  useEffect(() => {
    if (fechaSeleccionada) {
      fetchNoticiasPorFecha(fechaSeleccionada);
    }
  }, [fechaSeleccionada]);

  const fetchNoticias = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.categoria && filters.categoria !== '') {
        params.append('categoria', filters.categoria);
      }
      if (filters.diario && filters.diario !== '') {
        params.append('diario', filters.diario);
      }
      
      const response = await axios.get(`${API_BASE_URL}/noticias?${params}&limit=100`);
      setNoticias(response.data);
    } catch (err) {
      setError('Error al cargar las noticias');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComparativa = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/comparativa`);
      setComparativa(response.data);
    } catch (err) {
      setError('Error al cargar la comparativa');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFechasDisponibles = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/noticias/fechas-disponibles`);
      setFechasDisponibles(response.data.fechas);
    } catch (err) {
      console.error('Error al cargar fechas disponibles:', err);
    }
  };

  const fetchNoticiasPorFecha = async (fecha) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/noticias/por-fecha?fecha=${fecha}`);
      setNoticiasPorFecha(response.data);
    } catch (err) {
      setError('Error al cargar noticias por fecha');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleFechaChange = (fecha) => {
    setFechaSeleccionada(fecha);
  };

  const limpiarFiltroFecha = () => {
    setFechaSeleccionada('');
    setNoticiasPorFecha([]);
  };

  const toggleMostrarFechas = () => {
    setMostrarFechas(!mostrarFechas);
  };

  const fetchAnalisisFechas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/analisis/por-fechas?fecha_inicio=2025-09-06&fecha_fin=2025-09-10`);
      setAnalisisFechas(response.data);
    } catch (err) {
      setError('Error al cargar análisis por fechas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMostrarAnalisis = () => {
    setMostrarAnalisis(!mostrarAnalisis);
    if (!analisisFechas && !mostrarAnalisis) {
      fetchAnalisisFechas();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) + ', ' + date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const groupNewsByDiario = (noticias) => {
    const grouped = {
      'El Comercio': [],
      'Diario Correo': [],
      'El Popular': []
    };
    
    noticias.forEach(noticia => {
      if (grouped[noticia.diario_nombre]) {
        grouped[noticia.diario_nombre].push(noticia);
      }
    });
    
    // Si hay un filtro de diario específico, solo mostrar ese diario
    if (filters.diario && filters.diario !== '') {
      const filteredGrouped = {};
      filteredGrouped[filters.diario] = grouped[filters.diario] || [];
      return filteredGrouped;
    }
    
    return grouped;
  };

  // Función para obtener las noticias a mostrar (todas o filtradas por fecha)
  const getNoticiasAMostrar = () => {
    return fechaSeleccionada ? noticiasPorFecha : noticias;
  };

  const getDiarioLogo = (diarioName) => {
    const logos = {
      'El Comercio': '/images/logos/comercio.png',
      'Diario Correo': '/images/logos/correo.png',
      'El Popular': '/images/logos/popular.png'
    };
    return logos[diarioName] || '';
  };

  return (
    <Container>
      <ContentWrapper>
        <Header>
        <Title>
          <FiFileText style={{ marginRight: '0.5rem' }} />
          Diarios Peruanos
        </Title>
        <Subtitle>Plataforma de noticias con Web Scraping</Subtitle>
      </Header>

      <Nav>
        <NavButton 
          active={activeTab === 'noticias'} 
          onClick={() => setActiveTab('noticias')}
        >
          <FiFileText />
          Noticias
        </NavButton>
        <NavButton 
          active={activeTab === 'comparativa'} 
          onClick={() => setActiveTab('comparativa')}
        >
          <FiBarChart2 />
          Comparativa
        </NavButton>
      </Nav>

      {activeTab === 'noticias' && (
        <>
          <Filters>
            <FiFilter style={{ color: '#667eea' }} />
            <Select 
              value={filters.categoria} 
              onChange={(e) => handleFilterChange('categoria', e.target.value)}
            >
              <option value="">Todas las categorías</option>
              <option value="Deportes">Deportes</option>
              <option value="Economía">Economía</option>
              <option value="Espectáculos">Espectáculos</option>
            </Select>
            <Select 
              value={filters.diario} 
              onChange={(e) => handleFilterChange('diario', e.target.value)}
            >
              <option value="">Todos los diarios</option>
              <option value="Diario Correo">Diario Correo</option>
              <option value="El Comercio">El Comercio</option>
              <option value="El Popular">El Popular</option>
            </Select>
            <Button onClick={fetchNoticias}>
              <FiRefreshCw />
              Actualizar
            </Button>
          </Filters>

          <DateFilterSection>
            <DateFilterTitle 
              onClick={toggleMostrarFechas}
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              📅 Filtrar por Fecha {mostrarFechas ? '▼' : '▶'}
            </DateFilterTitle>
            {mostrarFechas && (
              <>
                <DateButtons>
                  {fechasDisponibles.map((fecha) => (
                    <DateButton
                      key={fecha.fecha}
                      active={fechaSeleccionada === fecha.fecha}
                      onClick={() => handleFechaChange(fecha.fecha)}
                    >
                      {fecha.fecha_formateada} ({fecha.total_noticias} noticias)
                    </DateButton>
                  ))}
                  {fechaSeleccionada && (
                    <ClearDateButton onClick={limpiarFiltroFecha}>
                      ✕ Limpiar Filtro
                    </ClearDateButton>
                  )}
                </DateButtons>
                {fechaSeleccionada && (
                  <SelectedDateInfo>
                    <strong>📅 Fecha seleccionada:</strong> {fechasDisponibles.find(f => f.fecha === fechaSeleccionada)?.fecha_formateada}
                    <br />
                    <strong>📰 Total de noticias:</strong> {noticiasPorFecha.length} noticias de los 3 diarios
                  </SelectedDateInfo>
                )}
              </>
            )}
          </DateFilterSection>


          {error && <Error>{error}</Error>}

          {loading ? (
            <Loading>Cargando noticias...</Loading>
          ) : (
            <NewsGrid singleColumn={filters.diario && filters.diario !== ''}>
              {Object.entries(groupNewsByDiario(getNoticiasAMostrar())).map(([diarioName, diarioNoticias]) => (
                <DiarioColumn key={diarioName}>
                  <DiarioHeader>
                    <DiarioLogo 
                      src={getDiarioLogo(diarioName)} 
                      alt={`Logo de ${diarioName}`}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </DiarioHeader>
                  
                  <DiarioNewsList>
                    {diarioNoticias.length > 0 ? (
                      diarioNoticias.map((noticia) => (
                        <NewsCard key={noticia.id}>
                          {noticia.imagen_url ? (
                            <NewsImage 
                              src={`http://localhost:8000/proxy-image?url=${encodeURIComponent(noticia.imagen_url)}`} 
                              alt={noticia.titulo}
                              onLoad={() => console.log('✅ Imagen cargada:', noticia.titulo, noticia.imagen_url)}
                              onError={(e) => {
                                console.log('❌ Error cargando imagen:', noticia.titulo, noticia.imagen_url);
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : (
                            console.log('⚠️ Sin imagen_url:', noticia.titulo)
                          )}
                          {!noticia.imagen_url && (
                            <DefaultImage>
                              📰
                            </DefaultImage>
                          )}
                          <NewsTitle>{noticia.titulo}</NewsTitle>
                          {noticia.contenido && (
                            <NewsContent>{noticia.contenido}</NewsContent>
                          )}
                          <NewsMeta>
                            <div>
                              <Category>{noticia.categoria}</Category>
                            </div>
                            <div style={{ color: '#2c3e50', fontWeight: '600' }}>{formatDate(noticia.fecha_extraccion)}</div>
                          </NewsMeta>
                        </NewsCard>
                      ))
                    ) : (
                      <div style={{ 
                        textAlign: 'center', 
                        color: '#666', 
                        padding: '2rem',
                        fontStyle: 'italic'
                      }}>
                        No hay noticias disponibles
                      </div>
                    )}
                  </DiarioNewsList>
                </DiarioColumn>
              ))}
            </NewsGrid>
          )}
        </>
      )}

      {activeTab === 'comparativa' && (
        <>
          {/* Análisis de Publicaciones por Fechas */}
          <DateFilterSection>
            <DateFilterTitle 
              onClick={toggleMostrarAnalisis}
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              📊 Análisis de Publicaciones (06/09/2025 - 10/09/2025) {mostrarAnalisis ? '▼' : '▶'}
            </DateFilterTitle>
            {mostrarAnalisis && (
              <>
                {loading ? (
                  <Loading>Cargando análisis...</Loading>
                ) : analisisFechas ? (
                  <div style={{ marginTop: '1rem' }}>
                    {/* Resumen del período */}
                    <div style={{ 
                      background: 'rgba(102, 126, 234, 0.15)',
                      backdropFilter: 'blur(25px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      padding: '1.5rem', 
                      borderRadius: '20px',
                      marginBottom: '1.5rem',
                      boxShadow: '0 15px 50px rgba(0, 0, 0, 0.2)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%)',
                        pointerEvents: 'none'
                      }}></div>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50', position: 'relative', zIndex: 1 }}>
                        📅 Período Analizado: {analisisFechas.periodo.fecha_inicio} a {analisisFechas.periodo.fecha_fin}
                      </h4>
                      <p style={{ margin: 0, color: '#2c3e50', position: 'relative', zIndex: 1 }}>
                        {analisisFechas.periodo.dias_analizados} días • Total: {analisisFechas.total_general} noticias
                      </p>
                    </div>

                    {/* Análisis por diario */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                      {Object.entries(analisisFechas.analisis_por_diario).map(([diario, categorias]) => (
                        <div key={diario} style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          backdropFilter: 'blur(25px)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: '25px',
                          padding: '2rem',
                          boxShadow: '0 15px 50px rgba(0, 0, 0, 0.2)',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease'
                        }}>
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%)',
                            pointerEvents: 'none'
                          }}></div>
                          <h3 style={{ margin: '0 0 1rem 0', color: '#333', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                            {diario}
                          </h3>
                          <div style={{ marginBottom: '1rem', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                            <span style={{ 
                              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              padding: '0.75rem 1.5rem', 
                              borderRadius: '25px',
                              fontSize: '1.2rem',
                              fontWeight: 'bold',
                              color: '#2c3e50',
                              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
                            }}>
                              Total: {analisisFechas.total_por_diario[diario]} noticias
                            </span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', zIndex: 1 }}>
                            {Object.entries(categorias).map(([categoria, cantidad]) => (
                              <div key={categoria} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0.75rem',
                                background: 'rgba(255, 255, 255, 0.15)',
                                backdropFilter: 'blur(15px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '15px',
                                transition: 'all 0.3s ease'
                              }}>
                                <span style={{ color: '#333', fontWeight: '600' }}>{categoria}</span>
                                <span style={{ 
                                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.4) 0%, rgba(118, 75, 162, 0.4) 100%)',
                                  backdropFilter: 'blur(10px)',
                                  border: '1px solid rgba(255, 255, 255, 0.3)',
                                  color: 'white', 
                                  padding: '0.5rem 1rem', 
                                  borderRadius: '20px',
                                  fontSize: '0.9rem',
                                  fontWeight: 'bold',
                                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                                }}>
                                  {cantidad}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Resumen comparativo */}
                    {analisisFechas.resumen.diario_mas_activo && (
                      <div style={{ 
                        background: 'rgba(40, 167, 69, 0.15)',
                        backdropFilter: 'blur(25px)',
                        border: '1px solid rgba(40, 167, 69, 0.3)',
                        padding: '1.5rem', 
                        borderRadius: '20px',
                        marginTop: '1.5rem',
                        textAlign: 'center',
                        boxShadow: '0 15px 50px rgba(0, 0, 0, 0.2)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%)',
                          pointerEvents: 'none'
                        }}></div>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#28a745', position: 'relative', zIndex: 1 }}>
                          🏆 Diario Más Activo: {analisisFechas.resumen.diario_mas_activo[0]}
                        </h4>
                        <p style={{ margin: 0, color: '#2c3e50', position: 'relative', zIndex: 1 }}>
                          Publicó {analisisFechas.resumen.diario_mas_activo[1]} noticias en el período
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#2c3e50' }}>
                    No hay datos disponibles para el período seleccionado
                  </div>
                )}
              </>
            )}
          </DateFilterSection>

          {error && <Error>{error}</Error>}

          {loading ? (
            <Loading>Cargando comparativa...</Loading>
          ) : (
            <StatsGrid>
              <StatsCard>
                <StatsTitle>
                  <FiBarChart2 />
                  Estadísticas por Diario y Categoría
                </StatsTitle>
                <StatsTable>
                  <thead>
                    <tr>
                      <th>Diario</th>
                      <th>Categoría</th>
                      <th>Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparativa.estadisticas && comparativa.estadisticas.map((stat, index) => (
                      <StatsRow key={index}>
                        <StatsCell>{stat.diario}</StatsCell>
                        <StatsCell>{stat.categoria}</StatsCell>
                        <StatsCell>{stat.cantidad}</StatsCell>
                      </StatsRow>
                    ))}
                  </tbody>
                </StatsTable>
              </StatsCard>
              
              {comparativa.resumen && (
                <StatsCard>
                  <StatsTitle>
                    📊 Resumen General
                  </StatsTitle>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div style={{ 
                      background: 'rgba(102, 126, 234, 0.15)',
                      backdropFilter: 'blur(25px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      padding: '1.5rem', 
                      borderRadius: '20px',
                      textAlign: 'center',
                      boxShadow: '0 15px 50px rgba(0, 0, 0, 0.2)',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%)',
                        pointerEvents: 'none'
                      }}></div>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50', position: 'relative', zIndex: 1 }}>Total de Noticias</h4>
                      <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#333', position: 'relative', zIndex: 1 }}>
                        {comparativa.resumen.total_noticias}
                      </p>
                    </div>
                    <div style={{ 
                      background: 'rgba(102, 126, 234, 0.15)',
                      backdropFilter: 'blur(25px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      padding: '1.5rem', 
                      borderRadius: '20px',
                      textAlign: 'center',
                      boxShadow: '0 15px 50px rgba(0, 0, 0, 0.2)',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%)',
                        pointerEvents: 'none'
                      }}></div>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50', position: 'relative', zIndex: 1 }}>Última Actualización</h4>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#2c3e50', position: 'relative', zIndex: 1 }}>
                        {comparativa.resumen.fecha_ultima_extraccion ? 
                          new Date(comparativa.resumen.fecha_ultima_extraccion).toLocaleString('es-ES') : 
                          'No disponible'
                        }
                      </p>
                    </div>
                    <div style={{ 
                      background: 'rgba(102, 126, 234, 0.15)',
                      backdropFilter: 'blur(25px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      padding: '1.5rem', 
                      borderRadius: '20px',
                      textAlign: 'center',
                      boxShadow: '0 15px 50px rgba(0, 0, 0, 0.2)',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%)',
                        pointerEvents: 'none'
                      }}></div>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50', position: 'relative', zIndex: 1 }}>Período de Análisis</h4>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#2c3e50', position: 'relative', zIndex: 1 }}>
                        {comparativa.resumen.periodo_analisis}
                      </p>
                    </div>
                  </div>
                </StatsCard>
              )}
            </StatsGrid>
          )}
        </>
      )}
      </ContentWrapper>
    </Container>
  );
}

export default App;
