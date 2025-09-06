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
            
            # Buscar enlaces de noticias en la página
            links = soup.find_all('a', href=True)
            
            for link in links[:30]:  # Revisar más enlaces
                try:
                    href = link.get('href')
                    if not href or not href.startswith('/'):
                        continue
                    
                    # Construir URL completa
                    if not href.startswith('http'):
                        full_url = self.base_url + href
                    else:
                        full_url = href
                    
                    # Obtener texto del enlace
                    title = link.get_text(strip=True)
                    if not title or len(title) < 15:  # Filtrar títulos muy cortos
                        continue
                    
                    # Filtrar enlaces que no son noticias
                    if any(word in title.lower() for word in ['inicio', 'home', 'menu', 'buscar', 'contacto', 'acerca', 'politica']):
                        continue
                    
                    # Buscar contenido relacionado
                    content = ""
                    parent = link.parent
                    if parent:
                        content_elem = parent.find('p') or parent.find('span')
                        if content_elem:
                            content = content_elem.get_text(strip=True)
                    
                    noticias.append({
                        'titulo': title,
                        'contenido': content,
                        'enlace': full_url,
                        'categoria': 'Deportes',
                        'diario': 'El Popular',
                        'fecha_extraccion': datetime.now().isoformat()
                    })
                    
                    if len(noticias) >= 10:  # Limitar a 10 noticias
                        break
                        
                except Exception as e:
                    logging.warning(f"Error procesando enlace de deportes: {e}")
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
            
            # Buscar enlaces de noticias en la página
            links = soup.find_all('a', href=True)
            
            for link in links[:30]:  # Revisar más enlaces
                try:
                    href = link.get('href')
                    if not href or not href.startswith('/'):
                        continue
                    
                    # Construir URL completa
                    if not href.startswith('http'):
                        full_url = self.base_url + href
                    else:
                        full_url = href
                    
                    # Obtener texto del enlace
                    title = link.get_text(strip=True)
                    if not title or len(title) < 15:  # Filtrar títulos muy cortos
                        continue
                    
                    # Filtrar enlaces que no son noticias
                    if any(word in title.lower() for word in ['inicio', 'home', 'menu', 'buscar', 'contacto', 'acerca', 'politica']):
                        continue
                    
                    # Buscar contenido relacionado
                    content = ""
                    parent = link.parent
                    if parent:
                        content_elem = parent.find('p') or parent.find('span')
                        if content_elem:
                            content = content_elem.get_text(strip=True)
                    
                    noticias.append({
                        'titulo': title,
                        'contenido': content,
                        'enlace': full_url,
                        'categoria': 'Espectáculos',
                        'diario': 'El Popular',
                        'fecha_extraccion': datetime.now().isoformat()
                    })
                    
                    if len(noticias) >= 10:  # Limitar a 10 noticias
                        break
                        
                except Exception as e:
                    logging.warning(f"Error procesando enlace de espectáculos: {e}")
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
