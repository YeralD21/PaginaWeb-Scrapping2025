import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiArrowLeft, FiBarChart2, FiTrendingUp, FiCalendar, FiRefreshCw } from 'react-icons/fi';
import axios from 'axios';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

const Container = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  position: relative;
`;

const BackButton = styled.button`
  position: absolute;
  left: 2rem;
  background: #dc3545;
  border: none;
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);

  &:hover {
    background: #c82333;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(220, 53, 69, 0.4);
  }
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: white;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  margin: 0;
  opacity: 0.8;
  font-weight: 300;
  color: white;
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #dc3545, #ffc107, #28a745, #17a2b8);
  }
`;

const StatTitle = styled.h3`
  color: #1a1a1a;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 2.2rem;
  font-weight: 700;
  color: #dc3545;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 500;
`;

const ChartContainer = styled.div`
  background: white;
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
`;

const ChartTitle = styled.h3`
  color: #1a1a1a;
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.5rem;
`;

const DateSelector = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const DateButton = styled.button`
  background: ${props => props.active ? '#dc3545' : 'white'};
  color: ${props => props.active ? 'white' : '#1a1a1a'};
  border: 2px solid ${props => props.active ? '#dc3545' : '#e9ecef'};
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

  &:hover {
    background: ${props => props.active ? '#c82333' : '#dc3545'};
    color: white;
    border-color: ${props => props.active ? '#c82333' : '#dc3545'};
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(220, 53, 69, 0.2);
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: #1a1a1a;
  font-size: 1.2rem;
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

const ErrorMessage = styled.div`
  background: #dc3545;
  color: white;
  padding: 1rem;
  border-radius: 10px;
  margin: 2rem 0;
  text-align: center;
  box-shadow: 0 4px 15px rgba(220, 53, 69, 0.2);
`;

const COLORS = ['#dc3545', '#ffc107', '#28a745', '#17a2b8', '#6f42c1', '#fd7e14'];

function Comparativa() {
  const navigate = useNavigate();
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [fechasDisponibles, setFechasDisponibles] = useState([]);

  useEffect(() => {
    const fetchFechasDisponibles = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/noticias/fechas-disponibles?t=${Date.now()}`);
        const fechas = response.data.fechas.map(fecha => ({
          fecha: fecha.fecha,
          total: fecha.total_noticias
        }));
        setFechasDisponibles(fechas);
        if (fechas.length > 0 && !fechaSeleccionada) {
          setFechaSeleccionada(fechas[0].fecha);
        }
      } catch (error) {
        console.error('Error fetching fechas:', error);
        setError('Error al cargar las fechas disponibles');
      }
    };

    fetchFechasDisponibles();
  }, [fechaSeleccionada]);

  useEffect(() => {
    const fetchNoticias = async () => {
      if (!fechaSeleccionada) return;
      
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:8000/noticias/por-fecha?fecha=${fechaSeleccionada}&t=${Date.now()}`);
        setNoticias(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching noticias:', error);
        setError('Error al cargar las noticias');
      } finally {
        setLoading(false);
      }
    };

    fetchNoticias();
  }, [fechaSeleccionada]);

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

  // Las noticias ya vienen filtradas por fecha desde la API
  const noticiasFiltradas = noticias;

  // Análisis por categoría
  const analisisCategoria = noticiasFiltradas.reduce((acc, noticia) => {
    const categoria = noticia.categoria || 'Sin categoría';
    acc[categoria] = (acc[categoria] || 0) + 1;
    return acc;
  }, {});

  // Análisis por diario
  const analisisDiario = noticiasFiltradas.reduce((acc, noticia) => {
    const diario = noticia.diario || noticia.diario_nombre || noticia.nombre_diario || 'Sin diario';
    acc[diario] = (acc[diario] || 0) + 1;
    return acc;
  }, {});

  // Análisis combinado (categoría por diario)
  const analisisCombinado = noticiasFiltradas.reduce((acc, noticia) => {
    const diario = noticia.diario || noticia.diario_nombre || noticia.nombre_diario || 'Sin diario';
    const categoria = noticia.categoria || 'Sin categoría';
    
    if (!acc[diario]) {
      acc[diario] = {};
    }
    acc[diario][categoria] = (acc[diario][categoria] || 0) + 1;
    return acc;
  }, {});

  // Preparar datos para gráficos
  const datosCategoria = Object.entries(analisisCategoria).map(([categoria, cantidad]) => ({
    categoria,
    cantidad,
    porcentaje: ((cantidad / noticiasFiltradas.length) * 100).toFixed(1)
  }));

  const datosDiario = Object.entries(analisisDiario).map(([diario, cantidad]) => ({
    diario,
    cantidad,
    porcentaje: ((cantidad / noticiasFiltradas.length) * 100).toFixed(1)
  }));

  // Datos para gráfico combinado
  const datosCombinados = Object.entries(analisisCombinado).map(([diario, categorias]) => {
    const total = Object.values(categorias).reduce((sum, count) => sum + count, 0);
    return {
      diario,
      total,
      ...categorias
    };
  });

  // Estadísticas generales
  const totalNoticias = noticiasFiltradas.length;
  const totalCategorias = Object.keys(analisisCategoria).length;
  const totalDiarios = Object.keys(analisisDiario).length;
  const categoriaMasPopular = Object.entries(analisisCategoria).sort((a, b) => b[1] - a[1])[0];
  const diarioMasActivo = Object.entries(analisisDiario).sort((a, b) => b[1] - a[1])[0];

  if (loading) {
    return (
      <Container>
        <Header>
          <HeaderContent>
            <BackButton onClick={handleBack}>
              <FiArrowLeft />
              Volver
            </BackButton>
            <Title>Análisis Comparativo</Title>
          </HeaderContent>
        </Header>
        <MainContent>
          <LoadingMessage>
            <FiRefreshCw style={{ animation: 'spin 1s linear infinite' }} />
            Cargando análisis...
          </LoadingMessage>
        </MainContent>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <HeaderContent>
            <BackButton onClick={handleBack}>
              <FiArrowLeft />
              Volver
            </BackButton>
            <Title>Análisis Comparativo</Title>
          </HeaderContent>
        </Header>
        <MainContent>
          <ErrorMessage>{error}</ErrorMessage>
        </MainContent>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderContent>
          <BackButton onClick={handleBack}>
            <FiArrowLeft />
            Volver
          </BackButton>
          <div>
            <Title>Análisis Comparativo</Title>
            <Subtitle>Estadísticas y gráficos de noticias por diario y categoría</Subtitle>
          </div>
        </HeaderContent>
      </Header>

      <MainContent>
        {/* Selector de fechas */}
        <DateSelector>
          {fechasDisponibles.map((fechaData) => (
            <DateButton
              key={fechaData.fecha}
              active={fechaData.fecha === fechaSeleccionada}
              onClick={() => setFechaSeleccionada(fechaData.fecha)}
            >
              <FiCalendar />
              {formatDate(fechaData.fecha)} ({fechaData.total})
            </DateButton>
          ))}
        </DateSelector>

        {/* Estadísticas generales */}
        <StatsGrid>
          <StatCard>
            <StatTitle>
              <FiBarChart2 />
              Total de Noticias
            </StatTitle>
            <StatValue>{totalNoticias}</StatValue>
            <StatLabel>Noticias publicadas</StatLabel>
          </StatCard>

          <StatCard>
            <StatTitle>
              <FiTrendingUp />
              Categorías
            </StatTitle>
            <StatValue>{totalCategorias}</StatValue>
            <StatLabel>Diferentes categorías</StatLabel>
          </StatCard>

          <StatCard>
            <StatTitle>
              <FiBarChart2 />
              Diarios
            </StatTitle>
            <StatValue>{totalDiarios}</StatValue>
            <StatLabel>Diarios activos</StatLabel>
          </StatCard>

          <StatCard>
            <StatTitle>
              <FiTrendingUp />
              Categoría Más Popular
            </StatTitle>
            <StatValue>{categoriaMasPopular?.[0] || 'N/A'}</StatValue>
            <StatLabel>{categoriaMasPopular?.[1] || 0} noticias</StatLabel>
          </StatCard>

          <StatCard>
            <StatTitle>
              <FiBarChart2 />
              Diario Más Activo
            </StatTitle>
            <StatValue>{diarioMasActivo?.[0] || 'N/A'}</StatValue>
            <StatLabel>{diarioMasActivo?.[1] || 0} noticias</StatLabel>
          </StatCard>
        </StatsGrid>

        {/* Gráfico de barras por categoría */}
        <ChartContainer>
          <ChartTitle>
            <FiBarChart2 />
            Noticias por Categoría
          </ChartTitle>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={datosCategoria}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="categoria" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cantidad" fill="#dc3545" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Gráfico de barras por diario */}
        <ChartContainer>
          <ChartTitle>
            <FiBarChart2 />
            Noticias por Diario
          </ChartTitle>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={datosDiario}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="diario" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cantidad" fill="#28a745" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Gráfico combinado */}
        <ChartContainer>
          <ChartTitle>
            <FiTrendingUp />
            Análisis Combinado: Categorías por Diario
          </ChartTitle>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={datosCombinados}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="diario" />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.keys(analisisCategoria).map((categoria, index) => (
                <Bar 
                  key={categoria} 
                  dataKey={categoria} 
                  stackId="a" 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Gráfico de pastel por categoría */}
        <ChartContainer>
          <ChartTitle>
            <FiBarChart2 />
            Distribución por Categoría
          </ChartTitle>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={datosCategoria}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ categoria, porcentaje }) => `${categoria}: ${porcentaje}%`}
                outerRadius={120}
                fill="#dc3545"
                dataKey="cantidad"
              >
                {datosCategoria.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </MainContent>
    </Container>
  );
}

export default Comparativa;
