"""
Scraper para Instagram con Playwright
Usa navegador real para extraer posts de cuentas de noticias
"""
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout
from bs4 import BeautifulSoup
from datetime import datetime, timezone
import logging
from typing import List, Dict
import time
import re
from hashlib import md5

class ScraperInstagram:
    def __init__(self):
        self.base_url = "https://www.instagram.com"
        
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Cuentas de noticias peruanas en Instagram
        self.news_accounts = [
            'elcomercio.pe',
            'diariocorreo',
            'rppnoticias',
            'cnnespanol'
        ]
    
    def get_all_news(self) -> List[Dict]:
        """Obtiene posts de Instagram - Modo Mock (sin Playwright por ahora)"""
        all_news = []
        
        self.logger.info("📦 Generando posts de Instagram (modo mock)")
        
        for account in self.news_accounts:
            try:
                self.logger.info(f"🔍 Generando posts de @{account}")
                posts = self.generate_mock_posts(account=account, count=2)
                all_news.extend(posts)
                self.logger.info(f"✅ {len(posts)} posts agregados de @{account}")
            except Exception as e:
                self.logger.error(f"❌ Error generando posts de @{account}: {e}")
                continue
        
        self.logger.info(f"✅ Total de posts de Instagram: {len(all_news)}")
        return all_news
    
    def scrape_account_with_playwright(self, page, account: str, max_posts: int = 5) -> List[Dict]:
        """Scrapea posts de Instagram usando Playwright"""
        posts = []
        
        try:
            url = f"{self.base_url}/{account}/"
            self.logger.info(f"📄 Accediendo a {url}")
            
            # Navegar al perfil
            page.goto(url, wait_until='domcontentloaded', timeout=30000)
            time.sleep(5)
            
            # Scroll para cargar posts
            for _ in range(2):
                page.evaluate("window.scrollBy(0, 1000)")
                time.sleep(1)
            
            # Obtener HTML
            html = page.content()
            soup = BeautifulSoup(html, 'html.parser')
            
            # Buscar posts (Instagram usa estructuras complejas)
            # Estrategia: Buscar elementos <a> con href="/p/"
            post_links = soup.find_all('a', href=re.compile(r'/p/'), limit=max_posts * 3)
            
            self.logger.info(f"📊 Encontrados {len(post_links)} enlaces de posts")
            
            seen_links = set()
            for idx, link in enumerate(post_links):
                if len(posts) >= max_posts:
                    break
                
                try:
                    post_url = f"{self.base_url}{link['href']}"
                    if post_url in seen_links:
                        continue
                    seen_links.add(post_url)
                    
                    # Extraer imagen
                    img_elem = link.find('img')
                    post_image = img_elem.get('src') if img_elem else None
                    
                    # Extraer alt text (descripción)
                    post_text = img_elem.get('alt', '') if img_elem else f'Post de Instagram desde @{account}'
                    
                    if len(post_text) > 10:
                        posts.append({
                            'titulo': post_text[:200] + ('...' if len(post_text) > 200 else ''),
                            'contenido': post_text,
                            'enlace': post_url,
                            'imagen_url': post_image if post_image and 'http' in str(post_image) else f'https://picsum.photos/800/800?random={idx}',
                            'categoria': self.classify_post(post_text),
                            'fecha_publicacion': datetime.now(timezone.utc),
                            'fecha_extraccion': datetime.now(timezone.utc).isoformat(),
                            'diario': 'Instagram',
                            'diario_nombre': 'Instagram',
                            'autor': f'@{account}'
                        })
                        self.logger.info(f"✅ Post extraído: {post_text[:60]}...")
                
                except Exception as e:
                    self.logger.warning(f"⚠️ Error procesando post {idx}: {e}")
                    continue
            
            if not posts:
                self.logger.warning(f"❌ No se encontraron posts en @{account}")
                
        except PlaywrightTimeout:
            self.logger.error(f"⏱️ Timeout al cargar @{account}")
        except Exception as e:
            self.logger.error(f"❌ Error general: {e}")
        
        return posts
    
    def generate_mock_posts(self, account: str = 'news', count: int = 3) -> List[Dict]:
        """Genera posts mock para testing"""
        mock_posts = []
        
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
        
        categorias = ['Política', 'Economía', 'Deportes', 'Espectáculos', 'Tecnología']
        
        for i in range(count):
            unique_id = md5(f'{account}_{i}_{datetime.now().timestamp()}'.encode()).hexdigest()[:10]
            categoria = categorias[i % len(categorias)]
            titulos_disponibles = titulos_por_categoria.get(categoria, ['Noticias de actualidad'])
            titulo_base = titulos_disponibles[i % len(titulos_disponibles)]
            
            # Generar ID único para imagen usando timestamp + índice + account
            image_seed = int(datetime.now().timestamp() * 1000) + i * 100 + hash(account) % 1000
            
            mock_posts.append({
                'titulo': f'{categoria}: {titulo_base} según {account}',
                'contenido': f'Desde @{account}: {titulo_base}. Últimas noticias visuales y contenido multimedia para mantenerte informado con las imágenes más impactantes del día.',
                'enlace': f'https://www.instagram.com/{account}/',  # Redirigir al perfil de Instagram
                'imagen_url': f'https://picsum.photos/800/800?random={image_seed}',
                'categoria': categoria,
                'fecha_publicacion': datetime.now(timezone.utc),
                'fecha_extraccion': datetime.now(timezone.utc).isoformat(),
                'diario': 'Instagram',
                'diario_nombre': 'Instagram',
                'autor': f'@{account}'
            })
        
        return mock_posts
    
    def classify_post(self, text: str) -> str:
        """Clasificar post en categoría"""
        text_lower = text.lower()
        
        if any(word in text_lower for word in ['deporte', 'futbol', 'atleta']):
            return 'Deportes'
        elif any(word in text_lower for word in ['económ', 'negocio', 'empresa']):
            return 'Economía'
        elif any(word in text_lower for word in ['polític', 'gobierno', 'ministro']):
            return 'Política'
        elif any(word in text_lower for word in ['actor', 'música', 'artista']):
            return 'Espectáculos'
        else:
            return 'General'

if __name__ == "__main__":
    scraper = ScraperInstagram()
    news = scraper.get_all_news()
    print(f"\nTotal de posts: {len(news)}")
    for i, item in enumerate(news[:3]):
        print(f"\n{i+1}. {item['titulo'][:100]}")
        print(f"   De: {item['autor']}")
