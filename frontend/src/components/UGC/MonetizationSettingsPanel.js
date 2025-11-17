import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const API_BASE = 'http://localhost:8000';

const PanelContainer = styled.div`
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  margin-top: 2rem;
  border: 1px solid rgba(102, 126, 234, 0.2);
`;

const PanelTitle = styled.h2`
  color: #51cf66;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #51cf66;
  padding-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 0.5rem;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;
  background: rgba(26, 31, 58, 0.6);
  color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);

  &:focus {
    outline: none;
    border-color: #51cf66;
    box-shadow: 0 0 0 3px rgba(81, 207, 102, 0.1);
  }

  &:disabled {
    background: rgba(26, 31, 58, 0.4);
    cursor: not-allowed;
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const HelpText = styled.small`
  color: rgba(255, 255, 255, 0.7);
  margin-top: 0.3rem;
  font-size: 0.85rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 1rem 2rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  ${props => {
    switch(props.variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: white;
          &:hover { 
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);
          }
        `;
      case 'secondary':
        return `
          background: #6c757d;
          color: white;
          &:hover { background: #5a6268; }
        `;
      default:
        return `
          background: #e0e0e0;
          color: #333;
          &:hover { background: #d0d0d0; }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const InfoBox = styled.div`
  background: rgba(102, 126, 234, 0.15);
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  color: rgba(255, 255, 255, 0.9);
`;

const CurrentValues = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const ValueCard = styled.div`
  background: rgba(26, 31, 58, 0.6);
  backdrop-filter: blur(10px);
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid rgba(102, 126, 234, 0.5);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(102, 126, 234, 0.2);
`;

const ValueLabel = styled.div`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.3rem;
`;

const ValueNumber = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #2196f3;
`;

const SuccessMessage = styled.div`
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

function MonetizationSettingsPanel({ token, onUpdate }) {
  const [currentRequirements, setCurrentRequirements] = useState(null);
  const [formData, setFormData] = useState({
    min_noticias: 10,
    min_interacciones_noticias: 100,
    min_contenido_simple: 30,
    min_reacciones_totales: 50,
    dias_minimos_cuenta: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchCurrentRequirements();
  }, [token]);

  const fetchCurrentRequirements = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/admin/settings/monetization-requirements`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setCurrentRequirements(response.data.requirements);
      setFormData(response.data.requirements);
    } catch (err) {
      console.error('Error fetching requirements:', err);
      setErrorMessage('Error al cargar requisitos: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await axios.post(
        `${API_BASE}/admin/settings/monetization-requirements`,
        formData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      setSuccessMessage('✅ ' + response.data.message);
      setCurrentRequirements(response.data.requirements);
      
      if (onUpdate) onUpdate();

      // Limpiar mensaje después de 5 segundos
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setErrorMessage('❌ Error: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(currentRequirements || {
      min_noticias: 10,
      min_interacciones_noticias: 100,
      min_contenido_simple: 30,
      min_reacciones_totales: 50,
      dias_minimos_cuenta: 0
    });
    setSuccessMessage('');
    setErrorMessage('');
  };

  if (loading) {
    return (
      <PanelContainer>
        <p>⏳ Cargando configuración...</p>
      </PanelContainer>
    );
  }

  return (
    <PanelContainer>
      <PanelTitle>
        ⚙️ Configurar Requisitos de Monetización
      </PanelTitle>

      <InfoBox>
        <strong>ℹ️ Información:</strong>
        <p style={{marginTop: '0.5rem', marginBottom: '0.5rem', lineHeight: '1.6'}}>
          Estos requisitos determinan cuándo un usuario puede activar la monetización de su contenido.
          Los usuarios deben cumplir <strong>TODOS</strong> los requisitos antes de poder monetizar.
        </p>
        
        {currentRequirements && (
          <>
            <strong style={{display: 'block', marginTop: '1rem', marginBottom: '0.5rem'}}>
              📊 Requisitos Actuales:
            </strong>
            <CurrentValues>
              <ValueCard>
                <ValueLabel>📰 Noticias Publicadas</ValueLabel>
                <ValueNumber>{currentRequirements.min_noticias}</ValueNumber>
              </ValueCard>
              <ValueCard>
                <ValueLabel>👆 Interacciones en Noticias</ValueLabel>
                <ValueNumber>{currentRequirements.min_interacciones_noticias}</ValueNumber>
              </ValueCard>
              <ValueCard>
                <ValueLabel>📱 Contenido Variado</ValueLabel>
                <ValueNumber>{currentRequirements.min_contenido_simple}</ValueNumber>
              </ValueCard>
              <ValueCard>
                <ValueLabel>😊 Reacciones Totales</ValueLabel>
                <ValueNumber>{currentRequirements.min_reacciones_totales}</ValueNumber>
              </ValueCard>
              <ValueCard>
                <ValueLabel>📅 Días Mínimos de Cuenta</ValueLabel>
                <ValueNumber>{currentRequirements.dias_minimos_cuenta}</ValueNumber>
              </ValueCard>
            </CurrentValues>
          </>
        )}
      </InfoBox>

      {successMessage && (
        <SuccessMessage>
          {successMessage}
        </SuccessMessage>
      )}

      {errorMessage && (
        <ErrorMessage>
          {errorMessage}
        </ErrorMessage>
      )}

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>
            📰 Noticias Publicadas Mínimas
          </Label>
          <Input
            type="number"
            name="min_noticias"
            value={formData.min_noticias}
            onChange={handleInputChange}
            min="0"
            required
          />
          <HelpText>
            Cantidad mínima de noticias que el usuario debe publicar (y que sean aprobadas).
          </HelpText>
        </FormGroup>

        <FormGroup>
          <Label>
            👆 Interacciones Mínimas en Noticias
          </Label>
          <Input
            type="number"
            name="min_interacciones_noticias"
            value={formData.min_interacciones_noticias}
            onChange={handleInputChange}
            min="0"
            required
          />
          <HelpText>
            Total de vistas + clicks + interacciones que deben recibir sus noticias.
          </HelpText>
        </FormGroup>

        <FormGroup>
          <Label>
            📱 Contenido Variado Mínimo
          </Label>
          <Input
            type="number"
            name="min_contenido_simple"
            value={formData.min_contenido_simple}
            onChange={handleInputChange}
            min="0"
            required
          />
          <HelpText>
            Cantidad mínima de posts, imágenes, videos, comentarios, etc.
          </HelpText>
        </FormGroup>

        <FormGroup>
          <Label>
            😊 Reacciones Totales Mínimas
          </Label>
          <Input
            type="number"
            name="min_reacciones_totales"
            value={formData.min_reacciones_totales}
            onChange={handleInputChange}
            min="0"
            required
          />
          <HelpText>
            Suma total de todas las reacciones (👍❤️😂😢😠) que deben recibir en todos sus posts.
          </HelpText>
        </FormGroup>

        <FormGroup>
          <Label>
            📅 Días Mínimos de Antigüedad
          </Label>
          <Input
            type="number"
            name="dias_minimos_cuenta"
            value={formData.dias_minimos_cuenta}
            onChange={handleInputChange}
            min="0"
            required
          />
          <HelpText>
            Días desde la creación de la cuenta (0 = sin requisito de tiempo).
          </HelpText>
        </FormGroup>
      </Form>

      <ButtonGroup>
        <Button type="button" variant="secondary" onClick={handleReset} disabled={saving}>
          🔄 Restablecer
        </Button>
        <Button type="submit" variant="primary" onClick={handleSubmit} disabled={saving}>
          {saving ? '⏳ Guardando...' : '💾 Guardar Cambios'}
        </Button>
      </ButtonGroup>
    </PanelContainer>
  );
}

export default MonetizationSettingsPanel;

