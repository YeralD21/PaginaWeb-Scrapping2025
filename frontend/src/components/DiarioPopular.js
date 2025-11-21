import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiArrowLeft, FiCalendar, FiClock, FiFilter, FiTrendingUp, FiEye, FiShare2, FiChevronDown } from 'react-icons/fi';
import { useNoticiasDiario } from '../hooks/useNoticiasDiario';
import ChatBot from './ChatBot';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdf4 100%);
  font-family: 'Inter', 'Segoe UI', 'Roboto', sans-serif;
  position: relative;
  
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(5, 150, 105, 0.05) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }
`;

const Header = styled.header`
  background: linear-gradient(135deg, #059669 0%, #10b981 50%, #22c55e 100%);
  color: white;
  padding: 4rem 0;
  box-shadow: 0 20px 60px rgba(5, 150, 105, 0.3);
  position: relative;
  overflow: hidden;
  z-index: 1;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 70% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  gap: 3rem;
  position: relative;
  z-index: 2;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 1.2rem 2.5rem;
  border-radius: 60px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-weight: 700;
  font-size: 1.1rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(30px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.4);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.6s;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.3);
    
    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(-2px) scale(1.02);
  }
`;

const DiarioInfo = styled.div`
  flex: 1;
  text-align: center;
  position: relative;
`;

const DiarioTitle = styled.h1`
  font-size: 5rem;
  font-weight: 900;
  margin: 0;
  letter-spacing: 3px;
  line-height: 1;
  font-family: 'Inter', 'Arial Black', sans-serif;
  text-transform: uppercase;
  text-align: center;
  position: relative;
  
  .el-part {
    color: #fbbf24;
    text-shadow: 
      3px 3px 0px #000,
      6px 6px 12px rgba(0, 0, 0, 0.6);
    display: inline-block;
    transform: rotate(-2deg);
    margin-right: 0.5rem;
  }
  
  .popular-part {
    color: white;
    text-shadow: 
      3px 3px 0px #000,
      6px 6px 12px rgba(0, 0, 0, 0.6);
    display: inline-block;
    transform: rotate(1deg);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 200px;
    height: 4px;
    background: linear-gradient(90deg, transparent, #fbbf24, transparent);
    border-radius: 2px;
  }
`;

const DiarioSubtitle = styled.p`
  font-size: 1.5rem;
  margin: 2rem 0 0 0;
  opacity: 0.95;
  font-weight: 600;
  letter-spacing: 2px;
  text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.5);
  color: white;
  text-transform: uppercase;
  position: relative;
  
  &::before {
    content: '✦';
    margin-right: 1rem;
    color: #fbbf24;
    font-size: 1.2rem;
  }
  
  &::after {
    content: '✦';
    margin-left: 1rem;
    color: #fbbf24;
    font-size: 1.2rem;
  }
`;

const MainContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 4rem 2rem;
  position: relative;
  z-index: 1;
`;

// Layout principal similar a elpopular.pe
const MainLayout = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

// Noticia destacada grande (izquierda)
const FeaturedArticle = styled.article`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 15px 50px rgba(5, 150, 105, 0.1);
  border: 2px solid rgba(34, 197, 94, 0.15);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 60px rgba(5, 150, 105, 0.15);
  }
`;

const FeaturedImage = styled.div`
  height: 450px;
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'linear-gradient(135deg, #059669 0%, #10b981 50%, #22c55e 100%)'};
  background-size: cover;
  background-position: center;
  position: relative;
`;

const FeaturedByline = styled.div`
  font-size: 0.9rem;
  color: #059669;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const FeaturedContent = styled.div`
  padding: 1rem 2rem 0.75rem 2rem;
  background: rgba(255, 255, 255, 0.98);
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
`;

const FeaturedTitle = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 0 0;
  line-height: 1.3;
  color: #1f2937;
  font-family: 'Inter', sans-serif;
`;

// Sidebar con cards horizontales largos (derecha)
const SidebarNews = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SidebarCard = styled.article`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(5, 150, 105, 0.08);
  border: 2px solid rgba(34, 197, 94, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  height: 150px;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 35px rgba(5, 150, 105, 0.12);
    border-color: rgba(34, 197, 94, 0.2);
  }
`;

