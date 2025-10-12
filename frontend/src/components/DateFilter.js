import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { FiCalendar, FiChevronDown, FiChevronRight, FiClock } from 'react-icons/fi';

const DateFilterContainer = styled.div`
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 2px solid #e9ecef;
`;

const FilterHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f1f3f4;
`;

const FilterTitle = styled.h3`
  margin: 0;
  color: #333;
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MonthList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const MonthItem = styled.div`
  border: 2px solid #e9ecef;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #dc3545;
    box-shadow: 0 4px 15px rgba(220, 53, 69, 0.1);
  }
`;

const MonthHeader = styled.button`
  width: 100%;
  background: ${props => props.isExpanded ? '#dc3545' : 'white'};
  color: ${props => props.isExpanded ? 'white' : '#333'};
  border: none;
  padding: 1rem 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.isExpanded ? '#c82333' : '#f8f9fa'};
  }
`;

const MonthInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const MonthName = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
`;

const NewsCount = styled.span`
  background: ${props => props.isExpanded ? 'rgba(255,255,255,0.2)' : '#e9ecef'};
  color: ${props => props.isExpanded ? 'white' : '#666'};
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
`;

const ChevronIcon = styled.div`
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
  transform: ${props => props.isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'};
`;

const DayList = styled.div`
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  max-height: ${props => props.isExpanded ? '300px' : '0'};
  overflow: hidden;
  transition: all 0.3s ease;
  overflow-y: auto;
`;

const DayItem = styled.button`
  width: 100%;
  background: transparent;
  border: none;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.95rem;
  color: #333;
  transition: all 0.3s ease;
  border-bottom: 1px solid #e9ecef;
  
  &:hover {
    background: #e9ecef;
    color: #dc3545;
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  &.active {
    background: #dc3545;
    color: white;
    
    &:hover {
      background: #c82333;
    }
  }
`;

const DayInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DayDate = styled.span`
  font-weight: 500;
`;

const DayNewsCount = styled.span`
  background: rgba(0,0,0,0.1);
  color: inherit;
  padding: 0.2rem 0.6rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const NoDateSection = styled.div`
  background: #fff3cd;
  border: 2px solid #ffeaa7;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  margin-top: 1rem;
`;

const NoDateHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #856404;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const NoDateCount = styled.span`
  background: #856404;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
`;

const ClearFiltersButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
  
  &:hover {
    background: #5a6268;
  }
`;

const DateFilter = ({ 
  noticias = [], 
  onDateFilter, 
  selectedDate = null,
  selectedMonth = null 
}) => {
  const [expandedMonths, setExpandedMonths] = useState(new Set());
  const [expandedMonthForFilter, setExpandedMonthForFilter] = useState(null);

  // Procesar noticias y agrupar por mes y día
  const { monthsData, noDateNews } = useMemo(() => {
    const monthsMap = new Map();
    const noDateNews = [];

    noticias.forEach(noticia => {
      const publishedAt = noticia.fecha_publicacion || noticia.published_at;
      
      if (!publishedAt) {
        noDateNews.push(noticia);
        return;
      }

      try {
        const date = new Date(publishedAt);
        if (isNaN(date.getTime())) {
          noDateNews.push(noticia);
          return;
        }

        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        
        const monthKey = `${year}-${month}`;
        const dayKey = `${year}-${month}-${day}`;
        
        // Formatear nombre del mes
        const monthNames = [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        const monthName = `${monthNames[month]} ${year}`;
        
        if (!monthsMap.has(monthKey)) {
          monthsMap.set(monthKey, {
            key: monthKey,
            name: monthName,
            year,
            month,
            days: new Map(),
            totalNews: 0
          });
        }
        
        const monthData = monthsMap.get(monthKey);
        
        if (!monthData.days.has(dayKey)) {
          monthData.days.set(dayKey, {
            key: dayKey,
            date: date,
            day: day,
            month: month,
            year: year,
            news: []
          });
        }
        
        monthData.days.get(dayKey).news.push(noticia);
        monthData.totalNews++;
        
      } catch (error) {
        console.warn('Error procesando fecha:', publishedAt, error);
        noDateNews.push(noticia);
      }
    });

    // Convertir a array y ordenar por fecha descendente
    const monthsArray = Array.from(monthsMap.values())
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });

    // Ordenar días dentro de cada mes
    monthsArray.forEach(month => {
      const daysArray = Array.from(month.days.values())
        .sort((a, b) => b.day - a.day);
      month.daysArray = daysArray;
    });

    return { monthsData: monthsArray, noDateNews };
  }, [noticias]);

  // Manejar expansión de mes
  const toggleMonth = (monthKey) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(monthKey)) {
      newExpanded.delete(monthKey);
    } else {
      newExpanded.add(monthKey);
    }
    setExpandedMonths(newExpanded);
  };

  // Manejar selección de fecha
  const handleDateSelect = (dateKey, monthKey) => {
    const monthData = monthsData.find(m => m.key === monthKey);
    const dayData = monthData?.days.get(dateKey);
    
    if (dayData) {
      onDateFilter(dayData.date, dayData.news);
      setExpandedMonthForFilter(monthKey);
    }
  };

  // Manejar selección de mes completo
  const handleMonthSelect = (monthKey) => {
    const monthData = monthsData.find(m => m.key === monthKey);
    if (monthData) {
      const allMonthNews = monthData.daysArray.flatMap(day => day.news);
      onDateFilter(null, allMonthNews, monthData);
      setExpandedMonthForFilter(monthKey);
    }
  };

  // Limpiar filtros
  const clearFilters = () => {
    onDateFilter(null, noticias);
    setExpandedMonthForFilter(null);
  };

  // Formatear fecha para mostrar
  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  // Formatear fecha completa
  const formatFullDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <DateFilterContainer>
      <FilterHeader>
        <FiCalendar size={20} />
        <FilterTitle>Filtrar por Fecha</FilterTitle>
      </FilterHeader>

      {monthsData.length > 0 && (
        <MonthList>
          {monthsData.map((month) => (
            <MonthItem key={month.key}>
              <MonthHeader
                isExpanded={expandedMonths.has(month.key)}
                onClick={() => toggleMonth(month.key)}
              >
                <MonthInfo>
                  <MonthName>{month.name}</MonthName>
                  <NewsCount isExpanded={expandedMonths.has(month.key)}>
                    {month.totalNews} noticias
                  </NewsCount>
                </MonthInfo>
                <ChevronIcon isExpanded={expandedMonths.has(month.key)}>
                  <FiChevronRight size={16} />
                </ChevronIcon>
              </MonthHeader>
              
              <DayList isExpanded={expandedMonths.has(month.key)}>
                {/* Opción para seleccionar mes completo */}
                <DayItem
                  onClick={() => handleMonthSelect(month.key)}
                  className={selectedMonth === month.key ? 'active' : ''}
                >
                  <DayInfo>
                    <FiCalendar size={14} />
                    <DayDate>Todos los días del mes</DayDate>
                  </DayInfo>
                  <DayNewsCount>{month.totalNews}</DayNewsCount>
                </DayItem>
                
                {/* Días individuales */}
                {month.daysArray.map((day) => (
                  <DayItem
                    key={day.key}
                    onClick={() => handleDateSelect(day.key, month.key)}
                    className={selectedDate && selectedDate.toDateString() === day.date.toDateString() ? 'active' : ''}
                    title={formatFullDate(day.date)}
                  >
                    <DayInfo>
                      <FiClock size={14} />
                      <DayDate>{formatDate(day.date)}</DayDate>
                    </DayInfo>
                    <DayNewsCount>{day.news.length}</DayNewsCount>
                  </DayItem>
                ))}
              </DayList>
            </MonthItem>
          ))}
        </MonthList>
      )}

      {noDateNews.length > 0 && (
        <NoDateSection>
          <NoDateHeader>
            <FiClock size={16} />
            <span>Noticias sin fecha</span>
            <NoDateCount>{noDateNews.length}</NoDateCount>
          </NoDateHeader>
          <p style={{ margin: 0, color: '#856404', fontSize: '0.9rem' }}>
            Estas noticias no tienen fecha de publicación válida
          </p>
        </NoDateSection>
      )}

      {(selectedDate || selectedMonth) && (
        <ClearFiltersButton onClick={clearFilters}>
          Limpiar filtros de fecha
        </ClearFiltersButton>
      )}

      {monthsData.length === 0 && noDateNews.length === 0 && (
        <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
          <FiCalendar size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <p>No hay noticias disponibles para filtrar</p>
        </div>
      )}
    </DateFilterContainer>
  );
};

export default DateFilter;
