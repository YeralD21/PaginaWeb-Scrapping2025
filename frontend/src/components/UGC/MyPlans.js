import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8000';

const Container = styled.div`
  background: transparent;
  padding: 0;
  border-radius: 0;
  box-shadow: none;
`;

const Title = styled.h2`
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.8rem;
`;

const Loading = styled.div`
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.2rem;
`;

const Error = styled.div`
  text-align: center;
  padding: 2rem;
  color: #ff6b6b;
  background: rgba(220, 53, 69, 0.15);
  border-radius: 10px;
  border: 2px solid rgba(220, 53, 69, 0.3);
`;

const PlanCard = styled.div`
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1a1f3a 100%);
  padding: 2rem;
  border-radius: 15px;
  color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  margin-bottom: 2rem;
  border: 1px solid rgba(102, 126, 234, 0.3);
  backdrop-filter: blur(10px);
`;

const PlanName = styled.h3`
  font-size: 2rem;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PlanDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const DetailItem = styled.div`
  background: rgba(255, 255, 255, 0.15);
  padding: 1rem;
  border-radius: 10px;
  backdrop-filter: blur(10px);
`;

const DetailLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
`;

const DetailValue = styled.div`
  font-size: 1.3rem;
  font-weight: bold;
`;

const TimeRemaining = styled.div`
  background: ${props => {
    if (props.days <= 3) return 'rgba(255, 107, 107, 0.3)';
    if (props.days <= 7) return 'rgba(255, 193, 7, 0.3)';
    return 'rgba(67, 233, 123, 0.3)';
  }};
  padding: 1.5rem;
  border-radius: 10px;
  margin-top: 1rem;
  text-align: center;
  border: 2px solid ${props => {
    if (props.days <= 3) return 'rgba(255, 107, 107, 0.5)';
    if (props.days <= 7) return 'rgba(255, 193, 7, 0.5)';
    return 'rgba(67, 233, 123, 0.5)';
  }};
`;

const TimeValue = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0.5rem 0;
`;

const TimeLabel = styled.div`
  font-size: 1rem;
  opacity: 0.9;
`;

const NoPlanCard = styled.div`
  background: rgba(26, 31, 58, 0.6);
  backdrop-filter: blur(10px);
  padding: 3rem;
  border-radius: 15px;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  border: 2px solid rgba(102, 126, 234, 0.3);
`;

const NoPlanTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.95);
`;

const NoPlanText = styled.p`
  font-size: 1.1rem;
  margin-bottom: 2rem;
  color: rgba(255, 255, 255, 0.7);
`;

const SubscribeButton = styled.button`
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  }
`;

const BenefitsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1.5rem 0 0 0;
`;

const BenefitItem = styled.li`
  padding: 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::before {
    content: '✓';
    color: #43e97b;
    font-weight: bold;
    font-size: 1.2rem;
  }
