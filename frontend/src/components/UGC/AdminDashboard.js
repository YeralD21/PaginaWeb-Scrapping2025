import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import { FiBarChart, FiFileText, FiUsers, FiAlertTriangle, FiDollarSign, FiSettings, FiStar, FiCreditCard, FiList, FiArrowLeft } from 'react-icons/fi';
import ModerationPanel from './ModerationPanel';
import ReportedPostsPanel from './ReportedPostsPanel';
import EarningsConfigPanel from './EarningsConfigPanel';
import MonetizationSettingsPanel from './MonetizationSettingsPanel';

const Container = styled.div`
  background: transparent;
  padding: 0;
  border-radius: 0;
  box-shadow: none;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
`;

const DashboardLayout = styled.div`
  display: flex;
  gap: 2rem;
  min-height: calc(100vh - 200px);
`;

const Sidebar = styled.aside`
  width: 280px;
  background: rgba(26, 31, 58, 0.95);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(102, 126, 234, 0.2);
  padding: 2rem 0;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  height: fit-content;
  position: sticky;
  top: 2rem;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(26, 31, 58, 0.5);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(102, 126, 234, 0.3);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(102, 126, 234, 0.5);
  }
`;

const SidebarSection = styled.div`
  padding: 0 1.5rem;
  margin-bottom: 2rem;
`;

const SidebarTitle = styled.h3`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const NavItem = styled.button`
  width: 100%;
  padding: 0.9rem 1rem;
  background: ${props => props.$active ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)' : 'transparent'};
  color: ${props => props.$active ? '#fff' : 'rgba(255, 255, 255, 0.7)'};
  border: none;
  border-left: 3px solid ${props => props.$active ? '#667eea' : 'transparent'};
  border-radius: 0 8px 8px 0;
  cursor: pointer;
  font-weight: ${props => props.$active ? '600' : '500'};
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  text-align: left;
  font-size: 0.95rem;

  &:hover {
    background: ${props => props.$active ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)' : 'rgba(102, 126, 234, 0.1)'};
    color: #fff;
    border-left-color: ${props => props.$active ? '#667eea' : 'rgba(102, 126, 234, 0.5)'};
    transform: translateX(5px);
  }
`;

const NavIcon = styled.span`
  font-size: 1.2rem;
  display: flex;
  align-items: center;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
  color: white;
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;
  width: 100%;

  &:hover {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%);
    border-color: rgba(102, 126, 234, 0.5);
    transform: translateY(-2px);
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 0;
  overflow-y: auto;
  background: transparent;
`;

const Title = styled.h1`
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 2rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, ${props => props.color || '#667eea'} 0%, ${props => props.color2 || '#764ba2'} 100%);
  padding: 2rem;
  border-radius: 15px;
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
`;

const StatValue = styled.div`
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 1.1rem;
  opacity: 0.9;
`;

const Section = styled.div`
  margin-bottom: 3rem;
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid rgba(102, 126, 234, 0.2);
`;

const SectionTitle = styled.h2`
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 1.5rem;
  border-bottom: 2px solid rgba(102, 126, 234, 0.5);
  padding-bottom: 0.5rem;
  font-size: 1.5rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: rgba(30, 41, 59, 0.8);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(102, 126, 234, 0.2);
  backdrop-filter: blur(10px);
`;

const Th = styled.th`
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  color: white;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid rgba(102, 126, 234, 0.3);
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  color: rgba(255, 255, 255, 0.9);
`;

const Tr = styled.tr`
  background: rgba(30, 41, 59, 0.6);
  
  &:hover {
    background: rgba(102, 126, 234, 0.15);
  }
  
  &:nth-child(even) {
    background: rgba(30, 41, 59, 0.7);
    
    &:hover {
      background: rgba(102, 126, 234, 0.15);
    }
  }
`;

const Badge = styled.span`
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  background: ${props => props.isAdmin ? '#ff6b6b' : '#51cf66'};
  color: white;
`;

const Money = styled.span`
  color: #43e97b;
  font-weight: bold;
  font-size: 1.1rem;
`;

const Loading = styled.div`
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.2rem;
`;

const RefreshButton = styled.button`
  padding: 0.8rem 1.5rem;
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  color: white;
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  margin-bottom: 2rem;
  transition: all 0.3s;

  &:hover {
    background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(30, 58, 138, 0.4);
  }
`;

const PostCard = styled.div`
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
`;

const PostHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(102, 126, 234, 0.2);
`;

const PostTitle = styled.h3`
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 0.5rem;
  font-size: 1.3rem;
`;

const PostImage = styled.img`
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-radius: 8px;
  margin: 1rem 0;
`;

