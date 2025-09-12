import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { FiBarChart2, FiTrendingUp, FiHeart, FiCopy, FiAlertTriangle, FiEye } from 'react-icons/fi';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 3rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.color || '#dc3545'};
  }
`;

const StatIcon = styled.div`
  background: ${props => props.color || '#dc3545'};
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 1rem;
  font-weight: 600;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const ChartTitle = styled.h3`
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SentimentChart = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const SentimentBar = styled.div`
  flex: 1;
  text-align: center;
`;

const SentimentValue = styled.div`
  height: ${props => props.height}px;
  background: ${props => props.color};
  border-radius: 8px 8px 0 0;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  padding-bottom: 0.5rem;
  min-height: 30px;
`;

const SentimentLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  font-weight: 600;
`;

const TrendingList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TrendingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 10px;
  border-left: 4px solid #dc3545;
`;

const TrendingWord = styled.div`
  font-weight: 600;
  color: #333;
`;

const TrendingCount = styled.div`
  background: #dc3545;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const DiarioStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const DiarioCard = styled.div`
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 10px;
  text-align: center;
  border: 2px solid transparent;
  transition: all 0.3s ease;

  &:hover {
    border-color: #dc3545;
    transform: translateY(-2px);
  }
`;

const DiarioName = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
`;

const DiarioMetrics = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const DiarioMetric = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
`;

const MetricLabel = styled.span`
  color: #666;
`;

const MetricValue = styled.span`
  font-weight: 600;
  color: #333;
`;

const FilterSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 15px;
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const FilterLabel = styled.div`
  font-weight: 600;
  color: #333;
`;

const FilterSelect = styled.select`
  padding: 0.5rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #dc3545;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.1rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 10px;
  text-align: center;
  margin: 1rem 0;
