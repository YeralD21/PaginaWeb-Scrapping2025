import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiCalendar, FiClock, FiUser, FiEye, FiTrendingUp, FiStar, FiPlay, FiShare2, FiBookmark, FiHeart, FiMessageCircle } from 'react-icons/fi';
import NoticiaDetalleComercio from './NoticiaDetalleComercio';

// Animaciones
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Styled Components - Replicando el diseño de El Comercio
const ComercioContainer = styled.div`
  width: 100%;
  margin: 0;
  padding: 0;
  background: #ffffff;
  min-height: 100vh;
`;

const ComercioHeader = styled.header`
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const BreakingNewsBar = styled.div`
  background: #000000;
  color: white;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.9rem;
  font-weight: 600;
`;

const BreakingNewsItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &.live {
    color: #ff4444;
  }
`;

const LiveIndicator = styled.div`
  width: 8px;
  height: 8px;
  background: #ff4444;
  border-radius: 50%;
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const LogoText = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  font-family: 'Georgia', serif;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
`;

const Subtitle = styled.p`
  font-size: 0.9rem;
  color: #333;
  margin: 0;
  font-style: italic;
`;

const Navigation = styled.nav`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

const NavItem = styled.a`
  color: #1a1a1a;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }
`;

const NavBar = styled.nav`
  background: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  padding: 0.8rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 500;
`;

const NavBarContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const NavLink = styled.a`
  color: #333;
  text-decoration: none;
  padding: 0.5rem 0;
  transition: color 0.3s ease;
  
  &:hover {
    color: #2c5530;
  }
  
  &.active {
    color: #2c5530;
  font-weight: 600;
  }
`;

const NavSeparator = styled.span`
  color: #ccc;
  font-size: 0.8rem;
`;

const TopBar = styled.div`
  background: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  padding: 0.5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TopBarContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const TopBarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const TopBarCenter = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.8rem;
  color: #666;
`;

const TopBarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.8rem;
`;

const TopBarLink = styled.a`
  color: #666;
  text-decoration: none;
  transition: color 0.3s ease;
  
  &:hover {
    color: #2c5530;
  }
`;

const LoginButton = styled.button`
  background: none;
  border: none;
  color: #666;
  font-size: 0.8rem;
  cursor: pointer;
  transition: color 0.3s ease;
  
  &:hover {
    color: #2c5530;
  }
`;

const DiscountButton = styled.button`
  background: #2c5530;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #1e3a21;
    transform: translateY(-1px);
  }
`;

// Sección de Suscriptores
const SuscriptoresSection = styled.section`
  background: #1a1a1a;
  color: white;
  padding: 3rem 0;
  margin: 2rem 0;
`;

const SuscriptoresContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const SuscriptoresHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const SuscriptoresTitle = styled.h2`
  color: #FFD700;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  font-family: 'Georgia', serif;
`;

const ClubButton = styled.button`
    background: #FFD700;
  color: #1a1a1a;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #FFA500;
    transform: translateY(-2px);
  }
`;

const SuscriptoresGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
`;

const MainArticle = styled.article`
  display: flex;
  gap: 2rem;
`;

const MainArticleContent = styled.div`
  flex: 1;
`;

const AudioLabels = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

const AudioLabel = styled.span`
  background: rgba(255, 215, 0, 0.2);
  color: #FFD700;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-weight: 600;
`;

const MainHeadline = styled.h3`
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1.3;
  margin: 0 0 1rem 0;
  color: white;
`;

const MainAuthor = styled.p`
  color: #ccc;
  font-size: 0.9rem;
  margin: 0;
`;

const MainImage = styled.div`
  flex: 1;
  
  img {
    width: 100%;
    height: 300px;
    object-fit: cover;
    border-radius: 8px;
  }
`;

const SecondaryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
`;

const SecondaryArticle = styled.article`
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }
`;

const ArticleCategory = styled.div`
  color: #FFD700;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
`;

const ArticleTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.3;
  margin: 0 0 0.5rem 0;
  color: white;
`;

const ArticleAuthor = styled.p`
  color: #ccc;
  font-size: 0.8rem;
  margin: 0 0 1rem 0;
`;

const ArticleImage = styled.div`
  img {
    width: 100%;
    height: 120px;
    object-fit: cover;
    border-radius: 4px;
  }
`;

const SubscriberTag = styled.div`
  background: #FFD700;
  color: #1a1a1a;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  display: inline-block;
  margin-bottom: 1rem;
`;

const FiltersSection = styled.div`
  background: white;
  padding: 1.5rem 0;
  border-bottom: 2px solid #f0f0f0;
`;

const FiltersContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const FilterTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #2c5530;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const DateFilters = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const DateButton = styled.button`
  background: ${props => props.active ? '#2c5530' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border: 2px solid ${props => props.active ? '#2c5530' : '#e0e0e0'};
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${props => props.active ? '#1e3a21' : '#f8f8f8'};
    border-color: #2c5530;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
`;

// Sección de noticias destacadas (como en El Comercio)
const HeroSection = styled.section`
  background: #f8f9fa;
  padding: 2rem 0;
  margin-bottom: 2rem;
`;

const HeroContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const BreakingNewsSection = styled.div`
  background: #dc3545;
  color: white;
  padding: 0.8rem 0;
  font-weight: 600;
  text-align: center;
  font-size: 1.1rem;
  
  &::before {
    content: "🔴 ";
    margin-right: 0.5rem;
  }
`;

// Cards estilo El Comercio
const NewsCard = styled.article`
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const CardImage = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
`;

const PlayButton = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${CardImage}:hover & {
    opacity: 1;
  }
`;

const CardContent = styled.div`
  padding: 1.5rem;
`;

const CategoryTag = styled.span`
  background: ${props => {
    switch(props.category) {
      case 'Política': return '#007bff';
      case 'Economía': return '#28a745';
      case 'Deportes': return '#dc3545';
      case 'Mundo': return '#6f42c1';
      default: return '#FFD700';
    }
  }};
  color: ${props => props.category === 'default' ? '#1a1a1a' : 'white'};
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 1rem;
  display: inline-block;
  font-family: 'Arial', sans-serif;
`;

const CardTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 1rem 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-family: 'Georgia', serif;
`;

const CardMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #6c757d;
  font-size: 0.85rem;
  margin-bottom: 1rem;
`;

const MetaInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const CardActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: color 0.3s ease;
  
  &:hover {
    color: #007bff;
  }
  
  &.liked {
    color: #dc3545;
  }
`;

const MainNews = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const FeaturedNews = styled.article`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
`;

const NewsImage = styled.div`
  width: 100%;
  height: 300px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const NewsContent = styled.div`
  padding: 1.5rem;
`;

const NewsCategory = styled.span`
  background: #FF6B6B;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const NewsTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 1rem 0;
  line-height: 1.3;
  font-family: 'Georgia', serif;
`;

const NewsExcerpt = styled.p`
  color: #666;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const NewsMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #888;
  font-size: 0.9rem;
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SidebarSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h3`
  color: #2c5530;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f0f0f0;
`;

const NewsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const NewsItem = styled.article`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  transition: background 0.3s ease;
  cursor: pointer;

  &:hover {
    background: #f8f9fa;
  }
`;

const NewsItemImage = styled.div`
  width: 80px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 6px;
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 6px;
  }
