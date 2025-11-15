import React, { useEffect, useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import LoginModal from '../Auth/LoginModal';
import RegisterModal from '../Auth/RegisterModal';

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(11, 10, 30, 0.72);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${props => props.$showAuthModal ? 1300 : 1200};
`;

const Modal = styled.div`
  width: min(1400px, 95vw);
  max-height: 90vh;
  background: #fff;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 35px 80px rgba(25, 18, 72, 0.35);
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  
  @media (max-width: 1200px) {
    width: min(1200px, 95vw);
    padding: 1.2rem;
  }
  
  @media (max-width: 768px) {
    width: 95vw;
    padding: 1rem;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  font-size: 1.6rem;
  cursor: pointer;
  color: #8f8ba5;

  &:hover {
    color: #5f5a82;
  }
`;

const ModalTitle = styled.h2`
  margin: 0 0 0.5rem 0;
  font-size: 1.4rem;
  color: #28175a;
  
  @media (max-width: 1200px) {
    font-size: 1.2rem;
  }
`;

const ModalSubtitle = styled.p`
  color: #605f7d;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  line-height: 1.4;
  
  @media (max-width: 1200px) {
    font-size: 0.8rem;
    margin-bottom: 0.8rem;
  }
`;

const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.9rem;
  margin-top: 1rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.8rem;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }
`;

const PlanCard = styled.div`
  border: 2px solid ${props => props.$popular ? '#ff6b6b' : 'rgba(107, 80, 255, 0.15)'};
  border-radius: 14px;
  padding: 1rem;
  background: ${props => props.$popular 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    : props.$selected 
      ? 'linear-gradient(135deg,#6a5acd 0%,#4b2fbf 100%)' 
      : '#ffffff'};
  color: ${props => (props.$popular || props.$selected) ? 'white' : '#2d1b69'};
  box-shadow: ${props => props.$popular 
    ? '0 20px 50px rgba(102, 126, 234, 0.4)' 
    : props.$selected 
      ? '0 18px 40px rgba(82, 66, 185, 0.35)' 
      : '0 10px 30px rgba(0, 0, 0, 0.1)'};
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  min-height: 0; /* Permite que el contenido se ajuste */

  &:hover {
    transform: translateY(-3px);
    box-shadow: ${props => props.$popular 
      ? '0 25px 60px rgba(102, 126, 234, 0.5)' 
      : '0 20px 50px rgba(82, 66, 185, 0.4)'};
  }
  
  @media (max-width: 1200px) {
    padding: 0.9rem;
  }
`;

const PopularBadge = styled.div`
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  background: #ff6b6b;
  color: white;
  padding: 0.25rem 0.6rem;
  border-radius: 10px;
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
  
  @media (max-width: 1200px) {
    font-size: 0.55rem;
    padding: 0.2rem 0.5rem;
  }
`;

const PlanName = styled.div`
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  
  @media (max-width: 1200px) {
    font-size: 0.9rem;
  }
`;

const DailyPrice = styled.div`
  font-size: 1.6rem;
  font-weight: 900;
  margin-bottom: 0.2rem;
  line-height: 1;
  
  @media (max-width: 1200px) {
    font-size: 1.5rem;
  }
`;

const TotalPrice = styled.div`
  font-size: 0.8rem;
  opacity: 0.9;
  margin-bottom: 0.6rem;
  font-weight: 500;
  
  @media (max-width: 1200px) {
    font-size: 0.75rem;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: ${props => (props.$popular || props.$selected) 
    ? 'rgba(255, 255, 255, 0.3)' 
    : 'rgba(45, 27, 105, 0.2)'};
  margin: 0.6rem 0;
  border: none;
  border-top: 1px dashed ${props => (props.$popular || props.$selected) 
    ? 'rgba(255, 255, 255, 0.3)' 
    : 'rgba(45, 27, 105, 0.2)'};
`;

const BenefitList = styled.ul`
  margin: 0.5rem 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.75rem;
  flex-grow: 1;
  
  @media (max-width: 1200px) {
    font-size: 0.7rem;
    gap: 0.35rem;
  }
`;

const BenefitItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  
  &::before {
    content: '✓';
    color: ${props => (props.$popular || props.$selected) ? '#51cf66' : '#667eea'};
    font-weight: 900;
    font-size: 1.1rem;
    flex-shrink: 0;
  }
`;

const PrimaryButton = styled.button`
  width: 100%;
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  border: none;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  background: ${props => props.$popular 
    ? 'linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%)' 
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  color: white;
  box-shadow: ${props => props.$popular 
    ? '0 8px 25px rgba(255, 107, 107, 0.4)' 
    : '0 8px 25px rgba(102, 126, 234, 0.3)'};
  transition: all 0.3s ease;
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.$popular 
      ? '0 12px 35px rgba(255, 107, 107, 0.5)' 
      : '0 12px 35px rgba(102, 126, 234, 0.4)'};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 1200px) {
    padding: 0.55rem 0.75rem;
    font-size: 0.75rem;
  }
`;

const InstructionsCard = styled.div`
  margin-top: 1.5rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  }

  @media (max-width: 768px) {
    padding: 1.2rem;
  }