const SidebarImage = styled.div`
  width: 200px;
  flex-shrink: 0;
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'linear-gradient(135deg, #059669 0%, #10b981 100%)'};
  background-size: cover;
  background-position: center;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, rgba(0, 0, 0, 0.3) 0%, transparent 100%);
  }
`;

const SidebarContent = styled.div`
  flex: 1;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const SidebarCategory = styled.span`
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-block;
  width: fit-content;
  margin-bottom: 0.5rem;
`;

const SidebarTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.3;
  color: #1f2937;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
`;

const SidebarMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.5rem;
`;

// Grid de cards cuadrados pequeños (abajo)
const BottomNewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SquareCard = styled.article`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(5, 150, 105, 0.08);
  border: 2px solid rgba(34, 197, 94, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 35px rgba(5, 150, 105, 0.12);
    border-color: rgba(34, 197, 94, 0.2);
  }
`;

const SquareImage = styled.div`
  height: 180px;
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'linear-gradient(135deg, #059669 0%, #10b981 100%)'};
  background-size: cover;
  background-position: center;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.4) 100%);
  }
`;

const SquareOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  color: white;
  z-index: 2;
`;

const SquareContent = styled.div`
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.98);
`;

const SquareCategory = styled.span`
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-block;
  margin-bottom: 0.75rem;
`;

const SquareTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
  color: #1f2937;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const SquareMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: #6b7280;
`;

const NewsCard = styled.article`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 
    0 15px 50px rgba(5, 150, 105, 0.1),
    0 5px 20px rgba(16, 185, 129, 0.05);
  border: 2px solid rgba(34, 197, 94, 0.15);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  backdrop-filter: blur(20px);
  cursor: pointer;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #059669 0%, #10b981 25%, #22c55e 50%, #16a34a 75%, #15803d 100%);
    z-index: 1;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.02) 0%, transparent 50%);
    pointer-events: none;
    z-index: 1;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 
      0 25px 80px rgba(5, 150, 105, 0.2),
      0 10px 40px rgba(16, 185, 129, 0.15);
    border-color: rgba(34, 197, 94, 0.3);
  }
`;

const CardImage = styled.div`
  height: 200px;
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'linear-gradient(135deg, #059669 0%, #10b981 50%, #22c55e 100%)'};
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.6) 100%);
    z-index: 1;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(5, 150, 105, 0.1) 0%, transparent 50%);
    z-index: 1;
  }
`;

const CardOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 1.5rem;
  color: white;
  z-index: 2;
`;

const CardCategory = styled.span`
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  margin-bottom: 0.8rem;
  display: inline-block;
  box-shadow: 0 4px 15px rgba(5, 150, 105, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  position: relative;
  
  &::before {
    content: '✦';
    margin-right: 0.3rem;
    color: #fbbf24;
    font-size: 0.7rem;
  }
`;

const CardTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 800;
  margin: 0 0 0.8rem 0;
  line-height: 1.3;
  text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.8);
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.2px;
`;

const CardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.8rem;
  opacity: 0.95;
  font-weight: 600;
`;

const CardMetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.15);
  padding: 0.4rem 0.8rem;
  border-radius: 15px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
  }
`;

const CardContent = styled.div`
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.98);
`;

const CardExcerpt = styled.p`
  color: #4b5563;
  line-height: 1.6;
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  max-height: 80px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 15px;
    background: linear-gradient(transparent, rgba(255, 255, 255, 0.98));
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  font-size: 1.6rem;
  color: #059669;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 24px;
  margin: 2rem 0;
  box-shadow: 0 20px 60px rgba(5, 150, 105, 0.1);
  border: 2px solid rgba(34, 197, 94, 0.2);
  backdrop-filter: blur(20px);
  
  &::before {
    content: '✦';
    margin-right: 1rem;
    color: #fbbf24;
    font-size: 1.8rem;
    animation: spin 2s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.95) 100%);
  color: #dc2626;
  padding: 3rem;
  border-radius: 24px;
  margin: 2rem 0;
  text-align: center;
  font-weight: 700;
  border: 2px solid rgba(220, 38, 38, 0.2);
  box-shadow: 0 15px 50px rgba(220, 38, 38, 0.1);
  backdrop-filter: blur(20px);
  font-size: 1.2rem;
  position: relative;
  
  &::before {
    content: '⚠';
    display: block;
    font-size: 3rem;
    margin-bottom: 1rem;
    color: #fbbf24;
  }
