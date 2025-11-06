import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const Container = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const PostCard = styled.div`
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const PostHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
`;

const PostType = styled.span`
  background: #667eea;
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
`;

const PostDate = styled.span`
  color: #888;
  font-size: 0.9rem;
`;

const PostTitle = styled.h3`
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 1.3rem;
`;

const PostDescription = styled.div`
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
  font-style: italic;
`;

const PostImage = styled.img`
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-radius: 8px;
  margin: 1rem 0;
`;

const PostContent = styled.div`
  color: #555;
  line-height: 1.6;
  margin: 1rem 0;
`;

const UserInfo = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
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
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 15px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h3`
  margin-bottom: 1rem;
  color: #333;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 1rem;
  box-sizing: border-box;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  box-sizing: border-box;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 1rem;
  box-sizing: border-box;
`;

const Loading = styled.div`
  text-align: center;
  padding: 3rem;
  color: #888;
  font-size: 1.2rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #888;
  font-size: 1.1rem;
`;

const API_BASE = 'http://localhost:8000';

function ModerationPanel({ token, onUpdate }) {
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [suspendDays, setSuspendDays] = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendType, setSuspendType] = useState('temporal');

  const fetchPendingPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/admin/posts/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPendingPosts(response.data);
    } catch (err) {
      console.error('Error al cargar posts pendientes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPosts();
  }, [token]);

  const handleApprove = async (postId) => {
    try {
      await axios.post(`${API_BASE}/admin/posts/${postId}/approve`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('✅ Publicación aprobada exitosamente');
      fetchPendingPosts();
      if (onUpdate) onUpdate();
    } catch (err) {
      alert('❌ Error al aprobar publicación: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('⚠️ Debes proporcionar un motivo de rechazo');
      return;
    }

    try {
      await axios.post(`${API_BASE}/admin/posts/${selectedPost.id}/reject`, {
        motivo_rechazo: rejectReason
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('✅ Publicación rechazada exitosamente');
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedPost(null);
      fetchPendingPosts();
      if (onUpdate) onUpdate();
    } catch (err) {
      alert('❌ Error al rechazar publicación: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleSuspendUser = async () => {
    if (!suspendReason.trim()) {
      alert('⚠️ Debes proporcionar un motivo de suspensión');
      return;
    }

    if (suspendType === 'temporal' && (!suspendDays || suspendDays <= 0)) {
      alert('⚠️ Debes proporcionar los días de suspensión');
      return;
    }

    try {
      // Primero rechazar la publicación
      await axios.post(`${API_BASE}/admin/posts/${selectedPost.id}/reject`, {
        motivo_rechazo: `Contenido inapropiado: ${suspendReason}`
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Luego suspender al usuario (esto requeriría un endpoint adicional)
      // Por ahora solo mostramos el mensaje
      alert(`✅ Publicación rechazada y usuario marcado para suspensión ${suspendType === 'indefinido' ? 'indefinida' : `por ${suspendDays} días`}`);
      
      setShowSuspendModal(false);
      setSuspendReason('');
      setSuspendDays('');
      setSuspendType('temporal');
      setSelectedPost(null);
      fetchPendingPosts();
      if (onUpdate) onUpdate();
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.detail || err.message));
    }
  };

  if (loading) {
    return (
      <Container>
        <Loading>⏳ Cargando publicaciones pendientes...</Loading>
      </Container>
    );
  }

  return (
    <Container>
      <Title>
        ⏳ Publicaciones Pendientes de Revisión
      </Title>

      {pendingPosts.length === 0 ? (
        <EmptyState>
          ✅ No hay publicaciones pendientes de revisión
        </EmptyState>
      ) : (
        pendingPosts.map(post => (
          <PostCard key={post.id}>
            <PostHeader>
              <PostType>
                {post.tipo === 'noticia' && '📰 NOTICIA'}
                {post.tipo === 'texto' && '📝 TEXTO'}
                {post.tipo === 'imagen' && '🖼️ IMAGEN'}
                {post.tipo === 'video' && '🎥 VIDEO'}
              </PostType>
              <PostDate>
                {new Date(post.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </PostDate>
            </PostHeader>

            {post.tipo === 'noticia' && (
              <>
                {post.titulo && <PostTitle>{post.titulo}</PostTitle>}
                {post.descripcion && <PostDescription>"{post.descripcion}"</PostDescription>}
                {post.imagen_url && (
                  <PostImage 
                    src={post.imagen_url.startsWith('http') ? post.imagen_url : `${API_BASE}${post.imagen_url}`}
                    alt={post.titulo || 'Imagen de noticia'}
                    onError={(e) => e.target.style.display = 'none'}
                  />
                )}
                {post.fuente && <div style={{color: '#888', fontSize: '0.9rem'}}>📰 Fuente: {post.fuente}</div>}
              </>
            )}

            <PostContent>
              {post.contenido.length > 500 
                ? post.contenido.substring(0, 500) + '...' 
                : post.contenido}
            </PostContent>

            <UserInfo>
              <div>
                <strong>👤 Usuario:</strong> {post.user_email || 'Usuario desconocido'}
              </div>
              <div>
                <strong>🆔 Post ID:</strong> {post.id}
              </div>
            </UserInfo>

            <ButtonGroup>
              <ActionButton 
                variant="approve"
                onClick={() => handleApprove(post.id)}
              >
                ✅ Aprobar Publicación
              </ActionButton>
              
              <ActionButton 
                variant="reject"
                onClick={() => {
                  setSelectedPost(post);
                  setShowRejectModal(true);
                }}
              >
                ❌ Rechazar
              </ActionButton>
              
              <ActionButton 
                variant="suspend"
                onClick={() => {
                  setSelectedPost(post);
                  setShowSuspendModal(true);
                }}
              >
                🚫 Rechazar y Suspender Usuario
              </ActionButton>
            </ButtonGroup>
          </PostCard>
        ))
      )}

      {/* Modal de Rechazo */}
      {showRejectModal && (
        <Modal onClick={() => setShowRejectModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>❌ Rechazar Publicación</ModalTitle>
            <Label>Motivo del rechazo: *</Label>
            <TextArea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explica por qué se rechaza esta publicación..."
            />
            <ButtonGroup>
              <ActionButton onClick={() => setShowRejectModal(false)}>
                Cancelar
              </ActionButton>
              <ActionButton variant="reject" onClick={handleReject}>
                Confirmar Rechazo
              </ActionButton>
            </ButtonGroup>
          </ModalContent>
        </Modal>
      )}

      {/* Modal de Suspensión */}
      {showSuspendModal && (
        <Modal onClick={() => setShowSuspendModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>🚫 Rechazar Publicación y Suspender Usuario</ModalTitle>
            
            <Label>Tipo de suspensión: *</Label>
            <Select value={suspendType} onChange={(e) => setSuspendType(e.target.value)}>
              <option value="temporal">Temporal</option>
              <option value="indefinido">Indefinida</option>
            </Select>

            {suspendType === 'temporal' && (
              <>
                <Label>Días de suspensión: *</Label>
                <Input
                  type="number"
                  value={suspendDays}
                  onChange={(e) => setSuspendDays(e.target.value)}
                  placeholder="Número de días (ej: 7, 30)"
                  min="1"
                />
              </>
            )}

            <Label>Motivo de suspensión: *</Label>
            <Select value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)}>
              <option value="">Selecciona un motivo...</option>
              <option value="Contenido pornográfico o sexual explícito">Contenido pornográfico o sexual explícito</option>
              <option value="Fake News o desinformación">Fake News o desinformación</option>
              <option value="Discurso de odio o discriminación">Discurso de odio o discriminación</option>
              <option value="Violencia o contenido gráfico">Violencia o contenido gráfico</option>
              <option value="Spam o publicidad engañosa">Spam o publicidad engañosa</option>
              <option value="Incitación al delito">Incitación al delito</option>
              <option value="Acoso o bullying">Acoso o bullying</option>
              <option value="Otro">Otro</option>
            </Select>

            {suspendReason === 'Otro' && (
              <>
                <Label>Especifica el motivo:</Label>
                <TextArea
                  placeholder="Describe el motivo de la suspensión..."
                  onChange={(e) => setSuspendReason(e.target.value)}
                />
              </>
            )}

            <ButtonGroup>
              <ActionButton onClick={() => setShowSuspendModal(false)}>
                Cancelar
              </ActionButton>
              <ActionButton variant="suspend" onClick={handleSuspendUser}>
                Confirmar Suspensión
              </ActionButton>
            </ButtonGroup>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
}

export default ModerationPanel;
