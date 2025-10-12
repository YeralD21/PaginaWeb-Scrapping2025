import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  FiGlobe,
  FiMapPin,
  FiHome,
  FiLayers,
  FiFileText,
  FiTrendingUp,
  FiBarChart2,
  FiRefreshCw,
  FiChevronDown,
  FiChevronRight,
  FiFilter
} from 'react-icons/fi';

// Styled Components - Diseño elegante y moderno
const Container = styled.div`
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  border: none;
  padding: 0;
  position: relative;
  min-width: auto;
  flex-shrink: 0;
`;

const Header = styled.div`
  margin-bottom: 12px;
  text-align: center;
`;

const Title = styled.h3`
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, #1f2937, #4b5563);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 2px 0;
  letter-spacing: -0.025em;
`;

const Subtitle = styled.p`
  color: #64748b;
  font-size: 11px;
  margin: 0;
  font-weight: 500;
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: #eff6ff;
  border-radius: 6px;
  font-size: 12px;
  color: #2563eb;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: stretch;
  
  @media (min-width: 500px) {
    flex-direction: row;
    align-items: flex-start;
  }
`;

const FiltersGrid = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: flex-start;
`;

const StatsSection = styled.div`
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 12px;
  padding: 8px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  min-width: 140px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
  flex-shrink: 0;
`;

const FilterCard = styled.button`
  position: relative;
  padding: 6px 10px;
  border-radius: 12px;
  border: 2px solid ${props => props.isSelected ? props.borderColor : 'transparent'};
  background: ${props => props.isSelected ? 
    `linear-gradient(135deg, ${props.bgColor}, ${props.borderColor}15)` : 
    'rgba(255, 255, 255, 0.8)'};
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  min-width: 70px;
  text-align: center;
  transform-origin: center;
  box-shadow: ${props => props.isSelected ? 
    `0 8px 25px -8px ${props.borderColor}40` : 
    '0 2px 4px rgba(0, 0, 0, 0.05)'};
  
  &:hover {
    border-color: ${props => props.borderColor};
    background: ${props => `linear-gradient(135deg, ${props.bgColor}, ${props.borderColor}20)`};
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 12px 25px -8px ${props => props.borderColor}50;
  }
  
  &:active {
    transform: translateY(0) scale(0.98);
  }
`;

const CardTitle = styled.div`
  font-weight: 600;
  font-size: 12px;
  color: ${props => props.isSelected ? props.textColor : '#374151'};
  margin-bottom: 2px;
`;

const StatsNumber = styled.div`
  font-weight: 700;
  font-size: 13px;
  color: ${props => props.isSelected ? props.textColor : '#1f2937'};
  transition: all 0.3s ease;
  position: relative;
  
  &.updating {
    animation: pulse 0.6s ease-in-out;
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); color: #10b981; }
    100% { transform: scale(1); }
  }
`;

const StatsLabel = styled.div`
  font-size: 9px;
  color: #6b7280;
  margin-top: 1px;
  font-weight: 500;
`;

const StatsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 6px;
`;

const StatsTitle = styled.h4`
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  font-size: 12px;
`;

const StatsGrid = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
`;

const StatCard = styled.div`
  text-align: center;
  padding: 4px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  min-width: 45px;
  flex: 1;
`;

const StatNumber = styled.div`
  font-weight: 700;
  font-size: 11px;
  color: ${props => props.color || '#1f2937'};
  margin-bottom: 1px;
  transition: all 0.3s ease;
  
  &.updating {
    animation: countUp 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  @keyframes countUp {
    0% { 
      transform: scale(0.8) rotateX(90deg); 
      opacity: 0; 
    }
    50% { 
      transform: scale(1.05) rotateX(0deg); 
      opacity: 1; 
    }
    100% { 
      transform: scale(1) rotateX(0deg); 
      opacity: 1; 
    }
  }
`;

const StatLabel = styled.div`
  font-size: 7px;
  color: #4b5563;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatSubLabel = styled.div`
  font-size: 6px;
  color: #6b7280;
  margin-top: 1px;
  font-weight: 500;
`;

const ActiveFilterSection = styled.div`
  margin-top: 12px;
  padding: 8px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  font-size: 12px;
`;

const ActiveFilterContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ActiveFilterText = styled.div`
  color: #1e40af;
  font-weight: 500;
`;

const ClearButton = styled.button`
  padding: 4px 8px;
  background: white;
  color: #2563eb;
  border: 1px solid #bfdbfe;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    background: #dbeafe;
  }
