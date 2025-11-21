import requests
from bs4 import BeautifulSoup
from datetime import datetime
import logging
from typing import List, Dict, Optional, Set
import re
import sys
import os
import time
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from image_extractor import extract_image_from_article
from urllib.parse import urljoin, urlparse

# Configurar logging
logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ScraperCNNFinal:
    """Scraper optimizado para CNN en Español con detección de imágenes únicas"""
    
    def __init__(self):
        self.base_url = 'https://cnnespanol.cnn.com'
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Referer': 'https://cnnespanol.cnn.com/'
        })
        
        # Conjuntos para evitar duplicados
        self.processed_urls: Set[str] = set()
        self.processed_images: Set[str] = set()  # NUEVO: Rastrear imágenes usadas
        
    def _normalize_url(self, url: str) -> str:
        """Normaliza URL eliminando parámetros y fragmentos"""
        if not url:
            return ""
        return url.split('?')[0].split('#')[0]
    
    def _is_valid_article_url(self, url: str) -> bool:
        """Verifica si una URL es de un artículo válido"""
        if not url or 'cnnespanol.cnn.com' not in url:
            return False
        
        # Patrones a rechazar
        invalid_patterns = [
            '/video/', '/videos/', '/galeria/', '/galerias/',
            '/live/', '/en-vivo/', '/autor/', '/author/',
            '/tag/', '/search/', '/buscar/', '/page/',
            '.jpg', '.png', '.pdf', 'javascript:', 'mailto:',
            'facebook.com', 'twitter.com', 'instagram.com'
        ]
        
        url_lower = url.lower()
        if any(pattern in url_lower for pattern in invalid_patterns):
            return False
        
        # Debe tener fecha o ser de sección válida
        has_date = bool(re.search(r'/\d{4}/\d{2}/', url))
        valid_section = any(sec in url_lower for sec in [
            '/mundo/', '/deportes/', '/economia/', 
            '/americas/', '/futbol/', '/negocios/', '/dinero/',
            '/internacional/', '/olimpiadas/'
        ])
        
        return has_date or valid_section
    
    def _is_valid_image_url(self, img_url: str) -> bool:
        """Valida que una URL de imagen sea apropiada"""
        if not img_url or len(img_url) < 20:
            return False
        
        # CRÍTICO: Ya fue usada (evitar duplicados)
        normalized_img = self._normalize_url(img_url)
        if normalized_img in self.processed_images:
            logger.debug(f"⚠️ Imagen ya usada anteriormente: {normalized_img[:60]}...")
            return False
        
        img_lower = img_url.lower()
        
        # Patrones a rechazar
        invalid_patterns = [
            'logo', 'icon', 'avatar', 'sprite', 'placeholder',
            'default', 'blank', '1x1', 'pixel', 'tracking',
            'ad-', 'ads/', 'banner', 'widget', 'social-',
            'share-', 'thumbnail', '/static/', '/assets/'
        ]
        
        if any(pattern in img_lower for pattern in invalid_patterns):
            return False
        
        # Debe tener extensión válida o estar en CDN de imágenes
        valid_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
        has_extension = any(ext in img_lower for ext in valid_extensions)
        is_cdn = 'cdn.cnn.com' in img_lower or 'cloudfront' in img_lower or 'cnn.io' in img_lower
        
        if not (has_extension or is_cdn):
            return False
        
        # Verificar tamaño en URL si está disponible
        size_match = re.search(r'(\d+)x(\d+)', img_lower)
        if size_match:
            width, height = map(int, size_match.groups())
            if width < 300 or height < 200:  # Imágenes muy pequeñas
                logger.debug(f"Imagen rechazada por tamaño: {width}x{height}")
                return False
        
        return True
    
    def _extract_image_from_soup(self, soup: BeautifulSoup, article_url: str) -> Optional[str]:
        """
        Extrae la imagen principal del artículo con validación estricta
        CRÍTICO: Esta es la función clave para evitar duplicados
        """
        try:
            # MÉTODO 1: Meta tags (más confiable)
            meta_tags = [
                ('meta', {'property': 'og:image'}),
                ('meta', {'property': 'twitter:image'}),
                ('meta', {'name': 'twitter:image'}),
                ('meta', {'itemprop': 'image'})
            ]
            
            for tag_name, attrs in meta_tags:
                meta = soup.find(tag_name, attrs)
                if meta:
                    img_url = meta.get('content', '').strip()
                    if img_url and self._is_valid_image_url(img_url):
                        img_url = urljoin(self.base_url, img_url)
                        normalized = self._normalize_url(img_url)
                        self.processed_images.add(normalized)  # Marcar como usada
                        logger.info(f"✅ Imagen encontrada (meta) de {article_url[:60]}...: {normalized[:80]}...")
                        return img_url
            
            # MÉTODO 2: Selectores específicos de CNN
            cnn_image_selectors = [
                'div.image__picture img',
                'div.media__image img',
                'figure.media img',
                'div.Article__media img',
                'div.lead-media img',
                'picture.image__picture img',
                'div.zn-body__image img',
                'article figure:first-of-type img',
                'div.media-image img',
                'div.Article__image img',
                'figure.media__image img'
            ]
            
            for selector in cnn_image_selectors:
                imgs = soup.select(selector)
                for img in imgs:
                    # Buscar en múltiples atributos (prioridad: más específicos primero)
                    img_url = (
                        img.get('data-src-full') or
                        img.get('data-src-large') or
                        img.get('data-src') or
                        img.get('data-lazy-src') or
                        img.get('data-original') or
                        img.get('src')
                    )
                    
                    if not img_url:
                        continue
                    
                    # Limpiar URL (puede venir con srcset)
                    img_url = img_url.split(',')[0].split(' ')[0].strip()
                    
                    # Verificar clases del img (evitar logos, etc.)
                    img_classes = ' '.join(img.get('class', [])).lower()
                    if any(bad in img_classes for bad in ['logo', 'icon', 'avatar']):
                        continue
                    
                    # Verificar dimensiones si están disponibles
                    width = img.get('width', '0')
                    height = img.get('height', '0')
                    try:
                        if width.isdigit() and height.isdigit():
                            if int(width) < 300 or int(height) < 200:
                                continue
                    except:
                        pass
                    
                    if self._is_valid_image_url(img_url):
                        img_url = urljoin(self.base_url, img_url)
                        normalized = self._normalize_url(img_url)
                        self.processed_images.add(normalized)  # Marcar como usada
                        logger.info(f"✅ Imagen encontrada ({selector}) de {article_url[:60]}...: {normalized[:80]}...")
                        return img_url
            
            # MÉTODO 3: Buscar en elementos <picture>
            pictures = soup.find_all('picture', limit=3)
            for picture in pictures:
                # Primero buscar en source
                source = picture.find('source')
                if source:
                    srcset = source.get('srcset', '')
                    if srcset:
                        # Tomar la imagen de mayor resolución
                        img_url = srcset.split(',')[-1].split(' ')[0].strip()
                        if self._is_valid_image_url(img_url):
                            img_url = urljoin(self.base_url, img_url)
                            normalized = self._normalize_url(img_url)
                            self.processed_images.add(normalized)
                            logger.info(f"✅ Imagen encontrada (picture/source) de {article_url[:60]}...: {normalized[:80]}...")
                            return img_url
                
                # Luego en img dentro del picture
                img = picture.find('img')
                if img:
                    img_url = img.get('src') or img.get('data-src')
                    if img_url and self._is_valid_image_url(img_url):
                        img_url = urljoin(self.base_url, img_url)
                        normalized = self._normalize_url(img_url)
                        self.processed_images.add(normalized)
                        logger.info(f"✅ Imagen encontrada (picture/img) de {article_url[:60]}...: {normalized[:80]}...")
                        return img_url
            
            logger.warning(f"⚠️ No se encontró imagen válida para: {article_url[:80]}...")
            return None
            
        except Exception as e:
            logger.error(f"Error extrayendo imagen: {e}")
            return None
    
    def _extract_date_from_article(self, soup: BeautifulSoup, article_url: str) -> Optional[datetime]:
        """Extrae la fecha de publicación del artículo"""
        try:
            # Meta tags de fecha
            date_tags = [
                ('meta', {'property': 'article:published_time'}),
                ('meta', {'property': 'og:published_time'}),
                ('meta', {'name': 'date'}),
                ('meta', {'itemprop': 'datePublished'}),
                ('time', {'datetime': True})
            ]
            
            for tag_name, attrs in date_tags:
                elem = soup.find(tag_name, attrs)
                if elem:
                    date_str = elem.get('content') or elem.get('datetime') or elem.text
                    if date_str:
                        # Intentar parsear
                        for fmt in ['%Y-%m-%dT%H:%M:%S', '%Y-%m-%dT%H:%M:%SZ', '%Y-%m-%d', '%Y/%m/%d']:
                            try:
                                return datetime.strptime(date_str[:19], fmt)
                            except:
                                continue
            
            # Extraer de URL
            date_match = re.search(r'/(\d{4})/(\d{2})/(\d{2})/', article_url)
            if date_match:
                y, m, d = map(int, date_match.groups())
                return datetime(y, m, d)
            
            return None
        except Exception as e:
            logger.warning(f"Error extrayendo fecha: {e}")
            return None
    
    def _extract_content_from_soup(self, soup: BeautifulSoup) -> str:
        """Extrae el contenido del artículo"""
        try:
            # Selectores de contenido
            content_selectors = [
                'div.zn-body__paragraph',
                'div.Article__content',
                'div.article__content',
                'div.story-body',
                'div.article-body',
                'article div.body'
            ]
            
            paragraphs = []
            
            for selector in content_selectors:
                container = soup.select_one(selector)
                if container:
                    ps = container.find_all('p')
                    for p in ps:
                        text = p.get_text(strip=True)
                        if len(text) > 40:  # Párrafos sustanciales
                            paragraphs.append(text)
                    if paragraphs:
                        break
            
            # Fallback: buscar todos los párrafos
            if not paragraphs:
                for p in soup.find_all('p'):
                    text = p.get_text(strip=True)
                    if len(text) > 40:
                        paragraphs.append(text)
            
            content = '\n\n'.join(paragraphs[:10])  # Máximo 10 párrafos
            
            if len(content) > 3000:
                content = content[:3000] + "..."
            
            return content
        except Exception as e:
            logger.warning(f"Error extrayendo contenido: {e}")
            return ""
    
    def _extract_article_data(self, article_url: str, category: str, title: str = None) -> Optional[Dict]:
        """
        Extrae todos los datos de un artículo haciendo UN SOLO REQUEST
        """
        try:
            # Normalizar URL
            normalized_url = self._normalize_url(article_url)
            
            # Evitar duplicados
            if normalized_url in self.processed_urls:
                logger.debug(f"URL ya procesada: {normalized_url}")
                return None
            
            logger.info(f"🔍 Procesando: {normalized_url}")
            
            # UN SOLO REQUEST para todo el artículo
            response = self.session.get(normalized_url, timeout=15)
            response.raise_for_status()
            
            # Manejar encoding correctamente
            response.encoding = response.apparent_encoding or 'utf-8'
            
            # Intentar parsear con diferentes parsers si falla
            try:
                soup = BeautifulSoup(response.content, 'html.parser')
            except Exception as e:
                logger.warning(f"Error con html.parser, intentando lxml: {e}")
                try:
                    soup = BeautifulSoup(response.text, 'lxml')
                except:
                    soup = BeautifulSoup(response.text, 'html5lib')
            
            # Extraer título
            if not title:
                title_elem = (
                    soup.select_one('h1.Article__title') or
                    soup.select_one('h1.headline') or
                    soup.select_one('h1') or
                    soup.find('meta', property='og:title')
                )
                
                if title_elem:
                    if title_elem.name == 'meta':
                        title = title_elem.get('content', '').strip()
                    else:
                        title = title_elem.get_text(strip=True)
            
            # Validar título
            if not title or len(title) < 15:
                logger.warning(f"Título inválido: {normalized_url}")
                return None
            
            # Limpiar título (eliminar " - CNN en Español")
            title = re.sub(r'\s*[-|]\s*CNN.*$', '', title).strip()
            
            # Extraer imagen (FUNCIÓN MEJORADA - evita duplicados)
            imagen_url = self._extract_image_from_soup(soup, normalized_url)
            
            # Si no encontramos imagen en el soup, intentar con el extractor completo como fallback
            if not imagen_url:
                imagen_url = extract_image_from_article(normalized_url, self.base_url, self.session)
                if imagen_url:
                    normalized_img = self._normalize_url(imagen_url)
                    if normalized_img not in self.processed_images:
                        self.processed_images.add(normalized_img)
                    else:
                        logger.warning(f"⚠️ Imagen del extractor ya fue usada: {normalized_img[:60]}...")
                        imagen_url = None
            
            # Extraer contenido
            content = self._extract_content_from_soup(soup)
            if not content or len(content) < 50:
                content = f"Noticia de {category} de CNN en Español. Visita el enlace para más información."
            
            # Extraer fecha
            fecha_pub = self._extract_date_from_article(soup, normalized_url)
            if not fecha_pub:
                fecha_pub = datetime.now()
            
            # Marcar como procesada
            self.processed_urls.add(normalized_url)
            
            logger.info(f"✅ [{category}] {title[:50]}... | Imagen: {'Sí' if imagen_url else 'No'}")
            
            return {
                'titulo': title,
                'contenido': content,
                'enlace': normalized_url,
                'imagen_url': imagen_url or '',
                'categoria': category,
                'diario': 'CNN en Español',
                'fecha_publicacion': fecha_pub.date() if isinstance(fecha_pub, datetime) else fecha_pub,
                'fecha_extraccion': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error procesando {article_url}: {e}")
            return None
    
    def extract_news_from_page(self, url: str, category: str, max_articles: int = 20) -> List[Dict]:
        """Extrae noticias de una página de listado"""
        noticias = []
        
        try:
            logger.info(f"📰 Extrayendo de: {url} ({category})")
            
            response = self.session.get(url, timeout=15)
            response.raise_for_status()
            
            # Manejar encoding correctamente
            response.encoding = response.apparent_encoding or 'utf-8'
            
            # Intentar parsear con diferentes parsers si falla
            try:
                soup = BeautifulSoup(response.content, 'html.parser')
            except Exception as e:
                logger.warning(f"Error con html.parser, intentando lxml: {e}")
                try:
                    soup = BeautifulSoup(response.text, 'lxml')
                except:
                    soup = BeautifulSoup(response.text, 'html5lib')
            
            # Buscar enlaces de artículos
            links = soup.find_all('a', href=True)
            
            article_urls = []
            for link in links:
                href = link.get('href', '').strip()
                if not href:
                    continue
                
                # Construir URL completa
                if href.startswith('/'):
                    full_url = self.base_url + href
                elif href.startswith('http') and 'cnnespanol.cnn.com' in href:
                    full_url = href
                else:
                    continue
                
                # Normalizar
                normalized = self._normalize_url(full_url)
                
                # Validar
                if not self._is_valid_article_url(normalized):
                    continue
                
                if normalized in self.processed_urls:
                    continue
                
                # Extraer título del enlace
                title = link.get_text(strip=True)
                
                # Filtrar títulos inválidos
                if (
                    len(title) < 15 or len(title) > 250 or
                    title.lower() in ['ver más', 'leer más', 'cnn', 'siguiente', 'anterior', 'compartir', 'comentar'] or
                    title.isdigit() or
                    len(title.split()) < 4
                ):
                    continue
                
                article_urls.append((normalized, title))
            
            logger.info(f"Encontrados {len(article_urls)} enlaces válidos")
            
            # Procesar artículos (limitado)
            for art_url, art_title in article_urls[:max_articles]:
                article_data = self._extract_article_data(art_url, category, art_title)
                if article_data:
                    noticias.append(article_data)
                    time.sleep(0.5)  # Rate limiting
            
            logger.info(f"✅ Extraídas {len(noticias)} noticias de {category}")
            return noticias
            
        except Exception as e:
            logger.error(f"Error en {url}: {e}")
            return []
    
    def get_mundo(self, max_per_section: int = 15) -> List[Dict]:
        """Extrae noticias de Mundo"""
        noticias = []
        urls = [
            f"{self.base_url}/mundo/",
            f"{self.base_url}/americas/",
            f"{self.base_url}/internacional/"
        ]
        
        for url in urls:
            noticias.extend(self.extract_news_from_page(url, 'Mundo', max_per_section))
        
        return noticias
    
    def get_deportes(self, max_per_section: int = 15) -> List[Dict]:
        """Extrae noticias de Deportes"""
        noticias = []
        urls = [
            f"{self.base_url}/deportes/",
            f"{self.base_url}/futbol/",
            f"{self.base_url}/olimpiadas/"
        ]
        
        for url in urls:
            noticias.extend(self.extract_news_from_page(url, 'Deportes', max_per_section))
        
        return noticias
    
    def get_economia(self, max_per_section: int = 15) -> List[Dict]:
        """Extrae noticias de Economía"""
        noticias = []
        urls = [
            f"{self.base_url}/economia/",
            f"{self.base_url}/negocios/",
            f"{self.base_url}/dinero/"
        ]
        
        for url in urls:
            noticias.extend(self.extract_news_from_page(url, 'Economía', max_per_section))
        
        return noticias
    
    def get_all_news(self) -> List[Dict]:
        """Obtiene todas las noticias"""
        # Reset al inicio de cada scraping completo
        self.processed_urls.clear()
        self.processed_images.clear()
        
        logger.info("🚀 Iniciando scraping de CNN en Español...")
        
        all_news = []
        all_news.extend(self.get_mundo())
        all_news.extend(self.get_deportes())
        all_news.extend(self.get_economia())
        
        # Estadísticas de imágenes
        with_images = sum(1 for n in all_news if n['imagen_url'])
        
        # Verificar duplicados de imágenes
        image_urls = [n['imagen_url'] for n in all_news if n['imagen_url']]
        unique_images = len(set(image_urls))
        duplicates = len(image_urls) - unique_images
        
        logger.info(f"📊 Total: {len(all_news)} noticias | Con imágenes: {with_images}/{len(all_news)}")
        if duplicates > 0:
            logger.warning(f"⚠️ ADVERTENCIA: {duplicates} imágenes duplicadas detectadas")
        else:
            logger.info(f"✅ Sin imágenes duplicadas - Todas las imágenes son únicas")
        
        return all_news


if __name__ == "__main__":
    scraper = ScraperCNNFinal()
    noticias = scraper.get_all_news()
    
    print(f"\n{'='*60}")
    print(f"RESUMEN FINAL")
    print(f"{'='*60}")
    print(f"Total de noticias: {len(noticias)}")
    
    # Por categoría
    cats = {}
    imgs = 0
    for n in noticias:
        cats[n['categoria']] = cats.get(n['categoria'], 0) + 1
        if n['imagen_url']:
            imgs += 1
    
    print(f"\nPor categoria:")
    for cat, count in cats.items():
        print(f"  - {cat}: {count} noticias")
    
    percentage = (imgs/len(noticias)*100) if len(noticias) > 0 else 0
    print(f"\nCon imagenes: {imgs}/{len(noticias)} ({percentage:.1f}%)")
    
    # Verificar duplicados de imágenes
    image_urls = [n['imagen_url'] for n in noticias if n['imagen_url']]
    duplicates = len(image_urls) - len(set(image_urls))
    if duplicates > 0:
        print(f"\nADVERTENCIA: {duplicates} imagenes duplicadas detectadas")
        # Mostrar duplicados
        from collections import Counter
        img_counts = Counter(image_urls)
        print("\nImagenes duplicadas:")
        for img_url, count in img_counts.items():
            if count > 1:
                print(f"  - {img_url[:70]}... ({count} veces)")
    else:
        print(f"\nOK: Sin imagenes duplicadas - Todas las imagenes son unicas")
    
    print(f"\nEjemplos:")
    for i, n in enumerate(noticias[:5], 1):
        print(f"{i}. [{n['categoria']}] {n['titulo'][:60]}...")
        print(f"   Imagen: {'SI' if n['imagen_url'] else 'NO'}")
        if n['imagen_url']:
            print(f"   URL: {n['imagen_url'][:70]}...")
