import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { FiDollarSign, FiTrendingUp, FiEye, FiMousePointer, FiAward } from 'react-icons/fi';

const API_BASE = 'http://localhost:8000';

const Container = styled.div`
  background: transparent;
  padding: 0;
  border-radius: 0;
  box-shadow: none;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 3px solid rgba(40, 167, 69, 0.5);
`;

const Title = styled.h2`
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 1.8rem;
`;

const StatusBadge = styled.div`
  padding: 0.6rem 1.5rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  background: linear-gradient(135deg, #28a745 0%, #51cf66 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: ${props => props.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  padding: 2rem;
  border-radius: 15px;
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    pointer-events: none;
  }
`;

const StatIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  opacity: 0.9;
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  opacity: 0.9;
`;

const EarningsBreakdown = styled.div`
  background: rgba(26, 31, 58, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(102, 126, 234, 0.2);
`;

const BreakdownTitle = styled.h3`
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const BreakdownGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const BreakdownItem = styled.div`
  background: rgba(26, 31, 58, 0.8);
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid ${props => props.color || '#667eea'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(102, 126, 234, 0.2);
`;

const BreakdownLabel = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.3rem;
`;

const BreakdownValue = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
`;

const BreakdownEarnings = styled.div`
  font-size: 1rem;
  color: #51cf66;
  font-weight: 600;
  margin-top: 0.3rem;
`;

const PostsTable = styled.div`
  background: rgba(26, 31, 58, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(102, 126, 234, 0.2);
`;

const TableHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 1.5rem;
  font-weight: 600;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
`;

const TableRow = styled.div`
  padding: 1rem 1.5rem;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  border-bottom: 1px solid rgba(102, 126, 234, 0.2);
  transition: all 0.3s;
  background: rgba(26, 31, 58, 0.4);

  &:hover {
    background: rgba(102, 126, 234, 0.1);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const PostTitle = styled.div`
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PostType = styled.span`
  background: ${props => props.color || '#667eea'};
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const MetricValue = styled.div`
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const EarningValue = styled.div`
  color: #51cf66;
  font-weight: 700;
  font-size: 1.1rem;
`;

const InfoBox = styled.div`
  background: rgba(102, 126, 234, 0.15);
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-left: 6px solid #667eea;
  color: rgba(255, 255, 255, 0.9);
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const TYPE_COLORS = {
  noticia: '#ff6b6b',
  texto: '#4ecdc4',
  imagen: '#95e1d3',
  video: '#f38181',
  comentario: '#aa96da',
  resena: '#fcbad3',
  post: '#a8e6cf'
};

const TYPE_EMOJIS = {
  noticia: '📰',
  texto: '📝',
  imagen: '🖼️',
  video: '🎥',
  comentario: '💬',
  resena: '⭐',
  post: '📄'
};

function EarningsPanel({ token }) {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, [token]);

  const fetchEarnings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/ugc/monetization/earnings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setEarnings(response.data);
    } catch (err) {
      console.error('Error al obtener ganancias:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <p>⏳ Cargando información de ganancias...</p>
      </Container>
    );
  }

  if (!earnings) {
    return (
      <Container>
        <p>❌ Error al cargar información de ganancias</p>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <FiDollarSign /> Mis Ingresos
        </Title>
        <StatusBadge>
          <FiAward /> Monetización Activa
        </StatusBadge>
      </Header>

      <InfoBox>
        <strong>🎉 ¡Felicitaciones!</strong> Tu cuenta está monetizada. 
        Ganas dinero por cada interacción (views y clicks) en tus publicaciones. 
        Las tasas varían según el tipo de contenido.
      </InfoBox>

      <StatsGrid>
        <StatCard gradient="linear-gradient(135deg, #28a745 0%, #51cf66 100%)">
          <StatIcon>💰</StatIcon>
          <StatValue>${earnings.total_earnings.toFixed(2)}</StatValue>
          <StatLabel>Ganancias Totales</StatLabel>
        </StatCard>

        <StatCard gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
          <StatIcon><FiEye /></StatIcon>
          <StatValue>{earnings.total_views}</StatValue>
          <StatLabel>Total de Vistas</StatLabel>
        </StatCard>

        <StatCard gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
          <StatIcon><FiMousePointer /></StatIcon>
          <StatValue>{earnings.total_clicks}</StatValue>
          <StatLabel>Total de Clicks</StatLabel>
        </StatCard>

        <StatCard gradient="linear-gradient(135deg, #ffc107 0%, #ff9800 100%)">
          <StatIcon><FiTrendingUp /></StatIcon>
          <StatValue>{earnings.total_interactions}</StatValue>
          <StatLabel>Total Interacciones</StatLabel>
        </StatCard>
      </StatsGrid>

      <EarningsBreakdown>
        <BreakdownTitle>
          📊 Ganancias por Tipo de Contenido
        </BreakdownTitle>
        <BreakdownGrid>
          {earnings.earnings_by_type.map(item => (
            <BreakdownItem key={item.tipo} color={TYPE_COLORS[item.tipo]}>
              <BreakdownLabel>
                {TYPE_EMOJIS[item.tipo]} {item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1)}
              </BreakdownLabel>
              <BreakdownValue>{item.count} publicaciones</BreakdownValue>
              <BreakdownEarnings>${item.earnings.toFixed(4)} USD</BreakdownEarnings>
            </BreakdownItem>
          ))}
        </BreakdownGrid>
      </EarningsBreakdown>

      <div>
        <h3 style={{marginBottom: '1rem'}}>📈 Detalle de Publicaciones</h3>
        <PostsTable>
          <TableHeader>
            <div>Publicación</div>
            <div>Views</div>
            <div>Clicks</div>
            <div>Interacciones</div>
            <div>Ganancia</div>
          </TableHeader>
          {earnings.posts.length === 0 ? (
            <div style={{padding: '2rem', textAlign: 'center', color: '#888'}}>
              No tienes publicaciones aún
            </div>
          ) : (
            earnings.posts.map(post => (
              <TableRow key={post.id}>
                <PostTitle>
                  <PostType color={TYPE_COLORS[post.tipo]}>
                    {TYPE_EMOJIS[post.tipo]} {post.tipo}
                  </PostType>
                  {post.titulo || post.contenido.substring(0, 40) + '...'}
                </PostTitle>
                <MetricValue>
                  <FiEye size={14} /> {post.views}
                </MetricValue>
                <MetricValue>
                  <FiMousePointer size={14} /> {post.clicks}
                </MetricValue>
                <MetricValue>
                  {post.interacciones}
                </MetricValue>
                <EarningValue>
                  ${post.user_earnings.toFixed(4)}
                </EarningValue>
              </TableRow>
            ))
          )}
        </PostsTable>
      </div>
    </Container>
  );
}

export default EarningsPanel;