`;

const FilterSection = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.95) 100%);
  padding: 3rem;
  border-radius: 28px;
  margin-bottom: 4rem;
  box-shadow: 
    0 20px 60px rgba(5, 150, 105, 0.1),
    0 8px 30px rgba(16, 185, 129, 0.05);
  border: 2px solid rgba(34, 197, 94, 0.15);
  backdrop-filter: blur(20px);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #059669 0%, #10b981 25%, #22c55e 50%, #16a34a 75%, #15803d 100%);
    border-radius: 28px 28px 0 0;
  }
`;

const FilterTitle = styled.h3`
  margin: 0 0 2rem 0;
  color: #059669;
  font-size: 1.6rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-weight: 800;
  font-family: 'Inter', sans-serif;
  text-transform: uppercase;
  letter-spacing: 1px;
  
  &::before {
    content: '✦';
    color: #fbbf24;
    font-size: 1.4rem;
  }
`;

const DateFilterContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DateDropdownButton = styled.button`
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: white;
  border: 2px solid transparent;
  padding: 1.2rem 2.5rem;
  border-radius: 35px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 700;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  box-shadow: 0 12px 35px rgba(5, 150, 105, 0.4);
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 280px;
  justify-content: space-between;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.6s;
  }

  &:hover {
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 16px 50px rgba(5, 150, 105, 0.5);
    
    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(-2px) scale(1.02);
  }

  svg {
    transition: transform 0.3s ease;
    transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  }
`;

const DateDropdownOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 99999;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: opacity 0.3s ease, visibility 0.3s ease;
  pointer-events: ${props => props.$isOpen ? 'auto' : 'none'};
`;

const DateDropdownContent = styled.div`
  position: fixed;
  top: ${props => props.$top || 'auto'}px;
  left: ${props => props.$left || 'auto'}px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 249, 250, 0.98) 100%);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(5, 150, 105, 0.3);
  border: 2px solid rgba(34, 197, 94, 0.2);
  backdrop-filter: blur(20px);
  z-index: 100000;
  pointer-events: ${props => props.$isOpen ? 'auto' : 'none'};
  min-width: 320px;
  max-width: 400px;
  max-height: 500px;
  overflow-y: auto;
  opacity: ${props => props.$isOpen ? 1 : 0};
  transform: ${props => props.$isOpen ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.95)'};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(5, 150, 105, 0.1);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #059669 0%, #10b981 100%);
    border-radius: 10px;
    
    &:hover {
      background: linear-gradient(135deg, #047857 0%, #059669 100%);
    }
  }
`;

const DateDropdownHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 2px solid rgba(34, 197, 94, 0.2);
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: white;
  border-radius: 20px 20px 0 0;
  font-weight: 700;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const DateDropdownList = styled.div`
  padding: 0.5rem;
