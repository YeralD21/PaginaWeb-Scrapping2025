"""
Scraper para YouTube (modo mock)
Genera videos de prueba cuando Selenium no está disponible
"""
from datetime import datetime, timezone
import logging
from typing import List, Dict
from hashlib import md5

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ScraperYouTube:
    def __init__(self):
        self.base_url = "https://www.youtube.com"
        
        # Canales de noticias peruanas (usando URLs completas de canales verificados)
        self.news_channels = [
            'channel/UCyjzd3PHwG6TgCZCHHZWBYA',  # El Comercio
            'channel/UCuRsgsgZXkgjhHhbKEwJ1_A',  # Diario Correo
            'channel/UChOF38ucKKJm7BZqrB_55LA',  # RPP Noticias
            'channel/UC4vzdGCAYyE4DLKJZQC3cZQ',  # Perú21
            'channel/UCQi90C5nDOa5qe6OOmytdCA'   # CNN en Español
        ]
        
        # Mapeo de canales a nombres de diarios
        self.channel_to_diario = {
            'channel/UCyjzd3PHwG6TgCZCHHZWBYA': 'El Comercio',
            'channel/UCuRsgsgZXkgjhHhbKEwJ1_A': 'Diario Correo',
            'channel/UChOF38ucKKJm7BZqrB_55LA': 'RPP',
            'channel/UC4vzdGCAYyE4DLKJZQC3cZQ': 'Perú21',
            'channel/UCQi90C5nDOa5qe6OOmytdCA': 'CNN en Español'
        }
    
    def get_all_news(self) -> List[Dict]:
        """Obtiene videos - Modo Mock"""
        all_news = []
        
        logger.info("📦 Generando videos de YouTube (modo mock)")
        
        for channel in self.news_channels:
            try:
                logger.info(f"🔍 Generando videos de {channel}")
                videos = self.generate_mock_videos(channel=channel, count=2)
                all_news.extend(videos)
                logger.info(f"✅ {len(videos)} videos agregados de {channel}")
            except Exception as e:
                logger.error(f"❌ Error generando videos de {channel}: {e}")
                continue
        
        logger.info(f"✅ Total de videos: {len(all_news)}")
        return all_news
    
    def generate_mock_videos(self, channel: str = 'news', count: int = 2) -> List[Dict]:
        """Genera videos mock para testing"""
        mock_videos = []
        
        # Títulos más variados y realistas por categoría
        titulos_por_categoria = {
            'Política': [
                'Análisis político de última hora',
                'Actualidad política nacional',
                'Información política del momento'
            ],
            'Economía': [
                'Reporte económico del día',
                'Análisis de mercado y economía',
                'Novedades económicas nacionales'
            ],
            'Deportes': [
                'Lo mejor del deporte nacional',
                'Resultados deportivos del día',
                'Noticias deportivas de última hora'
            ],
            'Espectáculos': [
                'Lo último del espectáculo',
                'Celebridades y entretenimiento',
                'Tendencias del mundo del entretenimiento'
            ],
            'Tecnología': [
                'Avances tecnológicos actuales',
                'Innovación digital del momento',
                'Tecnología y nuevas tendencias'
            ]
        }
        
        categorias = ['Política', 'Economía', 'Deportes', 'Espectáculos', 'Tecnología']
        diario_nombre = self.channel_to_diario.get(channel, 'YouTube')
        
        for i in range(count):
            unique_id = md5(f'{channel}_{i}_{datetime.now().timestamp()}'.encode()).hexdigest()[:10]
            categoria = categorias[i % len(categorias)]
            titulos_disponibles = titulos_por_categoria.get(categoria, ['Noticias de actualidad'])
            titulo_base = titulos_disponibles[i % len(titulos_disponibles)]
            
            # Generar ID único para imagen usando timestamp + índice + channel
            image_seed = int(datetime.now().timestamp() * 1000) + i * 100 + hash(channel) % 1000
            
            # Generar ID único para el video mock (simulando un video ID real)
            video_id = md5(f'{channel}_{i}_{categoria}_{datetime.now().timestamp()}'.encode()).hexdigest()[:11]
            
            mock_videos.append({
                'titulo': f'{categoria}: {titulo_base} según {diario_nombre}',
                'contenido': f'Desde {diario_nombre}: {titulo_base}. Video informativo con las últimas actualizaciones en {categoria.lower()}.',
                'enlace': f'https://www.youtube.com/watch?v={video_id}',  # Enlace único por video
                'imagen_url': f'https://picsum.photos/1280/720?random={image_seed}',
                'categoria': categoria,
                'fecha_publicacion': datetime.now(timezone.utc),
                'fecha_extraccion': datetime.now(timezone.utc).isoformat(),
                'diario': 'YouTube',
                'diario_nombre': diario_nombre,
                'autor': diario_nombre
            })
        
        return mock_videos
    
    def classify_video(self, titulo: str, descripcion: str) -> str:
        """Clasificar video en categoría"""
        text_lower = (titulo + " " + descripcion).lower()
        
        if any(word in text_lower for word in ['deporte', 'futbol', 'selección', 'gol', 'liga']):
            return 'Deportes'
        elif any(word in text_lower for word in ['económ', 'dólar', 'inflación', 'mercado']):
            return 'Economía'
        elif any(word in text_lower for word in ['presidente', 'congreso', 'gobierno', 'politic']):
            return 'Política'
        elif any(word in text_lower for word in ['actor', 'actriz', 'celebrity', 'entrevista']):
            return 'Espectáculos'
        elif any(word in text_lower for word in ['tecnología', 'tech', 'smartphone', 'app']):
            return 'Tecnología'
        elif any(word in text_lower for word in ['internacional', 'mundo', 'foreign', 'global']):
            return 'Internacional'
        else:
            return 'General'

