import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { FiArrowLeft, FiCalendar, FiClock, FiExternalLink, FiFileText, FiTag, FiUser, FiHeart, FiTrendingUp, FiAlertTriangle, FiBookOpen, FiGlobe, FiMapPin, FiHash, FiShare2, FiEye, FiChevronDown, FiChevronUp, FiSun, FiMoon, FiLock } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import SubscriptionModal from './Subscriptions/SubscriptionModal';
import LoginModal from './Auth/LoginModal';
import axios from 'axios';

// Animaciones
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// Container principal con tema
const Container = styled.div`
  min-height: 100vh;
  background: var(--bg-primary);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--text-primary);
  transition: background-color 0.15s ease, color 0.15s ease;
`;

// Header estilo La República (rojo)
const Header = styled.header`
  background: #dc3545;
  color: white;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  
  body[data-theme="dark"] & {
    background: #c82333;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Logo = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: white;
  cursor: pointer;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;

const ThemeToggleButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }
`;

// Línea azul debajo del header (estilo La República)
const BlueLine = styled.div`
  height: 3px;
  background: #17a2b8;
  width: 100%;
`;

// Breadcrumb mejorado
const Breadcrumb = styled.nav`
  background: var(--card-bg);
  padding: 1rem 2rem;
  margin-bottom: 0;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.9rem;
  color: var(--text-secondary);
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  
  @media (max-width: 768px) {
    padding: 0.8rem 1rem;
    font-size: 0.85rem;
  }
`;

const BreadcrumbContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const BreadcrumbLink = styled.span`
  color: var(--text-primary);
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    color: #dc3545;
    text-decoration: underline;
  }
`;

// Layout principal estilo La República
const MainLayout = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
  animation: ${fadeInUp} 0.8s ease-out;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr 300px;
    gap: 1.5rem;
  }

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 1rem;
  }
`;

// Contenedor principal del artículo
const ArticleMain = styled.main`
  background: var(--card-bg);
  border-radius: 0;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
  animation: ${slideIn} 0.6s ease-out;
  transition: background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
  
  body[data-theme="dark"] & {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
`;

// Header del artículo mejorado
const ArticleHeader = styled.div`
  padding: 2rem 2.5rem 1.5rem 2.5rem;
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.15s ease, border-color 0.15s ease;
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem 1rem 1rem;
  }
`;

const CategoryBadge = styled.span`
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-block;
  margin-bottom: 1rem;
`;

const ArticleTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
  margin: 0 0 1.5rem 0;
  transition: color 0.15s ease;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const ArticleMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  flex-wrap: wrap;
  transition: color 0.15s ease;
  
  @media (max-width: 768px) {
    gap: 1rem;
    font-size: 0.85rem;
  }
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
`;

const DiarioName = styled.div`
  font-weight: 600;
  font-size: 1rem;
  color: #dc3545;
  margin-bottom: 0.5rem;
`;

// Imagen del artículo
const ArticleImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 450px;
  margin: 0;
  overflow: hidden;
  
  @media (max-width: 768px) {
    height: 300px;
  }
`;

const ArticleImage = styled.div`
  width: 100%;
  height: 100%;
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  background-size: cover;
  background-position: center;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }
`;

// Contenido del artículo
const ArticleContent = styled.div`
  padding: 2rem 2.5rem;
  transition: background-color 0.15s ease;
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
  }
`;

const ContentSection = styled.div`
  margin-bottom: 2rem;
  animation: ${fadeInUp} 0.6s ease-out;
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--border-color);
  transition: color 0.15s ease, border-color 0.15s ease;
`;

const ContentText = styled.div`
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--text-primary);
  text-align: justify;
  transition: color 0.15s ease;
  
  p {
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 768px) {
    font-size: 1rem;
    line-height: 1.7;
  }
`;

const ExpandableContent = styled.div`
  position: relative;
  max-height: ${props => props.expanded ? 'none' : '400px'};
  overflow: hidden;
  transition: max-height 0.5s ease;
`;

const ExpandButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1.5rem auto 0 auto;
  transition: all 0.3s ease;

  &:hover {
    background: #c82333;
    transform: translateY(-2px);
  }
`;

const FadeOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(transparent, var(--card-bg));
  pointer-events: none;
  opacity: ${props => props.show ? 1 : 0};
  transition: opacity 0.3s ease;