`;

const QRImage = styled.img`
  width: 220px;
  height: 220px;
  object-fit: contain;
  border-radius: 12px;
  border: 1px solid rgba(120, 110, 255, 0.2);
  background: white;
`;

const InstructionList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  color: #2d1b69;
  
  li {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 10px;
    border-left: 3px solid #667eea;
    transition: all 0.2s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.9);
      transform: translateX(4px);
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
    }
    
    &::before {
      content: '✓';
      color: #667eea;
      font-weight: 700;
      font-size: 1.1rem;
      flex-shrink: 0;
      margin-top: 0.1rem;
    }
  }
`;

const Highlight = styled.span`
  font-weight: 700;
  color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  display: inline-block;
  border: 1px solid rgba(102, 126, 234, 0.2);
`;

const AuthButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  justify-content: center;
`;

const AuthButton = styled.button`
  flex: 1;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const LoginButton = styled(AuthButton)`
  background: #D32F2F;
  color: white;

  &:hover {
    background: #B71C1C;
    box-shadow: 0 8px 25px rgba(211, 47, 47, 0.3);
  }
`;

const RegisterButton = styled(AuthButton)`
  background: #1976D2;
  color: white;

  &:hover {
    background: #1565C0;
    box-shadow: 0 8px 25px rgba(25, 118, 210, 0.3);
  }
`;

const API_BASE = 'http://localhost:8000';

