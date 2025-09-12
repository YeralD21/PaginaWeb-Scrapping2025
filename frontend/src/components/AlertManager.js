import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { FiAlertTriangle, FiPlus, FiEdit2, FiTrash2, FiMail, FiGlobe, FiCheck, FiX } from 'react-icons/fi';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CreateButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    background: #c82333;
    transform: translateY(-2px);
  }
`;

const AlertsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const AlertCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => {
    switch(props.urgency) {
      case 'critica': return '#dc3545';
      case 'alta': return '#fd7e14';
      case 'media': return '#ffc107';
      case 'baja': return '#28a745';
      default: return '#6c757d';
    }
  }};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const AlertHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const AlertName = styled.h3`
  font-size: 1.2rem;
  color: #333;
  margin: 0;
`;

const UrgencyBadge = styled.span`
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  color: white;
  background: ${props => {
    switch(props.level) {
      case 'critica': return '#dc3545';
      case 'alta': return '#fd7e14';
      case 'media': return '#ffc107';
      case 'baja': return '#28a745';
      default: return '#6c757d';
    }
  }};
`;

const AlertDescription = styled.p`
  color: #666;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const KeywordsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Keyword = styled.span`
  background: #e9ecef;
  color: #495057;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const AlertMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.8rem;
  color: #666;
`;

const NotificationIcons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: ${props => props.active ? '#28a745' : '#dee2e6'};
`;

const AlertActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: ${props => props.danger ? '#dc3545' : '#6c757d'};
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.danger ? '#c82333' : '#5a6268'};
  }
