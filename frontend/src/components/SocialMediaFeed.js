import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SocialMediaFeed.css';

function SocialMediaFeed() {
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
    try {
      const scrapResponse = await axios.post('http://localhost:8000/scraping/social-media/ejecutar');
      console.log('Scraping result:', scrapResponse.data);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await fetchSocialNews();
      await fetchAllNewsForCounts();
    } catch (err) {
      console.error('Error scraping:', err);
      setError('Error al actualizar las noticias');
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
    <div className={`social-media-container ${darkMode ? 'dark' : 'light'}`}>
      {/* Header */}
      <header className="social-header">
        <div className="header-content">
          <div className="header-left">
            <span className="header-icon">🌐</span>
            <div>
              <h1 className="header-title">Scraping de Redes Sociales</h1>
              <p className="header-subtitle">Noticias en tiempo real de Twitter, Facebook, Instagram y YouTube</p>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Modo Claro' : 'Modo Oscuro'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      <div className="main-layout">
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
      </div>
    </div>
  );
}

export default SocialMediaFeed;
