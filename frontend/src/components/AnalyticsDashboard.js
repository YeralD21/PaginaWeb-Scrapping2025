import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { FiBarChart2, FiTrendingUp, FiHeart, FiCopy, FiAlertTriangle, FiEye, FiShield, FiActivity, FiArrowLeft } from 'react-icons/fi';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1f3a 0%, #2d3561 50%, #1a1f3a 100%);
  padding: 2rem;
`;

const Header = styled.header`
  background: rgba(26, 31, 58, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(102, 126, 234, 0.2);
  color: white;
  padding: 1.5rem 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  border-radius: 16px;
  margin-bottom: 2rem;
  position: sticky;
  top: 1rem;
  z-index: 100;
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
`;

const BackButton = styled.button`
  background: rgba(102, 126, 234, 0.2);
  color: white;
  border: 1px solid rgba(102, 126, 234, 0.3);
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.3);
    border-color: rgba(102, 126, 234, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }
`;

const TitleSection = styled.div`
  flex: 1;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  margin: 0;
  font-weight: 300;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const MainContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const StatCard = styled.div`
  background: rgba(26, 31, 58, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(102, 126, 234, 0.2);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  text-align: center;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(102, 126, 234, 0.2);
    border-color: rgba(102, 126, 234, 0.4);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.color || '#667eea'};
  }
`;

const StatIcon = styled.div`
  background: ${props => props.color || '#667eea'};
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.7);
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
  background: rgba(26, 31, 58, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(102, 126, 234, 0.2);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(102, 126, 234, 0.2);
    border-color: rgba(102, 126, 234, 0.4);
  }
`;

const ChartTitle = styled.h3`
  font-size: 1.3rem;
  color: white;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
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
  color: rgba(255, 255, 255, 0.8);
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
  background: rgba(102, 126, 234, 0.1);
  border-radius: 10px;
  border-left: 4px solid #667eea;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.2);
    transform: translateX(5px);
  }
`;

const TrendingWord = styled.div`
  font-weight: 600;
  color: white;
`;

const TrendingCount = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
`;

const DiarioStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const DiarioCard = styled.div`
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(102, 126, 234, 0.5);
    transform: translateY(-3px);
    background: rgba(102, 126, 234, 0.2);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.2);
  }
`;

const DiarioName = styled.div`
  font-weight: 600;
  color: white;
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
  color: rgba(255, 255, 255, 0.7);
`;

const MetricValue = styled.span`
  font-weight: 600;
  color: white;
`;

const FilterSection = styled.div`
  background: rgba(26, 31, 58, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(102, 126, 234, 0.2);
  padding: 1.5rem;
  border-radius: 16px;
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const FilterLabel = styled.div`
  font-weight: 600;
  color: white;
`;

const FilterSelect = styled.select`
  padding: 0.6rem 1rem;
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 8px;
  font-size: 0.9rem;
  color: white;
  transition: all 0.3s ease;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: rgba(102, 126, 234, 0.5);
    background: rgba(102, 126, 234, 0.2);
  }

  option {
    background: #1a1f3a;
    color: white;
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
  background: rgba(220, 53, 69, 0.2);
  color: white;
  padding: 1.5rem;
  border-radius: 16px;
  text-align: center;
  margin: 1rem 0;
  border: 1px solid rgba(220, 53, 69, 0.4);
  backdrop-filter: blur(10px);
`;

const RetryButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: #c82333;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
  }
