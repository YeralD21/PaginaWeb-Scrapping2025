import requests
from bs4 import BeautifulSoup
from datetime import datetime
import logging
from typing import List, Dict
import sys
import os
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'backend'))
from date_extraction_utils import get_publication_date

class ScraperCNN:
    def __init__(self):
        self.base_url = 'https://cnnespanol.cnn.com'
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
    
    def get_full_article_content(self, article_url: str) -> str:
        """Extrae el contenido completo de un artículo individual de CNN en Español"""
        try:
            if not article_url:
                return ""
            
            response = self.session.get(article_url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Selectores específicos para CNN en Español
            content_selectors = [
                'div.zn-body__paragraph',
                'div.Article__content',
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
    
    def get_mundo(self, max_pages=3) -> List[Dict]:
        """Extrae noticias de la sección Mundo"""
        try:
            noticias = []
            
            for page in range(1, max_pages + 1):
                if page == 1:
                    url = f"{self.base_url}/mundo/"
                else:
                    url = f"{self.base_url}/mundo/page/{page}/"
                
                response = self.session.get(url)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Buscar artículos de CNN en Español con selectores más específicos
                articles = (soup.find_all('article') or 
                           soup.find_all('div', class_='cnn-search__result') or 
                           soup.find_all('div', class_='media') or
                           soup.find_all('div', class_='item') or
                           soup.find_all('div', class_='story') or
                           soup.find_all('div', class_='news-item') or
                           soup.find_all('div', class_='article-item'))
                
                for article in articles[:15]:  # 15 artículos por página
                    try:
                        title_elem = (article.find('h3') or 
                                     article.find('h2') or 
                                     article.find('h1') or
                                     article.find('a', class_='cnn-search__result-headline') or
                                     article.find('a', class_='headline') or
                                     article.find('a', class_='title') or
                                     article.find('a'))
                        if not title_elem:
                            continue
                            
                        title = title_elem.get_text(strip=True)
                        if len(title) < 10:  # Filtrar títulos muy cortos
                            continue
                        
                        link_elem = article.find('a')
                        link = link_elem.get('href') if link_elem else None
                        
                        if link and not link.startswith('http'):
                            if link.startswith('//'):
                                link = 'https:' + link
                            else:
                                link = self.base_url + link
                        
                        # Extraer contenido completo del artículo
                        print(f"🔍 Extrayendo contenido de CNN en Español: {link}")
                        content = self.get_full_article_content(link)
                        
                        # Si no se pudo obtener contenido completo, usar resumen local
                        if not content:
                            content_elem = article.find('p') or article.find('div', class_='cnn-search__result-body')
                            content = content_elem.get_text(strip=True) if content_elem else ""
                        
                        # Buscar imagen
                        imagen_url = None
                        img_elem = article.find('img')
                        if img_elem:
                            imagen_url = img_elem.get('src') or img_elem.get('data-src')
                            if imagen_url and not imagen_url.startswith('http'):
                                if imagen_url.startswith('//'):
                                    imagen_url = 'https:' + imagen_url
                                else:
                                    imagen_url = self.base_url + imagen_url
                        
                        # Extraer fecha de publicación real
                        fecha_publicacion = get_publication_date(article, 'CNN en Español')
                        
                        # Si no se puede extraer fecha específica, usar fecha actual
                        if fecha_publicacion is None:
                            fecha_publicacion = datetime.now().date()
                        
                        noticias.append({
                            'titulo': title,
                            'contenido': content,
                            'enlace': link,
                            'imagen_url': imagen_url,
                            'categoria': 'Mundo',
                            'diario': 'CNN en Español',
                            'fecha_publicacion': fecha_publicacion,
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
            logging.error(f"Error obteniendo mundo de CNN en Español: {e}")
            return []
    
    def get_deportes(self, max_pages=3) -> List[Dict]:
        """Extrae noticias de la sección Deportes"""
        try:
            noticias = []
            
            for page in range(1, max_pages + 1):
                if page == 1:
                    url = f"{self.base_url}/deportes/"
                else:
                    url = f"{self.base_url}/deportes/page/{page}/"
                
                response = self.session.get(url)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Buscar artículos de deportes
                articles = soup.find_all('article') or soup.find_all('div', class_='cnn-search__result') or soup.find_all('div', class_='media')
                
                for article in articles[:15]:  # 15 artículos por página
                    try:
                        title_elem = (article.find('h3') or 
                                     article.find('h2') or 
                                     article.find('h1') or
                                     article.find('a', class_='cnn-search__result-headline') or
                                     article.find('a', class_='headline') or
                                     article.find('a', class_='title') or
                                     article.find('a'))
                        if not title_elem:
                            continue
                            
                        title = title_elem.get_text(strip=True)
                        if len(title) < 10:
                            continue
                        
                        link_elem = article.find('a')
                        link = link_elem.get('href') if link_elem else None
                        
                        if link and not link.startswith('http'):
                            if link.startswith('//'):
                                link = 'https:' + link
                            else:
                                link = self.base_url + link
                        
                        # Extraer contenido completo del artículo
                        print(f"🔍 Extrayendo contenido de CNN en Español: {link}")
                        content = self.get_full_article_content(link)
                        
                        # Si no se pudo obtener contenido completo, usar resumen local
                        if not content:
                            content_elem = article.find('p') or article.find('div', class_='cnn-search__result-body')
                            content = content_elem.get_text(strip=True) if content_elem else ""
                        
                        # Buscar imagen
                        imagen_url = None
                        img_elem = article.find('img')
                        if img_elem:
                            imagen_url = img_elem.get('src') or img_elem.get('data-src')
                            if imagen_url and not imagen_url.startswith('http'):
                                if imagen_url.startswith('//'):
                                    imagen_url = 'https:' + imagen_url
                                else:
                                    imagen_url = self.base_url + imagen_url
                        
                        # Extraer fecha de publicación real
                        fecha_publicacion = get_publication_date(article, 'CNN en Español')
                        
                        # Si no se puede extraer fecha específica, usar fecha actual
                        if fecha_publicacion is None:
                            fecha_publicacion = datetime.now().date()
                        
                        noticias.append({
                            'titulo': title,
                            'contenido': content,
                            'enlace': link,
                            'imagen_url': imagen_url,
                            'categoria': 'Deportes',
                            'diario': 'CNN en Español',
                            'fecha_publicacion': fecha_publicacion,
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
            logging.error(f"Error obteniendo deportes de CNN en Español: {e}")
            return []
    
    def get_economia(self, max_pages=3) -> List[Dict]:
        """Extrae noticias de la sección Economía"""
        try:
            noticias = []
            
            for page in range(1, max_pages + 1):
                if page == 1:
                    url = f"{self.base_url}/economia/"
                else:
                    url = f"{self.base_url}/economia/page/{page}/"
                
                response = self.session.get(url)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Buscar artículos de economía
                articles = soup.find_all('article') or soup.find_all('div', class_='cnn-search__result') or soup.find_all('div', class_='media')
                
                for article in articles[:15]:  # 15 artículos por página
                    try:
                        title_elem = (article.find('h3') or 
                                     article.find('h2') or 
                                     article.find('h1') or
                                     article.find('a', class_='cnn-search__result-headline') or
                                     article.find('a', class_='headline') or
                                     article.find('a', class_='title') or
                                     article.find('a'))
                        if not title_elem:
                            continue
                            
                        title = title_elem.get_text(strip=True)
                        if len(title) < 10:
                            continue
                        
                        link_elem = article.find('a')
                        link = link_elem.get('href') if link_elem else None
                        
                        if link and not link.startswith('http'):
                            if link.startswith('//'):
                                link = 'https:' + link
                            else:
                                link = self.base_url + link
                        
                        # Extraer contenido completo del artículo
                        print(f"🔍 Extrayendo contenido de CNN en Español: {link}")
                        content = self.get_full_article_content(link)
                        
                        # Si no se pudo obtener contenido completo, usar resumen local
                        if not content:
                            content_elem = article.find('p') or article.find('div', class_='cnn-search__result-body')
                            content = content_elem.get_text(strip=True) if content_elem else ""
                        
                        # Buscar imagen
                        imagen_url = None
                        img_elem = article.find('img')
                        if img_elem:
                            imagen_url = img_elem.get('src') or img_elem.get('data-src')
                            if imagen_url and not imagen_url.startswith('http'):
                                if imagen_url.startswith('//'):
                                    imagen_url = 'https:' + imagen_url
                                else:
                                    imagen_url = self.base_url + imagen_url
                        
                        # Extraer fecha de publicación real
                        fecha_publicacion = get_publication_date(article, 'CNN en Español')
                        
                        # Si no se puede extraer fecha específica, usar fecha actual
                        if fecha_publicacion is None:
                            fecha_publicacion = datetime.now().date()
                        
                        noticias.append({
                            'titulo': title,
                            'contenido': content,
                            'enlace': link,
                            'imagen_url': imagen_url,
                            'categoria': 'Economía',
                            'diario': 'CNN en Español',
                            'fecha_publicacion': fecha_publicacion,
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
            logging.error(f"Error obteniendo economía de CNN en Español: {e}")
            return []
    
    def get_all_news(self) -> List[Dict]:
        """Obtiene todas las noticias de todas las categorías"""
        all_news = []
        all_news.extend(self.get_mundo())
        all_news.extend(self.get_deportes())
        all_news.extend(self.get_economia())
        return all_news

if __name__ == "__main__":
    scraper = ScraperCNN()
    noticias = scraper.get_all_news()
    print(f"Total de noticias extraídas: {len(noticias)}")
    for noticia in noticias[:3]:
        print(f"- {noticia['categoria']}: {noticia['titulo']}")
