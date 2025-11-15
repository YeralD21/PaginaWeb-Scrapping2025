import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { FiFileText, FiBarChart2, FiFilter, FiRefreshCw, FiCalendar, FiSearch, FiAlertTriangle, FiTrendingUp, FiPieChart, FiChevronDown, FiRadio, FiShare2, FiLock, FiSun, FiMoon, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import AuthNavbar from './components/Auth/AuthNavbar';
import DiarioComercio from './components/DiarioComercio';
import DiarioCorreo from './components/DiarioCorreo';
import DiarioPopular from './components/DiarioPopular';
import DiarioCNN from './components/DiarioCNN';
import Comparativa from './components/Comparativa';
import NoticiaDetalle from './components/NoticiaDetalle';
import AlertManager from './components/AlertManager';
import AdvancedSearch from './components/AdvancedSearch';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import TrendingNews from './components/TrendingNews';
import GeographicFilter from './components/GeographicFilter';
import DateFilter from './components/DateFilter';
import DateFilterExample from './components/DateFilterExample';
import AppUGC from './AppUGC';
import CommunityFeed from './components/Community/CommunityFeed';
import UnifiedNews from './components/UnifiedNews';
import SocialMediaFeed from './components/SocialMediaFeed';
import SubscriptionModal from './components/Subscriptions/SubscriptionModal';
import LoginModal from './components/Auth/LoginModal';

const Container = styled.div`
  width: 100%;
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  position: relative;
`;

const Header = styled.header`
  background: var(--header-bg);
  color: var(--text-primary);
  padding: 1.2rem 0;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  will-change: background-color, color, box-shadow;
  transition: background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1), 
              color 0.15s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1),
              padding 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  
  &[data-theme="dark"] {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    padding: 1.5rem 0;
  }
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  margin: 0;
  opacity: 0.8;
  font-weight: 300;
`;

const Navigation = styled.nav`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(2, auto);
  gap: 0.5rem;
  margin-top: 0.8rem;
  width: 100%;
  padding: 0 1rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(4, 1fr);
  }
  
  @media (max-width: 900px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const NavButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'active',
})`
  background: ${props => props.active ? '#dc3545' : 'rgba(0, 0, 0, 0.05)'};
  color: var(--text-primary);
  border: 2px solid ${props => props.active ? '#dc3545' : 'rgba(0, 0, 0, 0.2)'};
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  white-space: nowrap;

  &:hover {
    background: ${props => props.active ? '#c82333' : 'rgba(0, 0, 0, 0.1)'};
    border-color: ${props => props.active ? '#c82333' : 'rgba(0, 0, 0, 0.4)'};
    transform: translateY(-2px);
  }

  body[data-theme="dark"] & {
    background: ${props => props.active ? '#dc3545' : 'rgba(255, 255, 255, 0.05)'};
    color: ${props => props.active ? 'white' : 'var(--filter-text-color)'};
    border-color: ${props => props.active ? '#dc3545' : 'rgba(97, 218, 251, 0.3)'};
    
    &:hover:not(:disabled) {
      background: ${props => props.active ? '#c82333' : 'rgba(255, 255, 255, 0.1)'};
      color: ${props => props.active ? 'white' : 'var(--filter-text-hover)'};
      border-color: ${props => props.active ? '#c82333' : 'rgba(97, 218, 251, 0.5)'};
    }
  }

  @media (max-width: 768px) {
    padding: 0.4rem 0.8rem;
    font-size: 0.75rem;
    border-radius: 15px;
  }
`;

const ThemeToggleButton = styled.button`
  background: rgba(0, 0, 0, 0.1);
  color: var(--text-primary);
  border: 2px solid rgba(0, 0, 0, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 2rem;
  margin-right: 1rem;
  position: relative;
  will-change: background-color, border-color, color;
  transition: background-color 0.1s ease, border-color 0.1s ease, color 0.1s ease, transform 0.1s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.2);
    transform: scale(1.05);
  }

  body[data-theme="dark"] & {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
`;

const FiltersSection = styled.div`
  background: var(--filter-bg);
  color: var(--text-primary);
  padding: 1.2rem 0;
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 110px;
  z-index: 99;
  overflow: visible;
  will-change: background-color, color, border-color;
  transition: background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1), 
              color 0.15s cubic-bezier(0.4, 0, 0.2, 1),
              border-color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  
  body[data-theme="dark"] & {
    top: 100px;
  }
`;

const FiltersContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  overflow: visible;
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const FilterButton = styled.button`
  background: var(--card-bg);
  color: var(--filter-text-color);
  border: 2px solid var(--border-color);
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  
  body[data-theme="dark"] & {
    color: var(--filter-text-color);
    
    &:hover {
      color: var(--filter-text-hover);
    }
  }
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    border-color: #dc3545;
    color: #dc3545;
    background: var(--bg-tertiary);
  }
`;

const DiarioFilterButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'active',
})`
  background: ${props => props.active ? '#dc3545' : 'var(--card-bg)'};
  color: ${props => props.active ? 'white' : 'var(--filter-text-color)'};
  border: 2px solid ${props => props.active ? '#dc3545' : 'var(--border-color)'};
  
  body[data-theme="dark"] & {
    color: ${props => props.active ? 'white' : 'var(--filter-text-color)'};
    
    &:hover:not(:disabled) {
      color: ${props => props.active ? 'white' : 'var(--filter-text-hover)'};
    }
  }
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;

  &:hover {
    background: ${props => props.active ? '#c82333' : 'var(--bg-tertiary)'};
    border-color: #dc3545;
    color: ${props => props.active ? 'white' : '#dc3545'};
  }
`;

const CategoriaDropdown = styled.div`
  position: relative;
  display: inline-block;
`;

const CategoriaDropdownContent = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 200px;
  margin-top: 0.5rem;
  overflow: hidden;
  
  body[data-theme="dark"] & {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
  }
`;

const CategoriaOption = styled.button`
  width: 100%;
  background: var(--card-bg);
  border: none;
  padding: 0.8rem 1rem;
  text-align: left;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--filter-text-color);
  border-bottom: 1px solid var(--border-color);

  body[data-theme="dark"] & {
    color: var(--filter-text-color);
    
    &:hover {
      background: var(--bg-tertiary);
      color: var(--filter-text-hover);
    }
  }

  &:hover {
    background: var(--bg-tertiary);
    color: #dc3545;
  }

  &:last-child {
    border-bottom: none;
  }

  &.active {
    background: #dc3545;
    color: white;
  }
`;

const DateFilterContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const DateButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'active',
})`
  background: ${props => props.active ? '#dc3545' : 'var(--card-bg)'};
  color: ${props => props.active ? 'white' : 'var(--filter-text-color)'};
  border: 2px solid ${props => props.active ? '#dc3545' : 'var(--border-color)'};
  
  body[data-theme="dark"] & {
    color: ${props => props.active ? 'white' : 'var(--filter-text-color)'};
    
    &:hover:not(:disabled) {
      color: ${props => props.active ? 'white' : 'var(--filter-text-hover)'};
    }
  }
  padding: 0.6rem 1rem;
  border-radius: 15px;
  font-size: 0.9rem;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background: ${props => props.active ? '#c82333' : 'var(--bg-tertiary)'};
    border-color: #dc3545;
  }
`;

const MainContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 2rem 2rem 1rem;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1rem;
  align-items: start;
`;

const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: sticky;
  top: 120px;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  
  &::-webkit-scrollbar {
    display: none; /* WebKit */
  }
`;

const RightPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

// Panel izquierdo - Noticias sin imágenes
const LeftPanelTitle = styled.h3`
  color: #dc3545;
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  text-align: center;
  border-bottom: 2px solid #dc3545;
  padding-bottom: 0.5rem;
`;

const TextNewsCard = styled.article`
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border-left: 4px solid #dc3545;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    border-left-color: #c82333;
  }
`;

const TextNewsCardLarge = styled(TextNewsCard)`
  padding: 1.5rem;
  border-left-width: 6px;
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
`;

const TextNewsCardSmall = styled(TextNewsCard)`
  padding: 0.8rem;
  border-left-width: 3px;
  background: linear-gradient(135deg, #fff 0%, #fefefe 100%);
`;

const TextNewsTitle = styled.h4`
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

const TextNewsTitleLarge = styled(TextNewsTitle)`
  font-size: 1rem;
  -webkit-line-clamp: 3;
`;

const TextNewsTitleSmall = styled(TextNewsTitle)`
  font-size: 0.8rem;
  -webkit-line-clamp: 2;
`;

const TextNewsMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #6c757d;
`;

const TextNewsMetaLarge = styled(TextNewsMeta)`
  font-size: 0.8rem;
  margin-top: 0.8rem;
`;

const TextNewsMetaSmall = styled(TextNewsMeta)`
  font-size: 0.7rem;
  margin-top: 0.4rem;
`;

// Estilos para noticias relevantes/premium con imágenes
const RelevantNewsCard = styled.article`
  background: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-left: 3px solid #ffd700;
  transition: all 0.3s ease;
  cursor: pointer;
  margin-bottom: 1rem;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 320px;
  width: 100%;
  
  &:hover {
    transform: translateX(4px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
    border-left-color: #ffed4e;
  }
  
  body[data-theme="dark"] & {
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.3);
    
    &:hover {
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
    }
  }
`;

const RelevantNewsImage = styled.div`
  width: 100%;
  min-height: 180px;
  height: 180px;
  background: ${props => props.$imageUrl 
    ? `url(${props.$imageUrl})` 
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  flex-shrink: 0;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40%;
    background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%);
  }
`;

const RelevantNewsContent = styled.div`
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100px;
`;

const RelevantNewsTitle = styled.h4`
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0.5rem 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
`;

const RelevantNewsMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const RelevantNewsDate = styled.span`
  color: var(--text-secondary);
  font-size: 0.7rem;
  font-weight: 500;
`;

const RelevantNewsCategory = styled.span`
  background: ${props => {
    switch(props.categoria?.toLowerCase()) {
      case 'política': return '#dc3545';
      case 'economía': return '#28a745';
      case 'deportes': return '#fd7e14';
      case 'nacional': return '#007bff';
      case 'internacional': return '#6f42c1';
      default: return '#6c757d';
    }
  }};
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const RelevantNewsDiario = styled.span`
  color: var(--text-secondary);
  font-size: 0.7rem;
  font-weight: 500;
  background: var(--bg-tertiary);
  padding: 0.2rem 0.4rem;
  border-radius: 6px;
`;

const TextNewsCategory = styled.span`
  background: #dc3545;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const TextNewsDate = styled.span`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: #6c757d;
`;

const TextNewsDiario = styled.span`
  color: #dc3545;
  font-weight: 600;
  font-size: 0.7rem;
`;

// Sección de Noticias Destacadas - Diseño Moderno
const FeaturedSection = styled.section`
  margin-bottom: 3rem;
`;

const FeaturedTitle = styled.h2`
  font-size: 2.2rem;
  font-weight: 700;
  color: #b8860b;
  margin-bottom: 2rem;
  border-left: 6px solid #b8860b;
  padding-left: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const FeaturedGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 1.5rem;
  height: 600px;

  @media (max-width: 968px) {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto auto;
    height: auto;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    height: auto;
  }
`;

const MainFeaturedCard = styled.article`
  grid-row: 1 / -1;
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  background-size: cover;
  background-position: center;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
  }

  @media (max-width: 968px) {
    grid-row: 1;
    grid-column: 1 / -1;
    height: 400px;
  }
