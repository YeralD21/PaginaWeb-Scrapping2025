import requests
from bs4 import BeautifulSoup
from datetime import datetime
import logging
from typing import List, Dict, Optional, Set
import sys
import os
from urllib.parse import urlparse, urlunparse
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'backend'))
from image_extractor import extract_image_from_element
from date_extraction_utils import get_publication_date

class ScraperPopularImproved:
    def __init__(self):
        self.base_url = 'https://elpopular.pe'
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.processed_urls: Set[str] = set()
    
    def get_full_article_content(self, article_url: str) -> str:
        """Extrae el contenido completo de un artículo individual"""
        try:
            if not article_url:
                return ""
            
            response = self.session.get(article_url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Buscar el contenido principal del artículo
            content_selectors = [
                'div.article-content',
                'div.entry-content', 
                'div.post-content',
                'div.content',
                'article div',
                'div.story-body',
                'div.article-body',
                '.main-content p',
                'div[class*="content"] p',
                'article p'
            ]
            
            content_paragraphs = []
            
            for selector in content_selectors:
                elements = soup.select(selector)
                if elements:
                    for element in elements:
                        paragraphs = element.find_all('p')
                        for p in paragraphs:
                            text = p.get_text(strip=True)
                            if text and len(text) > 30:
                                content_paragraphs.append(text)
                    
                    if content_paragraphs:
                        break
            
            # Si no encontramos contenido con los selectores, buscar todos los párrafos
            if not content_paragraphs:
                all_paragraphs = soup.find_all('p')
                for p in all_paragraphs:
                    text = p.get_text(strip=True)
                    if text and len(text) > 30:
                        content_paragraphs.append(text)
            
            # Unir los párrafos y limpiar
            full_content = '\n\n'.join(content_paragraphs)
            
            # Limitar longitud para evitar contenido excesivo
            if len(full_content) > 3000:
                full_content = full_content[:3000] + "..."
            
            return full_content
            
        except Exception as e:
            logging.warning(f"Error extrayendo contenido completo de {article_url}: {e}")
            return ""
    
    def _normalize_url(self, url: str) -> str:
        """Normaliza una URL eliminando parámetros de consulta y fragmentos para detectar duplicados"""
        if not url:
            return ""
        try:
            parsed = urlparse(url)
            # Reconstruir URL sin query params ni fragment
            normalized = urlunparse((
                parsed.scheme,
                parsed.netloc,
                parsed.path,
                parsed.params,
                '',  # Sin query params
                ''   # Sin fragment
            ))
            return normalized.rstrip('/')
        except Exception:
            return url
    
    def _is_duplicate(self, url: str) -> bool:
        """Verifica si una URL ya fue procesada"""
        normalized = self._normalize_url(url)
        if normalized in self.processed_urls:
            return True
        self.processed_urls.add(normalized)
        return False
    
    def _find_image_url(self, element, article_url: str = None) -> Optional[str]:
        """Busca la URL de imagen en un elemento usando el extractor mejorado"""
        try:
            return extract_image_from_element(element, article_url=article_url, base_url=self.base_url, session=self.session)
        except Exception:
            return None
    
    def extract_news_from_page(self, url: str, category: str, max_articles: int = 20) -> List[Dict]:
        """Extrae noticias de una página específica con paginación"""
        noticias = []
        
        try:
            # Intentar múltiples páginas
            for page in range(1, 4):  # 3 páginas máximo
                try:
                    if page == 1:
                        page_url = url
                    else:
                        # Diferentes formatos de paginación para El Popular
                        if '?' in url:
                            page_url = f"{url}&page={page}"
                        else:
                            page_url = f"{url}?page={page}"
                    
                    response = self.session.get(page_url, timeout=10)
                    response.raise_for_status()
                    
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Buscar artículos con selectores más amplios
                    articles = (soup.find_all('article') or 
                               soup.find_all('div', class_=lambda x: x and ('story' in x.lower() or 'item' in x.lower() or 'post' in x.lower())) or
                               soup.find_all('div', class_='news-item') or
                               soup.find_all('div', class_='article-item'))
                    
                    if not articles:
                        # Si no encuentra artículos, buscar enlaces que parecen noticias
                        links = soup.find_all('a', href=True)
                        for link in links[:max_articles]:
                            try:
                                href = link.get('href', '')
                                if not href or 'elpopular.pe' not in href:
                                    continue
                                
                                title = link.get_text(strip=True)
                                if len(title) < 15 or len(title) > 200:
                                    continue
                                
                                # Construir URL completa
                                if href.startswith('/'):
                                    full_url = self.base_url + href
                                else:
                                    full_url = href
                                
                                # Verificar duplicados antes de procesar
                                if self._is_duplicate(full_url):
                                    logging.debug(f"⚠️ URL duplicada omitida: {full_url}")
                                    continue
                                
                                # Buscar imagen usando el extractor mejorado
                                imagen_url = self._find_image_url(link, article_url=full_url)
                                
                                # Extraer contenido
                                print(f"🔍 Extrayendo contenido de El Popular: {full_url}")
                                content = self.get_full_article_content(full_url)
                                
                                if not content:
                                    content = f"Noticia de {category} de El Popular. Para más información, visita el enlace completo."
                                
                                noticias.append({
                                    'titulo': title,
                                    'contenido': content,
                                    'enlace': full_url,
                                    'imagen_url': imagen_url,
                                    'categoria': category,
                                    'diario': 'El Popular',
                                    'fecha_publicacion': datetime.now().date(),
                                    'fecha_extraccion': datetime.now().isoformat()
                                })
                                
                            except Exception as e:
                                logging.warning(f"Error procesando enlace: {e}")
                                continue
                    else:
                        # Procesar artículos encontrados
                        for article in articles[:max_articles]:
                            try:
                                title_elem = (article.find('h2') or 
                                             article.find('h3') or 
                                             article.find('h1') or
                                             article.find('a'))
                                
                                if not title_elem:
                                    continue
                                
                                title = title_elem.get_text(strip=True)
                                if len(title) < 15 or len(title) > 200:
                                    continue
                                
                                link_elem = article.find('a')
                                link = link_elem.get('href') if link_elem else None
                                
                                if link and not link.startswith('http'):
                                    link = self.base_url + link
                                
                                # Verificar duplicados antes de procesar
                                if not link or self._is_duplicate(link):
                                    if link:
                                        logging.debug(f"⚠️ URL duplicada omitida: {link}")
                                    continue
                                
                                # Extraer contenido completo del artículo
                                print(f"🔍 Extrayendo contenido de El Popular: {link}")
                                content = self.get_full_article_content(link)
                                
                                # Si no se pudo obtener contenido completo, usar resumen local
                                if not content:
                                    content_elem = article.find('p') or article.find('div', class_='summary')
                                    content = content_elem.get_text(strip=True) if content_elem else ""
                                
                                # Buscar imagen usando la función mejorada
                                imagen_url = self._find_image_url(article, article_url=link)
                                
                                # Extraer fecha de publicación real
                                fecha_publicacion = get_publication_date(article, 'El Popular')
                                
                                noticias.append({
                                    'titulo': title,
                                    'contenido': content,
                                    'enlace': link,
                                    'imagen_url': imagen_url,
                                    'categoria': category,
                                    'diario': 'El Popular',
                                    'fecha_publicacion': fecha_publicacion if fecha_publicacion else datetime.now().date(),
                                    'fecha_extraccion': datetime.now().isoformat()
                                })
                            except Exception as e:
                                logging.warning(f"Error procesando artículo de {category}: {e}")
                                continue
                    
                    # Si no hay más artículos en esta página, salir del bucle
                    if len(articles) < 5 and page > 1:
                        break
                        
                except Exception as e:
                    logging.warning(f"Error obteniendo página {page} de {url}: {e}")
                    continue
                    
            return noticias
            
        except Exception as e:
            logging.error(f"Error obteniendo {category} de El Popular: {e}")
            return []
    
    def get_deportes(self) -> List[Dict]:
        """Extrae noticias de la sección Deportes con múltiples URLs"""
        noticias = []
        
        # URLs específicas de deportes
        urls = [
            f"{self.base_url}/deportes/",
            f"{self.base_url}/futbol/",
            f"{self.base_url}/deportes/futbol/",
            f"{self.base_url}/deportes/otros-deportes/"
        ]
        
        for url in urls:
            section_noticias = self.extract_news_from_page(url, 'Deportes', max_articles=15)
            noticias.extend(section_noticias)
        
        return noticias
    
    def get_espectaculos(self) -> List[Dict]:
        """Extrae noticias de la sección Espectáculos con múltiples URLs"""
        noticias = []
        
        # URLs específicas de espectáculos
        urls = [
            f"{self.base_url}/espectaculos/",
            f"{self.base_url}/entretenimiento/",
            f"{self.base_url}/espectaculos/farandula/"
        ]
        
        for url in urls:
            section_noticias = self.extract_news_from_page(url, 'Espectáculos', max_articles=15)
            noticias.extend(section_noticias)
        
        return noticias
    
    def get_mundo(self) -> List[Dict]:
        """Extrae noticias de la sección Mundo con múltiples URLs"""
        noticias = []
        
        # URLs específicas de mundo
        urls = [
            f"{self.base_url}/mundo/",
            f"{self.base_url}/internacional/",
            f"{self.base_url}/mundo/internacional/"
        ]
        
        for url in urls:
            section_noticias = self.extract_news_from_page(url, 'Mundo', max_articles=15)
            noticias.extend(section_noticias)
        
        return noticias
    
    def get_all_news(self) -> List[Dict]:
        """Obtiene todas las noticias de todas las categorías"""
        # Limpiar URLs procesadas al inicio de cada ejecución completa
        self.processed_urls.clear()
        
        all_news = []
        all_news.extend(self.get_deportes())
        all_news.extend(self.get_espectaculos())
        all_news.extend(self.get_mundo())
        
        # Estadísticas de duplicados
        total_processed = len(self.processed_urls)
        logging.info(f"📊 El Popular: {len(all_news)} noticias únicas procesadas de {total_processed} URLs encontradas")
        
        return all_news

if __name__ == "__main__":
    scraper = ScraperPopularImproved()
    noticias = scraper.get_all_news()
    print(f"Total de noticias extraídas: {len(noticias)}")
    
    # Mostrar estadísticas por categoría
    categorias = {}
    for noticia in noticias:
        cat = noticia['categoria']
        categorias[cat] = categorias.get(cat, 0) + 1
    
    print("\n📊 Por categoría:")
    for cat, count in categorias.items():
        print(f"  • {cat}: {count} noticias")
    
    for noticia in noticias[:3]:
        print(f"- {noticia['categoria']}: {noticia['titulo']}")
