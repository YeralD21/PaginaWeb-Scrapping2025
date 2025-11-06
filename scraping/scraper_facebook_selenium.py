"""
Scraper de Facebook con Selenium para extraer posts REALES de páginas públicas
Usa WebDriverWait para esperar carga de contenido dinámico
"""
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from datetime import datetime, timezone
import logging
from typing import List, Dict
import time
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ScraperFacebookSelenium:
    def __init__(self):
        self.base_url = "https://www.facebook.com"
        
        # Páginas de noticias peruanas (páginas oficiales de Facebook)
        self.news_pages = [
            'elcomercio.pe',   # El Comercio
            'CorreoPeru',      # Diario Correo
            'cnn',             # CNN
            'elpopular.pe',    # El Popular
            'larepublicape'    # La República
        ]
        
        # Mapeo de páginas a nombres de diarios
        self.page_to_diario = {
            'elcomercio.pe': 'El Comercio',
            'CorreoPeru': 'Diario Correo',
            'cnn': 'CNN en Español',
            'elpopular.pe': 'El Popular',
            'larepublicape': 'La República'
        }
        
        self.driver = None
    
    def _setup_driver(self):
        """Configura el WebDriver de Chrome"""
        chrome_options = Options()
        # chrome_options.add_argument('--headless')  # Descomentar para headless
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
        
        try:
            # Intentar usar Chrome normal
            self.driver = webdriver.Chrome(options=chrome_options)
            logger.info("✅ ChromeDriver inicializado correctamente")
        except Exception as e:
            logger.error(f"❌ Error inicializando ChromeDriver: {e}")
            logger.info("💡 Tip: Asegúrate de tener Chrome y ChromeDriver instalados")
            raise
    
    def _scrape_page_real(self, fb_page: str, max_posts: int = 5) -> List[Dict]:
        """
        Scrapea posts REALES de una página de Facebook usando Selenium
        
        Args:
            fb_page: Nombre de la página (ej: 'elcomercio.pe')
            max_posts: Número máximo de posts a extraer
            
        Returns:
            Lista de diccionarios con posts reales
        """
        posts = []
        diario_nombre = self.page_to_diario.get(fb_page, 'Facebook')
        
        try:
            url = f"{self.base_url}/{fb_page}"
            logger.info(f"📄 Accediendo a {url}")
            
            self.driver.get(url)
            
            # WebDriverWait: Esperar hasta 20 segundos a que cargue el contenido
            wait = WebDriverWait(self.driver, 20)
            
            try:
                # Intentar encontrar posts usando diferentes selectores robustos
                # Selector 1: Buscar divs con role="article" (estructura moderna de FB)
                wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'div[role="article"]')))
                logger.info("✅ Posts detectados usando CSS selector 'div[role=\"article\"]'")
                
            except TimeoutException:
                logger.warning("⚠️ No se encontraron posts con el selector principal, intentando alternativos...")
                # Selector alternativo: Buscar por data-pagelet
                try:
                    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '[data-pagelet]')))
                    logger.info("✅ Contenido detectado usando '[data-pagelet]'")
                except TimeoutException:
                    logger.error("❌ No se pudo cargar contenido de la página")
                    return posts
            
            # Scroll para cargar más contenido
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight / 2);")
            time.sleep(2)
            self.driver.execute_script("window.scrollBy(0, 1000);")
            time.sleep(2)
            
            # Buscar elementos de posts
            post_elements = self.driver.find_elements(By.CSS_SELECTOR, 'div[role="article"]')
            
            logger.info(f"📊 Encontrados {len(post_elements)} elementos de post")
            
            for idx, post_elem in enumerate(post_elements[:max_posts]):
                try:
                    post_data = self._extract_post_data(post_elem, fb_page, idx)
                    if post_data:
                        posts.append(post_data)
                        logger.info(f"✅ Post {idx+1}: {post_data.get('titulo', 'Sin título')[:60]}...")
                
                except Exception as e:
                    logger.warning(f"⚠️ Error extrayendo post {idx+1}: {e}")
                    continue
            
            if not posts:
                logger.warning(f"⚠️ No se pudieron extraer posts de {fb_page}")
        
        except TimeoutException as e:
            logger.error(f"⏱️ Timeout esperando contenido de {fb_page}: {e}")
        except Exception as e:
            logger.error(f"❌ Error general scrapeando {fb_page}: {e}")
        
        return posts
    
    def _extract_post_data(self, post_elem, fb_page: str, idx: int) -> Dict:
        """
        Extrae datos específicos de un elemento de post
        
        Args:
            post_elem: Elemento Selenium del post
            fb_page: Nombre de la página
            idx: Índice del post
            
        Returns:
            Diccionario con datos del post o None si falla
        """
        diario_nombre = self.page_to_diario.get(fb_page, 'Facebook')
        
        try:
            # Extraer texto del post (múltiples estrategias)
            post_text = None
            
            # Estrategia 1: Buscar spans con texto largo
            text_elements = post_elem.find_elements(By.CSS_SELECTOR, 'span[dir="auto"]')
            texts = [elem.text for elem in text_elements if len(elem.text) > 20]
            
            if texts:
                post_text = texts[0]
            else:
                # Estrategia 2: Buscar divs con data-testid
                text_divs = post_elem.find_elements(By.CSS_SELECTOR, 'div[data-testid]')
                for div in text_divs:
                    if len(div.text) > 20:
                        post_text = div.text
                        break
            
            if not post_text or len(post_text) < 30:
                logger.warning(f"⚠️ Post {idx+1}: Texto muy corto o vacío, saltando")
                return None
            
            # Extraer imagen si existe (buscar imágenes de contenido)
            image_url = None
            try:
                # Buscar todas las imágenes y filtrar
                img_elements = post_elem.find_elements(By.CSS_SELECTOR, 'img')
                for img in img_elements:
                    src = img.get_attribute('src')
                    alt = img.get_attribute('alt') or ''
                    # Filtrar avatares, emojis y data URLs
                    if src and 'profile' not in src.lower() and 'avatar' not in src.lower() and 'emoji' not in src.lower() and not src.startswith('data:'):
                        # Preferir imágenes con alt text (contenido)
                        if len(alt) > 2 or not alt:
                            image_url = src
                            break
            except NoSuchElementException:
                pass
            
            # Extraer enlace del post
            post_link = f"https://www.facebook.com/{fb_page}"
            try:
                link_elem = post_elem.find_element(By.CSS_SELECTOR, 'a[href*="/posts/"]')
                href = link_elem.get_attribute('href')
                if href:
                    post_link = href
            except NoSuchElementException:
                pass
            
            # Clasificar categoría
            categoria = self._classify_post(post_text)
            
            return {
                'titulo': post_text[:200] + ('...' if len(post_text) > 200 else ''),
                'contenido': post_text,
                'enlace': post_link,
                'imagen_url': image_url,
                'categoria': categoria,
                'fecha_publicacion': datetime.now(timezone.utc),
                'fecha_extraccion': datetime.now(timezone.utc).isoformat(),
                'diario': 'Facebook',
                'diario_nombre': diario_nombre,
                'autor': diario_nombre
            }
        
        except Exception as e:
            logger.error(f"❌ Error extrayendo datos del post: {e}")
            return None
    
    def _classify_post(self, text: str) -> str:
        """Clasifica el post en una categoría basada en palabras clave"""
        text_lower = text.lower()
        
        if any(word in text_lower for word in ['deporte', 'futbol', 'selección', 'gol']):
            return 'Deportes'
        elif any(word in text_lower for word in ['económ', 'dólar', 'inflación']):
            return 'Economía'
        elif any(word in text_lower for word in ['polític', 'congreso', 'presidente']):
            return 'Política'
        elif any(word in text_lower for word in ['actor', 'música', 'película']):
            return 'Espectáculos'
        elif any(word in text_lower for word in ['tecnolog', 'digital', 'app']):
            return 'Tecnología'
        else:
            return 'General'
    
    def get_all_news(self, use_real=True) -> List[Dict]:
        """
        Obtiene todos los posts de las páginas configuradas
        
        Args:
            use_real: Si True, usa Selenium para scraping real. Si False, genera mocks.
            
        Returns:
            Lista de diccionarios con posts
        """
        all_news = []
        
        if not use_real:
            # Modo mock (fallback rápido)
            logger.info("📦 Generando noticias de Facebook (modo mock)")
            for fb_page in self.news_pages:
                try:
                    diario_nombre = self.page_to_diario.get(fb_page, 'Facebook')
                    logger.info(f"🔍 Generando posts de {diario_nombre}")
                    posts = self.generate_mock_posts(fb_page, count=2)
                    all_news.extend(posts)
                    logger.info(f"✅ {len(posts)} posts agregados de {diario_nombre}")
                except Exception as e:
                    logger.error(f"❌ Error generando posts de {fb_page}: {e}")
                    continue
            return all_news
        
        # Modo REAL con Selenium
        try:
            self._setup_driver()
            logger.info("🚀 Iniciando scraping REAL con Selenium...")
            
            for fb_page in self.news_pages:
                try:
                    diario_nombre = self.page_to_diario.get(fb_page, 'Facebook')
                    logger.info(f"🔍 Scrapeando {diario_nombre}...")
                    
                    posts = self._scrape_page_real(fb_page, max_posts=3)
                    all_news.extend(posts)
                    
                    logger.info(f"✅ {len(posts)} posts reales obtenidos de {diario_nombre}")
                    time.sleep(3)  # Respetar rate limits
                    
                except Exception as e:
                    logger.error(f"❌ Error scrapeando {fb_page}: {e}")
                    continue
            
            logger.info(f"✅ Total de posts reales: {len(all_news)}")
        
        finally:
            if self.driver:
                self.driver.quit()
                logger.info("🔌 WebDriver cerrado")
        
        return all_news
    
    def generate_mock_posts(self, page: str, count: int = 3) -> List[Dict]:
        """Genera posts mock como fallback (copiado del scraper anterior)"""
        from hashlib import md5
        
        mock_posts = []
        categories = ['Política', 'Economía', 'Deportes', 'Espectáculos', 'Tecnología']
        mock_images = [
            'https://picsum.photos/800/400?random=1',
            'https://picsum.photos/800/400?random=2',
            'https://picsum.photos/800/400?random=3',
        ]
        
        diario_nombre = self.page_to_diario.get(page, 'Facebook')
        
        for i in range(count):
            unique_id = md5(f'{page}_{i}'.encode()).hexdigest()[:10]
            
            mock_posts.append({
                'titulo': f'Noticias de {diario_nombre} - Actualización #{i+1}',
                'contenido': f'Desde {diario_nombre}: Últimas noticias del momento. Esta es una actualización de prueba para demostrar la funcionalidad del scraper de Facebook. {diario_nombre} mantiene informada a su audiencia con las últimas novedades.',
                'enlace': f'https://www.facebook.com/{page}/posts/{unique_id}',
                'imagen_url': mock_images[i % len(mock_images)],
                'categoria': categories[i % len(categories)],
                'fecha_publicacion': datetime.now(timezone.utc),
                'fecha_extraccion': datetime.now(timezone.utc).isoformat(),
                'diario': 'Facebook',
                'diario_nombre': diario_nombre,
                'autor': diario_nombre
            })
        
        return mock_posts


if __name__ == "__main__":
    print("\n🧪 Probando scraper de Facebook con Selenium...\n")
    
    scraper = ScraperFacebookSelenium()
    
    # Modo mock (rápido para testing)
    print("📦 Modo MOCK:")
    mock_news = scraper.get_all_news(use_real=False)
    print(f"Total mock: {len(mock_news)}\n")
    
    # Modo real (requiere Chrome instalado)
    print("🚀 Modo REAL con Selenium:")
    print("(Puede tardar ~1-2 minutos)\n")
    try:
        real_news = scraper.get_all_news(use_real=True)
        print(f"\n✅ Total real: {len(real_news)}")
        
        if real_news:
            print("\n📰 Primeras 3 noticias REALES:")
            for i, news in enumerate(real_news[:3]):
                print(f"\n{i+1}. {news['titulo'][:80]}...")
                print(f"   Autor: {news['autor']}")
                print(f"   Categoría: {news['categoria']}")
                print(f"   URL: {news['enlace']}")
    except Exception as e:
        print(f"❌ Error en modo real: {e}")
        print("💡 Tip: Asegúrate de tener Chrome instalado")

