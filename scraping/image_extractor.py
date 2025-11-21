"""
Módulo para extraer imágenes de artículos de manera precisa.
Asegura que cada noticia tenga su propia imagen correcta.
"""
import requests
from bs4 import BeautifulSoup
from typing import Optional
import logging
import re
from urllib.parse import urljoin

logger = logging.getLogger(__name__)


def extract_image_from_article(article_url: str, base_url: str = None, session: requests.Session = None) -> Optional[str]:
    """
    Extrae la imagen principal de un artículo visitando su URL individual.
    Esto asegura que cada noticia tenga su propia imagen correcta.
    
    Args:
        article_url: URL completa del artículo
        base_url: URL base del sitio (para normalizar URLs relativas)
        session: Sesión de requests para reutilizar conexiones
        
    Returns:
        URL de la imagen o None si no se encuentra
    """
    if not article_url:
        return None
    
    try:
        # Crear sesión si no se proporciona
        if session is None:
            session = requests.Session()
            session.headers.update({
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
            })
        
        # Hacer request al artículo individual
        response = session.get(article_url, timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # ESTRATEGIA 1: Buscar meta tags (más confiables) - PRIORIDAD MÁXIMA
        meta_selectors = [
            ('meta', {'property': 'og:image'}),
            ('meta', {'name': 'og:image'}),
            ('meta', {'property': 'twitter:image'}),
            ('meta', {'name': 'twitter:image'}),
            ('meta', {'itemprop': 'image'}),
            ('link', {'rel': 'image_src'})
        ]
        
        for tag_name, attrs in meta_selectors:
            meta = soup.find(tag_name, attrs)
            if meta:
                img_url = meta.get('content') or meta.get('href')
                if img_url and _is_valid_image_url(img_url):
                    normalized = _normalize_image_url(img_url, base_url or article_url)
                    logger.info(f"✅ Imagen encontrada en meta tag de {article_url[:80]}...: {normalized[:100]}...")
                    return normalized
        
        # ESTRATEGIA 2: Selectores específicos para CNN en Español (PRIORITARIOS)
        cnn_selectors = [
            # Selectores específicos de CNN
            'div.media__image img',
            'div.media-image img',
            'div.Article__image img',
            'div.article-image img',
            'figure.media__image img',
            'figure.media-image img',
            'div.zn-body__image img',
            'div.zn-body__read-all img',
            'div[class*="Article"] img[class*="image"]',
            'div[class*="article"] img[class*="image"]',
            'div[class*="media"] img[class*="image"]',
            'div[class*="story"] img[class*="image"]',
            # Imágenes dentro del contenido principal del artículo
            'article div.media img',
            'article div.Article img',
            'article figure img',
            'div.zn-body__paragraph img',
            'div.zn-body__read-all img',
            # Selectores con data attributes comunes en CNN
            'img[data-src]',
            'img[data-lazy-src]',
            'img[data-original]'
        ]
        
        for selector in cnn_selectors:
            imgs = soup.select(selector)
            for img in imgs:
                img_url = (img.get('src') or 
                          img.get('data-src') or 
                          img.get('data-lazy-src') or 
                          img.get('data-original'))
                if img_url and _is_valid_image_url(img_url) and 'default' not in img_url.lower():
                    # Verificar que no sea un logo o icono pequeño
                    img_class = ' '.join(img.get('class', [])).lower()
                    if any(skip in img_class for skip in ['logo', 'icon', 'avatar', 'sprite']):
                        continue
                    normalized = _normalize_image_url(img_url, base_url or article_url)
                    logger.info(f"✅ Imagen CNN encontrada con selector '{selector}' de {article_url[:80]}...: {normalized[:100]}...")
                    return normalized
        
        # ESTRATEGIA 3: Buscar imágenes destacadas en el contenido principal (fallback genérico)
        # Selectores específicos por diario (ordenados por prioridad)
        featured_selectors = [
            # Selectores específicos de Diario Correo
            'div.entry-image img',
            'div.post-image img',
            'div.featured-image img',
            'figure.wp-caption img',
            'div.imagen-principal img',
            'div.img-container img',
            'div[class*="img-"] img',
            'div[class*="image-"] img',
            # Imágenes en contenedores específicos de El Comercio
            'div.story-image img',
            'div.story__image img',
            'div.article-image img',
            'div.article__image img',
            'div.media-image img',
            'div.media__image img',
            'figure.story-image img',
            'figure.article-image img',
            'div[class*="story-image"] img',
            'div[class*="story__image"] img',
            'div[class*="article-image"] img',
            'div[class*="article__image"] img',
            'div[class*="media-image"] img',
            'div[class*="media__image"] img',
            # Imágenes con clases específicas
            'img[class*="story-image"]',
            'img[class*="story__image"]',
            'img[class*="article-image"]',
            'img[class*="article__image"]',
            'img[class*="media-image"]',
            'img[class*="media__image"]',
            'img[class*="entry-image"]',
            'img[class*="post-image"]',
            # Selectores genéricos pero prioritarios
            'img[class*="featured"]',
            'img[class*="main"]',
            'img[class*="hero"]',
            'img[class*="principal"]',
            'img[class*="destacada"]',
            'img[class*="article"]',
            'img[class*="story"]',
            '.featured-image img',
            '.main-image img',
            '.hero-image img',
            '.article-image img',
            '.entry-image img',
            '.post-image img',
            'article img:first-of-type',
            'div[class*="featured"] img',
            'div[class*="hero"] img',
            'figure img:first-of-type'
        ]
        
        for selector in featured_selectors:
            img = soup.select_one(selector)
            if img:
                img_url = (img.get('src') or 
                          img.get('data-src') or 
                          img.get('data-lazy-src') or 
                          img.get('data-original'))
                if img_url and _is_valid_image_url(img_url) and 'default' not in img_url.lower():
                    normalized = _normalize_image_url(img_url, base_url or article_url)
                    logger.debug(f"✅ Imagen encontrada con selector '{selector}': {normalized[:80]}...")
                    return normalized
        
        # ESTRATEGIA 4: Buscar en srcset (para imágenes responsivas)
        img_with_srcset = soup.find('img', srcset=True)
        if img_with_srcset:
            srcset = img_with_srcset.get('srcset', '')
            if srcset:
                # Extraer la URL más grande del srcset
                urls = re.findall(r'([^\s,]+)(?:\s+\d+[wx])?', srcset)
                for url in urls:
                    if _is_valid_image_url(url) and 'default' not in url.lower():
                        normalized = _normalize_image_url(url, base_url or article_url)
                        logger.debug(f"✅ Imagen encontrada en srcset: {normalized[:80]}...")
                        return normalized
        
        # ESTRATEGIA 5: Buscar primera imagen grande en el contenido del artículo (último recurso)
        # Buscar en el contenido del artículo de forma genérica
        article_content = soup.find('article') or soup.find('div', class_=lambda x: x and ('content' in str(x).lower() or 'article' in str(x).lower() or 'story' in str(x).lower() or 'zn-body' in str(x).lower()))
        if article_content:
            images = article_content.find_all('img')
            # Priorizar imágenes grandes y con atributos específicos
            for img in images:
                img_url = img.get('src') or img.get('data-src') or img.get('data-lazy-src') or img.get('data-original')
                if img_url and _is_valid_image_url(img_url) and 'default' not in img_url.lower():
                    # Verificar que no sea un logo o icono
                    img_class = ' '.join(img.get('class', [])).lower()
                    if any(skip in img_class for skip in ['logo', 'icon', 'avatar', 'sprite', 'placeholder']):
                        continue
                    
                    # Verificar dimensiones si están disponibles
                    width = img.get('width')
                    height = img.get('height')
                    if width and height:
                        try:
                            w, h = int(width), int(height)
                            if w > 200 and h > 200:  # Imágenes grandes
                                normalized = _normalize_image_url(img_url, base_url or article_url)
                                logger.debug(f"✅ Imagen grande encontrada en contenido: {normalized[:80]}...")
                                return normalized
                        except (ValueError, TypeError):
                            pass
                    
                    # Si no tiene dimensiones pero parece válida, usar de todos modos
                    normalized = _normalize_image_url(img_url, base_url or article_url)
                    logger.debug(f"✅ Imagen encontrada en contenido (sin dimensiones): {normalized[:80]}...")
                    return normalized
        
        logger.warning(f"⚠️ No se encontró imagen para {article_url[:80]}...")
        return None
        
    except requests.exceptions.RequestException as e:
        logger.warning(f"Error al obtener imagen de {article_url}: {e}")
        return None
    except Exception as e:
        logger.warning(f"Error extrayendo imagen de {article_url}: {e}")
        return None


def extract_image_from_element(element, article_url: str = None, base_url: str = None, session: requests.Session = None) -> Optional[str]:
    """
    Extrae imagen de un elemento HTML (fallback si no se puede obtener del artículo).
    Si se proporciona article_url, intenta obtener la imagen del artículo primero.
    
    Args:
        element: Elemento BeautifulSoup
        article_url: URL del artículo (opcional, para obtener imagen precisa)
        base_url: URL base del sitio
        session: Sesión de requests para reutilizar conexiones
        
    Returns:
        URL de la imagen o None
    """
    # PRIORIDAD 1: Si tenemos la URL del artículo, SIEMPRE intentar obtener la imagen precisa del artículo
    # Esto asegura que cada noticia tenga su propia imagen correcta
    if article_url:
        try:
            precise_image = extract_image_from_article(article_url, base_url, session)
            if precise_image and 'default' not in precise_image.lower():
                logger.info(f"✅ Imagen encontrada en artículo individual: {article_url[:80]}...")
                return precise_image
            elif precise_image:
                logger.warning(f"⚠️ Imagen por defecto encontrada en artículo individual, buscando alternativa: {article_url[:80]}...")
            else:
                logger.warning(f"⚠️ No se encontró imagen en artículo individual: {article_url[:80]}...")
        except Exception as e:
            logger.warning(f"Error obteniendo imagen del artículo {article_url[:80]}...: {e}")
    
    # PRIORIDAD 2: Fallback - buscar imagen específica en el elemento del listado
    # Buscar solo en el elemento específico del artículo, no en elementos padre
    if not element:
        return None
    
    # Buscar imagen directamente en el elemento y sus hijos inmediatos
    # Evitar buscar en elementos padre que puedan tener imágenes compartidas
    
    # Primero buscar en hijos directos (más específico)
    img_elem = element.find('img', recursive=False)
    
    # Si no hay hijos directos, buscar recursivamente pero priorizar imágenes grandes
    if not img_elem:
        all_imgs = element.find_all('img')
        for img in all_imgs:
            # Priorizar imágenes con clases específicas de El Comercio
            img_class = img.get('class', [])
            class_str = ' '.join(img_class).lower() if img_class else ''
            
            # Buscar imágenes con clases relacionadas a artículos
            if any(keyword in class_str for keyword in ['story', 'article', 'media', 'image', 'photo', 'picture']):
                img_elem = img
                break
        
        # Si aún no hay, usar la primera imagen encontrada
        if not img_elem and all_imgs:
            img_elem = all_imgs[0]
    
    if img_elem:
        # Intentar múltiples atributos para obtener la URL de la imagen
        img_url = (img_elem.get('src') or 
                  img_elem.get('data-src') or 
                  img_elem.get('data-lazy-src') or 
                  img_elem.get('data-original') or
                  img_elem.get('data-image') or
                  img_elem.get('data-lazy') or
                  img_elem.get('srcset'))
        
        # Si es srcset, extraer la primera URL
        if img_url and ' ' in img_url and ('w' in img_url or 'x' in img_url):
            # Es un srcset, extraer la URL más grande
            import re
            urls = re.findall(r'([^\s,]+)(?:\s+\d+[wx])?', img_url)
            if urls:
                img_url = urls[-1]  # La última suele ser la más grande
        
        if img_url and _is_valid_image_url(img_url) and 'default' not in img_url.lower():
            normalized_url = _normalize_image_url(img_url, base_url)
            logger.info(f"✅ Imagen encontrada en elemento del listado: {normalized_url[:80]}...")
            return normalized_url
        elif img_url and 'default' in img_url.lower():
            logger.debug(f"⚠️ Imagen por defecto ignorada del listado: {img_url[:80]}...")
    
    logger.warning(f"⚠️ No se encontró imagen ni en artículo ni en elemento para: {article_url or 'elemento'}")
    return None


def _is_valid_image_url(url: str) -> bool:
    """Verifica si una URL es de una imagen válida"""
    if not url:
        return False
    
    # Excluir URLs que claramente no son imágenes o son placeholders
    invalid_patterns = [
        'logo', 'icon', 'avatar', 'sprite', 'placeholder',
        '1x1', 'pixel', 'tracking', 'beacon', 'analytics',
        'data:image/svg', 'base64',
        'default-md.png', 'default.png', 'default.jpg',  # Imágenes por defecto de El Comercio
        '/resources/dist/elcomercio/images/default'  # Ruta de imágenes por defecto
    ]
    
    url_lower = url.lower()
    for pattern in invalid_patterns:
        if pattern in url_lower:
            return False
    
    # Verificar extensiones de imagen válidas
    valid_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    if any(url_lower.endswith(ext) for ext in valid_extensions):
        return True
    
    # Si no tiene extensión pero parece una URL de imagen (contiene /image/ o similar)
    if '/image/' in url_lower or '/img/' in url_lower or '/photo/' in url_lower:
        return True
    
    return False


def _normalize_image_url(url: str, base_url: str = None) -> str:
    """Normaliza una URL de imagen a formato absoluto"""
    if not url:
        return ""
    
    # Si ya es absoluta, retornar tal cual
    if url.startswith('http://') or url.startswith('https://'):
        return url
    
    # Si empieza con //, agregar https:
    if url.startswith('//'):
        return 'https:' + url
    
    # Si tenemos base_url, construir URL completa
    if base_url:
        return urljoin(base_url, url)
    
    return url

