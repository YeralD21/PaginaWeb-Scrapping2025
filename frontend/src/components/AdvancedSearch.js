import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { FiSearch, FiFilter, FiCalendar, FiHeart, FiTrendingUp, FiClock, FiUser } from 'react-icons/fi';

const SearchContainer = styled.div`
  background: white;
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const SearchHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const SearchTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin: 0;
`;

const SearchForm = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
`;

const SearchInput = styled.div`
  position: relative;
  grid-column: 1 / -1;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #dc3545;
    box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
`;

const Select = styled.select`
  padding: 0.8rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #dc3545;
  }
`;

const DateInput = styled.input`
  padding: 0.8rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #dc3545;
  }
`;

const FilterRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const FilterChip = styled.button`
  background: ${props => props.active ? '#dc3545' : '#f8f9fa'};
  color: ${props => props.active ? 'white' : '#495057'};
  border: 2px solid ${props => props.active ? '#dc3545' : '#e9ecef'};
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.3rem;

  &:hover {
    background: ${props => props.active ? '#c82333' : '#e9ecef'};
  }
`;

const SearchButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-self: center;
  grid-column: 1 / -1;

  &:hover {
    background: #c82333;
    transform: translateY(-2px);
  }

  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
    transform: none;
  }
`;

const ResultsContainer = styled.div`
  margin-top: 2rem;
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ResultsCount = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const SortSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 0.9rem;
`;

const NewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
`;

const NewsCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const NewsImage = styled.div`
  height: 200px;
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  background-size: cover;
  background-position: center;
  position: relative;
`;

const NewsOverlay = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
`;

const NewsBadge = styled.span`
  background: ${props => {
    switch(props.type) {
      case 'urgencia-critica': return '#dc3545';
      case 'urgencia-alta': return '#fd7e14';
      case 'urgencia-media': return '#ffc107';
      case 'sentimiento-positivo': return '#28a745';
      case 'sentimiento-negativo': return '#dc3545';
      case 'trending': return '#6f42c1';
      default: return '#6c757d';
    }
  }};
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const NewsContent = styled.div`
  padding: 1.5rem;
`;

const NewsCategory = styled.div`
  background: #dc3545;
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  display: inline-block;
  margin-bottom: 0.8rem;
`;

const NewsTitle = styled.h3`
  font-size: 1.1rem;
  color: #333;
  margin: 0 0 0.8rem 0;
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
  margin-bottom: 1rem;
  font-size: 0.8rem;
  color: #666;
`;

const NewsMetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const NewsExcerpt = styled.p`
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const SentimentIcon = styled.div`
  color: ${props => {
    switch(props.sentiment) {
      case 'positivo': return '#28a745';
      case 'negativo': return '#dc3545';
      default: return '#6c757d';
    }
  }};
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  font-size: 1.1rem;
  color: #666;
`;