`;

const NewsItemContent = styled.div`
  flex: 1;
`;

const NewsItemTitle = styled.h4`
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
`;

const NewsItemMeta = styled.div`
  font-size: 0.8rem;
  color: #888;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: #666;
  
  svg {
    animation: ${spin} 1s linear infinite;
  }
`;

// Grid de noticias estilo El Comercio
const NewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
`;

// Sección de más leídas como El Comercio (diseño limpio)
const TrendingSection = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 2rem 0;
`;

const TrendingTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f0f0f0;
  font-family: 'Georgia', serif;
`;

const TrendingList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TrendingItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.8rem 0;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f8f9fa;
    margin: 0 -1rem;
    padding: 0.8rem 1rem;
    border-radius: 6px;
  }
`;

const TrendingNumber = styled.div`
  width: 24px;
  height: 24px;
  background: #dc3545;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8rem;
  flex-shrink: 0;
  margin-top: 0.2rem;
`;

const TrendingContent = styled.div`
  flex: 1;
`;

const TrendingItemTitle = styled.h4`
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-family: 'Georgia', serif;
`;

const TrendingMeta = styled.div`
  font-size: 0.8rem;
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

// Widget de clima y datos adicionales
const WeatherWidget = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
`;

const WeatherTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1rem;
`;

// Sección de videos
const VideoSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
`;

const VideoTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const VideoItem = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #e9ecef;
  cursor: pointer;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: #f8f9fa;
    margin: 0 -1rem;
    padding: 1rem;
    border-radius: 8px;
  }
`;

const VideoThumbnail = styled.div`
  position: relative;
  width: 120px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 0;
    height: 0;
    border-left: 12px solid white;
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
    opacity: 0.9;
  }
`;

const VideoContent = styled.div`
  flex: 1;
`;

const VideoItemTitle = styled.h4`
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

// Sección de deportes como en la primera imagen
const DeporteTotalSection = styled.section`
  background: white;
  padding: 2rem 0;
  margin: 2rem 0;
`;

const DeporteTotalHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 3px solid #FFD700;
  padding-bottom: 1rem;
`;

const DeporteTotalTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  color: #FFD700;
  margin: 0;
  font-family: 'Georgia', serif;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
`;

const DeporteTotalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
`;

const DeporteCard = styled.article`
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const DeporteCardImage = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
`;

const DeporteCardContent = styled.div`
  padding: 1.5rem;
`;

const DeporteCategory = styled.span`
  background: #FFD700;
  color: #1a1a1a;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 1rem;
  display: inline-block;
  font-family: 'Arial', sans-serif;
`;

const DeporteTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 1rem 0;
  line-height: 1.4;
  font-family: 'Georgia', serif;
