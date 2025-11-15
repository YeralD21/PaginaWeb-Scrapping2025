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

const API_BASE = 'http://localhost:8000';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
`;

const Header = styled.header`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.h1`
  font-size: 1.8rem;
  margin: 0;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserEmail = styled.span`
  font-size: 1rem;
`;

const Badge = styled.span`
  background: ${props => props.isAdmin ? '#ff6b6b' : '#51cf66'};
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
`;

const LogoutButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);

  &:hover {
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  }

  &:active {
    transform: translateY(0);
  }
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Tab = styled.button`
  padding: 1rem 2rem;
  background: ${props => props.$active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#666'};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;

  &:hover {
    background: ${props => props.$active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f0f0f0'};
  }
`;

function AppUGC() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, logout, isAuthenticated, isAdmin: checkIsAdmin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('create');
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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <div>Cargando...</div>
        </div>
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
          <Logo>🚀 UGC Platform</Logo>
          <UserInfo>
            <UserEmail>{user.email}</UserEmail>
            <Badge isAdmin={isAdmin}>
              {isAdmin ? '👑 ADMIN' : '👤 USER'}
            </Badge>
            <LogoutButton onClick={handleLogout}>
              🚪 Salir
            </LogoutButton>
          </UserInfo>
        </HeaderContent>
      </Header>

      <MainContent>
        {/* Botón Volver al Menú Principal */}
        <BackButton onClick={() => navigate('/')}>
          ← Volver al Menú Principal
        </BackButton>

        <TabContainer>
          {!isAdmin && (
            <>
              <Tab 
                $active={activeTab === 'create'} 
                onClick={() => setActiveTab('create')}
              >
                ✨ Crear Publicación
              </Tab>
              <Tab 
                $active={activeTab === 'my-posts'} 
                onClick={() => setActiveTab('my-posts')}
              >
                📊 Mis Publicaciones
              </Tab>
              <Tab 
                $active={activeTab === 'earnings'} 
                onClick={() => setActiveTab('earnings')}
                style={{
                  background: activeTab === 'earnings' 
                    ? 'linear-gradient(135deg, #28a745 0%, #51cf66 100%)' 
                    : 'transparent'
                }}
              >
                💰 Ingresos
              </Tab>
              <Tab 
                $active={activeTab === 'plans'} 
                onClick={() => setActiveTab('plans')}
                style={{
                  background: activeTab === 'plans' 
                    ? 'linear-gradient(135deg, #ffd43b 0%, #ffa94d 100%)' 
                    : 'transparent'
                }}
              >
                ⭐ Mis Planes
              </Tab>
            </>
          )}
          {isAdmin && (
            <Tab 
              $active={activeTab === 'admin'} 
              onClick={() => setActiveTab('admin')}
            >
              👑 Dashboard Admin
            </Tab>
          )}
        </TabContainer>

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
          <AdminDashboard token={token} />
        )}
      </MainContent>
    </AppContainer>
  );
}

export default AppUGC;

