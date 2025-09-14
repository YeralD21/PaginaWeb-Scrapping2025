import requests
from bs4 import BeautifulSoup
from datetime import datetime
import logging
from typing import List, Dict

class ScraperCNNSimple:
    def __init__(self):
        self.base_url = 'https://cnnespanol.cnn.com'
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
    
    def get_mundo(self, max_pages=2) -> List[Dict]:
        """Extrae noticias de la sección Mundo"""
        try:
            noticias = []
            
            # URLs específicas de CNN en Español
            urls = [
                f"{self.base_url}/mundo/",
                f"{self.base_url}/americas/",
                f"{self.base_url}/internacional/"
            ]
            
            for url in urls:
                try:
                    response = self.session.get(url, timeout=10)
                    response.raise_for_status()
                    
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Buscar todos los enlaces que parecen noticias
                    links = soup.find_all('a', href=True)
                    
                    for link in links[:20]:  # Limitar a 20 enlaces por página
                        try:
                            href = link.get('href')
                            if not href:
                                continue
                                
                            # Construir URL completa
                            if href.startswith('/'):
                                full_url = self.base_url + href
                            elif href.startswith('http'):
                                full_url = href
                            else:
                                continue
                            
                            # Obtener texto del enlace como título
                            title = link.get_text(strip=True)
                            if len(title) < 15 or len(title) > 200:
                                continue
                            
                            # Buscar imagen en el enlace o elemento padre
                            img_elem = link.find('img') or link.find_parent().find('img') if link.find_parent() else None
                            imagen_url = None
                            if img_elem:
                                imagen_url = img_elem.get('src') or img_elem.get('data-src')
                                if imagen_url and not imagen_url.startswith('http'):
                                    if imagen_url.startswith('//'):
                                        imagen_url = 'https:' + imagen_url
                                    else:
                                        imagen_url = self.base_url + imagen_url
                            
                            # Obtener contenido básico
                            content = ""
                            parent = link.find_parent()
                            if parent:
                                content_elem = parent.find('p') or parent.find('div', class_='summary')
                                if content_elem:
                                    content = content_elem.get_text(strip=True)
                            
                            noticias.append({
                                'titulo': title,
                                'contenido': content,
                                'enlace': full_url,
                                'imagen_url': imagen_url,
                                'categoria': 'Mundo',
                                'diario': 'CNN en Español',
                                'fecha_publicacion': datetime.now().date(),
                                'fecha_extraccion': datetime.now().isoformat()
                            })
                            
                        except Exception as e:
                            logging.warning(f"Error procesando enlace: {e}")
                            continue
                            
                except Exception as e:
                    logging.warning(f"Error obteniendo {url}: {e}")
                    continue
                    
            return noticias
            
        except Exception as e:
            logging.error(f"Error obteniendo mundo de CNN en Español: {e}")
            return []
    
    def get_deportes(self, max_pages=2) -> List[Dict]:
        """Extrae noticias de la sección Deportes"""
        try:
            noticias = []
            
            # URLs específicas de deportes
            urls = [
                f"{self.base_url}/deportes/",
                f"{self.base_url}/futbol/",
                f"{self.base_url}/olimpiadas/"
            ]
            
            for url in urls:
                try:
                    response = self.session.get(url, timeout=10)
                    response.raise_for_status()
                    
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Buscar todos los enlaces que parecen noticias
                    links = soup.find_all('a', href=True)
                    
                    for link in links[:15]:  # Limitar a 15 enlaces por página
                        try:
                            href = link.get('href')
                            if not href:
                                continue
                                
                            # Construir URL completa
                            if href.startswith('/'):
                                full_url = self.base_url + href
                            elif href.startswith('http'):
                                full_url = href
                            else:
                                continue
                            
                            # Obtener texto del enlace como título
                            title = link.get_text(strip=True)
                            if len(title) < 15 or len(title) > 200:
                                continue
                            
                            # Buscar imagen
                            img_elem = link.find('img') or link.find_parent().find('img') if link.find_parent() else None
                            imagen_url = None
                            if img_elem:
                                imagen_url = img_elem.get('src') or img_elem.get('data-src')
                                if imagen_url and not imagen_url.startswith('http'):
                                    if imagen_url.startswith('//'):
                                        imagen_url = 'https:' + imagen_url
                                    else:
                                        imagen_url = self.base_url + imagen_url
                            
                            # Obtener contenido básico
                            content = ""
                            parent = link.find_parent()
                            if parent:
                                content_elem = parent.find('p') or parent.find('div', class_='summary')
                                if content_elem:
                                    content = content_elem.get_text(strip=True)
                            
                            noticias.append({
                                'titulo': title,
                                'contenido': content,
                                'enlace': full_url,
                                'imagen_url': imagen_url,
                                'categoria': 'Deportes',
                                'diario': 'CNN en Español',
                                'fecha_publicacion': datetime.now().date(),
                                'fecha_extraccion': datetime.now().isoformat()
                            })
                            
                        except Exception as e:
                            logging.warning(f"Error procesando enlace: {e}")
                            continue
                            
                except Exception as e:
                    logging.warning(f"Error obteniendo {url}: {e}")
                    continue
                    
            return noticias
            
        except Exception as e:
            logging.error(f"Error obteniendo deportes de CNN en Español: {e}")
            return []
    
    def get_economia(self, max_pages=2) -> List[Dict]:
        """Extrae noticias de la sección Economía"""
        try:
            noticias = []
            
            # URLs específicas de economía
            urls = [
                f"{self.base_url}/economia/",
                f"{self.base_url}/negocios/",
                f"{self.base_url}/dinero/"
            ]
            
            for url in urls:
                try:
                    response = self.session.get(url, timeout=10)
                    response.raise_for_status()
                    
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Buscar todos los enlaces que parecen noticias
                    links = soup.find_all('a', href=True)
                    
                    for link in links[:15]:  # Limitar a 15 enlaces por página
                        try:
                            href = link.get('href')
                            if not href:
                                continue
                                
                            # Construir URL completa
                            if href.startswith('/'):
                                full_url = self.base_url + href
                            elif href.startswith('http'):
                                full_url = href
                            else:
                                continue
                            
                            # Obtener texto del enlace como título
                            title = link.get_text(strip=True)
                            if len(title) < 15 or len(title) > 200:
                                continue
                            
                            # Buscar imagen
                            img_elem = link.find('img') or link.find_parent().find('img') if link.find_parent() else None
                            imagen_url = None
                            if img_elem:
                                imagen_url = img_elem.get('src') or img_elem.get('data-src')
                                if imagen_url and not imagen_url.startswith('http'):
                                    if imagen_url.startswith('//'):
                                        imagen_url = 'https:' + imagen_url
                                    else:
                                        imagen_url = self.base_url + imagen_url
                            
                            # Obtener contenido básico
                            content = ""
                            parent = link.find_parent()
                            if parent:
                                content_elem = parent.find('p') or parent.find('div', class_='summary')
                                if content_elem:
                                    content = content_elem.get_text(strip=True)
                            
                            noticias.append({
                                'titulo': title,
                                'contenido': content,
                                'enlace': full_url,
                                'imagen_url': imagen_url,
                                'categoria': 'Economía',
                                'diario': 'CNN en Español',
                                'fecha_publicacion': datetime.now().date(),
                                'fecha_extraccion': datetime.now().isoformat()
                            })
                            
                        except Exception as e:
                            logging.warning(f"Error procesando enlace: {e}")
                            continue
                            
                except Exception as e:
                    logging.warning(f"Error obteniendo {url}: {e}")
                    continue
                    
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
    scraper = ScraperCNNSimple()
    noticias = scraper.get_all_news()
    print(f"Total de noticias extraídas: {len(noticias)}")
    for noticia in noticias[:3]:
        print(f"- {noticia['categoria']}: {noticia['titulo']}")
