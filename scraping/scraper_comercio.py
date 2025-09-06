import requests
from bs4 import BeautifulSoup
from datetime import datetime
import logging
from typing import List, Dict

class ScraperComercio:
    def __init__(self):
        self.base_url = 'https://elcomercio.pe'
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
    def get_deportes(self) -> List[Dict]:
        """Extrae noticias de la sección Deportes"""
        try:
            url = f"{self.base_url}/deportes/"
            response = self.session.get(url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            noticias = []
            
            # Buscar artículos de deportes
            articles = soup.find_all('article') or soup.find_all('div', class_='story-item')
            
            for article in articles[:10]:
                try:
                    title_elem = article.find('h2') or article.find('h3') or article.find('a')
                    if not title_elem:
                        continue
                        
                    title = title_elem.get_text(strip=True)
                    link_elem = article.find('a')
                    link = link_elem.get('href') if link_elem else None
                    
                    if link and not link.startswith('http'):
                        link = self.base_url + link
                    
                    content_elem = article.find('p')
                    content = content_elem.get_text(strip=True) if content_elem else ""
                    
                    # Buscar imagen
                    imagen_url = None
                    img_elem = article.find('img')
                    if img_elem:
                        imagen_url = img_elem.get('src') or img_elem.get('data-src')
                        if imagen_url and not imagen_url.startswith('http'):
                            imagen_url = self.base_url + imagen_url
                    
                    noticias.append({
                        'titulo': title,
                        'contenido': content,
                        'enlace': link,
                        'imagen_url': imagen_url,
                        'categoria': 'Deportes',
                        'diario': 'El Comercio',
                        'fecha_extraccion': datetime.now().isoformat()
                    })
                except Exception as e:
                    logging.warning(f"Error procesando artículo de deportes: {e}")
                    continue
                    
            return noticias
            
        except Exception as e:
            logging.error(f"Error obteniendo deportes de El Comercio: {e}")
            return []
    
    def get_economia(self) -> List[Dict]:
        """Extrae noticias de la sección Economía"""
        try:
            url = f"{self.base_url}/economia/"
            response = self.session.get(url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            noticias = []
            
            articles = soup.find_all('article') or soup.find_all('div', class_='story-item')
            
            for article in articles[:10]:
                try:
                    title_elem = article.find('h2') or article.find('h3') or article.find('a')
                    if not title_elem:
                        continue
                        
                    title = title_elem.get_text(strip=True)
                    link_elem = article.find('a')
                    link = link_elem.get('href') if link_elem else None
                    
                    if link and not link.startswith('http'):
                        link = self.base_url + link
                    
                    content_elem = article.find('p')
                    content = content_elem.get_text(strip=True) if content_elem else ""
                    
                    # Buscar imagen
                    imagen_url = None
                    img_elem = article.find('img')
                    if img_elem:
                        imagen_url = img_elem.get('src') or img_elem.get('data-src')
                        if imagen_url and not imagen_url.startswith('http'):
                            imagen_url = self.base_url + imagen_url
                    
                    noticias.append({
                        'titulo': title,
                        'contenido': content,
                        'enlace': link,
                        'imagen_url': imagen_url,
                        'categoria': 'Economía',
                        'diario': 'El Comercio',
                        'fecha_extraccion': datetime.now().isoformat()
                    })
                except Exception as e:
                    logging.warning(f"Error procesando artículo de economía: {e}")
                    continue
                    
            return noticias
            
        except Exception as e:
            logging.error(f"Error obteniendo economía de El Comercio: {e}")
            return []
    
    def get_all_news(self) -> List[Dict]:
        """Obtiene todas las noticias de todas las categorías"""
        all_news = []
        all_news.extend(self.get_deportes())
        all_news.extend(self.get_economia())
        return all_news

if __name__ == "__main__":
    scraper = ScraperComercio()
    noticias = scraper.get_all_news()
    print(f"Total de noticias extraídas: {len(noticias)}")
    for noticia in noticias[:3]:
        print(f"- {noticia['categoria']}: {noticia['titulo']}")
