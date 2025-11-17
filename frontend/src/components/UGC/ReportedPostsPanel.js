import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const Container = styled.div`
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(102, 126, 234, 0.2);
`;

const Title = styled.h2`
  color: #ff6b6b;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const PostCard = styled.div`
  background: rgba(26, 31, 58, 0.6);
  backdrop-filter: blur(10px);
  border: 2px solid ${props => props.alert ? 'rgba(255, 107, 107, 0.5)' : 'rgba(102, 126, 234, 0.3)'};
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  ${props => props.alert && `
    background: linear-gradient(to right, rgba(255, 107, 107, 0.1) 0%, rgba(26, 31, 58, 0.6) 100%);
  `}
`;

const PostHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(102, 126, 234, 0.2);
`;

const AlertBadge = styled.span`
  background: linear-gradient(135deg, #dc3545 0%, #ff6b6b 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 700;
  animation: pulse 2s infinite;

  @keyframes pulse {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7);
    }
    50% {
      box-shadow: 0 0 0 10px rgba(220, 53, 69, 0);
    }
  }
`;

const PostType = styled.span`
  background: #667eea;
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
`;

const PostImage = styled.img`
  width: 150px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 1rem;
`;

const PostContent = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const PostInfo = styled.div`
  flex: 1;
`;

const PostTitle = styled.h3`
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
`;

const PostText = styled.p`
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const UserInfo = styled.div`
  background: rgba(26, 31, 58, 0.4);
  backdrop-filter: blur(10px);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  border: 1px solid rgba(102, 126, 234, 0.2);
`;

const ReportsSection = styled.div`
  background: rgba(255, 212, 59, 0.15);
  border: 2px solid rgba(255, 212, 59, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
`;

const ReportItem = styled.div`
  padding: 0.8rem;
  background: rgba(26, 31, 58, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 6px;
  margin-bottom: 0.5rem;
  border-left: 3px solid #ff6b6b;
  color: rgba(255, 255, 255, 0.9);

  &:last-child {
    margin-bottom: 0;
  }
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
      case 'delete':
        return `
          background: linear-gradient(135deg, #dc3545 0%, #ff6b6b 100%);
          color: white;
          &:hover { transform: scale(1.05); box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3); }
        `;
      case 'ignore':
        return `
          background: linear-gradient(135deg, #28a745 0%, #51cf66 100%);
          color: white;
          &:hover { transform: scale(1.05); box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3); }
        `;
      default:
        return `
          background: #6c757d;
          color: white;
          &:hover { background: #5a6268; }
        `;
    }
  }}
`;

const Loading = styled.div`
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.2rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  background: rgba(26, 31, 58, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.2);
`;

const Modal = styled.div`
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
`;

const ModalContent = styled.div`
  background: rgba(30, 41, 59, 0.95);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 15px;
  max-width: 500px;
  width: 90%;
  border: 1px solid rgba(102, 126, 234, 0.3);
