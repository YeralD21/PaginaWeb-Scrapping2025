import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { FiDollarSign, FiTrendingUp, FiInfo } from 'react-icons/fi';

const API_BASE = 'http://localhost:8000';

const Container = styled.div`
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(102, 126, 234, 0.2);
`;

const Title = styled.h2`
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  border-bottom: 3px solid #51cf66;
  padding-bottom: 1rem;
`;

const InfoCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
`;

const ConfigGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ConfigCard = styled.div`
  background: rgba(26, 31, 58, 0.6);
  backdrop-filter: blur(10px);
  border: 2px solid ${props => props.modified ? 'rgba(81, 207, 102, 0.5)' : 'rgba(102, 126, 234, 0.3)'};
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transform: translateY(-2px);
  }
`;

const TypeHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(102, 126, 234, 0.2);
`;

const TypeIcon = styled.div`
  font-size: 2rem;
`;

const TypeName = styled.h3`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
`;

const InputGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.8rem;
  border: 2px solid ${props => props.hasError ? '#ff6b6b' : 'rgba(102, 126, 234, 0.3)'};
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  transition: all 0.3s;
  background: rgba(26, 31, 58, 0.6);
  color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);

  &:focus {
    outline: none;
    border-color: #51cf66;
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const Suffix = styled.span`
  position: absolute;
  right: 1rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
  font-size: 0.9rem;
  pointer-events: none;
`;

const EarningPreview = styled.div`
  background: linear-gradient(135deg, #28a745 0%, #51cf66 100%);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  margin-top: 1rem;
`;

const PreviewLabel = styled.div`
  font-size: 0.85rem;
  opacity: 0.9;
  margin-bottom: 0.3rem;
`;

const PreviewValue = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid rgba(102, 126, 234, 0.2);
`;

const Button = styled.button`
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  ${props => {
    if (props.primary) {
      return `
        background: linear-gradient(135deg, #28a745 0%, #51cf66 100%);
        color: white;
        &:hover { transform: scale(1.02); }
      `;
    }
    return `
      background: rgba(26, 31, 58, 0.6);
      border: 2px solid rgba(102, 126, 234, 0.3);
      color: rgba(255, 255, 255, 0.9);
      &:hover { background: rgba(26, 31, 58, 0.8); }
    `;
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const AlertBox = styled.div`
  background: rgba(255, 212, 59, 0.15);
  border: 2px solid rgba(255, 212, 59, 0.3);
  border-left: 6px solid rgba(255, 212, 59, 0.5);
  color: rgba(255, 255, 255, 0.9);
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const CONTENT_TYPES = {
  noticia: { icon: '📰', name: 'Noticia', description: 'Artículos de noticias completos' },
  texto: { icon: '📝', name: 'Texto', description: 'Publicaciones de texto simple' },
  imagen: { icon: '🖼️', name: 'Imagen', description: 'Posts con imágenes' },
  video: { icon: '🎥', name: 'Video', description: 'Contenido audiovisual' },
  comentario: { icon: '💬', name: 'Comentario', description: 'Comentarios y respuestas' },
  resena: { icon: '⭐', name: 'Reseña', description: 'Reviews y valoraciones' },
  post: { icon: '📄', name: 'Post', description: 'Posts generales' }
};

function EarningsConfigPanel({ token, onUpdate }) {
  const [config, setConfig] = useState({});
  const [originalConfig, setOriginalConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modified, setModified] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, [token]);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/admin/settings/earnings-config`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const configData = response.data.config || {};
      setConfig(configData);
      setOriginalConfig(JSON.parse(JSON.stringify(configData)));
    } catch (err) {
      console.error('Error al obtener configuración:', err);
      // Configuración por defecto
      const defaultConfig = {};
      Object.keys(CONTENT_TYPES).forEach(type => {
        defaultConfig[type] = { percentage: 30, cost_per_interaction: 0.01 };
      });
      setConfig(defaultConfig);
      setOriginalConfig(JSON.parse(JSON.stringify(defaultConfig)));
    } finally {
      setLoading(false);
    }
  };

  const handlePercentageChange = (type, value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0 || numValue > 100) return;

    setConfig(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        percentage: numValue
      }
    }));
    setModified(true);
  };

  const handleCostChange = (type, value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) return;

    setConfig(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        cost_per_interaction: numValue
      }
    }));
    setModified(true);
  };

  const calculateUserEarning = (type) => {
    const typeConfig = config[type] || { percentage: 30, cost_per_interaction: 0.01 };
    return (typeConfig.cost_per_interaction * (typeConfig.percentage / 100)).toFixed(4);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post(
        `${API_BASE}/admin/settings/earnings-config`,
        { config },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setOriginalConfig(JSON.parse(JSON.stringify(config)));
      setModified(false);
      alert('✅ Configuración de ganancias guardada exitosamente');
      if (onUpdate) onUpdate();
    } catch (err) {
      alert('❌ Error al guardar configuración: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setConfig(JSON.parse(JSON.stringify(originalConfig)));
    setModified(false);
  };

  if (loading) {
    return (
      <Container>
        <p>⏳ Cargando configuración...</p>
      </Container>
    );
  }

  return (
    <Container>
      <Title>
        <FiDollarSign /> Gestionar Ganancias por Tipo de Contenido
      </Title>

      <InfoCard>
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
          <FiInfo size={24} />
          <strong style={{fontSize: '1.1rem'}}>¿Cómo funciona el sistema de ganancias?</strong>
        </div>
        <p style={{margin: '0.5rem 0', lineHeight: '1.6'}}>
          • Cada interacción (view/click) genera un <strong>costo base</strong> configurable<br/>
          • El <strong>porcentaje</strong> determina qué parte va al usuario creador<br/>
          • El resto va para la plataforma (admin)<br/>
          • Puedes configurar diferentes valores para cada tipo de contenido
        </p>
      </InfoCard>

      <AlertBox>
        <strong><FiTrendingUp style={{marginRight: '0.5rem'}} />Ejemplo:</strong> 
        Si una noticia tiene un costo de <strong>$0.05</strong> por interacción y el usuario recibe <strong>30%</strong>, 
        entonces ganará <strong>$0.015</strong> por cada view/click, y la plataforma recibirá <strong>$0.035</strong>.
      </AlertBox>

      <ConfigGrid>
        {Object.entries(CONTENT_TYPES).map(([type, info]) => {
          const typeConfig = config[type] || { percentage: 30, cost_per_interaction: 0.01 };
          const isModified = JSON.stringify(typeConfig) !== JSON.stringify(originalConfig[type] || {});
          
          return (
            <ConfigCard key={type} modified={isModified}>
              <TypeHeader>
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                  <TypeIcon>{info.icon}</TypeIcon>
                  <div>
                    <TypeName>{info.name}</TypeName>
                    <div style={{fontSize: '0.85rem', color: '#666'}}>{info.description}</div>
                  </div>
                </div>
              </TypeHeader>

              <InputGroup>
                <Label>💰 Costo Base por Interacción</Label>
                <InputWrapper>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={typeConfig.cost_per_interaction}
                    onChange={(e) => handleCostChange(type, e.target.value)}
                  />
                  <Suffix>USD</Suffix>
                </InputWrapper>
              </InputGroup>

              <InputGroup>
                <Label>📊 Porcentaje para Usuario</Label>
                <InputWrapper>
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={typeConfig.percentage}
                    onChange={(e) => handlePercentageChange(type, e.target.value)}
                  />
                  <Suffix>%</Suffix>
                </InputWrapper>
              </InputGroup>

              <EarningPreview>
                <PreviewLabel>💵 Usuario Gana por Interacción:</PreviewLabel>
                <PreviewValue>${calculateUserEarning(type)} USD</PreviewValue>
                <div style={{fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.9}}>
                  Admin recibe: ${(typeConfig.cost_per_interaction * (1 - typeConfig.percentage / 100)).toFixed(4)} USD
                </div>
              </EarningPreview>
            </ConfigCard>
          );
        })}
      </ConfigGrid>

      <ButtonGroup>
        <Button onClick={handleReset} disabled={!modified || saving}>
          Descartar Cambios
        </Button>
        <Button primary onClick={handleSave} disabled={!modified || saving}>
          <FiDollarSign />
          {saving ? '⏳ Guardando...' : '✅ Guardar Configuración'}
        </Button>
      </ButtonGroup>

      {modified && (
        <AlertBox style={{marginTop: '2rem', marginBottom: 0}}>
          <strong>⚠️ Cambios sin guardar</strong><br/>
          Tienes modificaciones pendientes. No olvides hacer clic en "Guardar Configuración" para aplicarlas.
        </AlertBox>
      )}
    </Container>
  );
}

export default EarningsConfigPanel;


