import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import styled from 'styled-components';
import { FiArrowLeft } from 'react-icons/fi';
import './SocialMediaFeed.css';

// Styled Components para el diseño elegante similar a user-dashboard
const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1f3a 0%, #2d3561 50%, #1a1f3a 100%);
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background: rgba(26, 31, 58, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(102, 126, 234, 0.2);
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
`;

const HeaderTitle = styled.h1`
  font-size: 1.5rem;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const HeaderSubtitle = styled.p`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0.25rem 0 0 0;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
  color: white;
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 1rem;

  &:hover {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%);
    border-color: rgba(102, 126, 234, 0.5);
    transform: translateY(-2px);
  }
`;

const MainLayout = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

function SocialMediaFeed() {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [scraping, setScraping] = useState(false);
  const [scrapingYoutube, setScrapingYoutube] = useState(false);
  const [counts, setCounts] = useState({ twitter: 0, facebook: 0, instagram: 0, youtube: 0, total: 0 });
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [expandedPosts, setExpandedPosts] = useState({});
  const [brokenImages, setBrokenImages] = useState(new Set());
  const [playingVideos, setPlayingVideos] = useState({});

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    // Aplicar clase dark al contenedor, no al body para no afectar otras páginas
  }, [darkMode]);

  useEffect(() => {
    fetchSocialNews(activeFilter);
    fetchAllNewsForCounts();
  }, [activeFilter]);

  const fetchSocialNews = async (filterOverride = null) => {
    setLoading(true);
    setError(null);
    const filterToUse = filterOverride ?? activeFilter;
    
    try {
      let url = 'http://localhost:8000/social-media?limit=100';
      if (filterToUse !== 'all') {
        const platformName = filterToUse === 'youtube' ? 'YouTube' : 
                            filterToUse.charAt(0).toUpperCase() + filterToUse.slice(1);
        url += `&diario=${platformName}`;
      }
      
      const response = await axios.get(url);
      
      if (response.data && Array.isArray(response.data)) {
        setNews(response.data);
      } else {
        setNews([]);
      }
      setPlayingVideos({});
    } catch (err) {
      console.error('Error fetching social news:', err);
      setError('Error al cargar las noticias de redes sociales');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllNewsForCounts = async () => {
    try {
      const response = await axios.get('http://localhost:8000/social-media?limit=1000');
      
      if (response.data && Array.isArray(response.data)) {
        const twitterCount = response.data.filter(n => n.diario_nombre === 'Twitter').length;
        const facebookCount = response.data.filter(n => n.diario_nombre === 'Facebook').length;
        const instagramCount = response.data.filter(n => n.diario_nombre === 'Instagram').length;
        const youtubeCount = response.data.filter(n => n.diario_nombre === 'YouTube').length;
        const totalCount = response.data.length;
        
        setCounts({
          twitter: twitterCount,
          facebook: facebookCount,
          instagram: instagramCount,
          youtube: youtubeCount,
          total: totalCount
        });
      }
    } catch (err) {
      console.error('Error fetching counts:', err);
    }
  };

  const handleRefresh = async () => {
    setScraping(true);
    setError(null);
    
    // Guardar conteo anterior para calcular diferencias
    const previousCounts = { ...counts };
    
    try {
      const scrapResponse = await axios.post('http://localhost:8000/scraping/social-media/ejecutar');
      console.log('Scraping result:', scrapResponse.data);
      
      const result = scrapResponse.data;
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await fetchSocialNews();
      await fetchAllNewsForCounts();
      
      // Esperar un momento para que los conteos se actualicen
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Obtener estadísticas del backend (más confiables)
      const savedByPlatform = result.saved_by_platform || {};
      const newsByPlatform = result.news_by_platform || {};
      
      // Construir mensaje detallado SIEMPRE mostrando todas las redes sociales
      let detailMessage = '';
      const platformNames = {
        'Twitter': '🐦 Twitter',
        'Facebook': '📘 Facebook',
        'Instagram': '📸 Instagram',
        'YouTube': '▶️ YouTube'
      };
      
      // Lista de todas las plataformas posibles
      const allPlatforms = ['Twitter', 'Facebook', 'Instagram', 'YouTube'];
      
      // Usar estadísticas guardadas si están disponibles, sino usar extraídas
      const platformStats = Object.keys(savedByPlatform).length > 0 ? savedByPlatform : newsByPlatform;
      const statsType = Object.keys(savedByPlatform).length > 0 ? 'guardadas' : 'extraídas';
      
      // Construir mensaje con TODAS las plataformas, incluso si tienen 0
      detailMessage = '<div style="text-align: left; margin-top: 1rem; background: #f8f9fa; padding: 1rem; border-radius: 8px;">';
      detailMessage += `<strong style="color: #333; font-size: 1rem;">📊 Noticias ${statsType} por red social:</strong><br/><br/>`;
      
      // Ordenar plataformas por cantidad (mayor a menor), pero mostrar todas
      const sortedPlatforms = allPlatforms
        .map(platform => [platform, platformStats[platform] || 0])
        .sort((a, b) => b[1] - a[1]);
      
      sortedPlatforms.forEach(([platform, count]) => {
        const platformName = platformNames[platform] || platform;
        const emoji = platform === 'Twitter' ? '🐦' : 
                     platform === 'Facebook' ? '📘' : 
                     platform === 'Instagram' ? '📸' : '▶️';
        
        // Resaltar si tiene noticias, mostrar en gris si es 0
        const countColor = count > 0 ? '#28a745' : '#999';
        const countStyle = count > 0 ? 'font-weight: bold;' : '';
        
        detailMessage += `
          <div style="margin-bottom: 0.5rem; padding: 0.5rem; background: ${count > 0 ? '#e8f5e9' : '#f5f5f5'}; border-radius: 5px;">
            ${emoji} <strong style="color: #333;">${platformName}:</strong> 
            <span style="color: ${countColor}; ${countStyle}">${count} noticia${count !== 1 ? 's' : ''}</span>
          </div>
        `;
      });
      
      detailMessage += '</div>';
      
      // Mostrar SweetAlert con estadísticas
      if (result.success) {
        const totalSaved = result.total_saved || 0;
        const totalExtracted = result.total_extracted || 0;
        
        Swal.fire({
          title: '✅ Noticias Actualizadas',
          html: `
            <div style="text-align: center;">
              <h3 style="color: #28a745; margin-bottom: 1rem; font-size: 1.5rem;">
                ${totalSaved} nueva${totalSaved !== 1 ? 's' : ''} noticia${totalSaved !== 1 ? 's' : ''} añadida${totalSaved !== 1 ? 's' : ''}
              </h3>
              ${detailMessage}
              <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #dee2e6;">
                <p style="color: #666; font-size: 0.9rem; margin-bottom: 0.5rem;">
                  📥 <strong>Total extraído:</strong> ${totalExtracted} noticias
                </p>
                ${result.duplicates_detected > 0 ? `<p style="color: #ffc107; margin-top: 0.5rem;"><strong>⚠️ ${result.duplicates_detected} duplicados detectados</strong></p>` : ''}
                <p style="color: #666; margin-top: 0.5rem; font-size: 0.85rem;">
                  ⏱️ Tiempo de ejecución: ${result.duration_seconds || 0} segundos
                </p>
              </div>
            </div>
          `,
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#28a745',
          width: '550px',
          customClass: {
            popup: 'swal2-popup-custom',
            title: 'swal2-title-custom',
            htmlContainer: 'swal2-html-container-custom'
          }
        });
      } else {
        Swal.fire({
          title: '⚠️ Error al Actualizar',
          text: result.error || 'Ocurrió un error al actualizar las noticias',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#dc3545'
        });
      }
      
    } catch (err) {
      console.error('Error scraping:', err);
      setError('Error al actualizar las noticias');
      
      Swal.fire({
        title: '❌ Error',
        text: err.response?.data?.detail || 'Error al actualizar las noticias. Por favor, intenta nuevamente.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#dc3545'
      });
    } finally {
      setScraping(false);
    }
  };

  const handleYoutubeRefresh = async () => {
    setScrapingYoutube(true);
    setError(null);
    try {
      const scrapResponse = await axios.post('http://localhost:8000/scraping/social-media/youtube/ejecutar');
      console.log('Scraping YouTube result:', scrapResponse.data);

      await new Promise(resolve => setTimeout(resolve, 2000));

      setActiveFilter('youtube');
      await fetchSocialNews('youtube');
      await fetchAllNewsForCounts();
    } catch (err) {
      console.error('Error scraping YouTube:', err);
      setError('Error al actualizar los videos de YouTube');
    } finally {
      setScrapingYoutube(false);
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const toggleExpandPost = (postId) => {
    setExpandedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const toggleVideoPlayback = (newsId) => {
    setPlayingVideos(prev => {
      const isPlaying = !!prev[newsId];
      if (isPlaying) {
        return {};
      }
      return { [newsId]: true };
    });
  };

  const handlePlayButtonClick = (event, newsId) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    toggleVideoPlayback(newsId);
  };

  const handleNewsClick = (url) => {
    if (url) {
      console.log('Opening URL:', url);
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleMediaCardClick = (event, item) => {
    if (event) {
      event.preventDefault();
    }
    if (isYouTubeItem(item)) {
      event.stopPropagation();
      toggleVideoPlayback(item.id);
      return;
    }
    handleNewsClick(item.enlace);
  };

  const handleImageError = (newsId) => {
    setBrokenImages(prev => new Set([...prev, newsId]));
  };

  const handleImageLoad = (newsId) => {
    setBrokenImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(newsId);
      return newSet;
    });
  };

  const isYouTubeItem = (item) => {
    if (!item) return false;
    const source = (item.diario_nombre || item.diario || '').toLowerCase();
    const url = item.enlace || '';
    return source === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be');
  };

  const extractYouTubeId = (url = '') => {
    if (!url) return null;
    try {
      const patterns = [
        /youtube\.com\/watch\?v=([^&]+)/,
        /youtu\.be\/([^?&]+)/,
        /youtube\.com\/embed\/([^?&]+)/,
        /youtube\.com\/shorts\/([^?&]+)/
      ];
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }
      const parsed = new URL(url);
      if (parsed.hostname.includes('youtube') && parsed.searchParams.get('v')) {
        return parsed.searchParams.get('v');
      }
    } catch (error) {
      console.warn('No se pudo extraer el ID de YouTube para la URL:', url);
    }
    return null;
  };

  const getYouTubeThumbnail = (item) => {
    if (!item) return null;
    if (item.thumbnail_url) return item.thumbnail_url;
    if (item.imagen_url) return item.imagen_url;
    const videoId = extractYouTubeId(item.enlace);
    if (!videoId) return null;
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  };

  const hasValidMedia = (item) => {
    if (!item) return false;
    if (isYouTubeItem(item) && extractYouTubeId(item.enlace)) {
      return true;
    }
    return item.imagen_url && !brokenImages.has(item.id) &&
      !item.imagen_url.includes('default') &&
      item.imagen_url.length > 0;
  };

  // Separar noticias con multimedia y solo texto
  const newsWithMedia = news.filter(hasValidMedia);
  
  const newsWithoutImages = news.filter(item => !hasValidMedia(item));

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    
    try {
      // Asegurar que la fecha se parsea correctamente
      let date;
      
      // Si viene como string ISO, parsearlo directamente
      if (typeof dateString === 'string') {
        // Si no tiene timezone, agregar UTC
        if (dateString && !dateString.includes('T') && !dateString.includes('Z') && !dateString.includes('+')) {
          dateString = dateString + 'T00:00:00Z';
        }
        date = new Date(dateString);
      } else {
        date = new Date(dateString);
      }
      
      // Verificar que la fecha es válida
      if (isNaN(date.getTime())) {
        console.warn('Fecha inválida:', dateString);
        return 'Fecha inválida';
      }
      
      // Usar fecha actual si la fecha parseada es anterior a 2025 (protección contra fechas antiguas)
      const currentYear = new Date().getFullYear();
      if (date.getFullYear() < 2025 && currentYear >= 2025) {
        date = new Date(); // Usar fecha actual si es anterior a 2025
      }
      
      return date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error('Error formateando fecha:', error, dateString);
      return 'Fecha no disponible';
    }
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      'Twitter': '🐦',
      'Facebook': '📘',
      'Instagram': '📸',
      'YouTube': '▶️'
    };
    return icons[platform] || '🌐';
  };

  const getPlatformColor = (platform) => {
    const colors = {
      'Twitter': '#1DA1F2',
      'Facebook': '#4267B2',
      'Instagram': '#E4405F',
      'YouTube': '#FF0000'
    };
    return colors[platform] || '#666';
  };

  return (
    <AppContainer>
      {/* Header */}
      <Header>
        <HeaderContent>
          <HeaderLeft>
            <BackButton onClick={() => navigate('/')}>
              <FiArrowLeft />
              Volver
            </BackButton>
            <span style={{ fontSize: '2rem' }}>🌐</span>
            <div>
              <HeaderTitle>Scraping de Redes Sociales</HeaderTitle>
              <HeaderSubtitle>Noticias en tiempo real de Twitter, Facebook, Instagram y YouTube</HeaderSubtitle>
            </div>
          </HeaderLeft>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button 
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Modo Claro' : 'Modo Oscuro'}
              style={{
                background: 'rgba(102, 126, 234, 0.2)',
                border: '1px solid rgba(102, 126, 234, 0.3)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1.2rem',
                transition: 'all 0.3s ease'
              }}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </HeaderContent>
      </Header>

      <MainLayout>
        {/* Sidebar */}
        <aside className="sidebar">
          <button 
            className="refresh-button"
            onClick={handleRefresh}
            disabled={scraping}
          >
            <span className={`refresh-icon ${scraping ? 'spinning' : ''}`}>🔄</span>
            {scraping ? 'Actualizando...' : 'Actualizar Noticias'}
          </button>

          <button
            className="youtube-refresh-button"
            onClick={handleYoutubeRefresh}
            disabled={scrapingYoutube}
          >
            <span className={`refresh-icon youtube ${scrapingYoutube ? 'spinning' : ''}`}>▶️</span>
            {scrapingYoutube ? 'Obteniendo videos...' : 'Actualizar solo YouTube'}
          </button>

          <div className="filter-section">
            <h3 className="filter-title">Filtros</h3>
            
            <button
              className={`filter-button ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              <span className="filter-icon">🌐</span>
              <span className="filter-label">
                <span className="filter-name">Todas</span>
                <span className="filter-count">{counts.total}</span>
              </span>
            </button>

            <button
              className={`filter-button ${activeFilter === 'twitter' ? 'active' : ''}`}
              onClick={() => handleFilterChange('twitter')}
            >
              <span className="filter-icon">🐦</span>
              <span className="filter-label">
                <span className="filter-name">Twitter</span>
                <span className="filter-count">{counts.twitter}</span>
              </span>
            </button>

            <button
              className={`filter-button ${activeFilter === 'facebook' ? 'active' : ''}`}
              onClick={() => handleFilterChange('facebook')}
            >
              <span className="filter-icon">📘</span>
              <span className="filter-label">
                <span className="filter-name">Facebook</span>
                <span className="filter-count">{counts.facebook}</span>
              </span>
            </button>

            <button
              className={`filter-button ${activeFilter === 'instagram' ? 'active' : ''}`}
              onClick={() => handleFilterChange('instagram')}
            >
              <span className="filter-icon">📸</span>
              <span className="filter-label">
                <span className="filter-name">Instagram</span>
                <span className="filter-count">{counts.instagram}</span>
              </span>
            </button>

            <button
              className={`filter-button ${activeFilter === 'youtube' ? 'active' : ''}`}
              onClick={() => handleFilterChange('youtube')}
            >
              <span className="filter-icon">▶️</span>
              <span className="filter-label">
                <span className="filter-name">YouTube</span>
                <span className="filter-count">{counts.youtube}</span>
              </span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {loading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Cargando noticias...</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {!loading && !error && news.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <h3>No hay noticias disponibles</h3>
              <p>Haz clic en "Actualizar Noticias" para obtener contenido reciente</p>
            </div>
          )}

          {!loading && !error && news.length > 0 && (
            <>
              {/* Sección de noticias CON multimedia */}
              {newsWithMedia.length > 0 && (
                <div className="news-section">
                  <h2 className="section-title">
                    <span className="section-icon">🖼️</span>
                    Noticias con Multimedia ({newsWithMedia.length})
                  </h2>
                  <div className="news-grid">
                    {newsWithMedia.map((item) => {
                      const isYouTube = isYouTubeItem(item);
                      const videoId = isYouTube ? extractYouTubeId(item.enlace) : null;
                      const isPlaying = isYouTube && playingVideos[item.id];
                      const displayImage = isYouTube ? (getYouTubeThumbnail(item) || item.imagen_url) : item.imagen_url;

                      return (
                      <article 
                        key={item.id} 
                        className="news-card"
                        onClick={(event) => handleMediaCardClick(event, item)}
                      >
                        {/* Multimedia */}
                        <div className={`news-image-container ${isYouTube ? 'youtube' : ''}`}>
                          {isYouTube && videoId ? (
                            isPlaying ? (
                              <div className="youtube-embed-wrapper">
                                <iframe
                                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                                  title={item.titulo}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                  allowFullScreen
                                  loading="lazy"
                                  referrerPolicy="strict-origin-when-cross-origin"
                                />
                                <button
                                  className="youtube-close-button"
                                  type="button"
                                  aria-label="Cerrar video"
                                  onClick={(e) => handlePlayButtonClick(e, item.id)}
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <>
                                {displayImage ? (
                                  <img 
                                    src={displayImage} 
                                    alt={item.titulo}
                                    className="news-image"
                                    loading="lazy"
                                    onError={() => handleImageError(item.id)}
                                    onLoad={() => handleImageLoad(item.id)}
                                  />
                                ) : (
                                  <div className="youtube-thumbnail-placeholder">
                                    <span>Video de YouTube</span>
                                  </div>
                                )}
                                <div className="youtube-play-overlay">
                                  <button
                                    className="youtube-play-button"
                                    type="button"
                                    aria-label="Reproducir video"
                                    onClick={(e) => handlePlayButtonClick(e, item.id)}
                                  >
                                    ▶
                                  </button>
                                  <span className="youtube-play-label">Ver video</span>
                                </div>
                              </>
                            )
                          ) : (
                            <img 
                              src={item.imagen_url || ''}
                              alt={item.titulo}
                              className="news-image"
                              loading="lazy"
                              onError={() => handleImageError(item.id)}
                              onLoad={() => handleImageLoad(item.id)}
                            />
                          )}
                          <div className="news-category-badge">
                            {item.categoria || 'General'}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="news-content">
                          {/* Platform Badge */}
                          <div className="news-meta">
                            <span 
                              className="platform-badge"
                              style={{ 
                                backgroundColor: getPlatformColor(item.diario_nombre),
                                color: 'white'
                              }}
                            >
                              {getPlatformIcon(item.diario_nombre)} {item.diario_nombre}
                            </span>
                            <span className="news-date">
                              📅 {formatDate(item.fecha_publicacion)}
                            </span>
                          </div>

                          {/* Title */}
                          <h2 className="news-title">{item.titulo}</h2>

                          {/* Description */}
                          <p className="news-description">
                            {expandedPosts[item.id] 
                              ? item.contenido 
                              : truncateText(item.contenido, 120)
                            }
                          </p>

                          {item.contenido && item.contenido.length > 120 && (
                            <button 
                              className="read-more-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpandPost(item.id);
                              }}
                            >
                              {expandedPosts[item.id] ? 'Ver menos ▲' : 'Ver más ▼'}
                            </button>
                          )}

                          {/* Author */}
                          {item.autor && (
                            <p className="news-author">
                              👤 {item.autor}
                            </p>
                          )}

                          {/* Link Button */}
                          <button 
                            className="news-link-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNewsClick(item.enlace);
                            }}
                          >
                            {isYouTube ? 'Ver en YouTube 🔗' : 'Leer más 🔗'}
                          </button>
                        </div>
                      </article>
                    );
                    })}
                  </div>
                </div>
              )}

              {/* Sección de noticias SIN imagen (solo texto) */}
              {newsWithoutImages.length > 0 && (
                <div className="news-section text-only-section">
                  <h2 className="section-title">
                    <span className="section-icon">📝</span>
                    Noticias de Texto ({newsWithoutImages.length})
                  </h2>
                  <div className="text-news-list">
                    {newsWithoutImages.map((item) => (
                      <article 
                        key={item.id} 
                        className="text-news-card"
                        onClick={() => handleNewsClick(item.enlace)}
                      >
                        {/* Header */}
                        <div className="text-news-header">
                          <span 
                            className="platform-badge-small"
                            style={{ 
                              backgroundColor: getPlatformColor(item.diario_nombre),
                              color: 'white'
                            }}
                          >
                            {getPlatformIcon(item.diario_nombre)} {item.diario_nombre}
                          </span>
                          <span className="news-date-small">
                            📅 {formatDate(item.fecha_publicacion)}
                          </span>
                          {item.categoria && (
                            <span className="category-tag">
                              {item.categoria}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-news-title">{item.titulo}</h3>

                        {/* Description */}
                        <p className="text-news-description">
                          {expandedPosts[item.id] 
                            ? item.contenido 
                            : truncateText(item.contenido, 200)
                          }
                        </p>

                        {item.contenido && item.contenido.length > 200 && (
                          <button 
                            className="read-more-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpandPost(item.id);
                            }}
                          >
                            {expandedPosts[item.id] ? 'Ver menos ▲' : 'Ver más ▼'}
                          </button>
                        )}

                        {/* Footer */}
                        <div className="text-news-footer">
                          {item.autor && (
                            <span className="news-author-small">
                              👤 {item.autor}
                            </span>
                          )}
                          <button 
                            className="text-news-link"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNewsClick(item.enlace);
                            }}
                          >
                            Ver publicación →
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </MainLayout>
    </AppContainer>
  );
}

export default SocialMediaFeed;
