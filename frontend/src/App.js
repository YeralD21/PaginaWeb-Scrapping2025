import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { FiFileText, FiBarChart2, FiFilter, FiRefreshCw } from 'react-icons/fi';

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
  background: rgba(102, 126, 234, 0.2);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 2rem;
  border-radius: 20px;
  margin: 0 auto 2rem auto;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  width: fit-content;
  max-width: 90%;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
`;

const Subtitle = styled.p`
  margin: 0.5rem 0 0 0;
  font-size: 1.1rem;
  opacity: 0.9;
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
  background: ${props => props.active ? 'rgba(102, 126, 234, 0.3)' : 'rgba(255, 255, 255, 0.2)'};
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: ${props => props.active ? 'white' : '#667eea'};
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

  &:hover {
    background: rgba(102, 126, 234, 0.4);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
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

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
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
  color: #888;
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
  background: rgba(255, 255, 255, 0.9);
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const StatsTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const StatsRow = styled.tr`
  &:nth-child(even) {
    background: #f8f9fa;
  }
`;

const StatsCell = styled.td`
  padding: 0.5rem;
  border-bottom: 1px solid #e1e5e9;
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
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #667eea;
  margin-top: 1rem;
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES');
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
                          <NewsTitle>{noticia.titulo}</NewsTitle>
                          {noticia.contenido && (
                            <NewsContent>{noticia.contenido}</NewsContent>
                          )}
                          <NewsMeta>
                            <div>
                              <Category>{noticia.categoria}</Category>
                            </div>
                            <div>{formatDate(noticia.fecha_extraccion)}</div>
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
                    {comparativa.map((stat, index) => (
                      <StatsRow key={index}>
                        <StatsCell>{stat.diario}</StatsCell>
                        <StatsCell>{stat.categoria}</StatsCell>
                        <StatsCell>{stat.cantidad}</StatsCell>
                      </StatsRow>
                    ))}
                  </tbody>
                </StatsTable>
              </StatsCard>
            </StatsGrid>
          )}
        </>
      )}
      </ContentWrapper>
    </Container>
  );
}

export default App;