`;

// Sidebar estilo La República
const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: ${slideIn} 0.8s ease-out 0.2s both;
`;

const SidebarCard = styled.div`
  background: var(--card-bg);
  border-radius: 0;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease, background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  body[data-theme="dark"] & {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    }
  }
`;

const SidebarTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.8rem;
  border-bottom: 2px solid var(--border-color);
  transition: color 0.15s ease, border-color 0.15s ease;
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 0;
  border-bottom: 1px solid var(--border-color);
  transition: border-color 0.15s ease;
  
  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--bg-tertiary);
    margin: 0 -0.5rem;
    padding: 0.8rem 0.5rem;
    border-radius: 4px;
  }
`;

const InfoLabel = styled.span`
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 600;
  transition: color 0.15s ease;
`;

const InfoValue = styled.span`
  font-size: 0.9rem;
  color: var(--text-primary);
  font-weight: 700;
  text-align: right;
  transition: color 0.15s ease;
`;

// Badges mejorados
const BadgesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-bottom: 1rem;
`;

const Badge = styled.span`
  background: ${props => {
    switch(props.type) {
      case 'alert-critica': return 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)';
      case 'alert-alta': return 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)';
      case 'alert-media': return 'linear-gradient(135deg, #f1c40f 0%, #f39c12 100%)';
      case 'alert-baja': return 'linear-gradient(135deg, #27ae60 0%, #229954 100%)';
      case 'sentiment-positivo': return 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)';
      case 'sentiment-negativo': return 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)';
      case 'sentiment-neutral': return 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)';
      case 'trending': return 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)';
      default: return 'linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%)';
    }
  }};
  color: ${props => props.type?.includes('media') ? '#2c3e50' : 'white'};
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

// Tags modernos
const TagsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
`;

const Tag = styled.span`
  background: var(--bg-tertiary);
  color: var(--text-primary);
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease, background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: #dc3545;
    color: white;
    border-color: #dc3545;
    transform: translateY(-2px);
  }
`;

const KeywordTag = styled.span`
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(231, 76, 60, 0.4);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(231, 76, 60, 0.6);
  }
`;

// Botón de acción mejorado
const ActionButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  background: #dc3545;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  margin-top: 1rem;
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);

  &:hover {
    background: #c82333;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(220, 53, 69, 0.4);
  }
`;

// Resumen destacado
const ResumenCard = styled.div`
  background: var(--bg-tertiary);
  padding: 1.5rem;
  border-radius: 4px;
  border-left: 4px solid #27ae60;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  transition: background-color 0.15s ease, box-shadow 0.15s ease;
  
  body[data-theme="dark"] & {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
`;

const ResumenTitle = styled.h3`
  color: #27ae60;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const ResumenText = styled.p`
  margin: 0;
  font-size: 1rem;
  line-height: 1.7;
  color: var(--text-primary);
  font-weight: 500;
  transition: color 0.15s ease;
`;

// Estados mejorados
const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  font-size: 1.2rem;
  color: var(--text-secondary);
  flex-direction: column;
  gap: 1.5rem;
  transition: color 0.15s ease;
`;

const LoadingSpinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid var(--border-color);
  border-top: 4px solid #dc3545;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorContainer = styled.div`
  background: linear-gradient(135deg, #ff7675 0%, #fd79a8 100%);
  color: white;
  padding: 3rem;
  border-radius: 8px;
  text-align: center;
  margin: 2rem;
  box-shadow: 0 10px 30px rgba(255, 118, 117, 0.4);
`;

// Componentes para noticias relacionadas
const RelatedNewsCard = styled.div`
  display: flex;
  gap: 0.8rem;
  padding: 0.8rem 0;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--bg-tertiary);
    margin: 0 -0.5rem;
    padding: 0.8rem 0.5rem;
    border-radius: 4px;
  }
`;

const RelatedNewsImageContainer = styled.div`
  width: 80px;
  height: 60px;
  border-radius: 4px;
  flex-shrink: 0;
  overflow: hidden;
  background: var(--bg-tertiary);
`;

const RelatedNewsImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const RelatedNewsContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
`;

const RelatedNewsTitle = styled.h4`
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.15s ease;
`;

const RelatedNewsMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
  transition: color 0.15s ease;
`;

const RelatedNewsCategory = styled.span`
  background: #dc3545;
  color: white;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const PremiumBadgeSmall = styled.span`
  background: linear-gradient(135deg, #ffd43b 0%, #f08c00 100%);
  color: #2d1b69;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
`;

function NoticiaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, token, subscription, refreshSubscription } = useAuth();
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contentExpanded, setContentExpanded] = useState(false);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingPremiumNews, setPendingPremiumNews] = useState(null);
  const loginModalShownForPremiumRef = useRef(false);
  const modalOpenRef = useRef(false);
  const hasActiveSubscription = subscription?.estado === 'active';

  useEffect(() => {
    const fetchNoticia = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8000/noticias/${id}`);
        setNoticia(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching noticia:', error);
        if (error.response?.status === 404) {
          setError('Noticia no encontrada');
        } else {
          setError('Error al cargar la noticia');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchNoticia();
    }
  }, [id]);

  // Obtener noticias relacionadas (excluyendo la actual)
  useEffect(() => {
    const fetchRelatedNews = async () => {
      if (!noticia) return;
      
      try {
        setLoadingRelated(true);
        // Obtener más noticias para tener opciones (30 para asegurar que haya suficientes con imágenes)
        const response = await axios.get(`http://localhost:8000/noticias?limit=30`);
        
        // Filtrar la noticia actual
        let filtered = response.data.filter(n => n.id !== noticia.id);
        
        // Separar noticias con imagen y sin imagen
        const withImages = filtered.filter(n => n.imagen_url && n.imagen_url.trim() !== '');
        const withoutImages = filtered.filter(n => !n.imagen_url || n.imagen_url.trim() === '');
        
        // Priorizar noticias con imágenes: tomar hasta 4 con imagen y 1 sin imagen (o todas con imagen si hay suficientes)
        let selectedNews = [];
        
        if (withImages.length >= 5) {
          // Si hay suficientes con imagen, tomar solo esas
          selectedNews = withImages.slice(0, 5);
        } else if (withImages.length > 0) {
          // Si hay algunas con imagen, tomar todas las que tengan imagen y completar con sin imagen
          selectedNews = [...withImages, ...withoutImages.slice(0, 5 - withImages.length)];
        } else {
          // Si no hay ninguna con imagen, tomar las primeras 5 sin imagen
          selectedNews = withoutImages.slice(0, 5);
        }
        
        setRelatedNews(selectedNews);
      } catch (error) {
        console.error('Error fetching related news:', error);
      } finally {
        setLoadingRelated(false);
      }
    };

    if (noticia) {
      fetchRelatedNews();
    }
  }, [noticia]);

  // Manejar cuando el usuario se loguea después de hacer click en noticia premium
  useEffect(() => {
    if (isAuthenticated() && token && pendingPremiumNews && !showSubscriptionModal) {
      if (loginModalShownForPremiumRef.current) {
        const timer = setTimeout(() => {
          setShowLoginModal(false);
          loginModalShownForPremiumRef.current = false;
          modalOpenRef.current = true;
          setShowSubscriptionModal(true);
        }, 1000);
        return () => clearTimeout(timer);
      } else if (!showLoginModal) {
        const timer = setTimeout(() => {
          modalOpenRef.current = true;
          setShowSubscriptionModal(true);
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, token, pendingPremiumNews, showLoginModal, showSubscriptionModal]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleContent = () => {
    setContentExpanded(!contentExpanded);
  };

  const isContentLong = noticia?.contenido && noticia.contenido.length > 1000;

  // Manejar click en noticias relacionadas
  const handleRelatedNewsClick = async (relatedNoticia) => {
    // Si es una noticia premium, manejar el flujo de suscripción
    if (relatedNoticia?.es_premium) {
      console.log('Click en noticia premium relacionada:', relatedNoticia.titulo);
      
      // Si no está autenticado, mostrar modal de login primero
      if (!isAuthenticated()) {
        console.log('Usuario no autenticado, mostrando modal de login');
        setPendingPremiumNews(relatedNoticia);
        loginModalShownForPremiumRef.current = true;
        setShowLoginModal(true);
        return;
      }
      
      // Si está autenticado, verificar suscripción activa
      if (token) {
        try {
          console.log('Verificando suscripción activa...');
          const statusResponse = await axios.get('http://localhost:8000/subscriptions/status', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          const hasActive = statusResponse.data?.has_active && statusResponse.data?.active_subscription;
          
          if (hasActive) {
            // Tiene suscripción activa, navegar a la noticia
            console.log('Usuario tiene suscripción activa, navegando a noticia');
            await refreshSubscription(token);
            navigate(`/noticia/${relatedNoticia.id}`);
            return;
          } else {
            console.log('Usuario no tiene suscripción activa, mostrando planes');
          }
        } catch (err) {
          console.error('Error verificando suscripción:', err);
        }
      }
      
      // No tiene suscripción activa, mostrar planes de suscripción
      console.log('Mostrando modal de suscripción');
      setPendingPremiumNews(relatedNoticia);
      modalOpenRef.current = true;
      setShowSubscriptionModal(true);
      return;
    }
    
    // Si no es premium, navegar directamente
    navigate(`/noticia/${relatedNoticia.id}`);
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <HeaderContent>
            <HeaderLeft>
              <BackButton onClick={handleBack}>
                <FiArrowLeft />
                Volver
              </BackButton>
              <Logo onClick={handleBackToHome}>📰 Noticias</Logo>
            </HeaderLeft>
            <HeaderRight>
              <ThemeToggleButton onClick={toggleTheme}>
                {theme === 'dark' ? <FiSun /> : <FiMoon />}
                {theme === 'dark' ? 'Día' : 'Noche'}
              </ThemeToggleButton>
            </HeaderRight>
          </HeaderContent>
        </Header>
        <BlueLine />
        <LoadingContainer>
          <LoadingSpinner />
          <span style={{ fontSize: '1.2rem', fontWeight: '600' }}>Cargando detalles de la noticia...</span>
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <HeaderContent>
            <HeaderLeft>
              <BackButton onClick={handleBack}>
                <FiArrowLeft />
                Volver
              </BackButton>
              <Logo onClick={handleBackToHome}>📰 Noticias</Logo>
            </HeaderLeft>
            <HeaderRight>
              <ThemeToggleButton onClick={toggleTheme}>
                {theme === 'dark' ? <FiSun /> : <FiMoon />}
                {theme === 'dark' ? 'Día' : 'Noche'}
              </ThemeToggleButton>
            </HeaderRight>
          </HeaderContent>
        </Header>
        <BlueLine />
        <ErrorContainer>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '2rem' }}>¡Oops! Algo salió mal</h2>
          <p style={{ fontSize: '1.1rem', margin: '0 0 2rem 0' }}>{error}</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={handleBack} style={{ 
              background: 'rgba(255, 255, 255, 0.2)', color: 'white', border: 'none', 
              padding: '1rem 2rem', borderRadius: '4px', cursor: 'pointer', fontWeight: '600'
            }}>
              <FiArrowLeft style={{ marginRight: '0.5rem' }} />
              Volver
            </button>
            <button onClick={handleBackToHome} style={{ 
              background: 'rgba(255, 255, 255, 0.9)', color: '#e74c3c', border: 'none', 
              padding: '1rem 2rem', borderRadius: '4px', cursor: 'pointer', fontWeight: '600'
            }}>
              <FiFileText style={{ marginRight: '0.5rem' }} />
              Ir al Inicio
            </button>
          </div>
        </ErrorContainer>
      </Container>
    );
  }

  if (!noticia) {
    return null;
  }

  return (
    <Container>
      <Header>
        <HeaderContent>
          <HeaderLeft>
            <BackButton onClick={handleBack}>
              <FiArrowLeft />
              Volver
            </BackButton>
            <Logo onClick={handleBackToHome}>📰 Noticias</Logo>
          </HeaderLeft>
          <HeaderRight>
            <ThemeToggleButton onClick={toggleTheme}>
              {theme === 'dark' ? <FiSun /> : <FiMoon />}
              {theme === 'dark' ? 'Día' : 'Noche'}
            </ThemeToggleButton>
          </HeaderRight>
        </HeaderContent>
      </Header>
      <BlueLine />

      <Breadcrumb>
        <BreadcrumbContent>
          <BreadcrumbLink onClick={handleBackToHome}>🏠 Inicio</BreadcrumbLink>
          {' / '}
          <BreadcrumbLink onClick={handleBack}>📰 Noticias</BreadcrumbLink>
          {' / '}
          <span>📄 Detalle</span>
        </BreadcrumbContent>
      </Breadcrumb>

      <MainLayout>
        <ArticleMain>
          <ArticleHeader>
            <CategoryBadge>
              {noticia.categoria}
            </CategoryBadge>
            <ArticleTitle>{noticia.titulo}</ArticleTitle>
            <DiarioName>📰 {noticia.diario_nombre}</DiarioName>
            <ArticleMeta>
              <MetaItem>
                <FiCalendar />
                {formatDate(noticia.fecha_publicacion)}
              </MetaItem>
              {formatTime(noticia.fecha_publicacion) && (
                <MetaItem>
                  <FiClock />
                  {formatTime(noticia.fecha_publicacion)}
                </MetaItem>
              )}
              {noticia.tiempo_lectura_min && (
                <MetaItem>
                  <FiBookOpen />
                  {noticia.tiempo_lectura_min} min
                </MetaItem>
              )}
            </ArticleMeta>

            {/* Badges de estado */}
            <BadgesContainer>
              {noticia.es_alerta && (
                <Badge type={`alert-${noticia.nivel_urgencia}`}>
                  <FiAlertTriangle />
                  Alerta {noticia.nivel_urgencia}
                </Badge>
              )}
              
              {noticia.sentimiento && (
                <Badge type={`sentiment-${noticia.sentimiento}`}>
                  <FiHeart />
                  {noticia.sentimiento === 'positivo' ? '😊' : 
                   noticia.sentimiento === 'negativo' ? '😞' : '😐'} 
                  {noticia.sentimiento}
                </Badge>
              )}
              
              {noticia.es_trending && (
                <Badge type="trending">
                  <FiTrendingUp />
                  Trending
                </Badge>
              )}
            </BadgesContainer>
          </ArticleHeader>

          {noticia.imagen_url && (
            <ArticleImageContainer>
              <ArticleImage imageUrl={noticia.imagen_url} />
            </ArticleImageContainer>
          )}

          <ArticleContent>
            {noticia.resumen_auto && (
              <ResumenCard>
                <ResumenTitle>
                  <FiBookOpen />
                  Resumen Ejecutivo
                </ResumenTitle>
                <ResumenText>
                  {noticia.resumen_auto}
                </ResumenText>
              </ResumenCard>
            )}

            {noticia.contenido && (
              <ContentSection>
                <SectionTitle>
                  <FiFileText />
                  Contenido Completo
                </SectionTitle>
                <ExpandableContent expanded={contentExpanded}>
                  <ContentText>
                    {noticia.contenido.split('\n').map((paragraph, index) => (
                      paragraph.trim() && <p key={index}>{paragraph}</p>
                    ))}
                  </ContentText>
                  <FadeOverlay show={isContentLong && !contentExpanded} />
                </ExpandableContent>
                
                {isContentLong && (
                  <ExpandButton onClick={toggleContent}>
                    {contentExpanded ? (
                      <>
                        <FiChevronUp />
                        Mostrar Menos
                      </>
                    ) : (
                      <>
                        <FiChevronDown />
                        Leer Más
                      </>
                    )}
                  </ExpandButton>
                )}
              </ContentSection>
            )}
          </ArticleContent>
        </ArticleMain>

        <Sidebar>
          {/* Información del artículo */}
          <SidebarCard>
            <SidebarTitle>
              <FiFileText />
              Información
            </SidebarTitle>
            <InfoItem>
              <InfoLabel>📰 Diario</InfoLabel>
              <InfoValue>{noticia.diario_nombre}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>🏷️ Categoría</InfoLabel>
              <InfoValue>{noticia.categoria}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>📅 Fecha</InfoLabel>
              <InfoValue>{formatDate(noticia.fecha_publicacion)}</InfoValue>
            </InfoItem>
            {noticia.autor && (
              <InfoItem>
                <InfoLabel>👤 Autor</InfoLabel>
                <InfoValue>{noticia.autor}</InfoValue>
              </InfoItem>
            )}
            {noticia.region && (
              <InfoItem>
                <InfoLabel>🌍 Región</InfoLabel>
                <InfoValue>{noticia.region}</InfoValue>
              </InfoItem>
            )}
          </SidebarCard>

          {/* Palabras clave */}
          {(noticia.palabras_clave && noticia.palabras_clave.length > 0) && (
            <SidebarCard>
              <SidebarTitle>
                <FiHash />
                Palabras Clave
              </SidebarTitle>
              <TagsList>
                {noticia.palabras_clave.map((keyword, index) => (
                  <KeywordTag key={index}>#{keyword}</KeywordTag>
                ))}
              </TagsList>
            </SidebarCard>
          )}

          {/* Tags */}
          {(noticia.tags && noticia.tags.length > 0) && (
            <SidebarCard>
              <SidebarTitle>
                <FiTag />
                Etiquetas
              </SidebarTitle>
              <TagsList>
                {noticia.tags.map((tag, index) => (
                  <Tag key={index}>{tag}</Tag>
                ))}
              </TagsList>
            </SidebarCard>
          )}

          {/* Botón de acción */}
          {noticia.enlace && (
            <SidebarCard>
              <ActionButton 
                href={noticia.enlace} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <FiExternalLink />
                Ver Noticia Original
              </ActionButton>
            </SidebarCard>
          )}

          {/* Noticias Relacionadas */}
          <SidebarCard>
            <SidebarTitle>
              <FiTrendingUp />
              Noticias Relacionadas
            </SidebarTitle>
            {loadingRelated ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)' }}>
                Cargando...
              </div>
            ) : relatedNews.length > 0 ? (
              <div>
                {relatedNews.map((relatedNoticia) => (
                  <RelatedNewsCard 
                    key={relatedNoticia.id}
                    onClick={() => handleRelatedNewsClick(relatedNoticia)}
                  >
                    {relatedNoticia.imagen_url && (
                      <RelatedNewsImageContainer>
                        <RelatedNewsImage 
                          src={relatedNoticia.imagen_url} 
                          alt={relatedNoticia.titulo}
                          onError={(e) => {
                            // Si la imagen falla al cargar, ocultarla
                            e.target.style.display = 'none';
                            e.target.parentElement.style.display = 'none';
                          }}
                        />
                      </RelatedNewsImageContainer>
                    )}
                    <RelatedNewsContent>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                        {relatedNoticia.es_premium && (
                          <PremiumBadgeSmall>
                            <FiLock style={{ fontSize: '0.7rem' }} />
                            Premium
                          </PremiumBadgeSmall>
                        )}
                        <RelatedNewsCategory>
                          {relatedNoticia.categoria}
                        </RelatedNewsCategory>
                      </div>
                      <RelatedNewsTitle>{relatedNoticia.titulo}</RelatedNewsTitle>
                      <RelatedNewsMeta>
                        <span>{formatDate(relatedNoticia.fecha_publicacion)}</span>
                      </RelatedNewsMeta>
                    </RelatedNewsContent>
                  </RelatedNewsCard>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)' }}>
                No hay noticias relacionadas disponibles
              </div>
            )}
          </SidebarCard>
        </Sidebar>
      </MainLayout>

      {/* Modal de Login */}
      {showLoginModal && (
        <LoginModal
          onClose={() => {
            setShowLoginModal(false);
            loginModalShownForPremiumRef.current = false;
          }}
          onSwitchToRegister={() => {
            setShowLoginModal(false);
            navigate('/');
          }}
          skipRedirect={true}
          onLoginSuccess={() => {
            console.log('Login exitoso desde noticia premium relacionada');
          }}
        />
      )}

      {/* Modal de Suscripción */}
      {showSubscriptionModal && (
        <SubscriptionModal
          isOpen={showSubscriptionModal}
          pendingNews={pendingPremiumNews}
          onClose={() => {
            modalOpenRef.current = false;
            setShowSubscriptionModal(false);
            setPendingPremiumNews(null);
          }}
          onSubscriptionSuccess={() => {
            modalOpenRef.current = false;
            setShowSubscriptionModal(false);
            if (token) {
              refreshSubscription(token);
            }
            // Si hay una noticia pendiente y ahora tiene suscripción, navegar a ella
            if (pendingPremiumNews) {
              navigate(`/noticia/${pendingPremiumNews.id}`);
            }
          }}
        />
      )}
    </Container>
  );
}

export default NoticiaDetalle;
