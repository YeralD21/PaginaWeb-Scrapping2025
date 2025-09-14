import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { FiFileText, FiBarChart2, FiFilter, FiRefreshCw, FiCalendar, FiSearch, FiAlertTriangle, FiTrendingUp, FiPieChart } from 'react-icons/fi';
import DiarioComercio from './components/DiarioComercio';
import DiarioCorreo from './components/DiarioCorreo';
import DiarioPopular from './components/DiarioPopular';
import Comparativa from './components/Comparativa';
import NoticiaDetalle from './components/NoticiaDetalle';
import AlertManager from './components/AlertManager';
import AdvancedSearch from './components/AdvancedSearch';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import TrendingNews from './components/TrendingNews';
import GeographicFilter from './components/GeographicFilter';

const Container = styled.div`
  width: 100%;
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  min-height: 100vh;
  background: #f8f9fa;
  position: relative;
`;

const Header = styled.header`
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: white;
  padding: 2rem 0;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: sticky;
    top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
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
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1.5rem;
`;

const NavButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'active',
})`
  background: ${props => props.active ? '#dc3545' : 'transparent'};
  color: white;
  border: 2px solid ${props => props.active ? '#dc3545' : 'rgba(255, 255, 255, 0.3)'};
  padding: 0.8rem 2rem;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${props => props.active ? '#c82333' : 'rgba(255, 255, 255, 0.1)'};
    border-color: ${props => props.active ? '#c82333' : 'rgba(255, 255, 255, 0.5)'};
  }
`;

const FiltersSection = styled.div`
  background: white;
  padding: 1.5rem 0;
  border-bottom: 1px solid #e9ecef;
  position: sticky;
  top: 120px;
  z-index: 99;
  overflow: visible;
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
  background: white;
  border: 2px solid #e9ecef;
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    border-color: #dc3545;
    color: #dc3545;
  }
`;

const DiarioFilterButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'active',
})`
  background: ${props => props.active ? '#dc3545' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border: 2px solid ${props => props.active ? '#dc3545' : '#e9ecef'};
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;

  &:hover {
    background: ${props => props.active ? '#c82333' : '#f8f9fa'};
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
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 200px;
  margin-top: 0.5rem;
  overflow: hidden;
`;