`;

const SmallFeaturedCard = styled.article`
  position: relative;
  border-radius: 15px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'};
  background-size: cover;
  background-position: center;
  min-height: 280px;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    min-height: 250px;
  }
`;

const CardOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 2rem;
  color: white;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const SmallCardOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.85));
  padding: 1.5rem;
  color: white;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;


const TimeBadge = styled.div`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: rgba(184, 134, 11, 0.9);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
`;

const SmallTimeBadge = styled(TimeBadge)`
  top: 1rem;
  right: 1rem;
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
`;

const CategoryBadge = styled.div`
  background: #b8860b;
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 1rem;
  display: inline-block;
  width: fit-content;
`;

const SmallCategoryBadge = styled(CategoryBadge)`
  font-size: 0.7rem;
  padding: 0.3rem 0.6rem;
  margin-bottom: 0.8rem;
`;

const FeaturedCardTitle = styled.h3`
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  line-height: 1.2;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const SmallCardTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.8rem 0;
  line-height: 1.3;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
`;

const CardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.9rem;
  opacity: 0.9;
`;

const SmallCardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 0.8rem;
  opacity: 0.9;
`;

const AuthorName = styled.span`
  font-weight: 600;
  color: #b8860b;
`;

const DateBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

// Sección de Lista de Noticias (Estilo Primera Imagen)
const ListSection = styled.section`
  margin-bottom: 3rem;
`;

const ListTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 2rem;
  border-bottom: 3px solid #dc3545;
  padding-bottom: 0.5rem;
  display: inline-block;
`;

const NewsListGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const NewsListItem = styled.article`
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  border-left: 4px solid transparent;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border-color);

  body[data-theme="dark"] & {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    
    &:hover {
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
    }
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    border-left-color: #dc3545;
  }
`;

const NewsListImage = styled.div`
  width: 120px;
  height: 80px;
  border-radius: 8px;
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'};
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
`;

const NewsListContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const NewsListMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 0.5rem;
`;

const NewsListDate = styled.span`
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const NewsListCategory = styled.span`
  background: #dc3545;
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const NewsListTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
  margin: 0 0 0.5rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const NewsListAuthor = styled.span`
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
`;

// Sección de Grid Compacto (Estilo Segunda Imagen)
const CompactSection = styled.section`
  margin-bottom: 3rem;
`;

const CompactTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #dc3545, #fd7e14);
    border-radius: 2px;
  }
`;

const CompactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const CompactCard = styled.article`
  position: relative;
  height: 250px;
  border-radius: 15px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  background-size: cover;
  background-position: center;

  &:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
  }
`;

const CompactOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
  padding: 1.5rem;
  color: white;
  height: 70%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const CompactBadge = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
`;

const CompactCardTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 0.8rem 0;
  line-height: 1.3;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
`;

const CompactCardMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  opacity: 0.9;
`;

// Secondary News Grid
const SecondarySection = styled.section`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.8rem;
    font-weight: 700;
  margin: 0 0 2rem 0;
    color: #333;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 3px solid #dc3545;
  padding-bottom: 0.5rem;
  display: inline-block;
`;

const NewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
`;

const NewsCard = styled.article`
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  }
`;

const NewsImage = styled.div`
  position: relative;
  height: 250px;
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const NewsOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 1.5rem;
  color: white;
`;

const PremiumBadge = styled.span`
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: linear-gradient(135deg, #ffd43b 0%, #f08c00 100%);
  color: #2d1b69;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  z-index: 2;
  box-shadow: 0 8px 18px rgba(255, 167, 36, 0.25);
`;

const PremiumOverlay = styled.div`
  position: absolute;
  bottom: 0.5rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(20, 16, 48, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f8f1ff;
  font-weight: 600;
  font-size: 0.75rem;
  text-align: center;
  padding: 0.5rem 1rem;
  z-index: 3;
  backdrop-filter: blur(4px);
  pointer-events: none;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  white-space: nowrap;

  small {
    display: block;
    margin-top: 0.2rem;
    font-weight: 500;
    opacity: 0.9;
    font-size: 0.65rem;
  }
`;

const NewsTimeBadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
`;

const NewsCategory = styled.span`
  background: #dc3545;
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.8rem;
  display: inline-block;
`;

const NewsTitle = styled.h4`
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
`;

const NewsMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 0.8rem;
  opacity: 0.9;
`;

const NewsDate = styled.span`
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;


const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 10px;
  margin: 2rem 0;
  text-align: center;
`;

const ComparisonSection = styled.section`
  background: white;
  border-radius: 18px;
  padding: 2rem;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.12);
  border: 1px solid #e9ecef;
  margin-bottom: 3rem;
  position: relative;
  overflow: hidden;
`;

const ComparisonTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #1b1f3b;
  margin: 0 0 1.5rem 0;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const ComparisonHighlight = styled.span`
  background: linear-gradient(135deg, #dc3545 0%, #ff9a44 100%);
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.5px;
`;

const ComparisonSummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const ComparisonSummaryCard = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 15px;
  padding: 1rem 1.5rem;
  border: 1px solid rgba(220, 53, 69, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const ComparisonSummaryValue = styled.span`
  font-size: 1.6rem;
  font-weight: 700;
  color: #dc3545;
`;

const ComparisonSummaryLabel = styled.span`
  font-size: 0.85rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ComparisonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const ComparisonCard = styled.article`
  border-radius: 15px;
  border: 1px solid rgba(220, 53, 69, 0.2);
  box-shadow: 0 8px 20px rgba(220, 53, 69, 0.08);
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, #fff 100%);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  position: relative;
  overflow: hidden;

  &:before {
    content: '';
    position: absolute;
    top: -40px;
    right: -40px;
    width: 120px;
    height: 120px;
    background: radial-gradient(circle at center, rgba(220, 53, 69, 0.12), transparent 60%);
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(220, 53, 69, 0.18);
  }
`;

const ComparisonBadge = styled.span`
  align-self: flex-start;
  background: linear-gradient(135deg, #1da1f2 0%, #0084ff 100%);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  box-shadow: 0 4px 12px rgba(0, 132, 255, 0.3);
`;

const ComparisonCardTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: #212529;
  margin: 0;
  line-height: 1.4;
`;

const ComparisonMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #6c757d;
`;

const ComparisonLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: #dc3545;
  font-weight: 600;
  text-decoration: none;
  margin-top: 0.5rem;

  &:hover {
    text-decoration: underline;
  }
`;

const ComparisonMatches = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 0.8rem;
  border: 1px solid rgba(99, 110, 114, 0.1);
  font-size: 0.8rem;
`;

const ComparisonMatchesTitle = styled.div`
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.4rem;
`;

const ComparisonMatchItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.2rem 0;
  gap: 0.5rem;
  color: #6c757d;

  span {
    font-size: 0.75rem;
  }
`;

const ComparisonEmpty = styled.div`
  text-align: center;
  padding: 2rem 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px dashed #ced4da;
  color: #6c757d;
  font-size: 0.95rem;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin: 3rem 0 2rem;
  padding: 1.5rem;
  flex-wrap: wrap;
`;

const PaginationButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  background: var(--card-bg);
  color: var(--text-primary);
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 40px;
  height: 40px;

  &:hover:not(:disabled) {
    background: var(--bg-secondary);
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-color: #667eea;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  body[data-theme="dark"] & {
    border-color: rgba(255, 255, 255, 0.2);
    
    &:hover:not(:disabled) {
      border-color: #667eea;
    }
  }
`;

const PaginationInfo = styled.div`
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0 1rem;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    width: 100%;
    text-align: center;
    margin: 0.5rem 0;
  }
`;

const ComparisonError = styled.div`
  text-align: center;
  padding: 1rem;
  border-radius: 10px;
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  margin-bottom: 1rem;
`;

// Componente para la vista de noticias Premium
function PremiumNewsView() {
  const navigate = useNavigate();
  const { isAuthenticated, subscription, refreshSubscription, token, user } = useAuth();
  const [premiumNews, setPremiumNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingPremiumNews, setPendingPremiumNews] = useState(null);
  const hasActiveSubscription = subscription?.estado === 'active';
  const userIsAuthenticated = isAuthenticated();
  
  // Ref para evitar refrescar suscripción múltiples veces
  const subscriptionRefreshed = useRef(false);
  
  // Ref para evitar que el modal se cierre automáticamente
  const modalOpenRef = useRef(false);

  // Función para cargar noticias premium (memoizada para evitar recreaciones)
  const fetchPremiumNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:8000/noticias?es_premium=true&limit=100');
      setPremiumNews(response.data);
    } catch (err) {
      console.error('Error fetching premium news:', err);
      setError('Error al cargar noticias premium');
    } finally {
      setLoading(false);
    }
  }, []); // Sin dependencias = función estable

  // Cargar noticias premium solo una vez al montar el componente
  useEffect(() => {
    fetchPremiumNews();
  }, [fetchPremiumNews]); // Ahora fetchPremiumNews es estable gracias a useCallback

  // Refrescar suscripción solo cuando el usuario se autentica o cambia el token
  useEffect(() => {
    // Solo refrescar si hay token y usuario (usuario autenticado)
    if (token && user) {
      // Usar el token actual como clave para evitar refrescar múltiples veces
      const currentToken = token;
      if (!subscriptionRefreshed.current || subscriptionRefreshed.current !== currentToken) {
        subscriptionRefreshed.current = currentToken;
        refreshSubscription(currentToken);
      }
    } else {
      // Resetear el flag si el usuario se desautentica
      subscriptionRefreshed.current = null;
    }
  }, [token, user]); // Solo token y user, refreshSubscription es estable desde el contexto

  const handleNewsClick = async (noticia) => {
    console.log('Click en noticia premium:', noticia.titulo);
    
    // Si no está autenticado, mostrar modal de login primero
    if (!userIsAuthenticated) {
      console.log('Usuario no autenticado, mostrando modal de login');
      setPendingPremiumNews(noticia);
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
          navigate(`/noticia/${noticia.id}`);
          return;
        } else {
          console.log('Usuario no tiene suscripción activa, mostrando planes');
        }
      } catch (err) {
        console.error('Error verificando suscripción:', err);
        // En caso de error, mostrar planes de todos modos
      }
    }
    
    // No tiene suscripción activa, mostrar planes de suscripción
    console.log('Mostrando modal de suscripción');
    setPendingPremiumNews(noticia);
    modalOpenRef.current = true;
    setShowSubscriptionModal(true);
    return;
  };

  // Cuando el usuario se loguea después de hacer click en noticia premium, mostrar planes
  useEffect(() => {
    // Verificar si el usuario se acaba de loguear y hay una noticia premium pendiente
    if (isAuthenticated() && token && pendingPremiumNews) {
      // Si el modal de login está abierto, esperar a que se cierre
      if (showLoginModal) {
        // El modal de login se cerrará automáticamente después del login exitoso
        // Esperamos un momento para que se cierre antes de mostrar el modal de suscripción
        const timer = setTimeout(() => {
          if (!showLoginModal) {
            setShowLoginModal(false);
            modalOpenRef.current = true;
            setShowSubscriptionModal(true);
          }
        }, 800);
        return () => clearTimeout(timer);
      } else if (!showSubscriptionModal) {
        // Si el login modal ya se cerró y no hay modal de suscripción abierto, mostrar planes
        const timer = setTimeout(() => {
          modalOpenRef.current = true;
          setShowSubscriptionModal(true);
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, token, pendingPremiumNews, showLoginModal, showSubscriptionModal]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)',
      padding: '2rem 0',
      color: '#fff'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        {/* Botón Volver al Menú Principal */}
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '25px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
            }}
          >
            ← Volver al Menú Principal
          </button>
        </div>

        {/* Header Premium */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem',
          padding: '2rem',
          background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)',
          borderRadius: '20px',
          border: '2px solid rgba(255, 215, 0, 0.3)'
        }}>
          <h1 style={{
            fontSize: '3rem',
            margin: '0 0 1rem 0',
            background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}>
            ⭐ Noticias Premium
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#ccc', margin: '0' }}>
            Contenido exclusivo de alto impacto y análisis profundo
          </p>
          {!hasActiveSubscription && (
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: 'rgba(255, 215, 0, 0.1)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 215, 0, 0.3)'
            }}>
              <p style={{ margin: '0 0 1rem 0', color: '#ffd700' }}>
                🔒 Suscríbete para acceder a todo el contenido premium
              </p>
              <button
                onClick={() => {
                  setPendingPremiumNews(null); // No hay noticia específica, solo ver planes
                  modalOpenRef.current = true;
                  setShowSubscriptionModal(true);
                }}
                style={{
                  padding: '0.75rem 2rem',
                  background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                  color: '#000',
                  border: 'none',
                  borderRadius: '25px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                Ver Planes Premium
              </button>
            </div>
          )}
        </div>

        {/* Grid de Noticias Premium */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#ffd700' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <div>Cargando noticias premium...</div>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#ff6b6b' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
            <div>{error}</div>
          </div>
        ) : premiumNews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#ccc' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📰</div>
            <div>No hay noticias premium disponibles en este momento</div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {premiumNews.map((noticia) => (
              <div
                key={noticia.id}
                onClick={() => handleNewsClick(noticia)}
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 215, 0, 0.03) 100%)',
                  border: '2px solid rgba(255, 215, 0, 0.4)',
                  borderRadius: '18px',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(255, 215, 0, 0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(255, 215, 0, 0.4)';
                  e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 215, 0, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.4)';
                }}
              >
                {/* Badge Premium */}
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                  color: '#000',
                  padding: '0.5rem 1rem',
                  borderRadius: '25px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 15px rgba(255, 215, 0, 0.6)',
                  zIndex: 5,
                  border: '2px solid rgba(0, 0, 0, 0.1)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  ⭐ PREMIUM
                </div>

                {/* Imagen - Mejorada */}
                {noticia.imagen_url && (
                  <div style={{
                    width: '100%',
                    height: '220px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <img
                      src={noticia.imagen_url}
                      alt={noticia.titulo}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    />
                    {/* Overlay sutil en la imagen */}
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '60px',
                      background: 'linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, transparent 100%)'
                    }} />
                  </div>
                )}

                {/* Contenido */}
                <div style={{ 
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  position: 'relative'
                }}>
                  {/* Título - Mejorado */}
                  <h3 style={{
                    color: '#ffd700',
                    margin: '0 0 1rem 0',
                    fontSize: '1.3rem',
                    fontWeight: '700',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    minHeight: '4.2rem',
                    flexShrink: 0
                  }}>
                    {noticia.titulo}
                  </h3>

                  {/* Spacer para empujar el contenido hacia abajo */}
                  <div style={{ flex: 1 }} />

                  {/* Categoría y Fecha - Mejorado */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.85rem',
                    color: '#ccc',
                    paddingTop: '1rem',
                    paddingBottom: (!userIsAuthenticated || !hasActiveSubscription) ? '4rem' : '0',
                    borderTop: '1px solid rgba(255, 215, 0, 0.2)',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    flexShrink: 0
                  }}>
                    <span style={{
                      background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.25) 0%, rgba(255, 215, 0, 0.15) 100%)',
                      padding: '0.4rem 1rem',
                      borderRadius: '20px',
                      color: '#ffd700',
                      fontWeight: '600',
                      border: '1px solid rgba(255, 215, 0, 0.3)',
                      whiteSpace: 'nowrap'
                    }}>
                      {noticia.categoria}
                    </span>
                    {noticia.fecha_publicacion && (
                      <span style={{
                        color: '#aaa',
                        fontSize: '0.8rem',
                        whiteSpace: 'nowrap'
                      }}>
                        {new Date(noticia.fecha_publicacion).toLocaleDateString('es-ES', { 
                          day: 'numeric', 
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    )}
                  </div>

                  {/* Badge de suscripción requerida - siempre en la misma posición */}
                  {(!userIsAuthenticated || !hasActiveSubscription) && (
                    <div style={{
                      position: 'absolute',
                      bottom: '1rem',
                      left: '1.5rem',
                      right: '1.5rem',
                      background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.95) 0%, rgba(255, 71, 87, 0.95) 100%)',
                      color: 'white',
                      padding: '0.6rem 1rem',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 15px rgba(255, 107, 107, 0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      pointerEvents: 'none',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      textAlign: 'center',
                      flexShrink: 0
                    }}>
                      <span>🔒</span>
                      <span>Suscríbete para leer</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Login (para noticias premium) */}
      {showLoginModal && (
        <LoginModal
          onClose={() => {
            setShowLoginModal(false);
            loginModalShownForPremiumRef.current = false;
            // Si cierra sin loguearse, limpiar la noticia pendiente
            if (!isAuthenticated()) {
              setPendingPremiumNews(null);
            }
          }}
          onSwitchToRegister={() => {
            // Mantener la noticia pendiente al cambiar a registro
            setShowLoginModal(false);
            loginModalShownForPremiumRef.current = false;
            // El registro también manejará la noticia pendiente
          }}
          skipRedirect={true}
          onLoginSuccess={() => {
            // Cuando el login es exitoso, el efecto detectará el cambio y mostrará el modal de suscripción
            console.log('Login exitoso desde noticia premium, noticia pendiente:', pendingPremiumNews);
            // El efecto se ejecutará automáticamente cuando isAuthenticated y token cambien
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
            setPendingPremiumNews(null);
            if (token) {
              refreshSubscription(token);
            }
            fetchPremiumNews();
            // Si hay una noticia pendiente y ahora tiene suscripción, navegar a ella
            if (pendingPremiumNews) {
              navigate(`/noticia/${pendingPremiumNews.id}`);
            }
          }}
        />
      )}
    </div>
  );
}

// Componente para la vista principal
function MainView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, token, subscription, fetchSubscriptionStatus, refreshSubscription } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('noticias');
  const [subscriptionNotification, setSubscriptionNotification] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const notificationCheckedRef = useRef(false);
  const [noticias, setNoticias] = useState([]);
  const [fechasDisponibles, setFechasDisponibles] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [mostrarCategorias, setMostrarCategorias] = useState(false);
  const [diarioFiltro, setDiarioFiltro] = useState(null);
  const [geographicFilter, setGeographicFilter] = useState(null);
  const [mostrarDiarios, setMostrarDiarios] = useState(false);
  const [dateFilter, setDateFilter] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonthInYear, setSelectedMonthInYear] = useState(null);
  const [dateFilterLevel, setDateFilterLevel] = useState('year'); // 'year', 'month', 'day'
  const [categoriasDisponibles, setCategoriasDisponibles] = useState([]);
  const [noticiasRelevantes, setNoticiasRelevantes] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [comparisonError, setComparisonError] = useState(null);
  const hasActiveSubscription = subscription?.estado === 'active';
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [pendingPremiumNews, setPendingPremiumNews] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Ref para evitar que el modal se cierre automáticamente
  const modalOpenRef = useRef(false);
  
  // Estado de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const NEWS_PER_PAGE = 20; // Número óptimo de noticias por página

  // Verificar estado de suscripción al loguearse
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (isAuthenticated() && token && !notificationCheckedRef.current) {
        notificationCheckedRef.current = true;
        try {
          const status = await fetchSubscriptionStatus(token);
          if (status) {
            if (status.has_active && status.active_subscription) {
              // Usuario tiene suscripción activa recién aprobada
              const planNombre = status.active_subscription.plan?.nombre || 'Premium';
              setSubscriptionNotification({
                type: 'success',
                title: `¡Tu cuenta ahora pertenece al Plan ${planNombre}!`,
                message: 'Ya puedes acceder a todas las noticias premium.',
                show: true
              });
              setShowNotification(true);
              await refreshSubscription();
            } else if (status.has_rejected && status.rejected_subscription) {
              // Usuario tiene suscripción rechazada
              setSubscriptionNotification({
                type: 'error',
                title: 'Tu Actualización premium ha sido rechazada',
                message: `Motivo: ${status.rejected_subscription.motivo_rechazo}`,
                show: true
              });
              setShowNotification(true);
            }
          }
        } catch (error) {
          console.error('Error verificando estado de suscripción:', error);
        }
      }
    };
    
    checkSubscriptionStatus();
  }, [isAuthenticated, token, fetchSubscriptionStatus, refreshSubscription]);

  // Resetear el ref cuando el usuario cierra sesión
  useEffect(() => {
    if (!isAuthenticated()) {
      notificationCheckedRef.current = false;
      setShowNotification(false);
      setSubscriptionNotification(null);
    }
  }, [isAuthenticated]);

  // Ref para rastrear si acabamos de mostrar el login modal para una noticia premium
  const loginModalShownForPremiumRef = useRef(false);

  // Cuando el usuario se loguea después de hacer click en noticia premium, mostrar planes
  useEffect(() => {
    // Verificar si el usuario se acaba de loguear y hay una noticia premium pendiente
    if (isAuthenticated() && token && pendingPremiumNews && !showSubscriptionModal) {
      // Si mostramos el login modal para esta noticia premium, esperar a que se cierre
      if (loginModalShownForPremiumRef.current) {
        // El modal de login se cerrará automáticamente después del login exitoso (800ms)
        // Esperamos un poco más para asegurar que se cerró completamente
        const timer = setTimeout(() => {
          setShowLoginModal(false);
          loginModalShownForPremiumRef.current = false;
          modalOpenRef.current = true;
          setShowSubscriptionModal(true);
        }, 1000); // 800ms del login + 200ms de margen
        return () => clearTimeout(timer);
      } else if (!showLoginModal) {
        // Si el login modal ya se cerró y no hay modal de suscripción abierto, mostrar planes directamente
        const timer = setTimeout(() => {
          modalOpenRef.current = true;
          setShowSubscriptionModal(true);
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, token, pendingPremiumNews, showLoginModal, showSubscriptionModal]);

  const openSubscriptionModal = (news) => {
    setPendingPremiumNews(news || null);
    setShowSubscriptionModal(true);
  };

  const closeSubscriptionModal = () => {
    setPendingPremiumNews(null);
    setShowSubscriptionModal(false);
  };

  const handleNoticiaClick = async (noticia) => {
    // Si es una noticia premium, manejar el flujo de suscripción
    if (noticia?.es_premium) {
      console.log('Click en noticia premium:', noticia.titulo);
      
      // Si no está autenticado, mostrar modal de login primero
      if (!isAuthenticated()) {
        console.log('Usuario no autenticado, mostrando modal de login');
        setPendingPremiumNews(noticia);
        loginModalShownForPremiumRef.current = true; // Marcar que mostramos login para premium
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
            navigate(`/noticia/${noticia.id}`);
            return;
          } else {
            console.log('Usuario no tiene suscripción activa, mostrando planes');
          }
        } catch (err) {
          console.error('Error verificando suscripción:', err);
          // En caso de error, mostrar planes de todos modos
        }
      }
      
      // No tiene suscripción activa, mostrar planes de suscripción
      console.log('Mostrando modal de suscripción');
      setPendingPremiumNews(noticia);
      modalOpenRef.current = true;
      setShowSubscriptionModal(true);
      return;
    }
    
    // Si no es premium, navegar directamente
    navigate(`/noticia/${noticia.id}`);
  };

  const getPremiumStyle = (noticia) => {
    // No aplicar filtros para que las imágenes y títulos se vean claramente
    // El overlay premium ya indica que es contenido exclusivo
    return undefined;
  };

  const renderPremiumIndicators = (noticia) => {
    if (!noticia?.es_premium) return null;
    const locked = !hasActiveSubscription;
    return (
      <>
        <PremiumBadge>⭐ Premium</PremiumBadge>
        {locked && (
          <PremiumOverlay>
            <div>
              <FiLock style={{ fontSize: '1.4rem', marginBottom: '0.3rem' }} />
              <div>🔒 Suscríbete para leer</div>
              <small>Haz clic para ver los planes</small>
            </div>
          </PremiumOverlay>
        )}
      </>
    );
  };

  const fetchComparisonData = useCallback(async (diasVentana = 2) => {
    setComparisonLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/scraping/comparacion-diarios-redes?dias=${diasVentana}&limite=60`);
      setComparisonData(response.data);
      setComparisonError(null);
    } catch (error) {
      console.error('Error fetching comparación diarios vs redes:', error);
      setComparisonError('No se pudo cargar la comparación entre redes sociales y diarios.');
    } finally {
      setComparisonLoading(false);
    }
  }, []);

  // Función para procesar fechas de manera jerárquica
  const processHierarchicalDates = (fechas) => {
    const years = {};
    
    fechas.forEach(fecha => {
      const date = new Date(fecha.fecha);
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // 0-indexed to 1-indexed
      const day = date.getDate();
      
      if (!years[year]) {
        years[year] = {
          year: year,
          months: {},
          totalNoticias: 0
        };
      }
      
      if (!years[year].months[month]) {
        years[year].months[month] = {
          month: month,
          monthName: date.toLocaleDateString('es-ES', { month: 'long' }),
          days: {},
          totalNoticias: 0
        };
      }
      
      if (!years[year].months[month].days[day]) {
        years[year].months[month].days[day] = {
          day: day,
          date: fecha.fecha,
          fecha_formateada: fecha.fecha_formateada,
          totalNoticias: fecha.total_noticias
        };
      }
      
      years[year].totalNoticias += fecha.total_noticias;
      years[year].months[month].totalNoticias += fecha.total_noticias;
    });
    
    return years;
  };

  // Obtener años disponibles
  const getAvailableYears = () => {
    const hierarchicalDates = processHierarchicalDates(fechasDisponibles);
    return Object.values(hierarchicalDates).sort((a, b) => b.year - a.year);
  };

  // Obtener meses disponibles para un año
  const getAvailableMonths = (year) => {
    const hierarchicalDates = processHierarchicalDates(fechasDisponibles);
    const yearData = hierarchicalDates[year];
    if (!yearData) return [];
    
    return Object.values(yearData.months).sort((a, b) => b.month - a.month);
  };

  // Obtener días disponibles para un año y mes
  const getAvailableDays = (year, month) => {
    const hierarchicalDates = processHierarchicalDates(fechasDisponibles);
    const yearData = hierarchicalDates[year];
    if (!yearData || !yearData.months[month]) return [];
    
    return Object.values(yearData.months[month].days).sort((a, b) => b.day - a.day);
  };

  // Función para obtener el texto del botón según la selección actual
  const getDateFilterButtonText = () => {
    if (selectedDate) {
      const date = new Date(selectedDate);
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    } else if (selectedMonthInYear && selectedYear) {
      const date = new Date(selectedYear, selectedMonthInYear - 1);
      return date.toLocaleDateString('es-ES', { 
        month: 'long', 
        year: 'numeric' 
      });
    } else if (selectedYear) {
      return selectedYear.toString();
    }
    return 'Filtrar por fecha';
  };

  // Función para obtener el número de noticias según la selección actual
  const getDateFilterCount = () => {
    if (selectedDate) {
      const fecha = fechasDisponibles.find(f => f.fecha === selectedDate);
      return fecha ? fecha.total_noticias : 0;
    } else if (selectedMonthInYear && selectedYear) {
      const months = getAvailableMonths(selectedYear);
      const month = months.find(m => m.month === selectedMonthInYear);
      return month ? month.totalNoticias : 0;
    } else if (selectedYear) {
      const years = getAvailableYears();
      const year = years.find(y => y.year === selectedYear);
      return year ? year.totalNoticias : 0;
    }
    return noticias.length;
  };

  useEffect(() => {
      fetchFechasDisponibles();
      fetchCategoriasDisponibles();
      fetchNoticiasRelevantes(); // Cargar noticias relevantes al inicio
      fetchTodasLasNoticias(); // Cargar todas las noticias para el filtro de fechas
      fetchComparisonData();
  }, [fetchComparisonData]);

  // Efecto para recargar noticias cuando cambian los filtros
  useEffect(() => {
    if (categoriaSeleccionada || diarioFiltro || geographicFilter) {
      fetchNoticiasConFiltros();
    }
    // Removido el else para no sobrescribir las noticias cargadas por fetchTodasLasNoticias
  }, [categoriaSeleccionada, diarioFiltro, geographicFilter]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mostrarCategorias && !event.target.closest('.categoria-dropdown')) {
        setMostrarCategorias(false);
      }
      if (mostrarDiarios && !event.target.closest('.diario-dropdown')) {
        setMostrarDiarios(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mostrarCategorias, mostrarDiarios]);

  useEffect(() => {
    if (fechasDisponibles.length > 0 && !fechaSeleccionada) {
      setFechaSeleccionada(fechasDisponibles[0].fecha);
    }
  }, [fechasDisponibles]);

  useEffect(() => {
    if (fechaSeleccionada) {
      fetchNoticiasPorFecha(fechaSeleccionada);
    }
  }, [fechaSeleccionada]);

  const fetchFechasDisponibles = async () => {
    try {
      const response = await axios.get('http://localhost:8000/noticias/fechas-disponibles');
      setFechasDisponibles(response.data.fechas);
    } catch (error) {
      console.error('Error fetching fechas:', error);
      setError('Error al cargar las fechas disponibles');
    }
  };

  const fetchCategoriasDisponibles = async () => {
    try {
      const response = await axios.get('http://localhost:8000/categorias-disponibles');
      setCategoriasDisponibles(response.data.categorias);
    } catch (error) {
      console.error('Error fetching categorias:', error);
      setError('Error al cargar las categorías disponibles');
    }
  };

  const fetchNoticiasPorFecha = async (fecha) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/noticias/por-fecha?fecha=${fecha}`);
      setNoticias(response.data);
      setError(null);
      // También obtener noticias relevantes de días anteriores
      fetchNoticiasRelevantes(fecha);
    } catch (error) {
      console.error('Error fetching noticias:', error);
      setError('Error al cargar las noticias');
    } finally {
      setLoading(false);
    }
  };

  const fetchNoticiasConFiltros = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (categoriaSeleccionada) {
        params.append('categoria', categoriaSeleccionada);
      }
      
      if (diarioFiltro) {
        params.append('diario', diarioFiltro);
      }
      
      if (geographicFilter) {
        params.append('geographic_type', geographicFilter);
      }
      
      params.append('limit', '100');
      
      const response = await axios.get(`http://localhost:8000/noticias?${params.toString()}`);
      setNoticias(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching noticias:', error);
      setError('Error al cargar las noticias');
    } finally {
      setLoading(false);
    }
  };

  const fetchNoticiasRelevantes = async (fechaExcluir = null) => {
    try {
      const params = new URLSearchParams({
        dias: '7',
        limit: '12'
      });
      
      if (fechaExcluir) {
        params.append('excluir_fecha', fechaExcluir);
      }
      
      const response = await axios.get(`http://localhost:8000/noticias/relevantes-anteriores?${params}`);
      setNoticiasRelevantes(response.data);
    } catch (error) {
      console.error('Error fetching noticias relevantes:', error);
      // No mostrar error aquí para no interferir con la carga principal
    }
  };

  const fetchTodasLasNoticias = async () => {
    try {
      console.log('🔄 Cargando todas las noticias para el filtro de fechas...');
      // Cargar todas las noticias sin filtros para el filtro de fechas
      const response = await axios.get('http://localhost:8000/noticias?limit=2000');
      console.log(`✅ Noticias cargadas: ${response.data.length}`);
      setNoticias(response.data);
    } catch (error) {
      console.error('❌ Error fetching todas las noticias:', error);
    }
  };

  const handleRefresh = () => {
    if (fechaSeleccionada) {
      fetchNoticiasPorFecha(fechaSeleccionada);
    }
    fetchComparisonData();
  };

  const handleDiarioFilter = (diario) => {
    if (diario === 'todos') {
      navigate('/');
    } else {
      // Navegar a la ruta específica del diario
      let rutaDiario;
      if (diario === 'CNN en Español') {
        rutaDiario = 'cnn-en-español';
      } else {
        rutaDiario = diario.toLowerCase().replace(/\s+/g, '-');
      }
      navigate(`/diario/${rutaDiario}`);
    }
  };

  const handleComparativa = () => {
    navigate('/comparativa');
  };

  const handleBackToGeneral = () => {
    navigate('/');
  };

  const handleCategoriaFilter = (categoria) => {
    if (categoria === 'todas') {
      setCategoriaSeleccionada(null);
    } else {
      setCategoriaSeleccionada(categoria);
    }
    setMostrarCategorias(false);
  };

  const handleDiarioFiltro = (diario) => {
    if (diario === 'todos') {
      setDiarioFiltro(null);
    } else {
      setDiarioFiltro(diario);
    }
    setMostrarDiarios(false);
  };

  const toggleMostrarDiarios = () => {
    setMostrarDiarios(!mostrarDiarios);
  };

  const handleDateFilter = (date, filteredNews, monthData) => {
    if (date) {
      // Filtro por fecha específica
      setSelectedDate(date);
      setSelectedMonth(null);
      setDateFilter(filteredNews);
    } else if (monthData) {
      // Filtro por mes completo
      setSelectedMonth(monthData.key);
      setSelectedDate(null);
      setDateFilter(filteredNews);
    } else {
      // Limpiar filtros
      setSelectedDate(null);
      setSelectedMonth(null);
      setDateFilter(null);
    }
  };

  const toggleMostrarCategorias = () => {
    setMostrarCategorias(!mostrarCategorias);
  };

  // Las categorías se cargan desde el endpoint /categorias-disponibles

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    // Verificar si la fecha tiene hora válida (no es 00:00:00)
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    // Si la hora es 00:00, puede que no tenga hora específica
    if (hours === 0 && minutes === 0) {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit'
      });
    }
    
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Hoy';
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays <= 7) {
      return `Hace ${diffDays} días`;
    } else {
      return formatDate(dateString);
    }
  };

  // Filtrar noticias por categoría, diario y fecha si están seleccionados
  let noticiasAMostrar = dateFilter || noticias;
  
  if (categoriaSeleccionada) {
    noticiasAMostrar = noticiasAMostrar.filter(noticia => noticia.categoria === categoriaSeleccionada);
  }
  
  if (diarioFiltro) {
    noticiasAMostrar = noticiasAMostrar.filter(noticia => 
      noticia.diario === diarioFiltro || 
      noticia.diario_nombre === diarioFiltro ||
      noticia.nombre_diario === diarioFiltro
    );
  }

  // Ordenar noticias: primero las que tienen imagen, luego las que no tienen
  noticiasAMostrar = noticiasAMostrar.sort((a, b) => {
    const aTieneImagen = a.imagen_url && a.imagen_url.trim() !== '';
    const bTieneImagen = b.imagen_url && b.imagen_url.trim() !== '';
    
    // Si ambas tienen imagen o ambas no tienen imagen, mantener orden original
    if (aTieneImagen === bTieneImagen) {
      return 0;
    }
    
    // Si a tiene imagen y b no, a va primero
    if (aTieneImagen && !bTieneImagen) {
      return -1;
    }
    
    // Si b tiene imagen y a no, b va primero
    return 1;
  });

  // Separar noticias con y sin imagen MANTENIENDO EL TOTAL
  const noticiasConImagen = noticiasAMostrar.filter(noticia => 
    noticia.imagen_url && noticia.imagen_url.trim() !== ''
  );
  
  const noticiasSinImagen = noticiasAMostrar.filter(noticia => 
    !noticia.imagen_url || noticia.imagen_url.trim() === ''
  );

  // Obtener noticia principal (primera con imagen, o primera de todas si no hay imágenes)
  const noticiaPrincipal = noticiasConImagen.length > 0 ? noticiasConImagen[0] : 
                          (noticiasAMostrar.length > 0 ? noticiasAMostrar[0] : null);
  
  // Para el grid secundario: usar TODAS las noticias restantes (con y sin imagen)
  // Si hay noticia principal con imagen, quitar esa del array
  const allNoticiasSecundarias = noticiaPrincipal && noticiasConImagen.length > 0 
    ? noticiasAMostrar.filter(n => n.id !== noticiaPrincipal.id)
    : noticiasAMostrar.slice(1);
  
  // Calcular paginación
  const totalPages = Math.max(1, Math.ceil(allNoticiasSecundarias.length / NEWS_PER_PAGE));
  const startIndex = (currentPage - 1) * NEWS_PER_PAGE;
  const endIndex = startIndex + NEWS_PER_PAGE;
  const noticiasSecundarias = allNoticiasSecundarias.slice(startIndex, endIndex);
  
  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [categoriaSeleccionada, diarioFiltro, geographicFilter, fechaSeleccionada]);


  return (
    <Container>
      {/* Notificación de estado de suscripción */}
      {showNotification && subscriptionNotification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 10000,
          background: subscriptionNotification.type === 'success' 
            ? 'linear-gradient(135deg, #51cf66 0%, #2f9e44 100%)'
            : 'linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%)',
          color: 'white',
          padding: '1.5rem 2rem',
          borderRadius: '16px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
          maxWidth: '450px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <style>{`
            @keyframes slideIn {
              from {
                transform: translateX(100%);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
          `}</style>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1rem'
          }}>
            <div style={{ flex: 1 }}>
              <h3 style={{
                margin: '0 0 0.5rem 0',
                fontSize: '1.2rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {subscriptionNotification.type === 'success' ? '✅' : '❌'}
                {subscriptionNotification.title}
              </h3>
              <p style={{
                margin: 0,
                fontSize: '0.95rem',
                opacity: 0.95,
                lineHeight: '1.5'
              }}>
                {subscriptionNotification.message}
              </p>
            </div>
            <button
              onClick={() => {
                setShowNotification(false);
                setSubscriptionNotification(null);
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0.25rem 0.5rem',
                borderRadius: '8px',
                lineHeight: 1,
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            >
              ×
            </button>
          </div>
          <button
            onClick={() => {
              setShowNotification(false);
              setSubscriptionNotification(null);
            }}
            style={{
              marginTop: '1rem',
              width: '100%',
              padding: '0.75rem',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            Continuar
          </button>
        </div>
      )}
        <Header $theme={theme}>
        <HeaderContent>
          <HeaderLeft>
            <Title>Diarios Peruanos</Title>
            <Subtitle>Plataforma de noticias con Web Scraping</Subtitle>
          </HeaderLeft>
          <HeaderRight>
            <ThemeToggleButton onClick={toggleTheme}>
              {theme === 'dark' ? <FiSun /> : <FiMoon />}
              {theme === 'dark' ? 'Modo Día' : 'Modo Noche'}
            </ThemeToggleButton>
            <AuthNavbar />
          </HeaderRight>
        </HeaderContent>
        <HeaderContent>
          <Navigation>
            {/* Primera fila - 6 botones principales */}
            <NavButton 
              active={location.pathname === '/'}
              onClick={() => navigate('/')}
            >
              <FiFileText />
              Noticias
            </NavButton>
            <NavButton 
              active={location.pathname === '/trending'}
              onClick={() => navigate('/trending')}
            >
              <FiTrendingUp />
              Trending
            </NavButton>
            <NavButton 
              active={location.pathname === '/buscar'}
              onClick={() => navigate('/buscar')}
            >
              <FiSearch />
              Búsqueda
            </NavButton>
            <NavButton 
              active={location.pathname === '/analytics'}
              onClick={() => navigate('/analytics')}
            >
              <FiPieChart />
              Analytics
            </NavButton>
            <NavButton 
              active={location.pathname === '/alertas'}
              onClick={() => navigate('/alertas')}
            >
              <FiAlertTriangle />
              Alertas
            </NavButton>
            <NavButton 
              active={location.pathname === '/comparativa'}
              onClick={() => navigate('/comparativa')}
            >
              <FiBarChart2 />
              Comparativa
            </NavButton>
            {/* Segunda fila - 4 botones adicionales */}
            <NavButton 
              active={location.pathname === '/filtro-fechas'}
              onClick={() => navigate('/filtro-fechas')}
            >
              <FiCalendar />
              Filtro Fechas
            </NavButton>
            <NavButton 
              active={location.pathname === '/comunidad'}
              onClick={() => navigate('/comunidad')}
              style={{
                background: location.pathname === '/comunidad' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                  : 'transparent',
                border: location.pathname === '/comunidad'
                  ? '2px solid #667eea'
                  : 'var(--border-color)',
                position: 'relative'
              }}
            >
              🌐 COMUNIDAD
              <span style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                padding: '0.2rem 0.5rem',
                borderRadius: '10px',
                fontSize: '0.7rem',
                fontWeight: '700',
                marginLeft: '0.5rem',
                boxShadow: '0 2px 8px rgba(245, 87, 108, 0.4)'
              }}>
                NUEVO!
              </span>
            </NavButton>
            <NavButton 
              active={location.pathname === '/noticias-unificadas'}
              onClick={() => navigate('/noticias-unificadas')}
              style={{
                background: location.pathname === '/noticias-unificadas'
                  ? 'linear-gradient(135deg, #2d8f47 0%, #1e6b35 100%)'
                  : 'transparent',
                border: location.pathname === '/noticias-unificadas'
                  ? '2px solid #2d8f47'
                  : 'var(--border-color)',
                position: 'relative'
              }}
            >
              <FiRadio />
              Noticias Unificadas
              <span style={{
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                color: 'white',
                padding: '0.2rem 0.5rem',
                borderRadius: '10px',
                fontSize: '0.7rem',
                fontWeight: '700',
                marginLeft: '0.5rem',
                boxShadow: '0 2px 8px rgba(40, 167, 69, 0.4)'
              }}>
                FUSIÓN
              </span>
            </NavButton>
            <NavButton 
              active={location.pathname === '/redes-sociales'}
              onClick={() => navigate('/redes-sociales')}
              style={{
                background: location.pathname === '/redes-sociales'
                  ? 'linear-gradient(135deg, #1da1f2 0%, #0084ff 100%)'
                  : 'transparent',
                border: location.pathname === '/redes-sociales'
                  ? '2px solid #1da1f2'
                  : 'var(--border-color)',
                position: 'relative'
              }}
            >
              <FiShare2 />
              Redes Sociales
              <span style={{
                background: 'linear-gradient(135deg, #1da1f2 0%, #0084ff 100%)',
                color: 'white',
                padding: '0.2rem 0.5rem',
                borderRadius: '10px',
                fontSize: '0.7rem',
                fontWeight: '700',
                marginLeft: '0.5rem',
                boxShadow: '0 2px 8px rgba(29, 161, 242, 0.4)'
              }}>
                NUEVO!
              </span>
            </NavButton>
          </Navigation>
        </HeaderContent>
      </Header>

      <FiltersSection>
        <FiltersContent>
          <FilterGroup>
            <CategoriaDropdown className="categoria-dropdown">
              <FilterButton onClick={toggleMostrarCategorias}>
                <FiFilter />
                {categoriaSeleccionada || 'Todas las categorías'}
              </FilterButton>
              {mostrarCategorias && (
                <CategoriaDropdownContent>
                  <CategoriaOption 
                    className={!categoriaSeleccionada ? 'active' : ''}
                    onClick={() => handleCategoriaFilter('todas')}
                  >
                    Todas las categorías
                  </CategoriaOption>
                  {categoriasDisponibles.map((categoria) => (
                    <CategoriaOption 
                      key={categoria}
                      className={categoriaSeleccionada === categoria ? 'active' : ''}
                      onClick={() => handleCategoriaFilter(categoria)}
                    >
                      {categoria}
                    </CategoriaOption>
                  ))}
                </CategoriaDropdownContent>
              )}
            </CategoriaDropdown>
            
            {/* Dropdown de Diarios para filtro combinado */}
            <CategoriaDropdown className="diario-dropdown">
              <FilterButton onClick={toggleMostrarDiarios}>
                <FiFilter />
                {diarioFiltro || 'Todos los diarios'}
              </FilterButton>
              {mostrarDiarios && (
                <CategoriaDropdownContent>
                  <CategoriaOption 
                    className={!diarioFiltro ? 'active' : ''}
                    onClick={() => handleDiarioFiltro('todos')}
                  >
                    Todos los diarios
                  </CategoriaOption>
                  <CategoriaOption 
                    className={diarioFiltro === 'El Comercio' ? 'active' : ''}
                    onClick={() => handleDiarioFiltro('El Comercio')}
                  >
                    El Comercio
                  </CategoriaOption>
                  <CategoriaOption 
                    className={diarioFiltro === 'Diario Correo' ? 'active' : ''}
                    onClick={() => handleDiarioFiltro('Diario Correo')}
                  >
                    Diario Correo
                  </CategoriaOption>
                  <CategoriaOption 
                    className={diarioFiltro === 'El Popular' ? 'active' : ''}
                    onClick={() => handleDiarioFiltro('El Popular')}
                  >
                    El Popular
                  </CategoriaOption>
                  <CategoriaOption 
                    className={diarioFiltro === 'CNN en Español' ? 'active' : ''}
                    onClick={() => handleDiarioFiltro('CNN en Español')}
                  >
                    CNN en Español
                  </CategoriaOption>
                </CategoriaDropdownContent>
              )}
            </CategoriaDropdown>
            
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ 
                fontSize: '0.9rem', 
                color: 'var(--text-secondary)', 
                fontWeight: '600' 
              }}>
                Navegar a:
              </span>
              <DiarioFilterButton 
                active={location.pathname === '/'}
                onClick={() => handleDiarioFilter('todos')}
              >
                Todos
              </DiarioFilterButton>
              <DiarioFilterButton 
                active={location.pathname === '/diario/el-comercio'}
                onClick={() => handleDiarioFilter('El Comercio')}
              >
                El Comercio
              </DiarioFilterButton>
              <DiarioFilterButton 
                active={location.pathname === '/diario/diario-correo'}
                onClick={() => handleDiarioFilter('Diario Correo')}
              >
                Diario Correo
              </DiarioFilterButton>
              <DiarioFilterButton 
                active={location.pathname === '/diario/el-popular'}
                onClick={() => handleDiarioFilter('El Popular')}
              >
                El Popular
              </DiarioFilterButton>
              <DiarioFilterButton 
                active={location.pathname === '/diario/cnn-en-español'}
                onClick={() => handleDiarioFilter('CNN en Español')}
              >
                CNN Español
              </DiarioFilterButton>
              <DiarioFilterButton 
                active={location.pathname === '/premium'}
                onClick={() => navigate('/premium')}
                style={{
                  background: location.pathname === '/premium' 
                    ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' 
                    : 'var(--card-bg)',
                  color: '#ffd700',
                  border: '2px solid #ffd700',
                  fontWeight: 'bold',
                  boxShadow: location.pathname === '/premium' 
                    ? '0 4px 15px rgba(255, 215, 0, 0.4)' 
                    : 'none'
                }}
              >
                ⭐ Premium
              </DiarioFilterButton>
            </div>
          </FilterGroup>
          

        </FiltersContent>
      </FiltersSection>

      {/* Barra de herramientas con filtros y acciones */}
      <div style={{
        background: 'var(--bg-tertiary)',
        borderBottom: '1px solid var(--border-color)',
        padding: '1rem 0',
        marginBottom: '1rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          {/* Filtro de fecha compacto con dropdown */}
          <div style={{ position: 'relative' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'var(--card-bg)',
              borderRadius: '25px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              minWidth: '200px',
              color: 'var(--text-primary)'
            }}
            onClick={() => {
              if (showDateDropdown) {
                // Si se está cerrando, resetear al nivel de año
                setDateFilterLevel('year');
                setSelectedYear(null);
                setSelectedMonthInYear(null);
                setSelectedDate(null);
              }
              setShowDateDropdown(!showDateDropdown);
            }}
            onMouseEnter={(e) => {
              if (theme === 'dark') {
                e.currentTarget.style.borderColor = 'rgba(97, 218, 251, 0.5)';
                e.currentTarget.style.color = 'var(--filter-text-hover)';
              } else {
                e.currentTarget.style.borderColor = '#6f42c1';
                e.currentTarget.style.color = '#6f42c1';
              }
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.color = theme === 'dark' ? 'var(--filter-text-color)' : 'var(--text-primary)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            }}
            >
              <FiCalendar style={{ color: theme === 'dark' ? 'var(--filter-text-color)' : '#6f42c1', fontSize: '1.1rem' }} />
              <span style={{ fontSize: '0.9rem', fontWeight: '600', color: theme === 'dark' ? 'var(--filter-text-color)' : 'var(--text-primary)' }}>
                {getDateFilterButtonText()}
              </span>
              <span style={{ 
                fontSize: '0.8rem', 
                color: 'var(--text-secondary)',
                background: 'var(--bg-tertiary)',
                padding: '2px 6px',
                borderRadius: '10px'
              }}>
                {getDateFilterCount()} noticias
              </span>
              <FiChevronDown style={{ 
                color: theme === 'dark' ? 'var(--filter-text-color)' : '#6f42c1', 
                fontSize: '0.9rem',
                transform: showDateDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }} />
            </div>

            {/* Dropdown jerárquico de fechas */}
            {showDateDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '0',
                right: '0',
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                boxShadow: '0 8px 25px -8px rgba(0, 0, 0, 0.2)',
                marginTop: '8px',
                zIndex: 1000,
                maxHeight: '300px',
                overflowY: 'auto',
                minWidth: '250px'
              }}>
                <div style={{ padding: '8px' }}>
                  {/* Breadcrumb */}
                  <div style={{
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    color: theme === 'dark' ? 'var(--filter-text-color)' : '#6f42c1',
                    padding: '6px 8px',
                    borderBottom: theme === 'dark' 
                      ? '1px solid rgba(255, 255, 255, 0.1)' 
                      : '1px solid #f3f4f6',
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {dateFilterLevel === 'year' && 'Seleccionar año:'}
                    {dateFilterLevel === 'month' && `Año ${selectedYear} - Seleccionar mes:`}
                    {dateFilterLevel === 'day' && `${selectedYear} - ${new Date(selectedYear, selectedMonthInYear - 1).toLocaleDateString('es-ES', { month: 'long' })} - Seleccionar día:`}
                  </div>

                  {/* Botón de regreso */}
                  {dateFilterLevel !== 'year' && (
                    <div
                      onClick={() => {
                        if (dateFilterLevel === 'day') {
                          setDateFilterLevel('month');
                          setSelectedDate(null);
                        } else if (dateFilterLevel === 'month') {
                          setDateFilterLevel('year');
                          setSelectedMonthInYear(null);
                        }
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8f9fa',
                        border: theme === 'dark' 
                          ? '1px solid rgba(255, 255, 255, 0.2)' 
                          : '1px solid #e9ecef',
                        marginBottom: '4px',
                        fontSize: '0.8rem',
                        color: theme === 'dark' ? 'var(--filter-text-color)' : '#6c757d'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = theme === 'dark' ? '#2a2a2a' : '#e9ecef';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = theme === 'dark' ? '#1a1a1a' : '#f8f9fa';
                      }}
                    >
                      ← Volver
                    </div>
                  )}

                  {/* Contenido según el nivel */}
                  {dateFilterLevel === 'year' && getAvailableYears().map((year) => (
                    <div
                      key={year.year}
                      onClick={() => {
                        setSelectedYear(year.year);
                        setDateFilterLevel('month');
                        setSelectedMonthInYear(null);
                        setSelectedDate(null);
                      }}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: selectedYear === year.year 
                          ? (theme === 'dark' ? 'rgba(111, 66, 193, 0.2)' : '#f3f4f6') 
                          : 'transparent',
                        border: selectedYear === year.year ? '1px solid #6f42c1' : '1px solid transparent'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedYear !== year.year) {
                          e.target.style.backgroundColor = theme === 'dark' ? '#1a1a1a' : '#f8f9fa';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedYear !== year.year) {
                          e.target.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <span style={{ fontSize: '0.85rem', color: theme === 'dark' ? 'var(--filter-text-color)' : '#374151' }}>
                        {year.year}
                      </span>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        color: theme === 'dark' ? 'var(--filter-text-color)' : '#6c757d',
                        background: theme === 'dark' ? '#1a1a1a' : '#e5e7eb',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {year.totalNoticias}
                      </span>
                    </div>
                  ))}

                  {dateFilterLevel === 'month' && selectedYear && getAvailableMonths(selectedYear).map((month) => (
                    <div
                      key={month.month}
                      onClick={() => {
                        setSelectedMonthInYear(month.month);
                        setDateFilterLevel('day');
                        setSelectedDate(null);
                      }}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: selectedMonthInYear === month.month 
                          ? (theme === 'dark' ? 'rgba(111, 66, 193, 0.2)' : '#f3f4f6') 
                          : 'transparent',
                        border: selectedMonthInYear === month.month ? (theme === 'dark' ? '1px solid var(--filter-text-color)' : '1px solid #6f42c1') : '1px solid transparent'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedMonthInYear !== month.month) {
                          e.target.style.backgroundColor = theme === 'dark' ? '#1a1a1a' : '#f8f9fa';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedMonthInYear !== month.month) {
                          e.target.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <span style={{ fontSize: '0.85rem', color: theme === 'dark' ? 'var(--filter-text-color)' : '#374151' }}>
                        {month.monthName}
                      </span>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        color: theme === 'dark' ? 'var(--filter-text-color)' : '#6c757d',
                        background: theme === 'dark' ? '#1a1a1a' : '#e5e7eb',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {month.totalNoticias}
                      </span>
                    </div>
                  ))}

                  {dateFilterLevel === 'day' && selectedYear && selectedMonthInYear && getAvailableDays(selectedYear, selectedMonthInYear).map((day) => (
                    <div
                      key={day.day}
                      onClick={() => {
                        setSelectedDate(day.date);
                        setShowDateDropdown(false);
                        // Aplicar filtro de fecha
                        handleDateFilter(day.date);
                      }}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: selectedDate === day.date 
                          ? (theme === 'dark' ? 'rgba(111, 66, 193, 0.2)' : '#f3f4f6') 
                          : 'transparent',
                        border: selectedDate === day.date ? (theme === 'dark' ? '1px solid var(--filter-text-color)' : '1px solid #6f42c1') : '1px solid transparent'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedDate !== day.date) {
                          e.target.style.backgroundColor = theme === 'dark' ? '#1a1a1a' : '#f8f9fa';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedDate !== day.date) {
                          e.target.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <span style={{ fontSize: '0.85rem', color: theme === 'dark' ? 'var(--filter-text-color)' : '#374151' }}>
                        {day.fecha_formateada}
                      </span>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        color: theme === 'dark' ? 'var(--filter-text-color)' : '#6c757d',
                        background: theme === 'dark' ? '#1a1a1a' : '#e5e7eb',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {day.totalNoticias}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'var(--card-bg)',
            borderRadius: '25px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            border: '1px solid var(--border-color)',
            cursor: 'pointer',
            color: theme === 'dark' ? 'var(--filter-text-color)' : 'var(--text-primary)'
          }}
          onClick={handleRefresh}
          onMouseEnter={(e) => {
            if (theme === 'dark') {
              e.currentTarget.style.borderColor = 'rgba(97, 218, 251, 0.5)';
              e.currentTarget.style.color = 'var(--filter-text-hover)';
            } else {
              e.currentTarget.style.borderColor = '#28a745';
              e.currentTarget.style.color = '#28a745';
            }
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.color = theme === 'dark' ? 'var(--filter-text-color)' : 'var(--text-primary)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
          }}
          >
            <FiRefreshCw style={{ color: theme === 'dark' ? 'var(--filter-text-color)' : '#28a745', fontSize: '1.1rem' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: theme === 'dark' ? 'var(--filter-text-color)' : 'var(--text-primary)' }}>Actualizar</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'var(--card-bg)',
            borderRadius: '25px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            border: '1px solid var(--border-color)',
            cursor: 'pointer',
            color: theme === 'dark' ? 'var(--filter-text-color)' : 'var(--text-primary)'
          }}
          onClick={fetchTodasLasNoticias}
          onMouseEnter={(e) => {
            if (theme === 'dark') {
              e.currentTarget.style.borderColor = 'rgba(97, 218, 251, 0.5)';
              e.currentTarget.style.color = 'var(--filter-text-hover)';
            } else {
              e.currentTarget.style.borderColor = '#007bff';
              e.currentTarget.style.color = '#007bff';
            }
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.color = theme === 'dark' ? 'var(--filter-text-color)' : 'var(--text-primary)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
          }}
          >
            <FiRefreshCw style={{ color: theme === 'dark' ? 'var(--filter-text-color)' : '#007bff', fontSize: '1.1rem' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: theme === 'dark' ? 'var(--filter-text-color)' : 'var(--text-primary)' }}>Recargar Todas</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'var(--card-bg)',
            borderRadius: '25px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            border: '1px solid var(--border-color)'
          }}>
            <GeographicFilter 
              onFilterChange={setGeographicFilter}
              selectedType={geographicFilter || 'todos'}
            />
          </div>

          {/* Botón Redes Sociales */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'white',
            borderRadius: '25px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e9ecef',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/redes-sociales')}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#1da1f2';
            e.currentTarget.style.color = '#1da1f2';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e9ecef';
            e.currentTarget.style.color = '#495057';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
          }}
          >
            <FiShare2 style={{ color: '#1da1f2', fontSize: '1.1rem' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#495057' }}>Redes Sociales</span>
          </div>
        </div>
      </div>

      <MainContent>
        {loading && <LoadingSpinner>Cargando noticias...</LoadingSpinner>}
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        {!loading && !error && noticias.length > 0 && (
          <>
            {/* Panel izquierdo - Noticias Relevantes de Días Anteriores */}
            <LeftPanel>
              <LeftPanelTitle>⭐ Noticias Premium</LeftPanelTitle>
              {noticiasRelevantes.length > 0 ? (
                noticiasRelevantes.map((noticia, index) => (
                  <RelevantNewsCard 
                    key={`relevant-${noticia.id}`} 
                    onClick={() => handleNoticiaClick(noticia)}
                    style={getPremiumStyle(noticia)}
                  >
                    <RelevantNewsImage $imageUrl={noticia.imagen_url}>
                      {renderPremiumIndicators(noticia)}
                    </RelevantNewsImage>
                    <RelevantNewsContent>
                      <RelevantNewsMeta>
                        <RelevantNewsDate>
                          {formatRelativeDate(noticia.fecha_publicacion)}
                        </RelevantNewsDate>
                        <RelevantNewsCategory categoria={noticia.categoria}>
                          {noticia.categoria}
                        </RelevantNewsCategory>
                      </RelevantNewsMeta>
                      <RelevantNewsTitle>{noticia.titulo}</RelevantNewsTitle>
                      <RelevantNewsDiario>
                        {noticia.diario_nombre}
                      </RelevantNewsDiario>
                    </RelevantNewsContent>
                  </RelevantNewsCard>
                ))
              ) : (
                <div style={{ 
                  padding: '2rem', 
                  textAlign: 'center', 
                  color: '#666',
                  fontStyle: 'italic'
                }}>
                  No hay noticias premium disponibles
                </div>
              )}
              
              {/* Fallback: Mostrar algunas noticias sin imagen si no hay relevantes */}
              {noticiasRelevantes.length === 0 && noticiasSinImagen.slice(0, 5).map((noticia, index) => {
                // Alternar entre diferentes tamaños de cards
                const cardType = index % 3;
                const CardComponent = cardType === 0 ? TextNewsCardLarge : 
                                    cardType === 1 ? TextNewsCard : TextNewsCardSmall;
                const TitleComponent = cardType === 0 ? TextNewsTitleLarge : 
                                     cardType === 1 ? TextNewsTitle : TextNewsTitleSmall;
                const MetaComponent = cardType === 0 ? TextNewsMetaLarge : 
                                    cardType === 1 ? TextNewsMeta : TextNewsMetaSmall;
                
                return (
                  <CardComponent
                    key={index}
                    onClick={() => handleNoticiaClick(noticia)}
                    style={getPremiumStyle(noticia)}
                  >
                    {renderPremiumIndicators(noticia)}
                    <TitleComponent>{noticia.titulo}</TitleComponent>
                    {/* Indicadores geográficos y de alerta */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      {/* Indicador geográfico */}
                      {noticia.geographic_type && (
                        <span style={{
                          background: noticia.geographic_type === 'internacional' ? '#007bff' : 
                                     noticia.geographic_type === 'nacional' ? '#dc3545' : 
                                     noticia.geographic_type === 'regional' ? '#28a745' : 
                                     noticia.geographic_type === 'local' ? '#ffc107' : '#6c757d',
                          color: noticia.geographic_type === 'local' ? '#000' : '#fff',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '10px',
                          fontSize: '0.7rem',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          {noticia.geographic_type === 'internacional' ? '🌍' : 
                           noticia.geographic_type === 'nacional' ? '🇵🇪' : 
                           noticia.geographic_type === 'regional' ? '🏞️' : 
                           noticia.geographic_type === 'local' ? '🏙️' : '📰'} 
                          {noticia.geographic_type}
                        </span>
                      )}
                      
                      {/* Indicadores existentes */}
                      {noticia.es_alerta && (
                        <span style={{
                          background: noticia.nivel_urgencia === 'critica' ? '#dc3545' : 
                                     noticia.nivel_urgencia === 'alta' ? '#fd7e14' : 
                                     noticia.nivel_urgencia === 'media' ? '#ffc107' : '#28a745',
                          color: 'white',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '10px',
                          fontSize: '0.7rem',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          🚨 {noticia.nivel_urgencia}
                        </span>
                      )}
                      {noticia.sentimiento && (
                        <span style={{
                          background: noticia.sentimiento === 'positivo' ? '#28a745' : 
                                     noticia.sentimiento === 'negativo' ? '#dc3545' : '#6c757d',
                          color: 'white',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '10px',
                          fontSize: '0.7rem',
                          fontWeight: '600'
                        }}>
                          {noticia.sentimiento === 'positivo' ? '😊' : 
                           noticia.sentimiento === 'negativo' ? '😞' : '😐'} {noticia.sentimiento}
                        </span>
                      )}
                    </div>
                    <MetaComponent>
                      <div>
                        <TextNewsCategory>{noticia.categoria}</TextNewsCategory>
                        <TextNewsDiario>{noticia.diario}</TextNewsDiario>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
                        <TextNewsDate>
                          <FiCalendar />
                          {formatDate(noticia.fecha_publicacion)}
                        </TextNewsDate>
                        {noticia.tiempo_lectura_min && (
                          <span style={{ fontSize: '0.6rem', color: '#999' }}>
                            ⏱️ {noticia.tiempo_lectura_min} min
                          </span>
                        )}
                      </div>
                    </MetaComponent>
                  </CardComponent>
                );
              })}
            </LeftPanel>

            {/* Panel derecho - Noticias con imágenes */}
            <RightPanel>
            {/* Información de filtros activos */}
            {(categoriaSeleccionada || diarioFiltro || selectedDate || selectedMonth) && (
                    <div style={{ 
                background: '#e3f2fd', 
                padding: '1rem', 
                borderRadius: '10px', 
                marginBottom: '2rem',
                border: '1px solid #2196f3'
              }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#1976d2' }}>Filtros Activos:</h4>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {categoriaSeleccionada && (
                            <span style={{ 
                      background: '#dc3545', 
                      color: 'white', 
                      padding: '0.3rem 0.8rem', 
                                borderRadius: '15px',
                      fontSize: '0.9rem'
                              }}>
                      Categoría: {categoriaSeleccionada}
                    </span>
                  )}
                  {diarioFiltro && (
                                <span style={{ 
                      background: '#28a745', 
                                  color: 'white', 
                      padding: '0.3rem 0.8rem', 
                      borderRadius: '15px',
                      fontSize: '0.9rem'
                    }}>
                      Diario: {diarioFiltro}
                                </span>
                  )}
                  {selectedDate && (
                    <span style={{ 
                      background: '#ffc107', 
                      color: '#212529', 
                      padding: '0.3rem 0.8rem', 
                      borderRadius: '15px',
                      fontSize: '0.9rem'
                    }}>
                      Fecha: {selectedDate.toLocaleDateString('es-ES')}
                    </span>
                  )}
                  {selectedMonth && (
                    <span style={{ 
                      background: '#17a2b8', 
                      color: 'white', 
                      padding: '0.3rem 0.8rem', 
                      borderRadius: '15px',
                      fontSize: '0.9rem'
                    }}>
                      Mes: {selectedMonth}
                    </span>
                  )}
                              </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#666' }}>
                  Mostrando {noticiasAMostrar.length} noticias
                          </div>
                        </div>
            )}

            {/* Sección de Noticias Destacadas */}
            <FeaturedSection>
              <FeaturedTitle>Destacadas del día</FeaturedTitle>
              <FeaturedGrid>
                {/* Noticia Principal Grande */}
                {noticiaPrincipal && (
                  <MainFeaturedCard 
                    imageUrl={noticiaPrincipal.imagen_url}
                    onClick={() => handleNoticiaClick(noticiaPrincipal)}
                    style={getPremiumStyle(noticiaPrincipal)}
                  >
                    {renderPremiumIndicators(noticiaPrincipal)}
                    <TimeBadge>
                      {formatTime(noticiaPrincipal.fecha_publicacion)}
                    </TimeBadge>
                    <CardOverlay>
                      <CategoryBadge>{noticiaPrincipal.categoria}</CategoryBadge>
                      <FeaturedCardTitle>{noticiaPrincipal.titulo}</FeaturedCardTitle>
                      <CardMeta>
                        <AuthorName>{noticiaPrincipal.diario}</AuthorName>
                        <DateBadge>
                          <FiCalendar />
                          {formatDate(noticiaPrincipal.fecha_publicacion)}
                        </DateBadge>
                      </CardMeta>
                    </CardOverlay>
                  </MainFeaturedCard>
                )}

                {/* Noticias Pequeñas - Solo mostrar en primera página */}
                {currentPage === 1 && noticiasSecundarias.slice(0, 4).map((noticia, index) => (
                  <SmallFeaturedCard 
                    key={index}
                    imageUrl={noticia.imagen_url}
                    onClick={() => handleNoticiaClick(noticia)}
                    style={getPremiumStyle(noticia)}
                  >
                    {renderPremiumIndicators(noticia)}
                    <SmallTimeBadge>
                      {formatTime(noticia.fecha_publicacion)}
                    </SmallTimeBadge>
                    <SmallCardOverlay>
                      <SmallCategoryBadge>{noticia.categoria}</SmallCategoryBadge>
                      <SmallCardTitle>{noticia.titulo}</SmallCardTitle>
                      <SmallCardMeta>
                        <AuthorName>{noticia.diario}</AuthorName>
                        <DateBadge>
                          <FiCalendar />
                          {formatDate(noticia.fecha_publicacion)}
                        </DateBadge>
                      </SmallCardMeta>
                    </SmallCardOverlay>
                  </SmallFeaturedCard>
                ))}
              </FeaturedGrid>
            </FeaturedSection>

            {/* Sección de Lista de Noticias (Estilo Primera Imagen) - Solo mostrar en primera página */}
            {currentPage === 1 && (
            <ListSection>
              <ListTitle>Últimas Noticias</ListTitle>
              <NewsListGrid>
                {noticiasSecundarias.slice(4, 12).map((noticia, index) => (
                  <NewsListItem
                    key={index}
                    onClick={() => handleNoticiaClick(noticia)}
                    style={getPremiumStyle(noticia)}
                  >
                    {renderPremiumIndicators(noticia)}
                    <NewsListImage imageUrl={noticia.imagen_url} />
                    <NewsListContent>
                      <div>
                        <NewsListMeta>
                          <NewsListDate>
                            {formatDate(noticia.fecha_publicacion)}
                          </NewsListDate>
                          <NewsListCategory>
                            {noticia.categoria}
                          </NewsListCategory>
                        </NewsListMeta>
                        <NewsListTitle>{noticia.titulo}</NewsListTitle>
                      </div>
                      <NewsListAuthor>{noticia.diario}</NewsListAuthor>
                    </NewsListContent>
                  </NewsListItem>
                ))}
              </NewsListGrid>
            </ListSection>
            )}

            <ComparisonSection>
              <ComparisonTitle>
                Comparacion de noticias SCRAPING DIARIOS Y RED SOCIAL
                <ComparisonHighlight>nuevo</ComparisonHighlight>
              </ComparisonTitle>
              {comparisonError && (
                <ComparisonError>{comparisonError}</ComparisonError>
              )}
              {comparisonData?.error && !comparisonError && (
                <ComparisonError>{comparisonData.error}</ComparisonError>
              )}
              {comparisonLoading ? (
                <ComparisonEmpty>Analizando cobertura entre diarios y redes sociales...</ComparisonEmpty>
              ) : (
                <>
                  {comparisonData ? (
                    <>
                      <ComparisonSummaryGrid>
                        <ComparisonSummaryCard>
                          <ComparisonSummaryValue>{comparisonData.total_social_only || 0}</ComparisonSummaryValue>
                          <ComparisonSummaryLabel>Noticias sociales sin cobertura web</ComparisonSummaryLabel>
                        </ComparisonSummaryCard>
                        <ComparisonSummaryCard>
                          <ComparisonSummaryValue>{comparisonData.total_social_checked || 0}</ComparisonSummaryValue>
                          <ComparisonSummaryLabel>Noticias sociales evaluadas</ComparisonSummaryLabel>
                        </ComparisonSummaryCard>
                        <ComparisonSummaryCard>
                          <ComparisonSummaryValue>{comparisonData.total_daily_reference || 0}</ComparisonSummaryValue>
                          <ComparisonSummaryLabel>Noticias web usadas como referencia</ComparisonSummaryLabel>
                        </ComparisonSummaryCard>
                        <ComparisonSummaryCard>
                          <ComparisonSummaryValue>{comparisonData.days_window || 2} días</ComparisonSummaryValue>
                          <ComparisonSummaryLabel>Ventana de comparación</ComparisonSummaryLabel>
                        </ComparisonSummaryCard>
                      </ComparisonSummaryGrid>
                      {(comparisonData.items || []).length > 0 ? (
                        <ComparisonGrid>
                          {comparisonData.items.slice(0, 9).map((item) => (
                            <ComparisonCard key={`cmp-${item.id}`}>
                              <ComparisonBadge>{item.plataforma}</ComparisonBadge>
                              <ComparisonCardTitle>{item.titulo}</ComparisonCardTitle>
                              <ComparisonMeta>
                                {item.categoria && (
                                  <span>#{item.categoria}</span>
                                )}
                                {item.autor && (
                                  <span>Autor: {item.autor}</span>
                                )}
                                {item.fecha_publicacion ? (
                                  <span>{formatDate(item.fecha_publicacion)}</span>
                                ) : null}
                              </ComparisonMeta>
                              {item.enlace && (
                                <ComparisonLink href={item.enlace} target="_blank" rel="noopener noreferrer">
                                  Ver publicación original ↗
                                </ComparisonLink>
                              )}
                              {item.coincidencias_diarios && item.coincidencias_diarios.length > 0 ? (
                                <ComparisonMatches>
                                  <ComparisonMatchesTitle>Coincidencias aproximadas en diarios:</ComparisonMatchesTitle>
                                  {item.coincidencias_diarios.map(match => (
                                    <ComparisonMatchItem key={`match-${match.id}`}>
                                      <div style={{ flex: 1 }}>
                                        <strong>{match.diario}</strong>
                                        <div style={{ fontSize: '0.7rem', color: '#868e96' }}>{match.titulo}</div>
                                      </div>
                                      <span>{`${Math.round((match.similaridad || 0) * 100)}%`}</span>
                                    </ComparisonMatchItem>
                                  ))}
                                </ComparisonMatches>
                              ) : (
                                <ComparisonMatches>
                                  <ComparisonMatchesTitle>Sin coincidencias detectadas en diarios web</ComparisonMatchesTitle>
                                  <div style={{ fontSize: '0.75rem', color: '#868e96' }}>
                                    Esta noticia proviene de redes sociales y no se encontró cobertura similar en el scraping de diarios.
                                  </div>
                                </ComparisonMatches>
                              )}
                            </ComparisonCard>
                          ))}
                        </ComparisonGrid>
                      ) : (
                        <ComparisonEmpty>
                          ¡Buen trabajo! Todas las noticias recientes de redes sociales tienen cobertura similar en los diarios web.
                        </ComparisonEmpty>
                      )}
                    </>
                  ) : (
                    <ComparisonEmpty>No hay datos de comparación disponibles todavía.</ComparisonEmpty>
                  )}
                </>
              )}
            </ComparisonSection>

            {/* Sección de Grid Compacto (Estilo Segunda Imagen) - Solo mostrar en primera página */}
            {currentPage === 1 && (
            <CompactSection>
              <CompactTitle>Noticias Destacadas</CompactTitle>
              <CompactGrid>
                {noticiasSecundarias.slice(12, 18).map((noticia, index) => (
                  <CompactCard 
                    key={index}
                    imageUrl={noticia.imagen_url}
                    onClick={() => handleNoticiaClick(noticia)}
                    style={getPremiumStyle(noticia)}
                  >
                    {renderPremiumIndicators(noticia)}
                    <CompactBadge>{noticia.categoria}</CompactBadge>
                    <CompactOverlay>
                      <CompactCardTitle>{noticia.titulo}</CompactCardTitle>
                      <CompactCardMeta>
                        <span>{noticia.diario}</span>
                        <DateBadge>
                          <FiCalendar />
                          {formatDate(noticia.fecha_publicacion)}
                        </DateBadge>
                      </CompactCardMeta>
                    </CompactOverlay>
                  </CompactCard>
                ))}
              </CompactGrid>
            </CompactSection>
            )}

            {/* Resto de Noticias - Diseño Original */}
            {((currentPage === 1 && noticiasSecundarias.slice(18).length > 0) || currentPage > 1) && (
              <SecondarySection>
                <SectionTitle>
                  {currentPage === 1 ? 'Más Noticias' : `Noticias - Página ${currentPage}`}
                </SectionTitle>
                <NewsGrid>
                  {(currentPage === 1 ? noticiasSecundarias.slice(18) : noticiasSecundarias).map((noticia, index) => {
                    // Si la noticia tiene imagen, usar el diseño con imagen
                    if (noticia.imagen_url && noticia.imagen_url.trim() !== '') {
                      return (
                        <NewsCard
                          key={index}
                          onClick={() => handleNoticiaClick(noticia)}
                          style={getPremiumStyle(noticia)}
                        >
                          {renderPremiumIndicators(noticia)}
                          <NewsImage imageUrl={noticia.imagen_url}>
                            <NewsTimeBadge>
                              {formatTime(noticia.fecha_publicacion)}
                            </NewsTimeBadge>
                            <NewsOverlay>
                              <NewsCategory>{noticia.categoria}</NewsCategory>
                              <NewsTitle>{noticia.titulo}</NewsTitle>
                              <NewsMeta>
                                <span>{noticia.diario}</span>
                                <NewsDate>
                                  <FiCalendar />
                                  {formatDate(noticia.fecha_publicacion)}
                                </NewsDate>
                              </NewsMeta>
                            </NewsOverlay>
                          </NewsImage>
                        </NewsCard>
                      );
                    } else {
                      // Si no tiene imagen, usar diseño de texto
                      const cardType = index % 3;
                      const CardComponent = cardType === 0 ? TextNewsCardLarge : 
                                          cardType === 1 ? TextNewsCard : TextNewsCardSmall;
                      const TitleComponent = cardType === 0 ? TextNewsTitleLarge : 
                                           cardType === 1 ? TextNewsTitle : TextNewsTitleSmall;
                      const MetaComponent = cardType === 0 ? TextNewsMetaLarge : 
                                          cardType === 1 ? TextNewsMeta : TextNewsMetaSmall;
                      
                      return (
                        <CardComponent
                          key={index}
                          onClick={() => handleNoticiaClick(noticia)}
                          style={getPremiumStyle(noticia)}
                        >
                          {renderPremiumIndicators(noticia)}
                          <TitleComponent>{noticia.titulo}</TitleComponent>
                          {/* Nuevos indicadores */}
                          {(noticia.es_alerta || noticia.sentimiento) && (
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              {noticia.es_alerta && (
                                <span style={{
                                  background: noticia.nivel_urgencia === 'critica' ? '#dc3545' : 
                                             noticia.nivel_urgencia === 'alta' ? '#fd7e14' : 
                                             noticia.nivel_urgencia === 'media' ? '#ffc107' : '#28a745',
                                  color: 'white',
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: '10px',
                                  fontSize: '0.7rem',
                                  fontWeight: '600',
                                  textTransform: 'uppercase'
                                }}>
                                  🚨 {noticia.nivel_urgencia}
                                </span>
                              )}
                              {noticia.sentimiento && (
                                <span style={{
                                  background: noticia.sentimiento === 'positivo' ? '#28a745' : 
                                             noticia.sentimiento === 'negativo' ? '#dc3545' : '#6c757d',
                                  color: 'white',
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: '10px',
                                  fontSize: '0.7rem',
                                  fontWeight: '600'
                                }}>
                                  {noticia.sentimiento === 'positivo' ? '😊' : 
                                   noticia.sentimiento === 'negativo' ? '😞' : '😐'} {noticia.sentimiento}
                                </span>
                              )}
                            </div>
                          )}
                          <MetaComponent>
                            <div>
                              <TextNewsCategory>{noticia.categoria}</TextNewsCategory>
                              <TextNewsDiario>{noticia.diario}</TextNewsDiario>
                            </div>
                            <div>
                              <TextNewsDate>
                                <FiCalendar />
                                {formatDate(noticia.fecha_publicacion)}
                              </TextNewsDate>
                            </div>
                          </MetaComponent>
                        </CardComponent>
                      );
                    }
                  })}
                </NewsGrid>
              </SecondarySection>
            )}
            
            {/* Paginación */}
            {totalPages > 1 && (
              <PaginationContainer>
                <PaginationButton
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  aria-label="Página anterior"
                >
                  <FiChevronLeft />
                </PaginationButton>
                
                {/* Mostrar números de página */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <PaginationButton
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={currentPage === pageNum ? 'active' : ''}
                      aria-label={`Ir a página ${pageNum}`}
                    >
                      {pageNum}
                    </PaginationButton>
                  );
                })}
                
                <PaginationButton
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Página siguiente"
                >
                  <FiChevronRight />
                </PaginationButton>
                
                <PaginationInfo>
                  Página {currentPage} de {totalPages} ({allNoticiasSecundarias.length} noticias)
                </PaginationInfo>
              </PaginationContainer>
            )}
            </RightPanel>
        </>
      )}
      </MainContent>
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={closeSubscriptionModal}
        pendingNews={pendingPremiumNews}
        onSubscriptionSuccess={() => {
          closeSubscriptionModal();
          refreshSubscription();
        }}
      />
    </Container>
  );
}

// Componente principal con rutas
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
          <Route path="/" element={<MainView />} />
          <Route path="/diario/el-comercio" element={<DiarioComercio />} />
          <Route path="/diario/diario-correo" element={<DiarioCorreo />} />
          <Route path="/diario/el-popular" element={<DiarioPopular />} />
          <Route path="/diario/cnn-en-español" element={<DiarioCNN />} />
          <Route path="/comparativa" element={<Comparativa />} />
          <Route path="/noticia/:id" element={<NoticiaDetalle />} />
          <Route path="/alertas" element={<AlertManager />} />
          <Route path="/buscar" element={<AdvancedSearch />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/trending" element={<TrendingNews />} />
          <Route path="/filtro-fechas" element={<DateFilterExample />} />
          <Route path="/user-dashboard" element={<AppUGC />} />
          <Route path="/admin-dashboard" element={<AppUGC />} />
          <Route path="/ugc-feed" element={<AppUGC />} />
          <Route path="/comunidad" element={<CommunityFeed />} />
          <Route path="/noticias-unificadas" element={<UnifiedNews />} />
          <Route path="/redes-sociales" element={<SocialMediaFeed />} />
          <Route path="/premium" element={<PremiumNewsView />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
