import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { FiArrowLeft, FiStar, FiCheck, FiShare2, FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiDollarSign, FiCalendar, FiMapPin, FiUsers, FiAward, FiTrendingUp } from 'react-icons/fi';

// Animaciones
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

// Contenedor principal con fondo de imagen difuminado
const Container = styled.div`
  min-height: 100vh;
  padding: 2rem 0;
  position: relative;
  overflow: hidden;
  background: ${props => props.bgImage 
    ? `url(${props.bgImage})` 
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  
  &::before {
    content: '';
    position: fixed;
    top: -10%;
    left: -10%;
    width: 120%;
    height: 120%;
    background: ${props => props.bgImage 
      ? `url(${props.bgImage})` 
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
    background-size: cover;
    background-position: center;
    filter: blur(30px) brightness(0.6) saturate(1.2);
    transform: scale(1.1);
    z-index: 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(102, 126, 234, 0.5) 0%,
      rgba(118, 75, 162, 0.5) 50%,
      rgba(102, 126, 234, 0.5) 100%
    );
    z-index: 1;
  }
`;

const Header = styled.header`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  padding: 1.5rem 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateX(-5px);
  }
`;

const MainContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 3rem 2rem;
  position: relative;
  z-index: 2;
`;

// Hero Section
const HeroSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 4rem;
  margin-bottom: 3rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: ${fadeInUp} 0.8s ease-out;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    padding: 2rem;
  }
`;

const HeroImage = styled.div`
  width: 100%;
  height: 500px;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
    
    &:hover {
      transform: scale(1.1);
    }
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
  }
`;

const HeroContent = styled.div`
  animation: ${slideIn} 0.8s ease-out 0.2s both;
`;

const Badge = styled.span`
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 25px;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  color: #2d3748;
  margin: 0 0 1.5rem 0;
  line-height: 1.2;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.3rem;
  color: #4a5568;
  line-height: 1.8;
  margin-bottom: 2rem;
  font-weight: 500;
`;

const PriceSection = styled.div`
  display: flex;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Price = styled.div`
  font-size: 3rem;
  font-weight: 800;
  color: #667eea;
  
  span {
    font-size: 1.5rem;
    color: #718096;
    text-decoration: line-through;
    margin-left: 1rem;
  }
`;

const CTAButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1.2rem 3rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: ${pulse} 2s ease-in-out infinite;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(102, 126, 234, 0.6);
  }
`;

// Features Section
const FeaturesSection = styled.section`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 4rem;
  margin-bottom: 3rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: ${fadeInUp} 0.8s ease-out 0.4s both;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  color: #2d3748;
  margin: 0 0 3rem 0;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const FeatureCard = styled.div`
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 16px;
  padding: 2rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    border-color: rgba(102, 126, 234, 0.5);
  }
`;

const FeatureIcon = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: white;
  font-size: 1.5rem;
`;

const FeatureTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 1rem 0;
`;

const FeatureText = styled.p`
  font-size: 1rem;
  color: #4a5568;
  line-height: 1.7;
  margin: 0;
`;

// Social Media Section
const SocialSection = styled.section`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 4rem;
  margin-bottom: 3rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: ${fadeInUp} 0.8s ease-out 0.6s both;
  text-align: center;
`;

const SocialLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-top: 2rem;
`;

const SocialButton = styled.a`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  transition: all 0.3s ease;
  text-decoration: none;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  
  &:hover {
    transform: translateY(-5px) scale(1.1);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
  }
  
  &.facebook {
    background: linear-gradient(135deg, #1877f2 0%, #0d47a1 100%);
  }
  
  &.twitter {
    background: linear-gradient(135deg, #1da1f2 0%, #0d47a1 100%);
  }
  
  &.instagram {
    background: linear-gradient(135deg, #e4405f 0%, #c13584 100%);
  }
  
  &.linkedin {
    background: linear-gradient(135deg, #0077b5 0%, #004182 100%);
  }
`;

// Testimonials Section
const TestimonialsSection = styled.section`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 4rem;
  margin-bottom: 3rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: ${fadeInUp} 0.8s ease-out 0.8s both;
`;

const TestimonialsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const TestimonialCard = styled.div`
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-left: 4px solid #667eea;
  border-radius: 12px;
  padding: 2rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateX(5px);
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2);
  }
`;

const TestimonialText = styled.p`
  font-size: 1.1rem;
  color: #4a5568;
  line-height: 1.8;
  font-style: italic;
  margin: 0 0 1.5rem 0;
`;

const TestimonialAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const AuthorAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.2rem;
`;

const AuthorInfo = styled.div`
  flex: 1;
`;

const AuthorName = styled.div`
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.25rem;
`;

const AuthorRole = styled.div`
  font-size: 0.9rem;
  color: #718096;
`;

// Data de los anuncios
const adData = {
  'compra-inteligente': {
    id: 'compra-inteligente',
    title: 'Compra Inteligente',
    subtitle: 'La plataforma definitiva para comparar precios y ahorrar en todas tus compras online',
    image: '/images/compra_inteligente.jpeg',
    badge: '🛒 Mejor Precio Garantizado',
    price: '$29.99',
    originalPrice: '$49.99',
    ctaText: 'Comenzar Ahora',
    features: [
      {
        icon: <FiTrendingUp />,
        title: 'Comparación en Tiempo Real',
        text: 'Compara precios de millones de productos en más de 500 tiendas online en tiempo real.'
      },
      {
        icon: <FiDollarSign />,
        title: 'Ahorra hasta 70%',
        text: 'Encuentra los mejores descuentos y ofertas exclusivas. Ahorra miles de dólares al año.'
      },
      {
        icon: <FiCheck />,
        title: 'Alertas de Precio',
        text: 'Recibe notificaciones cuando los productos que quieres bajan de precio.'
      },
      {
        icon: <FiAward />,
        title: 'Garantía de Mejor Precio',
        text: 'Si encuentras un precio mejor, te reembolsamos la diferencia.'
      },
      {
        icon: <FiUsers />,
        title: 'Comunidad de Compradores',
        text: 'Únete a más de 2 millones de usuarios que ya están ahorrando.'
      },
      {
        icon: <FiStar />,
        title: 'Calificaciones Verificadas',
        text: 'Lee reseñas reales de compradores verificados antes de comprar.'
      }
    ],
    socialLinks: {
      facebook: 'https://facebook.com/comprainteligente',
      twitter: 'https://twitter.com/comprainteligente',
      instagram: 'https://instagram.com/comprainteligente',
      linkedin: 'https://linkedin.com/company/comprainteligente'
    },
    testimonials: [
      {
        text: 'He ahorrado más de $500 este año usando Compra Inteligente. Es increíble cómo funciona.',
        author: 'María González',
        role: 'Compradora Premium'
      },
      {
        text: 'La mejor herramienta para encontrar ofertas. Siempre encuentro lo que busco al mejor precio.',
        author: 'Carlos Ramírez',
        role: 'Usuario desde 2023'
      },
      {
        text: 'Las alertas de precio son geniales. Compré mi laptop con un 40% de descuento gracias a ellas.',
        author: 'Ana Martínez',
        role: 'Influencer de Tecnología'
      }
    ]
  },
  'oportunidades-negocio': {
    id: 'oportunidades-negocio',
    title: 'Oportunidades de Negocio',
    subtitle: 'Invierte en tu futuro con nuestras soluciones empresariales de alto rendimiento',
    image: '/images/negocio_anuncio.jpeg',
    badge: '💼 Inversión Inteligente',
    price: 'Desde $199',
    originalPrice: '$399',
    ctaText: 'Solicitar Consultoría',
    features: [
      {
        icon: <FiTrendingUp />,
        title: 'Crecimiento Acelerado',
        text: 'Estrategias probadas para hacer crecer tu negocio hasta 300% en el primer año.'
      },
      {
        icon: <FiUsers />,
        title: 'Asesoría Personalizada',
        text: 'Equipo de expertos dedicado exclusivamente a tu éxito empresarial.'
      },
      {
        icon: <FiAward />,
        title: 'Casos de Éxito Comprobados',
        text: 'Más de 5,000 empresas han transformado sus negocios con nosotros.'
      },
      {
        icon: <FiDollarSign />,
        title: 'ROI Garantizado',
        text: 'Recupera tu inversión en los primeros 6 meses o te devolvemos tu dinero.'
      },
      {
        icon: <FiCalendar />,
        title: 'Implementación Rápida',
        text: 'Resultados visibles en menos de 30 días con nuestro sistema probado.'
      },
      {
        icon: <FiStar />,
        title: 'Soporte 24/7',
        text: 'Asistencia continua para resolver cualquier duda o desafío que enfrentes.'
      }
    ],
    socialLinks: {
      facebook: 'https://facebook.com/oportunidadesnegocio',
      twitter: 'https://twitter.com/oportunidadesnegocio',
      instagram: 'https://instagram.com/oportunidadesnegocio',
      linkedin: 'https://linkedin.com/company/oportunidadesnegocio'
    },
    testimonials: [
      {
        text: 'Nuestras ventas se triplicaron en 6 meses. La mejor inversión que hemos hecho.',
        author: 'Roberto Silva',
        role: 'CEO, TechStart Perú'
      },
      {
        text: 'El equipo de asesores es excepcional. Nos ayudaron a transformar completamente nuestro modelo de negocio.',
        author: 'Patricia Fernández',
        role: 'Directora, Innovación S.A.'
      },
      {
        text: 'ROI del 400% en el primer año. No puedo recomendar más esta solución.',
        author: 'Miguel Torres',
        role: 'Fundador, Digital Solutions'
      }
    ]
  },
  'viaja-mundo': {
    id: 'viaja-mundo',
    title: 'Viaja por el Mundo',
    subtitle: 'Descubre destinos increíbles con nuestros paquetes turísticos exclusivos y experiencias únicas',
    image: '/images/anuncio_vuelos.png',
    badge: '✈️ Aventura Garantizada',
    price: 'Desde $599',
    originalPrice: '$1,199',
    ctaText: 'Reservar Ahora',
    features: [
      {
        icon: <FiMapPin />,
        title: 'Más de 200 Destinos',
        text: 'Explora los lugares más increíbles del mundo con nuestros paquetes exclusivos.'
      },
      {
        icon: <FiStar />,
        title: 'Hoteles 5 Estrellas',
        text: 'Alojamiento de lujo en los mejores hoteles y resorts del mundo.'
      },
      {
        icon: <FiUsers />,
        title: 'Guías Expertos',
        text: 'Acompañamiento de guías locales que conocen cada rincón de los destinos.'
      },
      {
        icon: <FiAward />,
        title: 'Experiencias Únicas',
        text: 'Acceso exclusivo a experiencias que no encontrarás en ningún otro lugar.'
      },
      {
        icon: <FiCheck />,
        title: 'Cancelación Flexible',
        text: 'Cancela o modifica tu viaje sin penalizaciones hasta 48 horas antes.'
      },
      {
        icon: <FiDollarSign />,
        title: 'Mejor Precio Garantizado',
        text: 'Si encuentras el mismo paquete más barato, te reembolsamos la diferencia.'
      }
    ],
    socialLinks: {
      facebook: 'https://facebook.com/viajapormundo',
      twitter: 'https://twitter.com/viajapormundo',
      instagram: 'https://instagram.com/viajapormundo',
      linkedin: 'https://linkedin.com/company/viajapormundo'
    },
    testimonials: [
      {
        text: 'El mejor viaje de mi vida. Todo estuvo perfectamente organizado y las experiencias fueron increíbles.',
        author: 'Laura Sánchez',
        role: 'Viajera Frecuente'
      },
      {
        text: 'Superó todas mis expectativas. Los guías eran excelentes y los hoteles de primera clase.',
        author: 'Diego Morales',
        role: 'Blogger de Viajes'
      },
      {
        text: 'Una experiencia única que nunca olvidaré. Definitivamente volveré a viajar con ellos.',
        author: 'Sofía Rodríguez',
        role: 'Influencer de Lifestyle'
      }
    ]
  }
};

function AdDetail() {
  const { adId } = useParams();
  const navigate = useNavigate();
  const [ad, setAd] = useState(null);

  useEffect(() => {
    const adKey = adId?.toLowerCase().replace(/\s+/g, '-');
    if (adData[adKey]) {
      setAd(adData[adKey]);
    }
  }, [adId]);

  if (!ad) {
    return (
      <Container>
        <Header>
          <HeaderContent>
            <BackButton onClick={() => navigate('/')}>
              <FiArrowLeft />
              Volver al Inicio
            </BackButton>
          </HeaderContent>
        </Header>
        <MainContent>
          <div style={{ textAlign: 'center', color: 'white', padding: '4rem', position: 'relative', zIndex: 2 }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Anuncio no encontrado</h1>
            <p style={{ fontSize: '1.5rem' }}>El anuncio que buscas no existe.</p>
          </div>
        </MainContent>
      </Container>
    );
  }

  return (
    <Container bgImage={ad.image}>
      <Header>
        <HeaderContent>
          <BackButton onClick={() => navigate('/')}>
            <FiArrowLeft />
            Volver al Inicio
          </BackButton>
        </HeaderContent>
      </Header>

      <MainContent>
        {/* Hero Section */}
        <HeroSection>
          <HeroImage>
            <img src={ad.image} alt={ad.title} />
          </HeroImage>
          <HeroContent>
            <Badge>{ad.badge}</Badge>
            <Title>{ad.title}</Title>
            <Subtitle>{ad.subtitle}</Subtitle>
            <PriceSection>
              <Price>
                {ad.price}
                {ad.originalPrice && <span>{ad.originalPrice}</span>}
              </Price>
            </PriceSection>
            <CTAButton>
              {ad.ctaText}
              <FiArrowLeft style={{ transform: 'rotate(180deg)' }} />
            </CTAButton>
          </HeroContent>
        </HeroSection>

        {/* Features Section */}
        <FeaturesSection>
          <SectionTitle>¿Por qué elegirnos?</SectionTitle>
          <FeaturesGrid>
            {ad.features.map((feature, index) => (
              <FeatureCard key={index}>
                <FeatureIcon>{feature.icon}</FeatureIcon>
                <FeatureTitle>{feature.title}</FeatureTitle>
                <FeatureText>{feature.text}</FeatureText>
              </FeatureCard>
            ))}
          </FeaturesGrid>
        </FeaturesSection>

        {/* Social Media Section */}
        <SocialSection>
          <SectionTitle>Síguenos en Redes Sociales</SectionTitle>
          <p style={{ fontSize: '1.2rem', color: '#4a5568', marginBottom: '1rem' }}>
            Mantente al día con nuestras últimas ofertas y novedades
          </p>
          <SocialLinks>
            <SocialButton href={ad.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="facebook">
              <FiFacebook />
            </SocialButton>
            <SocialButton href={ad.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="twitter">
              <FiTwitter />
            </SocialButton>
            <SocialButton href={ad.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="instagram">
              <FiInstagram />
            </SocialButton>
            <SocialButton href={ad.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="linkedin">
              <FiLinkedin />
            </SocialButton>
          </SocialLinks>
        </SocialSection>

        {/* Testimonials Section */}
        <TestimonialsSection>
          <SectionTitle>Lo que dicen nuestros clientes</SectionTitle>
          <TestimonialsGrid>
            {ad.testimonials.map((testimonial, index) => (
              <TestimonialCard key={index}>
                <TestimonialText>"{testimonial.text}"</TestimonialText>
                <TestimonialAuthor>
                  <AuthorAvatar>
                    {testimonial.author.charAt(0)}
                  </AuthorAvatar>
                  <AuthorInfo>
                    <AuthorName>{testimonial.author}</AuthorName>
                    <AuthorRole>{testimonial.role}</AuthorRole>
                  </AuthorInfo>
                </TestimonialAuthor>
              </TestimonialCard>
            ))}
          </TestimonialsGrid>
        </TestimonialsSection>
      </MainContent>
    </Container>
  );
}

export default AdDetail;

