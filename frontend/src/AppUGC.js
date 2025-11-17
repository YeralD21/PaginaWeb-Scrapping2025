import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { useAuth } from './contexts/AuthContext';
import CreatePost from './components/UGC/CreatePost';
import MyPosts from './components/UGC/MyPosts';
import AdminDashboard from './components/UGC/AdminDashboard';
import MonetizationProgress from './components/UGC/MonetizationProgress';
import EarningsPanel from './components/UGC/EarningsPanel';
import MyPlans from './components/UGC/MyPlans';
import { FiMenu, FiHome, FiFileText, FiDollarSign, FiStar, FiAward, FiLogOut, FiArrowLeft, FiBarChart, FiUsers, FiAlertTriangle, FiSettings, FiCreditCard, FiList } from 'react-icons/fi';

const API_BASE = 'http://localhost:8000';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1f3a 0%, #2d3561 50%, #1a1f3a 100%);
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background: rgba(26, 31, 58, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(102, 126, 234, 0.2);
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.h1`
  font-size: 1.5rem;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserEmail = styled.span`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
`;

const Badge = styled.span`
  background: ${props => props.isAdmin ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)' : 'linear-gradient(135deg, #51cf66 0%, #40c057 100%)'};
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

const LogoutButton = styled.button`
  background: rgba(102, 126, 234, 0.2);
  color: white;
  border: 1px solid rgba(102, 126, 234, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;

  &:hover {
    background: rgba(102, 126, 234, 0.3);
    border-color: rgba(102, 126, 234, 0.5);
    transform: translateY(-2px);
  }
`;

const DashboardLayout = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const Sidebar = styled.aside`
  width: 280px;
  background: rgba(26, 31, 58, 0.95);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(102, 126, 234, 0.2);
  padding: 2rem 0;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: calc(100vh - 73px);
  overflow-y: auto;

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

  &:hover {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%);
    border-color: rgba(102, 126, 234, 0.5);
    transform: translateY(-2px);
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  background: transparent;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(26, 31, 58, 0.5);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(102, 126, 234, 0.3);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(102, 126, 234, 0.5);
  }
`;

const ContentCard = styled.div`
  background: transparent;
  backdrop-filter: none;
  border: none;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.2rem;
`;

function AppUGC() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, logout, isAuthenticated, isAdmin: checkIsAdmin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('create');
  const [adminTab, setAdminTab] = useState('dashboard'); // Para controlar las sub-secciones del admin
  const [monetizationEnabled, setMonetizationEnabled] = useState(false);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated()) {
      navigate('/');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Establecer tab inicial según rol cuando el usuario se carga
  useEffect(() => {
    if (user && token && !authLoading) {
      // Verificar el rol directamente del objeto user para evitar problemas de timing
      const userRole = user?.role;
      const isUserAdmin = userRole === 'admin' || userRole === 'ADMIN';
      const currentPath = location.pathname;
      
      // Redirigir según la ruta y el rol
      if (isUserAdmin) {
        // Si es admin, asegurar que esté en admin-dashboard y mostrar tab admin
        if (currentPath === '/user-dashboard' || currentPath === '/ugc-feed') {
          navigate('/admin-dashboard', { replace: true });
        }
        setActiveTab('admin');
        setAdminTab('dashboard'); // Inicializar el tab del admin
      } else {
        // Si es usuario normal, asegurar que esté en user-dashboard y mostrar tab create
        if (currentPath === '/admin-dashboard') {
          navigate('/user-dashboard', { replace: true });
        }
        setActiveTab('create');
      }
    }
  }, [user, token, authLoading, navigate, location.pathname]);

  // Verificar estado de monetización cuando hay usuario
  useEffect(() => {
    if (token && user && user.role !== 'admin' && user.role !== 'ADMIN') {
      checkMonetizationStatus();
    }
  }, [token, user]);

  const checkMonetizationStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE}/ugc/monetization/progress`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMonetizationEnabled(response.data.monetization_enabled);
    } catch (err) {
      console.error('Error al verificar monetización:', err);
    }
  };

  const handleLogout = () => {
    // Limpiar el estado local primero
    setActiveTab('create');
    // Luego hacer logout y navegar
    logout();
    // Usar replace para evitar que el usuario pueda volver atrás
    navigate('/', { replace: true });
  };

  const handlePostCreated = () => {
    // Refrescar la vista de mis posts
    setActiveTab('my-posts');
  };

  // Mostrar loading mientras se verifica autenticación
  if (authLoading) {
    return (
      <AppContainer>
        <LoadingContainer>
          <div>Cargando...</div>
        </LoadingContainer>
      </AppContainer>
    );
  }

  // Si no está autenticado, no mostrar nada (el useEffect redirigirá)
  if (!isAuthenticated() || !user || !token) {
    return null;
  }

  // Verificar el rol directamente del objeto user para evitar problemas de timing
  const userRole = user?.role;
  const isAdmin = userRole === 'admin' || userRole === 'ADMIN';

  return (
    <AppContainer>
      <Header>
        <HeaderContent>
          <Logo>
            <FiMenu style={{ fontSize: '1.5rem' }} />
            UGC Platform
          </Logo>
          <UserInfo>
            <UserEmail>{user.email}</UserEmail>
            <Badge isAdmin={isAdmin}>
              {isAdmin ? '👑 ADMIN' : '👤 USER'}
            </Badge>
            <LogoutButton onClick={handleLogout}>
              <FiLogOut /> Salir
            </LogoutButton>
          </UserInfo>
        </HeaderContent>
      </Header>

      <DashboardLayout>
        <Sidebar>
          <SidebarSection>
            <BackButton onClick={() => navigate('/')}>
              <FiArrowLeft /> Volver al Menú Principal
            </BackButton>
          </SidebarSection>

          <SidebarSection>
            <SidebarTitle>Navegación</SidebarTitle>
            {!isAdmin && (
              <>
                <NavItem 
                  $active={activeTab === 'create'} 
                  onClick={() => setActiveTab('create')}
                >
                  <NavIcon><FiFileText /></NavIcon>
                  Crear Publicación
                </NavItem>
                <NavItem 
                  $active={activeTab === 'my-posts'} 
                  onClick={() => setActiveTab('my-posts')}
                >
                  <NavIcon><FiFileText /></NavIcon>
                  Mis Publicaciones
                </NavItem>
                <NavItem 
                  $active={activeTab === 'earnings'} 
                  onClick={() => setActiveTab('earnings')}
                >
                  <NavIcon><FiDollarSign /></NavIcon>
                  Ingresos
                </NavItem>
                <NavItem 
                  $active={activeTab === 'plans'} 
                  onClick={() => setActiveTab('plans')}
                >
                  <NavIcon><FiStar /></NavIcon>
                  Mis Planes
                </NavItem>
              </>
            )}
            {isAdmin && (
              <>
                <NavItem 
                  $active={activeTab === 'admin' && adminTab === 'dashboard'} 
                  onClick={() => {
                    setActiveTab('admin');
                    setAdminTab('dashboard');
                  }}
                >
                  <NavIcon><FiBarChart /></NavIcon>
                  Estadísticas
                </NavItem>
                <NavItem 
                  $active={activeTab === 'admin' && adminTab === 'pending'} 
                  onClick={() => {
                    setActiveTab('admin');
                    setAdminTab('pending');
                  }}
                >
                  <NavIcon><FiFileText /></NavIcon>
                  Publicaciones Pendientes
                </NavItem>
                <NavItem 
                  $active={activeTab === 'admin' && adminTab === 'users'} 
                  onClick={() => {
                    setActiveTab('admin');
                    setAdminTab('users');
                  }}
                >
                  <NavIcon><FiUsers /></NavIcon>
                  Gestión de Usuarios
                </NavItem>
                <NavItem 
                  $active={activeTab === 'admin' && adminTab === 'reported'} 
                  onClick={() => {
                    setActiveTab('admin');
                    setAdminTab('reported');
                  }}
                >
                  <NavIcon><FiAlertTriangle /></NavIcon>
                  ALERT!
                </NavItem>
                <NavItem 
                  $active={activeTab === 'admin' && adminTab === 'earnings'} 
                  onClick={() => {
                    setActiveTab('admin');
                    setAdminTab('earnings');
                  }}
                >
                  <NavIcon><FiDollarSign /></NavIcon>
                  Gestionar Ganancias
                </NavItem>
                <NavItem 
                  $active={activeTab === 'admin' && adminTab === 'monetization'} 
                  onClick={() => {
                    setActiveTab('admin');
                    setAdminTab('monetization');
                  }}
                >
                  <NavIcon><FiSettings /></NavIcon>
                  Configurar Monetización
                </NavItem>
                <NavItem 
                  $active={activeTab === 'admin' && adminTab === 'premium'} 
                  onClick={() => {
                    setActiveTab('admin');
                    setAdminTab('premium');
                  }}
                >
                  <NavIcon><FiStar /></NavIcon>
                  Noticias Premium
                </NavItem>
                <NavItem 
                  $active={activeTab === 'admin' && adminTab === 'payments'} 
                  onClick={() => {
                    setActiveTab('admin');
                    setAdminTab('payments');
                  }}
                >
                  <NavIcon><FiCreditCard /></NavIcon>
                  Pagos Suscripciones
                </NavItem>
                <NavItem 
                  $active={activeTab === 'admin' && adminTab === 'plans'} 
                  onClick={() => {
                    setActiveTab('admin');
                    setAdminTab('plans');
                  }}
                >
                  <NavIcon><FiList /></NavIcon>
                  Gestión de Planes
                </NavItem>
              </>
            )}
          </SidebarSection>
        </Sidebar>

        <MainContent>
          <ContentCard>
            {/* Contenido según tab activo */}
            {activeTab === 'create' && !isAdmin && (
              <CreatePost token={token} onPostCreated={handlePostCreated} />
            )}

            {activeTab === 'my-posts' && !isAdmin && (
              <MyPosts token={token} />
            )}

            {activeTab === 'earnings' && !isAdmin && (
              monetizationEnabled ? (
                <EarningsPanel token={token} />
              ) : (
                <MonetizationProgress 
                  token={token} 
                  onMonetizationEnabled={() => {
                    setMonetizationEnabled(true);
                    checkMonetizationStatus();
                  }} 
                />
              )
            )}

            {activeTab === 'plans' && !isAdmin && (
              <MyPlans token={token} />
            )}

            {activeTab === 'admin' && isAdmin && (
              <AdminDashboard 
                token={token} 
                hideSidebar={true} 
                activeTab={adminTab}
                setActiveTab={setAdminTab}
              />
            )}
          </ContentCard>
        </MainContent>
      </DashboardLayout>
    </AppContainer>
  );
}

export default AppUGC;