`;

const StatusToggle = styled.button`
  background: ${props => props.active ? '#28a745' : '#dc3545'};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.8;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #dc3545;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #dc3545;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #dc3545;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.primary ? `
    background: #dc3545;
    color: white;
    &:hover { background: #c82333; }
  ` : `
    background: #6c757d;
    color: white;
    &:hover { background: #5a6268; }
  `}
`;

const AlertManager = () => {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    keywords: '',
    categorias: [],
    diarios: [],
    nivel_urgencia: 'media',
    notificar_email: false,
    email_destino: '',
    notificar_webhook: false,
    webhook_url: '',
    activa: true
  });

  const categoriasDisponibles = ['Deportes', 'Economía', 'Espectáculos', 'Mundo', 'Política'];
  const diariosDisponibles = ['El Comercio', 'Diario Correo', 'El Popular'];

  useEffect(() => {
    fetchAlertas();
  }, []);

  const fetchAlertas = async () => {
    try {
      const response = await axios.get('http://localhost:8000/alertas');
      setAlertas(response.data);
    } catch (error) {
      console.error('Error fetching alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = () => {
    setEditingAlert(null);
    setFormData({
      nombre: '',
      descripcion: '',
      keywords: '',
      categorias: [],
      diarios: [],
      nivel_urgencia: 'media',
      notificar_email: false,
      email_destino: '',
      notificar_webhook: false,
      webhook_url: '',
      activa: true
    });
    setShowModal(true);
  };

  const handleEditAlert = (alerta) => {
    setEditingAlert(alerta);
    setFormData({
      nombre: alerta.nombre,
      descripcion: alerta.descripcion || '',
      keywords: alerta.keywords.join(', '),
      categorias: alerta.categorias || [],
      diarios: alerta.diarios || [],
      nivel_urgencia: alerta.nivel_urgencia,
      notificar_email: alerta.notificar_email || false,
      email_destino: alerta.email_destino || '',
      notificar_webhook: alerta.notificar_webhook || false,
      webhook_url: alerta.webhook_url || '',
      activa: alerta.activa
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k)
    };

    try {
      if (editingAlert) {
        await axios.put(`http://localhost:8000/alertas/${editingAlert.id}`, submitData);
      } else {
        await axios.post('http://localhost:8000/alertas/crear', submitData);
      }
      
      setShowModal(false);
      fetchAlertas();
    } catch (error) {
      console.error('Error saving alerta:', error);
      alert('Error al guardar la alerta');
    }
  };

  const toggleAlertStatus = async (alertaId, currentStatus) => {
    try {
      await axios.put(`http://localhost:8000/alertas/${alertaId}`, {
        activa: !currentStatus
      });
      fetchAlertas();
    } catch (error) {
      console.error('Error toggling alert status:', error);
    }
  };

  const deleteAlert = async (alertaId) => {
    if (window.confirm('¿Estás seguro de que quieres desactivar esta alerta?')) {
      try {
        await axios.delete(`http://localhost:8000/alertas/${alertaId}`);
        fetchAlertas();
      } catch (error) {
        console.error('Error deleting alert:', error);
      }
    }
  };

  if (loading) {
    return <Container>Cargando alertas...</Container>;
  }

  return (
    <Container>
      <Header>
        <Title>
          <FiAlertTriangle />
          Gestión de Alertas
        </Title>
        <CreateButton onClick={handleCreateAlert}>
          <FiPlus />
          Nueva Alerta
        </CreateButton>
      </Header>

      <AlertsGrid>
        {alertas.map((alerta) => (
          <AlertCard key={alerta.id} urgency={alerta.nivel_urgencia}>
            <AlertHeader>
              <AlertName>{alerta.nombre}</AlertName>
              <UrgencyBadge level={alerta.nivel_urgencia}>
                {alerta.nivel_urgencia}
              </UrgencyBadge>
            </AlertHeader>

            <AlertDescription>{alerta.descripcion}</AlertDescription>

            <KeywordsList>
              {alerta.keywords.map((keyword, index) => (
                <Keyword key={index}>{keyword}</Keyword>
              ))}
            </KeywordsList>

            <AlertMeta>
              <div>
                Creada: {new Date(alerta.fecha_creacion).toLocaleDateString()}
              </div>
              <NotificationIcons>
                <IconBadge active={alerta.notificar_email}>
                  <FiMail size={14} />
                </IconBadge>
                <IconBadge active={alerta.notificar_webhook}>
                  <FiGlobe size={14} />
                </IconBadge>
              </NotificationIcons>
            </AlertMeta>

            <AlertActions>
              <StatusToggle 
                active={alerta.activa}
                onClick={() => toggleAlertStatus(alerta.id, alerta.activa)}
              >
                {alerta.activa ? <FiCheck /> : <FiX />}
                {alerta.activa ? 'Activa' : 'Inactiva'}
              </StatusToggle>
              
              <ActionButton onClick={() => handleEditAlert(alerta)}>
                <FiEdit2 size={14} />
              </ActionButton>
              
              <ActionButton danger onClick={() => deleteAlert(alerta.id)}>
                <FiTrash2 size={14} />
              </ActionButton>
            </AlertActions>
          </AlertCard>
        ))}
      </AlertsGrid>

      {showModal && (
        <Modal onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <ModalContent>
            <h2>{editingAlert ? 'Editar Alerta' : 'Nueva Alerta'}</h2>
            
            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Nombre de la Alerta</Label>
                <Input
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Descripción</Label>
                <TextArea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                />
              </FormGroup>

              <FormGroup>
                <Label>Palabras Clave (separadas por comas)</Label>
                <Input
                  value={formData.keywords}
                  onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                  placeholder="emergencia, crisis, urgente"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Nivel de Urgencia</Label>
                <Select
                  value={formData.nivel_urgencia}
                  onChange={(e) => setFormData({...formData, nivel_urgencia: e.target.value})}
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica</option>
                </Select>
              </FormGroup>

              <CheckboxGroup>
                <Checkbox
                  type="checkbox"
                  checked={formData.notificar_email}
                  onChange={(e) => setFormData({...formData, notificar_email: e.target.checked})}
                />
                <Label>Notificar por Email</Label>
              </CheckboxGroup>

              {formData.notificar_email && (
                <FormGroup>
                  <Label>Email de Destino</Label>
                  <Input
                    type="email"
                    value={formData.email_destino}
                    onChange={(e) => setFormData({...formData, email_destino: e.target.value})}
                  />
                </FormGroup>
              )}

              <ModalActions>
                <Button type="button" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" primary>
                  {editingAlert ? 'Actualizar' : 'Crear'} Alerta
                </Button>
              </ModalActions>
            </form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default AlertManager;