`;

const DateOption = styled.button`
  width: 100%;
  background: ${props => props.$active ? 'linear-gradient(135deg, rgba(5, 150, 105, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)' : 'transparent'};
  color: ${props => props.$active ? '#059669' : '#1f2937'};
  border: 2px solid ${props => props.$active ? 'rgba(5, 150, 105, 0.4)' : 'transparent'};
  padding: 1rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: ${props => props.$active ? '700' : '600'};
  transition: all 0.3s ease;
  text-align: left;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(5, 150, 105, 0.1), transparent);
    transition: left 0.4s;
  }

  &:hover {
    background: ${props => props.$active ? 'linear-gradient(135deg, rgba(5, 150, 105, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)' : 'rgba(5, 150, 105, 0.08)'};
    border-color: ${props => props.$active ? 'rgba(5, 150, 105, 0.5)' : 'rgba(5, 150, 105, 0.3)'};
    transform: translateX(4px);
    
    &::before {
      left: 100%;
    }
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const DateOptionText = styled.span`
  flex: 1;
`;

const DateOptionCount = styled.span`
  background: ${props => props.$active ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : 'rgba(5, 150, 105, 0.15)'};
  color: ${props => props.$active ? 'white' : '#059669'};
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  margin-left: 1rem;
`;

const NoNewsMessage = styled.div`
  text-align: center;
  padding: 5rem;
  color: #059669;
  font-size: 1.4rem;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.9) 100%);
  border-radius: 28px;
  border: 2px solid rgba(34, 197, 94, 0.2);
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 60px rgba(5, 150, 105, 0.1);
  position: relative;
  
  &::before {
    content: '📰';
    display: block;
    font-size: 4rem;
    margin-bottom: 1.5rem;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 3px;
    background: linear-gradient(90deg, transparent, #059669, transparent);
    border-radius: 2px;
  }
`;

function DiarioPopular() {
  const navigate = useNavigate();
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownButtonRef = React.useRef(null);
  
  const { 
    noticias, 
    fechasDisponibles, 
    loading, 
    error, 
    fetchNoticiasPorFecha 
  } = useNoticiasDiario('El Popular', fechaSeleccionada);
  
  // Ordenar noticias: primero las que tienen imagen, luego las que no tienen
  const noticiasOrdenadas = [...noticias].sort((a, b) => {
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

  const handleBack = () => {
    navigate('/');
  };

  const handleFechaChange = (fecha) => {
    setFechaSeleccionada(fecha);
    fetchNoticiasPorFecha(fecha);
    setDropdownAbierto(false);
  };

  const toggleDropdown = () => {
    if (!dropdownAbierto && dropdownButtonRef.current) {
      const rect = dropdownButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 10,
        left: rect.left + window.scrollX
      });
    }
    setDropdownAbierto(!dropdownAbierto);
  };

  const cerrarDropdown = () => {
    setDropdownAbierto(false);
  };

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownAbierto && !event.target.closest('[data-date-dropdown]')) {
        cerrarDropdown();
      }
    };

    if (dropdownAbierto) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [dropdownAbierto]);

  const obtenerTextoFechaSeleccionada = () => {
    if (!fechaSeleccionada) {
      return 'Seleccionar fecha';
    }
    const fecha = fechasDisponibles.find(f => f.fecha === fechaSeleccionada);
    return fecha ? `${fecha.fecha_formateada} (${fecha.total_noticias})` : 'Seleccionar fecha';
  };

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
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container>
      <Header>
        <HeaderContent>
          <BackButton onClick={handleBack}>
            <FiArrowLeft />
            Volver
          </BackButton>
          <DiarioInfo>
            <DiarioTitle>
              <span className="el-part">el</span> <span className="popular-part">Popular</span>
            </DiarioTitle>
            <DiarioSubtitle>Noticias que importan</DiarioSubtitle>
          </DiarioInfo>
        </HeaderContent>
      </Header>

      <MainContent>
        {loading && <LoadingSpinner>Cargando noticias de El Popular...</LoadingSpinner>}
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        {!loading && !error && fechasDisponibles.length > 0 && (
          <FilterSection>
            <FilterTitle>
              <FiFilter />
              Filtrar por fecha
            </FilterTitle>
            <DateFilterContainer data-date-dropdown>
              <DateDropdownButton 
                ref={dropdownButtonRef}
                onClick={toggleDropdown}
                $isOpen={dropdownAbierto}
              >
                <FiCalendar />
                <span>{obtenerTextoFechaSeleccionada()}</span>
                <FiChevronDown />
              </DateDropdownButton>
              
              {dropdownAbierto && createPortal(
                <>
                  <DateDropdownOverlay 
                    $isOpen={dropdownAbierto}
                    onClick={cerrarDropdown}
                  />
                  <DateDropdownContent 
                    $isOpen={dropdownAbierto}
                    $top={dropdownPosition.top}
                    $left={dropdownPosition.left}
                  >
                    <DateDropdownHeader>
                      <FiCalendar />
                      Fechas disponibles ({fechasDisponibles.length})
                    </DateDropdownHeader>
                    <DateDropdownList>
                      {fechasDisponibles.map((fecha) => (
                        <DateOption
                          key={fecha.fecha}
                          $active={fechaSeleccionada === fecha.fecha}
                          onClick={() => handleFechaChange(fecha.fecha)}
                        >
                          <DateOptionText>{fecha.fecha_formateada}</DateOptionText>
                          <DateOptionCount $active={fechaSeleccionada === fecha.fecha}>
                            {fecha.total_noticias}
                          </DateOptionCount>
                        </DateOption>
                      ))}
                    </DateDropdownList>
                  </DateDropdownContent>
                </>,
                document.body
              )}
            </DateFilterContainer>
          </FilterSection>
        )}
        
        {!loading && !error && noticias.length > 0 && (
          <>
            {/* Layout principal: Noticia destacada + Sidebar */}
            <MainLayout>
              {/* Noticia destacada grande (primera noticia con imagen) */}
              {noticiasOrdenadas.length > 0 && noticiasOrdenadas[0] && (
                <FeaturedArticle onClick={() => navigate(`/noticia/${noticiasOrdenadas[0].id}`)}>
                  <FeaturedImage imageUrl={noticiasOrdenadas[0].imagen_url} />
                  <FeaturedContent>
                    <FeaturedByline>
                      Por {noticiasOrdenadas[0].diario_nombre || 'El Popular'}
                    </FeaturedByline>
                    <FeaturedTitle style={{ marginBottom: '0.5rem' }}>{noticiasOrdenadas[0].titulo}</FeaturedTitle>
                    <CardMeta style={{ marginTop: 0, marginBottom: 0, paddingBottom: 0 }}>
                      <CardMetaItem $isFeatured style={{ padding: '0.35rem 0.75rem' }}>
                        <FiCalendar />
                        {formatDate(noticiasOrdenadas[0].fecha_publicacion)}
                      </CardMetaItem>
                      <CardMetaItem $isFeatured style={{ padding: '0.35rem 0.75rem' }}>
                        <FiClock />
                        {formatTime(noticiasOrdenadas[0].fecha_publicacion)}
                      </CardMetaItem>
                    </CardMeta>
                  </FeaturedContent>
                </FeaturedArticle>
              )}

              {/* Sidebar con cards horizontales (siguientes 4 noticias) */}
              <SidebarNews>
                {noticiasOrdenadas.slice(1, 5).map((noticia, index) => (
                  <SidebarCard key={index} onClick={() => navigate(`/noticia/${noticia.id}`)}>
                    {noticia.imagen_url && (
                      <SidebarImage imageUrl={noticia.imagen_url} />
                    )}
                    <SidebarContent>
                      <div>
                        <SidebarCategory>{noticia.categoria}</SidebarCategory>
                        <SidebarTitle>{noticia.titulo}</SidebarTitle>
                      </div>
                      <SidebarMeta>
                        <span>
                          <FiCalendar style={{ marginRight: '0.25rem' }} />
                          {formatDate(noticia.fecha_publicacion)}
                        </span>
                      </SidebarMeta>
                    </SidebarContent>
                  </SidebarCard>
                ))}
              </SidebarNews>
            </MainLayout>

            {/* Grid de cards cuadrados pequeños (resto de noticias) */}
            {noticiasOrdenadas.length > 5 && (
              <BottomNewsGrid>
                {noticiasOrdenadas.slice(5).map((noticia, index) => (
                  <SquareCard key={index + 6} onClick={() => navigate(`/noticia/${noticia.id}`)}>
                    {noticia.imagen_url && (
                      <SquareImage imageUrl={noticia.imagen_url}>
                        <SquareOverlay>
                          <SidebarCategory style={{ marginBottom: '0.5rem' }}>
                            {noticia.categoria}
                          </SidebarCategory>
                        </SquareOverlay>
                      </SquareImage>
                    )}
                    <SquareContent>
                      {!noticia.imagen_url && (
                        <SquareCategory>{noticia.categoria}</SquareCategory>
                      )}
                      <SquareTitle>{noticia.titulo}</SquareTitle>
                      <SquareMeta>
                        <span>
                          <FiCalendar style={{ marginRight: '0.25rem' }} />
                          {formatDate(noticia.fecha_publicacion)}
                        </span>
                        <span>
                          <FiClock style={{ marginRight: '0.25rem' }} />
                          {formatTime(noticia.fecha_publicacion)}
                        </span>
                      </SquareMeta>
                    </SquareContent>
                  </SquareCard>
                ))}
              </BottomNewsGrid>
            )}
          </>
        )}
        
        {!loading && !error && noticias.length === 0 && (
          <NoNewsMessage>
            No hay noticias disponibles para la fecha seleccionada.
          </NoNewsMessage>
        )}
      </MainContent>
      <ChatBot context="popular" />
    </Container>
  );
}

export default DiarioPopular;
 