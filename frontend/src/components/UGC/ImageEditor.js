import React, { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';

const EditorContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const EditorModal = styled.div`
  background: white;
  border-radius: 15px;
  padding: 2rem;
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const EditorTitle = styled.h3`
  color: #333;
  margin-bottom: 1rem;
  text-align: center;
  font-size: 1.5rem;
`;

const SizeInfo = styled.div`
  background: #e3f2fd;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border-left: 4px solid #2196f3;
  font-size: 0.9rem;
  color: #1976d2;
`;

const ImageContainer = styled.div`
  position: relative;
  display: inline-block;
  border: 2px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
  background: #f5f5f5;
`;

const EditorImage = styled.img`
  display: block;
  max-width: 100%;
  max-height: 500px;
  cursor: crosshair;
`;

const CropOverlay = styled.div`
  position: absolute;
  border: 2px solid #4caf50;
  background: rgba(76, 175, 80, 0.2);
  cursor: move;
  top: ${props => props.top}px;
  left: ${props => props.left}px;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border: 2px solid #4caf50;
    border-radius: 4px;
  }
`;

const CropHandles = styled.div`
  position: absolute;
  width: 12px;
  height: 12px;
  background: #4caf50;
  border: 2px solid white;
  border-radius: 50%;
  cursor: ${props => props.cursor};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  
  &.nw { top: -6px; left: -6px; cursor: nw-resize; }
  &.ne { top: -6px; right: -6px; cursor: ne-resize; }
  &.sw { bottom: -6px; left: -6px; cursor: sw-resize; }
  &.se { bottom: -6px; right: -6px; cursor: se-resize; }
`;

const WarningBox = styled.div`
  background: ${props => props.type === 'warning' ? '#fff3cd' : props.type === 'error' ? '#f8d7da' : '#d4edda'};
  color: ${props => props.type === 'warning' ? '#856404' : props.type === 'error' ? '#721c24' : '#155724'};
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border-left: 4px solid ${props => props.type === 'warning' ? '#ffc107' : props.type === 'error' ? '#dc3545' : '#28a745'};
  font-size: 0.9rem;
`;

const ImageInfo = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #666;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
  
  &.primary {
    background: #4caf50;
    color: white;
    
    &:hover {
      background: #45a049;
      transform: translateY(-1px);
    }
  }
  
  &.secondary {
    background: #6c757d;
    color: white;
    
    &:hover {
      background: #5a6268;
    }
  }
  
  &.warning {
    background: #ffc107;
    color: #000;
    
    &:hover {
      background: #e0a800;
    }
  }
  
  &:disabled {
    background: #e9ecef;
    color: #6c757d;
    cursor: not-allowed;
    transform: none;
  }
`;

const PreviewContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const PreviewBox = styled.div`
  text-align: center;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background: white;
`;

const PreviewImage = styled.img`
  max-width: 200px;
  max-height: 120px;
  border-radius: 4px;
  margin-bottom: 0.5rem;
`;

const PreviewLabel = styled.div`
  font-size: 0.8rem;
  color: #666;
  font-weight: 600;
`;

const CropControls = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const ControlButton = styled.button`
  padding: 0.5rem 1rem;
  border: 2px solid #4caf50;
  background: white;
  color: #4caf50;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #4caf50;
    color: white;
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const CropInfo = styled.div`
  background: #f8f9fa;
  padding: 0.8rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #666;
  text-align: center;
  border: 1px solid #e9ecef;