const CategoriaOption = styled.button`
  width: 100%;
  background: white;
  border: none;
  padding: 0.8rem 1rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  color: #333;
  border-bottom: 1px solid #f1f3f4;

  &:hover {
    background: #f8f9fa;
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

const DateFilter = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const DateButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'active',
})`
  background: ${props => props.active ? '#dc3545' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border: 2px solid ${props => props.active ? '#dc3545' : '#e9ecef'};
  padding: 0.6rem 1rem;
  border-radius: 15px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;

  &:hover {
    background: ${props => props.active ? '#c82333' : '#f8f9fa'};
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

// Estilos para noticias relevantes
const RelevantNewsCard = styled.article`
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-left: 3px solid #28a745;
  transition: all 0.3s ease;
  cursor: pointer;
  margin-bottom: 0.8rem;
  
  &:hover {
    transform: translateX(4px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
    border-left-color: #20c997;
  }
`;

const RelevantNewsTitle = styled.h4`
  font-size: 0.85rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const RelevantNewsMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const RelevantNewsDate = styled.span`
  color: #666;
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
  color: #495057;
  font-size: 0.7rem;
  font-weight: 500;
  background: #f8f9fa;
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
  color: #333;
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
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  border-left: 4px solid transparent;

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
  background: #f8f9fa;
  color: #666;
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
  color: #333;
  line-height: 1.4;
  margin: 0 0 0.5rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const NewsListAuthor = styled.span`
  font-size: 0.9rem;
  color: #666;
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

// Componente para la vista principal
function MainView() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('noticias');
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
  const [categoriasDisponibles, setCategoriasDisponibles] = useState([]);
  const [noticiasRelevantes, setNoticiasRelevantes] = useState([]);

  useEffect(() => {
      fetchFechasDisponibles();
      fetchCategoriasDisponibles();
      fetchNoticiasRelevantes(); // Cargar noticias relevantes al inicio
  }, []);

  // Efecto para recargar noticias cuando cambian los filtros
  useEffect(() => {
    if (categoriaSeleccionada || diarioFiltro || geographicFilter) {
      fetchNoticiasConFiltros();
    } else if (!fechaSeleccionada) {
      // Si no hay filtros activos y no hay fecha seleccionada, cargar noticias recientes
      fetchNoticiasConFiltros();
    }
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

  const handleRefresh = () => {
    if (fechaSeleccionada) {
      fetchNoticiasPorFecha(fechaSeleccionada);
    }
  };

  const handleDiarioFilter = (diario) => {
    if (diario === 'todos') {
      navigate('/');
    } else {
      // Navegar a la ruta específica del diario
      const rutaDiario = diario.toLowerCase().replace(/\s+/g, '-');
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

  // Filtrar noticias por categoría y diario si están seleccionados
  let noticiasAMostrar = noticias;
  
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
  const noticiasSecundarias = noticiaPrincipal && noticiasConImagen.length > 0 
    ? noticiasAMostrar.filter(n => n.id !== noticiaPrincipal.id)
    : noticiasAMostrar.slice(1);


  return (
    <Container>
        <Header>
        <HeaderContent>
          <Title>Diarios Peruanos</Title>
        <Subtitle>Plataforma de noticias con Web Scraping</Subtitle>
          <Navigation>
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
              <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: '600' }}>Navegar a:</span>
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
            </div>
          </FilterGroup>
          
          <DateFilter>
            <FiCalendar />
                  {fechasDisponibles.map((fecha) => (
                    <DateButton
                      key={fecha.fecha}
                      active={fechaSeleccionada === fecha.fecha}
                onClick={() => setFechaSeleccionada(fecha.fecha)}
                    >
                {fecha.fecha_formateada} ({fecha.total_noticias})
                    </DateButton>
                  ))}
          </DateFilter>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <FilterButton onClick={handleRefresh}>
              <FiRefreshCw />
              Actualizar
            </FilterButton>
            
            <GeographicFilter 
              onFilterChange={setGeographicFilter}
              selectedType={geographicFilter || 'todos'}
            />
          </div>
        </FiltersContent>
      </FiltersSection>

      <MainContent>
        {loading && <LoadingSpinner>Cargando noticias...</LoadingSpinner>}
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        {!loading && !error && noticias.length > 0 && (
          <>
            {/* Panel izquierdo - Noticias Relevantes de Días Anteriores */}
            <LeftPanel>
              <LeftPanelTitle>🕒 Noticias Relevantes</LeftPanelTitle>
              {noticiasRelevantes.length > 0 ? (
                noticiasRelevantes.map((noticia, index) => (
                  <RelevantNewsCard 
                    key={`relevant-${noticia.id}`} 
                    onClick={() => navigate(`/noticia/${noticia.id}`)}
                  >
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
                  </RelevantNewsCard>
                ))
              ) : (
                <div style={{ 
                  padding: '2rem', 
                  textAlign: 'center', 
                  color: '#666',
                  fontStyle: 'italic'
                }}>
                  No hay noticias relevantes disponibles
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
                  <CardComponent key={index} onClick={() => navigate(`/noticia/${noticia.id}`)}>
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
            {(categoriaSeleccionada || diarioFiltro) && (
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
                    onClick={() => navigate(`/noticia/${noticiaPrincipal.id}`)}
                  >
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

                {/* Noticias Pequeñas */}
                {noticiasSecundarias.slice(0, 4).map((noticia, index) => (
                  <SmallFeaturedCard 
                    key={index}
                    imageUrl={noticia.imagen_url}
                    onClick={() => navigate(`/noticia/${noticia.id}`)}
                  >
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

            {/* Sección de Lista de Noticias (Estilo Primera Imagen) */}
            <ListSection>
              <ListTitle>Últimas Noticias</ListTitle>
              <NewsListGrid>
                {noticiasSecundarias.slice(4, 12).map((noticia, index) => (
                  <NewsListItem key={index} onClick={() => navigate(`/noticia/${noticia.id}`)}>
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

            {/* Sección de Grid Compacto (Estilo Segunda Imagen) */}
            <CompactSection>
              <CompactTitle>Noticias Destacadas</CompactTitle>
              <CompactGrid>
                {noticiasSecundarias.slice(12, 18).map((noticia, index) => (
                  <CompactCard 
                    key={index}
                    imageUrl={noticia.imagen_url}
                    onClick={() => navigate(`/noticia/${noticia.id}`)}
                  >
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

            {/* Resto de Noticias - Diseño Original */}
            {noticiasSecundarias.slice(18).length > 0 && (
              <SecondarySection>
                <SectionTitle>Más Noticias</SectionTitle>
                <NewsGrid>
                  {noticiasSecundarias.slice(18).map((noticia, index) => {
                    // Si la noticia tiene imagen, usar el diseño con imagen
                    if (noticia.imagen_url && noticia.imagen_url.trim() !== '') {
                      return (
                        <NewsCard key={index} onClick={() => navigate(`/noticia/${noticia.id}`)}>
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
                        <CardComponent key={index} onClick={() => navigate(`/noticia/${noticia.id}`)}>
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
            </RightPanel>
        </>
      )}
      </MainContent>
    </Container>
  );
}

// Componente principal con rutas
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainView />} />
        <Route path="/diario/el-comercio" element={<DiarioComercio />} />
        <Route path="/diario/diario-correo" element={<DiarioCorreo />} />
        <Route path="/diario/el-popular" element={<DiarioPopular />} />
        <Route path="/comparativa" element={<Comparativa />} />
        <Route path="/noticia/:id" element={<NoticiaDetalle />} />
        <Route path="/alertas" element={<AlertManager />} />
        <Route path="/buscar" element={<AdvancedSearch />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
        <Route path="/trending" element={<TrendingNews />} />
      </Routes>
    </Router>
  );
}

export default App;
