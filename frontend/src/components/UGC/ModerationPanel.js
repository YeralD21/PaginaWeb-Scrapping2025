import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
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
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const PostCard = styled.div`
  background: rgba(26, 31, 58, 0.6);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
`;

const PostHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(102, 126, 234, 0.2);
`;

const PostType = styled.span`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
`;

const PostDate = styled.span`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
`;

const PostTitle = styled.h3`
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 0.5rem;
  font-size: 1.3rem;
`;

const PostDescription = styled.div`
  color: rgba(255, 255, 255, 0.7);
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
  display: block;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(102, 126, 234, 0.2);
`;

const PostContent = styled.div`
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin: 1rem 0;
`;

const UserInfo = styled.div`
  background: rgba(26, 31, 58, 0.4);
  backdrop-filter: blur(10px);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid rgba(102, 126, 234, 0.2);
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

  // Debug: Log posts cuando cambian
  useEffect(() => {
    if (pendingPosts.length > 0) {
      console.log('📋 Posts pendientes cargados:', pendingPosts);
      pendingPosts.forEach((post, index) => {
        console.log(`Post ${index + 1}:`, {
          id: post.id,
          tipo: post.tipo,
          titulo: post.titulo,
          imagen_url: post.imagen_url,
          tiene_imagen: !!post.imagen_url
        });
      });
    }
  }, [pendingPosts]);

  const handleApprove = async (postId) => {
    try {
      await axios.post(`${API_BASE}/admin/posts/${postId}/approve`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      Swal.fire({
        title: '✅ Noticia aceptada correctamente',
        text: 'La publicación ha sido aprobada y ahora es visible en la sección de comunidad',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#51cf66',
        timer: 3000,
        timerProgressBar: true
      });
      
      fetchPendingPosts();
      if (onUpdate) onUpdate();
    } catch (err) {
      Swal.fire({
        title: '❌ Error',
        text: 'Error al aprobar publicación: ' + (err.response?.data?.detail || err.message),
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#ff6b6b'
      });
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      Swal.fire({
        title: '⚠️ Motivo requerido',
        text: 'Debes proporcionar un motivo de rechazo',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#ffa94d'
      });
      return;
    }

    try {
      await axios.post(`${API_BASE}/admin/posts/${selectedPost.id}/reject`, {
        motivo_rechazo: rejectReason
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      Swal.fire({
        title: '❌ Noticia rechazada',
        text: 'La publicación ha sido rechazada y no será visible en la sección de comunidad',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#ff6b6b',
        timer: 3000,
        timerProgressBar: true
      });
      
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedPost(null);
      fetchPendingPosts();
      if (onUpdate) onUpdate();
    } catch (err) {
      Swal.fire({
        title: '❌ Error',
        text: 'Error al rechazar publicación: ' + (err.response?.data?.detail || err.message),
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#ff6b6b'
      });
    }
  };

  const handleSuspendUser = async () => {
    if (!suspendReason.trim()) {
      Swal.fire({
        title: '⚠️ Motivo requerido',
        text: 'Debes proporcionar un motivo de suspensión',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#ffa94d'
      });
      return;
    }

    if (suspendType === 'temporal' && (!suspendDays || suspendDays <= 0)) {
      Swal.fire({
        title: '⚠️ Días requeridos',
        text: 'Debes proporcionar los días de suspensión',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#ffa94d'
      });
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
      const suspensionText = suspendType === 'indefinido' 
        ? 'indefinida' 
        : `por ${suspendDays} día${suspendDays > 1 ? 's' : ''}`;
      
      Swal.fire({
        title: '🚫 Noticia rechazada y usuario suspendido',
        html: `
          <div style="text-align: left; margin-top: 1rem;">
            <p><strong>Publicación:</strong> Rechazada</p>
            <p><strong>Usuario:</strong> Suspendido ${suspensionText}</p>
            <p><strong>Motivo:</strong> ${suspendReason}</p>
          </div>
        `,
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#ffa94d',
        timer: 4000,
        timerProgressBar: true
      });
      
      setShowSuspendModal(false);
      setSuspendReason('');
      setSuspendDays('');
      setSuspendType('temporal');
      setSelectedPost(null);
      fetchPendingPosts();
      if (onUpdate) onUpdate();
    } catch (err) {
      Swal.fire({
        title: '❌ Error',
        text: 'Error al procesar la acción: ' + (err.response?.data?.detail || err.message),
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#ff6b6b'
      });
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
        pendingPosts.map(post => {
          // Debug: Log de datos del post
          console.log('📋 Post en ModerationPanel:', {
            id: post.id,
            tipo: post.tipo,
            titulo: post.titulo,
            imagen_url: post.imagen_url,
            tiene_imagen_url: !!post.imagen_url
          });
          
          return (
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

            {/* Título y descripción para noticias */}
            {post.tipo === 'noticia' && (
              <>
                {post.titulo && <PostTitle>{post.titulo}</PostTitle>}
                {post.descripcion && <PostDescription>"{post.descripcion}"</PostDescription>}
                {post.fuente && <div style={{color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', marginBottom: '1rem'}}>📰 Fuente: {post.fuente}</div>}
              </>
            )}

            {/* Mostrar imagen si existe (para cualquier tipo) */}
            {post.imagen_url && (
              <PostImage 
                src={(() => {
                  // Construir URL correctamente
                  const imgUrl = (post.imagen_url || '').trim();
                  console.log('🔍 Construyendo URL para imagen en ModerationPanel:', {
                    imagen_url_original: imgUrl,
                    post_id: post.id,
                    post_tipo: post.tipo
                  });
                  
                  if (!imgUrl) {
                    console.warn('⚠️ imagen_url está vacía o es null');
                    return '';
                  }
                  
                  // Normalizar la URL
                  let finalUrl = '';
                  if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
                    finalUrl = imgUrl;
                    console.log('✅ URL absoluta detectada:', finalUrl);
                  } else if (imgUrl.startsWith('/uploads/')) {
                    // Si ya tiene /uploads/, solo agregar API_BASE
                    finalUrl = `${API_BASE}${imgUrl}`;
                    console.log('✅ URL construida (con /uploads/):', finalUrl);
                  } else if (imgUrl.startsWith('/')) {
                    finalUrl = `${API_BASE}${imgUrl}`;
                    console.log('✅ URL construida (con /):', finalUrl);
                  } else {
                    // Si no tiene /, asumir que es /uploads/images/{filename}
                    finalUrl = `${API_BASE}/uploads/images/${imgUrl}`;
                    console.log('✅ URL construida (sin /, asumiendo uploads/images/):', finalUrl);
                  }
                  
                  return finalUrl;
                })()}
                alt={post.titulo || post.descripcion || 'Imagen de publicación'}
                onError={(e) => {
                  const originalSrc = e.target.src;
                  const imgUrl = (post.imagen_url || '').trim();
                  
                  console.error('❌ Error cargando imagen en ModerationPanel:', {
                    imagen_url_original: imgUrl,
                    url_construida: originalSrc,
                    post_id: post.id,
                    post_tipo: post.tipo,
                    error: e.target.error
                  });
                  
                  // Intentar diferentes formatos de URL antes de mostrar placeholder
                  const retryAttempt = parseInt(e.target.dataset.retryAttempt || '0');
                  
                  if (retryAttempt < 3) {
                    e.target.dataset.retryAttempt = String(retryAttempt + 1);
                    
                    // Intentar con diferentes formatos
                    let retryUrl = '';
                    if (retryAttempt === 0) {
                      // Primer intento: URL completa con API_BASE
                      if (imgUrl.startsWith('/uploads/')) {
                        retryUrl = `${API_BASE}${imgUrl}`;
                      } else if (imgUrl.startsWith('/')) {
                        retryUrl = `${API_BASE}${imgUrl}`;
                      } else {
                        retryUrl = `${API_BASE}/uploads/images/${imgUrl}`;
                      }
                    } else if (retryAttempt === 1) {
                      // Segundo intento: solo la ruta relativa
                      retryUrl = imgUrl.startsWith('/') ? imgUrl : `/uploads/images/${imgUrl}`;
                    } else {
                      // Tercer intento: URL absoluta con protocolo
                      retryUrl = `http://localhost:8000${imgUrl.startsWith('/') ? imgUrl : `/uploads/images/${imgUrl}`}`;
                    }
                    
                    if (retryUrl !== originalSrc) {
                      console.log(`🔄 Reintento ${retryAttempt + 1}/3 con URL alternativa:`, retryUrl);
                      setTimeout(() => {
                        e.target.src = retryUrl;
                      }, 500 * (retryAttempt + 1)); // Esperar un poco más en cada reintento
                      return;
                    }
                  }
                  
                  // Si ya intentamos 3 veces y falló, mostrar placeholder
                  console.warn('⚠️ No se pudo cargar la imagen después de 3 reintentos');
                  e.target.style.display = 'block';
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImagen no disponible%3C/text%3E%3C/svg%3E';
                }}
                onLoad={(e) => {
                  console.log('✅ Imagen cargada exitosamente en ModerationPanel:', {
                    imagen_url: post.imagen_url,
                    url_final: e.target.src,
                    post_id: post.id,
                    width: e.target.naturalWidth,
                    height: e.target.naturalHeight
                  });
                  // Limpiar el flag de reintento si la imagen carga exitosamente
                  if (e.target.dataset.retryAttempt) {
                    delete e.target.dataset.retryAttempt;
                  }
                }}
              />
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
          );
        })
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
