"""
Scraper para YouTube.
Obtiene videos reales desde los feeds oficiales de los canales y,
si no están disponibles, genera datos mock como respaldo.0
"""
from datetime import datetime, timezone
import logging
import os
from typing import List, Dict, Optional
from hashlib import md5
import xml.etree.ElementTree as ET

import requests
from requests import RequestException

# Importación relativa para evitar problemas cuando se ejecuta desde el directorio scraping
try:
    from youtube_channels import YOUTUBE_CHANNELS
except ImportError:
    # Si falla, intentar importación absoluta
    try:
        import sys
        import os
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        from youtube_channels import YOUTUBE_CHANNELS
    except ImportError:
        # Si no existe el archivo, usar lista vacía como fallback
        YOUTUBE_CHANNELS = []
        logger.warning("youtube_channels.py no encontrado, usando lista vacía")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ScraperYouTube:
    FEED_URL_TEMPLATE = "https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}"

    def __init__(self):
        self.base_url = "https://www.youtube.com"

        # Configuración centralizada de canales (IDs y handles)
        self.channel_sources = YOUTUBE_CHANNELS
        self.channel_lookup = self._build_channel_lookup(self.channel_sources)
        self.channel_to_diario = {
            source["channel_id"]: source["diario_nombre"]
            for source in self.channel_sources
        }
        for source in self.channel_sources:
            channel_id = source.get("channel_id")
            if channel_id:
                self.channel_to_diario[f"channel/{channel_id}"] = source["diario_nombre"]

        self.force_mock = os.getenv('YOUTUBE_FORCE_MOCK', 'false').lower() == 'true'
        self.http_session = requests.Session()
        self.http_session.headers.update({
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/118.0.0.0 Safari/537.36"
            )
        })

    def _build_channel_lookup(self, sources: List[Dict]) -> Dict[str, Dict]:
        """Crear un índice para resolver canales por ID, handle o variantes."""
        lookup: Dict[str, Dict] = {}
        for source in sources:
            channel_id = source.get("channel_id")
            if not channel_id:
                continue

            normalized = channel_id.upper()
            variants = {
                channel_id,
                channel_id.lower(),
                normalized,
                f"channel/{channel_id}",
                f"channel/{channel_id}".lower(),
            }

            handle = source.get("handle")
            if handle:
                variants.update({
                    handle,
                    handle.lower(),
                    handle.lstrip("@"),
                    handle.lstrip("@").lower(),
                })

            for key in variants:
                lookup[key] = source

        return lookup

    def _get_channel_config(self, identifier: Optional[str]) -> Optional[Dict]:
        """Obtener configuración de canal a partir de diferentes identificadores."""
        if not identifier:
            return None

        direct = self.channel_lookup.get(identifier)
        if direct:
            return direct

        lower = identifier.lower()
        if lower in self.channel_lookup:
            return self.channel_lookup[lower]

        if identifier.startswith("channel/"):
            trimmed = identifier.split("/", 1)[-1]
            return self._get_channel_config(trimmed)

        if identifier.startswith("UC"):
            upper = identifier.upper()
            if upper in self.channel_lookup:
                return self.channel_lookup[upper]

        return None

    def get_all_news(self) -> List[Dict]:
        """Obtiene videos REALES de YouTube. Solo usa mock si es absolutamente necesario."""
        if self.force_mock:
            logger.warning("⚠️ Usando modo mock forzado para YouTube (YOUTUBE_FORCE_MOCK=true)")
            return self._generate_mock_batch()

        # PRIORIDAD: Intentar obtener videos reales primero
        try:
            logger.info("🚀 Intentando obtener videos REALES de YouTube desde feeds RSS...")
            real_videos = self._fetch_real_videos(max_items_per_channel=10)  # Aumentar a 10 videos por canal
            
            if real_videos and len(real_videos) > 0:
                logger.info(f"✅ Videos REALES obtenidos de YouTube: {len(real_videos)}")
                logger.info(f"📊 Canales scrapeados: {len(set(v.get('diario_nombre', '') for v in real_videos))}")
                
                # Verificar que los videos tengan enlaces válidos
                valid_videos = [v for v in real_videos if v.get('enlace') and v.get('enlace').startswith('http')]
                if len(valid_videos) < len(real_videos):
                    logger.warning(f"⚠️ {len(real_videos) - len(valid_videos)} videos sin enlace válido fueron filtrados")
                
                if valid_videos:
                    logger.info(f"✅ Retornando {len(valid_videos)} videos REALES válidos")
                    return valid_videos
                else:
                    logger.error("❌ No se encontraron videos válidos con enlaces reales")
            else:
                logger.warning("⚠️ No se obtuvieron videos reales del feed RSS")
                
        except Exception as exc:
            logger.error(f"❌ Error obteniendo videos reales de YouTube: {exc}", exc_info=True)
            logger.warning("⚠️ Intentando obtener videos de canales específicos como último recurso...")
            
            # Último intento: solo los 2 canales solicitados
            try:
                priority_channels = [
                    {"channel_id": "UC_lEiu6917IJz03TnntWUaQ", "diario_nombre": "CNN en Español", "handle": "@cnnee"},
                    {"channel_id": "UCA5MMdT1ePEEi9ACfCelIKQ", "diario_nombre": "El Comercio", "handle": "@DiarioElComercio"}
                ]
                
                priority_videos = []
                for channel_config in priority_channels:
                    try:
                        channel_videos = self._fetch_channel_feed(
                            channel_config["channel_id"], 
                            max_items=10, 
                            source=channel_config
                        )
                        if channel_videos:
                            priority_videos.extend(channel_videos)
                            logger.info(f"✅ {len(channel_videos)} videos obtenidos de {channel_config['diario_nombre']}")
                    except Exception as e:
                        logger.error(f"❌ Error obteniendo videos de {channel_config['diario_nombre']}: {e}")
                
                if priority_videos:
                    logger.info(f"✅ Total de videos prioritarios obtenidos: {len(priority_videos)}")
                    return priority_videos
            except Exception as e2:
                logger.error(f"❌ Error en intento de recuperación: {e2}")

        # SOLO como último recurso: usar mock
        logger.warning("⚠️ No se pudieron obtener videos reales, usando mock como último recurso")
        return self._generate_mock_batch()

    def _fetch_real_videos(self, max_items_per_channel: int = 10) -> List[Dict]:
        """Obtiene videos REALES usando los feeds RSS oficiales de los canales."""
        all_videos: List[Dict] = []
        
        # Priorizar los 2 canales solicitados por el usuario
        priority_channels = [
            {"channel_id": "UC_lEiu6917IJz03TnntWUaQ", "diario_nombre": "CNN en Español", "handle": "@cnnee", "url": "https://www.youtube.com/@cnnee"},
            {"channel_id": "UCA5MMdT1ePEEi9ACfCelIKQ", "diario_nombre": "El Comercio", "handle": "@DiarioElComercio", "url": "https://www.youtube.com/@DiarioElComercio"}
        ]
        
        # Primero scrapear los canales prioritarios
        logger.info("🎯 Priorizando canales oficiales: CNN en Español (@cnnee) y El Comercio (@DiarioElComercio)")
        for priority_channel in priority_channels:
            try:
                logger.info(f"📡 Scrapeando canal prioritario: {priority_channel['diario_nombre']} ({priority_channel['handle']})")
                channel_videos = self._fetch_channel_feed(
                    priority_channel["channel_id"], 
                    max_items_per_channel, 
                    source=priority_channel
                )
                if channel_videos:
                    all_videos.extend(channel_videos)
                    logger.info(f"✅ {len(channel_videos)} videos REALES agregados desde {priority_channel['diario_nombre']}")
                else:
                    logger.warning(f"⚠️ No se encontraron videos recientes para {priority_channel['diario_nombre']}")
            except RequestException as req_exc:
                logger.error(f"❌ Error de red descargando feed de {priority_channel['diario_nombre']}: {req_exc}")
            except Exception as exc:
                logger.error(f"❌ Error procesando feed de {priority_channel['diario_nombre']}: {exc}", exc_info=True)

        # Luego scrapear otros canales si están configurados (opcional)
        for source in self.channel_sources:
            channel_id = source.get('channel_id')
            if not channel_id:
                continue
            
            # Saltar si ya fue procesado como canal prioritario
            if channel_id in ["UC_lEiu6917IJz03TnntWUaQ", "UCA5MMdT1ePEEi9ACfCelIKQ"]:
                continue

            display_name = source.get('diario_nombre', 'YouTube')
            try:
                logger.info(f"📡 Descargando feed de YouTube para {display_name} ({channel_id})")
                channel_videos = self._fetch_channel_feed(channel_id, max_items_per_channel, source)
                if channel_videos:
                    all_videos.extend(channel_videos)
                    logger.info(f"✅ {len(channel_videos)} videos agregados desde {display_name}")
                else:
                    logger.warning(f"⚠️ No se encontraron videos recientes para {display_name}")
            except RequestException as req_exc:
                logger.error(f"❌ Error de red descargando feed de {display_name}: {req_exc}")
            except Exception as exc:
                logger.error(f"❌ Error procesando feed de {display_name}: {exc}", exc_info=True)

        return all_videos

    def _fetch_channel_feed(self, channel_identifier: str, max_items: int, source: Optional[Dict] = None) -> List[Dict]:
        """Descarga y procesa el feed RSS de un canal de YouTube."""
        config = source or self._get_channel_config(channel_identifier)
        if not config:
            logger.warning(f"⚠️ Canal de YouTube no configurado: {channel_identifier}")
            return []

        channel_id = config.get("channel_id") or channel_identifier.split("/", 1)[-1]
        display_name = config.get("diario_nombre", channel_id)
        handle = config.get("handle", "")
        
        # Construir URL del feed RSS
        feed_url = self.FEED_URL_TEMPLATE.format(channel_id=channel_id)
        logger.info(f"📡 Obteniendo feed RSS de {display_name} ({handle}) desde: {feed_url}")
        
        try:
            response = self.http_session.get(feed_url, timeout=20)
            response.raise_for_status()
            
            # Verificar si el feed está vacío o es inválido
            if not response.content or len(response.content) < 100:
                logger.warning(f"⚠️ Feed vacío o inválido para {display_name}")
                return []
            
            logger.info(f"✅ Feed RSS obtenido exitosamente para {display_name} ({len(response.content)} bytes)")
                
        except RequestException as e:
            if hasattr(e, 'response') and e.response is not None:
                if e.response.status_code == 404:
                    logger.error(f"❌ Canal no encontrado (404): {display_name} (ID: {channel_id}, Handle: {handle})")
                    logger.error(f"   URL del feed: {feed_url}")
                elif e.response.status_code == 403:
                    logger.error(f"❌ Acceso denegado (403): {display_name} - El feed puede estar deshabilitado")
                else:
                    logger.error(f"❌ Error HTTP {e.response.status_code} para {display_name}")
            else:
                logger.error(f"❌ Error de red al obtener feed de {display_name}: {e}")
            return []
        except Exception as e:
            logger.error(f"❌ Error inesperado al obtener feed de {display_name}: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return []

        root = ET.fromstring(response.content)

        atom_ns = "{http://www.w3.org/2005/Atom}"
        media_ns = "{http://search.yahoo.com/mrss/}"
        yt_ns = "{http://www.youtube.com/xml/schemas/2015}"

        entries = root.findall(f"{atom_ns}entry")
        videos: List[Dict] = []

        for entry in entries[:max_items]:
            title_elem = entry.find(f"{atom_ns}title")
            link_elem = entry.find(f"{atom_ns}link")
            published_elem = entry.find(f"{atom_ns}published")
            author_elem = entry.find(f"{atom_ns}author/{atom_ns}name")
            video_id_elem = entry.find(f"{yt_ns}videoId")
            media_group = entry.find(f"{media_ns}group")

            titulo = title_elem.text.strip() if title_elem is not None and title_elem.text else "Video sin título"
            enlace = link_elem.attrib.get('href') if link_elem is not None else ""
            video_id = video_id_elem.text.strip() if video_id_elem is not None and video_id_elem.text else ""

            if not enlace and video_id:
                enlace = f"https://www.youtube.com/watch?v={video_id}"

            published_raw = published_elem.text if published_elem is not None else None
            fecha_publicacion = self._parse_date(published_raw)

            autor = author_elem.text.strip() if author_elem is not None and author_elem.text else config.get("diario_nombre", "YouTube")

            thumbnail_url = None
            descripcion = ""

            if media_group is not None:
                thumbnail_elem = media_group.find(f"{media_ns}thumbnail")
                if thumbnail_elem is not None:
                    thumbnail_url = thumbnail_elem.attrib.get('url')
                description_elem = media_group.find(f"{media_ns}description")
                if description_elem is not None and description_elem.text:
                    descripcion = description_elem.text.strip()

            if not thumbnail_url and video_id:
                thumbnail_url = f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg"

            categoria = self.classify_video(titulo, descripcion)

            # Asegurar que el enlace sea válido y contenga video_id real
            if not enlace or not enlace.startswith('http'):
                logger.warning(f"⚠️ Enlace inválido para video: {titulo[:50]}")
                continue
            
            # Validar que el video_id sea real (11 caracteres alfanuméricos)
            if not video_id or len(video_id) != 11:
                logger.warning(f"⚠️ Video ID inválido para video: {titulo[:50]} (ID: {video_id})")
                # Intentar extraer video_id del enlace si no se encontró
                if 'watch?v=' in enlace:
                    video_id = enlace.split('watch?v=')[1].split('&')[0]
                    if len(video_id) == 11:
                        logger.info(f"✅ Video ID extraído del enlace: {video_id}")
                    else:
                        logger.warning(f"⚠️ Video ID extraído también es inválido: {video_id}")
                        continue
                else:
                    continue
            
            # Construir enlace completo si no está completo
            if not enlace.startswith('https://www.youtube.com'):
                if video_id:
                    enlace = f"https://www.youtube.com/watch?v={video_id}"
                else:
                    logger.warning(f"⚠️ No se puede construir enlace válido para: {titulo[:50]}")
                    continue
            
            videos.append({
                'titulo': titulo,
                'contenido': descripcion or f"Video publicado por {autor}.",
                'enlace': enlace,  # CRÍTICO: URL completa y válida del video de YouTube
                'imagen_url': thumbnail_url,
                'categoria': categoria,
                'fecha_publicacion': fecha_publicacion,
                'fecha_extraccion': datetime.now(timezone.utc).isoformat(),
                'diario': 'YouTube',  # CRÍTICO: Debe ser exactamente 'YouTube'
                'diario_nombre': autor,  # El nombre del canal (CNN, RPP, etc.)
                'autor': autor,
                'metadata': {
                    'youtube_channel_id': channel_id,
                    'youtube_handle': config.get('handle'),
                    'youtube_channel_url': config.get('url') or f"https://www.youtube.com/channel/{channel_id}",
                    'video_id': video_id  # Video ID real de 11 caracteres
                }
            })
            
            logger.info(f"✅ Video REAL agregado: {titulo[:50]}... | Video ID: {video_id} | URL: {enlace}")

        return videos

    def _parse_date(self, date_value: str) -> datetime:
        """Convierte la fecha del feed a datetime con zona horaria UTC."""
        if not date_value:
            return datetime.now(timezone.utc)

        try:
            # Asegurar sufijo UTC
            if date_value.endswith('Z'):
                date_value = date_value.replace('Z', '+00:00')
            parsed = datetime.fromisoformat(date_value)
            if parsed.tzinfo is None:
                parsed = parsed.replace(tzinfo=timezone.utc)
            return parsed
        except ValueError:
            logger.warning(f"No se pudo parsear la fecha '{date_value}', usando fecha actual")
            return datetime.now(timezone.utc)

    def _generate_mock_batch(self) -> List[Dict]:
        """Genera datos mock para todos los canales configurados."""
        all_news: List[Dict] = []
        logger.info("Generando videos mock de YouTube")

        for source in self.channel_sources:
            try:
                videos = self.generate_mock_videos(channel=source.get('channel_id'), count=2)
                all_news.extend(videos)
            except Exception as exc:
                logger.error(f"Error generando videos mock para {source.get('diario_nombre')}: {exc}")

        return all_news

    def generate_mock_videos(self, channel: str = 'news', count: int = 2) -> List[Dict]:
        """Genera videos mock para testing."""
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
        config = self._get_channel_config(channel)
        diario_nombre = (config or {}).get('diario_nombre') or self.channel_to_diario.get(channel, 'YouTube')
        channel_id = (config or {}).get('channel_id') or (channel.split('/', 1)[-1] if isinstance(channel, str) else 'mock')
        channel_url = (config or {}).get('url') or (
            f"https://www.youtube.com/channel/{channel_id}" if channel_id and channel_id.startswith('UC')
            else self.base_url
        )
        handle = (config or {}).get('handle')

        for i in range(count):
            categoria = categorias[i % len(categorias)]
            titulos_disponibles = titulos_por_categoria.get(categoria, ['Noticias de actualidad'])
            titulo_base = titulos_disponibles[i % len(titulos_disponibles)]

            # Generar ID único para imagen usando timestamp + índice + channel
            image_seed = int(datetime.now().timestamp() * 1000) + i * 100 + hash(channel_id) % 1000

            # Generar ID único para el video mock (simulando un video ID real)
            video_id = md5(f'{channel_id}_{i}_{categoria}_{datetime.now().timestamp()}'.encode()).hexdigest()[:11]

            enlace_video = f'https://www.youtube.com/watch?v={video_id}'
            
            mock_videos.append({
                'titulo': f'{categoria}: {titulo_base} según {diario_nombre}',
                'contenido': f'Desde {diario_nombre}: {titulo_base}. Video informativo con las últimas actualizaciones en {categoria.lower()}.',
                'enlace': enlace_video,  # Enlace único por video
                'imagen_url': f'https://picsum.photos/1280/720?random={image_seed}',
                'categoria': categoria,
                'fecha_publicacion': datetime.now(timezone.utc),
                'fecha_extraccion': datetime.now(timezone.utc).isoformat(),
                'diario': 'YouTube',  # CRÍTICO: Debe ser exactamente 'YouTube'
                'diario_nombre': diario_nombre,  # Nombre del canal
                'autor': diario_nombre,
                'metadata': {
                    'youtube_channel_id': channel_id,
                    'youtube_handle': handle,
                    'youtube_channel_url': channel_url,
                    'video_id': video_id  # ID del video para embed
                }
            })
            
            logger.info(f"Video mock generado: {categoria} | {titulo_base} | Video ID: {video_id}")

        return mock_videos

    def classify_video(self, titulo: str, descripcion: str) -> str:
        """Clasificar video en categoría."""
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

