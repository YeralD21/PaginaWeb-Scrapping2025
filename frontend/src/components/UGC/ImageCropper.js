import React, { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';

const CropperContainer = styled.div`
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
`;

const CropperModal = styled.div`
  background: white;
  border-radius: 10px;
  padding: 2rem;
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
`;

const CropperTitle = styled.h3`
  color: #333;
  margin-bottom: 1rem;
  text-align: center;
`;

const ImageContainer = styled.div`
  position: relative;
  display: inline-block;
  border: 2px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
`;

const CropperImage = styled.img`
  display: block;
  max-width: 100%;
  max-height: 400px;
  cursor: crosshair;
`;

const CropOverlay = styled.div`
  position: absolute;
  border: 2px solid #667eea;
  background: rgba(102, 126, 234, 0.2);
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
    border: 2px solid #667eea;
    border-radius: 4px;
  }
`;

const CropHandles = styled.div`
  position: absolute;
  width: 10px;
  height: 10px;
  background: #667eea;
  border: 2px solid white;
  border-radius: 50%;
  cursor: ${props => props.cursor};
  
  &.nw { top: -5px; left: -5px; cursor: nw-resize; }
  &.ne { top: -5px; right: -5px; cursor: ne-resize; }
  &.sw { bottom: -5px; left: -5px; cursor: sw-resize; }
  &.se { bottom: -5px; right: -5px; cursor: se-resize; }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.primary {
    background: #667eea;
    color: white;
    
    &:hover {
      background: #5a6fd8;
    }
  }
  
  &.secondary {
    background: #6c757d;
    color: white;
    
    &:hover {
      background: #5a6268;
    }
  }
`;

const Instructions = styled.div`
  background: #e3f2fd;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #1976d2;
`;

function ImageCropper({ imageSrc, onCrop, onCancel, aspectRatio = 16/9 }) {
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 200, height: 200 / aspectRatio });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const handleImageLoad = useCallback((e) => {
    const img = e.target;
    const containerWidth = Math.min(600, window.innerWidth - 100);
    const containerHeight = Math.min(400, window.innerHeight - 200);
    
    let displayWidth = img.naturalWidth;
    let displayHeight = img.naturalHeight;
    
    // Ajustar tamaño para que quepa en el contenedor
    if (displayWidth > containerWidth) {
      displayHeight = (displayHeight * containerWidth) / displayWidth;
      displayWidth = containerWidth;
    }
    
    if (displayHeight > containerHeight) {
      displayWidth = (displayWidth * containerHeight) / displayHeight;
      displayHeight = containerHeight;
    }
    
    setImageSize({ width: displayWidth, height: displayHeight });
    
    // Centrar el crop inicial
    const cropWidth = Math.min(200, displayWidth * 0.8);
    const cropHeight = cropWidth / aspectRatio;
    const cropX = (displayWidth - cropWidth) / 2;
    const cropY = (displayHeight - cropHeight) / 2;
    
    setCrop({
      x: cropX,
      y: cropY,
      width: cropWidth,
      height: cropHeight
    });
  }, [aspectRatio]);

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
    
    // Limitar el crop dentro de la imagen
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
          newCrop.width = Math.max(50, startCrop.width + deltaX);
          newCrop.height = newCrop.width / aspectRatio;
          break;
        case 'sw':
          newCrop.width = Math.max(50, startCrop.width - deltaX);
          newCrop.height = newCrop.width / aspectRatio;
          newCrop.x = startCrop.x + (startCrop.width - newCrop.width);
          break;
        case 'ne':
          newCrop.width = Math.max(50, startCrop.width + deltaX);
          newCrop.height = newCrop.width / aspectRatio;
          newCrop.y = startCrop.y + (startCrop.height - newCrop.height);
          break;
        case 'nw':
          newCrop.width = Math.max(50, startCrop.width - deltaX);
          newCrop.height = newCrop.width / aspectRatio;
          newCrop.x = startCrop.x + (startCrop.width - newCrop.width);
          newCrop.y = startCrop.y + (startCrop.height - newCrop.height);
          break;
      }
      
      // Limitar dentro de la imagen
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

  const handleCrop = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    // Calcular las coordenadas reales en la imagen original
    const scaleX = img.naturalWidth / imageSize.width;
    const scaleY = img.naturalHeight / imageSize.height;
    
    const sourceX = crop.x * scaleX;
    const sourceY = crop.y * scaleY;
    const sourceWidth = crop.width * scaleX;
    const sourceHeight = crop.height * scaleY;
    
    canvas.width = 800; // Tamaño fijo para la imagen recortada
    canvas.height = 800 / aspectRatio;
    
    ctx.drawImage(
      img,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, canvas.width, canvas.height
    );
    
    canvas.toBlob((blob) => {
      const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
      onCrop(file);
    }, 'image/jpeg', 0.9);
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
    <CropperContainer>
      <CropperModal>
        <CropperTitle>✂️ Recortar Imagen</CropperTitle>
        
        <Instructions>
          📋 <strong>Instrucciones:</strong><br/>
          • Arrastra el recuadro azul para mover el área de recorte<br/>
          • Usa las esquinas para redimensionar manteniendo la proporción<br/>
          • El área azul será la parte visible de tu imagen
        </Instructions>
        
        <ImageContainer ref={containerRef}>
          <CropperImage
            ref={imageRef}
            src={imageSrc}
            alt="Imagen a recortar"
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
        
        <ButtonGroup>
          <Button className="secondary" onClick={onCancel}>
            ❌ Cancelar
          </Button>
          <Button className="primary" onClick={handleCrop}>
            ✂️ Recortar y Usar
          </Button>
        </ButtonGroup>
      </CropperModal>
    </CropperContainer>
  );
}

export default ImageCropper;
