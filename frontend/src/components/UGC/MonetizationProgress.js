import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled, { keyframes, css } from 'styled-components';
import { FiTrendingUp, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const API_BASE = 'http://localhost:8000';

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const Container = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 3px solid #667eea;
`;

const Title = styled.h2`
  color: #333;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const StatusBadge = styled.div`
  padding: 0.6rem 1.5rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  ${props => props.eligible ? `
    background: linear-gradient(135deg, #28a745 0%, #51cf66 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
  ` : `
    background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
  `}
`;

const RefreshButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const InfoCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
`;

const InfoTitle = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InfoText = styled.p`
  margin: 0.5rem 0;
  line-height: 1.6;
  opacity: 0.95;
`;

const TimeRemaining = styled.div`
  background: rgba(255, 255, 255, 0.2);
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const RequirementsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const RequirementCard = styled.div`
  background: ${props => props.completed ? '#f0f9ff' : '#fff'};
  border: 2px solid ${props => props.completed ? '#28a745' : '#e0e0e0'};
  border-radius: 12px;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  }

  ${props => props.completed && `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(135deg, #28a745 0%, #51cf66 100%);
    }
  `}
`;

const RequirementHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const RequirementTitle = styled.h3`
  color: #333;
  margin: 0;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RequirementIcon = styled.div`
  font-size: 1.5rem;
`;

const StatusIcon = styled.div`
  font-size: 1.5rem;
  color: ${props => props.completed ? '#28a745' : '#ffc107'};
`;

const ProgressBarContainer = styled.div`
  background: #e0e0e0;
  border-radius: 10px;
  height: 12px;
  overflow: hidden;
  margin: 1rem 0;
  position: relative;
`;

const ProgressBarFill = styled.div`
  height: 100%;
  background: ${props => props.completed 
    ? 'linear-gradient(135deg, #28a745 0%, #51cf66 100%)'
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };
  width: ${props => Math.min(props.percentage, 100)}%;
  transition: width 0.5s ease;
  position: relative;

  ${props => !props.completed && props.percentage < 100 && css`
    animation: ${shimmer} 2s infinite;
    background: linear-gradient(
      to right,
      #667eea 0%,
      #764ba2 50%,
      #667eea 100%
    );
    background-size: 1000px 100%;
  `}
`;

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
`;

const ProgressLabel = styled.span`
  font-size: 0.9rem;
  color: #666;
  font-weight: 600;
`;

const ProgressValue = styled.span`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${props => props.completed ? '#28a745' : '#667eea'};
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #28a745 0%, #51cf66 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const TipBox = styled.div`
  background: #fff3cd;
  border: 2px solid #ffc107;
  border-left: 6px solid #ffc107;
  color: #856404;
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 2rem;
  line-height: 1.6;
