import requests
from bs4 import BeautifulSoup
from datetime import datetime
import logging
from typing import List, Dict
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from image_extractor import extract_image_from_element

class ScraperComercio:
    def __init__(self):
        self.base_url = 'https://elcomercio.pe'
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
    
    def get_full_article_content(self, article_url: str) -> str:
        """Extrae el contenido completo de un artículo individual de El Comercio"""
        try:
            if not article_url:
                return ""
            
            response = self.session.get(article_url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Selectores específicos para El Comercio
            content_selectors = [
                'div.story-contents',
                'div.story-body', 
                'div.article-body',
                'div.entry-content',
                'div.post-content',
                'div[class*="story"] p',
                'div[class*="article"] p',
                'div[class*="content"] p',
                'article p',
                '.main p'
            ]
            
            content_paragraphs = []
            
            for selector in content_selectors:
                elements = soup.select(selector)
                if elements:
                    for element in elements:
                        paragraphs = element.find_all('p')
                        for p in paragraphs:
                            text = p.get_text(strip=True)
                            if text and len(text) > 50:  # Solo párrafos con contenido sustancial
                                content_paragraphs.append(text)
                    
                    if content_paragraphs:
                        break
            
            # Si no encontramos contenido con los selectores, buscar todos los párrafos
            if not content_paragraphs:
                all_paragraphs = soup.find_all('p')
                for p in all_paragraphs:
                    text = p.get_text(strip=True)
                    if text and len(text) > 50:
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
        
    def get_deportes(self, max_pages=3) -> List[Dict]:
        """Extrae noticias de la sección Deportes con paginación"""
        try:
            noticias = []
            
            for page in range(1, max_pages + 1):
                if page == 1:
                    url = f"{self.base_url}/deportes/"
                else:
                    # El Comercio usa diferentes formatos de paginación
                    url = f"{self.base_url}/deportes/?page={page}"
                
                response = self.session.get(url)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Buscar artículos de deportes
                articles = soup.find_all('article') or soup.find_all('div', class_='story-item')
                
                for article in articles[:15]:  # Aumentar de 10 a 15 por página
                    try:
                        title_elem = article.find('h2') or article.find('h3') or article.find('a')
                        if not title_elem:
                            continue
                            
                        title = title_elem.get_text(strip=True)
                        link_elem = article.find('a')
                        link = link_elem.get('href') if link_elem else None
                        
                        if link and not link.startswith('http'):
                            link = self.base_url + link
                        
                        # Extraer contenido completo del artículo
                        print(f"🔍 Extrayendo contenido de El Comercio: {link}")
                        content = self.get_full_article_content(link)
                        
                        # Si no se pudo obtener contenido completo, usar resumen local
                        if not content:
                            content_elem = article.find('p')
                            content = content_elem.get_text(strip=True) if content_elem else ""
                        
                        # Buscar imagen usando el extractor mejorado (usa la sesión para mejor rendimiento)
                        imagen_url = extract_image_from_element(article, article_url=link, base_url=self.base_url, session=self.session)
                        
                        # Para El Comercio, asumir que las noticias son del día actual
                        # ya que no tienen fechas específicas en la página principal
                        fecha_actual = datetime.now().date()
                        
                        noticias.append({
                            'titulo': title,
                            'contenido': content,
                            'enlace': link,
                            'imagen_url': imagen_url,
                            'categoria': 'Deportes',
                            'diario': 'El Comercio',
                            'fecha_publicacion': fecha_actual,
                            'fecha_extraccion': datetime.now().isoformat()
                        })
                    except Exception as e:
                        logging.warning(f"Error procesando artículo de deportes: {e}")
                        continue
                
                # Si no hay más artículos en esta página, salir del bucle
                if len(articles) < 5:
                    break
                    
            return noticias
            
        except Exception as e:
            logging.error(f"Error obteniendo deportes de El Comercio: {e}")
            return []
    
    def get_economia(self, max_pages=3) -> List[Dict]:
        """Extrae noticias de la sección Economía con paginación"""
        try:
            noticias = []
            
            for page in range(1, max_pages + 1):
                if page == 1:
                    url = f"{self.base_url}/economia/"
                else:
                    url = f"{self.base_url}/economia/?page={page}"
                
                response = self.session.get(url)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.content, 'html.parser')
                
                articles = soup.find_all('article') or soup.find_all('div', class_='story-item')
                
                for article in articles[:15]:  # Aumentar de 10 a 15 por página
                    try:
                        title_elem = article.find('h2') or article.find('h3') or article.find('a')
                        if not title_elem:
                            continue
                            
                        title = title_elem.get_text(strip=True)
                        link_elem = article.find('a')
                        link = link_elem.get('href') if link_elem else None
                        
                        if link and not link.startswith('http'):
                            link = self.base_url + link
                        
                        # Extraer contenido completo del artículo
                        print(f"🔍 Extrayendo contenido de El Comercio: {link}")
                        content = self.get_full_article_content(link)
                        
                        # Si no se pudo obtener contenido completo, usar resumen local
                        if not content:
                            content_elem = article.find('p')
                            content = content_elem.get_text(strip=True) if content_elem else ""
                        
                        # Buscar imagen usando el extractor mejorado (usa la sesión para mejor rendimiento)
                        imagen_url = extract_image_from_element(article, article_url=link, base_url=self.base_url, session=self.session)
                        
                        # Para El Comercio, asumir que las noticias son del día actual
                        fecha_actual = datetime.now().date()
                        
                        noticias.append({
                            'titulo': title,
                            'contenido': content,
                            'enlace': link,
                            'imagen_url': imagen_url,
                            'categoria': 'Economía',
                            'diario': 'El Comercio',
                            'fecha_publicacion': fecha_actual,
                            'fecha_extraccion': datetime.now().isoformat()
                        })
                    except Exception as e:
                        logging.warning(f"Error procesando artículo de economía: {e}")
                        continue
                
                # Si no hay más artículos en esta página, salir del bucle
                if len(articles) < 5:
                    break
                    
            return noticias
            
        except Exception as e:
            logging.error(f"Error obteniendo economía de El Comercio: {e}")
            return []
    
    def get_mundo(self, max_pages=3) -> List[Dict]:
        """Extrae noticias de la sección Mundo con paginación"""
        try:
            noticias = []
            
            for page in range(1, max_pages + 1):
                if page == 1:
                    url = f"{self.base_url}/mundo/"
                else:
                    url = f"{self.base_url}/mundo/?page={page}"
                
                response = self.session.get(url)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.content, 'html.parser')
                
                articles = soup.find_all('article') or soup.find_all('div', class_='story-item')
                
                for article in articles[:15]:  # Aumentar de 10 a 15 por página
                    try:
                        title_elem = article.find('h2') or article.find('h3') or article.find('a')
                        if not title_elem:
                            continue
                            
                        title = title_elem.get_text(strip=True)
                        link_elem = article.find('a')
                        link = link_elem.get('href') if link_elem else None
                        
                        if link and not link.startswith('http'):
                            link = self.base_url + link
                        
                        # Extraer contenido completo del artículo
                        print(f"🔍 Extrayendo contenido de El Comercio: {link}")
                        content = self.get_full_article_content(link)
                        
                        # Si no se pudo obtener contenido completo, usar resumen local
                        if not content:
                            content_elem = article.find('p')
                            content = content_elem.get_text(strip=True) if content_elem else ""
                        
                        # Buscar imagen usando el extractor mejorado (usa la sesión para mejor rendimiento)
                        imagen_url = extract_image_from_element(article, article_url=link, base_url=self.base_url, session=self.session)
                        
                        # Para El Comercio, asumir que las noticias son del día actual
                        fecha_actual = datetime.now().date()
                        
                        noticias.append({
                            'titulo': title,
                            'contenido': content,
                            'enlace': link,
                            'imagen_url': imagen_url,
                            'categoria': 'Mundo',
                            'diario': 'El Comercio',
                            'fecha_publicacion': fecha_actual,
                            'fecha_extraccion': datetime.now().isoformat()
                        })
                    except Exception as e:
                        logging.warning(f"Error procesando artículo de mundo: {e}")
                        continue
                
                # Si no hay más artículos en esta página, salir del bucle
                if len(articles) < 5:
                    break
                    
            return noticias
            
        except Exception as e:
            logging.error(f"Error obteniendo mundo de El Comercio: {e}")
            return []

    def get_politica(self, max_pages=3) -> List[Dict]:
        """Extrae noticias de la sección Política"""
        try:
            noticias = []
            
            for page in range(1, max_pages + 1):
                if page == 1:
                    url = f"{self.base_url}/politica/"
                else:
                    url = f"{self.base_url}/politica/page/{page}/"
                
                response = self.session.get(url)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.content, 'html.parser')
                articles = soup.find_all('article') or soup.find_all('div', class_='story-item')
                
                for article in articles[:15]:
                    try:
                        title_elem = article.find('h2') or article.find('h3') or article.find('a')
                        if not title_elem:
                            continue
                            
                        title = title_elem.get_text(strip=True)
                        link_elem = article.find('a')
                        link = link_elem.get('href') if link_elem else None
                        
                        if link and not link.startswith('http'):
                            link = self.base_url + link
                        
                        content = self.get_full_article_content(link)
                        if not content:
                            content_elem = article.find('p')
                            content = content_elem.get_text(strip=True) if content_elem else ""
                        
                        # Buscar imagen usando el extractor mejorado (usa la sesión para mejor rendimiento)
                        imagen_url = extract_image_from_element(article, article_url=link, base_url=self.base_url, session=self.session)
                        
                        fecha_actual = datetime.now().date()
                        
                        noticias.append({
                            'titulo': title,
                            'contenido': content,
                            'enlace': link,
                            'imagen_url': imagen_url,
                            'categoria': 'Política',
                            'diario': 'El Comercio',
                            'fecha_publicacion': fecha_actual,
                            'fecha_extraccion': datetime.now().isoformat()
                        })
                    except Exception as e:
                        logging.warning(f"Error procesando artículo de política: {e}")
                        continue
                
                if len(articles) < 5:
                    break
                    
            return noticias
            
        except Exception as e:
            logging.error(f"Error obteniendo política de El Comercio: {e}")
            return []

    def get_sociedad(self, max_pages=3) -> List[Dict]:
        """Extrae noticias de la sección Sociedad"""
        try:
            noticias = []
            
            for page in range(1, max_pages + 1):
                if page == 1:
                    url = f"{self.base_url}/sociedad/"
                else:
                    url = f"{self.base_url}/sociedad/page/{page}/"
                
                response = self.session.get(url)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.content, 'html.parser')
                articles = soup.find_all('article') or soup.find_all('div', class_='story-item')
                
                for article in articles[:15]:
                    try:
                        title_elem = article.find('h2') or article.find('h3') or article.find('a')
                        if not title_elem:
                            continue
                            
                        title = title_elem.get_text(strip=True)
                        link_elem = article.find('a')
                        link = link_elem.get('href') if link_elem else None
                        
                        if link and not link.startswith('http'):
                            link = self.base_url + link
                        
                        content = self.get_full_article_content(link)
                        if not content:
                            content_elem = article.find('p')
                            content = content_elem.get_text(strip=True) if content_elem else ""
                        
                        # Buscar imagen usando el extractor mejorado (usa la sesión para mejor rendimiento)
                        imagen_url = extract_image_from_element(article, article_url=link, base_url=self.base_url, session=self.session)
                        
                        fecha_actual = datetime.now().date()
                        
                        noticias.append({
                            'titulo': title,
                            'contenido': content,
                            'enlace': link,
                            'imagen_url': imagen_url,
                            'categoria': 'Sociedad',
                            'diario': 'El Comercio',
                            'fecha_publicacion': fecha_actual,
                            'fecha_extraccion': datetime.now().isoformat()
                        })
                    except Exception as e:
                        logging.warning(f"Error procesando artículo de sociedad: {e}")
                        continue
                
                if len(articles) < 5:
                    break
                    
            return noticias
            
        except Exception as e:
            logging.error(f"Error obteniendo sociedad de El Comercio: {e}")
            return []

    def get_all_news(self) -> List[Dict]:
        """Obtiene todas las noticias de todas las categorías"""
        all_news = []
        all_news.extend(self.get_deportes())
        all_news.extend(self.get_economia())
        all_news.extend(self.get_mundo())
        all_news.extend(self.get_politica())
        all_news.extend(self.get_sociedad())
        return all_news

if __name__ == "__main__":
    scraper = ScraperComercio()
    noticias = scraper.get_all_news()
    print(f"Total de noticias extraídas: {len(noticias)}")
    for noticia in noticias[:3]:
        print(f"- {noticia['categoria']}: {noticia['titulo']}")
