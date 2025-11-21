"""
Scraper de Twitter/X con Selenium para extraer tweets REALES
"""
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from datetime import datetime, timezone, timedelta
import logging
from typing import List, Dict, Optional
import time
import re

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ScraperTwitterSelenium:
    def __init__(self):
        self.base_url = "https://twitter.com"
        
        # Cuentas oficiales de noticias (PRIORITARIAS)
        self.priority_accounts = [
            'elcorreo_com',      # Diario Correo oficial
            'elcomercio_peru',   # El Comercio oficial
            'CNNEE',             # CNN en Español oficial
            'elpopular_pe'       # El Popular oficial
        ]
        
        # Otras cuentas de noticias (secundarias)
        self.other_accounts = [
            'rppnoticias',
            'Peru21',
            'cnnespanol'
        ]
        
        # Combinar todas las cuentas (prioritarias primero)
        self.news_accounts = self.priority_accounts + self.other_accounts
        
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
    
    def _scrape_account_real(self, account: str, max_tweets: int = 5) -> List[Dict]:
        """
        Scrapea tweets REALES de una cuenta usando Selenium
        """
        tweets = []
        
        try:
            url = f"{self.base_url}/{account}"
            logger.info(f"📄 Accediendo a {url}")
            
            self.driver.get(url)
            
            wait = WebDriverWait(self.driver, 20)
            
            try:
                # Buscar tweets (estructura de Twitter/X)
                wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'article')))
                logger.info("✅ Tweets detectados usando selector 'article'")
            except TimeoutException:
                logger.warning("⚠️ No se encontraron tweets, intentando alternativos...")
                try:
                    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '[data-testid="tweet"]')))
                    logger.info("✅ Tweets detectados usando '[data-testid=\"tweet\"]'")
                except TimeoutException:
                    logger.error("❌ No se pudo cargar contenido de Twitter")
                    return tweets
            
            # Scroll múltiple para cargar más tweets (necesitamos más tweets para filtrar los recientes)
            logger.info("📜 Haciendo scroll para cargar más tweets...")
            for scroll_count in range(3):
                self.driver.execute_script("window.scrollBy(0, 1500);")
                time.sleep(2)
            logger.info("✅ Scroll completado")
            
            # Buscar elementos de tweets (aumentar cantidad para compensar filtrado)
            tweet_elements = self.driver.find_elements(By.CSS_SELECTOR, 'article')
            
            logger.info(f"📊 Encontrados {len(tweet_elements)} elementos de tweet")
            logger.info(f"🔍 Filtrando solo tweets del 2025 o últimos 30 días...")
            
            tweets_procesados = 0
            tweets_filtrados = 0
            
            for idx, tweet_elem in enumerate(tweet_elements):
                try:
                    tweet_data = self._extract_tweet_data(tweet_elem, account, idx)
                    if tweet_data:
                        tweets.append(tweet_data)
                        tweets_procesados += 1
                        logger.info(f"✅ Tweet {tweets_procesados}: {tweet_data.get('titulo', 'Sin título')[:60]}...")
                    else:
                        tweets_filtrados += 1
                    
                    # Detener si ya tenemos suficientes tweets recientes
                    if tweets_procesados >= max_tweets:
                        break
                        
                except Exception as e:
                    logger.warning(f"⚠️ Error extrayendo tweet {idx+1}: {e}")
                    continue
            
            logger.info(f"📊 Resultado: {tweets_procesados} tweets recientes procesados, {tweets_filtrados} tweets antiguos filtrados")
            
            if not tweets:
                logger.warning(f"⚠️ No se pudieron extraer tweets de @{account}")
        
        except TimeoutException as e:
            logger.error(f"⏱️ Timeout esperando contenido de @{account}: {e}")
        except Exception as e:
            logger.error(f"❌ Error general scrapeando @{account}: {e}")
        
        return tweets
    
    def _is_pinned_tweet(self, tweet_elem) -> bool:
        """Detecta si un tweet está fijado (pinned)."""
        try:
            # Twitter suele mostrar un contexto social con texto "Tweet fijado" o "Pinned Tweet"
            context_elem = tweet_elem.find_element(By.CSS_SELECTOR, '[data-testid="socialContext"]')
            context_text = context_elem.text.lower()
            if any(keyword in context_text for keyword in ['fijado', 'pinned']):
                return True
        except NoSuchElementException:
            pass

        try:
            # Revisión adicional por si aparece el texto directamente en el tweet
            tweet_text_lower = tweet_elem.text.lower()
            if 'tweet fijado' in tweet_text_lower:
                return True

            first_lines = tweet_text_lower.split('\n')[:2]
            if any('fijado' in line for line in first_lines):
                return True
        except Exception:
            pass

        return False

    def _extract_tweet_date(self, tweet_elem) -> Optional[datetime]:
        """Extrae la fecha real de publicación del tweet"""
        try:
            # Estrategia 1: Buscar elemento <time> con atributo datetime
            try:
                time_elem = tweet_elem.find_element(By.CSS_SELECTOR, 'time[datetime]')
                datetime_str = time_elem.get_attribute('datetime')
                if datetime_str:
                    # Parsear formato ISO: "2025-10-15T09:49:00.000Z"
                    try:
                        # Normalizar formato (puede venir con o sin Z)
                        if datetime_str.endswith('Z'):
                            datetime_str = datetime_str[:-1] + '+00:00'
                        elif '+' not in datetime_str and 'T' in datetime_str:
                            datetime_str = datetime_str + '+00:00'
                        fecha = datetime.fromisoformat(datetime_str)
                        return fecha
                    except Exception as e:
                        logger.debug(f"Error parseando datetime ISO: {e}")
                        pass
            except NoSuchElementException:
                pass
            
            # Estrategia 1.5: Buscar elemento <time> sin datetime, pero con texto
            try:
                time_elem = tweet_elem.find_element(By.CSS_SELECTOR, 'time')
                time_text = time_elem.text
                # Puede contener fechas relativas como "hace 2 horas" que consideramos recientes
                if time_text:
                    # Si contiene "hace" o "hoy" o "ayer", es reciente
                    time_lower = time_text.lower()
                    if any(word in time_lower for word in ['hace', 'hoy', 'ayer', 'min', 'hora']):
                        # Considerarlo reciente (fecha actual menos un día)
                        return datetime.now(timezone.utc) - timedelta(hours=1)
            except NoSuchElementException:
                pass
            
            # Estrategia 2: Buscar fecha dentro del HTML (texto visible)
            try:
                # Buscar en todo el texto del tweet el patrón de fecha
                tweet_text = tweet_elem.text
                
                # Patrones de fecha en español: "15 oct. 2025", "24 abr. 2020", "17 feb. 2021"
                date_patterns = [
                    r'(\d{1,2})\s+(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)\.\s+(\d{4})',
                    r'(\d{1,2})\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+(\d{4})'
                ]
                
                meses = {
                    'ene': 1, 'enero': 1, 'feb': 2, 'febrero': 2,
                    'mar': 3, 'marzo': 3, 'abr': 4, 'abril': 4,
                    'may': 5, 'mayo': 5, 'jun': 6, 'junio': 6,
                    'jul': 7, 'julio': 7, 'ago': 8, 'agosto': 8,
                    'sep': 9, 'septiembre': 9, 'oct': 10, 'octubre': 10,
                    'nov': 11, 'noviembre': 11, 'dic': 12, 'diciembre': 12
                }
                
                for pattern in date_patterns:
                    match = re.search(pattern, tweet_text.lower())
                    if match:
                        dia = int(match.group(1))
                        mes_str = match.group(2).lower()
                        anio = int(match.group(3))
                        
                        if mes_str in meses:
                            mes = meses[mes_str]
                            fecha = datetime(anio, mes, dia, tzinfo=timezone.utc)
                            return fecha
            except Exception as e:
                logger.debug(f"No se pudo extraer fecha del texto: {e}")

            # Estrategia 3: Buscar fecha en el HTML (atributos) como respaldo
            try:
                inner_html = tweet_elem.get_attribute('innerHTML') or ''
                # Buscar datetime="2025-01-10T..."
                datetime_match = re.search(r'datetime="([^"]+)"', inner_html)
                if datetime_match:
                    datetime_str = datetime_match.group(1)
                    if datetime_str.endswith('Z'):
                        datetime_str = datetime_str[:-1] + '+00:00'
                    elif '+' not in datetime_str and 'T' in datetime_str:
                        datetime_str = datetime_str + '+00:00'
                    fecha = datetime.fromisoformat(datetime_str)
                    return fecha

                # Buscar fechas en texto plano dentro del HTML
                text_match = re.search(r'(\d{1,2})\s+(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)\.\s+(\d{4})', inner_html.lower())
                if text_match:
                    dia = int(text_match.group(1))
                    mes = meses[text_match.group(2)]
                    anio = int(text_match.group(3))
                    return datetime(anio, mes, dia, tzinfo=timezone.utc)
            except Exception as e:
                logger.debug(f"No se pudo extraer fecha del HTML: {e}")
 
            return None
        except Exception as e:
            logger.debug(f"Error extrayendo fecha del tweet: {e}")
            return None
    
    def _is_recent_tweet(self, tweet_date: Optional[datetime], days_threshold: int = 30) -> bool:
        """Verifica si un tweet es reciente (últimos N días o del 2025)"""
        if not tweet_date:
            return False
        
        # Si es del 2025 o posterior, es válido
        if tweet_date.year >= 2025:
            return True
        
        # Si es de los últimos N días, también es válido
        fecha_limite = datetime.now(timezone.utc) - timedelta(days=days_threshold)
        if tweet_date >= fecha_limite:
            return True
        
        return False
    
    def _extract_tweet_data(self, tweet_elem, account: str, idx: int) -> Optional[Dict]:
        """Extrae datos de un tweet y FILTRA solo tweets recientes (2025 o últimos 30 días)"""
        try:
            # Omitir tweets fijados
            if self._is_pinned_tweet(tweet_elem):
                logger.info("⏭️ Tweet fijado detectado, se omite para priorizar contenido reciente")
                return None

            # PRIMERO: Extraer la fecha real del tweet
            tweet_date = self._extract_tweet_date(tweet_elem)

            # FILTRAR: Solo procesar tweets del 2025 o muy recientes (últimos 30 días)
            if not self._is_recent_tweet(tweet_date, days_threshold=30):
                if tweet_date:
                    logger.info(f"⏭️ Tweet filtrado (fecha antigua: {tweet_date.year}): {tweet_date.strftime('%Y-%m-%d')}")
                else:
                    logger.debug(f"⏭️ Tweet filtrado (sin fecha)")
                return None  # Ignorar este tweet

            if not tweet_date:
                logger.debug("⚠️ Tweet sin fecha explícita, se usará fecha actual como respaldo")
            
            # Extraer texto
            tweet_text = None
            
            # Estrategia 1: div con lang
            try:
                text_elem = tweet_elem.find_element(By.CSS_SELECTOR, 'div[lang]')
                tweet_text = text_elem.text
            except NoSuchElementException:
                # Estrategia 2: data-testid="tweetText"
                try:
                    text_elem = tweet_elem.find_element(By.CSS_SELECTOR, '[data-testid="tweetText"]')
                    tweet_text = text_elem.text
                except NoSuchElementException:
                    pass
            
            if not tweet_text or len(tweet_text) < 20:
                return None
            
            # Extraer imagen (buscar imágenes de contenido, no de perfil)
            image_url = None
            try:
                # Buscar todas las imágenes y filtrar las de contenido
                img_elements = tweet_elem.find_elements(By.CSS_SELECTOR, 'img')
                for img in img_elements:
                    src = img.get_attribute('src')
                    alt = img.get_attribute('alt') or ''
                    # Filtrar avatares y emojis
                    if src and 'profile' not in src.lower() and 'avatar' not in src.lower() and 'emoji' not in src.lower():
                        # Verificar que no sea un emoji
                        if len(alt) > 2 or not alt:  # Si tiene alt largo, es imagen de contenido
                            image_url = src
                            break
            except NoSuchElementException:
                pass
            
            # Extraer enlace
            tweet_link = f"https://twitter.com/{account}/status/{idx}"
            try:
                link_elem = tweet_elem.find_element(By.CSS_SELECTOR, 'a[href*="/status/"]')
                href = link_elem.get_attribute('href')
                if href:
                    tweet_link = href
            except NoSuchElementException:
                pass
            
            # Usar la fecha real extraída del tweet, o fecha actual si no se pudo extraer
            if tweet_date:
                fecha_publicacion = tweet_date
                logger.info(f"✅ Tweet reciente encontrado: {fecha_publicacion.strftime('%Y-%m-%d')} - {tweet_text[:50]}...")
            else:
                # Si no se pudo extraer fecha pero pasó el filtro, usar fecha actual
                fecha_publicacion = datetime.now(timezone.utc)
            
            # Clasificar
            categoria = self._classify_tweet(tweet_text)
            
            return {
                'titulo': tweet_text[:200] + ('...' if len(tweet_text) > 200 else ''),
                'contenido': tweet_text,
                'enlace': tweet_link,
                'imagen_url': image_url,
                'categoria': categoria,
                'fecha_publicacion': fecha_publicacion,
                'fecha_extraccion': datetime.now(timezone.utc).isoformat(),
                'diario': 'Twitter',
                'diario_nombre': 'Twitter',
                'autor': f'@{account}'
            }
        
        except Exception as e:
            logger.error(f"❌ Error extrayendo datos del tweet: {e}")
            return None
    
    def _classify_tweet(self, text: str) -> str:
        """Clasifica el tweet en categoría"""
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
    
    def get_all_news(self, use_real=True) -> List[Dict]:
        """Obtiene tweets de todas las cuentas"""
        all_news = []
        
        if not use_real:
            logger.info("📦 Generando tweets (modo mock)")
            for account in self.news_accounts:
                try:
                    logger.info(f"🔍 Generando tweets de @{account}")
                    tweets = self.generate_mock_tweets(account=account, count=2)
                    all_news.extend(tweets)
                    logger.info(f"✅ {len(tweets)} tweets agregados de @{account}")
                except Exception as e:
                    logger.error(f"❌ Error generando tweets de @{account}: {e}")
                    continue
            return all_news
        
        # Modo REAL
        try:
            self._setup_driver()
            logger.info("🚀 Iniciando scraping REAL con Selenium...")
            
            for account in self.news_accounts:
                try:
                    logger.info(f"🔍 Scrapeando @{account}...")
                    # Buscar más tweets para compensar el filtrado (máx 10 recientes por cuenta)
                    tweets = self._scrape_account_real(account, max_tweets=10)
                    all_news.extend(tweets)
                    
                    logger.info(f"✅ {len(tweets)} tweets reales obtenidos de @{account}")
                    time.sleep(3)
                    
                except Exception as e:
                    logger.error(f"❌ Error scrapeando @{account}: {e}")
                    continue
            
            logger.info(f"✅ Total de tweets reales: {len(all_news)}")
        
        finally:
            if self.driver:
                self.driver.quit()
                logger.info("🔌 WebDriver cerrado")
        
        return all_news
    
    def generate_mock_tweets(self, account: str = 'news', count: int = 3) -> List[Dict]:
        """Genera tweets mock"""
        from hashlib import md5
        
        mock_tweets = []
        categories = ['Política', 'Economía', 'Deportes', 'Internacional', 'Tecnología']
        
        for i in range(count):
            unique_id = md5(f'{account}_{i}_{datetime.now().timestamp()}'.encode()).hexdigest()[:10]
            
            mock_tweets.append({
                'titulo': f'🐦 Tweet de @{account} - Noticia #{i+1} del momento',
                'contenido': f'Últimas noticias desde @{account}. Mantente informado con las actualizaciones más relevantes del día. Este es un tweet de prueba generado automáticamente.',
                'enlace': f'https://twitter.com/{account}/status/{unique_id}',
                'imagen_url': f'https://picsum.photos/800/450?random={i}',
                'categoria': categories[i % len(categories)],
                'fecha_publicacion': datetime.now(timezone.utc),
                'fecha_extraccion': datetime.now(timezone.utc).isoformat(),
                'diario': 'Twitter',
                'diario_nombre': 'Twitter',
                'autor': f'@{account}'
            })
        
        return mock_tweets


if __name__ == "__main__":
    print("\n🧪 Probando scraper de Twitter con Selenium...\n")
    scraper = ScraperTwitterSelenium()
    
    print("📦 Modo MOCK:")
    mock_news = scraper.get_all_news(use_real=False)
    print(f"Total mock: {len(mock_news)}\n")