`;

const AttackAnalysisCard = styled.div`
  background: rgba(26, 31, 58, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(102, 126, 234, 0.2);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  margin-bottom: 2rem;
`;

const AttackTypeCard = styled.div`
  background: ${props => {
    const severity = props.severity || 'medium';
    const colors = {
      critical: '#dc3545',
      high: '#fd7e14',
      medium: '#ffc107',
      low: '#17a2b8'
    };
    return colors[severity] || colors.medium;
  }};
  color: white;
  padding: 1.5rem;
  border-radius: 10px;
  margin-bottom: 1rem;
  border-left: 5px solid ${props => {
    const severity = props.severity || 'medium';
    const colors = {
      critical: '#8b0000',
      high: '#cc5500',
      medium: '#cc9900',
      low: '#0d6efd'
    };
    return colors[severity] || colors.medium;
  }};
`;

const AttackTypeHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const AttackTypeTitle = styled.h3`
  font-size: 1.3rem;
  margin: 0;
  font-weight: 700;
`;

const AttackTypeDescription = styled.p`
  margin: 0.5rem 0;
  opacity: 0.95;
  line-height: 1.6;
`;

const AttackIndicators = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
`;

const IndicatorItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const IndicatorLabel = styled.span`
  opacity: 0.9;
`;

const IndicatorValue = styled.span`
  font-weight: 700;
`;

const NoThreatsCard = styled.div`
  background: rgba(40, 167, 69, 0.2);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  border: 1px solid rgba(40, 167, 69, 0.4);
  backdrop-filter: blur(10px);
`;

const ThreatLevelBadge = styled.span`
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.3);
  margin-left: 0.5rem;
`;

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
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
      // Hacer las peticiones de forma individual para manejar errores específicos
      const results = {
        sentimientos: { sentimientos_general: [], por_diario: [], por_categoria: [] },
        keywords: [],
        duplicados: { total_news: 0, duplicates_detected: 0, unique_news: 0, duplicate_rate: 0 },
        alertas: { total_alerts: 0, notifications_sent: 0, notification_rate: 0 }
      };

      // Intentar obtener sentimientos
      try {
        const sentimientosRes = await axios.get(`http://localhost:8000/analytics/sentimientos?dias=${timeRange}`);
        results.sentimientos = sentimientosRes.data || results.sentimientos;
      } catch (err) {
        console.warn('Error obteniendo sentimientos:', err.response?.data || err.message);
      }

      // Intentar obtener palabras clave
      try {
        const keywordsRes = await axios.get(`http://localhost:8000/analytics/palabras-clave?dias=${timeRange}&limit=10`);
        results.keywords = keywordsRes.data || [];
      } catch (err) {
        console.warn('Error obteniendo palabras clave:', err.response?.data || err.message);
      }

      // Intentar obtener duplicados
      try {
        const duplicadosRes = await axios.get(`http://localhost:8000/analytics/duplicados?dias=${timeRange}`);
        results.duplicados = duplicadosRes.data || results.duplicados;
      } catch (err) {
        console.warn('Error obteniendo duplicados:', err.response?.data || err.message);
      }

      // Intentar obtener alertas
      try {
        const alertasRes = await axios.get(`http://localhost:8000/analytics/alertas?dias=${timeRange}`);
        results.alertas = alertasRes.data || results.alertas;
      } catch (err) {
        console.warn('Error obteniendo alertas:', err.response?.data || err.message);
      }

      setStats(results);
      
      // Verificar si al menos hay algún dato
      const hasData = 
        results.sentimientos.sentimientos_general.length > 0 ||
        results.keywords.length > 0 ||
        results.duplicados.total_news > 0 ||
        results.alertas.total_alerts > 0;
      
      if (!hasData) {
        setError('No hay datos disponibles para el período seleccionado. Intenta con un rango de días mayor.');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Error desconocido';
      setError(`Error cargando los datos de analytics: ${errorMessage}`);
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
    if (!stats.sentimientos || !stats.sentimientos.sentimientos_general || stats.sentimientos.sentimientos_general.length === 0) {
      return [];
    }
    const total = stats.sentimientos.sentimientos_general.reduce((sum, item) => sum + (item.cantidad || 0), 0);
    return stats.sentimientos.sentimientos_general.map(item => ({
      ...item,
      percentage: total > 0 ? ((item.cantidad || 0) / total) * 100 : 0
    }));
  };

  // Función para detectar tipos de ataques basándose en los filtros y estadísticas
  const detectAttackTypes = () => {
    const attacks = [];
    const sentimientos = stats.sentimientos?.sentimientos_general || [];
    const totalNews = sentimientos.reduce((sum, item) => sum + (item.cantidad || 0), 0);
    const negativeNews = sentimientos.find(item => item.sentimiento === 'negativo')?.cantidad || 0;
    const duplicateRate = stats.duplicados?.duplicate_rate || 0;
    const alertsCount = stats.alertas?.total_alerts || 0;
    const keywords = (stats.keywords || []).map(k => (k.palabra || '').toLowerCase()).filter(k => k);

    // Detectar DDoS (Distributed Denial of Service)
    // Indicadores: Alto volumen de noticias, muchas duplicadas, mismo origen
    if (totalNews > 100 && duplicateRate > 0.3) {
      const severity = totalNews > 500 ? 'critical' : totalNews > 200 ? 'high' : 'medium';
      attacks.push({
        type: 'DDoS',
        severity: severity,
        description: 'Posible ataque de Denegación de Servicio Distribuido detectado. Alto volumen de tráfico con patrones de duplicación.',
        indicators: [
          { label: 'Volumen de noticias', value: `${totalNews} noticias` },
          { label: 'Tasa de duplicados', value: `${Math.round(duplicateRate * 100)}%` },
          { label: 'Período analizado', value: `${timeRange} días` }
        ],
        recommendations: [
          'Implementar rate limiting en los endpoints',
          'Monitorear patrones de tráfico anómalos',
          'Activar protección DDoS en el servidor'
        ]
      });
    }

    // Detectar Phishing
    // Indicadores: Palabras clave relacionadas con seguridad, correos, contraseñas
    const phishingKeywords = ['contraseña', 'password', 'correo', 'email', 'seguridad', 'cuenta', 'banco', 'tarjeta', 'phishing', 'estafa'];
    const phishingMatches = keywords.filter(kw => phishingKeywords.some(pk => kw.includes(pk))).length;
    if (phishingMatches > 2 || keywords.some(kw => kw.includes('phishing'))) {
      attacks.push({
        type: 'Phishing',
        severity: phishingMatches > 5 ? 'high' : 'medium',
        description: 'Posible campaña de phishing detectada. Contenido relacionado con seguridad y credenciales.',
        indicators: [
          { label: 'Palabras clave sospechosas', value: `${phishingMatches} detectadas` },
          { label: 'Palabras trending relacionadas', value: keywords.filter(kw => phishingKeywords.some(pk => kw.includes(pk))).join(', ') || 'N/A' },
          { label: 'Noticias negativas', value: `${negativeNews} noticias` }
        ],
        recommendations: [
          'Verificar enlaces en las noticias',
          'Alertar a usuarios sobre posibles estafas',
          'Implementar filtros de contenido malicioso'
        ]
      });
    }

    // Detectar Malware/Ransomware
    // Indicadores: Palabras relacionadas con virus, malware, ransomware, troyanos
    const malwareKeywords = ['malware', 'virus', 'ransomware', 'troyano', 'spyware', 'adware', 'botnet', 'cryptolocker'];
    const malwareMatches = keywords.filter(kw => malwareKeywords.some(mk => kw.includes(mk))).length;
    if (malwareMatches > 0) {
      attacks.push({
        type: 'Malware/Ransomware',
        severity: malwareMatches > 3 ? 'high' : 'medium',
        description: 'Posible amenaza de malware o ransomware detectada. Contenido relacionado con software malicioso.',
        indicators: [
          { label: 'Amenazas detectadas', value: `${malwareMatches} referencias` },
          { label: 'Palabras clave', value: keywords.filter(kw => malwareKeywords.some(mk => kw.includes(mk))).join(', ') || 'N/A' },
          { label: 'Alertas activadas', value: `${alertsCount} alertas` }
        ],
        recommendations: [
          'Escanear archivos adjuntos en noticias',
          'Implementar sandboxing para contenido sospechoso',
          'Actualizar definiciones de antivirus'
        ]
      });
    }

    // Detectar Ataques de Ingeniería Social
    // Indicadores: Alto contenido negativo, manipulación emocional
    const negativePercentage = totalNews > 0 ? (negativeNews / totalNews) * 100 : 0;
    if (negativePercentage > 60 && totalNews > 50) {
      attacks.push({
        type: 'Ingeniería Social',
        severity: negativePercentage > 80 ? 'high' : 'medium',
        description: 'Posible campaña de ingeniería social detectada. Alto contenido negativo que puede manipular emociones.',
        indicators: [
          { label: 'Contenido negativo', value: `${Math.round(negativePercentage)}%` },
          { label: 'Noticias negativas', value: `${negativeNews} noticias` },
          { label: 'Total analizado', value: `${totalNews} noticias` }
        ],
        recommendations: [
          'Verificar fuentes de información',
          'Implementar fact-checking automático',
          'Alertar sobre posible desinformación'
        ]
      });
    }

    // Detectar Spam/Masivo
    // Indicadores: Muchas alertas, contenido repetitivo
    if (alertsCount > 20 && duplicateRate > 0.2) {
      attacks.push({
        type: 'Spam/Masivo',
        severity: alertsCount > 50 ? 'high' : 'medium',
        description: 'Posible ataque de spam o envío masivo detectado. Alto número de alertas y contenido duplicado.',
        indicators: [
          { label: 'Alertas activadas', value: `${alertsCount} alertas` },
          { label: 'Tasa de duplicados', value: `${Math.round(duplicateRate * 100)}%` },
          { label: 'Volumen total', value: `${totalNews} noticias` }
        ],
        recommendations: [
          'Implementar filtros anti-spam',
          'Limitar frecuencia de publicación',
          'Verificar origen de las noticias'
        ]
      });
    }

    // Detectar Ataques de Inyección SQL/Web
    // Indicadores: Palabras relacionadas con bases de datos, SQL, inyección
    const sqlKeywords = ['sql', 'database', 'inyección', 'query', 'script', 'ejecutar', 'comando'];
    const sqlMatches = keywords.filter(kw => sqlKeywords.some(sk => kw.includes(sk))).length;
    if (sqlMatches > 1) {
      attacks.push({
        type: 'Inyección SQL/Web',
        severity: 'high',
        description: 'Posible intento de inyección SQL o ataque web detectado. Contenido relacionado con bases de datos y ejecución de comandos.',
        indicators: [
          { label: 'Referencias detectadas', value: `${sqlMatches} menciones` },
          { label: 'Palabras clave', value: keywords.filter(kw => sqlKeywords.some(sk => kw.includes(sk))).join(', ') || 'N/A' },
          { label: 'Nivel de riesgo', value: 'ALTO' }
        ],
        recommendations: [
          'Validar y sanitizar todas las entradas',
          'Usar consultas parametrizadas',
          'Implementar WAF (Web Application Firewall)'
        ]
      });
    }

    return attacks;
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Cargando analytics...</LoadingSpinner>
      </Container>
    );
  }

  if (error && !loading) {
    return (
      <Container>
        <Header>
          <HeaderContent>
            <BackButton onClick={() => navigate('/')}>
              <FiArrowLeft />
              Volver
            </BackButton>
            <TitleSection>
              <Title>
                <FiBarChart2 />
                Dashboard de Analytics
              </Title>
              <Subtitle>Análisis completo de noticias y tendencias</Subtitle>
            </TitleSection>
            <div style={{ width: '140px' }}></div>
          </HeaderContent>
        </Header>
        <MainContent>
        <ErrorMessage>
          <div style={{ marginBottom: '1rem', fontWeight: 600 }}>⚠️ {error}</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
            <p>Posibles soluciones:</p>
            <ul style={{ textAlign: 'left', display: 'inline-block' }}>
              <li>Verifica que el backend esté ejecutándose en http://localhost:8000</li>
              <li>Intenta con un rango de días diferente (último mes en lugar de última semana)</li>
              <li>Verifica que haya noticias en la base de datos para el período seleccionado</li>
              <li>Revisa la consola del navegador para más detalles del error</li>
            </ul>
          </div>
          <RetryButton onClick={() => fetchAllAnalytics()}>
            🔄 Reintentar
          </RetryButton>
        </ErrorMessage>
        <FilterSection>
          <FilterLabel>Período de análisis:</FilterLabel>
          <FilterSelect 
            value={timeRange} 
            onChange={(e) => {
              setTimeRange(Number(e.target.value));
              setError(null);
            }}
          >
            <option value={1}>Último día</option>
            <option value={7}>Última semana</option>
            <option value={30}>Último mes</option>
          </FilterSelect>
        </FilterSection>
        </MainContent>
      </Container>
    );
  }

  const sentimentPercentages = calculateSentimentPercentages();

  return (
    <Container>
      <Header>
        <HeaderContent>
          <BackButton onClick={() => navigate('/')}>
            <FiArrowLeft />
            Volver
          </BackButton>
          <TitleSection>
            <Title>
              <FiBarChart2 />
              Dashboard de Analytics
            </Title>
            <Subtitle>Análisis completo de noticias y tendencias</Subtitle>
          </TitleSection>
          <div style={{ width: '140px' }}></div>
        </HeaderContent>
      </Header>

      <MainContent>

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
        <button
          onClick={() => fetchAllAnalytics()}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '0.6rem 1.5rem',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            marginLeft: '1rem',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
          }}
        >
          🔄 Actualizar
        </button>
      </FilterSection>

      <StatsGrid>
        <StatCard color="#28a745">
          <StatIcon color="#28a745">
            <FiEye size={24} />
          </StatIcon>
          <StatValue>
            {(stats.sentimientos?.sentimientos_general || []).reduce((sum, item) => sum + (item.cantidad || 0), 0)}
          </StatValue>
          <StatLabel>Noticias Analizadas</StatLabel>
        </StatCard>

        <StatCard color="#fd7e14">
          <StatIcon color="#fd7e14">
            <FiAlertTriangle size={24} />
          </StatIcon>
          <StatValue>{stats.alertas?.total_alerts || 0}</StatValue>
          <StatLabel>Alertas Activadas</StatLabel>
        </StatCard>

        <StatCard color="#6f42c1">
          <StatIcon color="#6f42c1">
            <FiTrendingUp size={24} />
          </StatIcon>
          <StatValue>{(stats.keywords || []).length}</StatValue>
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
            <h4 style={{ color: 'white', marginBottom: '1rem' }}>Por Diario:</h4>
            {((stats.sentimientos?.por_diario || []).slice(0, 6)).map((item, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '0.5rem',
                padding: '0.8rem',
                background: 'rgba(102, 126, 234, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(102, 126, 234, 0.2)'
              }}>
                <span style={{ color: 'white' }}>{item.diario} - {getSentimentEmoji(item.sentimiento)} {item.sentimiento}</span>
                <span style={{ fontWeight: '600', color: 'white' }}>{item.cantidad}</span>
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
            {((stats.keywords || []).slice(0, 8)).map((keyword, index) => (
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
          {Array.from(new Set((stats.sentimientos?.por_diario || []).map(item => item.diario))).map(diario => {
            const diarioData = (stats.sentimientos?.por_diario || []).filter(item => item.diario === diario);
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

      {((stats.duplicados?.total_news || 0) > 0 || (stats.alertas?.total_alerts || 0) > 0) && (
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
                    {(stats.duplicados?.total_news || 0) > 0 
                      ? Math.round((1 - (stats.duplicados?.duplicate_rate || 0)) * 100)
                      : 100}%
                  </MetricValue>
                </DiarioMetric>
                <DiarioMetric>
                  <MetricLabel>Noticias únicas:</MetricLabel>
                  <MetricValue>{stats.duplicados?.unique_news || 0}</MetricValue>
                </DiarioMetric>
              </DiarioMetrics>
            </DiarioCard>
            
            <DiarioCard>
              <DiarioName>Sistema de Alertas</DiarioName>
              <DiarioMetrics>
                <DiarioMetric>
                  <MetricLabel>Alertas enviadas:</MetricLabel>
                  <MetricValue>{stats.alertas?.notifications_sent || 0}</MetricValue>
                </DiarioMetric>
                <DiarioMetric>
                  <MetricLabel>Tasa de entrega:</MetricLabel>
                  <MetricValue>
                    {Math.round((stats.alertas?.notification_rate || 0) * 100)}%
                  </MetricValue>
                </DiarioMetric>
              </DiarioMetrics>
            </DiarioCard>
          </DiarioStats>
        </ChartCard>
      )}

      {/* Análisis Interactivo de Flujos - Detección de Ataques */}
      <AttackAnalysisCard>
        <ChartTitle>
          <FiShield />
          Análisis Interactivo de Flujos - Detección de Amenazas
        </ChartTitle>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          Análisis basado en los filtros aplicados: Período de {timeRange} días, 
          {(stats.keywords || []).length > 0 && ` palabras clave trending, `}
          {(stats.alertas?.total_alerts || 0) > 0 && ` alertas activadas`}
        </p>
        
        {(() => {
          const detectedAttacks = detectAttackTypes();
          
          if (detectedAttacks.length === 0) {
            return (
              <NoThreatsCard>
                <FiShield size={48} style={{ marginBottom: '1rem' }} />
                <h3 style={{ margin: '0 0 0.5rem 0' }}>No se detectaron amenazas</h3>
                <p style={{ margin: 0 }}>El sistema no ha identificado patrones de ataque en el período analizado.</p>
              </NoThreatsCard>
            );
          }

          return detectedAttacks.map((attack, index) => (
            <AttackTypeCard key={index} severity={attack.severity}>
              <AttackTypeHeader>
                <FiActivity size={24} />
                <AttackTypeTitle>
                  {attack.type}
                  <ThreatLevelBadge>
                    {attack.severity === 'critical' ? 'CRÍTICO' :
                     attack.severity === 'high' ? 'ALTO' :
                     attack.severity === 'medium' ? 'MEDIO' : 'BAJO'}
                  </ThreatLevelBadge>
                </AttackTypeTitle>
              </AttackTypeHeader>
              <AttackTypeDescription>{attack.description}</AttackTypeDescription>
              
              <AttackIndicators>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Indicadores Detectados:</h4>
                {attack.indicators.map((indicator, idx) => (
                  <IndicatorItem key={idx}>
                    <IndicatorLabel>{indicator.label}:</IndicatorLabel>
                    <IndicatorValue>{indicator.value}</IndicatorValue>
                  </IndicatorItem>
                ))}
              </AttackIndicators>

              {attack.recommendations && attack.recommendations.length > 0 && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.3)' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Recomendaciones:</h4>
                  <ul style={{ margin: 0, paddingLeft: '1.5rem', opacity: 0.95 }}>
                    {attack.recommendations.map((rec, idx) => (
                      <li key={idx} style={{ marginBottom: '0.3rem' }}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </AttackTypeCard>
          ));
        })()}
      </AttackAnalysisCard>
      </MainContent>
    </Container>
  );
};

export default AnalyticsDashboard;
