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
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            })
        
        # Hacer request al artículo individual
        response = session.get(article_url, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # ESTRATEGIA 1: Buscar meta tags (más confiables)
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
                    return _normalize_image_url(img_url, base_url or article_url)
        
        # ESTRATEGIA 2: Buscar imágenes destacadas en el contenido principal
        featured_selectors = [
            'img[class*="featured"]',
            'img[class*="main"]',
            'img[class*="hero"]',
            'img[class*="principal"]',
            'img[class*="article"]',
            'img[class*="story"]',
            '.featured-image img',
            '.main-image img',
            '.hero-image img',
            '.article-image img',
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
                if img_url and _is_valid_image_url(img_url):
                    return _normalize_image_url(img_url, base_url or article_url)
        
        # ESTRATEGIA 3: Buscar en srcset (para imágenes responsivas)
        img_with_srcset = soup.find('img', srcset=True)
        if img_with_srcset:
            srcset = img_with_srcset.get('srcset', '')
            if srcset:
                # Extraer la URL más grande del srcset
                urls = re.findall(r'([^\s,]+)(?:\s+\d+[wx])?', srcset)
                for url in urls:
                    if _is_valid_image_url(url):
                        return _normalize_image_url(url, base_url or article_url)
        
        # ESTRATEGIA 4: Buscar primera imagen grande en el contenido del artículo
        article_content = soup.find('article') or soup.find('div', class_=lambda x: x and ('content' in str(x).lower() or 'article' in str(x).lower()))
        if article_content:
            images = article_content.find_all('img')
            for img in images:
                img_url = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
                if img_url and _is_valid_image_url(img_url):
                    # Verificar que no sea un logo o icono pequeño
                    width = img.get('width')
                    height = img.get('height')
                    if width and height:
                        try:
                            w, h = int(width), int(height)
                            if w > 200 and h > 200:  # Imágenes grandes
                                return _normalize_image_url(img_url, base_url or article_url)
                        except (ValueError, TypeError):
                            pass
                    # Si no tiene dimensiones, usar de todos modos si parece válida
                    return _normalize_image_url(img_url, base_url or article_url)
        
        logger.warning(f"No se encontró imagen para {article_url}")
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
    # Si tenemos la URL del artículo, intentar obtener la imagen precisa primero
    if article_url:
        precise_image = extract_image_from_article(article_url, base_url, session)
        if precise_image:
            return precise_image
    
    # Fallback: buscar imagen en el elemento
    if not element:
        return None
    
    # Buscar imagen en el elemento y sus hijos directos
    img_elem = element.find('img')
    if img_elem:
        img_url = (img_elem.get('src') or 
                  img_elem.get('data-src') or 
                  img_elem.get('data-lazy-src') or 
                  img_elem.get('data-original'))
        if img_url and _is_valid_image_url(img_url):
            return _normalize_image_url(img_url, base_url)
    
    return None


def _is_valid_image_url(url: str) -> bool:
    """Verifica si una URL es de una imagen válida"""
    if not url:
        return False
    
    # Excluir URLs que claramente no son imágenes
    invalid_patterns = [
        'logo', 'icon', 'avatar', 'sprite', 'placeholder',
        '1x1', 'pixel', 'tracking', 'beacon', 'analytics',
        'data:image/svg', 'base64'
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

