import React, { useState } from 'react';
import styled from 'styled-components';
import { FiUser, FiLogOut, FiSettings, FiTrendingUp } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

const AuthContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const AuthButton = styled.button`
  background: ${props => props.variant === 'login' ? '#D32F2F' : '#1976D2'};
  color: white;
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${props => props.variant === 'login' ? '#B71C1C' : '#1565C0'};
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const UserMenu = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const UserEmail = styled.span`
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
`;

const UserRole = styled.span`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.7rem;
  text-transform: uppercase;
  font-weight: 600;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 1000;
  margin-top: 0.5rem;
  overflow: hidden;
  animation: slideDown 0.2s ease-out;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const DropdownItem = styled.button`
  width: 100%;
  background: none;
  border: none;
  padding: 1rem 1.5rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: #333;
  font-size: 0.9rem;

  &:hover {
    background: #f8f9fa;
    color: #D32F2F;
  }

  &:first-child {
    border-bottom: 1px solid #e9ecef;
  }
`;

const LogoutButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #c82333;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

function AuthNavbar() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleRegisterClick = () => {
    setShowRegisterModal(true);
  };

  const handleCloseModals = () => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
  };

  const handleSwitchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  const handleDashboardClick = () => {
    if (isAdmin()) {
      navigate('/admin-dashboard');
    } else {
      navigate('/user-dashboard');
    }
    setShowUserMenu(false);
  };

  const handleUGCFeedClick = () => {
    navigate('/ugc-feed');
    setShowUserMenu(false);
  };

  const getUserInitials = (email) => {
    return email ? email.charAt(0).toUpperCase() : 'U';
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  // Cerrar menú al hacer click fuera
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  if (!isAuthenticated()) {
    return (
      <AuthContainer>
        <AuthButton variant="login" onClick={handleLoginClick}>
          <FiUser />
          Login
        </AuthButton>
        <AuthButton variant="register" onClick={handleRegisterClick}>
          Registrarse
        </AuthButton>

        {showLoginModal && (
          <LoginModal
            onClose={handleCloseModals}
            onSwitchToRegister={handleSwitchToRegister}
          />
        )}

        {showRegisterModal && (
          <RegisterModal
            onClose={handleCloseModals}
            onSwitchToLogin={handleSwitchToLogin}
          />
        )}
      </AuthContainer>
    );
  }

  return (
    <AuthContainer>
      <UserMenu className="user-menu">
        <UserInfo onClick={toggleUserMenu}>
          <UserAvatar>
            {getUserInitials(user?.email)}
          </UserAvatar>
          <UserDetails>
            <UserEmail>{user?.email}</UserEmail>
            <UserRole>{user?.role}</UserRole>
          </UserDetails>
        </UserInfo>

        {showUserMenu && (
          <DropdownMenu>
            <DropdownItem onClick={handleDashboardClick}>
              <FiSettings />
              {isAdmin() ? 'Dashboard Admin' : 'Mi Dashboard'}
            </DropdownItem>
            <DropdownItem onClick={handleUGCFeedClick}>
              <FiTrendingUp />
              Feed UGC
            </DropdownItem>
          </DropdownMenu>
        )}

        <LogoutButton onClick={handleLogout}>
          <FiLogOut />
          Logout
        </LogoutButton>
      </UserMenu>
    </AuthContainer>
  );
}

export default AuthNavbar;