`;

const ToggleButton = styled.button`
  padding: 0.5rem 1rem;
  background: white;
  color: #495057;
  border: 1px solid #e9ecef;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  &:hover {
    border-color: #dc3545;
    color: #dc3545;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ExpandableContent = styled.div`
  overflow: hidden;
  transition: all 0.3s ease;
  max-height: ${props => props.isExpanded ? '400px' : '0px'};
  opacity: ${props => props.isExpanded ? '1' : '0'};
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.2);
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  min-width: 300px;
  max-width: 500px;
`;

const IconWrapper = styled.div`
  transition: transform 0.3s ease;
  transform: ${props => props.isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const GeographicFilter = ({ onFilterChange, selectedType = 'todos' }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [animatingStats, setAnimatingStats] = useState(new Set());
  const [previousStats, setPreviousStats] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Configuración de tipos geográficos - diseño compacto
  const geographicTypes = [
    { 
      key: 'todos', 
      label: 'Todas', 
      textColor: '#1e293b',
      bgColor: '#f8fafc',
      borderColor: '#e2e8f0',
      description: 'Ver todas las noticias sin filtro'
    },
    { 
      key: 'internacional', 
      label: 'Internacional', 
      textColor: '#ffffff',
      bgColor: '#3b82f6',
      borderColor: '#2563eb',
      description: 'Noticias de otros países y organismos internacionales'
    },
    { 
      key: 'nacional', 
      label: 'Nacional', 
      textColor: '#ffffff',
      bgColor: '#10b981',
      borderColor: '#059669',
      description: 'Noticias del gobierno y política nacional'
    },
    { 
      key: 'regional', 
      label: 'Regional', 
      textColor: '#ffffff',
      bgColor: '#8b5cf6',
      borderColor: '#7c3aed',
      description: 'Noticias de las regiones del Perú'
    },
    { 
      key: 'local', 
      label: 'Local', 
      textColor: '#ffffff',
      bgColor: '#f59e0b',
      borderColor: '#d97706',
      description: 'Noticias de Lima y Callao'
    }
  ];

  // Cargar estadísticas geográficas
  useEffect(() => {
    loadGeographicStats();
    
    // Configurar actualización automática cada 30 segundos
    const interval = setInterval(() => {
      loadGeographicStats(true);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadGeographicStats = async (isAutoUpdate = false) => {
    if (!isAutoUpdate) {
      setLoading(true);
    }
    
    try {
      const response = await fetch('http://localhost:8000/analytics/geografico?dias=7');
      if (response.ok) {
        const data = await response.json();
        
        // Si es actualización automática, comparar y animar cambios
        if (isAutoUpdate && stats) {
          setPreviousStats(stats);
          animateChanges(stats, data);
        }
        
        setStats(data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas geográficas:', error);
    } finally {
      if (!isAutoUpdate) {
        setLoading(false);
      }
    }
  };

  // Animar cambios en las estadísticas
  const animateChanges = (oldStats, newStats) => {
    const changedStats = new Set();
    
    // Comparar total de noticias
    if (oldStats.total_noticias !== newStats.total_noticias) {
      changedStats.add('total');
    }
    
    // Comparar estadísticas por tipo
    if (oldStats.por_tipo_geografico && newStats.por_tipo_geografico) {
      oldStats.por_tipo_geografico.forEach((oldStat, index) => {
        const newStat = newStats.por_tipo_geografico[index];
        if (newStat && oldStat.cantidad !== newStat.cantidad) {
          changedStats.add(newStat.tipo);
        }
      });
    }
    
    if (changedStats.size > 0) {
      setAnimatingStats(changedStats);
      
      // Limpiar animaciones después de 1 segundo
      setTimeout(() => {
        setAnimatingStats(new Set());
      }, 1000);
    }
  };

  const handleFilterClick = (type) => {
    onFilterChange(type === 'todos' ? null : type);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const getStatsForType = (type) => {
    if (!stats || type === 'todos') return null;
    
    const typeStats = stats.por_tipo_geografico?.find(s => s.tipo === type);
    return typeStats || { cantidad: 0, porcentaje: 0 };
  };

  const getTotalNews = () => {
    if (!stats) return 0;
    return stats.total_noticias || 0;
  };

  return (
    <Container>
      {/* Botón de toggle */}
      <ToggleButton onClick={toggleExpanded}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FiFilter style={{ width: '14px', height: '14px', color: '#6b7280' }} />
          <span>Filtrar Geográficamente</span>
        </div>
        <IconWrapper isExpanded={isExpanded}>
          <FiChevronDown style={{ width: '14px', height: '14px', color: '#6b7280' }} />
        </IconWrapper>
      </ToggleButton>

      {/* Contenido desplegable */}
      <ExpandableContent isExpanded={isExpanded}>
        <div style={{ 
          padding: '6px 10px', 
          display: 'flex', 
          flexDirection: 'column',
          gap: '6px',
          width: '100%'
        }}>
          {/* Título */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiFilter style={{ width: '16px', height: '16px', color: '#6b7280' }} />
            <span style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#374151',
              letterSpacing: '0.3px'
            }}>
              Filtros:
            </span>
          </div>

          {/* Filtros en grid de 2 columnas */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '4px',
            width: '100%'
          }}>
            {geographicTypes.map((type) => {
              const isSelected = selectedType === type.key;
              const typeStats = getStatsForType(type.key);
              
              return (
                <button
                  key={type.key}
                  onClick={() => handleFilterClick(type.key)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: `1px solid ${isSelected ? type.borderColor : '#e5e7eb'}`,
                    background: isSelected ? type.bgColor : 'white',
                    color: isSelected ? type.textColor : '#6b7280',
                    fontSize: '11px',
                    fontWeight: isSelected ? '600' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: isSelected ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
                    transform: isSelected ? 'translateY(-1px)' : 'translateY(0)',
                    minHeight: '28px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.target.style.background = '#f9fafb';
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.target.style.background = 'white';
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                >
                  <span style={{ fontSize: '11px', fontWeight: 'inherit' }}>{type.label}</span>
                  {typeStats && (
                    <span style={{ 
                      fontSize: '9px', 
                      fontWeight: '700',
                      opacity: isSelected ? '0.9' : '0.7',
                      background: isSelected ? 'rgba(255, 255, 255, 0.2)' : '#f3f4f6',
                      color: isSelected ? 'white' : '#374151',
                      padding: '1px 3px',
                      borderRadius: '2px',
                      minWidth: '16px',
                      textAlign: 'center'
                    }}>
                      {typeStats.cantidad}
                    </span>
                  )}
                  {type.key === 'todos' && stats && (
                    <span style={{ 
                      fontSize: '9px', 
                      fontWeight: '700',
                      opacity: isSelected ? '0.9' : '0.7',
                      background: isSelected ? 'rgba(255, 255, 255, 0.2)' : '#f3f4f6',
                      color: isSelected ? 'white' : '#374151',
                      padding: '1px 3px',
                      borderRadius: '2px',
                      minWidth: '16px',
                      textAlign: 'center'
                    }}>
                      {getTotalNews()}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Filtro activo */}
          {selectedType && selectedType !== 'todos' && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '4px 8px',
              background: '#dbeafe',
              borderRadius: '4px',
              border: '1px solid #93c5fd'
            }}>
              <span style={{ fontSize: '11px', color: '#1e40af', fontWeight: '500' }}>
                Filtro activo: {geographicTypes.find(t => t.key === selectedType)?.label}
              </span>
              <button
                onClick={() => handleFilterClick('todos')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1e40af',
                  fontSize: '10px',
                  cursor: 'pointer',
                  padding: '2px 4px',
                  borderRadius: '2px',
                  fontWeight: '600',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#bfdbfe';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'none';
                }}
              >
                Limpiar
              </button>
            </div>
          )}
        </div>
      </ExpandableContent>
    </Container>
  );
};

export default GeographicFilter;
 