import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import ImageEditor from './ImageEditor';

const Container = styled.div`
  background: transparent;
  padding: 0;
  border-radius: 0;
  box-shadow: none;
  margin-bottom: 0;
`;

const Title = styled.h2`
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
`;

const Select = styled.select`
  padding: 0.8rem;
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  background: rgba(26, 31, 58, 0.6);
  color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);

  &:focus {
    outline: none;
    border-color: #667eea;
  }

  option {
    background: #1a1f3a;
    color: rgba(255, 255, 255, 0.9);
  }
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 8px;
  font-size: 1rem;
  background: rgba(26, 31, 58, 0.6);
  color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);

  &:focus {
    outline: none;
    border-color: #667eea;
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const FileInput = styled.input`
  padding: 0.8rem;
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 8px;
  font-size: 1rem;
  background: rgba(26, 31, 58, 0.6);
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  backdrop-filter: blur(10px);

  &:focus {
    outline: none;
    border-color: #667eea;
  }

  &::file-selector-button {
    background: #667eea;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    margin-right: 1rem;
    cursor: pointer;
    font-size: 0.9rem;
  }

  &::file-selector-button:hover {
    background: #5a6fd8;
  }
`;

const ImagePreview = styled.div`
  margin-top: 1rem;
  text-align: center;
`;

const PreviewImage = styled.img`
  max-width: 200px;
  max-height: 150px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const UploadStatus = styled.div`
  margin-top: 0.5rem;
  padding: 0.5rem;
  border-radius: 5px;
  font-size: 0.9rem;
  background: ${props => props.success ? 'rgba(40, 167, 69, 0.2)' : props.error ? 'rgba(220, 53, 69, 0.2)' : 'rgba(102, 126, 234, 0.2)'};
  color: ${props => props.success ? '#51cf66' : props.error ? '#ff6b6b' : 'rgba(255, 255, 255, 0.9)'};
  border: 1px solid ${props => props.success ? 'rgba(40, 167, 69, 0.3)' : props.error ? 'rgba(220, 53, 69, 0.3)' : 'rgba(102, 126, 234, 0.3)'};
`;

const PreviewSection = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(26, 31, 58, 0.6);
  border-radius: 10px;
  border: 2px solid rgba(102, 126, 234, 0.3);
  backdrop-filter: blur(10px);
`;

const PreviewTitle = styled.h3`
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const NewsPreview = styled.div`
  background: rgba(26, 31, 58, 0.8);
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  margin: 0 auto;
  border: 1px solid rgba(102, 126, 234, 0.2);
`;

const NewsHeader = styled.div`
  margin-bottom: 1rem;
`;

const NewsTitle = styled.h2`
  color: rgba(255, 255, 255, 0.95);
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  line-height: 1.3;
`;

const NewsMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
`;

const NewsImage = styled.img`
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const NewsDescription = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  font-style: italic;
  background: rgba(102, 126, 234, 0.1);
  padding: 1rem;
  border-radius: 5px;
  border-left: 4px solid #667eea;
`;

const NewsContent = styled.div`
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  font-size: 1rem;
`;

const NewsFooter = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(102, 126, 234, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
`;

const TogglePreviewButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;

  &:hover {
    background: #218838;
    transform: translateY(-1px);
  }

  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
`;

const ProgressIndicator = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  border-left: 4px solid #667eea;
  border: 1px solid rgba(102, 126, 234, 0.2);
`;

const ProgressTitle = styled.h4`
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const ProgressList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ProgressItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.3rem;
  font-size: 0.85rem;
  color: ${props => props.completed ? '#51cf66' : 'rgba(255, 255, 255, 0.7)'};
`;

const TextArea = styled.textarea`
  padding: 1rem;
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 8px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
  background: rgba(26, 31, 58, 0.6);
  color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);

  &:focus {
    outline: none;
    border-color: #667eea;
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const Button = styled.button`
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Message = styled.div`
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  background: ${props => props.success ? 'rgba(40, 167, 69, 0.2)' : 'rgba(220, 53, 69, 0.2)'};
  color: ${props => props.success ? '#51cf66' : '#ff6b6b'};
  border: 1px solid ${props => props.success ? 'rgba(40, 167, 69, 0.3)' : 'rgba(220, 53, 69, 0.3)'};
`;

const InfoBox = styled.div`
  background: rgba(102, 126, 234, 0.15);
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #667eea;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(102, 126, 234, 0.2);
`;

const API_BASE = 'http://localhost:8000';

const TIPOS_CONTENIDO = [
  { value: 'texto', label: '📝 Texto', placeholder: 'Escribe tu contenido aquí...' },
  { value: 'noticia', label: '📰 Noticia', placeholder: 'Contenido completo de la noticia...' },
  { value: 'imagen', label: '🖼️ Imagen', placeholder: 'URL de la imagen (ej: https://...)' },
  { value: 'video', label: '🎥 Video', placeholder: 'URL del video (ej: https://youtube.com/...)' },
  { value: 'comentario', label: '💬 Comentario', placeholder: 'Tu comentario...' },
  { value: 'resena', label: '⭐ Reseña', placeholder: 'Escribe tu reseña...' },
  { value: 'post', label: '📄 Post', placeholder: 'Contenido del post...' },
];

