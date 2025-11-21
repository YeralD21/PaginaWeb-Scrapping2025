import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

const AdContainer = styled.div`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  position: relative;
  width: 100%;
  min-height: ${props => props.height || '600px'};
  height: ${props => props.height || '600px'};
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  box-sizing: border-box;
  overflow: hidden;
  
  body[data-theme="dark"] & {
    background: #1a1a1a;
    border-color: #333;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const AdLabel = styled.div`
  font-size: 0.7rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
  font-weight: 600;
  
  body[data-theme="dark"] & {
    color: #666;
  }
`;

const AdContent = styled.div`
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  min-height: calc(${props => props.height || '600px'} - 3rem);
  
  body[data-theme="dark"] & {
    background: linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%);
  }
`;

const AdPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
  color: #999;
  
  body[data-theme="dark"] & {
    color: #666;
  }
`;

const AdIcon = styled.div`
  font-size: 3rem;
  opacity: 0.3;
  margin-bottom: 0.5rem;
`;

const AdText = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const AdSubtext = styled.div`
  font-size: 0.75rem;
  opacity: 0.7;
`;

const AdSenseLogo = styled.div`
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  font-size: 0.65rem;
  color: #4285f4;
  font-weight: 700;
  letter-spacing: 0.5px;
  opacity: 0.6;
  
  body[data-theme="dark"] & {
    color: #5a9df4;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(1.05);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const AdSlider = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  min-height: 100%;
`;

const AdSlide = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  opacity: ${props => props.active ? 1 : 0};
  transition: opacity 0.8s ease-in-out;
  animation: ${props => props.active ? fadeIn : 'none'} 0.8s ease-in-out;
  z-index: ${props => props.active ? 2 : 1};
  pointer-events: ${props => props.active ? 'auto' : 'none'};
  cursor: ${props => props.active ? 'pointer' : 'default'};
`;

const AdBanner = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: ${props => props.imageUrl 
    ? `url(${props.imageUrl})` 
    : 'repeating-linear-gradient(45deg, #f0f0f0, #f0f0f0 10px, #ffffff 10px, #ffffff 20px)'};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.02);
  }
  
  body[data-theme="dark"] & {
    background: ${props => props.imageUrl 
      ? `url(${props.imageUrl})` 
      : 'repeating-linear-gradient(45deg, #2a2a2a, #2a2a2a 10px, #1f1f1f 10px, #1f1f1f 20px)'};
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.imageUrl 
      ? 'linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.1) 50%, rgba(0, 0, 0, 0.5) 100%)'
      : 'linear-gradient(135deg, rgba(66, 133, 244, 0.05) 0%, rgba(52, 168, 83, 0.05) 50%, rgba(251, 188, 4, 0.05) 100%)'};
    z-index: 1;
  }
`;

const AdImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
`;

const AdContentInner = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  width: 100%;
  height: 100%;
  justify-content: flex-end;
`;

const AdTitle = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${props => props.hasImage ? '#fff' : '#333'};
  text-align: center;
  max-width: 90%;
  text-shadow: ${props => props.hasImage ? '2px 2px 4px rgba(0, 0, 0, 0.7)' : 'none'};
  
  body[data-theme="dark"] & {
    color: ${props => props.hasImage ? '#fff' : '#ccc'};
  }
`;

const AdDescription = styled.div`
  font-size: 0.85rem;
  color: ${props => props.hasImage ? 'rgba(255, 255, 255, 0.95)' : '#666'};
  text-align: center;
  max-width: 85%;
  line-height: 1.5;
  text-shadow: ${props => props.hasImage ? '1px 1px 3px rgba(0, 0, 0, 0.7)' : 'none'};
  
  body[data-theme="dark"] & {
    color: ${props => props.hasImage ? 'rgba(255, 255, 255, 0.95)' : '#999'};
  }
`;

const AdButton = styled.div`
  background: #4285f4;
  color: white;
  padding: 0.6rem 1.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  
  &:hover {
    background: #357ae8;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(66, 133, 244, 0.5);
  }
`;

function AdSense({ variant = 'vertical', height, width }) {
  const navigate = useNavigate();
  
  // Solo los 3 anuncios con imágenes para el slider
  const adVariants = [
    {
      icon: '🛒',
      title: 'Compra inteligente',
      description: 'Compara precios y ahorra en tus compras online',
      button: 'Explorar',
      image: '/images/compra_inteligente.jpeg',
      adId: 'compra-inteligente'
    },
    {
      icon: '💼',
      title: 'Oportunidades de negocio',
      description: 'Invierte en tu futuro con nuestras soluciones',
      button: 'Saber Más',
      image: '/images/negocio_anuncio.jpeg',
      adId: 'oportunidades-negocio'
    },
    {
      icon: '✈️',
      title: 'Viaja por el mundo',
      description: 'Ofertas de viaje y paquetes turísticos exclusivos',
      button: 'Reservar',
      image: '/images/anuncio_vuelos.png',
      adId: 'viaja-mundo'
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Cambiar automáticamente el anuncio con tiempo aleatorio entre 2-5 segundos
  useEffect(() => {
    let timeoutId;

    const scheduleNextChange = () => {
      // Tiempo aleatorio entre 2-5 segundos
      const nextTime = Math.floor(Math.random() * 3000) + 2000; // 2000-5000ms
      timeoutId = setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % adVariants.length);
        scheduleNextChange(); // Programar el siguiente cambio
      }, nextTime);
    };

    // Iniciar el primer cambio
    scheduleNextChange();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [adVariants.length]);

  return (
    <AdContainer height={height} width={width}>
      <AdLabel>Publicidad</AdLabel>
      <AdContent height={height}>
        <AdSlider>
          {adVariants.map((ad, index) => {
            const isActive = index === currentIndex;
            return (
              <AdSlide 
                key={index} 
                active={isActive}
                onClick={() => isActive && navigate(`/anuncio/${ad.adId}`)}
              >
                <AdBanner imageUrl={ad.image}>
                  <AdImage 
                    src={ad.image} 
                    alt={ad.title}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <AdContentInner>
                    <AdTitle hasImage={true}>{ad.title}</AdTitle>
                    <AdDescription hasImage={true}>{ad.description}</AdDescription>
                    <AdButton onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/anuncio/${ad.adId}`);
                    }}>
                      {ad.button}
                    </AdButton>
                  </AdContentInner>
                </AdBanner>
              </AdSlide>
            );
          })}
        </AdSlider>
        <AdSenseLogo>AdSense</AdSenseLogo>
      </AdContent>
    </AdContainer>
  );
}

export default AdSense;

