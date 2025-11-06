import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import Login from './components/UGC/Login';
import CreatePost from './components/UGC/CreatePost';
import MyPosts from './components/UGC/MyPosts';
import AdminDashboard from './components/UGC/AdminDashboard';
import MonetizationProgress from './components/UGC/MonetizationProgress';
import EarningsPanel from './components/UGC/EarningsPanel';

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
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [activeTab, setActiveTab] = useState('create');
  const [monetizationEnabled, setMonetizationEnabled] = useState(false);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem('ugc_token');
    const storedUser = localStorage.getItem('ugc_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Verificar estado de monetización cuando hay usuario
  useEffect(() => {
    if (token && user && user.role === 'user') {
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

  const handleLogin = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    
    // Establecer tab por defecto según rol
    if (userData.role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('create');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ugc_token');
    localStorage.removeItem('ugc_user');
    setUser(null);
    setToken(null);
    setActiveTab('create');
  };

  const handlePostCreated = () => {
    // Refrescar la vista de mis posts
    setActiveTab('my-posts');
  };

  // Si no hay usuario, mostrar login
  if (!user || !token) {
    return <Login onLoginSuccess={handleLogin} />;
  }

  const isAdmin = user.role === 'admin';

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

        {activeTab === 'admin' && isAdmin && (
          <AdminDashboard token={token} />
        )}
      </MainContent>
    </AppContainer>
  );
}

export default AppUGC;

