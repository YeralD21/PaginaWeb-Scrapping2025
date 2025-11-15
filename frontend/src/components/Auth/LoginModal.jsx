import React, { useState } from 'react';
import styled from 'styled-components';
import { FiX, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background: #f5f5f5;
    color: #333;
  }
`;

const Title = styled.h2`
  color: #333;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-align: center;
`;

const Subtitle = styled.p`
  color: #666;
  text-align: center;
  margin: 0 0 2rem 0;
  font-size: 1rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #D32F2F;
    box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 1.2rem;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    color: #D32F2F;
    background: rgba(211, 47, 47, 0.1);
  }
`;

const LoginButton = styled.button`
  background: #D32F2F;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;

  &:hover {
    background: #B71C1C;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(211, 47, 47, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ErrorMessage = styled.div`
  background: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #c62828;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

const SuccessMessage = styled.div`
  background: #e8f5e8;
  color: #2e7d32;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #2e7d32;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s ease-in-out infinite;
  margin-right: 0.5rem;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const SwitchMode = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e1e5e9;
`;

const SwitchButton = styled.button`
  background: none;
  border: none;
  color: #1976D2;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: underline;

  &:hover {
    color: #1565C0;
  }
`;

function LoginModal({ onClose, onSwitchToRegister, skipRedirect = false, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Por favor completa todos los campos');
      setLoading(false);
      return;
    }

    const result = await login(email, password);
    
    if (result.success) {
      setSuccess('¡Inicio de sesión exitoso!');
      
      // Llamar al callback de éxito si existe ANTES de cerrar el modal
      if (onLoginSuccess) {
        onLoginSuccess();
      }
      
      // Cerrar el modal después de un breve delay para permitir que el callback se ejecute
      setTimeout(() => {
        onClose();
        // Solo redirigir si no se especifica skipRedirect
        if (!skipRedirect) {
          // Usar el rol del usuario del resultado del login, no del contexto
          // para evitar problemas de timing con el estado anterior
          const userRole = result.user?.role;
          const isUserAdmin = userRole === 'admin' || userRole === 'ADMIN';
          
          // Redirigir según el rol del usuario que acaba de loguearse
          if (isUserAdmin) {
            navigate('/admin-dashboard', { replace: true });
          } else {
            navigate('/user-dashboard', { replace: true });
          }
        }
      }, 800); // Reducido a 800ms para que el modal se cierre más rápido
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <ModalOverlay onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={handleClose}>
          <FiX />
        </CloseButton>

        <Title>Iniciar Sesión</Title>
        <Subtitle>Accede a tu cuenta para continuar</Subtitle>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <InputIcon>
              <FiMail />
            </InputIcon>
            <Input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </InputGroup>

          <InputGroup>
            <InputIcon>
              <FiLock />
            </InputIcon>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </PasswordToggle>
          </InputGroup>

          <LoginButton type="submit" disabled={loading}>
            {loading && <LoadingSpinner />}
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </LoginButton>
        </Form>

        <SwitchMode>
          <span style={{ color: '#666' }}>¿No tienes cuenta? </span>
          <SwitchButton onClick={onSwitchToRegister}>
            Regístrate aquí
          </SwitchButton>
        </SwitchMode>
      </ModalContent>
    </ModalOverlay>
  );
}

export default LoginModal;