`;

function MyPlans({ token }) {
  const navigate = useNavigate();
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [token]);

  // Actualizar el tiempo actual cada segundo para planes cortos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchSubscriptionStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE}/subscriptions/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSubscriptionStatus(response.data);
    } catch (err) {
      console.error('Error fetching subscription status:', err);
      setError(err.response?.data?.detail || 'Error al cargar información de suscripción');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimeRemaining = (days, hours, minutes, totalSeconds = 0) => {
    // Si el tiempo es negativo o cero, está expirado
    if (totalSeconds <= 0) {
      return 'Expirado';
    }

    // Recalcular todo desde totalSeconds para asegurar precisión
    const calculatedDays = Math.floor(totalSeconds / (60 * 60 * 24));
    const remainingAfterDays = totalSeconds % (60 * 60 * 24);
    const calculatedHours = Math.floor(remainingAfterDays / (60 * 60));
    const remainingAfterHours = remainingAfterDays % (60 * 60);
    const calculatedMinutes = Math.floor(remainingAfterHours / 60);
    const calculatedSeconds = remainingAfterHours % 60;

    // Para períodos muy cortos (menos de 1 hora), mostrar solo minutos y segundos
    if (totalSeconds < 3600) {
      if (calculatedMinutes > 0 && calculatedSeconds > 0) {
        return `${calculatedMinutes} minuto${calculatedMinutes > 1 ? 's' : ''} ${calculatedSeconds} segundo${calculatedSeconds > 1 ? 's' : ''}`;
      } else if (calculatedMinutes > 0) {
        return `${calculatedMinutes} minuto${calculatedMinutes > 1 ? 's' : ''}`;
      } else {
        return `${calculatedSeconds} segundo${calculatedSeconds > 1 ? 's' : ''}`;
      }
    }

    // Para períodos cortos (menos de 1 día pero más de 1 hora), mostrar horas y minutos
    if (calculatedDays === 0 && calculatedHours > 0) {
      if (calculatedMinutes > 0) {
        return `${calculatedHours} hora${calculatedHours > 1 ? 's' : ''} ${calculatedMinutes} minuto${calculatedMinutes > 1 ? 's' : ''}`;
      }
      return `${calculatedHours} hora${calculatedHours > 1 ? 's' : ''}`;
    }

    // Para períodos largos (más de 1 día), mostrar días y horas
    if (calculatedDays > 0) {
      if (calculatedHours > 0) {
        return `${calculatedDays} día${calculatedDays > 1 ? 's' : ''} ${calculatedHours} hora${calculatedHours > 1 ? 's' : ''}`;
      }
      return `${calculatedDays} día${calculatedDays > 1 ? 's' : ''}`;
    }

    return 'Expirado';
  };

  const handleSubscribe = () => {
    navigate('/premium');
  };

  if (loading) {
    return (
      <Container>
        <Loading>⏳ Cargando información de tu plan...</Loading>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Error>❌ {error}</Error>
      </Container>
    );
  }

  const activeSubscription = subscriptionStatus?.active_subscription;
  const pendingSubscription = subscriptionStatus?.pending_subscription;
  const rejectedSubscription = subscriptionStatus?.rejected_subscription;

  // Si hay una suscripción activa
  if (activeSubscription) {
    const plan = activeSubscription.plan;
    const fechaFin = activeSubscription.fecha_fin;
    
    // Calcular tiempo restante de manera precisa
    let days = 0;
    let hours = 0;
    let minutes = 0;
    let totalSeconds = 0;
    
    if (fechaFin) {
      const now = currentTime; // Usar el tiempo actual actualizado
      const endDate = new Date(fechaFin);
      const diffMs = endDate - now;
      
      if (diffMs > 0) {
        // Calcular el total de segundos primero para mayor precisión
        // Usar Math.max para asegurar que no sea negativo
        totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
        
        // Calcular días, horas y minutos de manera precisa (solo para referencia, la función formatTimeRemaining recalcula)
        days = Math.floor(totalSeconds / (60 * 60 * 24));
        const remainingAfterDays = totalSeconds % (60 * 60 * 24);
        hours = Math.floor(remainingAfterDays / (60 * 60));
        const remainingAfterHours = remainingAfterDays % (60 * 60);
        minutes = Math.floor(remainingAfterHours / 60);
      } else {
        // Si ya expiró, establecer todo en 0
        totalSeconds = 0;
        days = 0;
        hours = 0;
        minutes = 0;
      }
    } else {
      // Si no hay fecha de fin, usar dias_restantes si está disponible
      days = activeSubscription.dias_restantes || 0;
      totalSeconds = days * 24 * 60 * 60; // Convertir días a segundos
    }

    return (
      <Container>
        <Title>⭐ Mis Planes</Title>
        
        <PlanCard>
          <PlanName>
            ⭐ {plan?.nombre || 'Plan Premium'}
          </PlanName>
          
          <PlanDetails>
            <DetailItem>
              <DetailLabel>Precio</DetailLabel>
              <DetailValue>${plan?.precio || 0}</DetailValue>
            </DetailItem>
            
            <DetailItem>
              <DetailLabel>Fecha de Inicio</DetailLabel>
              <DetailValue>{formatDate(activeSubscription.fecha_inicio)}</DetailValue>
            </DetailItem>
            
            <DetailItem>
              <DetailLabel>Fecha de Expiración</DetailLabel>
              <DetailValue>{formatDate(activeSubscription.fecha_fin)}</DetailValue>
            </DetailItem>
            
            <DetailItem>
              <DetailLabel>Estado</DetailLabel>
              <DetailValue>
                <span style={{ 
                  background: 'rgba(67, 233, 123, 0.3)', 
                  padding: '0.3rem 0.8rem', 
                  borderRadius: '20px',
                  fontSize: '0.9rem'
                }}>
                  ✅ Activo
                </span>
              </DetailValue>
            </DetailItem>
          </PlanDetails>

          {plan?.beneficios && plan.beneficios.length > 0 && (
            <BenefitsList>
              {plan.beneficios.map((beneficio, index) => (
                <BenefitItem key={index}>{beneficio}</BenefitItem>
              ))}
            </BenefitsList>
          )}

          <TimeRemaining days={days}>
            <DetailLabel>Tiempo Restante</DetailLabel>
            <TimeValue>{formatTimeRemaining(days, hours, minutes, totalSeconds)}</TimeValue>
            {(days <= 7 || hours <= 24 || minutes <= 60) && totalSeconds > 0 && (
              <TimeLabel>
                {(days <= 3 || (days === 0 && hours <= 12) || (days === 0 && hours === 0 && minutes <= 30))
                  ? '⚠️ Tu plan expirará pronto. Considera renovar.'
                  : '⏰ Tu plan expirará en breve.'
                }
              </TimeLabel>
            )}
          </TimeRemaining>
        </PlanCard>
      </Container>
    );
  }

  // Si hay una suscripción pendiente
  if (pendingSubscription) {
    return (
      <Container>
        <Title>⭐ Mis Planes</Title>
        
        <PlanCard style={{ background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)' }}>
          <PlanName>⏳ Suscripción Pendiente</PlanName>
          <p style={{ fontSize: '1.1rem', marginTop: '1rem' }}>
            Tu solicitud de suscripción al plan <strong>{pendingSubscription.plan?.nombre}</strong> está siendo revisada.
          </p>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.9 }}>
            Fecha de solicitud: {formatDate(pendingSubscription.fecha_pago_notificado || pendingSubscription.creado_en)}
          </p>
        </PlanCard>
      </Container>
    );
  }

  // Si hay una suscripción rechazada
  if (rejectedSubscription) {
    return (
      <Container>
        <Title>⭐ Mis Planes</Title>
        
        <PlanCard style={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%)' }}>
          <PlanName>❌ Suscripción Rechazada</PlanName>
          <p style={{ fontSize: '1.1rem', marginTop: '1rem' }}>
            Tu solicitud de suscripción fue rechazada.
          </p>
          {rejectedSubscription.motivo_rechazo && (
            <p style={{ fontSize: '1rem', marginTop: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '10px' }}>
              <strong>Motivo:</strong> {rejectedSubscription.motivo_rechazo}
            </p>
          )}
          <SubscribeButton onClick={handleSubscribe} style={{ marginTop: '1.5rem' }}>
            Ver Planes Disponibles
          </SubscribeButton>
        </PlanCard>
      </Container>
    );
  }

  // Si no hay suscripción
  return (
    <Container>
      <Title>⭐ Mis Planes</Title>
      
      <NoPlanCard>
        <NoPlanTitle>No tienes una suscripción activa</NoPlanTitle>
        <NoPlanText>
          Suscríbete a uno de nuestros planes premium para acceder a contenido exclusivo y análisis profundo.
        </NoPlanText>
        <SubscribeButton onClick={handleSubscribe}>
          Ver Planes Premium
        </SubscribeButton>
      </NoPlanCard>
    </Container>
  );
}

export default MyPlans;

