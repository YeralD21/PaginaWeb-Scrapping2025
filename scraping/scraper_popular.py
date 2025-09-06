import requests
from bs4 import BeautifulSoup
from datetime import datetime
import logging
from typing import List, Dict

class ScraperPopular:
    def __init__(self):
        self.base_url = 'https://elpopular.pe'
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
                    
                    noticias.append({
                        'titulo': title,
                        'contenido': content,
                        'enlace': link,
                        'categoria': 'Deportes',
                        'diario': 'El Popular',
                        'fecha_extraccion': datetime.now().isoformat()
                    })
                except Exception as e:
                    logging.warning(f"Error procesando artículo de deportes: {e}")
                    continue
                    
            return noticias
            
        except Exception as e:
            logging.error(f"Error obteniendo deportes de El Popular: {e}")
            return []
    
    def get_espectaculos(self) -> List[Dict]:
        """Extrae noticias de la sección Espectáculos"""
        try:
            url = f"{self.base_url}/espectaculos/"
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
                    
                    noticias.append({
                        'titulo': title,
                        'contenido': content,
                        'enlace': link,
                        'categoria': 'Espectáculos',
                        'diario': 'El Popular',
                        'fecha_extraccion': datetime.now().isoformat()
                    })
                except Exception as e:
                    logging.warning(f"Error procesando artículo de espectáculos: {e}")
                    continue
                    
            return noticias
            
        except Exception as e:
            logging.error(f"Error obteniendo espectáculos de El Popular: {e}")
            return []
    
    def get_all_news(self) -> List[Dict]:
        """Obtiene todas las noticias de todas las categorías"""
        all_news = []
        all_news.extend(self.get_deportes())
        all_news.extend(self.get_espectaculos())
        return all_news

if __name__ == "__main__":
    scraper = ScraperPopular()
    noticias = scraper.get_all_news()
    print(f"Total de noticias extraídas: {len(noticias)}")
    for noticia in noticias[:3]:
        print(f"- {noticia['categoria']}: {noticia['titulo']}")