`;

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [stats, setStats] = useState({
    sentimientos: { sentimientos_general: [], por_diario: [], por_categoria: [] },
    keywords: [],
    duplicados: {},
    alertas: {}
  });

  useEffect(() => {
    fetchAllAnalytics();
  }, [timeRange]);

  const fetchAllAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [sentimientosRes, keywordsRes, duplicadosRes, alertasRes] = await Promise.all([
        axios.get(`http://localhost:8000/analytics/sentimientos?dias=${timeRange}`),
        axios.get(`http://localhost:8000/analytics/palabras-clave?dias=${timeRange}&limit=10`),
        axios.get(`http://localhost:8000/analytics/duplicados?dias=${timeRange}`),
        axios.get(`http://localhost:8000/analytics/alertas?dias=${timeRange}`)
      ]);

      setStats({
        sentimientos: sentimientosRes.data,
        keywords: keywordsRes.data,
        duplicados: duplicadosRes.data,
        alertas: alertasRes.data
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Error cargando los datos de analytics');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment) => {
    switch(sentiment) {
      case 'positivo': return '#28a745';
      case 'negativo': return '#dc3545';
      case 'neutral': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getSentimentEmoji = (sentiment) => {
    switch(sentiment) {
      case 'positivo': return '😊';
      case 'negativo': return '😞';
      case 'neutral': return '😐';
      default: return '📊';
    }
  };

  const calculateSentimentPercentages = () => {
    const total = stats.sentimientos.sentimientos_general.reduce((sum, item) => sum + item.cantidad, 0);
    return stats.sentimientos.sentimientos_general.map(item => ({
      ...item,
      percentage: total > 0 ? (item.cantidad / total) * 100 : 0
    }));
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Cargando analytics...</LoadingSpinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage>{error}</ErrorMessage>
      </Container>
    );
  }

  const sentimentPercentages = calculateSentimentPercentages();

  return (
    <Container>
      <Header>
        <Title>
          <FiBarChart2 />
          Dashboard de Analytics
        </Title>
        <Subtitle>Análisis completo de noticias y tendencias</Subtitle>
      </Header>

      <FilterSection>
        <FilterLabel>Período de análisis:</FilterLabel>
        <FilterSelect 
          value={timeRange} 
          onChange={(e) => setTimeRange(Number(e.target.value))}
        >
          <option value={1}>Último día</option>
          <option value={7}>Última semana</option>
          <option value={30}>Último mes</option>
        </FilterSelect>
      </FilterSection>

      <StatsGrid>
        <StatCard color="#28a745">
          <StatIcon color="#28a745">
            <FiEye size={24} />
          </StatIcon>
          <StatValue>
            {stats.sentimientos.sentimientos_general.reduce((sum, item) => sum + item.cantidad, 0)}
          </StatValue>
          <StatLabel>Noticias Analizadas</StatLabel>
        </StatCard>

        <StatCard color="#dc3545">
          <StatIcon color="#dc3545">
            <FiCopy size={24} />
          </StatIcon>
          <StatValue>{stats.duplicados.duplicates_detected || 0}</StatValue>
          <StatLabel>Duplicados Detectados</StatLabel>
        </StatCard>

        <StatCard color="#fd7e14">
          <StatIcon color="#fd7e14">
            <FiAlertTriangle size={24} />
          </StatIcon>
          <StatValue>{stats.alertas.total_alerts || 0}</StatValue>
          <StatLabel>Alertas Activadas</StatLabel>
        </StatCard>

        <StatCard color="#6f42c1">
          <StatIcon color="#6f42c1">
            <FiTrendingUp size={24} />
          </StatIcon>
          <StatValue>{stats.keywords.length}</StatValue>
          <StatLabel>Palabras Trending</StatLabel>
        </StatCard>
      </StatsGrid>

      <ChartsGrid>
        <ChartCard>
          <ChartTitle>
            <FiHeart />
            Análisis de Sentimientos
          </ChartTitle>
          <SentimentChart>
            {sentimentPercentages.map((item, index) => (
              <SentimentBar key={index}>
                <SentimentValue 
                  height={Math.max(50, item.percentage * 2)}
                  color={getSentimentColor(item.sentimiento)}
                >
                  {item.cantidad}
                </SentimentValue>
                <SentimentLabel>
                  {getSentimentEmoji(item.sentimiento)} {item.sentimiento}
                </SentimentLabel>
              </SentimentBar>
            ))}
          </SentimentChart>
          
          <div>
            <h4>Por Diario:</h4>
            {stats.sentimientos.por_diario.slice(0, 6).map((item, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '0.5rem',
                padding: '0.5rem',
                background: '#f8f9fa',
                borderRadius: '5px'
              }}>
                <span>{item.diario} - {getSentimentEmoji(item.sentimiento)} {item.sentimiento}</span>
                <span style={{ fontWeight: '600' }}>{item.cantidad}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard>
          <ChartTitle>
            <FiTrendingUp />
            Palabras Clave Trending
          </ChartTitle>
          <TrendingList>
            {stats.keywords.slice(0, 8).map((keyword, index) => (
              <TrendingItem key={index}>
                <TrendingWord>#{keyword.palabra}</TrendingWord>
                <TrendingCount>{keyword.frecuencia}</TrendingCount>
              </TrendingItem>
            ))}
          </TrendingList>
        </ChartCard>
      </ChartsGrid>

      <ChartCard>
        <ChartTitle>
          <FiBarChart2 />
          Estadísticas por Diario
        </ChartTitle>
        <DiarioStats>
          {Array.from(new Set(stats.sentimientos.por_diario.map(item => item.diario))).map(diario => {
            const diarioData = stats.sentimientos.por_diario.filter(item => item.diario === diario);
            const totalNoticias = diarioData.reduce((sum, item) => sum + item.cantidad, 0);
            const positivasCount = diarioData.find(item => item.sentimiento === 'positivo')?.cantidad || 0;
            const negativasCount = diarioData.find(item => item.sentimiento === 'negativo')?.cantidad || 0;
            
            return (
              <DiarioCard key={diario}>
                <DiarioName>{diario}</DiarioName>
                <DiarioMetrics>
                  <DiarioMetric>
                    <MetricLabel>Total noticias:</MetricLabel>
                    <MetricValue>{totalNoticias}</MetricValue>
                  </DiarioMetric>
                  <DiarioMetric>
                    <MetricLabel>😊 Positivas:</MetricLabel>
                    <MetricValue>{positivasCount}</MetricValue>
                  </DiarioMetric>
                  <DiarioMetric>
                    <MetricLabel>😞 Negativas:</MetricLabel>
                    <MetricValue>{negativasCount}</MetricValue>
                  </DiarioMetric>
                  <DiarioMetric>
                    <MetricLabel>Ratio positivo:</MetricLabel>
                    <MetricValue>
                      {totalNoticias > 0 ? Math.round((positivasCount / totalNoticias) * 100) : 0}%
                    </MetricValue>
                  </DiarioMetric>
                </DiarioMetrics>
              </DiarioCard>
            );
          })}
        </DiarioStats>
      </ChartCard>

      {(stats.duplicados.total_news > 0 || stats.alertas.total_alerts > 0) && (
        <ChartCard>
          <ChartTitle>
            <FiAlertTriangle />
            Estadísticas del Sistema
          </ChartTitle>
          <DiarioStats>
            <DiarioCard>
              <DiarioName>Detección de Duplicados</DiarioName>
              <DiarioMetrics>
                <DiarioMetric>
                  <MetricLabel>Eficiencia:</MetricLabel>
                  <MetricValue>
                    {stats.duplicados.total_news > 0 
                      ? Math.round((1 - stats.duplicados.duplicate_rate) * 100)
                      : 100}%
                  </MetricValue>
                </DiarioMetric>
                <DiarioMetric>
                  <MetricLabel>Noticias únicas:</MetricLabel>
                  <MetricValue>{stats.duplicados.unique_news || 0}</MetricValue>
                </DiarioMetric>
              </DiarioMetrics>
            </DiarioCard>
            
            <DiarioCard>
              <DiarioName>Sistema de Alertas</DiarioName>
              <DiarioMetrics>
                <DiarioMetric>
                  <MetricLabel>Alertas enviadas:</MetricLabel>
                  <MetricValue>{stats.alertas.notifications_sent || 0}</MetricValue>
                </DiarioMetric>
                <DiarioMetric>
                  <MetricLabel>Tasa de entrega:</MetricLabel>
                  <MetricValue>
                    {Math.round((stats.alertas.notification_rate || 0) * 100)}%
                  </MetricValue>
                </DiarioMetric>
              </DiarioMetrics>
            </DiarioCard>
          </DiarioStats>
        </ChartCard>
      )}
    </Container>
  );
};

export default AnalyticsDashboard;