`;

// Tamaño estándar para publicaciones
const STANDARD_SIZE = { width: 1200, height: 628 };
const ASPECT_RATIO = STANDARD_SIZE.width / STANDARD_SIZE.height;

function ImageEditor({ imageSrc, onSave, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 200, height: 200 / ASPECT_RATIO });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [originalImageSize, setOriginalImageSize] = useState({ width: 0, height: 0 });
  const [warnings, setWarnings] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const handleImageLoad = useCallback((e) => {
    const img = e.target;
    const containerWidth = Math.min(800, window.innerWidth - 100);
    const containerHeight = Math.min(500, window.innerHeight - 200);
    
    // Tamaño original de la imagen
    setOriginalImageSize({ width: img.naturalWidth, height: img.naturalHeight });
    
    // Calcular tamaño de visualización
    let displayWidth = img.naturalWidth;
    let displayHeight = img.naturalHeight;
    
    if (displayWidth > containerWidth) {
      displayHeight = (displayHeight * containerWidth) / displayWidth;
      displayWidth = containerWidth;
    }
    
    if (displayHeight > containerHeight) {
      displayWidth = (displayWidth * containerHeight) / displayHeight;
      displayHeight = containerHeight;
    }
    
    setImageSize({ width: displayWidth, height: displayHeight });
    
    // Analizar la imagen y generar advertencias
    analyzeImage(img.naturalWidth, img.naturalHeight);
    
    // Centrar el crop inicial con un tamaño más grande
    const cropWidth = Math.min(displayWidth * 0.9, displayWidth - 20);
    const cropHeight = cropWidth / ASPECT_RATIO;
    
    // Asegurar que el crop no sea más grande que la imagen
    const finalCropWidth = Math.min(cropWidth, displayWidth);
    const finalCropHeight = Math.min(cropHeight, displayHeight);
    
    const cropX = Math.max(0, (displayWidth - finalCropWidth) / 2);
    const cropY = Math.max(0, (displayHeight - finalCropHeight) / 2);
    
    setCrop({
      x: cropX,
      y: cropY,
      width: finalCropWidth,
      height: finalCropHeight
    });
  }, []);

  const analyzeImage = (width, height) => {
    const newWarnings = [];
    
    // Verificar si la imagen es más pequeña que el tamaño estándar
    if (width < STANDARD_SIZE.width || height < STANDARD_SIZE.height) {
      newWarnings.push({
        type: 'warning',
        message: `La imagen es más pequeña que el tamaño recomendado (${width}x${height} vs ${STANDARD_SIZE.width}x${STANDARD_SIZE.height}). Al ampliarla puede perder calidad.`
      });
    }
    
    // Verificar si la imagen es mucho más grande
    if (width > STANDARD_SIZE.width * 2 || height > STANDARD_SIZE.height * 2) {
      newWarnings.push({
        type: 'info',
        message: `La imagen será redimensionada automáticamente para ajustarse al tamaño estándar (${STANDARD_SIZE.width}x${STANDARD_SIZE.height}).`
      });
    }
    
    // Verificar proporción
    const imageAspectRatio = width / height;
    const standardAspectRatio = ASPECT_RATIO;
    const aspectRatioDiff = Math.abs(imageAspectRatio - standardAspectRatio);
    
    if (aspectRatioDiff > 0.1) {
      newWarnings.push({
        type: 'warning',
        message: `La proporción de la imagen (${imageAspectRatio.toFixed(2)}) no coincide con la recomendada (${standardAspectRatio.toFixed(2)}). Se ajustará automáticamente.`
      });
    }
    
    setWarnings(newWarnings);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - crop.x,
      y: e.clientY - crop.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    const maxX = imageSize.width - crop.width;
    const maxY = imageSize.height - crop.height;
    
    setCrop(prev => ({
      ...prev,
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResize = (direction, e) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startCrop = { ...crop };
    
    const handleMouseMove = (e) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      let newCrop = { ...startCrop };
      
      switch (direction) {
        case 'se':
          newCrop.width = Math.max(100, startCrop.width + deltaX);
          newCrop.height = newCrop.width / ASPECT_RATIO;
          break;
        case 'sw':
          newCrop.width = Math.max(100, startCrop.width - deltaX);
          newCrop.height = newCrop.width / ASPECT_RATIO;
          newCrop.x = startCrop.x + (startCrop.width - newCrop.width);
          break;
        case 'ne':
          newCrop.width = Math.max(100, startCrop.width + deltaX);
          newCrop.height = newCrop.width / ASPECT_RATIO;
          newCrop.y = startCrop.y + (startCrop.height - newCrop.height);
          break;
        case 'nw':
          newCrop.width = Math.max(100, startCrop.width - deltaX);
          newCrop.height = newCrop.width / ASPECT_RATIO;
          newCrop.x = startCrop.x + (startCrop.width - newCrop.width);
          newCrop.y = startCrop.y + (startCrop.height - newCrop.height);
          break;
      }
      
      newCrop.x = Math.max(0, Math.min(newCrop.x, imageSize.width - newCrop.width));
      newCrop.y = Math.max(0, Math.min(newCrop.y, imageSize.height - newCrop.height));
      
      setCrop(newCrop);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const adjustCropSize = (percentage) => {
    const newWidth = imageSize.width * (percentage / 100);
    const newHeight = newWidth / ASPECT_RATIO;
    
    // Centrar el nuevo crop
    const newX = Math.max(0, (imageSize.width - newWidth) / 2);
    const newY = Math.max(0, (imageSize.height - newHeight) / 2);
    
    setCrop({
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight
    });
  };

  const fitToImage = () => {
    // Ajustar el crop para que use toda la imagen disponible
    const maxWidth = imageSize.width;
    const maxHeight = imageSize.height;
    
    let cropWidth, cropHeight;
    
    if (maxWidth / maxHeight > ASPECT_RATIO) {
      // La imagen es más ancha que la proporción deseada
      cropHeight = maxHeight;
      cropWidth = cropHeight * ASPECT_RATIO;
    } else {
      // La imagen es más alta que la proporción deseada
      cropWidth = maxWidth;
      cropHeight = cropWidth / ASPECT_RATIO;
    }
    
    const cropX = (maxWidth - cropWidth) / 2;
    const cropY = (maxHeight - cropHeight) / 2;
    
    setCrop({
      x: cropX,
      y: cropY,
      width: cropWidth,
      height: cropHeight
    });
  };

  const handleSave = async () => {
    setIsProcessing(true);
    
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = imageRef.current;
      
      // Establecer el tamaño final estándar
      canvas.width = STANDARD_SIZE.width;
      canvas.height = STANDARD_SIZE.height;
      
      // Calcular las coordenadas reales en la imagen original
      const scaleX = img.naturalWidth / imageSize.width;
      const scaleY = img.naturalHeight / imageSize.height;
      
      const sourceX = crop.x * scaleX;
      const sourceY = crop.y * scaleY;
      const sourceWidth = crop.width * scaleX;
      const sourceHeight = crop.height * scaleY;
      
      // Dibujar la imagen recortada y redimensionada
      ctx.drawImage(
        img,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, STANDARD_SIZE.width, STANDARD_SIZE.height
      );
      
      // Convertir a blob
      canvas.toBlob((blob) => {
        const file = new File([blob], 'optimized-image.jpg', { type: 'image/jpeg' });
        onSave(file);
        setIsProcessing(false);
      }, 'image/jpeg', 0.9);
      
    } catch (error) {
      console.error('Error procesando imagen:', error);
      setIsProcessing(false);
    }
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, imageSize, crop]);

  return (
    <EditorContainer>
      <EditorModal>
        <EditorTitle>🖼️ Editor de Imagen</EditorTitle>
        
        <SizeInfo>
          📐 <strong>Tamaño recomendado:</strong> {STANDARD_SIZE.width}x{STANDARD_SIZE.height} píxeles<br/>
          📏 <strong>Proporción:</strong> {ASPECT_RATIO.toFixed(2)}:1 (ideal para noticias)<br/>
          💡 <strong>Tip:</strong> Usa los botones de abajo para ajustar el tamaño rápidamente
        </SizeInfo>
        
        {warnings.map((warning, index) => (
          <WarningBox key={index} type={warning.type}>
            {warning.type === 'warning' ? '⚠️' : warning.type === 'error' ? '❌' : 'ℹ️'} {warning.message}
          </WarningBox>
        ))}
        
        <ImageInfo>
          📊 <strong>Imagen original:</strong> {originalImageSize.width}x{originalImageSize.height} píxeles<br/>
          🎯 <strong>Tamaño final:</strong> {STANDARD_SIZE.width}x{STANDARD_SIZE.height} píxeles
        </ImageInfo>
        
        <CropInfo>
          📐 <strong>Área de recorte actual:</strong> {Math.round(crop.width)}x{Math.round(crop.height)} píxeles 
          ({Math.round((crop.width / imageSize.width) * 100)}% de la imagen)
        </CropInfo>
        
        <CropControls>
          <ControlButton onClick={() => adjustCropSize(50)}>
            📏 50%
          </ControlButton>
          <ControlButton onClick={() => adjustCropSize(75)}>
            📏 75%
          </ControlButton>
          <ControlButton onClick={() => adjustCropSize(90)}>
            📏 90%
          </ControlButton>
          <ControlButton onClick={fitToImage}>
            🎯 Ajustar a Imagen
          </ControlButton>
        </CropControls>
        
        <ImageContainer ref={containerRef}>
          <EditorImage
            ref={imageRef}
            src={imageSrc}
            alt="Imagen a editar"
            onLoad={handleImageLoad}
            draggable={false}
          />
          
          {imageSize.width > 0 && (
            <>
              <CropOverlay
                top={crop.y}
                left={crop.x}
                width={crop.width}
                height={crop.height}
                onMouseDown={handleMouseDown}
              />
              
              <CropHandles className="nw" onMouseDown={(e) => handleResize('nw', e)} />
              <CropHandles className="ne" onMouseDown={(e) => handleResize('ne', e)} />
              <CropHandles className="sw" onMouseDown={(e) => handleResize('sw', e)} />
              <CropHandles className="se" onMouseDown={(e) => handleResize('se', e)} />
            </>
          )}
        </ImageContainer>
        
        <PreviewContainer>
          <PreviewBox>
            <PreviewImage src={imageSrc} alt="Original" />
            <PreviewLabel>Original</PreviewLabel>
          </PreviewBox>
          <PreviewBox>
            <div style={{ 
              width: '200px', 
              height: '120px', 
              background: '#f0f0f0', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderRadius: '4px',
              marginBottom: '0.5rem'
            }}>
              📐 {STANDARD_SIZE.width}x{STANDARD_SIZE.height}
            </div>
            <PreviewLabel>Resultado Final</PreviewLabel>
          </PreviewBox>
        </PreviewContainer>
        
        <ButtonGroup>
          <Button className="secondary" onClick={onCancel} disabled={isProcessing}>
            ❌ Cancelar
          </Button>
          <Button className="primary" onClick={handleSave} disabled={isProcessing}>
            {isProcessing ? '⏳ Procesando...' : '✅ Guardar Imagen'}
          </Button>
        </ButtonGroup>
      </EditorModal>
    </EditorContainer>
  );
}

export default ImageEditor;
