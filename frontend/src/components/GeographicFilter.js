import React, { useState, useEffect } from 'react';

const GeographicFilter = ({ onFilterChange, selectedType = 'todos' }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Configuración de tipos geográficos
  const geographicTypes = [
    { 
      key: 'todos', 
      label: 'Todas las Noticias', 
      icon: '📰', 
      color: 'bg-gray-100 text-gray-800',
      description: 'Ver todas las noticias sin filtro'
    },
    { 
      key: 'internacional', 
      label: 'Internacional', 
      icon: '🌍', 
      color: 'bg-blue-100 text-blue-800',
      description: 'Noticias de otros países y organismos internacionales'
    },
    { 
      key: 'nacional', 
      label: 'Nacional', 
      icon: '🇵🇪', 
      color: 'bg-red-100 text-red-800',
      description: 'Noticias del gobierno y política nacional'
    },
    { 
      key: 'regional', 
      label: 'Regional', 
      icon: '🏞️', 
      color: 'bg-green-100 text-green-800',
      description: 'Noticias de las regiones del Perú'
    },
    { 
      key: 'local', 
      label: 'Local', 
      icon: '🏙️', 
      color: 'bg-yellow-100 text-yellow-800',
      description: 'Noticias de Lima y Callao'
    }
  ];

  // Cargar estadísticas geográficas
  useEffect(() => {
    loadGeographicStats();
  }, []);

  const loadGeographicStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/analytics/geografico?dias=7');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas geográficas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterClick = (type) => {
    onFilterChange(type === 'todos' ? null : type);
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
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <span className="mr-2">🗺️</span>
          Filtros Geográficos
        </h3>
        {loading && (
          <div className="flex items-center text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
            Cargando estadísticas...
          </div>
        )}
      </div>

      {/* Filtros en grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        {geographicTypes.map((type) => {
          const isSelected = selectedType === type.key;
          const typeStats = getStatsForType(type.key);
          
          return (
            <button
              key={type.key}
              onClick={() => handleFilterClick(type.key)}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-200 text-left
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-md transform scale-105' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }
              `}
              title={type.description}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{type.icon}</span>
                {isSelected && (
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                )}
              </div>
              
              <div className="text-sm font-medium text-gray-800 mb-1">
                {type.label}
              </div>
              
              {typeStats && (
                <div className="text-xs text-gray-600">
                  <div className="font-semibold">{typeStats.cantidad} noticias</div>
                  <div>{typeStats.porcentaje}% del total</div>
                </div>
              )}
              
              {type.key === 'todos' && stats && (
                <div className="text-xs text-gray-600">
                  <div className="font-semibold">{getTotalNews()} noticias</div>
                  <div>Últimos 7 días</div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Estadísticas detalladas */}
      {stats && (
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-lg text-gray-800">
                {getTotalNews()}
              </div>
              <div className="text-gray-600">Total Noticias</div>
              <div className="text-xs text-gray-500">Últimos 7 días</div>
            </div>
            
            {stats.por_tipo_geografico?.slice(0, 3).map((stat, index) => (
              <div key={stat.tipo} className="text-center">
                <div className="font-semibold text-lg text-gray-800">
                  {stat.cantidad}
                </div>
                <div className="text-gray-600 capitalize">{stat.tipo}</div>
                <div className="text-xs text-gray-500">{stat.porcentaje}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Indicador de filtro activo */}
      {selectedType && selectedType !== 'todos' && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-blue-800">
              <span className="mr-2">
                {geographicTypes.find(t => t.key === selectedType)?.icon}
              </span>
              <span className="font-medium">
                Filtro activo: {geographicTypes.find(t => t.key === selectedType)?.label}
              </span>
            </div>
            <button
              onClick={() => handleFilterClick('todos')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Limpiar filtro
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeographicFilter;
