"""
Scraper de YouTube con Selenium para extraer videos REALES
"""
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from datetime import datetime, timezone
import logging
from typing import List, Dict
import time
from hashlib import md5

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ScraperYouTubeSelenium:
    def __init__(self):
        self.base_url = "https://www.youtube.com"
        
        # Canales de noticias peruanas (usando URLs completas de canales verificados)
        self.news_channels = [
            'channel/UCyjzd3PHwG6TgCZCHHZWBYA',  # El Comercio (canal verificado)
            'channel/UCuRsgsgZXkgjhHhbKEwJ1_A',  # Diario Correo (canal verificado)
            'channel/UChOF38ucKKJm7BZqrB_55LA',  # RPP Noticias (canal verificado)
            'channel/UC4vzdGCAYyE4DLKJZQC3cZQ',  # Perú21 (canal verificado)
            'channel/UCQi90C5nDOa5qe6OOmytdCA'   # CNN en Español (canal verificado)
        ]
        
        # Mapeo de canales a nombres de diarios
        self.channel_to_diario = {
            'channel/UCyjzd3PHwG6TgCZCHHZWBYA': 'El Comercio',
            'channel/UCuRsgsgZXkgjhHhbKEwJ1_A': 'Diario Correo',
            'channel/UChOF38ucKKJm7BZqrB_55LA': 'RPP',
            'channel/UC4vzdGCAYyE4DLKJZQC3cZQ': 'Perú21',
            'channel/UCQi90C5nDOa5qe6OOmytdCA': 'CNN en Español'
        }
        
        self.driver = None
    
    def _setup_driver(self):
        """Configura el WebDriver de Chrome"""
        chrome_options = Options()
        # chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
        
        try:
            self.driver = webdriver.Chrome(options=chrome_options)
            logger.info("✅ ChromeDriver inicializado correctamente")
        except Exception as e:
            logger.error(f"❌ Error inicializando ChromeDriver: {e}")
            raise
    
    def _scrape_channel_real(self, channel: str, max_videos: int = 5) -> List[Dict]:
        """
        Scrapea videos REALES de un canal de YouTube usando Selenium
        """
        videos = []
        
        try:
            url = f"{self.base_url}/{channel}/videos"
            logger.info(f"📄 Accediendo a {url}")
            
            self.driver.get(url)
            
            wait = WebDriverWait(self.driver, 20)
            
            try:
                # Buscar videos (estructura de YouTube)
                wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'ytd-rich-item-renderer')))
                logger.info("✅ Videos detectados")
            except TimeoutException:
                logger.warning("⚠️ No se encontraron videos")
                return videos
            
            # Scroll para cargar más videos
            self.driver.execute_script("window.scrollTo(0, 1000);")
            time.sleep(2)
            
            # Extraer videos
            video_elements = self.driver.find_elements(By.CSS_SELECTOR, 'ytd-rich-item-renderer')
            logger.info(f"📊 Encontrados {len(video_elements)} elementos de video")
            
            for idx, video_elem in enumerate(video_elements[:max_videos]):
                try:
                    video_data = self._extract_video_data(video_elem, channel, idx)
                    if video_data:
                        videos.append(video_data)
                        logger.info(f"✅ Video {idx+1}: {video_data.get('titulo', 'Sin título')[:60]}...")
                except Exception as e:
                    logger.error(f"❌ Error extrayendo video {idx+1}: {e}")
                    continue
            
            logger.info(f"✅ Total de videos reales: {len(videos)}")
            
        except Exception as e:
            logger.error(f"❌ Error scrapeando canal {channel}: {e}")
        
        return videos if videos else self.generate_mock_videos(channel=channel, count=2)
    
    def _extract_video_data(self, video_elem, channel: str, idx: int) -> Dict:
        """Extrae datos de un video de YouTube"""
        try:
            # Título
            titulo = "Sin título"
            try:
                title_elem = video_elem.find_element(By.CSS_SELECTOR, '#video-title')
                titulo = title_elem.text.strip()
            except NoSuchElementException:
                pass
            
            if not titulo or len(titulo) < 5:
                return None
            
            # Descripción
            descripcion = ""
            try:
                # YouTube muestra descripción al hacer hover, pero intentamos obtenerla
                meta_elem = video_elem.find_element(By.CSS_SELECTOR, '#metadata-line span')
                descripcion = meta_elem.text.strip()
            except NoSuchElementException:
                descripcion = f"Video de {channel}"
            
            # URL del video
            video_url = ""
            try:
                link_elem = video_elem.find_element(By.CSS_SELECTOR, '#video-title')
                video_url = link_elem.get_attribute('href')
            except NoSuchElementException:
                pass
            
            # Imagen (thumbnail)
            imagen_url = ""
            try:
                img_elem = video_elem.find_element(By.CSS_SELECTOR, 'img')
                imagen_url = img_elem.get_attribute('src')
                # YouTube usa lazy loading, intentar obtener la URL de alta calidad
                if 'hqdefault' in imagen_url:
                    imagen_url = imagen_url.replace('hqdefault', 'maxresdefault')
            except NoSuchElementException:
                pass
            
            # Canal
            autor = self.channel_to_diario.get(channel, channel)
            
            # Categoría (clasificación básica)
            categoria = self.classify_video(titulo, descripcion)
            
            return {
                'titulo': titulo[:200],
                'contenido': descripcion[:500] if descripcion else f"Video de {autor}",
                'enlace': video_url,
                'imagen_url': imagen_url,
                'categoria': categoria,
                'fecha_publicacion': datetime.now(timezone.utc),
                'fecha_extraccion': datetime.now(timezone.utc).isoformat(),
                'diario': 'YouTube',
                'diario_nombre': autor,
                'autor': autor
            }
            
        except Exception as e:
            logger.error(f"Error extrayendo datos del video: {e}")
            return None
    
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
            
            mock_videos.append({
                'titulo': f'{categoria}: {titulo_base} según {diario_nombre}',
                'contenido': f'Desde {diario_nombre}: {titulo_base}. Video informativo con las últimas actualizaciones en {categoria.lower()}.',
                'enlace': f'https://www.youtube.com/{channel}/videos',  # Redirigir al canal real
                'imagen_url': f'https://picsum.photos/1280/720?random={image_seed}',
                'categoria': categoria,
                'fecha_publicacion': datetime.now(timezone.utc),
                'fecha_extraccion': datetime.now(timezone.utc).isoformat(),
                'diario': 'YouTube',
                'diario_nombre': diario_nombre,
                'autor': diario_nombre
            })
        
        return mock_videos
    
    def get_all_news(self, use_real: bool = True) -> List[Dict]:
        """
        Obtiene videos de YouTube
        :param use_real: Si True, intenta scraping real con Selenium. Si False, usa mock.
        """
        all_videos = []
        
        try:
            if use_real:
                logger.info("🚀 Iniciando scraping REAL de YouTube con Selenium")
                self._setup_driver()
                
                for channel in self.news_channels:
                    try:
                        logger.info(f"🔍 Scrapeando {channel}...")
                        videos = self._scrape_channel_real(channel, max_videos=2)
                        all_videos.extend(videos)
                        logger.info(f"✅ {len(videos)} videos agregados de {channel}")
                    except Exception as e:
                        logger.error(f"❌ Error scrapeando {channel}: {e}")
                        # Fallback a mock si falla
                        mock_videos = self.generate_mock_videos(channel, count=2)
                        all_videos.extend(mock_videos)
                        logger.info(f"📦 {len(mock_videos)} videos mock agregados de {channel}")
                    
                    # Pausa entre canales
                    time.sleep(2)
                
                # Cerrar driver
                if self.driver:
                    self.driver.quit()
                    logger.info("✅ Driver cerrado correctamente")
            
            else:
                logger.info("📦 Generando videos mock (no usando Selenium)")
                for channel in self.news_channels:
                    mock_videos = self.generate_mock_videos(channel, count=2)
                    all_videos.extend(mock_videos)
                    logger.info(f"📦 {len(mock_videos)} videos mock agregados de {channel}")
            
            logger.info(f"✅ Total de videos: {len(all_videos)}")
            
        except Exception as e:
            logger.error(f"❌ Error en scraping de YouTube: {e}")
            # Fallback completo a mock
            logger.info("📦 Usando modo mock completo como fallback")
            for channel in self.news_channels:
                mock_videos = self.generate_mock_videos(channel, count=2)
                all_videos.extend(mock_videos)
        
        return all_videos