function CreatePost({ token, onPostCreated }) {
  const [tipo, setTipo] = useState('texto');
  const [contenido, setContenido] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [fuente, setFuente] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Estados para subida de imagen
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Estado para vista previa
  const [showPreview, setShowPreview] = useState(false);
  
  // Estados para editor de imagen
  const [showEditor, setShowEditor] = useState(false);
  const [imageToEdit, setImageToEdit] = useState(null);

  const tipoSeleccionado = TIPOS_CONTENIDO.find(t => t.value === tipo);
  const esNoticia = tipo === 'noticia';

  // Verificar si se puede mostrar la vista previa
  const canShowPreview = esNoticia && titulo.trim() && descripcion.trim() && contenido.trim() && imagePreview;

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  const handleEditComplete = (editedFile) => {
    console.log('Imagen editada recibida:', editedFile);
    setShowEditor(false);
    setImageToEdit(null);
    
    // Crear preview de la imagen editada
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log('Preview de imagen creado:', e.target.result.substring(0, 50) + '...');
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(editedFile);
    
    // Subir la imagen editada
    uploadImage(editedFile);
  };

  const handleEditCancel = () => {
    setShowEditor(false);
    setImageToEdit(null);
    setSelectedFile(null);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Crear preview de la imagen para el editor
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageToEdit(e.target.result);
        setShowEditor(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file) => {
    setUploadingImage(true);
    setUploadStatus({ type: 'uploading', message: 'Subiendo imagen...' });
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(
        `${API_BASE}/ugc/upload-image`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data.success) {
        console.log('Imagen subida exitosamente:', response.data.image_url);
        setImagenUrl(response.data.image_url);
        setUploadStatus({ 
          type: 'success', 
          message: `✅ Imagen subida exitosamente (${(response.data.size / 1024).toFixed(1)} KB)` 
        });
      }
    } catch (error) {
      setUploadStatus({ 
        type: 'error', 
        message: `❌ Error: ${error.response?.data?.detail || 'Error al subir imagen'}` 
      });
      setSelectedFile(null);
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const payload = {
        tipo,
        contenido
      };

      // Agregar campos adicionales si es noticia
      if (esNoticia) {
        payload.titulo = titulo;
        payload.descripcion = descripcion;
        payload.imagen_url = imagenUrl;
        payload.fuente = fuente;
      }

      const response = await axios.post(
        `${API_BASE}/ugc/create`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setMessage({ success: true, text: '¡Publicación creada exitosamente! Será revisada por un administrador.' });
      setContenido('');
      setTitulo('');
      setDescripcion('');
      setImagenUrl('');
      setFuente('');
      setSelectedFile(null);
      setImagePreview(null);
      setUploadStatus(null);
      setShowPreview(false);
      setShowEditor(false);
      setImageToEdit(null);
      
      if (onPostCreated) {
        onPostCreated();
      }

    } catch (err) {
      setMessage({ 
        success: false, 
        text: err.response?.data?.detail || 'Error al crear publicación' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>✨ Crear Nueva Publicación</Title>
      
      {message && (
        <Message success={message.success}>
          {message.text}
        </Message>
      )}

      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <Label>Tipo de Contenido</Label>
          <Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            {TIPOS_CONTENIDO.map(tipo => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </Select>
        </InputGroup>

        {esNoticia && (
          <>
            <InputGroup>
              <Label>Título de la Noticia *</Label>
              <Input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Escribe un título llamativo..."
                required
              />
            </InputGroup>

            <InputGroup>
              <Label>Descripción Breve *</Label>
              <TextArea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Resumen breve de la noticia (máx. 200 caracteres)..."
                required
                style={{ minHeight: '80px' }}
                maxLength={200}
              />
              <small style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem' }}>
                {descripcion.length}/200 caracteres
              </small>
            </InputGroup>

            <InputGroup>
              <Label>Imagen de la Noticia</Label>
              <div style={{ 
                background: 'rgba(102, 126, 234, 0.15)', 
                padding: '0.8rem', 
                borderRadius: '8px', 
                marginBottom: '0.5rem',
                fontSize: '0.9rem',
                color: 'rgba(255, 255, 255, 0.9)',
                borderLeft: '4px solid #667eea',
                border: '1px solid rgba(102, 126, 234, 0.2)'
              }}>
                📐 <strong>Tamaño recomendado:</strong> 1200x628 píxeles<br/>
                📏 <strong>Proporción:</strong> 1.91:1 (ideal para noticias)
              </div>
              <FileInput
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploadingImage}
              />
              {uploadStatus && (
                <UploadStatus 
                  success={uploadStatus.type === 'success'} 
                  error={uploadStatus.type === 'error'}
                >
                  {uploadStatus.message}
                </UploadStatus>
              )}
              {imagePreview && (
                <ImagePreview>
                  <PreviewImage src={imagePreview} alt="Vista previa" />
                  <Button 
                    type="button"
                    onClick={() => {
                      setImageToEdit(imagePreview);
                      setShowEditor(true);
                    }}
                    style={{ 
                      marginTop: '0.5rem', 
                      background: '#4caf50', 
                      color: '#fff',
                      fontSize: '0.9rem',
                      padding: '0.5rem 1rem'
                    }}
                  >
                    🖼️ Editar Imagen
                  </Button>
                </ImagePreview>
              )}
            </InputGroup>

            <InputGroup>
              <Label>Fuente</Label>
              <Input
                type="text"
                value={fuente}
                onChange={(e) => setFuente(e.target.value)}
                placeholder="Nombre de la fuente o medio (opcional)"
              />
            </InputGroup>
          </>
        )}

        <InputGroup>
          <Label>{esNoticia ? 'Contenido Completo de la Noticia *' : 'Contenido'}</Label>
          <TextArea
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            placeholder={tipoSeleccionado?.placeholder}
            required
            style={{ minHeight: esNoticia ? '200px' : '120px' }}
          />
        </InputGroup>

            <Button type="submit" disabled={loading}>
              {loading ? 'Publicando...' : '🚀 Publicar'}
            </Button>
          </Form>

          {/* Indicador de Progreso para Noticias */}
          {esNoticia && !canShowPreview && (
            <ProgressIndicator>
              <ProgressTitle>📋 Progreso para Vista Previa</ProgressTitle>
              <ProgressList>
                <ProgressItem completed={!!titulo.trim()}>
                  {titulo.trim() ? '✅' : '⏳'} Título de la Noticia
                </ProgressItem>
                <ProgressItem completed={!!descripcion.trim()}>
                  {descripcion.trim() ? '✅' : '⏳'} Descripción Breve
                </ProgressItem>
                <ProgressItem completed={!!contenido.trim()}>
                  {contenido.trim() ? '✅' : '⏳'} Contenido Completo
                </ProgressItem>
                <ProgressItem completed={!!imagePreview}>
                  {imagePreview ? '✅' : '⏳'} Imagen de la Noticia
                </ProgressItem>
              </ProgressList>
            </ProgressIndicator>
          )}

          {/* Botón de Vista Previa para Noticias */}
          {esNoticia && (
            <TogglePreviewButton
              type="button"
              onClick={togglePreview}
              disabled={!canShowPreview}
            >
              {showPreview ? '👁️ Ocultar Vista Previa' : '👁️ Ver Vista Previa'}
              {!canShowPreview && ' (Completa todos los campos)'}
            </TogglePreviewButton>
          )}

          {/* Vista Previa de la Noticia */}
          {esNoticia && showPreview && canShowPreview && (
            <PreviewSection>
              <PreviewTitle>
                📰 Vista Previa de tu Noticia
              </PreviewTitle>
              <NewsPreview>
                {/* Debug info - remover en producción */}
                <div style={{
                  background: 'rgba(255, 193, 7, 0.15)',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  marginBottom: '1rem',
                  fontSize: '0.8rem',
                  color: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid rgba(255, 193, 7, 0.2)'
                }}>
                  🔍 Debug: imagePreview={imagePreview ? 'Sí' : 'No'} (usando preview para vista previa)
                </div>
                
                <NewsHeader>
                  <NewsTitle>{titulo}</NewsTitle>
                  <NewsMeta>
                    <span>📅 {new Date().toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                    {fuente && <span>📰 Fuente: {fuente}</span>}
                    <span>👤 Por: Usuario</span>
                  </NewsMeta>
                </NewsHeader>
                
                {imagePreview ? (
                  <NewsImage 
                    src={imagePreview} 
                    alt={titulo}
                    onLoad={() => {
                      console.log('✅ Imagen cargada exitosamente desde preview');
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '200px',
                    background: 'rgba(26, 31, 58, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    border: '2px dashed rgba(102, 126, 234, 0.3)',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '1rem'
                  }}>
                    🖼️ No hay imagen seleccionada
                  </div>
                )}
                
                <NewsDescription>
                  {descripcion}
                </NewsDescription>
                
                <NewsContent>
                  {contenido.split('\n').map((paragraph, index) => (
                    paragraph.trim() && (
                      <p key={index} style={{ marginBottom: '1rem' }}>
                        {paragraph}
                      </p>
                    )
                  ))}
                </NewsContent>
                
                <NewsFooter>
                  <span>📊 Estado: Pendiente de revisión</span>
                  <span>💰 Ganancias: $0.00</span>
                </NewsFooter>
              </NewsPreview>
            </PreviewSection>
          )}

      <InfoBox>
        💰 <strong>¡Gana dinero con tus publicaciones!</strong><br/>
        • Cada interacción (view/click) genera $0.01 USD<br/>
        • Recibes el 30% de cada interacción<br/>
        • El admin recibe el 70%<br/>
        • Consulta tus ganancias en "Mis Publicaciones"
      </InfoBox>

      {/* Modal de Editor de Imagen */}
      {showEditor && imageToEdit && (
        <ImageEditor
          imageSrc={imageToEdit}
          onSave={handleEditComplete}
          onCancel={handleEditCancel}
        />
      )}
    </Container>
  );
}

export default CreatePost;