`;

const DiarioComercio = () => {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [fechasDisponibles, setFechasDisponibles] = useState([]);
  const [noticiaDestacada, setNoticiaDestacada] = useState(null);
  const [noticiaEnVivo, setNoticiaEnVivo] = useState(null);
  const [mostrarSuscripcion, setMostrarSuscripcion] = useState(false);
  const [mostrarSeccionSuscripcion, setMostrarSeccionSuscripcion] = useState(false);
  const [noticiaSeleccionada, setNoticiaSeleccionada] = useState(null);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);

  // Cargar noticias de El Comercio
  useEffect(() => {
    loadNoticiasComercio();
  }, []);

  // Función para seleccionar noticia destacada
  const seleccionarNoticiaDestacada = (noticias) => {
    if (!noticias || noticias.length === 0) return null;
    
    // Priorizar noticias con palabras clave importantes
    const palabrasClave = ['copa', 'mundial', 'perú', 'deportes', 'política', 'economía', 'crisis'];
    
    const noticiaDestacada = noticias.find(noticia => 
      palabrasClave.some(palabra => 
        noticia.titulo.toLowerCase().includes(palabra)
      )
    ) || noticias[0]; // Si no encuentra ninguna con palabras clave, toma la primera
    
    return noticiaDestacada;
  };

  // Función para seleccionar noticia en vivo
  const seleccionarNoticiaEnVivo = (noticias) => {
    if (!noticias || noticias.length === 0) return null;
    
    // Priorizar noticias recientes o con palabras clave de "en vivo"
    const palabrasClave = ['en vivo', 'ahora', 'último momento', 'breaking', 'urgente'];
    
    const noticiaEnVivo = noticias.find(noticia => 
      palabrasClave.some(palabra => 
        noticia.titulo.toLowerCase().includes(palabra)
      )
    ) || noticias[1] || noticias[0]; // Si no encuentra ninguna, toma la segunda o primera
    
    return noticiaEnVivo;
  };

  // Función para manejar clic en noticia
  const handleNoticiaClick = (noticia) => {
    setNoticiaSeleccionada(noticia.id);
    setMostrarDetalle(true);
  };

  // Función para volver a la lista de noticias
  const handleVolverALista = () => {
    setMostrarDetalle(false);
    setNoticiaSeleccionada(null);
  };

  const loadNoticiasComercio = async () => {
    try {
      setLoading(true);
      console.log('Cargando noticias de El Comercio...');
      
      // Intentar diferentes endpoints
      let response;
      try {
        response = await fetch('http://localhost:8000/noticias?diario=El Comercio&limit=50');
      } catch (e) {
        console.log('Intentando endpoint alternativo...');
        response = await fetch('http://localhost:8000/noticias?limit=50');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Datos recibidos:', data);
      
      // Verificar diferentes estructuras de respuesta
      let noticiasData = data.noticias || data || [];
      
      if (Array.isArray(noticiasData)) {
        // Filtrar solo noticias de El Comercio
        const noticiasComercio = noticiasData.filter(noticia => {
          // Verificar el campo diario_nombre que viene del endpoint
          if (noticia.diario_nombre === 'El Comercio') {
            return true;
          }
          // También verificar si el diario está en la relación
          if (noticia.diario && noticia.diario.nombre === 'El Comercio') {
            return true;
          }
          return false;
        });
        
        console.log('Noticias de El Comercio encontradas:', noticiasComercio.length);
        setNoticias(noticiasComercio);
        
        // Seleccionar noticias destacadas
        setNoticiaDestacada(seleccionarNoticiaDestacada(noticiasComercio));
        setNoticiaEnVivo(seleccionarNoticiaEnVivo(noticiasComercio));
        
        // Generar fechas disponibles
        const fechas = noticiasComercio.reduce((acc, noticia) => {
          if (noticia.fecha_publicacion) {
            const fecha = new Date(noticia.fecha_publicacion).toISOString().split('T')[0];
            const fechaFormateada = new Date(noticia.fecha_publicacion).toLocaleDateString('es-PE');
            
            if (!acc.find(f => f.fecha === fecha)) {
              acc.push({
                fecha,
                fecha_formateada: fechaFormateada,
                total_noticias: noticiasComercio.filter(n => 
                  new Date(n.fecha_publicacion).toISOString().split('T')[0] === fecha
                ).length
              });
            }
          }
          return acc;
        }, []);
        
        setFechasDisponibles(fechas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)));
        
        if (fechas.length > 0) {
          setFechaSeleccionada(fechas[0].fecha);
        } else {
          // Si no hay fechas, mostrar todas las noticias
          setFechaSeleccionada(null);
        }
      } else {
        console.error('Formato de datos inesperado:', data);
        setNoticias([]);
      }
    } catch (error) {
      console.error('Error cargando noticias de El Comercio:', error);
      setNoticias([]);
    } finally {
      setLoading(false);
    }
  };

  const noticiasFiltradas = fechaSeleccionada 
    ? noticias.filter(noticia => 
        new Date(noticia.fecha_publicacion).toISOString().split('T')[0] === fechaSeleccionada
      )
    : noticias;

  const noticiaPrincipal = noticiasFiltradas[0];
  const noticiasSecundarias = noticiasFiltradas.slice(1, 6);
  const noticiasTendencias = noticiasFiltradas.slice(6, 12);

  if (loading) {
  return (
      <ComercioContainer>
        <LoadingSpinner>
          <FiTrendingUp style={{ animation: 'spin 1s linear infinite', marginRight: '0.5rem' }} />
          Cargando noticias de El Comercio...
        </LoadingSpinner>
      </ComercioContainer>
    );
  }

  if (noticias.length === 0) {
    return (
      <ComercioContainer>
        <ComercioHeader>
        <HeaderContent>
            <Logo>
              <LogoText>EL COMERCIO</LogoText>
              <Subtitle>El decano de la prensa peruana</Subtitle>
            </Logo>
            <Navigation>
              <NavItem href="#politica">Política</NavItem>
              <NavItem href="#economia">Economía</NavItem>
              <NavItem href="#deportes">Deportes</NavItem>
              <NavItem href="#mundo">Mundo</NavItem>
            </Navigation>
        </HeaderContent>
        </ComercioHeader>

      <MainContent>
          <div style={{ 
            gridColumn: '1 / -1', 
            textAlign: 'center', 
            padding: '4rem 2rem',
            color: '#666'
          }}>
            <FiFileText style={{ fontSize: '3rem', marginBottom: '1rem', color: '#ccc' }} />
            <h2>No hay noticias disponibles</h2>
            <p>No se encontraron noticias de El Comercio en la base de datos.</p>
            <p>Verifica que el backend esté funcionando y que haya noticias del scraping.</p>
            <button 
              onClick={loadNoticiasComercio}
              style={{
                background: '#2c5530',
                color: 'white',
                border: 'none',
                padding: '0.8rem 1.5rem',
                borderRadius: '25px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '1rem'
              }}
            >
              <FiRefreshCw style={{ marginRight: '0.5rem' }} />
              Reintentar
            </button>
          </div>
        </MainContent>
      </ComercioContainer>
    );
  }

  // Si se debe mostrar el detalle de la noticia
  if (mostrarDetalle && noticiaSeleccionada) {
    return (
      <NoticiaDetalleComercio 
        noticiaId={noticiaSeleccionada}
        onBack={handleVolverALista}
        onNoticiaClick={handleNoticiaClick}
      />
    );
  }

  // Si se debe mostrar la sección de suscripción
  if (mostrarSeccionSuscripcion) {
    return (
      <ComercioContainer>
        {/* Header de la página de suscripción */}
        <div style={{
          background: 'white',
          padding: '1rem 2rem',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={() => setMostrarSeccionSuscripcion(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.2rem',
                cursor: 'pointer'
              }}
            >←</button>
            <img 
              src="/images/logos/comercio.png" 
              alt="El Comercio"
              style={{ height: '30px' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>👤</span>
            <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>INICIA SESIÓN</span>
          </div>
        </div>

        {/* Banner amarillo del centenario */}
        <div style={{
          background: '#FFCB05',
          padding: '1rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: '#1a1a1a'
          }}>
            Estás a un clic del Libro Oficial del Centenario
          </span>
          <div style={{
            background: 'black',
            color: '#FFD700',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            border: '2px solid #FFD700',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ fontSize: '1.2rem', fontWeight: '700' }}>100</span>
            <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>AÑOS DEL DIARIO MÁS GRANDE</span>
          </div>
        </div>

        {/* Contenido principal - Diseño como la página oficial */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          minHeight: '100vh',
          padding: '3rem 2rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Efectos de luz de fondo */}
          <div style={{
            position: 'absolute',
            top: '20%',
            right: '10%',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(255, 203, 5, 0.3) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(40px)'
          }}></div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '3rem',
            alignItems: 'center',
            maxWidth: '1200px',
            margin: '0 auto',
            position: 'relative',
            zIndex: 2
          }}>
            {/* Lado izquierdo - Texto promocional */}
            <div>
              <h1 style={{
                fontSize: '2.8rem',
                fontWeight: '700',
                color: 'white',
                marginBottom: '2rem',
                lineHeight: '1.2',
                fontFamily: 'Georgia, serif'
              }}>
                Tu suscripción digital potenciada con <span style={{ color: '#FFCB05' }}>IA Generativa</span>
              </h1>

              {/* Plan Digital */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  background: 'black',
                  color: 'white',
                  padding: '1rem 1.5rem',
                  borderRadius: '8px 0 0 8px',
                  fontSize: '1.1rem',
                  fontWeight: '600'
                }}>
                  Plan Digital
                </div>
                <div style={{
                  background: '#FFCB05',
                  color: 'black',
                  padding: '1rem 1.5rem',
                  borderRadius: '0 8px 8px 0',
                  fontSize: '1.1rem',
                  fontWeight: '700'
                }}>
                  A tan sólo S/ 15 al mes
                </div>
              </div>

              <p style={{
                fontSize: '1.2rem',
                color: 'white',
                marginBottom: '2rem',
                lineHeight: '1.5'
              }}>
                Reproduce y resume con IA Generativa la noticia completa
              </p>

              <button style={{
                background: '#FFCB05',
                color: 'black',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: '700',
                cursor: 'pointer',
                textTransform: 'uppercase',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#FFD700';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#FFCB05';
                e.target.style.transform = 'translateY(0)';
              }}
              >
                VER PLANES
              </button>
            </div>

            {/* Lado derecho - Smartphone con IA */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative'
            }}>
              {/* Logo y texto superior */}
              <div style={{
                background: '#FFCB05',
                color: 'black',
                padding: '0.8rem 1.5rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  fontFamily: 'Georgia, serif',
                  marginBottom: '0.3rem'
                }}>El Comercio</div>
                <div style={{
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  textTransform: 'uppercase'
                }}>PLAN DIGITAL</div>
              </div>

              <div style={{
                color: 'white',
                fontSize: '0.9rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>Powered by perplexity</span>
                <div style={{
                  width: '20px',
                  height: '20px',
                  background: '#FFCB05',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: '700'
                }}>P</div>
              </div>

              {/* Smartphone mockup */}
              <div style={{
                width: '200px',
                height: '400px',
                background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
                borderRadius: '25px',
                padding: '15px',
                boxShadow: '0 0 30px rgba(255, 203, 5, 0.5), 0 0 60px rgba(255, 203, 5, 0.3)',
                border: '2px solid #FFCB05',
                position: 'relative'
              }}>
                {/* Pantalla del teléfono */}
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: 'white',
                  borderRadius: '15px',
                  padding: '15px',
                  overflow: 'hidden'
                }}>
                  {/* Barra superior */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                    fontSize: '0.8rem'
                  }}>
                    <span>▶️</span>
                    <span>Escuchar la noticia con IA</span>
                  </div>
                  <div style={{
                    background: '#e0e0e0',
                    height: '4px',
                    borderRadius: '2px',
                    marginBottom: '1rem'
                  }}>
                    <div style={{
                      background: '#FFCB05',
                      height: '100%',
                      width: '10%',
                      borderRadius: '2px'
                    }}></div>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '1rem' }}>00:30 / 03:00</div>

                  {/* Contenido de la noticia */}
                  <div style={{
                    background: '#f8f9fa',
                    padding: '10px',
                    borderRadius: '8px',
                    marginBottom: '1rem'
                  }}>
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                      color: '#333'
                    }}>Ver resumen de la noticia IA</div>
                    <div style={{
                      fontSize: '0.6rem',
                      color: '#666',
                      marginBottom: '0.5rem'
                    }}>Powered by perplexity</div>
                  </div>

                  <div style={{
                    fontSize: '0.7rem',
                    lineHeight: '1.4',
                    color: '#333',
                    marginBottom: '0.5rem'
                  }}>
                    Esta es la crónica ganadora del premio a la Excelencia Periodística 2025: Muerte en la plaza San Martín
                  </div>

                  <div style={{
                    fontSize: '0.6rem',
                    lineHeight: '1.3',
                    color: '#666'
                  }}>
                    El trabajo de Juan Aurelio Arévalo Miró Quesada, director periodístico de El Comercio... reconstruye con vigor uno de los crímenes políticos más impactantes del siglo XX en Perú.
                  </div>

                  <div style={{
                    position: 'absolute',
                    bottom: '15px',
                    left: '15px',
                    right: '15px',
                    fontSize: '0.6rem',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    Juan Aurelio Arévalo Miró Quesada
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ComercioContainer>
    );
  }

  return (
    <ComercioContainer>
      {/* Header principal como El Comercio oficial */}
      <div style={{
        background: '#FFCB05',
        padding: '1rem 0',
        textAlign: 'center',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <img 
          src="/images/logos/comercio.png" 
          alt="EL COMERCIO"
          style={{
            height: '60px',
            width: 'auto',
            maxWidth: '400px',
            objectFit: 'contain'
          }}
        />
        <button 
          onClick={() => setMostrarSeccionSuscripcion(true)}
          style={{
            position: 'absolute',
            right: '2rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'linear-gradient(135deg, #20B2AA 0%, #00CED1 100%)',
            color: 'white',
            border: 'none',
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #00CED1 0%, #20B2AA 100%)';
            e.target.style.transform = 'translateY(-50%) scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #20B2AA 0%, #00CED1 100%)';
            e.target.style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          ¡SUSCRÍBETE!
        </button>
      </div>

      {/* Barra de navegación principal */}
      <div style={{
        background: 'white',
        padding: '0.8rem 0',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          fontSize: '0.9rem',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          <a href="#ultimo" style={{ color: '#1a1a1a', textDecoration: 'none' }}>LO ÚLTIMO</a>
          <span style={{ color: '#ccc', fontSize: '0.8rem' }}>•</span>
          <a href="#deportes" style={{ color: '#1a1a1a', textDecoration: 'none' }}>DEPORTES</a>
          <span style={{ color: '#ccc', fontSize: '0.8rem' }}>•</span>
          <a href="#economia" style={{ color: '#1a1a1a', textDecoration: 'none' }}>ECONOMÍA</a>
          <span style={{ color: '#ccc', fontSize: '0.8rem' }}>•</span>
          <a href="#mundo" style={{ color: '#1a1a1a', textDecoration: 'none' }}>MUNDO</a>
        </div>
      </div>

      {/* Barra de noticias destacadas (negra) */}
      {noticiaDestacada && (
        <div style={{
          background: '#000000',
          color: 'white',
          padding: '0.6rem 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          fontSize: '1rem',
          fontWeight: '600'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '8px',
              height: '8px',
              background: '#dc3545',
              borderRadius: '50%'
            }}></div>
            <span style={{ color: '#dc3545' }}>
              {noticiaDestacada.categoria || 'DESTACADO'}
            </span>
          </div>
          <span style={{ color: 'white' }}>|</span>
          <span style={{ color: 'white' }}>
            {noticiaDestacada.titulo}
          </span>
        </div>
      )}

      {/* Barra de noticias en vivo (blanca) */}
      {noticiaEnVivo && (
        <div style={{
          background: 'white',
          color: '#1a1a1a',
          padding: '0.6rem 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          fontSize: '1rem',
          fontWeight: '600',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <span style={{ color: '#dc3545', fontWeight: '700' }}>EN VIVO</span>
          <span style={{ color: '#ccc' }}>|</span>
          <span style={{ color: '#1a1a1a' }}>
            {noticiaEnVivo.titulo}
          </span>
        </div>
      )}

      {/* Filtros de fecha - versión compacta */}
      <div style={{
        background: 'white',
        padding: '0.8rem 0',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#2c5530',
            fontSize: '0.9rem',
            fontWeight: '600',
            fontFamily: 'Arial, sans-serif'
          }}>
            <FiCalendar style={{ fontSize: '1rem' }} />
              Filtrar por fecha
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
              {fechasDisponibles.map((fecha) => (
              <button
                  key={fecha.fecha}
                onClick={() => setFechaSeleccionada(fecha.fecha)}
                style={{
                  background: fechaSeleccionada === fecha.fecha ? '#2c5530' : 'white',
                  color: fechaSeleccionada === fecha.fecha ? 'white' : '#333',
                  border: `2px solid ${fechaSeleccionada === fecha.fecha ? '#2c5530' : '#e0e0e0'}`,
                  padding: '0.4rem 0.8rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontFamily: 'Arial, sans-serif'
                }}
              >
                <FiClock style={{ fontSize: '0.7rem' }} />
                  {fecha.fecha_formateada} ({fecha.total_noticias})
              </button>
            ))}
          </div>
        </div>
      </div>


      {/* Layout principal como El Comercio oficial */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 2rem' }}>
        
        {/* Bloque principal destacado */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '2fr 1fr', 
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          
          {/* Noticia principal destacada */}
          <div 
            onClick={() => noticiasFiltradas[0] && handleNoticiaClick(noticiasFiltradas[0])}
            style={{ 
              background: 'white',
              borderRadius: '4px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ position: 'relative' }}>
              <img 
                src={noticiasFiltradas[0]?.imagen_url || '/images/congreso.jpeg'} 
                alt={noticiasFiltradas[0]?.titulo}
                style={{ 
                  width: '100%', 
                  height: '300px', 
                  objectFit: 'cover' 
                }}
              />
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{
                fontSize: '0.8rem',
                fontWeight: '700',
                color: '#dc3545',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '0.8rem',
                fontFamily: 'Arial, sans-serif'
              }}>
                {noticiasFiltradas[0]?.categoria || 'MUNDO'}
              </div>
              <h1 style={{
                fontSize: '1.8rem',
                fontWeight: '700',
                color: '#1a1a1a',
                margin: '0 0 1rem 0',
                lineHeight: '1.2',
                fontFamily: 'Georgia, serif'
              }}>
                {noticiasFiltradas[0]?.titulo || 'El Papa León XIV recibe a El Comercio y RPP en el Vaticano'}
              </h1>
              <p style={{
                fontSize: '1rem',
                color: '#666',
                margin: '0 0 1rem 0',
                lineHeight: '1.5',
                fontFamily: 'Arial, sans-serif'
              }}>
                {noticiasFiltradas[0]?.descripcion || 'En la víspera de su cumpleaños número 70, León XIV tuvo un emotivo momento de cercanía con el Perú y recordó el tiempo que pasó aquí.'}
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                color: '#999',
                fontFamily: 'Arial, sans-serif'
              }}>
                <FiClock style={{ fontSize: '0.8rem' }} />
                {formatDate(noticiasFiltradas[0]?.fecha_publicacion)}
              </div>
            </div>
          </div>

          {/* Columna derecha - Noticias secundarias */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Noticia secundaria 1 */}
            <div 
              onClick={() => noticiasFiltradas[1] && handleNoticiaClick(noticiasFiltradas[1])}
              style={{ 
                background: 'white',
                borderRadius: '4px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ padding: '1rem' }}>
                <div style={{
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  color: '#dc3545',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '0.5rem',
                  fontFamily: 'Arial, sans-serif'
                }}>
                  {noticiasFiltradas[1]?.categoria || '¡PERÚ AVANZA EN LA DAVIS!'}
                </div>
                <h3 style={{
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  color: '#1a1a1a',
                  margin: '0 0 0.8rem 0',
                  lineHeight: '1.3',
                  fontFamily: 'Georgia, serif'
                }}>
                  {noticiasFiltradas[1]?.titulo || 'Ignacio Buse vence 2-1 a Nuno Borges y clasifica a Perú a las Qualifiers de la Copa Davis'}
                </h3>
              </div>
              <div style={{ padding: '0 1rem 1rem' }}>
                <img 
                  src={noticiasFiltradas[1]?.imagen_url || '/images/congreso.jpeg'} 
                  alt={noticiasFiltradas[1]?.titulo}
                  style={{ 
                    width: '100%', 
                    height: '120px', 
                    objectFit: 'cover',
                    borderRadius: '2px'
                  }}
                />
              </div>
            </div>

            {/* Noticia secundaria 2 */}
            <div 
              onClick={() => noticiasFiltradas[2] && handleNoticiaClick(noticiasFiltradas[2])}
              style={{ 
                background: 'white',
                borderRadius: '4px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ padding: '1rem' }}>
                <div style={{
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  color: '#dc3545',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '0.5rem',
                  fontFamily: 'Arial, sans-serif'
                }}>
                  {noticiasFiltradas[2]?.categoria || 'TE LO CUENTO'}
                </div>
                <h3 style={{
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  color: '#1a1a1a',
                  margin: '0 0 0.5rem 0',
                  lineHeight: '1.3',
                  fontFamily: 'Georgia, serif'
                }}>
                  {noticiasFiltradas[2]?.titulo || 'Malaver, no eres tú, una crónica de Fernando Vivas sobre el ministro del Interior'}
                </h3>
                <p style={{
                  fontSize: '0.8rem',
                  color: '#666',
                  margin: '0 0 0.5rem 0',
                  fontFamily: 'Arial, sans-serif'
                }}>
                  {noticiasFiltradas[2]?.autor || 'Fernando Vivas'}
                </p>
                <div style={{
                  background: '#FFD700',
                  color: '#1a1a1a',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '3px',
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  display: 'inline-block',
                  fontFamily: 'Arial, sans-serif'
                }}>
                  ★ Solo para suscriptores
                </div>
              </div>
              <div style={{ padding: '0 1rem 1rem' }}>
                <img 
                  src={noticiasFiltradas[2]?.imagen_url || '/images/congreso.jpeg'} 
                  alt={noticiasFiltradas[2]?.titulo}
                  style={{ 
                    width: '100%', 
                    height: '120px', 
                    objectFit: 'cover',
                    borderRadius: '2px'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sección LO ÚLTIMO como bloque separado */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '2fr 1fr', 
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          
          {/* Columna izquierda - Más noticias */}
          <div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1a1a1a',
              margin: '0 0 1.5rem 0',
              fontFamily: 'Georgia, serif',
              borderBottom: '2px solid #dc3545',
              paddingBottom: '0.5rem'
            }}>
              Más noticias
            </h2>
            
            {/* Grid de noticias adicionales */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '1.5rem'
            }}>
              {noticiasFiltradas.slice(3, 7).map((noticia, index) => (
                <div 
                  key={noticia.id}
                  onClick={() => handleNoticiaClick(noticia)}
                  style={{ 
                    background: 'white',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <img 
                    src={noticia.imagen_url || '/images/congreso.jpeg'} 
                    alt={noticia.titulo}
                    style={{ 
                      width: '100%', 
                      height: '120px', 
                      objectFit: 'cover' 
                    }}
                  />
                  <div style={{ padding: '1rem' }}>
                    <div style={{
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      color: '#dc3545',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '0.5rem',
                      fontFamily: 'Arial, sans-serif'
                    }}>
                      {noticia.categoria}
                    </div>
                    <h3 style={{
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      color: '#1a1a1a',
                      margin: '0 0 0.5rem 0',
                      lineHeight: '1.3',
                      fontFamily: 'Georgia, serif'
                    }}>
                      {noticia.titulo}
                    </h3>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.75rem',
                      color: '#999',
                      fontFamily: 'Arial, sans-serif'
                    }}>
                      <FiClock style={{ fontSize: '0.7rem' }} />
                      {formatDate(noticia.fecha_publicacion)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Columna derecha - LO ÚLTIMO */}
          <div>
            <h2 style={{
              fontSize: '1.2rem',
              fontWeight: '700',
              color: '#1a1a1a',
              margin: '0 0 1rem 0',
              fontFamily: 'Arial, sans-serif',
              borderLeft: '4px solid #dc3545',
              paddingLeft: '1rem'
            }}>
              LO ÚLTIMO
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {noticiasFiltradas.slice(6, 11).map((noticia, index) => (
                <div 
                  key={noticia.id} 
                  onClick={() => handleNoticiaClick(noticia)}
                  style={{
                    padding: '0.5rem 0',
                    borderBottom: index < 4 ? '1px solid #f0f0f0' : 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#666',
                    marginBottom: '0.25rem',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    {new Date().getHours()}:{String(new Date().getMinutes() + index).padStart(2, '0')}
                  </div>
                  <h4 style={{
                    fontSize: '0.85rem',
                    fontWeight: '400',
                    color: '#1a1a1a',
                    margin: '0',
                    lineHeight: '1.3',
                    fontFamily: 'Arial, sans-serif',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#dc3545';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#1a1a1a';
                  }}
                  >
                    {noticia.titulo}
                  </h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Suscriptores */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        color: 'white',
        padding: '3rem 0',
        marginTop: '2rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '700',
              marginBottom: '1rem',
              fontFamily: 'Georgia, serif'
            }}>
              Accede a contenido exclusivo
            </h2>
            <p style={{
              fontSize: '1.1rem',
              marginBottom: '2rem',
              opacity: 0.9,
              fontFamily: 'Arial, sans-serif'
            }}>
              Análisis profundos y las mejores historias del periodismo peruano
            </p>
            <button style={{
              background: '#FFCB05',
              color: '#1a1a1a',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '4px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontFamily: 'Arial, sans-serif'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#FFD700';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#FFCB05';
              e.target.style.transform = 'translateY(0)';
            }}
            >
              Suscríbete ahora
            </button>
          </div>
        </div>
      </div>

    </ComercioContainer>
  );
};

export default DiarioComercio;
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '1rem'
              }}>
                {[3, 4, 5].map((index) => (
                  <div key={index} style={{ 
                    background: '#f8f9fa',
                    borderRadius: '4px',
                    padding: '1rem',
                    textAlign: 'left'
                  }}>
                    <div style={{
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      color: '#666',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '0.5rem',
                      fontFamily: 'Arial, sans-serif'
                    }}>
                      {index === 3 ? 'REVISA NUESTRA FOTOGALERÍA' : 
                       index === 4 ? '¡PERÚ CAMPEÓN!' : 'CELEBRANDO EL CAMPEONATO'}
                    </div>
                    <h4 style={{
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      color: '#1a1a1a',
                      margin: '0 0 0.5rem 0',
                      lineHeight: '1.3',
                      fontFamily: 'Georgia, serif'
                    }}>
                      {noticiasFiltradas[index]?.titulo || 'Perú campeón del Mundial de desayunos: así se vivió el anuncio en Lima | FOTOS'}
                    </h4>
                    <div style={{ position: 'relative' }}>
                      <img 
                        src={noticiasFiltradas[index]?.imagen_url || '/images/congreso.jpeg'} 
                        alt={noticiasFiltradas[index]?.titulo}
                        style={{ 
                          width: '100%', 
                          height: '80px', 
                          objectFit: 'cover',
                          borderRadius: '2px'
                        }}
                      />
                      {index === 3 && (
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          background: 'rgba(255, 215, 0, 0.9)',
                          color: '#1a1a1a',
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          fontWeight: '700'
                        }}>
                          ▶
                        </div>
                      )}
                    </div>
                    {index === 5 && (
                      <p style={{
                        fontSize: '0.75rem',
                        color: '#666',
                        margin: '0.5rem 0 0 0',
                        fontFamily: 'Arial, sans-serif'
                      }}>
                        Redacción EC
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Sección de opinión */}
            <div style={{ 
              background: 'white',
              borderRadius: '4px',
              padding: '1.5rem',
              marginBottom: '2rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1a1a1a',
                margin: '0 0 1.5rem 0',
                fontFamily: 'Georgia, serif'
              }}>
                Opinión
              </h2>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                gap: '1rem'
              }}>
                {['Editorial El Comercio', 'Mario Ghibellini', 'Jaime de Althaus', 'Gisella López Lenci'].map((autor, index) => (
                  <div key={index} style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      background: '#f0f0f0',
                      borderRadius: '50%',
                      margin: '0 auto 0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      color: '#666'
                    }}>
                      {autor.charAt(0)}
                    </div>
                    <h4 style={{
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      color: '#1a1a1a',
                      margin: '0 0 0.5rem 0',
                      fontFamily: 'Arial, sans-serif'
                    }}>
                      {autor}
                    </h4>
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#666',
                      lineHeight: '1.4',
                      fontStyle: 'italic',
                      fontFamily: 'Arial, sans-serif'
                    }}>
                      {index === 0 ? 'Disposiciones en dictámenes sobre otros temas deben ser desterrados.' :
                       index === 1 ? 'El ministro Malaver añora el hampa oriunda en clave poética.' :
                       index === 2 ? '"Algunos clubes son vehículos de lavado de activos de narcos o mineros ilegales".' :
                       '"Oficialismo argentino solo tiene algunas semanas para sacar la cabeza".'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columna derecha - Sidebar */}
          <div>
            {/* Sección "Lo Último" */}
            <div style={{ 
              background: 'white',
              borderRadius: '4px',
              padding: '1rem',
              marginBottom: '1.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{
                fontSize: '1.2rem',
                fontWeight: '700',
                color: '#1a1a1a',
                margin: '0 0 1rem 0',
                fontFamily: 'Arial, sans-serif'
              }}>
                LO ÚLTIMO
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {noticiasFiltradas.slice(6, 11).map((noticia, index) => (
                  <div 
                    key={noticia.id} 
                    onClick={() => handleNoticiaClick(noticia)}
                    style={{
                      padding: '0.5rem 0',
                      borderBottom: index < 4 ? '1px solid #f0f0f0' : 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f8f9fa';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#666',
                      marginBottom: '0.25rem',
                      fontFamily: 'Arial, sans-serif'
                    }}>
                      {new Date().getHours()}:{String(new Date().getMinutes() + index).padStart(2, '0')}
                    </div>
                    <h4 style={{
                      fontSize: '0.85rem',
                      fontWeight: '400',
                      color: '#1a1a1a',
                      margin: '0',
                      lineHeight: '1.3',
                      fontFamily: 'Arial, sans-serif',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = '#dc3545';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = '#1a1a1a';
                    }}
                    >
                      {noticia.titulo}
                    </h4>
                  </div>
                ))}
              </div>
            </div>

            {/* Widget de clima */}
            <div style={{ 
              background: 'white',
              borderRadius: '4px',
              padding: '1rem',
              marginBottom: '1.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '0.5rem',
                fontFamily: 'Arial, sans-serif'
              }}>
                Lima, Perú
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Arial, sans-serif' }}>22°C</div>
                  <div style={{ color: '#666', fontSize: '0.8rem', fontFamily: 'Arial, sans-serif' }}>Parcialmente nublado</div>
                </div>
                <div style={{ fontSize: '1.5rem' }}>⛅</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <MainContent>
        <div>
          {/* Sección de Liga 1 */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '1rem',
              borderLeft: '4px solid #dc3545',
              paddingLeft: '1rem'
            }}>
              <h2 style={{ 
                color: '#dc3545', 
                margin: 0, 
                fontSize: '1.5rem',
                fontWeight: '700'
              }}>
                LIGA 1
              </h2>
            </div>
            
            {/* Noticia de deportes destacada */}
            {noticiasSecundarias.filter(n => n.categoria === 'Deportes')[0] && (
              <NewsCard 
                onClick={() => handleNoticiaClick(noticiasSecundarias.filter(n => n.categoria === 'Deportes')[0])}
                style={{ cursor: 'pointer' }}
              >
                <CardImage>
                  <img 
                    src={noticiasSecundarias.filter(n => n.categoria === 'Deportes')[0].imagen_url || '/images/congreso.jpeg'}
                    alt="Deportes"
                  />
                </CardImage>
                <CardContent>
                  <CategoryTag category="Deportes">DEPORTES</CategoryTag>
                  <CardTitle>
                    {noticiasSecundarias.filter(n => n.categoria === 'Deportes')[0].titulo}
                  </CardTitle>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>90 ST</strong> Alianza maquilla el resultado y cae en Matute ante Garcilaso
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>77 ST</strong> Estrada cabecea en el área chica de Garcilaso
                    </div>
                    <div style={{ color: '#dc3545', fontWeight: '600' }}>
                      <strong>74 ST</strong> ¡GOOOOL DE ALIANZA LIMA! Sergio Peña marca el descuento
                    </div>
                  </div>
                  <CardActions>
                    <ActionButton>
                      <FiHeart /> 245
                    </ActionButton>
                    <ActionButton>
                      <FiMessageCircle /> 67
                    </ActionButton>
                    <ActionButton>
                      <FiShare2 /> Compartir
                    </ActionButton>
                  </CardActions>
                </CardContent>
              </NewsCard>
            )}
          </div>

          {/* Grid de noticias */}
            <NewsGrid>
            {noticiasSecundarias.slice(0, 6).map((noticia) => (
              <NewsCard 
                key={noticia.id}
                onClick={() => handleNoticiaClick(noticia)}
                style={{ cursor: 'pointer' }}
              >
                <CardImage>
                  <img 
                    src={noticia.imagen_url || '/images/congreso.jpeg'} 
                    alt={noticia.titulo}
                  />
                  {noticia.categoria === 'Videos' && (
                    <PlayButton>
                      <FiPlay />
                    </PlayButton>
                  )}
                </CardImage>
                <CardContent>
                  <CategoryTag category={noticia.categoria}>
                    {noticia.categoria}
                  </CategoryTag>
                  <CardTitle>{noticia.titulo}</CardTitle>
                  <CardMeta>
                    <MetaInfo>
                      <span><FiClock /> {new Date(noticia.fecha_publicacion).toLocaleDateString('es-PE')}</span>
                      <span><FiEye /> {Math.floor(Math.random() * 1000) + 100}</span>
                    </MetaInfo>
                  </CardMeta>
                  <CardActions>
                    <ActionButton>
                      <FiHeart /> {Math.floor(Math.random() * 50) + 10}
                    </ActionButton>
                    <ActionButton>
                      <FiShare2 /> Compartir
                    </ActionButton>
                    <ActionButton>
                      <FiBookmark />
                    </ActionButton>
                  </CardActions>
                </CardContent>
                </NewsCard>
              ))}
            </NewsGrid>
        </div>

        {/* Sidebar */}
        <Sidebar>
          {/* Widget de información */}
          <WeatherWidget>
            <WeatherTitle>Lima, Perú</WeatherTitle>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: '700' }}>22°C</div>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>Parcialmente nublado</div>
              </div>
              <div style={{ fontSize: '2rem' }}>⛅</div>
            </div>
          </WeatherWidget>

          {/* Videos */}
          <VideoSection>
            <VideoTitle>
              <FiPlay /> Videos destacados
            </VideoTitle>
            {noticiasFiltradas.slice(0, 3).map((noticia) => (
              <VideoItem key={noticia.id}>
                <VideoThumbnail>
                  <img 
                    src={noticia.imagen_url || '/images/congreso.jpeg'} 
                    alt={noticia.titulo}
                  />
                </VideoThumbnail>
                <VideoContent>
                  <VideoItemTitle>{noticia.titulo}</VideoItemTitle>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    <FiClock /> {new Date(noticia.fecha_publicacion).toLocaleDateString('es-PE')} • 2:45 min
                  </div>
                </VideoContent>
              </VideoItem>
            ))}
          </VideoSection>

          {/* Más leídas */}
          <SidebarSection>
            <SectionTitle>
              <FiStar />
              Más leídas
            </SectionTitle>
            <NewsList>
              {noticiasFiltradas.slice(0, 5).map((noticia, index) => (
                <NewsItem key={noticia.id}>
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    background: '#2c5530', 
                    color: 'white', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '0.8rem', 
                    fontWeight: '600',
                    flexShrink: 0
                  }}>
                    {index + 1}
                  </div>
                  <NewsItemContent>
                    <NewsItemTitle>{noticia.titulo}</NewsItemTitle>
                    <NewsItemMeta>
                      <FiEye />
                      {Math.floor(Math.random() * 5000) + 500} lecturas
                    </NewsItemMeta>
                  </NewsItemContent>
                </NewsItem>
              ))}
            </NewsList>
          </SidebarSection>

          {/* Widget adicional de El Comercio */}
          <WeatherWidget>
            <WeatherTitle>Datos económicos</WeatherTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>Dólar</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#28a745' }}>S/ 3.75</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>Euro</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#007bff' }}>S/ 4.12</div>
              </div>
            </div>
          </WeatherWidget>
        </Sidebar>
      </MainContent>

      {/* Sección de Suscriptores */}
      <SuscriptoresSection>
        <SuscriptoresContent>
          <SuscriptoresHeader>
            <SuscriptoresTitle>Suscriptores</SuscriptoresTitle>
            <ClubButton>Club El Comercio</ClubButton>
          </SuscriptoresHeader>

          <SuscriptoresGrid>
            <MainArticle>
              <MainArticleContent>
                <AudioLabels>
                  <AudioLabel>Te lo cuento</AudioLabel>
                  <AudioLabel>🎧 Escucha la noticia</AudioLabel>
                </AudioLabels>
                <MainHeadline>
                  La gente dice: "¡Qué caro es Central!", pero no ven que hay 140 personas trabajando detrás
                </MainHeadline>
                <MainAuthor>Ángel Navarro Quevedo</MainAuthor>
              </MainArticleContent>
              <MainImage>
                <img 
                  src="/images/congreso.jpeg" 
                  alt="Chef en Central" 
                />
              </MainImage>
            </MainArticle>
          </SuscriptoresGrid>

          <SecondaryGrid>
            <SecondaryArticle>
              <SubscriberTag>Solo para suscriptores</SubscriberTag>
              <ArticleCategory>Los alcances del nuevo texto</ArticleCategory>
              <ArticleTitle>
                Congreso sigue dejendo abierta la puerta para el incremento de sueldos de senadores y diputados
              </ArticleTitle>
              <ArticleAuthor>Thalía Cadenas</ArticleAuthor>
              <ArticleImage>
                <img 
                  src="/images/congreso.jpeg" 
                  alt="Congreso" 
                />
              </ArticleImage>
            </SecondaryArticle>

            <div>
              <SecondaryArticle>
                <SubscriberTag>Solo para suscriptores</SubscriberTag>
                <ArticleCategory>¿Habrá 'influencers' creados con IA?</ArticleCategory>
                <ArticleTitle>
                  'Influencers' en el Perú: así crecen en el país, los más destacados y qué atrae a las marcas
                </ArticleTitle>
                <ArticleAuthor>Claudia Inga Martínez</ArticleAuthor>
                <ArticleImage>
                  <img 
                    src="/images/congreso.jpeg" 
                    alt="Influencers" 
                  />
                </ArticleImage>
              </SecondaryArticle>

              <SecondaryArticle style={{ marginTop: '1rem' }}>
                <SubscriberTag>Solo para suscriptores</SubscriberTag>
                <ArticleCategory>La lucha de PROLIMA</ArticleCategory>
                <ArticleTitle>
                  Los restos arqueológicos hallados cerca de Palacio de Gobierno que enfrentan al Ejecutivo y la MML
                </ArticleTitle>
                <ArticleAuthor>José Cayetano Chávez</ArticleAuthor>
                <ArticleImage>
                  <img 
                    src="/images/congreso.jpeg" 
                    alt="Arqueología" 
                  />
                </ArticleImage>
              </SecondaryArticle>
            </div>
          </SecondaryGrid>
        </SuscriptoresContent>
      </SuscriptoresSection>

      {/* Sección Deporte Total */}
      <DeporteTotalSection>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <DeporteTotalHeader>
            <DeporteTotalTitle>Deporte Total</DeporteTotalTitle>
          </DeporteTotalHeader>
          
          <DeporteTotalGrid>
            {/* Noticia de Copa Davis */}
            <DeporteCard>
              <DeporteCardImage>
                <img 
                  src="/images/congreso.jpeg" 
                  alt="Copa Davis Perú"
                />
              </DeporteCardImage>
              <DeporteCardContent>
                <DeporteCategory>EVENTO IMPERDIBLE</DeporteCategory>
                <DeporteTitle>
                  Perú venció 3-1 a Portugal y consigue su boleto a los qualifiers de la Copa Davis 2026
                </DeporteTitle>
              </DeporteCardContent>
            </DeporteCard>

            {/* Noticia de Ignacio Buse */}
            <DeporteCard>
              <DeporteCardImage>
                <img 
                  src="/images/congreso.jpeg" 
                  alt="Ignacio Buse"
                />
              </DeporteCardImage>
              <DeporteCardContent>
                <DeporteCategory>REVIVE EL MOMENTO</DeporteCategory>
                <DeporteTitle>
                  Copa Davis: así fue el punto de Ignacio Buse para la clasificación de Perú a los Qualifiers del 2026
                </DeporteTitle>
              </DeporteCardContent>
            </DeporteCard>

            {/* Noticia de Real Madrid */}
            <DeporteCard>
              <DeporteCardImage>
                <img 
                  src="/images/congreso.jpeg" 
                  alt="Real Madrid"
                />
                <PlayButton>
                  <FiPlay />
                </PlayButton>
              </DeporteCardImage>
              <DeporteCardContent>
                <DeporteCategory>FÚTBOL ESPAÑOL</DeporteCategory>
                <DeporteTitle>
                  Con gol de Mbappé: Real Madrid venció 2-1 a Real Sociedad por LaLiga | RESUMEN Y GOLES
                </DeporteTitle>
              </DeporteCardContent>
            </DeporteCard>
          </DeporteTotalGrid>
        </div>
      </DeporteTotalSection>

    </ComercioContainer>
  );
};

export default DiarioComercio;