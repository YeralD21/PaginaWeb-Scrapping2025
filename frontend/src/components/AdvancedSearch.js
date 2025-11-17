import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';
import { FiSearch, FiCalendar, FiFilter, FiX, FiArrowLeft } from 'react-icons/fi';

const SearchContainer = styled.div`
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 2rem;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--card-bg);
  color: var(--text-primary);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 2rem;
  transition: all 0.3s ease;

  &:hover {
    background: var(--bg-secondary);
    transform: translateX(-5px);
  }
`;

const SearchHeader = styled.div`
  max-width: 1400px;
  margin: 0 auto 2rem;
`;

const SearchTitle = styled.h1`
  color: var(--text-primary);
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SearchForm = styled.div`
  max-width: 1400px;
  margin: 0 auto 2rem;
  background: var(--card-bg);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

const SearchInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 1.5rem;
  padding-left: 3rem;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-size: 1.1rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: var(--text-secondary);
  }
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 1rem;
  font-size: 1.3rem;
  color: var(--text-secondary);
  pointer-events: none;
`;

const FiltersRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  color: var(--text-primary);
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  option {
    background: var(--bg-primary);
    color: var(--text-primary);
  }
`;

const DateInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::-webkit-calendar-picker-indicator {
    filter: ${props => props.$theme === 'dark' ? 'invert(1)' : 'none'};
    cursor: pointer;
  }
`;

const ButtonsRow = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

const SearchButton = styled.button`
  padding: 1rem 2.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 8px 16px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ClearButton = styled.button`
  padding: 1rem 2.5rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--bg-tertiary);
  }
`;

const ResultsContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--card-bg);
  border-radius: 12px;
`;

const ResultsCount = styled.h2`
  color: var(--text-primary);
  font-size: 1.5rem;
  margin: 0;
`;

const SectionTitle = styled.h3`
  color: var(--text-primary);
  font-size: 1.5rem;
  margin: 2rem 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const NewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const TextOnlyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const NewsCard = styled.div`
  background: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid var(--border-color);
  display: flex;
  flex-direction: column;
  height: 100%;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.2);
    border-color: #667eea;
  }
`;

const TextOnlyCard = styled.div`
  background: var(--card-bg);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid var(--border-color);
  border-left: 4px solid #667eea;

  &:hover {
    transform: translateX(5px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    border-left-color: #764ba2;
  }
`;

const NewsImage = styled.div`
  width: 100%;
  height: 200px;
  background: ${props => props.$imageUrl 
    ? `url(${props.$imageUrl})` 
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  background-size: cover;
  background-position: center;
  position: relative;

  ${props => !props.$imageUrl && `
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
  `}
`;

const NewsBadge = styled.span`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: ${props => props.$color || '#667eea'};
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const NewsContent = styled.div`
  padding: 1.5rem;
`;

const NewsCategory = styled.span`
  display: inline-block;
  background: var(--bg-tertiary);
  color: var(--filter-text-color);
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
`;

const NewsTitle = styled.h3`
  color: var(--text-primary);
  font-size: 1.2rem;
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const NewsMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
`;

const NewsMetaItem = styled.span`
  color: var(--text-secondary);
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const NewsExcerpt = styled.p`
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem;
  font-size: 1.2rem;
  color: var(--text-secondary);
`;