const AdvancedSearch = () => {
  const [searchParams, setSearchParams] = useState({
    q: '',
    categoria: '',
    diario: '',
    sentimiento: '',
    fecha_desde: '',
    fecha_hasta: '',
    limit: 50
  });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [sortBy, setSortBy] = useState('fecha');

  const diarios = ['El Comercio', 'Diario Correo', 'El Popular', 'CNN en Español'];
  const sentimientos = ['positivo', 'negativo', 'neutral'];

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      const response = await axios.get('http://localhost:8000/categorias-disponibles');
      setCategorias(response.data.categorias);
    } catch (error) {
      console.error('Error fetching categorias:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchParams.q.trim()) {
      alert('Por favor ingresa un término de búsqueda');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await axios.get(`http://localhost:8000/noticias/buscar?${params}`);
      setResults(response.data);
    } catch (error) {
      console.error('Error searching:', error);
      alert('Error en la búsqueda');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getSentimentEmoji = (sentiment) => {
    switch(sentiment) {
      case 'positivo': return '😊';
      case 'negativo': return '😞';
      default: return '😐';
    }
  };

  const sortedResults = [...results].sort((a, b) => {
    switch(sortBy) {
      case 'fecha':
        return new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion);
      case 'relevancia':
        return (b.popularidad_score || 0) - (a.popularidad_score || 0);
      case 'sentimiento':
        return (a.sentimiento || '').localeCompare(b.sentimiento || '');
      default:
        return 0;
    }
  });

  return (
    <div>
      <SearchContainer>
        <SearchHeader>
          <FiSearch size={24} color="#dc3545" />
          <SearchTitle>Búsqueda Avanzada</SearchTitle>
        </SearchHeader>

        <SearchForm>
          <SearchInput>
            <SearchIcon>
              <FiSearch />
            </SearchIcon>
            <Input
              type="text"
              placeholder="Buscar noticias por título o contenido..."
              value={searchParams.q}
              onChange={(e) => setSearchParams({...searchParams, q: e.target.value})}
              onKeyPress={handleKeyPress}
            />
          </SearchInput>

          <FormGroup>
            <Label>Categoría</Label>
            <Select
              value={searchParams.categoria}
              onChange={(e) => setSearchParams({...searchParams, categoria: e.target.value})}
            >
              <option value="">Todas las categorías</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Diario</Label>
            <Select
              value={searchParams.diario}
              onChange={(e) => setSearchParams({...searchParams, diario: e.target.value})}
            >
              <option value="">Todos los diarios</option>
              {diarios.map(diario => (
                <option key={diario} value={diario}>{diario}</option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Sentimiento</Label>
            <Select
              value={searchParams.sentimiento}
              onChange={(e) => setSearchParams({...searchParams, sentimiento: e.target.value})}
            >
              <option value="">Todos los sentimientos</option>
              {sentimientos.map(sent => (
                <option key={sent} value={sent}>
                  {getSentimentEmoji(sent)} {sent.charAt(0).toUpperCase() + sent.slice(1)}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Fecha Desde</Label>
            <DateInput
              type="date"
              value={searchParams.fecha_desde}
              onChange={(e) => setSearchParams({...searchParams, fecha_desde: e.target.value})}
            />
          </FormGroup>

          <FormGroup>
            <Label>Fecha Hasta</Label>
            <DateInput
              type="date"
              value={searchParams.fecha_hasta}
              onChange={(e) => setSearchParams({...searchParams, fecha_hasta: e.target.value})}
            />
          </FormGroup>

          <SearchButton onClick={handleSearch} disabled={loading}>
            <FiSearch />
            {loading ? 'Buscando...' : 'Buscar Noticias'}
          </SearchButton>
        </SearchForm>
      </SearchContainer>

      {results.length > 0 && (
        <ResultsContainer>
          <ResultsHeader>
            <ResultsCount>
              {results.length} noticias encontradas
            </ResultsCount>
            <SortSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="fecha">Más recientes</option>
              <option value="relevancia">Más relevantes</option>
              <option value="sentimiento">Por sentimiento</option>
            </SortSelect>
          </ResultsHeader>

          <NewsGrid>
            {sortedResults.map((noticia) => (
              <NewsCard key={noticia.id}>
                <NewsImage imageUrl={noticia.imagen_url}>
                  <NewsOverlay>
                    {noticia.es_alerta && (
                      <NewsBadge type={`urgencia-${noticia.nivel_urgencia}`}>
                        {noticia.nivel_urgencia}
                      </NewsBadge>
                    )}
                    {noticia.sentimiento && (
                      <NewsBadge type={`sentimiento-${noticia.sentimiento}`}>
                        {getSentimentEmoji(noticia.sentimiento)}
                      </NewsBadge>
                    )}
                    {noticia.es_trending && (
                      <NewsBadge type="trending">
                        <FiTrendingUp size={12} />
                      </NewsBadge>
                    )}
                  </NewsOverlay>
                </NewsImage>

                <NewsContent>
                  <NewsCategory>{noticia.categoria}</NewsCategory>
                  <NewsTitle>{noticia.titulo}</NewsTitle>

                  <NewsMeta>
                    <NewsMetaItem>
                      <FiCalendar size={12} />
                      {formatDate(noticia.fecha_publicacion)}
                    </NewsMetaItem>
                    <NewsMetaItem>
                      <FiClock size={12} />
                      {noticia.tiempo_lectura_min || 1} min
                    </NewsMetaItem>
                    <NewsMetaItem>
                      {noticia.diario_nombre}
                    </NewsMetaItem>
                  </NewsMeta>

                  {noticia.contenido && (
                    <NewsExcerpt>{noticia.contenido}</NewsExcerpt>
                  )}
                </NewsContent>
              </NewsCard>
            ))}
          </NewsGrid>
        </ResultsContainer>
      )}

      {loading && (
        <LoadingSpinner>
          Buscando noticias...
        </LoadingSpinner>
      )}
    </div>
  );
};

export default AdvancedSearch;
