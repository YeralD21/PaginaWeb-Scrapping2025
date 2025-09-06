import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { FiFileText, FiBarChart2, FiFilter, FiRefreshCw } from 'react-icons/fi';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Header = styled.header`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
  margin-bottom: 2rem;
`;

const NavButton = styled.button`
  background: ${props => props.active ? '#667eea' : 'white'};
  color: ${props => props.active ? 'white' : '#667eea'};
  border: 2px solid #667eea;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #667eea;
    color: white;
    transform: translateY(-2px);
  }
`;

const Filters = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 2px solid #e1e5e9;
  border-radius: 5px;
  font-size: 1rem;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Button = styled.button`
  background: #667eea;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.3s ease;

  &:hover {
    background: #5a6fd8;
  }
`;

const NewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const NewsCard = styled.article`
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
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
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

  const API_BASE_URL = 'http://localhost:8000';

  useEffect(() => {
    if (activeTab === 'noticias') {
      fetchNoticias();
    } else if (activeTab === 'comparativa') {
      fetchComparativa();
    }
  }, [activeTab, filters]);

  const fetchNoticias = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.categoria) params.append('categoria', filters.categoria);
      if (filters.diario) params.append('diario', filters.diario);
      
      const response = await axios.get(`${API_BASE_URL}/noticias?${params}`);
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

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  return (
    <Container>
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

          {error && <Error>{error}</Error>}

          {loading ? (
            <Loading>Cargando noticias...</Loading>
          ) : (
            <NewsGrid>
              {noticias.map((noticia) => (
                <NewsCard key={noticia.id}>
                  <NewsTitle>{noticia.titulo}</NewsTitle>
                  {noticia.contenido && (
                    <NewsContent>{noticia.contenido}</NewsContent>
                  )}
                  <NewsMeta>
                    <div>
                      <Category>{noticia.categoria}</Category>
                      <Diario style={{ marginLeft: '1rem' }}>
                        {noticia.diario_nombre}
                      </Diario>
                    </div>
                    <div>{formatDate(noticia.fecha_extraccion)}</div>
                  </NewsMeta>
                </NewsCard>
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
    </Container>
  );
}

export default App;
