import requests
from bs4 import BeautifulSoup
from datetime import datetime
import logging
from typing import List, Dict, Optional
import sys
import os
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'backend'))
from date_extraction_utils import get_publication_date

class ScraperCorreo:
    def __init__(self):
        self.base_url = "https://diariocorreo.pe"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
    
    def get_full_article_content(self, article_url: str) -> str:
        """Extrae el contenido completo de un artículo individual de Diario Correo"""
        try:
            if not article_url:
                return ""
            
            response = self.session.get(article_url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Selectores específicos para Diario Correo
            content_selectors = [
                'div.story-content',
                'div.post-content',
                'div.entry-content', 
                'div.article-content',
                'div.content',
                'div[class*="story"] p',
                'div[class*="post"] p',
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
        
    def get_deportes(self) -> List[Dict]:
        """Extrae noticias de la sección Deportes"""
        try:
            url = f"{self.base_url}/deportes/"
            response = self.session.get(url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            noticias = []
            
            # Buscar artículos de deportes
            articles = soup.find_all('article', class_='story-item') or soup.find_all('div', class_='story-item')
            
            for article in articles[:10]:  # Limitar a 10 noticias
                try:
                    title_elem = article.find('h2') or article.find('h3') or article.find('a', class_='title')
                    if not title_elem:
                        continue
                        
                    title = title_elem.get_text(strip=True)
                    link_elem = article.find('a')
                    link = link_elem.get('href') if link_elem else None
                    
                    if link and not link.startswith('http'):
                        link = self.base_url + link
                    
                    # Extraer contenido completo del artículo
                    print(f"🔍 Extrayendo contenido de Diario Correo: {link}")
                    content = self.get_full_article_content(link)
                    
                    # Si no se pudo obtener contenido completo, usar resumen local
                    if not content:
                        content_elem = article.find('p') or article.find('div', class_='summary')
                        content = content_elem.get_text(strip=True) if content_elem else ""
                    
                    # Buscar imagen
                    imagen_url = None
                    img_elem = article.find('img')
                    if img_elem:
                        imagen_url = img_elem.get('src') or img_elem.get('data-src')
                        if imagen_url and not imagen_url.startswith('http'):
                            imagen_url = self.base_url + imagen_url
                    
                    # Extraer fecha de publicación real
                    fecha_publicacion = get_publication_date(article, 'Diario Correo')
                    
                    # Si no se puede extraer fecha específica, usar fecha actual
                    if fecha_publicacion is None:
                        fecha_publicacion = datetime.now().date()
                    
                    noticias.append({
                        'titulo': title,
                        'contenido': content,
                        'enlace': link,
                        'imagen_url': imagen_url,
                        'categoria': 'Deportes',
                        'diario': 'Diario Correo',
                        'fecha_publicacion': fecha_publicacion,
                        'fecha_extraccion': datetime.now().isoformat()
                    })
                except Exception as e:
                    logging.warning(f"Error procesando artículo de deportes: {e}")
                    continue
                    
            return noticias
            
        except Exception as e:
            logging.error(f"Error obteniendo deportes de Diario Correo: {e}")
            return []
    
    def get_economia(self) -> List[Dict]:
        """Extrae noticias de la sección Economía"""
        try:
            url = f"{self.base_url}/economia/"
            response = self.session.get(url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            noticias = []
            
            # Buscar artículos de economía
            articles = soup.find_all('article', class_='story-item') or soup.find_all('div', class_='story-item')
            
            for article in articles[:10]:  # Limitar a 10 noticias
                try:
                    title_elem = article.find('h2') or article.find('h3') or article.find('a', class_='title')
                    if not title_elem:
                        continue
                        
                    title = title_elem.get_text(strip=True)
                    link_elem = article.find('a')
                    link = link_elem.get('href') if link_elem else None
                    
                    if link and not link.startswith('http'):
                        link = self.base_url + link
                    
                    # Extraer contenido completo del artículo
                    print(f"🔍 Extrayendo contenido de Diario Correo: {link}")
                    content = self.get_full_article_content(link)
                    
                    # Si no se pudo obtener contenido completo, usar resumen local
                    if not content:
                        content_elem = article.find('p') or article.find('div', class_='summary')
                        content = content_elem.get_text(strip=True) if content_elem else ""
                    
                    # Buscar imagen
                    imagen_url = None
                    img_elem = article.find('img')
                    if img_elem:
                        imagen_url = img_elem.get('src') or img_elem.get('data-src')
                        if imagen_url and not imagen_url.startswith('http'):
                            imagen_url = self.base_url + imagen_url
                    
                    # Extraer fecha de publicación real
                    fecha_publicacion = get_publication_date(article, 'Diario Correo')
                    
                    # Si no se puede extraer fecha específica, usar fecha actual
                    if fecha_publicacion is None:
                        fecha_publicacion = datetime.now().date()
                    
                    noticias.append({
                        'titulo': title,
                        'contenido': content,
                        'enlace': link,
                        'imagen_url': imagen_url,
                        'categoria': 'Economía',
                        'diario': 'Diario Correo',
                        'fecha_publicacion': fecha_publicacion,
                        'fecha_extraccion': datetime.now().isoformat()
                    })
                except Exception as e:
                    logging.warning(f"Error procesando artículo de economía: {e}")
                    continue
                    
            return noticias
            
        except Exception as e:
            logging.error(f"Error obteniendo economía de Diario Correo: {e}")
            return []
    
    def get_espectaculos(self) -> List[Dict]:
        """Extrae noticias de la sección Espectáculos"""
        try:
            url = f"{self.base_url}/espectaculos/"
            response = self.session.get(url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            noticias = []
            
            # Buscar artículos de espectáculos
            articles = soup.find_all('article', class_='story-item') or soup.find_all('div', class_='story-item')
            
            for article in articles[:10]:  # Limitar a 10 noticias
                try:
                    title_elem = article.find('h2') or article.find('h3') or article.find('a', class_='title')
                    if not title_elem:
                        continue
                        
                    title = title_elem.get_text(strip=True)
                    link_elem = article.find('a')
                    link = link_elem.get('href') if link_elem else None
                    
                    if link and not link.startswith('http'):
                        link = self.base_url + link
                    
                    # Extraer contenido completo del artículo
                    print(f"🔍 Extrayendo contenido de Diario Correo: {link}")
                    content = self.get_full_article_content(link)
                    
                    # Si no se pudo obtener contenido completo, usar resumen local
                    if not content:
                        content_elem = article.find('p') or article.find('div', class_='summary')
                        content = content_elem.get_text(strip=True) if content_elem else ""
                    
                    # Buscar imagen
                    imagen_url = None
                    img_elem = article.find('img')
                    if img_elem:
                        imagen_url = img_elem.get('src') or img_elem.get('data-src')
                        if imagen_url and not imagen_url.startswith('http'):
                            imagen_url = self.base_url + imagen_url
                    
                    # Extraer fecha de publicación real
                    fecha_publicacion = get_publication_date(article, 'Diario Correo')
                    
                    # Si no se puede extraer fecha específica, usar fecha actual
                    if fecha_publicacion is None:
                        fecha_publicacion = datetime.now().date()
                    
                    noticias.append({
                        'titulo': title,
                        'contenido': content,
                        'enlace': link,
                        'imagen_url': imagen_url,
                        'categoria': 'Espectáculos',
                        'diario': 'Diario Correo',
                        'fecha_publicacion': fecha_publicacion,
                        'fecha_extraccion': datetime.now().isoformat()
                    })
                except Exception as e:
                    logging.warning(f"Error procesando artículo de espectáculos: {e}")
                    continue
                    
            return noticias
            
        except Exception as e:
            logging.error(f"Error obteniendo espectáculos de Diario Correo: {e}")
            return []
    
    def get_mundo(self) -> List[Dict]:
        """Extrae noticias de la sección Mundo"""
        try:
            url = f"{self.base_url}/mundo/"
            response = self.session.get(url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            noticias = []
            
            # Buscar artículos de mundo
            articles = soup.find_all('article', class_='story-item') or soup.find_all('div', class_='story-item')
            
            for article in articles[:10]:  # Limitar a 10 noticias
                try:
                    title_elem = article.find('h2') or article.find('h3') or article.find('a', class_='title')
                    if not title_elem:
                        continue
                        
                    title = title_elem.get_text(strip=True)
                    link_elem = article.find('a')
                    link = link_elem.get('href') if link_elem else None
                    
                    if link and not link.startswith('http'):
                        link = self.base_url + link
                    
                    # Extraer contenido completo del artículo
                    print(f"🔍 Extrayendo contenido de Diario Correo: {link}")
                    content = self.get_full_article_content(link)
                    
                    # Si no se pudo obtener contenido completo, usar resumen local
                    if not content:
                        content_elem = article.find('p') or article.find('div', class_='summary')
                        content = content_elem.get_text(strip=True) if content_elem else ""
                    
                    # Buscar imagen
                    imagen_url = None
                    img_elem = article.find('img')
                    if img_elem:
                        imagen_url = img_elem.get('src') or img_elem.get('data-src')
                        if imagen_url and not imagen_url.startswith('http'):
                            imagen_url = self.base_url + imagen_url
                    
                    # Extraer fecha de publicación real
                    fecha_publicacion = get_publication_date(article, 'Diario Correo')
                    
                    # Si no se puede extraer fecha específica, usar fecha actual
                    if fecha_publicacion is None:
                        fecha_publicacion = datetime.now().date()
                    
                    noticias.append({
                        'titulo': title,
                        'contenido': content,
                        'enlace': link,
                        'imagen_url': imagen_url,
                        'categoria': 'Mundo',
                        'diario': 'Diario Correo',
                        'fecha_publicacion': fecha_publicacion,
                        'fecha_extraccion': datetime.now().isoformat()
                    })
                except Exception as e:
                    logging.warning(f"Error procesando artículo de mundo: {e}")
                    continue
                    
            return noticias
            
        except Exception as e:
            logging.error(f"Error obteniendo mundo de Diario Correo: {e}")
            return []
    
    def get_all_news(self) -> List[Dict]:
        """Obtiene todas las noticias de todas las categorías"""
        all_news = []
        
        # Obtener noticias de cada categoría
        all_news.extend(self.get_deportes())
        all_news.extend(self.get_economia())
        all_news.extend(self.get_espectaculos())
        all_news.extend(self.get_mundo())
        
        return all_news

if __name__ == "__main__":
    scraper = ScraperCorreo()
    noticias = scraper.get_all_news()
    print(f"Total de noticias extraídas: {len(noticias)}")
    for noticia in noticias[:3]:  # Mostrar solo las primeras 3
        print(f"- {noticia['categoria']}: {noticia['titulo']}")
