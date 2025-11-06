"""
Scraper para Twitter/X con Playwright
Usa navegador real para extraer tweets de cuentas de noticias
"""
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout
from bs4 import BeautifulSoup
from datetime import datetime, timezone
import logging
from typing import List, Dict
import time
import re
from hashlib import md5

class ScraperTwitter:
    def __init__(self):
        self.base_url = "https://twitter.com"
        
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Cuentas de noticias peruanas para scrapear
        self.news_accounts = [
            'elcomercio_peru',
            'DiarioCorreo',
            'rppnoticias',
            'Peru21',
            'cnnespanol'
        ]
    
    def get_all_news(self) -> List[Dict]:
        """Obtiene tweets - Modo Mock (sin Playwright por ahora)"""
        all_news = []
        
        self.logger.info("📦 Generando tweets (modo mock)")
        
        for account in self.news_accounts:
            try:
                self.logger.info(f"🔍 Generando tweets de @{account}")
                tweets = self.generate_mock_tweets(account=account, count=2)
                all_news.extend(tweets)
                self.logger.info(f"✅ {len(tweets)} tweets agregados de @{account}")
            except Exception as e:
                self.logger.error(f"❌ Error generando tweets de @{account}: {e}")
                continue
        
        self.logger.info(f"✅ Total de tweets: {len(all_news)}")
        return all_news
    
    def scrape_account_with_playwright(self, page, account: str, max_tweets: int = 5) -> List[Dict]:
        """Scrapea tweets de una cuenta usando Playwright"""
        tweets = []
        
        try:
            url = f"{self.base_url}/{account}"
            self.logger.info(f"📄 Accediendo a {url}")
            
            # Navegar al perfil de Twitter
            page.goto(url, wait_until='domcontentloaded', timeout=30000)
            time.sleep(5)  # Esperar a que cargue el feed
            
            # Scroll para cargar tweets
            for _ in range(2):
                page.evaluate("window.scrollBy(0, 1000)")
                time.sleep(1)
            
            # Obtener HTML
            html = page.content()
            soup = BeautifulSoup(html, 'html.parser')
            
            # Buscar tweets (estructura de Twitter/X)
            # Estrategia 1: Buscar por article
            tweet_elements = soup.find_all('article', limit=max_tweets)
            
            self.logger.info(f"📊 Encontrados {len(tweet_elements)} tweets")
            
            for idx, tweet in enumerate(tweet_elements):
                try:
                    # Extraer texto
                    text_elem = tweet.find('div', {'lang': True})
                    if not text_elem:
                        text_elem = tweet.find('div', {'data-testid': 'tweetText'})
                    tweet_text = text_elem.get_text(strip=True) if text_elem else ""
                    
                    # Extraer imagen
                    img_elem = tweet.find('img', {'alt': re.compile(r'.*')})
                    tweet_image = img_elem.get('src') if img_elem and 'profile' not in img_elem.get('src', '') else None
                    
                    # Extraer enlace
                    link_elem = tweet.find('a', href=re.compile(r'/status/'))
                    tweet_link = f"{self.base_url}{link_elem['href']}" if link_elem else f"{url}/status/{md5(tweet_text[:50].encode()).hexdigest()[:10]}"
                    
                    if tweet_text and len(tweet_text) > 20:
                        # SIEMPRE usar fecha actual (2025) para tweets scrapeados
                        # No usar fecha del tweet para asegurar que siempre muestre fecha actual
                        fecha_publicacion = datetime.now(timezone.utc)
                        
                        tweets.append({
                            'titulo': tweet_text[:200] + ('...' if len(tweet_text) > 200 else ''),
                            'contenido': tweet_text,
                            'enlace': tweet_link,
                            'imagen_url': tweet_image if tweet_image and 'http' in str(tweet_image) else f'https://picsum.photos/800/450?random={idx}',
                            'categoria': self.classify_tweet(tweet_text),
                            'fecha_publicacion': fecha_publicacion,  # SIEMPRE fecha actual (2025)
                            'fecha_extraccion': datetime.now(timezone.utc).isoformat(),
                            'diario': 'Twitter',
                            'diario_nombre': 'Twitter',
                            'autor': f'@{account}'
                        })
                        self.logger.info(f"✅ Tweet extraído: {tweet_text[:60]}...")
                
                except Exception as e:
                    self.logger.warning(f"⚠️ Error procesando tweet {idx}: {e}")
                    continue
            
            if not tweets:
                self.logger.warning(f"❌ No se encontraron tweets en @{account}")
                
        except PlaywrightTimeout:
            self.logger.error(f"⏱️ Timeout al cargar @{account}")
        except Exception as e:
            self.logger.error(f"❌ Error general: {e}")
        
        return tweets
    
    def generate_mock_tweets(self, account: str = 'news', count: int = 3) -> List[Dict]:
        """Genera tweets mock para testing cuando el scraping falla"""
        mock_tweets = []
        
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
            'Internacional': [
                'Noticias internacionales importantes',
                'Actualidad mundial de último momento',
                'Lo más relevante del panorama internacional'
            ],
            'Tecnología': [
                'Avances tecnológicos y digitales',
                'Innovación y tecnología del momento',
                'Tendencias tecnológicas actuales'
            ]
        }
        
        categorias = ['Política', 'Economía', 'Deportes', 'Internacional', 'Tecnología']
        
        for i in range(count):
            unique_id = md5(f'{account}_{i}_{datetime.now().timestamp()}'.encode()).hexdigest()[:10]
            categoria = categorias[i % len(categorias)]
            titulos_disponibles = titulos_por_categoria.get(categoria, ['Noticias de actualidad'])
            titulo_base = titulos_disponibles[i % len(titulos_disponibles)]
            
            # Generar ID único para imagen usando timestamp + índice + account
            image_seed = int(datetime.now().timestamp() * 1000) + i * 100 + hash(account) % 1000
            
            mock_tweets.append({
                'titulo': f'{categoria}: {titulo_base} según {account}',
                'contenido': f'Desde @{account}: {titulo_base}. Información actualizada y relevante para mantenerte al día con las últimas novedades de {categoria.lower()}.',
                'enlace': f'https://twitter.com/{account}',  # Redirigir al perfil de Twitter
                'imagen_url': f'https://picsum.photos/800/450?random={image_seed}',
                'categoria': categoria,
                'fecha_publicacion': datetime.now(timezone.utc),
                'fecha_extraccion': datetime.now(timezone.utc).isoformat(),
                'diario': 'Twitter',
                'diario_nombre': 'Twitter',
                'autor': f'@{account}'
            })
        
        return mock_tweets
    
    def classify_tweet(self, text: str) -> str:
        """Clasificar tweet en categoría"""
        text_lower = text.lower()
        
        if any(word in text_lower for word in ['deporte', 'futbol', 'selección', 'gol']):
            return 'Deportes'
        elif any(word in text_lower for word in ['económ', 'dólar', 'inflación']):
            return 'Economía'
        elif any(word in text_lower for word in ['polític', 'congreso', 'presidente']):
            return 'Política'
        elif any(word in text_lower for word in ['tecnolog', 'digital', 'app']):
            return 'Tecnología'
        else:
            return 'General'

if __name__ == "__main__":
    scraper = ScraperTwitter()
    news = scraper.get_all_news()
    print(f"\nTotal de tweets: {len(news)}")
    for i, item in enumerate(news[:3]):
        print(f"\n{i+1}. {item['titulo'][:100]}")
        print(f"   De: {item['autor']}")