`;

const ModalTitle = styled.h3`
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.95);
`;

const API_BASE = 'http://localhost:8000';

const TIPO_EMOJIS = {
  noticia: '📰',
  texto: '📝',
  imagen: '🖼️',
  video: '🎥',
  comentario: '💬',
  resena: '⭐',
  post: '📄'
};

function ReportedPostsPanel({ token, onUpdate }) {
  const [reportedPosts, setReportedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showThresholdModal, setShowThresholdModal] = useState(false);
  const [currentThreshold, setCurrentThreshold] = useState(10);
  const [newThreshold, setNewThreshold] = useState(10);
  const [loadingThreshold, setLoadingThreshold] = useState(false);

  useEffect(() => {
    fetchReportedPosts();
    fetchCurrentThreshold();
  }, [token]);

  const fetchCurrentThreshold = async () => {
    try {
      const response = await axios.get(`${API_BASE}/admin/settings/report-threshold`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setCurrentThreshold(response.data.threshold);
      setNewThreshold(response.data.threshold);
    } catch (err) {
      console.error('Error al obtener umbral:', err);
    }
  };

  const fetchReportedPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/admin/posts/reported`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setReportedPosts(response.data);
    } catch (err) {
      console.error('Error al cargar posts reportados:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAndBan = async (post) => {
    setSelectedPost(post);
    setSelectedAction('delete');
    setShowConfirmModal(true);
  };

  const handleIgnoreReports = async (post) => {
    setSelectedPost(post);
    setSelectedAction('ignore');
    setShowConfirmModal(true);
  };

  const handleUpdateThreshold = async () => {
    if (newThreshold < 1 || newThreshold > 1000) {
      alert('⚠️ El umbral debe estar entre 1 y 1000');
      return;
    }

    setLoadingThreshold(true);
    try {
      await axios.post(
        `${API_BASE}/admin/settings/report-threshold`,
        { threshold: parseInt(newThreshold) },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setCurrentThreshold(newThreshold);
      setShowThresholdModal(false);
      alert(`✅ Umbral actualizado a ${newThreshold} reportes`);
      fetchReportedPosts();
      if (onUpdate) onUpdate();
    } catch (err) {
      alert('❌ Error al actualizar umbral: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoadingThreshold(false);
    }
  };

  const confirmAction = async () => {
    try {
      if (selectedAction === 'delete') {
        await axios.post(
          `${API_BASE}/admin/posts/${selectedPost.id}/confirm-fake`,
          {},
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        alert('✅ Publicación eliminada y usuario suspendido');
      } else if (selectedAction === 'ignore') {
        await axios.post(
          `${API_BASE}/admin/posts/${selectedPost.id}/dismiss-reports`,
          {},
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        alert('✅ Reportes descartados y publicación restaurada');
      }
      
      setShowConfirmModal(false);
      setSelectedPost(null);
      setSelectedAction(null);
      fetchReportedPosts();
      if (onUpdate) onUpdate();
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.detail || err.message));
    }
  };

  if (loading) {
    return (
      <Container>
        <Loading>⏳ Cargando publicaciones reportadas...</Loading>
      </Container>
    );
  }

  return (
    <Container>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
        <Title style={{margin: 0}}>
          🚨 Publicaciones ALERT¡ - Requieren Verificación
        </Title>
        <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '0.8rem 1.5rem',
            borderRadius: '12px',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            📊 Umbral Actual: <strong>{currentThreshold}</strong> reportes
          </div>
          <ActionButton 
            onClick={() => setShowThresholdModal(true)}
            style={{
              background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
              color: 'white'
            }}
          >
            ⚙️ Configurar Umbral
          </ActionButton>
        </div>
      </div>

      {reportedPosts.length === 0 ? (
        <EmptyState>
          ✅ No hay publicaciones reportadas pendientes de revisión
        </EmptyState>
      ) : (
        reportedPosts.map(post => (
          <PostCard key={post.id} alert>
            <PostHeader>
              <AlertBadge>
                🚨 ALERTA - {post.total_reportes} REPORTES
              </AlertBadge>
              <PostType>
                {TIPO_EMOJIS[post.tipo] || '📄'} {post.tipo?.toUpperCase()}
              </PostType>
            </PostHeader>

            <PostContent>
              {post.imagen_url && (
                <PostImage 
                  src={post.imagen_url.startsWith('http') ? post.imagen_url : `${API_BASE}${post.imagen_url}`}
                  alt="Imagen de publicación"
                  onError={(e) => e.target.style.display = 'none'}
                />
              )}
              <PostInfo>
                <PostTitle>{post.titulo || 'Sin título'}</PostTitle>
                <PostText>{post.contenido}</PostText>
              </PostInfo>
            </PostContent>

            <UserInfo>
              <strong>👤 Autor:</strong> {post.user_email} (ID: {post.user_id})<br/>
              <strong>📅 Publicado:</strong> {new Date(post.created_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </UserInfo>

            <ReportsSection>
              <strong>📋 Reportes Recibidos ({post.total_reportes}):</strong>
              {post.reportes.map((reporte, index) => (
                <ReportItem key={reporte.id}>
                  <div style={{marginBottom: '0.5rem'}}>
                    <strong>🚩 Motivo:</strong> {reporte.motivo}
                  </div>
                  <div style={{marginBottom: '0.5rem'}}>
                    <strong>💬 Comentario:</strong> {reporte.comentario}
                  </div>
                  <div style={{fontSize: '0.85rem', color: '#666'}}>
                    <strong>👤 Reportado por:</strong> {reporte.reporter_email} • {' '}
                    {new Date(reporte.created_at).toLocaleDateString('es-ES')}
                  </div>
                </ReportItem>
              ))}
            </ReportsSection>

            <ButtonGroup>
              <ActionButton 
                variant="delete"
                onClick={() => handleDeleteAndBan(post)}
              >
                🗑️ Eliminar Publicación y Banear Usuario
              </ActionButton>
              <ActionButton 
                variant="ignore"
                onClick={() => handleIgnoreReports(post)}
              >
                ✅ Ignorar Reportes (Contenido Válido)
              </ActionButton>
            </ButtonGroup>
          </PostCard>
        ))
      )}

      {/* Modal de Confirmación */}
      {showConfirmModal && selectedPost && (
        <Modal onClick={() => setShowConfirmModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>
              {selectedAction === 'delete' ? '🗑️ Confirmar Eliminación y Baneo' : '✅ Confirmar Ignorar Reportes'}
            </ModalTitle>
            
            {selectedAction === 'delete' ? (
              <div>
                <p>¿Estás seguro de que deseas:</p>
                <ul style={{marginLeft: '1.5rem', lineHeight: '1.8'}}>
                  <li>Marcar la publicación como FAKE</li>
                  <li>Eliminarla de la comunidad</li>
                  <li>Suspender indefinidamente al usuario <strong>{selectedPost.user_email}</strong></li>
                </ul>
                <p style={{color: '#dc3545', fontWeight: 'bold'}}>
                  ⚠️ Esta acción es permanente y no se puede deshacer.
                </p>
              </div>
            ) : (
              <div>
                <p>¿Estás seguro de que deseas:</p>
                <ul style={{marginLeft: '1.5rem', lineHeight: '1.8'}}>
                  <li>Descartar todos los reportes ({selectedPost.total_reportes})</li>
                  <li>Restaurar la publicación como PUBLICADA</li>
                  <li>Mantener al usuario activo</li>
                </ul>
                <p style={{color: '#28a745', fontWeight: 'bold'}}>
                  ✅ La publicación volverá a ser visible en la comunidad.
                </p>
              </div>
            )}

            <ButtonGroup>
              <ActionButton onClick={() => setShowConfirmModal(false)}>
                Cancelar
              </ActionButton>
              <ActionButton 
                variant={selectedAction === 'delete' ? 'delete' : 'ignore'}
                onClick={confirmAction}
              >
                {selectedAction === 'delete' ? '🗑️ Confirmar Eliminación' : '✅ Confirmar Ignorar'}
              </ActionButton>
            </ButtonGroup>
          </ModalContent>
        </Modal>
      )}

      {/* Modal de Configuración de Umbral */}
      {showThresholdModal && (
        <Modal onClick={() => setShowThresholdModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>
              ⚙️ Configurar Umbral de Reportes
            </ModalTitle>
            
            <div style={{marginBottom: '1.5rem'}}>
              <p style={{lineHeight: '1.8', color: '#555'}}>
                El umbral determina cuántos reportes debe recibir una publicación antes de ser marcada como 
                <strong style={{color: '#dc3545'}}> ALERTA</strong> y aparecer en este panel para revisión.
              </p>
            </div>

            <div style={{
              background: '#e7f3ff',
              border: '2px solid #2196f3',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{marginBottom: '1rem'}}>
                <strong style={{color: '#1976d2', fontSize: '1.1rem'}}>
                  📊 Umbral Actual: {currentThreshold} reportes
                </strong>
              </div>
              
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#333'
              }}>
                Nuevo Umbral: *
              </label>
              
              <input
                type="number"
                min="1"
                max="1000"
                value={newThreshold}
                onChange={(e) => setNewThreshold(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '2px solid #2196f3',
                  borderRadius: '8px',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  boxSizing: 'border-box'
                }}
              />
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '1rem',
                gap: '0.5rem'
              }}>
                <button
                  onClick={() => setNewThreshold(2)}
                  style={{
                    flex: 1,
                    padding: '0.6rem',
                    background: newThreshold == 2 ? '#2196f3' : 'white',
                    color: newThreshold == 2 ? 'white' : '#2196f3',
                    border: '2px solid #2196f3',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                  }}
                >
                  2 reportes
                </button>
                <button
                  onClick={() => setNewThreshold(10)}
                  style={{
                    flex: 1,
                    padding: '0.6rem',
                    background: newThreshold == 10 ? '#2196f3' : 'white',
                    color: newThreshold == 10 ? 'white' : '#2196f3',
                    border: '2px solid #2196f3',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                  }}
                >
                  10 reportes
                </button>
                <button
                  onClick={() => setNewThreshold(50)}
                  style={{
                    flex: 1,
                    padding: '0.6rem',
                    background: newThreshold == 50 ? '#2196f3' : 'white',
                    color: newThreshold == 50 ? 'white' : '#2196f3',
                    border: '2px solid #2196f3',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                  }}
                >
                  50 reportes
                </button>
                <button
                  onClick={() => setNewThreshold(100)}
                  style={{
                    flex: 1,
                    padding: '0.6rem',
                    background: newThreshold == 100 ? '#2196f3' : 'white',
                    color: newThreshold == 100 ? 'white' : '#2196f3',
                    border: '2px solid #2196f3',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                  }}
                >
                  100 reportes
                </button>
              </div>
            </div>

            <div style={{
              background: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
              color: '#856404'
            }}>
              <strong>⚠️ Recomendaciones:</strong>
              <ul style={{margin: '0.5rem 0 0 0', paddingLeft: '1.5rem', lineHeight: '1.8'}}>
                <li><strong>2-5 reportes:</strong> Moderación muy estricta (más trabajo para el admin)</li>
                <li><strong>10-20 reportes:</strong> Balance recomendado (moderación efectiva)</li>
                <li><strong>50-100 reportes:</strong> Moderación relajada (solo casos extremos)</li>
              </ul>
            </div>

            <ButtonGroup>
              <ActionButton onClick={() => setShowThresholdModal(false)}>
                Cancelar
              </ActionButton>
              <ActionButton 
                onClick={handleUpdateThreshold}
                disabled={loadingThreshold || newThreshold < 1 || newThreshold > 1000}
                style={{
                  background: loadingThreshold || newThreshold < 1 || newThreshold > 1000
                    ? '#ccc'
                    : 'linear-gradient(135deg, #28a745 0%, #51cf66 100%)',
                  cursor: loadingThreshold || newThreshold < 1 || newThreshold > 1000
                    ? 'not-allowed'
                    : 'pointer'
                }}
              >
                {loadingThreshold ? '⏳ Guardando...' : '✅ Guardar Umbral'}
              </ActionButton>
            </ButtonGroup>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
}

export default ReportedPostsPanel;