function SubscriptionModal({ isOpen, onClose, pendingNews, onSubscriptionSuccess }) {
  const { token, isAuthenticated, subscription, subscriptionLoading, refreshSubscription } = useAuth();
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [checkoutInfo, setCheckoutInfo] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentNotified, setPaymentNotified] = useState(false);
  const [notifyingPayment, setNotifyingPayment] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [currentStep, setCurrentStep] = useState('plans'); // 'plans' o 'checkout'
  const subscriptionRefreshedRef = useRef(false);
  const activeSubscriptionCheckedRef = useRef(false);

  const userIsAuthenticated = isAuthenticated();

  // Resetear todo cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setCheckoutInfo(null);
      setSelectedPlan(null);
      setShowLoginModal(false);
      setShowRegisterModal(false);
      setCurrentStep('plans');
      setPaymentNotified(false);
      setNotifyingPayment(false);
      subscriptionRefreshedRef.current = false;
      return;
    }
  }, [isOpen]);

  // Verificar si el usuario tiene suscripción activa cuando se abre el modal
  // Si tiene suscripción activa y hay una noticia pendiente, cerrar el modal y navegar a la noticia
  useEffect(() => {
    const checkAndNavigate = async () => {
      if (isOpen && userIsAuthenticated && token && pendingNews && !activeSubscriptionCheckedRef.current) {
        activeSubscriptionCheckedRef.current = true;
        
        // Verificar directamente desde el endpoint para asegurar datos actualizados
        try {
          const statusResponse = await axios.get(`${API_BASE}/subscriptions/status`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          const hasActive = statusResponse.data?.has_active && statusResponse.data?.active_subscription;
          
          if (hasActive) {
            // Actualizar la suscripción en el contexto
            await refreshSubscription(token);
            // El usuario tiene suscripción activa, cerrar el modal y navegar a la noticia
            if (onSubscriptionSuccess && pendingNews) {
              // Usar un pequeño delay para asegurar que el estado se actualiza
              setTimeout(() => {
                onClose();
                if (onSubscriptionSuccess) {
                  onSubscriptionSuccess(pendingNews);
                }
              }, 100);
            } else {
              onClose();
            }
            return;
          }
        } catch (err) {
          console.error('Error verificando suscripción en modal:', err);
          // Si hay error, verificar el estado local como fallback
          if (!subscriptionLoading && subscription && subscription.estado === 'active') {
            if (onSubscriptionSuccess && pendingNews) {
              setTimeout(() => {
                onClose();
                if (onSubscriptionSuccess) {
                  onSubscriptionSuccess(pendingNews);
                }
              }, 100);
            } else {
              onClose();
            }
            return;
          }
        }
      }
    };

    checkAndNavigate();
  }, [isOpen, userIsAuthenticated, token, subscriptionLoading, subscription, pendingNews, onClose, onSubscriptionSuccess, refreshSubscription]);

  // Resetear el flag cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      activeSubscriptionCheckedRef.current = false;
    }
  }, [isOpen]);

  // Función memoizada para cargar planes
  const fetchPlans = useCallback(async () => {
    setPlansLoading(true);
    setPlansError(null);
    try {
      const response = await axios.get(`${API_BASE}/subscriptions/plans`);
      setPlans(response.data || []);
    } catch (error) {
      console.error('Error cargando planes:', error);
      setPlansError(error.response?.data?.detail || error.message);
    } finally {
      setPlansLoading(false);
    }
  }, []); // Sin dependencias, función estable

  // Cargar planes siempre que se abre el modal (no requiere autenticación)
  useEffect(() => {
    if (isOpen) {
      fetchPlans();
      // Refrescar suscripción solo si el usuario está autenticado
      if (userIsAuthenticated && token && !subscriptionRefreshedRef.current) {
        subscriptionRefreshedRef.current = true;
        refreshSubscription(token);
      }
    }
  }, [isOpen, fetchPlans]); // Cargar planes siempre, sin depender de autenticación

  // Cuando el usuario se autentica, cerrar modales de auth y cargar planes
  useEffect(() => {
    if (isOpen && userIsAuthenticated && token && (showLoginModal || showRegisterModal)) {
      setShowLoginModal(false);
      setShowRegisterModal(false);
      // Pequeño delay para asegurar que el token esté disponible
      const timeoutId = setTimeout(() => {
        fetchPlans();
        if (!subscriptionRefreshedRef.current) {
          subscriptionRefreshedRef.current = true;
          refreshSubscription(token);
        }
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [userIsAuthenticated, showLoginModal, showRegisterModal, isOpen, token, fetchPlans, refreshSubscription]);

  const handleSubscribe = async (planId) => {
    if (!isAuthenticated()) return;
    
    // Encontrar el plan seleccionado
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;
    
    setSelectedPlan(plan);
    setCheckoutLoading(true);
    setPlansError(null);
    
    try {
      const response = await axios.post(`${API_BASE}/subscriptions/checkout`, {
        plan_id: planId,
        renovacion_automatica: false,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCheckoutInfo(response.data);
      setPaymentNotified(false); // Resetear estado de pago notificado
      // Cambiar al paso de checkout
      setCurrentStep('checkout');
    } catch (error) {
      console.error('Error iniciando checkout:', error);
      setPlansError(error.response?.data?.detail || error.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleNotifyPayment = async () => {
    if (!checkoutInfo || !checkoutInfo.subscription_id) {
      alert('Error: No se encontró información de la suscripción');
      return;
    }
    
    if (!token) {
      alert('Error: Debes estar autenticado para notificar el pago');
      return;
    }
    
    setNotifyingPayment(true);
    try {
      const response = await axios.post(`${API_BASE}/subscriptions/payment/notify`, {
        subscription_id: checkoutInfo.subscription_id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Pago notificado exitosamente:', response.data);
      setPaymentNotified(true);
    } catch (error) {
      console.error('Error notificando pago:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Error al notificar el pago';
      alert(`Error: ${errorMessage}\n\nPor favor, asegúrate de que el servidor backend esté corriendo y reiniciado.`);
      setNotifyingPayment(false);
    }
  };

  const renderStatus = () => {
    if (subscriptionLoading) {
      return (
        <div style={{ marginBottom: '1.5rem', color: '#6f6ba5' }}>
          Verificando estado de suscripción...
        </div>
      );
    }

    if (subscription && subscription.estado === 'active') {
      return (
        <div style={{
          marginBottom: '1.5rem',
          padding: '1rem 1.5rem',
          borderRadius: '14px',
          background: 'linear-gradient(135deg,#51cf66 0%,#2f9e44 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            ✔️ Suscripción activa ({subscription.plan?.nombre}) - vence el {subscription.fecha_fin ? new Date(subscription.fecha_fin).toLocaleDateString() : 'sin fecha'}
          </div>
        </div>
      );
    }

    if (subscription && subscription.estado === 'pending') {
      return (
        <div style={{
          marginBottom: '1.5rem',
          padding: '1rem 1.5rem',
          borderRadius: '14px',
          background: 'linear-gradient(135deg,#ffd43b 0%,#f08c00 100%)',
          color: '#2d1b69'
        }}>
          ⏳ Tienes un pago pendiente ({subscription.plan?.nombre}). Envía el comprobante con la referencia <strong>{subscription.referencia_pago}</strong> para activar tu acceso.
        </div>
      );
    }

    return (
      <div style={{
        marginBottom: '1.5rem',
        padding: '1rem 1.5rem',
        borderRadius: '14px',
        background: 'rgba(247, 244, 255, 0.9)',
        color: '#433c7e',
        border: '1px solid rgba(123, 97, 255, 0.18)'
      }}>
        🔒 Necesitas una suscripción activa para leer noticias premium.
      </div>
    );
  };

  if (!isOpen) return null;

  const notAuthenticatedContent = !userIsAuthenticated;

  return (
    <Backdrop $showAuthModal={showLoginModal || showRegisterModal}>
      <Modal>
        <CloseButton onClick={onClose}>×</CloseButton>
        <ModalTitle>Acceso Premium</ModalTitle>
        <ModalSubtitle>
          {pendingNews
            ? `“${pendingNews.titulo?.slice(0, 120)}${pendingNews.titulo && pendingNews.titulo.length > 120 ? '…' : ''}” es una noticia exclusiva.`
            : 'Suscríbete para desbloquear noticias exclusivas y análisis premium.'}
        </ModalSubtitle>

        <>
          {/* Mostrar mensaje de autenticación si no está autenticado */}
          {notAuthenticatedContent && (
            <div style={{
              background: 'linear-gradient(135deg, #ffd43b 0%, #f08c00 100%)',
              color: '#2d1b69',
              padding: '1rem',
              borderRadius: '12px',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '0.3rem', fontSize: '0.9rem' }}>
                🔐 Inicia sesión o regístrate para suscribirte
              </div>
              <div style={{ fontSize: '0.8rem', marginBottom: '0.8rem' }}>
                Puedes ver los planes ahora, pero necesitas una cuenta para continuar
              </div>
              <AuthButtonsContainer>
                <LoginButton onClick={() => {
                  setShowLoginModal(true);
                }}>
                  Iniciar Sesión
                </LoginButton>
                <RegisterButton onClick={() => {
                  setShowRegisterModal(true);
                }}>
                  Registrarse
                </RegisterButton>
              </AuthButtonsContainer>
            </div>
          )}

          {/* Solo mostrar el estado si tiene suscripción activa o pendiente, o si está cargando */}
          {!notAuthenticatedContent && ((subscription && (subscription.estado === 'active' || subscription.estado === 'pending')) || subscriptionLoading) && renderStatus()}

          {/* Paso 1: Mostrar Planes - SIEMPRE visible */}
          {currentStep === 'plans' && (
              <>
                {/* Mensaje informativo si no tiene suscripción activa */}
                {!subscriptionLoading && (!subscription || (subscription.estado !== 'active' && subscription.estado !== 'pending')) && (
                  <div style={{
                    marginBottom: '0.8rem',
                    padding: '0.8rem 1rem',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.3rem' }}>
                      🎯 Elige tu plan premium
                    </div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                      Selecciona el plan que mejor se adapte a tus necesidades
                    </div>
                  </div>
                )}

                {plansError && (
                  <div style={{
                    marginBottom: '0.8rem',
                    padding: '0.7rem 1rem',
                    borderRadius: '10px',
                    background: '#ffe3e3',
                    color: '#a61e4d',
                    fontSize: '0.85rem'
                  }}>
                    {plansError}
                  </div>
                )}

                {plansLoading ? (
                  <div style={{ padding: '2rem 0', textAlign: 'center', color: '#6f6ba5' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
                    <div>Cargando planes...</div>
                  </div>
                ) : plans.length === 0 ? (
                  <div style={{ padding: '2rem 0', textAlign: 'center', color: '#6f6ba5' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📋</div>
                    <div>No hay planes disponibles en este momento.</div>
                  </div>
                ) : (
                  <PlansGrid>
                    {plans.map((plan, index) => {
                      const selected = selectedPlan?.id === plan.id;
                      // Determinar si es el plan más popular (por defecto el mensual o el segundo)
                      const isPopular = plan.periodo.toLowerCase() === 'mensual' || index === 1;
                      
                      // Calcular precio diario según el período
                      const getDailyPrice = () => {
                        const periodo = plan.periodo.toLowerCase();
                        if (periodo === 'semanal') return plan.precio / 7;
                        if (periodo === 'mensual') return plan.precio / 30;
                        if (periodo === 'anual') return plan.precio / 365;
                        return plan.precio / 30; // Por defecto mensual
                      };
                      
                      const dailyPrice = getDailyPrice();
                      const periodLabel = plan.periodo === 'semanal' ? 'Semana' : 
                                         plan.periodo === 'mensual' ? 'Mes' : 
                                         plan.periodo === 'anual' ? 'Año' : plan.periodo;
                      
                      return (
                        <PlanCard
                          key={plan.id}
                          $selected={selected}
                          $popular={isPopular}
                          onClick={() => setSelectedPlan(plan)}
                        >
                          {isPopular && <PopularBadge>Más Popular</PopularBadge>}
                          
                          <PlanName>
                            Plan {periodLabel}
                          </PlanName>
                          
                          <DailyPrice>${dailyPrice.toFixed(2)}<span style={{ fontSize: '1.2rem', fontWeight: '500' }}>/día</span></DailyPrice>
                          <TotalPrice>${plan.precio.toFixed(2)} / {periodLabel}</TotalPrice>
                          
                          <Divider $popular={isPopular} $selected={selected} />
                          
                          <BenefitList>
                            {(Array.isArray(plan.beneficios) ? plan.beneficios : [
                              'Acceso ilimitado a noticias premium',
                              'Análisis exclusivos y reportes',
                              'Sin límites de lectura',
                              'Contenido de alta calidad',
                              'Soporte prioritario'
                            ]).map((beneficio, idx) => (
                              <BenefitItem key={idx} $popular={isPopular} $selected={selected}>
                                {beneficio}
                              </BenefitItem>
                            ))}
                          </BenefitList>
                          
                          <PrimaryButton
                            $popular={isPopular}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!userIsAuthenticated) {
                                setShowLoginModal(true);
                                return;
                              }
                              setSelectedPlan(plan);
                              handleSubscribe(plan.id);
                            }}
                            disabled={checkoutLoading || !userIsAuthenticated}
                          >
                            {!userIsAuthenticated 
                              ? '🔐 Inicia Sesión para Suscribirte' 
                              : checkoutLoading && selected 
                                ? '⏳ Procesando...' 
                                : '🚀 Suscribirme Ahora'}
                          </PrimaryButton>
                        </PlanCard>
                      );
                    })}
                  </PlansGrid>
                )}
              </>
            )}

            {/* Paso 2: Pasarela de Pago */}
            {currentStep === 'checkout' && checkoutInfo && (
              <div>
                {/* Botón para volver atrás */}
                <button
                  onClick={() => setCurrentStep('plans')}
                  style={{
                    background: 'transparent',
                    border: '1px solid #667eea',
                    color: '#667eea',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9rem'
                  }}
                >
                  ← Volver a Planes
                </button>

                {/* Información del plan seleccionado */}
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '1.5rem',
                  borderRadius: '15px',
                  marginBottom: '2rem',
                  textAlign: 'center'
                }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem' }}>
                    Plan Seleccionado: {checkoutInfo.plan?.nombre || selectedPlan?.nombre}
                  </h3>
                  <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.9 }}>
                    Monto: ${checkoutInfo.plan?.precio?.toFixed(2) || selectedPlan?.precio?.toFixed(2)}
                  </p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', opacity: 0.8 }}>
                    Referencia: <strong>{checkoutInfo.referencia_pago}</strong>
                  </p>
                </div>

                {/* Métodos de pago */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '2rem',
                  marginBottom: '2rem'
                }}>
                  {/* Método 1: QR Yape */}
                  <div style={{
                    background: '#f8f9fa',
                    border: '2px solid #e9ecef',
                    borderRadius: '15px',
                    padding: '2rem',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📱</div>
                    <h3 style={{ margin: '0 0 1rem 0', color: '#2d1b69' }}>Pagar con Yape</h3>
                    <div style={{
                      background: 'white',
                      border: '1px solid #dee2e6',
                      borderRadius: '10px',
                      padding: '1.5rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      minHeight: '220px'
                    }}>
                      <QRImage
                        src="/images/QR_PAGO.jpg"
                        alt="QR Yape"
                        style={{ maxWidth: '100%', height: 'auto' }}
                      />
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#6c757d' }}>
                      Escanea el código QR con tu app Yape para pagar
                    </p>
                  </div>

                  {/* Método 2: PayPal */}
                  <div style={{
                    background: '#f8f9fa',
                    border: '2px solid #e9ecef',
                    borderRadius: '15px',
                    padding: '2rem',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💳</div>
                    <h3 style={{ margin: '0 0 1rem 0', color: '#2d1b69' }}>Pagar con PayPal</h3>
                    <div style={{
                      background: 'white',
                      border: '1px solid #dee2e6',
                      borderRadius: '10px',
                      padding: '1.5rem',
                      marginBottom: '1rem',
                      minHeight: '220px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <img
                        src="/images/paypal_logo.png"
                        alt="PayPal Logo"
                        style={{
                          maxWidth: '180px',
                          height: 'auto',
                          marginBottom: '1rem'
                        }}
                      />
                    </div>
                    <a
                      href="https://www.paypal.me/fabinho1710"
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-block',
                        background: 'linear-gradient(135deg, #0070ba 0%, #003087 100%)',
                        color: 'white',
                        padding: '0.75rem 2rem',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: '600',
                        marginTop: '0.5rem',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 112, 186, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      Ir a PayPal
                    </a>
                    <p style={{ margin: '1rem 0 0 0', fontSize: '0.9rem', color: '#6c757d' }}>
                      Serás redirigido a PayPal para completar el pago
                    </p>
                  </div>
                </div>

                {/* Instrucciones adicionales */}
                <InstructionsCard>
                  <div style={{ width: '100%' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '1.25rem',
                      paddingBottom: '1rem',
                      borderBottom: '2px solid rgba(102, 126, 234, 0.2)'
                    }}>
                      <div style={{
                        fontSize: '1.8rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: '700'
                      }}>
                        📋
                      </div>
                      <h3 style={{
                        margin: 0,
                        color: '#2d1b69',
                        fontSize: '1.3rem',
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        Instrucciones de pago
                      </h3>
                    </div>
                    <InstructionList>
                      <li>
                        <span style={{ flex: 1 }}>
                          <strong style={{ color: '#667eea' }}>Referencia de pago:</strong>{' '}
                          <Highlight>{checkoutInfo.referencia_pago}</Highlight>
                        </span>
                      </li>
                      <li>
                        <span style={{ flex: 1 }}>
                          <strong style={{ color: '#667eea' }}>Plan:</strong>{' '}
                          <Highlight>{checkoutInfo.plan?.nombre || selectedPlan?.nombre}</Highlight>
                        </span>
                      </li>
                      <li>
                        <span style={{ flex: 1 }}>
                          <strong style={{ color: '#667eea' }}>Monto:</strong>{' '}
                          <Highlight>${checkoutInfo.plan?.precio?.toFixed(2) || selectedPlan?.precio?.toFixed(2)}</Highlight>
                        </span>
                      </li>
                      <li>
                        <span style={{ flex: 1 }}>
                          Elige uno de los métodos de pago arriba (Yape o PayPal)
                        </span>
                      </li>
                      <li>
                        <span style={{ flex: 1 }}>
                          Después de pagar, envía el comprobante a{' '}
                          <Highlight style={{
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
                            padding: '0.25rem 0.7rem',
                            borderRadius: '6px',
                            fontWeight: '700',
                            color: '#667eea',
                            border: '1px solid rgba(102, 126, 234, 0.3)'
                          }}>
                            soporte@tuapp.com
                          </Highlight>{' '}
                          indicando la referencia de pago
                        </span>
                      </li>
                      <li>
                        <span style={{ flex: 1 }}>
                          Tu suscripción se activará una vez verificado el pago
                        </span>
                      </li>
                    </InstructionList>
                  </div>
                </InstructionsCard>

                {/* Botón "Ya pagué" y mensaje de verificación */}
                {!paymentNotified ? (
                  <div style={{
                    marginTop: '1.5rem',
                    textAlign: 'center'
                  }}>
                    <button
                      onClick={handleNotifyPayment}
                      disabled={notifyingPayment}
                      style={{
                        background: 'linear-gradient(135deg, #51cf66 0%, #2f9e44 100%)',
                        color: 'white',
                        padding: '1rem 2.5rem',
                        borderRadius: '12px',
                        border: 'none',
                        fontSize: '1rem',
                        fontWeight: '700',
                        cursor: notifyingPayment ? 'not-allowed' : 'pointer',
                        boxShadow: '0 8px 25px rgba(81, 207, 102, 0.4)',
                        transition: 'all 0.3s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        opacity: notifyingPayment ? 0.7 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (!notifyingPayment) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 12px 35px rgba(81, 207, 102, 0.5)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!notifyingPayment) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 8px 25px rgba(81, 207, 102, 0.4)';
                        }
                      }}
                    >
                      {notifyingPayment ? (
                        <>
                          <span>⏳</span>
                          <span>Procesando...</span>
                        </>
                      ) : (
                        <>
                          <span>✅</span>
                          <span>Ya pagué</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div style={{
                    marginTop: '1.5rem',
                    padding: '1.5rem',
                    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.08) 100%)',
                    border: '2px solid rgba(255, 215, 0, 0.4)',
                    borderRadius: '16px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '2.5rem',
                      marginBottom: '1rem'
                    }}>
                      ⏳
                    </div>
                    <h3 style={{
                      margin: '0 0 0.75rem 0',
                      color: '#2d1b69',
                      fontSize: '1.3rem',
                      fontWeight: '700'
                    }}>
                      Verificando el Pago
                    </h3>
                    <p style={{
                      margin: 0,
                      color: '#605f7d',
                      fontSize: '0.95rem',
                      lineHeight: '1.6'
                    }}>
                      Espere unos minutos que se actualice su Plan y vuelva a loguearse en 5 minutos
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
      </Modal>

      {/* Modales de Login y Registro */}
      {showLoginModal && (
        <LoginModal
          skipRedirect={true}
          onClose={() => {
            setShowLoginModal(false);
          }}
          onSwitchToRegister={() => {
            setShowLoginModal(false);
            setShowRegisterModal(true);
          }}
        />
      )}

      {showRegisterModal && (
        <RegisterModal
          skipRedirect={true}
          onClose={() => {
            setShowRegisterModal(false);
          }}
          onSwitchToLogin={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
        />
      )}
    </Backdrop>
  );
}

export default SubscriptionModal;