const PostContent = styled.div`
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin: 1rem 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s;
  ${props => {
    switch(props.variant) {
      case 'approve':
        return `
          background: #51cf66;
          color: white;
          &:hover { background: #40c057; }
        `;
      case 'reject':
        return `
          background: #ff6b6b;
          color: white;
          &:hover { background: #ff5252; }
        `;
      case 'suspend':
        return `
          background: #ffa94d;
          color: white;
          &:hover { background: #ff8c00; }
        `;
      case 'premium':
        return `
          background: #ffd43b;
          color: #343a40;
          &:hover { background: #fcc419; }
        `;
      case 'premium-off':
        return `
          background: #adb5bd;
          color: white;
          &:hover { background: #868e96; }
        `;
      default:
        return `
          background: #667eea;
          color: white;
          &:hover { background: #764ba2; }
        `;
    }
  }}
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: rgba(30, 41, 59, 0.95);
  backdrop-filter: blur(20px);
  padding: 2rem;
  border-radius: 15px;
  max-width: 500px;
  width: 90%;
  border: 1px solid rgba(102, 126, 234, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
`;

const ModalTitle = styled.h3`
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.95);
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 1rem;
  background: rgba(26, 31, 58, 0.6);
  color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);

  &:focus {
    outline: none;
    border-color: #667eea;
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem;
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  background: rgba(26, 31, 58, 0.6);
  color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);

  &:focus {
    outline: none;
    border-color: #667eea;
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.8rem;
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 1rem;
  background: rgba(26, 31, 58, 0.6);
  color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #667eea;
  }

  option {
    background: #1e3a8a;
    color: rgba(255, 255, 255, 0.9);
  }
`;

const API_BASE = 'http://localhost:8000';

const DiagnosticButton = styled.button`
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
  }
`;

const DiagnosticResult = styled.pre`
  background: rgba(26, 31, 58, 0.6);
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  overflow-x: auto;
  font-size: 0.9rem;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: rgba(255, 255, 255, 0.9);
`;

function AdminDashboard({ token, hideSidebar = false, activeTab: externalActiveTab, setActiveTab: setExternalActiveTab }) {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [internalActiveTab, setInternalActiveTab] = useState('dashboard'); // 'dashboard', 'pending', 'users', 'premium', 'payments'
  
  // Usar el tab externo si está disponible (cuando hideSidebar es true), sino usar el interno
  const activeTab = hideSidebar && externalActiveTab ? externalActiveTab : internalActiveTab;
  const setActiveTab = hideSidebar && setExternalActiveTab ? setExternalActiveTab : setInternalActiveTab;
  const [diagnostic, setDiagnostic] = useState(null);
  const [premiumNews, setPremiumNews] = useState([]);
  const [premiumLoading, setPremiumLoading] = useState(false);
  const [premiumError, setPremiumError] = useState(null);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingPaymentId, setRejectingPaymentId] = useState(null);
  const [approvingPaymentId, setApprovingPaymentId] = useState(null);
  const [paymentsSubTab, setPaymentsSubTab] = useState('pending'); // 'pending' o 'active'
  const [activeSubscriptions, setActiveSubscriptions] = useState([]);
  const [activeSubscriptionsLoading, setActiveSubscriptionsLoading] = useState(false);
  const [activeSubscriptionsError, setActiveSubscriptionsError] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancellingSubscriptionId, setCancellingSubscriptionId] = useState(null);
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState(null);
  const [editingPlan, setEditingPlan] = useState(null);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [planFormData, setPlanFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    periodo: 'mensual',
    periodo_tipo: 'dias',
    periodo_cantidad: '',
    beneficios: [],
    es_activo: true
  });
  const [newBenefit, setNewBenefit] = useState('');
  const [planStats, setPlanStats] = useState({});
  const [beneficiosExpanded, setBeneficiosExpanded] = useState(true); // Estado para controlar si la lista está expandida
  
  // Beneficios predeterminados
  const beneficiosPredeterminados = [
    'Acceso a todas las noticias premium',
    'Análisis exclusivos y reportes especiales',
    'Sin anuncios',
    'Soporte prioritario 24/7',
    'Acceso anticipado a contenido',
    'Descuento del 30%',
    'Contenido exclusivo adicional'
  ];

  const runDiagnostic = async () => {
    try {
      const response = await axios.get(`${API_BASE}/admin/dashboard/health`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setDiagnostic(response.data);
      console.log('🔍 Diagnóstico:', response.data);
      await Swal.fire({
        title: 'Diagnóstico completado',
        text: 'Revisa la consola y la sección de diagnóstico para ver los resultados.',
        icon: 'success',
        confirmButtonColor: '#51cf66',
        confirmButtonText: 'Aceptar',
        timer: 3000,
        timerProgressBar: true
      });
    } catch (err) {
      console.error('Error en diagnóstico:', err);
      setDiagnostic({ error: err.message, details: err.response?.data });
      await Swal.fire({
        title: 'Error en diagnóstico',
        text: err.message || 'Error ejecutando diagnóstico',
        icon: 'error',
        confirmButtonColor: '#ff6b6b',
        confirmButtonText: 'Aceptar'
      });
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashboardRes, usersRes] = await Promise.all([
        axios.get(`${API_BASE}/admin/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get(`${API_BASE}/admin/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      setDashboard(dashboardRes.data);
      setUsers(usersRes.data); // El backend devuelve directamente el array de usuarios
    } catch (err) {
      console.error('Error al cargar dashboard:', err);
      // Automáticamente ejecutar diagnóstico si hay error
      await runDiagnostic();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchPremiumNews = async () => {
    setPremiumLoading(true);
    setPremiumError(null);
    try {
      const res = await axios.get(`${API_BASE}/subscriptions/premium/recommendations?limit=25`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPremiumNews(res.data || []);
    } catch (err) {
      console.error('Error cargando recomendaciones premium:', err);
      setPremiumError(err.response?.data?.detail || err.message);
    } finally {
      setPremiumLoading(false);
    }
  };

  const handleRecalculatePremium = async (autoMark = false) => {
    try {
      await axios.post(`${API_BASE}/subscriptions/premium/recalculate`, {
        hours_window: 168,
        auto_mark: autoMark,
        top_percentage: 0.15
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await fetchPremiumNews();
      await Swal.fire({
        title: '¡Éxito!',
        text: autoMark ? 'Puntajes recalculados y top marcado como premium.' : 'Puntajes recalculados correctamente.',
        icon: 'success',
        confirmButtonColor: '#51cf66',
        confirmButtonText: 'Aceptar',
        timer: 3000,
        timerProgressBar: true
      });
    } catch (err) {
      console.error('Error recalculando premium:', err);
      await Swal.fire({
        title: 'Error',
        text: err.response?.data?.detail || err.message || 'Error al recalcular los puntajes premium',
        icon: 'error',
        confirmButtonColor: '#ff6b6b',
        confirmButtonText: 'Aceptar'
      });
    }
  };

  const handleTogglePremium = async (noticiaId, esPremium) => {
    try {
      await axios.post(`${API_BASE}/subscriptions/premium/toggle`, {
        noticia_ids: [noticiaId],
        es_premium: esPremium
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPremiumNews(prev => prev.map(item => (
        item.id === noticiaId ? { ...item, es_premium: esPremium } : item
      )));
      await Swal.fire({
        title: esPremium ? 'Noticia Premium' : 'Noticia Regular',
        text: esPremium ? 'Noticia marcada como premium correctamente.' : 'Noticia quitada de premium correctamente.',
        icon: 'success',
        confirmButtonColor: '#667eea',
        confirmButtonText: 'Aceptar',
        timer: 2000,
        timerProgressBar: true
      });
    } catch (err) {
      console.error('Error actualizando noticia premium:', err);
      await Swal.fire({
        title: 'Error',
        text: err.response?.data?.detail || err.message || 'Error al actualizar el estado premium de la noticia',
        icon: 'error',
        confirmButtonColor: '#ff6b6b',
        confirmButtonText: 'Aceptar'
      });
    }
  };

  useEffect(() => {
    if (activeTab === 'premium') {
      fetchPremiumNews();
    }
    if (activeTab === 'payments') {
      if (paymentsSubTab === 'pending') {
        fetchPendingPayments();
      } else if (paymentsSubTab === 'active') {
        fetchActiveSubscriptions();
      }
    }
    if (activeTab === 'plans') {
      fetchPlans();
    }
  }, [activeTab, paymentsSubTab]);

  const fetchPlans = async () => {
    setPlansLoading(true);
    setPlansError(null);
    try {
      const res = await axios.get(`${API_BASE}/subscriptions/admin/plans`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlans(res.data || []);
      
      // Cargar estadísticas para cada plan
      const statsPromises = res.data.map(plan => 
        axios.get(`${API_BASE}/subscriptions/admin/plans/${plan.id}/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(response => ({ planId: plan.id, stats: response.data }))
        .catch(() => ({ planId: plan.id, stats: null }))
      );
      const statsResults = await Promise.all(statsPromises);
      const statsMap = {};
      statsResults.forEach(({ planId, stats }) => {
        statsMap[planId] = stats;
      });
      setPlanStats(statsMap);
    } catch (err) {
      console.error('Error cargando planes:', err);
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || 'Error desconocido';
      setPlansError(errorMessage);
      console.error('Detalles del error:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: `${API_BASE}/subscriptions/admin/plans`
      });
    } finally {
      setPlansLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    try {
      const planData = {
        ...planFormData,
        precio: parseFloat(planFormData.precio),
        periodo_cantidad: planFormData.periodo === 'personalizado' ? parseInt(planFormData.periodo_cantidad) : undefined,
        periodo_tipo: planFormData.periodo === 'personalizado' ? planFormData.periodo_tipo : undefined,
        beneficios: planFormData.beneficios.filter(b => b.trim() !== '')
      };
      
      await axios.post(`${API_BASE}/subscriptions/admin/plans`, planData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Cerrar el formulario primero
      setShowPlanForm(false);
      resetPlanForm();
      
      // Mostrar SweetAlert después de cerrar el formulario
      await Swal.fire({
        title: '¡PLAN CREADO EXITOSAMENTE!',
        text: `El plan "${planData.nombre}" ha sido creado correctamente.`,
        icon: 'success',
        confirmButtonColor: '#51cf66',
        confirmButtonText: 'Aceptar',
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: 'swal2-popup-custom',
          title: 'swal2-title-custom',
          confirmButton: 'swal2-confirm-custom'
        },
        allowOutsideClick: false,
        allowEscapeKey: false
      });
      
      await fetchPlans();
    } catch (err) {
      console.error('Error creando plan:', err);
      await Swal.fire({
        title: 'Error',
        text: err.response?.data?.detail || err.message || 'Error al crear el plan',
        icon: 'error',
        confirmButtonColor: '#ff6b6b',
        confirmButtonText: 'Aceptar'
      });
    }
  };

  const handleUpdatePlan = async () => {
    if (!editingPlan) return;
    
    try {
      const planData = {
        ...planFormData,
        precio: parseFloat(planFormData.precio),
        periodo_cantidad: planFormData.periodo === 'personalizado' ? parseInt(planFormData.periodo_cantidad) : undefined,
        periodo_tipo: planFormData.periodo === 'personalizado' ? planFormData.periodo_tipo : undefined,
        beneficios: planFormData.beneficios.filter(b => b.trim() !== '')
      };
      
      await axios.put(`${API_BASE}/subscriptions/admin/plans/${editingPlan.id}`, planData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Cerrar el formulario primero
      setEditingPlan(null);
      setShowPlanForm(false);
      resetPlanForm();
      
      // Mostrar SweetAlert después de cerrar el formulario
      await Swal.fire({
        title: '¡PLAN ACTUALIZADO EXITOSAMENTE!',
        text: `El plan "${planData.nombre}" ha sido actualizado correctamente.`,
        icon: 'success',
        confirmButtonColor: '#51cf66',
        confirmButtonText: 'Aceptar',
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: 'swal2-popup-custom',
          title: 'swal2-title-custom',
          confirmButton: 'swal2-confirm-custom'
        },
        allowOutsideClick: false,
        allowEscapeKey: false
      });
      
      await fetchPlans();
    } catch (err) {
      console.error('Error actualizando plan:', err);
      await Swal.fire({
        title: 'Error',
        text: err.response?.data?.detail || err.message || 'Error al actualizar el plan',
        icon: 'error',
        confirmButtonColor: '#ff6b6b',
        confirmButtonText: 'Aceptar'
      });
    }
  };

  const handleDeactivatePlan = async (planId) => {
    const stats = planStats[planId];
    const activeCount = stats?.active_subscriptions || 0;
    
    const result = await Swal.fire({
      title: '¿Desactivar plan?',
      html: activeCount > 0 
        ? `Este plan tiene ${activeCount} suscripción(es) activa(s).<br><br>Los usuarios conservarán su plan hasta que expire, pero no podrán renovarlo automáticamente.<br><br>¿Deseas continuar?`
        : '¿Estás seguro de desactivar este plan?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff6b6b',
      cancelButtonColor: '#667eea',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      customClass: {
        popup: 'swal2-popup-custom',
        title: 'swal2-title-custom',
        confirmButton: 'swal2-confirm-custom',
        cancelButton: 'swal2-cancel-custom'
      }
    });
    
    if (!result.isConfirmed) {
      return;
    }
    
    try {
      const res = await axios.delete(`${API_BASE}/subscriptions/admin/plans/${planId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await Swal.fire({
        title: 'Plan desactivado',
        text: res.data.message || 'El plan ha sido desactivado correctamente.',
        icon: 'success',
        confirmButtonColor: '#51cf66',
        confirmButtonText: 'Aceptar',
        timer: 3000,
        timerProgressBar: true
      });
      
      await fetchPlans();
    } catch (err) {
      console.error('Error desactivando plan:', err);
      await Swal.fire({
        title: 'Error',
        text: err.response?.data?.detail || err.message || 'Error al desactivar el plan',
        icon: 'error',
        confirmButtonColor: '#ff6b6b',
        confirmButtonText: 'Aceptar'
      });
    }
  };

  const handleActivatePlan = async (planId) => {
    try {
      await axios.post(`${API_BASE}/subscriptions/admin/plans/${planId}/activate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await Swal.fire({
        title: 'Plan activado',
        text: 'El plan ha sido activado correctamente.',
        icon: 'success',
        confirmButtonColor: '#51cf66',
        confirmButtonText: 'Aceptar',
        timer: 2000,
        timerProgressBar: true
      });
      
      await fetchPlans();
    } catch (err) {
      console.error('Error activando plan:', err);
      await Swal.fire({
        title: 'Error',
        text: err.response?.data?.detail || err.message || 'Error al activar el plan',
        icon: 'error',
        confirmButtonColor: '#ff6b6b',
        confirmButtonText: 'Aceptar'
      });
    }
  };

  const handleDeletePlan = async (planId) => {
    const plan = plans.find(p => p.id === planId);
    const planName = plan?.nombre || 'este plan';
    
    const result = await Swal.fire({
      title: '¿Eliminar plan permanentemente?',
      html: `¿Estás seguro de eliminar permanentemente el plan "<strong>${planName}</strong>"?<br><br>Esta acción no se puede deshacer y el plan será eliminado completamente de la base de datos.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#667eea',
      confirmButtonText: 'Sí, eliminar permanentemente',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      customClass: {
        popup: 'swal2-popup-custom',
        title: 'swal2-title-custom',
        confirmButton: 'swal2-confirm-custom',
        cancelButton: 'swal2-cancel-custom'
      }
    });
    
    if (!result.isConfirmed) {
      return;
    }
    
    try {
      await axios.delete(`${API_BASE}/subscriptions/admin/plans/${planId}/delete`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await Swal.fire({
        title: 'Plan eliminado',
        text: `El plan "${planName}" ha sido eliminado permanentemente.`,
        icon: 'success',
        confirmButtonColor: '#51cf66',
        confirmButtonText: 'Aceptar',
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: 'swal2-popup-custom',
          title: 'swal2-title-custom',
          confirmButton: 'swal2-confirm-custom'
        }
      });
      
      await fetchPlans();
    } catch (err) {
      console.error('Error eliminando plan:', err);
      await Swal.fire({
        title: 'Error',
        text: err.response?.data?.detail || err.message || 'Error al eliminar el plan',
        icon: 'error',
        confirmButtonColor: '#ff6b6b',
        confirmButtonText: 'Aceptar',
        customClass: {
          popup: 'swal2-popup-custom',
          title: 'swal2-title-custom',
          confirmButton: 'swal2-confirm-custom'
        }
      });
    }
  };

  const resetPlanForm = () => {
    setPlanFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      periodo: 'mensual',
      periodo_tipo: 'dias',
      periodo_cantidad: '',
      beneficios: [...beneficiosPredeterminados], // Seleccionar todos los beneficios predeterminados por defecto
      es_activo: true
    });
    setNewBenefit('');
    setEditingPlan(null);
  };
  
  const toggleBeneficioPredeterminado = (beneficio) => {
    const beneficiosActuales = planFormData.beneficios || [];
    if (beneficiosActuales.includes(beneficio)) {
      // Remover el beneficio
      setPlanFormData({
        ...planFormData,
        beneficios: beneficiosActuales.filter(b => b !== beneficio)
      });
    } else {
      // Agregar el beneficio
      setPlanFormData({
        ...planFormData,
        beneficios: [...beneficiosActuales, beneficio]
      });
    }
  };
  
  const seleccionarTodosBeneficios = () => {
    setPlanFormData({
      ...planFormData,
      beneficios: [...beneficiosPredeterminados, ...planFormData.beneficios.filter(b => !beneficiosPredeterminados.includes(b))]
    });
  };
  
  const deseleccionarTodosBeneficios = () => {
    setPlanFormData({
      ...planFormData,
      beneficios: planFormData.beneficios.filter(b => !beneficiosPredeterminados.includes(b))
    });
  };

  const openEditPlan = (plan) => {
    setEditingPlan(plan);
    setBeneficiosExpanded(true); // Expandir la lista al editar
    setPlanFormData({
      nombre: plan.nombre,
      descripcion: plan.descripcion || '',
      precio: plan.precio.toString(),
      periodo: plan.periodo,
      periodo_tipo: plan.periodo_tipo || 'dias',
      periodo_cantidad: plan.periodo_cantidad ? plan.periodo_cantidad.toString() : '',
      beneficios: plan.beneficios || [],
      es_activo: plan.es_activo
    });
    setShowPlanForm(true);
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setPlanFormData({
        ...planFormData,
        beneficios: [...planFormData.beneficios, newBenefit.trim()]
      });
      setNewBenefit('');
    }
  };

  const removeBenefit = (index) => {
    setPlanFormData({
      ...planFormData,
      beneficios: planFormData.beneficios.filter((_, i) => i !== index)
    });
  };

  const fetchActiveSubscriptions = async () => {
    setActiveSubscriptionsLoading(true);
    setActiveSubscriptionsError(null);
    try {
      const res = await axios.get(`${API_BASE}/subscriptions/admin/active-subscriptions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveSubscriptions(res.data || []);
    } catch (err) {
      console.error('Error cargando suscripciones activas:', err);
      setActiveSubscriptionsError(err.response?.data?.detail || err.message);
    } finally {
      setActiveSubscriptionsLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId) => {
    if (!cancelReason) {
      await Swal.fire({
        title: 'Motivo requerido',
        text: 'Por favor selecciona un motivo de cancelación',
        icon: 'warning',
        confirmButtonColor: '#667eea',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
    
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      html: `¿Estás seguro de cancelar esta suscripción?<br><br><strong>Motivo:</strong> ${cancelReason}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff6b6b',
      cancelButtonColor: '#667eea',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      customClass: {
        popup: 'swal2-popup-custom',
        title: 'swal2-title-custom',
        confirmButton: 'swal2-confirm-custom',
        cancelButton: 'swal2-cancel-custom'
      }
    });
    
    if (!result.isConfirmed) {
      return;
    }
    
    setCancellingSubscriptionId(subscriptionId);
    try {
      await axios.post(`${API_BASE}/subscriptions/admin/cancel-subscription`, {
        subscription_id: subscriptionId,
        motivo_cancelacion: cancelReason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await Swal.fire({
        title: 'Suscripción cancelada',
        text: 'La suscripción ha sido cancelada correctamente.',
        icon: 'success',
        confirmButtonColor: '#51cf66',
        confirmButtonText: 'Aceptar',
        timer: 3000,
        timerProgressBar: true
      });
      
      setCancelReason('');
      await fetchActiveSubscriptions();
    } catch (err) {
      console.error('Error cancelando suscripción:', err);
      await Swal.fire({
        title: 'Error',
        text: err.response?.data?.detail || err.message || 'Error al cancelar la suscripción',
        icon: 'error',
        confirmButtonColor: '#ff6b6b',
        confirmButtonText: 'Aceptar'
      });
    } finally {
      setCancellingSubscriptionId(null);
    }
  };

  const fetchPendingPayments = async () => {
    setPaymentsLoading(true);
    setPaymentsError(null);
    try {
      const res = await axios.get(`${API_BASE}/subscriptions/admin/pending-payments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingPayments(res.data || []);
    } catch (err) {
      console.error('Error cargando pagos pendientes:', err);
      setPaymentsError(err.response?.data?.detail || err.message);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const handleApprovePayment = async (subscriptionId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Estás seguro de aprobar este pago y activar la suscripción?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#51cf66',
      cancelButtonColor: '#ff6b6b',
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      customClass: {
        popup: 'swal2-popup-custom',
        title: 'swal2-title-custom',
        confirmButton: 'swal2-confirm-custom',
        cancelButton: 'swal2-cancel-custom'
      }
    });
    
    if (!result.isConfirmed) {
      return;
    }
    
    setApprovingPaymentId(subscriptionId);
    try {
      await axios.post(`${API_BASE}/subscriptions/admin/approve-payment`, {
        subscription_id: subscriptionId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await Swal.fire({
        title: '¡Éxito!',
        text: 'Pago aprobado y suscripción activada correctamente.',
        icon: 'success',
        confirmButtonColor: '#51cf66',
        confirmButtonText: 'Aceptar',
        timer: 3000,
        timerProgressBar: true
      });
      
      // Refrescar ambas listas después de aprobar
      await fetchPendingPayments();
      await fetchActiveSubscriptions();
    } catch (err) {
      console.error('Error aprobando pago:', err);
      await Swal.fire({
        title: 'Error',
        text: err.response?.data?.detail || err.message || 'Error al aprobar el pago',
        icon: 'error',
        confirmButtonColor: '#ff6b6b',
        confirmButtonText: 'Aceptar'
      });
    } finally {
      setApprovingPaymentId(null);
    }
  };

  const handleRejectPayment = async (subscriptionId) => {
    if (!rejectReason) {
      await Swal.fire({
        title: 'Motivo requerido',
        text: 'Por favor selecciona un motivo de rechazo',
        icon: 'warning',
        confirmButtonColor: '#667eea',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
    
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      html: `¿Estás seguro de rechazar este pago?<br><br><strong>Motivo:</strong> ${rejectReason}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff6b6b',
      cancelButtonColor: '#667eea',
      confirmButtonText: 'Sí, rechazar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      customClass: {
        popup: 'swal2-popup-custom',
        title: 'swal2-title-custom',
        confirmButton: 'swal2-confirm-custom',
        cancelButton: 'swal2-cancel-custom'
      }
    });
    
    if (!result.isConfirmed) {
      return;
    }
    
    setRejectingPaymentId(subscriptionId);
    try {
      await axios.post(`${API_BASE}/subscriptions/admin/reject-payment`, {
        subscription_id: subscriptionId,
        motivo_rechazo: rejectReason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await Swal.fire({
        title: 'Pago rechazado',
        text: 'El pago ha sido rechazado correctamente.',
        icon: 'info',
        confirmButtonColor: '#667eea',
        confirmButtonText: 'Aceptar',
        timer: 3000,
        timerProgressBar: true
      });
      
      setRejectReason('');
      await fetchPendingPayments();
    } catch (err) {
      console.error('Error rechazando pago:', err);
      await Swal.fire({
        title: 'Error',
        text: err.response?.data?.detail || err.message || 'Error al rechazar el pago',
        icon: 'error',
        confirmButtonColor: '#ff6b6b',
        confirmButtonText: 'Aceptar'
      });
    } finally {
      setRejectingPaymentId(null);
    }
  };

  if (loading) {
    return (
      <Container>
        <Loading>⏳ Cargando dashboard...</Loading>
      </Container>
    );
  }

  if (!dashboard) {
    return (
      <Container>
        <Loading>❌ Error al cargar dashboard</Loading>
        <DiagnosticButton onClick={runDiagnostic}>
          🔍 Ejecutar Diagnóstico del Sistema
        </DiagnosticButton>
        {diagnostic && (
          <DiagnosticResult>
            {JSON.stringify(diagnostic, null, 2)}
          </DiagnosticResult>
        )}
      </Container>
    );
  }

  // Función helper para renderizar el contenido del dashboard
  const renderContent = () => (
    <>
      {activeTab === 'dashboard' && (
        <>
          <RefreshButton onClick={fetchData}>
            🔄 Actualizar Datos
          </RefreshButton>

      {/* Estadísticas Principales */}
      <StatsGrid>
        <StatCard color="#667eea" color2="#764ba2">
          <StatValue>${dashboard.earnings?.total_ingresos || 0}</StatValue>
          <StatLabel>💰 Ingresos Totales</StatLabel>
        </StatCard>

        <StatCard color="#f093fb" color2="#f5576c">
          <StatValue>${dashboard.earnings?.ganancia_admin || 0}</StatValue>
          <StatLabel>👑 Ganancia Admin (70%)</StatLabel>
        </StatCard>

        <StatCard color="#43e97b" color2="#38f9d7">
          <StatValue>${dashboard.earnings?.ganancia_usuarios || 0}</StatValue>
          <StatLabel>👥 Ganancia Usuarios (30%)</StatLabel>
        </StatCard>

        <StatCard color="#fa709a" color2="#fee140">
          <StatValue>{dashboard.users?.total || 0}</StatValue>
          <StatLabel>👤 Total Usuarios</StatLabel>
        </StatCard>

        <StatCard color="#30cfd0" color2="#330867">
          <StatValue>{dashboard.posts?.total || 0}</StatValue>
          <StatLabel>📝 Total Posts</StatLabel>
        </StatCard>

        <StatCard color="#a8edea" color2="#fed6e3">
          <StatValue>{dashboard.users?.admins || 0}</StatValue>
          <StatLabel>👑 Admins</StatLabel>
        </StatCard>

        <StatCard color="#ff9a56" color2="#ff5e62">
          <StatValue>{dashboard.posts?.pending || 0}</StatValue>
          <StatLabel>⏳ Pendientes</StatLabel>
        </StatCard>

        <StatCard color="#21d4fd" color2="#b721ff">
          <StatValue>{dashboard.posts?.published || 0}</StatValue>
          <StatLabel>✅ Publicados</StatLabel>
        </StatCard>

        <StatCard color="#fdc830" color2="#f37335">
          <StatValue>{dashboard.reports?.total || 0}</StatValue>
          <StatLabel>🚩 Reportes</StatLabel>
        </StatCard>
      </StatsGrid>

      {/* Lista de Todos los Usuarios */}
      <Section>
        <SectionTitle>👥 Todos los Usuarios Registrados</SectionTitle>
        <Table>
          <thead>
            <tr>
              <Th>ID</Th>
              <Th>Email</Th>
              <Th>Rol</Th>
              <Th>Fecha Registro</Th>
              <Th>Posts</Th>
              <Th>Ganancia Total</Th>
            </tr>
          </thead>
          <tbody>
            {users && users.length > 0 ? users.map(user => (
              <Tr key={user.id}>
                <Td>{user.id}</Td>
                <Td>{user.email}</Td>
                <Td>
                  <Badge isAdmin={user.role === 'admin'}>
                    {user.role === 'admin' ? '👑 ADMIN' : '👤 USER'}
                  </Badge>
                </Td>
                <Td>{new Date(user.created_at).toLocaleDateString()}</Td>
                <Td>{user.total_posts || 0}</Td>
                <Td>
                  <Money>${user.ganancia_acumulada || 0}</Money>
                </Td>
              </Tr>
            )) : (
              <Tr>
                <Td colSpan="6" style={{textAlign: 'center', color: '#888'}}>
                  No hay usuarios registrados
                </Td>
              </Tr>
            )}
          </tbody>
        </Table>
      </Section>

          <div style={{
            background: 'rgba(102, 126, 234, 0.15)', 
            padding: '1.5rem', 
            borderRadius: '12px',
            borderLeft: '4px solid #667eea',
            color: 'rgba(255, 255, 255, 0.9)'
          }}>
            <strong>ℹ️ Información del Sistema:</strong><br/>
            • Cada interacción (view/click) genera $0.01 USD<br/>
            • El admin recibe el 70% de cada interacción<br/>
            • Los creadores reciben el 30% de cada interacción<br/>
            • Puedes simular interacciones usando la API: POST /admin/simulate-interactions/:post_id
          </div>
        </>
      )}

      {activeTab === 'pending' && (
        <ModerationPanel token={token} onUpdate={fetchData} />
      )}

      {activeTab === 'reported' && (
        <ReportedPostsPanel token={token} onUpdate={fetchData} />
      )}

      {activeTab === 'users' && (
        <Section>
          <SectionTitle>👥 Gestión de Usuarios Registrados</SectionTitle>
          <Table>
            <thead>
              <tr>
                <Th>ID</Th>
                <Th>Email</Th>
                <Th>Rol</Th>
                <Th>Fecha Registro</Th>
                <Th>Posts</Th>
                <Th>Ganancia Total</Th>
                <Th>Estado</Th>
              </tr>
            </thead>
            <tbody>
              {users && users.length > 0 ? users.map(user => (
                <Tr key={user.id}>
                  <Td>{user.id}</Td>
                  <Td>{user.email}</Td>
                  <Td>
                    <Badge isAdmin={user.role === 'admin'}>
                      {user.role === 'admin' ? '👑 ADMIN' : '👤 USER'}
                    </Badge>
                  </Td>
                  <Td>{new Date(user.created_at).toLocaleDateString()}</Td>
                  <Td>{user.total_posts || 0}</Td>
                  <Td>
                    <Money>${user.ganancia_acumulada || 0}</Money>
                  </Td>
                  <Td>
                    {user.suspendido ? (
                      <Badge style={{background: '#ff6b6b'}}>
                        🚫 SUSPENDIDO
                      </Badge>
                    ) : (
                      <Badge style={{background: '#51cf66'}}>
                        ✅ ACTIVO
                      </Badge>
                    )}
                  </Td>
                </Tr>
              )) : (
                <Tr>
                  <Td colSpan="7" style={{textAlign: 'center', color: '#888'}}>
                    No hay usuarios registrados
                  </Td>
                </Tr>
              )}
            </tbody>
          </Table>
        </Section>
      )}

      {activeTab === 'earnings' && (
        <EarningsConfigPanel token={token} onUpdate={fetchData} />
      )}

      {activeTab === 'monetization' && (
        <MonetizationSettingsPanel token={token} onUpdate={fetchData} />
      )}

      {activeTab === 'premium' && (
        <Section>
          <SectionTitle>⭐ Gestión de noticias premium</SectionTitle>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <ActionButton onClick={() => handleRecalculatePremium(false)}>
              🔄 Recalcular Puntajes
            </ActionButton>
            <ActionButton variant="premium" onClick={() => handleRecalculatePremium(true)}>
              🌟 Recalcular y marcar Top 15%
            </ActionButton>
            <ActionButton onClick={fetchPremiumNews}>
              📋 Refrescar Lista
            </ActionButton>
          </div>

          <div style={{
            background: 'rgba(255, 212, 59, 0.15)',
            borderLeft: '4px solid #ffa94d',
            padding: '1rem',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            color: '#ffd43b'
          }}>
            <strong>Consejo rápido:</strong> Estas recomendaciones se basan en popularidad, tendencia, categoría y frescura.
            Puedes recalcular cuando quieras y marcar manualmente qué noticias serán exclusivas.
          </div>

          {premiumLoading ? (
            <Loading>⏳ Analizando noticias más atractivas...</Loading>
          ) : premiumError ? (
            <Loading>❌ Error cargando recomendaciones: {premiumError}</Loading>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>ID</Th>
                  <Th>Título</Th>
                  <Th>Categoría</Th>
                  <Th>Score</Th>
                  <Th>Trending</Th>
                  <Th>Popularidad</Th>
                  <Th>Premium</Th>
                  <Th>Acciones</Th>
                </tr>
              </thead>
              <tbody>
                {premiumNews && premiumNews.length > 0 ? premiumNews.map(item => (
                  <Tr 
                    key={item.id}
                    onClick={() => navigate(`/noticia/${item.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Td>{item.id}</Td>
                    <Td>
                      <div style={{ fontWeight: 600 }}>{item.titulo}</div>
                      <div style={{ fontSize: '0.85rem', color: '#888' }}>
                        {item.fecha_publicacion ? new Date(item.fecha_publicacion).toLocaleString() : 'Sin fecha'}
                      </div>
                    </Td>
                    <Td>{item.categoria || 'Sin categoría'}</Td>
                    <Td>
                      <Badge style={{ background: '#ffd43b', color: '#1a1f3a' }}>
                        {item.premium_score?.toFixed(2)}
                      </Badge>
                    </Td>
                    <Td>{item.es_trending ? '🔥 Sí' : '–'}</Td>
                    <Td>{item.popularidad_score?.toFixed(2) ?? '0.00'}</Td>
                    <Td>
                      {item.es_premium ? (
                        <Badge style={{ background: '#51cf66' }}>Premium</Badge>
                      ) : (
                        <Badge style={{ background: '#adb5bd' }}>Libre</Badge>
                      )}
                    </Td>
                    <Td onClick={(e) => e.stopPropagation()}>
                      <ButtonGroup>
                        {!item.es_premium ? (
                          <ActionButton variant="premium" onClick={() => handleTogglePremium(item.id, true)}>
                            ⭐ Marcar Premium
                          </ActionButton>
                        ) : (
                          <ActionButton variant="premium-off" onClick={() => handleTogglePremium(item.id, false)}>
                            ⚪ Quitar Premium
                          </ActionButton>
                        )}
                      </ButtonGroup>
                    </Td>
                  </Tr>
                )) : (
                  <Tr>
                    <Td colSpan="8" style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)', padding: '2rem' }}>
                      No hay recomendaciones en este momento.
                    </Td>
                  </Tr>
                )}
              </tbody>
            </Table>
          )}
        </Section>
      )}

      {activeTab === 'payments' && (
        <Section>
          <SectionTitle>💳 Gestión de Pagos de Suscripciones</SectionTitle>
          
          {/* Sub-tabs para pagos */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            marginBottom: '2rem',
            borderBottom: '2px solid rgba(102, 126, 234, 0.2)',
            paddingBottom: '1rem'
          }}>
            <button
              onClick={() => setPaymentsSubTab('pending')}
              style={{
                padding: '0.75rem 1.5rem',
                background: paymentsSubTab === 'pending'
                  ? 'linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%)'
                  : 'rgba(26, 31, 58, 0.6)',
                color: paymentsSubTab === 'pending' ? 'white' : 'rgba(255, 255, 255, 0.9)',
                border: paymentsSubTab === 'pending' ? 'none' : '2px solid rgba(255, 107, 107, 0.3)',
                borderRadius: '10px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
            >
              ⏳ Lista Pendiente de Aprobación
            </button>
            <button
              onClick={() => setPaymentsSubTab('active')}
              style={{
                padding: '0.75rem 1.5rem',
                background: paymentsSubTab === 'active'
                  ? 'linear-gradient(135deg, #51cf66 0%, #2f9e44 100%)'
                  : 'rgba(26, 31, 58, 0.6)',
                color: paymentsSubTab === 'active' ? 'white' : 'rgba(255, 255, 255, 0.9)',
                border: paymentsSubTab === 'active' ? 'none' : '2px solid rgba(81, 207, 102, 0.3)',
                borderRadius: '10px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
            >
              ⭐ Usuarios con Suscripción Premium
            </button>
          </div>

          {/* Contenido de Lista Pendiente de Aprobación */}
          {paymentsSubTab === 'pending' && (
            <>
              <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <ActionButton onClick={fetchPendingPayments}>
                  🔄 Actualizar Lista
                </ActionButton>
                {pendingPayments.length > 0 && (
                  <span style={{ color: '#667eea', fontWeight: '600', fontSize: '1rem' }}>
                    {pendingPayments.length} pago(s) pendiente(s) de revisión
                  </span>
                )}
              </div>

          {paymentsLoading ? (
            <Loading>⏳ Cargando pagos pendientes...</Loading>
          ) : paymentsError ? (
            <Loading style={{ color: '#ff6b6b' }}>❌ Error: {paymentsError}</Loading>
          ) : pendingPayments.length === 0 ? (
            <div style={{
              padding: '3rem',
              textAlign: 'center',
              background: 'rgba(26, 31, 58, 0.6)',
              borderRadius: '12px',
              color: '#6c757d'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>No hay pagos pendientes</div>
              <div style={{ marginTop: '0.5rem' }}>Todos los pagos han sido procesados</div>
            </div>
          ) : (
            <Table>
              <thead>
                <Tr>
                  <Th>Usuario</Th>
                  <Th>Plan</Th>
                  <Th>Monto</Th>
                  <Th>Referencia</Th>
                  <Th>Fecha Notificación</Th>
                  <Th>Acciones</Th>
                </Tr>
              </thead>
              <tbody>
                {pendingPayments && pendingPayments.length > 0 ? pendingPayments.map((payment) => (
                  <Tr key={payment.subscription_id}>
                    <Td>
                      <strong>{payment.user_email}</strong>
                    </Td>
                    <Td>
                      <Badge style={{ background: '#667eea' }}>
                        {payment.plan_nombre}
                      </Badge>
                    </Td>
                    <Td>
                      <Money>${payment.plan_precio.toFixed(2)}</Money>
                    </Td>
                    <Td>
                      <code style={{
                        background: 'rgba(26, 31, 58, 0.6)',
                        padding: '0.3rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontFamily: 'monospace'
                      }}>
                        {payment.referencia_pago}
                      </code>
                    </Td>
                    <Td>
                      {payment.fecha_pago_notificado 
                        ? new Date(payment.fecha_pago_notificado).toLocaleString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'N/A'}
                    </Td>
                    <Td>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                        <ActionButton
                          variant="premium"
                          onClick={() => handleApprovePayment(payment.subscription_id)}
                          disabled={approvingPaymentId === payment.subscription_id}
                          style={{
                            background: approvingPaymentId === payment.subscription_id 
                              ? '#ccc' 
                              : 'linear-gradient(135deg, #51cf66 0%, #2f9e44 100%)',
                            opacity: approvingPaymentId === payment.subscription_id ? 0.6 : 1,
                            cursor: approvingPaymentId === payment.subscription_id ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {approvingPaymentId === payment.subscription_id ? '⏳' : '✅'} Actualizar a Plan Premium
                        </ActionButton>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, minWidth: '250px' }}>
                          <select
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            style={{
                              padding: '0.5rem',
                              borderRadius: '8px',
                              border: '1px solid rgba(102, 126, 234, 0.3)',
                              fontSize: '0.9rem',
                              background: 'rgba(26, 31, 58, 0.6)',
                              color: 'rgba(255, 255, 255, 0.9)'
                            }}
                          >
                            <option value="">Seleccionar motivo...</option>
                            <option value="No se recibió el pago">No se recibió el pago</option>
                            <option value="El banco rechazó el pago">El banco rechazó el pago</option>
                            <option value="El pago se realizó pero está retenido">El pago se realizó pero está retenido</option>
                            <option value="Comprobante inválido o ilegible">Comprobante inválido o ilegible</option>
                            <option value="Monto incorrecto">Monto incorrecto</option>
                            <option value="Referencia de pago incorrecta">Referencia de pago incorrecta</option>
                            <option value="Pago duplicado">Pago duplicado</option>
                            <option value="Otro motivo">Otro motivo</option>
                          </select>
                          <ActionButton
                            variant="premium-off"
                            onClick={() => handleRejectPayment(payment.subscription_id)}
                            disabled={!rejectReason || rejectingPaymentId === payment.subscription_id}
                            style={{
                              background: !rejectReason || rejectingPaymentId === payment.subscription_id
                                ? '#ccc'
                                : 'linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%)',
                              opacity: !rejectReason || rejectingPaymentId === payment.subscription_id ? 0.6 : 1,
                              cursor: !rejectReason || rejectingPaymentId === payment.subscription_id ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {rejectingPaymentId === payment.subscription_id ? '⏳' : '❌'} Denegar Acceso
                          </ActionButton>
                        </div>
                      </div>
                    </Td>
                  </Tr>
                )) : (
                  <Tr>
                    <Td colSpan="6" style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)', padding: '2rem' }}>
                      No hay pagos pendientes en este momento.
                    </Td>
                  </Tr>
                )}
              </tbody>
            </Table>
          )}
            </>
          )}

          {/* Contenido de Usuarios con Suscripción Premium */}
          {paymentsSubTab === 'active' && (
            <>
              <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <ActionButton onClick={fetchActiveSubscriptions}>
                  🔄 Actualizar Lista
                </ActionButton>
                {activeSubscriptions.length > 0 && (
                  <span style={{ color: '#51cf66', fontWeight: '600', fontSize: '1rem' }}>
                    {activeSubscriptions.length} usuario(s) con suscripción premium activa
                  </span>
                )}
              </div>

              {activeSubscriptionsLoading ? (
                <Loading>⏳ Cargando suscripciones activas...</Loading>
              ) : activeSubscriptionsError ? (
                <Loading style={{ color: '#ff6b6b' }}>❌ Error: {activeSubscriptionsError}</Loading>
              ) : activeSubscriptions.length === 0 ? (
                <div style={{
                  padding: '3rem',
                  textAlign: 'center',
                  background: 'rgba(26, 31, 58, 0.6)',
                  borderRadius: '12px',
                  color: 'rgba(255, 255, 255, 0.7)'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⭐</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '600', color: 'rgba(255, 255, 255, 0.9)' }}>No hay usuarios con suscripción premium</div>
                  <div style={{ marginTop: '0.5rem' }}>No hay suscripciones activas en este momento</div>
                </div>
              ) : (
                <Table>
                  <thead>
                    <Tr>
                      <Th>Usuario</Th>
                      <Th>Email</Th>
                      <Th>Plan</Th>
                      <Th>Fecha Inicio</Th>
                      <Th>Fecha Fin</Th>
                      <Th>Estado</Th>
                      <Th>Acciones</Th>
                    </Tr>
                  </thead>
                  <tbody>
                    {activeSubscriptions && activeSubscriptions.length > 0 ? activeSubscriptions.map((subscription) => (
                      <Tr key={subscription.id}>
                        <Td>
                          <strong style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                            {subscription.user_email || subscription.user?.email || 'N/A'}
                          </strong>
                        </Td>
                        <Td>
                          <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                            {subscription.user_email || subscription.user?.email || 'N/A'}
                          </span>
                        </Td>
                        <Td>
                          <Badge style={{ background: '#51cf66' }}>
                            {subscription.plan_nombre || subscription.plan?.nombre || 'N/A'}
                          </Badge>
                        </Td>
                        <Td>
                          {subscription.fecha_inicio 
                            ? new Date(subscription.fecha_inicio).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })
                            : 'N/A'}
                        </Td>
                        <Td>
                          {subscription.fecha_fin 
                            ? new Date(subscription.fecha_fin).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })
                            : 'N/A'}
                        </Td>
                        <Td>
                          <Badge style={{ 
                            background: subscription.estado === 'activa' ? '#51cf66' : '#ff6b6b',
                            color: 'white'
                          }}>
                            {subscription.estado === 'activa' ? '✅ Activa' : subscription.estado || 'N/A'}
                          </Badge>
                        </Td>
                        <Td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '250px' }}>
                            <select
                              value={cancelReason}
                              onChange={(e) => setCancelReason(e.target.value)}
                              style={{
                                padding: '0.5rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(102, 126, 234, 0.3)',
                                fontSize: '0.9rem',
                                background: 'rgba(26, 31, 58, 0.6)',
                                color: 'rgba(255, 255, 255, 0.9)',
                                marginBottom: '0.5rem'
                              }}
                            >
                              <option value="">Seleccionar motivo de cancelación...</option>
                              <option value="Incumplimiento de términos">Incumplimiento de términos</option>
                              <option value="Solicitud del usuario">Solicitud del usuario</option>
                              <option value="Pago no recibido">Pago no recibido</option>
                              <option value="Fraude detectado">Fraude detectado</option>
                              <option value="Violación de políticas">Violación de políticas</option>
                              <option value="Otro motivo">Otro motivo</option>
                            </select>
                            <ActionButton
                              variant="premium-off"
                              onClick={() => handleCancelSubscription(subscription.id)}
                              disabled={!cancelReason || cancellingSubscriptionId === subscription.id}
                              style={{
                                background: !cancelReason || cancellingSubscriptionId === subscription.id
                                  ? '#ccc'
                                  : 'linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%)',
                                opacity: !cancelReason || cancellingSubscriptionId === subscription.id ? 0.6 : 1,
                                cursor: !cancelReason || cancellingSubscriptionId === subscription.id ? 'not-allowed' : 'pointer'
                              }}
                            >
                              {cancellingSubscriptionId === subscription.id ? '⏳' : '🚫'} Cancelar Suscripción
                            </ActionButton>
                          </div>
                        </Td>
                      </Tr>
                    )) : (
                      <Tr>
                        <Td colSpan="7" style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)', padding: '2rem' }}>
                          No hay suscripciones activas en este momento.
                        </Td>
                      </Tr>
                    )}
                  </tbody>
                </Table>
              )}
            </>
          )}
        </Section>
      )}

      {activeTab === 'plans' && (
        <Section>
          <SectionTitle>📋 Gestión de Planes de Suscripción</SectionTitle>
          
          {plansLoading && <Loading>⏳ Cargando planes...</Loading>}
          {plansError && (
            <div style={{ color: '#ff6b6b', padding: '1rem', background: 'rgba(255, 107, 107, 0.1)', borderRadius: '8px', marginBottom: '1rem' }}>
              ❌ Error: {plansError}
            </div>
          )}
          
          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <ActionButton 
              variant="premium" 
              onClick={() => {
                resetPlanForm();
                setShowPlanForm(true);
              }}
            >
              ➕ Crear Nuevo Plan
            </ActionButton>
            <RefreshButton onClick={fetchPlans}>
              🔄 Actualizar Lista
            </RefreshButton>
          </div>

          {!plansLoading && !plansError && plans.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              📭 No hay planes creados aún. Crea tu primer plan para comenzar.
            </div>
          )}

          {!plansLoading && !plansError && plans.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
              {plans.map(plan => {
                const stats = planStats[plan.id] || {};
                return (
                  <div
                    key={plan.id}
                    style={{
                      background: 'rgba(30, 41, 59, 0.8)',
                      backdropFilter: 'blur(10px)',
                      border: `2px solid ${plan.es_activo ? 'rgba(102, 126, 234, 0.3)' : 'rgba(255, 107, 107, 0.3)'}`,
                      borderRadius: '12px',
                      padding: '1.5rem',
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                      <h3 style={{ color: 'rgba(255, 255, 255, 0.95)', margin: 0, fontSize: '1.3rem' }}>
                        {plan.nombre}
                      </h3>
                      <span
                        style={{
                          padding: '0.3rem 0.8rem',
                          borderRadius: '15px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          background: plan.es_activo ? 'rgba(81, 207, 102, 0.2)' : 'rgba(255, 107, 107, 0.2)',
                          color: plan.es_activo ? '#51cf66' : '#ff6b6b',
                          border: `1px solid ${plan.es_activo ? 'rgba(81, 207, 102, 0.3)' : 'rgba(255, 107, 107, 0.3)'}`
                        }}
                      >
                        {plan.es_activo ? '✅ Activo' : '❌ Inactivo'}
                      </span>
                    </div>
                    
                    <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '1rem', fontSize: '0.95rem' }}>
                      {plan.descripcion || 'Sin descripción'}
                    </p>
                    
                    <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(26, 31, 58, 0.4)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>💰 Precio:</span>
                        <span style={{ color: '#51cf66', fontWeight: 600, fontSize: '1.1rem' }}>${plan.precio}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>⏱️ Período:</span>
                        <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                          {plan.periodo === 'personalizado' 
                            ? `${plan.periodo_cantidad} ${plan.periodo_tipo}`
                            : plan.periodo.charAt(0).toUpperCase() + plan.periodo.slice(1)
                          }
                        </span>
                      </div>
                      {stats.active_subscriptions !== undefined && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>👥 Suscripciones activas:</span>
                          <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>{stats.active_subscriptions || 0}</span>
                        </div>
                      )}
                    </div>

                    {plan.beneficios && plan.beneficios.length > 0 && (
                      <div style={{ marginBottom: '1rem' }}>
                        <strong style={{ color: 'rgba(255, 255, 255, 0.9)', display: 'block', marginBottom: '0.5rem' }}>✨ Beneficios:</strong>
                        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                          {plan.beneficios.slice(0, 3).map((beneficio, idx) => (
                            <li key={idx}>{beneficio}</li>
                          ))}
                          {plan.beneficios.length > 3 && (
                            <li style={{ fontStyle: 'italic' }}>... y {plan.beneficios.length - 3} más</li>
                          )}
                        </ul>
                      </div>
                    )}

                    <ButtonGroup style={{ marginTop: '1rem' }}>
                      <ActionButton 
                        variant="premium" 
                        onClick={() => openEditPlan(plan)}
                        style={{ flex: 1 }}
                      >
                        ✏️ Editar
                      </ActionButton>
                      {plan.es_activo ? (
                        <ActionButton 
                          variant="premium-off" 
                          onClick={() => handleDeactivatePlan(plan.id)}
                          style={{ flex: 1 }}
                        >
                          🚫 Desactivar
                        </ActionButton>
                      ) : (
                        <ActionButton 
                          variant="premium" 
                          onClick={() => handleActivatePlan(plan.id)}
                          style={{ flex: 1 }}
                        >
                          ✅ Activar
                        </ActionButton>
                      )}
                      <ActionButton 
                        variant="delete" 
                        onClick={() => handleDeletePlan(plan.id)}
                        style={{ flex: 1 }}
                      >
                        🗑️ Eliminar
                      </ActionButton>
                    </ButtonGroup>
                  </div>
                );
              })}
            </div>
          )}

          {/* Modal de formulario de plan */}
          {showPlanForm && (
            <Modal onClick={(e) => e.target === e.currentTarget && (setShowPlanForm(false), resetPlanForm())}>
              <ModalContent onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <ModalTitle>{editingPlan ? '✏️ Editar Plan' : '➕ Crear Nuevo Plan'}</ModalTitle>
                  <button
                    onClick={() => {
                      setShowPlanForm(false);
                      resetPlanForm();
                    }}
                    style={{
                      background: 'rgba(26, 31, 58, 0.6)',
                      border: 'none',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ×
                  </button>
                </div>

                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255, 255, 255, 0.95)', fontWeight: 600 }}>
                  Nombre del Plan <span style={{ color: '#ff6b6b' }}>*</span>
                </label>
                <Input
                  type="text"
                  value={planFormData.nombre}
                  onChange={(e) => setPlanFormData({ ...planFormData, nombre: e.target.value })}
                  placeholder="Ej: Plan Premium Mensual"
                />

                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255, 255, 255, 0.95)', fontWeight: 600 }}>
                  Descripción
                </label>
                <TextArea
                  value={planFormData.descripcion}
                  onChange={(e) => setPlanFormData({ ...planFormData, descripcion: e.target.value })}
                  placeholder="Describe los beneficios del plan..."
                />

                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255, 255, 255, 0.95)', fontWeight: 600 }}>
                  Precio (USD) <span style={{ color: '#ff6b6b' }}>*</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={planFormData.precio}
                  onChange={(e) => setPlanFormData({ ...planFormData, precio: e.target.value })}
                  placeholder="0.00"
                />

                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255, 255, 255, 0.95)', fontWeight: 600 }}>
                  Tipo de Periodo <span style={{ color: '#ff6b6b' }}>*</span>
                </label>
                <Select
                  value={planFormData.periodo}
                  onChange={(e) => {
                    const periodo = e.target.value;
                    setPlanFormData({
                      ...planFormData,
                      periodo,
                      periodo_tipo: periodo === 'personalizado' ? planFormData.periodo_tipo : undefined,
                      periodo_cantidad: periodo === 'personalizado' ? planFormData.periodo_cantidad : undefined
                    });
                  }}
                >
                  <option value="mensual">Mensual</option>
                  <option value="semanal">Semanal</option>
                  <option value="trimestral">Trimestral</option>
                  <option value="anual">Anual</option>
                  <option value="personalizado">Personalizado</option>
                </Select>

                {planFormData.periodo === 'personalizado' && (
                  <>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255, 255, 255, 0.95)', fontWeight: 600 }}>
                      Cantidad <span style={{ color: '#ff6b6b' }}>*</span>
                    </label>
                    <Input
                      type="number"
                      value={planFormData.periodo_cantidad}
                      onChange={(e) => setPlanFormData({ ...planFormData, periodo_cantidad: e.target.value })}
                      placeholder="Ej: 4"
                    />

                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255, 255, 255, 0.95)', fontWeight: 600 }}>
                      Tipo <span style={{ color: '#ff6b6b' }}>*</span>
                    </label>
                    <Select
                      value={planFormData.periodo_tipo}
                      onChange={(e) => setPlanFormData({ ...planFormData, periodo_tipo: e.target.value })}
                    >
                      <option value="minutos">Minutos</option>
                      <option value="horas">Horas</option>
                      <option value="dias">Días</option>
                      <option value="semanas">Semanas</option>
                      <option value="meses">Meses</option>
                      <option value="años">Años</option>
                    </Select>
                  </>
                )}

                <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 600 }}>
                      Elegir la lista de Beneficios Deseados
                    </label>
                    <button
                      onClick={() => setBeneficiosExpanded(!beneficiosExpanded)}
                      style={{
                        background: 'rgba(26, 31, 58, 0.6)',
                        border: '1px solid rgba(102, 126, 234, 0.3)',
                        color: 'rgba(255, 255, 255, 0.9)',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      {beneficiosExpanded ? '▲ Ocultar' : '▼ Mostrar'}
                    </button>
                  </div>

                  {beneficiosExpanded && (
                    <div style={{ background: 'rgba(26, 31, 58, 0.4)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <button
                          onClick={seleccionarTodosBeneficios}
                          style={{
                            background: 'rgba(102, 126, 234, 0.3)',
                            border: '1px solid rgba(102, 126, 234, 0.5)',
                            color: 'rgba(255, 255, 255, 0.9)',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                          }}
                        >
                          Seleccionar Todos
                        </button>
                        <button
                          onClick={deseleccionarTodosBeneficios}
                          style={{
                            background: 'rgba(102, 126, 234, 0.3)',
                            border: '1px solid rgba(102, 126, 234, 0.5)',
                            color: 'rgba(255, 255, 255, 0.9)',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                          }}
                        >
                          Deseleccionar Todos
                        </button>
                      </div>
                      {beneficiosPredeterminados.map((beneficio, idx) => {
                        const isSelected = planFormData.beneficios.includes(beneficio);
                        return (
                          <div
                            key={idx}
                            onClick={() => toggleBeneficioPredeterminado(beneficio)}
                            style={{
                              padding: '0.6rem',
                              marginBottom: '0.5rem',
                              background: isSelected ? 'rgba(255, 212, 59, 0.15)' : 'transparent',
                              border: `1px solid ${isSelected ? 'rgba(255, 212, 59, 0.3)' : 'rgba(102, 126, 234, 0.2)'}`,
                              borderRadius: '6px',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            <span style={{ color: isSelected ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.7)' }}>
                              {isSelected ? '✓ ' : '○ '}
                              {beneficio}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255, 255, 255, 0.95)', fontWeight: 600 }}>
                      Beneficios Personalizados
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Input
                        type="text"
                        value={newBenefit}
                        onChange={(e) => setNewBenefit(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addBenefit()}
                        placeholder="Agregar beneficio personalizado..."
                        style={{ flex: 1 }}
                      />
                      <ActionButton variant="premium" onClick={addBenefit}>
                        ➕ Agregar
                      </ActionButton>
                    </div>
                    {planFormData.beneficios.filter(b => !beneficiosPredeterminados.includes(b)).map((beneficio, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.6rem',
                          marginBottom: '0.5rem',
                          background: 'rgba(255, 212, 59, 0.15)',
                          border: '1px solid rgba(255, 212, 59, 0.3)',
                          borderRadius: '6px'
                        }}
                      >
                        <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{beneficio}</span>
                        <button
                          onClick={() => removeBenefit(planFormData.beneficios.indexOf(beneficio))}
                          style={{
                            background: 'rgba(255, 107, 107, 0.2)',
                            border: '1px solid rgba(255, 107, 107, 0.3)',
                            color: '#ff6b6b',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <ButtonGroup style={{ marginTop: '2rem' }}>
                  <ActionButton variant="premium-off" onClick={() => {
                    setShowPlanForm(false);
                    resetPlanForm();
                  }}>
                    Cancelar
                  </ActionButton>
                  <ActionButton variant="premium" onClick={editingPlan ? handleUpdatePlan : handleCreatePlan}>
                    {editingPlan ? '💾 Guardar Cambios' : '✅ Crear Plan'}
                  </ActionButton>
                </ButtonGroup>
              </ModalContent>
            </Modal>
          )}
        </Section>
      )}
    </>
  );

  return (
    <Container>
      {!hideSidebar && (
        <Title>
          👑 Dashboard de Administrador
        </Title>
      )}

      {diagnostic && (
        <div>
          <DiagnosticButton onClick={runDiagnostic}>
            🔄 Re-ejecutar Diagnóstico
          </DiagnosticButton>
          <DiagnosticResult>
            <strong>🔍 Diagnóstico del Sistema:</strong>
            {'\n\n'}
            {JSON.stringify(diagnostic, null, 2)}
          </DiagnosticResult>
        </div>
      )}

      {!hideSidebar ? (
        <DashboardLayout>
          <Sidebar>
            <SidebarSection>
              <BackButton onClick={() => navigate('/')}>
                <FiArrowLeft /> Volver al Menú Principal
              </BackButton>
            </SidebarSection>

            <SidebarSection>
              <SidebarTitle>Navegación</SidebarTitle>
              <NavItem 
                $active={activeTab === 'dashboard'} 
                onClick={() => setActiveTab('dashboard')}
              >
                <NavIcon><FiBarChart /></NavIcon>
                Estadísticas
              </NavItem>
              <NavItem 
                $active={activeTab === 'pending'} 
                onClick={() => setActiveTab('pending')}
              >
                <NavIcon><FiFileText /></NavIcon>
                Publicaciones Pendientes ({dashboard?.posts?.pending || 0})
              </NavItem>
              <NavItem 
                $active={activeTab === 'users'} 
                onClick={() => setActiveTab('users')}
              >
                <NavIcon><FiUsers /></NavIcon>
                Gestión de Usuarios
              </NavItem>
              <NavItem 
                $active={activeTab === 'reported'} 
                onClick={() => setActiveTab('reported')}
              >
                <NavIcon><FiAlertTriangle /></NavIcon>
                ALERT! ({dashboard?.posts?.flagged || 0})
              </NavItem>
              <NavItem 
                $active={activeTab === 'earnings'} 
                onClick={() => setActiveTab('earnings')}
              >
                <NavIcon><FiDollarSign /></NavIcon>
                Gestionar Ganancias
              </NavItem>
              <NavItem 
                $active={activeTab === 'monetization'} 
                onClick={() => setActiveTab('monetization')}
              >
                <NavIcon><FiSettings /></NavIcon>
                Configurar Monetización
              </NavItem>
              <NavItem
                $active={activeTab === 'premium'}
                onClick={() => setActiveTab('premium')}
              >
                <NavIcon><FiStar /></NavIcon>
                Noticias Premium
              </NavItem>
              <NavItem
                $active={activeTab === 'payments'}
                onClick={() => setActiveTab('payments')}
              >
                <NavIcon><FiCreditCard /></NavIcon>
                Pagos Suscripciones
              </NavItem>
              <NavItem
                $active={activeTab === 'plans'}
                onClick={() => setActiveTab('plans')}
              >
                <NavIcon><FiList /></NavIcon>
                Gestión de Planes
              </NavItem>
            </SidebarSection>
          </Sidebar>

          <MainContent>
            {renderContent()}
          </MainContent>
        </DashboardLayout>
      ) : (
        renderContent()
      )}
    </Container>
  );
}

export default AdminDashboard;