`;

// Configuración de UI para cada tipo de requisito (sin valores hardcodeados)
const REQUIREMENTS_UI = {
  noticias_publicadas: {
    icon: '📰',
    title: 'Noticias Publicadas',
    description: 'Publica noticias de calidad para informar a la comunidad',
    unit: 'noticias'
  },
  interacciones_noticias: {
    icon: '👆',
    title: 'Interacciones en Noticias',
    description: 'Recibe clicks e interacciones en tus noticias',
    unit: 'clicks'
  },
  contenido_simple: {
    icon: '📱',
    title: 'Contenido Variado',
    description: 'Posts, imágenes y videos (requiere más cantidad)',
    unit: 'publicaciones'
  },
  reacciones_totales: {
    icon: '😊',
    title: 'Reacciones Totales',
    description: 'Recibe reacciones (👍❤️😂😢😠) en todas tus publicaciones',
    unit: 'reacciones'
  },
  dias_minimos_cuenta: {
    icon: '📅',
    title: 'Días Mínimos de Cuenta',
    description: 'Antigüedad mínima de la cuenta',
    unit: 'días'
  }
};

function MonetizationProgress({ token, onMonetizationEnabled }) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    fetchProgress();
    
    // Refrescar automáticamente cada 30 segundos
    const interval = setInterval(() => {
      fetchProgress();
    }, 30000);
    
    // Refrescar cuando la ventana recupera el foco
    const handleFocus = () => {
      fetchProgress();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [token]);

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/ugc/monetization/progress`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('🔍 Respuesta del servidor (progress):', response.data);
      console.log('📊 Requisitos recibidos:', response.data.requirements);
      setProgress(response.data);
    } catch (err) {
      console.error('Error al obtener progreso:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateMonetization = async () => {
    if (!progress?.eligible) {
      alert('⚠️ Aún no cumples todos los requisitos para activar la monetización');
      return;
    }

    setActivating(true);
    try {
      await axios.post(
        `${API_BASE}/ugc/monetization/activate`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      alert('🎉 ¡Felicitaciones! Tu cuenta ha sido activada para monetización');
      if (onMonetizationEnabled) onMonetizationEnabled();
      fetchProgress();
    } catch (err) {
      alert('❌ Error al activar monetización: ' + (err.response?.data?.detail || err.message));
    } finally {
      setActivating(false);
    }
  };

  const calculateDaysRemaining = () => {
    if (!progress?.requirements?.dias_minimos_cuenta) return 0;
    const targetDays = progress.requirements.dias_minimos_cuenta.target || 0;
    const currentDays = progress.account_age_days || 0;
    return Math.max(0, targetDays - currentDays);
  };

  if (loading) {
    return (
      <Container>
        <p>⏳ Cargando progreso de monetización...</p>
      </Container>
    );
  }

  if (!progress) {
    return (
      <Container>
        <p>❌ Error al cargar información de monetización</p>
      </Container>
    );
  }

  const daysRemaining = calculateDaysRemaining();
  const allRequirementsMet = progress.eligible;

  return (
    <Container>
      <Header>
        <Title>
          <FiTrendingUp /> Programa de Monetización
        </Title>
        <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
          <RefreshButton onClick={fetchProgress} disabled={loading}>
            🔄 Actualizar Progreso
          </RefreshButton>
          <StatusBadge eligible={allRequirementsMet}>
            {allRequirementsMet ? (
              <>
                <FiCheckCircle /> Elegible
              </>
            ) : (
              <>
                <FiClock /> En Progreso
              </>
            )}
          </StatusBadge>
        </div>
      </Header>

      <InfoCard>
        <InfoTitle>
          💰 ¡Gana dinero con tu contenido!
        </InfoTitle>
        <InfoText>
          {progress.requirements.dias_minimos_cuenta.target > 0 ? (
            <>
              Completa los requisitos en un periodo de <strong>{progress.requirements.dias_minimos_cuenta.target} {progress.requirements.dias_minimos_cuenta.target === 1 ? 'día' : 'días'}</strong> para activar la monetización 
              y comenzar a ganar por cada interacción en tus publicaciones.
            </>
          ) : (
            <>
              Completa los requisitos para activar la monetización 
              y comenzar a ganar por cada interacción en tus publicaciones.
            </>
          )}
        </InfoText>
        <TimeRemaining>
          <div>
            <strong>Tiempo desde creación de cuenta:</strong>
          </div>
          <div style={{fontSize: '1.2rem', fontWeight: '700'}}>
            {progress.account_age_days} / {progress.requirements.dias_minimos_cuenta.target} {progress.requirements.dias_minimos_cuenta.target === 1 ? 'día' : 'días'}
            {daysRemaining > 0 && ` (${daysRemaining} ${daysRemaining === 1 ? 'día restante' : 'días restantes'})`}
          </div>
        </TimeRemaining>
      </InfoCard>

      <RequirementsGrid>
        {/* Requisito 1: Noticias */}
        <RequirementCard completed={progress.requirements.noticias_publicadas.met}>
          <RequirementHeader>
            <RequirementTitle>
              <RequirementIcon>{REQUIREMENTS_UI.noticias_publicadas.icon}</RequirementIcon>
              {REQUIREMENTS_UI.noticias_publicadas.title}
            </RequirementTitle>
            <StatusIcon completed={progress.requirements.noticias_publicadas.met}>
              {progress.requirements.noticias_publicadas.met ? <FiCheckCircle /> : <FiClock />}
            </StatusIcon>
          </RequirementHeader>

          <p style={{color: '#666', fontSize: '0.9rem', margin: '0.5rem 0'}}>
            {REQUIREMENTS_UI.noticias_publicadas.description}
          </p>

          <ProgressBarContainer>
            <ProgressBarFill 
              percentage={(progress.requirements.noticias_publicadas.current / progress.requirements.noticias_publicadas.target) * 100}
              completed={progress.requirements.noticias_publicadas.met}
            />
          </ProgressBarContainer>

          <ProgressText>
            <ProgressLabel>Progreso:</ProgressLabel>
            <ProgressValue completed={progress.requirements.noticias_publicadas.met}>
              {progress.requirements.noticias_publicadas.current} / {progress.requirements.noticias_publicadas.target} {REQUIREMENTS_UI.noticias_publicadas.unit}
            </ProgressValue>
          </ProgressText>
        </RequirementCard>

        {/* Requisito 2: Interacciones en Noticias */}
        <RequirementCard completed={progress.requirements.interacciones_noticias.met}>
          <RequirementHeader>
            <RequirementTitle>
              <RequirementIcon>{REQUIREMENTS_UI.interacciones_noticias.icon}</RequirementIcon>
              {REQUIREMENTS_UI.interacciones_noticias.title}
            </RequirementTitle>
            <StatusIcon completed={progress.requirements.interacciones_noticias.met}>
              {progress.requirements.interacciones_noticias.met ? <FiCheckCircle /> : <FiClock />}
            </StatusIcon>
          </RequirementHeader>

          <p style={{color: '#666', fontSize: '0.9rem', margin: '0.5rem 0'}}>
            {REQUIREMENTS_UI.interacciones_noticias.description}
          </p>

          <ProgressBarContainer>
            <ProgressBarFill 
              percentage={(progress.requirements.interacciones_noticias.current / progress.requirements.interacciones_noticias.target) * 100}
              completed={progress.requirements.interacciones_noticias.met}
            />
          </ProgressBarContainer>

          <ProgressText>
            <ProgressLabel>Progreso:</ProgressLabel>
            <ProgressValue completed={progress.requirements.interacciones_noticias.met}>
              {progress.requirements.interacciones_noticias.current} / {progress.requirements.interacciones_noticias.target} {REQUIREMENTS_UI.interacciones_noticias.unit}
            </ProgressValue>
          </ProgressText>
        </RequirementCard>

        {/* Requisito 3: Contenido Simple */}
        <RequirementCard completed={progress.requirements.contenido_simple.met}>
          <RequirementHeader>
            <RequirementTitle>
              <RequirementIcon>{REQUIREMENTS_UI.contenido_simple.icon}</RequirementIcon>
              {REQUIREMENTS_UI.contenido_simple.title}
            </RequirementTitle>
            <StatusIcon completed={progress.requirements.contenido_simple.met}>
              {progress.requirements.contenido_simple.met ? <FiCheckCircle /> : <FiClock />}
            </StatusIcon>
          </RequirementHeader>

          <p style={{color: '#666', fontSize: '0.9rem', margin: '0.5rem 0'}}>
            {REQUIREMENTS_UI.contenido_simple.description}
          </p>

          <ProgressBarContainer>
            <ProgressBarFill 
              percentage={(progress.requirements.contenido_simple.current / progress.requirements.contenido_simple.target) * 100}
              completed={progress.requirements.contenido_simple.met}
            />
          </ProgressBarContainer>

          <ProgressText>
            <ProgressLabel>Progreso:</ProgressLabel>
            <ProgressValue completed={progress.requirements.contenido_simple.met}>
              {progress.requirements.contenido_simple.current} / {progress.requirements.contenido_simple.target} {REQUIREMENTS_UI.contenido_simple.unit}
            </ProgressValue>
          </ProgressText>
        </RequirementCard>

        {/* Requisito 4: Reacciones Totales */}
        {progress.requirements.reacciones_totales && progress.requirements.reacciones_totales.target > 0 && (
          <RequirementCard completed={progress.requirements.reacciones_totales.met}>
            <RequirementHeader>
              <RequirementTitle>
                <RequirementIcon>{REQUIREMENTS_UI.reacciones_totales.icon}</RequirementIcon>
                {REQUIREMENTS_UI.reacciones_totales.title}
              </RequirementTitle>
              <StatusIcon completed={progress.requirements.reacciones_totales.met}>
                {progress.requirements.reacciones_totales.met ? <FiCheckCircle /> : <FiClock />}
              </StatusIcon>
            </RequirementHeader>

            <p style={{color: '#666', fontSize: '0.9rem', margin: '0.5rem 0'}}>
              {REQUIREMENTS_UI.reacciones_totales.description}
            </p>

            <ProgressBarContainer>
              <ProgressBarFill 
                percentage={(progress.requirements.reacciones_totales.current / progress.requirements.reacciones_totales.target) * 100}
                completed={progress.requirements.reacciones_totales.met}
              />
            </ProgressBarContainer>

            <ProgressText>
              <ProgressLabel>Progreso:</ProgressLabel>
              <ProgressValue completed={progress.requirements.reacciones_totales.met}>
                {progress.requirements.reacciones_totales.current} / {progress.requirements.reacciones_totales.target} {REQUIREMENTS_UI.reacciones_totales.unit}
              </ProgressValue>
            </ProgressText>
          </RequirementCard>
        )}

        {/* Requisito 5: Días Mínimos de Cuenta */}
        {progress.requirements.dias_minimos_cuenta && progress.requirements.dias_minimos_cuenta.target > 0 && (
          <RequirementCard completed={progress.requirements.dias_minimos_cuenta.met}>
            <RequirementHeader>
              <RequirementTitle>
                <RequirementIcon>{REQUIREMENTS_UI.dias_minimos_cuenta.icon}</RequirementIcon>
                {REQUIREMENTS_UI.dias_minimos_cuenta.title}
              </RequirementTitle>
              <StatusIcon completed={progress.requirements.dias_minimos_cuenta.met}>
                {progress.requirements.dias_minimos_cuenta.met ? <FiCheckCircle /> : <FiClock />}
              </StatusIcon>
            </RequirementHeader>

            <p style={{color: '#666', fontSize: '0.9rem', margin: '0.5rem 0'}}>
              {REQUIREMENTS_UI.dias_minimos_cuenta.description}
            </p>

            <ProgressBarContainer>
              <ProgressBarFill 
                percentage={(progress.requirements.dias_minimos_cuenta.current / progress.requirements.dias_minimos_cuenta.target) * 100}
                completed={progress.requirements.dias_minimos_cuenta.met}
              />
            </ProgressBarContainer>

            <ProgressText>
              <ProgressLabel>Progreso:</ProgressLabel>
              <ProgressValue completed={progress.requirements.dias_minimos_cuenta.met}>
                {progress.requirements.dias_minimos_cuenta.current} / {progress.requirements.dias_minimos_cuenta.target} {REQUIREMENTS_UI.dias_minimos_cuenta.unit}
              </ProgressValue>
            </ProgressText>
          </RequirementCard>
        )}
      </RequirementsGrid>

      {allRequirementsMet ? (
        <>
          <ActionButton onClick={handleActivateMonetization} disabled={activating}>
            <FiCheckCircle />
            {activating ? '⏳ Activando...' : '🎉 Activar Monetización Ahora'}
          </ActionButton>
          
          <TipBox style={{background: '#d1ecf1', borderColor: '#0c5460', color: '#0c5460'}}>
            <strong>🎊 ¡Felicitaciones!</strong><br/>
            Has cumplido todos los requisitos. Haz clic en el botón para activar la monetización 
            y comenzar a ganar dinero con tus publicaciones.
          </TipBox>
        </>
      ) : (
        <TipBox>
          <strong>💡 Consejos para completar los requisitos:</strong><br/>
          • Publica <strong>noticias de calidad</strong> con información relevante<br/>
          • Usa <strong>títulos atractivos</strong> para aumentar clicks<br/>
          • Comparte <strong>contenido variado</strong>: posts, imágenes y videos<br/>
          • Interactúa con la comunidad para <strong>aumentar tu visibilidad</strong><br/>
          • Sé <strong>consistente</strong> y publica regularmente
        </TipBox>
      )}
    </Container>
  );
}

export default MonetizationProgress;

