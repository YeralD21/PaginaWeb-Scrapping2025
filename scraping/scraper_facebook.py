"""
Scraper de Facebook con Playwright para extraer posts de páginas públicas
Usa navegador real para bypassar protecciones anti-scraping
"""
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout
from bs4 import BeautifulSoup
from datetime import datetime, timezone
import logging
from typing import List, Dict
import time
import re
from hashlib import md5

class ScraperFacebook:
    def __init__(self):
        self.base_url = "https://www.facebook.com"
        
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Páginas de noticias peruanas (páginas oficiales de Facebook)
        self.news_pages = [
            'elcomercio.pe',   # El Comercio
            'CorreoPeru',      # Diario Correo
            'cnn',             # CNN
            'elpopular.pe',    # El Popular
            'larepublicape'    # La República
        ]
        
        # Mapeo de páginas a nombres de diarios para la BD
        self.page_to_diario = {
            'elcomercio.pe': 'El Comercio',
            'CorreoPeru': 'Diario Correo',
            'cnn': 'CNN en Español',
            'elpopular.pe': 'El Popular',
            'larepublicape': 'La República'
        }
    
    def get_all_news(self) -> List[Dict]:
        """Obtiene posts de Facebook - Modo Mock (sin Playwright por ahora)"""
        all_news = []
        
        self.logger.info("📦 Generando noticias de Facebook (modo mock)")
        
        for fb_page in self.news_pages:
            try:
                diario_nombre = self.page_to_diario.get(fb_page, 'Facebook')
                self.logger.info(f"🔍 Generando posts de {diario_nombre}")
                posts = self.generate_mock_posts(fb_page, count=2)
                all_news.extend(posts)
                self.logger.info(f"✅ {len(posts)} posts agregados de {diario_nombre}")
            except Exception as e:
                self.logger.error(f"❌ Error generando posts de {fb_page}: {e}")
                continue
        
        self.logger.info(f"✅ Total de posts de Facebook: {len(all_news)}")
        return all_news
    
    def scrape_page_with_playwright(self, page, fb_page: str, max_posts: int = 5) -> List[Dict]:
        """Scrapea posts de una página de Facebook usando Playwright"""
        posts = []
        diario_nombre = self.page_to_diario.get(fb_page, 'Facebook')
        
        try:
            # Navegar a la página de Facebook
            url = f"{self.base_url}/{fb_page}"
            self.logger.info(f"📄 Accediendo a {url}")
            
            page.goto(url, wait_until='networkidle', timeout=30000)
            
            # Esperar a que cargue el contenido
            time.sleep(3)
            
            # Scroll para cargar más posts
            page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)")
            time.sleep(2)
            
            # Obtener el HTML renderizado
            html = page.content()
            soup = BeautifulSoup(html, 'html.parser')
            
            # Buscar posts (varias estrategias según la estructura de FB)
            # Estrategia 1: Buscar por role="article"
            post_elements = soup.find_all('div', {'role': 'article'}, limit=max_posts)
            
            if not post_elements:
                # Estrategia 2: Buscar por data-testid
                post_elements = soup.find_all('div', {'data-testid': re.compile(r'.*post.*')}, limit=max_posts)
            
            self.logger.info(f"📊 Encontrados {len(post_elements)} elementos de post")
            
            for idx, post in enumerate(post_elements):
                try:
                    # Extraer texto del post
                    text_divs = post.find_all('div', {'dir': 'auto'})
                    post_text = ' '.join([div.get_text(strip=True) for div in text_divs if div.get_text(strip=True)])
                    
                    # Extraer imagen
                    img_elem = post.find('img', {'class': re.compile(r'.*')})
                    post_image = img_elem.get('src') if img_elem else None
                    
                    # Filtrar imágenes de perfil
                    if post_image and ('profile' in post_image.lower() or post_image.startswith('data:')):
                        post_image = None
                    
                    # Extraer enlace del post
                    link_elem = post.find('a', href=re.compile(r'/posts/|/photos/|/videos/'))
                    post_link = f"{self.base_url}{link_elem['href']}" if link_elem else url
                    
                    # Generar ID único para el post
                    unique_id = md5(f'{fb_page}_{post_text[:50]}'.encode()).hexdigest()[:10]
                    
                    if post_text and len(post_text) > 30:
                        posts.append({
                            'titulo': post_text[:200] + ('...' if len(post_text) > 200 else ''),
                            'contenido': post_text,
                            'enlace': post_link,
                            'imagen_url': post_image if post_image and 'http' in str(post_image) else f'https://picsum.photos/800/400?random={idx}',
                            'categoria': self.classify_post(post_text),
                            'fecha_publicacion': datetime.now(timezone.utc),
                            'fecha_extraccion': datetime.now(timezone.utc).isoformat(),
                            'diario': 'Facebook',
                            'diario_nombre': diario_nombre,
                            'autor': diario_nombre
                        })
                        self.logger.info(f"✅ Post extraído: {post_text[:60]}...")
                    
                except Exception as e:
                    self.logger.warning(f"⚠️ Error procesando post {idx}: {e}")
                    continue
            
            # Si no se encontraron posts, registrar HTML para debug
            if not posts:
                self.logger.warning(f"❌ No se encontraron posts en {fb_page}. HTML length: {len(html)}")
                
        except PlaywrightTimeout:
            self.logger.error(f"⏱️ Timeout al cargar {fb_page}")
        except Exception as e:
            self.logger.error(f"❌ Error general scrapeando {fb_page}: {e}")
        
        return posts
    
    def generate_mock_posts(self, page: str, count: int = 3) -> List[Dict]:
        """Genera posts mock para testing cuando el scraping falla"""
        mock_posts = []
        
        # No usar lista fija, generar IDs únicos dinámicamente
        
        # Títulos más variados y realistas por categoría
        titulos_por_categoria = {
            'Política': [
                'Información política actual de último momento',
                'Análisis de la situación política nacional',
                'Actualizaciones desde el congreso'
            ],
            'Economía': [
                'Actualidad económica del país',
                'Análisis del mercado y economía nacional',
                'Reporte económico de última hora'
            ],
            'Deportes': [
                'Último minuto deportivo',
                'Resultados y noticias deportivas',
                'Lo mejor del deporte nacional'
            ],
            'Espectáculos': [
                'Lo último del mundo del espectáculo',
                'Actualidad de celebridades y entretenimiento',
                'Tendencias del entretenimiento'
            ],
            'Tecnología': [
                'Avances tecnológicos y digitales',
                'Innovación y tecnología del momento',
                'Tendencias tecnológicas actuales'
            ]
        }
        
        # Obtener el nombre del diario
        diario_nombre = self.page_to_diario.get(page, 'Facebook')
        categorias = ['Política', 'Economía', 'Deportes', 'Espectáculos', 'Tecnología']
        
        for i in range(count):
            # Generar un ID único para el post basado en el hash de la página y el índice
            unique_id = md5(f'{page}_{i}'.encode()).hexdigest()[:10]
            categoria = categorias[i % len(categorias)]
            titulos_disponibles = titulos_por_categoria.get(categoria, ['Noticias de actualidad'])
            titulo_base = titulos_disponibles[i % len(titulos_disponibles)]
            
            # Generar ID único para imagen usando timestamp + índice + page
            image_seed = int(datetime.now().timestamp() * 1000) + i * 100 + hash(page) % 1000
            
            mock_posts.append({
                'titulo': f'{categoria}: {titulo_base} según {diario_nombre}',
                'contenido': f'Desde {diario_nombre}: {titulo_base}. Mantente informado con las últimas novedades y actualizaciones relevantes de {categoria.lower()} desde nuestra plataforma.',
                'enlace': f'https://www.facebook.com/{page}',  # Redirigir a la página principal del diario
                'imagen_url': f'https://picsum.photos/800/400?random={image_seed}',
                'categoria': categoria,
                'fecha_publicacion': datetime.now(timezone.utc),
                'fecha_extraccion': datetime.now(timezone.utc).isoformat(),
                'diario': 'Facebook',
                'diario_nombre': diario_nombre,
                'autor': diario_nombre
            })
        
        return mock_posts
    
    def parse_date(self, date_str: str) -> datetime:
        """Parsear fecha de Facebook"""
        try:
            # Formato relativo de Facebook: "Justo ahora", "hace 2 horas", etc.
            return datetime.now(timezone.utc)
        except:
            return datetime.now(timezone.utc)
    
    def classify_post(self, text: str) -> str:
        """Clasificar post en categoría"""
        text_lower = text.lower()
        
        if any(word in text_lower for word in ['deporte', 'futbol', 'selección']):
            return 'Deportes'
        elif any(word in text_lower for word in ['económ', 'dólar', 'sueldo']):
            return 'Economía'
        elif any(word in text_lower for word in ['polític', 'congreso', 'ministro']):
            return 'Política'
        elif any(word in text_lower for word in ['actor', 'música', 'película']):
            return 'Espectáculos'
        elif any(word in text_lower for word in ['tecnolog', 'app', 'digital']):
            return 'Tecnología'
        else:
            return 'General'

if __name__ == "__main__":
    scraper = ScraperFacebook()
    news = scraper.get_all_news()
    print(f"\nTotal de posts: {len(news)}")
    for i, item in enumerate(news[:3]):
        print(f"\n{i+1}. {item['titulo'][:100]}")
        print(f"   Categoría: {item['categoria']}")