const NoResults = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: var(--card-bg);
  border-radius: 16px;
  color: var(--text-secondary);

  h3 {
    color: var(--text-primary);
    font-size: 1.8rem;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.1rem;
    margin-bottom: 2rem;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin: 2rem 0;
  padding: 1.5rem;
  background: var(--card-bg);
  border-radius: 12px;
  flex-wrap: wrap;
`;

const PaginationButton = styled.button`
  padding: 0.75rem 1rem;
  background: ${props => props.$active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'var(--bg-secondary)'};
  color: ${props => props.$active ? 'white' : 'var(--text-primary)'};
  border: 2px solid ${props => props.$active ? 'transparent' : 'var(--border-color)'};
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  opacity: ${props => props.$disabled ? 0.5 : 1};
  min-width: 44px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const PaginationInfo = styled.span`
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0 1rem;
  white-space: nowrap;
`;

const AdvancedSearch = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSentiment, setSelectedSentiment] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  // Cargar categorías disponibles
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await axios.get('http://localhost:8000/categorias-disponibles');
        setCategorias(response.data.categorias || []);
      } catch (error) {
        console.error('Error cargando categorías:', error);
      }
    };
    fetchCategorias();
  }, []);

  // Búsqueda en tiempo real mientras se escribe (solo primera página)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim().length >= 2 || selectedCategory || selectedSentiment || fechaDesde || fechaHasta) {
        // Resetear a página 1 cuando cambian los filtros
        setPagination(prev => ({ ...prev, page: 1 }));
        // Llamar a handleSearch con página 1
        const performSearch = async () => {
          setLoading(true);
          try {
            const params = new URLSearchParams();
            if (searchTerm.trim() && searchTerm.trim().length >= 2) {
              params.append('q', searchTerm.trim());
            }
            if (selectedCategory) {
              params.append('categoria', selectedCategory);
            }
            if (selectedSentiment) {
              params.append('sentimiento', selectedSentiment);
            }
            if (fechaDesde) {
              params.append('fecha_desde', fechaDesde);
            }
            if (fechaHasta) {
              params.append('fecha_hasta', fechaHasta);
            }
            params.append('page', '1');
            params.append('per_page', '20');

            const response = await axios.get(`http://localhost:8000/api/buscar-noticias?${params.toString()}`);
            if (response.data) {
              if (response.data.noticias && Array.isArray(response.data.noticias)) {
                setResults(response.data.noticias);
                if (response.data.pagination) {
                  setPagination(response.data.pagination);
                }
              } else if (Array.isArray(response.data)) {
                setResults(response.data);
              }
            }
          } catch (error) {
            console.error('Error en búsqueda:', error);
            setResults([]);
          } finally {
            setLoading(false);
          }
        };
        performSearch();
      } else {
        setResults([]);
        setPagination({
          page: 1,
          per_page: 20,
          total: 0,
          total_pages: 0,
          has_next: false,
          has_prev: false
        });
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedCategory, selectedSentiment, fechaDesde, fechaHasta]);

  const handleSearch = async (pageNumber = null) => {
    // Si no hay ningún criterio de búsqueda, no hacer nada
    if (!searchTerm.trim() && !selectedCategory && !selectedSentiment && !fechaDesde && !fechaHasta) {
      setResults([]);
      setPagination({
        page: 1,
        per_page: 20,
        total: 0,
        total_pages: 0,
        has_next: false,
        has_prev: false
      });
      return;
    }

    setLoading(true);
    
    try {
      const params = new URLSearchParams();
      
      // Agregar parámetros solo si tienen valor (todos son opcionales)
      if (searchTerm.trim() && searchTerm.trim().length >= 2) {
        params.append('q', searchTerm.trim());
      }
      
      if (selectedCategory) {
        params.append('categoria', selectedCategory);
      }
      
      if (selectedSentiment) {
        params.append('sentimiento', selectedSentiment);
      }
      
      if (fechaDesde) {
        params.append('fecha_desde', fechaDesde);
      }
      
      if (fechaHasta) {
        params.append('fecha_hasta', fechaHasta);
      }
      
      // Parámetros de paginación
      const currentPage = pageNumber || pagination.page || 1;
      params.append('page', currentPage.toString());
      params.append('per_page', '20'); // 20 noticias por página

      console.log('🔍 Buscando con:', params.toString());
      
      // Usar el NUEVO endpoint que funciona sin validación de FastAPI
      const response = await axios.get(`http://localhost:8000/api/buscar-noticias?${params.toString()}`);
      
      if (response.data) {
        // El nuevo formato incluye paginación
        if (response.data.noticias && Array.isArray(response.data.noticias)) {
          console.log(`✅ ${response.data.noticias.length} noticias encontradas (página ${response.data.pagination?.page || 1})`);
          setResults(response.data.noticias);
          if (response.data.pagination) {
            setPagination(response.data.pagination);
          }
        } else if (Array.isArray(response.data)) {
          // Compatibilidad con formato anterior
          console.log(`✅ ${response.data.length} noticias encontradas`);
          setResults(response.data);
        } else {
          console.log('⚠️ Respuesta sin datos');
          setResults([]);
        }
      } else {
        console.log('⚠️ Respuesta sin datos');
        setResults([]);
      }
    } catch (error) {
      console.error('❌ Error en búsqueda:', error);
      if (error.response?.data?.detail) {
        console.error('Detalle del error:', error.response.data.detail);
      }
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedSentiment('');
    setFechaDesde('');
    setFechaHasta('');
    setResults([]);
    setPagination({
      page: 1,
      per_page: 20,
      total: 0,
      total_pages: 0,
      has_next: false,
      has_prev: false
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      handleSearch(newPage);
      // Scroll al inicio de los resultados
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNewsClick = (noticia) => {
    navigate(`/noticia/${noticia.id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <SearchContainer>
      <SearchHeader>
        <BackButton onClick={() => navigate('/')}>
          <FiArrowLeft /> Volver al Inicio
        </BackButton>
        <SearchTitle>
          <FiSearch /> Búsqueda de Noticias
        </SearchTitle>
      </SearchHeader>

      <SearchForm>
        <SearchInputWrapper>
          <SearchIcon />
          <SearchInput
            type="text"
            placeholder="Buscar por título (ej: 'messi', 'economía', 'tecnología'...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchInputWrapper>

        <FiltersRow>
          <FilterGroup>
            <Label>
              <FiFilter /> Categoría
            </Label>
            <Select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
          </FilterGroup>

          <FilterGroup>
            <Label>
              <FiFilter /> Análisis de Sentimientos
            </Label>
            <Select 
              value={selectedSentiment} 
              onChange={(e) => setSelectedSentiment(e.target.value)}
            >
              <option value="">Todos los sentimientos</option>
              <option value="positivo">😊 Positivo</option>
              <option value="negativo">😞 Negativo</option>
              <option value="alegre">😄 Alegre</option>
              <option value="triste">😢 Triste</option>
              <option value="enojado">😠 Enojado</option>
              <option value="neutro">😐 Neutro</option>
            </Select>
          </FilterGroup>

          <FilterGroup>
            <Label>
              <FiCalendar /> Fecha Desde
            </Label>
            <DateInput
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              $theme={theme}
            />
          </FilterGroup>

          <FilterGroup>
            <Label>
              <FiCalendar /> Fecha Hasta
            </Label>
            <DateInput
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              $theme={theme}
            />
          </FilterGroup>
        </FiltersRow>

        <ButtonsRow>
          <SearchButton onClick={handleSearch} disabled={loading}>
            <FiSearch />
            {loading ? 'Buscando...' : 'Buscar'}
          </SearchButton>
          <ClearButton onClick={handleClear}>
            <FiX /> Limpiar
          </ClearButton>
        </ButtonsRow>
      </SearchForm>

      {loading && (
        <LoadingSpinner>
          Buscando noticias...
        </LoadingSpinner>
      )}

      {!loading && results.length > 0 && (() => {
        // Separar noticias con y sin imagen
        const noticiasConImagen = results.filter(n => n.imagen_url && n.imagen_url.trim() !== '');
        const noticiasSinImagen = results.filter(n => !n.imagen_url || n.imagen_url.trim() === '');
        
        return (
          <ResultsContainer>
            <ResultsHeader>
              <ResultsCount>
                {pagination.total > 0 ? (
                  <>
                    {pagination.total} noticia{pagination.total !== 1 ? 's' : ''} encontrada{pagination.total !== 1 ? 's' : ''}
                    {noticiasConImagen.length > 0 && noticiasSinImagen.length > 0 && (
                      <span style={{ fontSize: '1rem', fontWeight: 'normal', color: 'var(--text-secondary)', marginLeft: '1rem' }}>
                        ({noticiasConImagen.length} con imagen en esta página, {noticiasSinImagen.length} solo texto en esta página)
                      </span>
                    )}
                    <div style={{ fontSize: '0.9rem', fontWeight: 'normal', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                      Página {pagination.page} de {pagination.total_pages} • Mostrando {results.length} de {pagination.total} noticias
                    </div>
                  </>
                ) : (
                  `${results.length} noticia${results.length !== 1 ? 's' : ''} encontrada${results.length !== 1 ? 's' : ''}`
                )}
              </ResultsCount>
            </ResultsHeader>

            {/* Sección de noticias con imagen */}
            {noticiasConImagen.length > 0 && (
              <>
                <SectionTitle>
                  📸 Noticias con Imagen ({noticiasConImagen.length})
                </SectionTitle>
                <NewsGrid>
                  {noticiasConImagen.map((noticia) => (
                    <NewsCard key={noticia.id} onClick={() => handleNewsClick(noticia)}>
                      <NewsImage $imageUrl={noticia.imagen_url}>
                        {noticia.es_premium && (
                          <NewsBadge $color="#ffd700">⭐ Premium</NewsBadge>
                        )}
                      </NewsImage>
                      <NewsContent>
                        <NewsCategory>{noticia.categoria}</NewsCategory>
                        <NewsTitle>{noticia.titulo}</NewsTitle>
                        {noticia.contenido && (
                          <NewsExcerpt>{noticia.contenido}</NewsExcerpt>
                        )}
                        <NewsMeta>
                          <NewsMetaItem>
                            📰 {noticia.diario_nombre}
                          </NewsMetaItem>
                          <NewsMetaItem>
                            📅 {formatDate(noticia.fecha_publicacion)}
                          </NewsMetaItem>
                        </NewsMeta>
                      </NewsContent>
                    </NewsCard>
                  ))}
                </NewsGrid>
              </>
            )}

            {/* Sección de noticias solo texto */}
            {noticiasSinImagen.length > 0 && (
              <>
                <SectionTitle>
                  📝 Noticias Solo Texto ({noticiasSinImagen.length})
                </SectionTitle>
                <TextOnlyGrid>
                  {noticiasSinImagen.map((noticia) => (
                    <TextOnlyCard key={noticia.id} onClick={() => handleNewsClick(noticia)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <NewsCategory>{noticia.categoria}</NewsCategory>
                        {noticia.es_premium && (
                          <NewsBadge $color="#ffd700" style={{ position: 'static', margin: 0 }}>⭐ Premium</NewsBadge>
                        )}
                      </div>
                      <NewsTitle style={{ marginBottom: '0.75rem', fontSize: '1.1rem' }}>{noticia.titulo}</NewsTitle>
                      {noticia.contenido && (
                        <NewsExcerpt style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>{noticia.contenido}</NewsExcerpt>
                      )}
                      <NewsMeta style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                        <NewsMetaItem>
                          📰 {noticia.diario_nombre}
                        </NewsMetaItem>
                        <NewsMetaItem>
                          📅 {formatDate(noticia.fecha_publicacion)}
                        </NewsMetaItem>
                      </NewsMeta>
                    </TextOnlyCard>
                  ))}
                </TextOnlyGrid>
              </>
            )}

            {/* Paginación */}
            {pagination.total_pages > 1 && (
              <PaginationContainer>
                <PaginationButton
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.has_prev || loading}
                >
                  ← Anterior
                </PaginationButton>
                
                {/* Mostrar números de página */}
                {(() => {
                  const pages = [];
                  const totalPages = pagination.total_pages;
                  const currentPage = pagination.page;
                  
                  // Mostrar máximo 5 páginas
                  let startPage = Math.max(1, currentPage - 2);
                  let endPage = Math.min(totalPages, startPage + 4);
                  
                  // Ajustar si estamos cerca del final
                  if (endPage - startPage < 4) {
                    startPage = Math.max(1, endPage - 4);
                  }
                  
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <PaginationButton
                        key={i}
                        $active={i === currentPage}
                        onClick={() => handlePageChange(i)}
                        disabled={loading}
                      >
                        {i}
                      </PaginationButton>
                    );
                  }
                  
                  return pages;
                })()}
                
                <PaginationButton
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.has_next || loading}
                >
                  Siguiente →
                </PaginationButton>
                
                <PaginationInfo>
                  Página {pagination.page} de {pagination.total_pages}
                </PaginationInfo>
              </PaginationContainer>
            )}
          </ResultsContainer>
        );
      })()}

      {!loading && results.length === 0 && (searchTerm || selectedCategory || selectedSentiment || fechaDesde || fechaHasta) && (
        <NoResults>
          <h3>No se encontraron resultados</h3>
          <p>Intenta con otros términos de búsqueda o ajusta los filtros</p>
        </NoResults>
      )}

      {!loading && !searchTerm && !selectedCategory && !selectedSentiment && !fechaDesde && !fechaHasta && (
        <NoResults>
          <h3>Comienza a buscar noticias</h3>
          <p>Escribe un término de búsqueda, selecciona una categoría o elige un rango de fechas</p>
        </NoResults>
      )}
    </SearchContainer>
  );
};

export default AdvancedSearch;
