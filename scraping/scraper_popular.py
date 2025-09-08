import requests
from bs4 import BeautifulSoup
from datetime import datetime
import logging
from typing import List, Dict
import sys
import os
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'backend'))
from date_extraction_utils import get_publication_date

class ScraperPopular:
    def __init__(self):
        self.base_url = 'https://elpopular.pe'
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
    
    def _find_image_url(self, element):
        """Función mejorada para buscar URLs de imágenes"""
        imagen_url = None
        
        if not element:
            return None
        
        # Buscar en el elemento actual
        img_elem = element.find('img')
        if img_elem:
            imagen_url = img_elem.get('src') or img_elem.get('data-src') or img_elem.get('data-lazy-src')
        
        # Si no se encuentra, buscar en elementos hermanos
        if not imagen_url:
            for sibling in element.find_next_siblings():
                img_elem = sibling.find('img')
                if img_elem:
                    imagen_url = img_elem.get('src') or img_elem.get('data-src') or img_elem.get('data-lazy-src')
                    break
        
        # Si no se encuentra, buscar en elementos anteriores
        if not imagen_url:
            for sibling in element.find_previous_siblings():
                img_elem = sibling.find('img')
                if img_elem:
                    imagen_url = img_elem.get('src') or img_elem.get('data-src') or img_elem.get('data-lazy-src')
                    break
        
        # Normalizar URL de imagen
        if imagen_url:
            if not imagen_url.startswith('http'):
                if imagen_url.startswith('//'):
                    imagen_url = 'https:' + imagen_url
                elif imagen_url.startswith('/'):
                    imagen_url = self.base_url + imagen_url
                else:
                    imagen_url = self.base_url + '/' + imagen_url
        
        return imagen_url
        
    def get_deportes(self) -> List[Dict]:
        """Extrae noticias de la sección Deportes"""
        try:
            url = f"{self.base_url}/deportes/"
            response = self.session.get(url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            noticias = []
            
            # Buscar contenedores de noticias específicos de El Popular
            containers = soup.find_all('div', class_=lambda x: x and any(word in str(x).lower() for word in ['item', 'spotlight', 'main', 'story']))
            
            for container in containers:
                try:
                    # Buscar enlaces dentro del contenedor
                    links = container.find_all('a', href=True)
                    if not links:
                        continue
                    
                    # Tomar el primer enlace que parezca una noticia
                    main_link = None
                    for link in links:
                        href = link.get('href')
                        if href and href.startswith('/') and len(href) > 10:
                            title = link.get_text(strip=True)
                            if title and len(title) > 15:
                                main_link = link
                                break
                    
                    if not main_link:
                        continue
                    
                    href = main_link.get('href')
                    title = main_link.get_text(strip=True)
                    
                    # Construir URL completa
                    if not href.startswith('http'):
                        full_url = self.base_url + href
                    else:
                        full_url = href
                    
                    # Buscar contenido relacionado
                    content = ""
                    content_elem = container.find('p') or container.find('span')
                    if content_elem:
                        content = content_elem.get_text(strip=True)
                    
                    # Buscar imagen en el contenedor
                    imagen_url = self._find_image_url(container)
                    
                    # Extraer fecha de publicación real
                    fecha_publicacion = get_publication_date(container, 'El Popular')
                    
                    noticias.append({
                        'titulo': title,
                        'contenido': content,
                        'enlace': full_url,
                        'imagen_url': imagen_url,
                        'categoria': 'Deportes',
                        'diario': 'El Popular',
                        'fecha_publicacion': fecha_publicacion if fecha_publicacion else datetime.now().date(),
                        'fecha_extraccion': datetime.now().isoformat()
                    })
                    
                    if len(noticias) >= 10:  # Limitar a 10 noticias
                        break
                        
                except Exception as e:
                    logging.warning(f"Error procesando contenedor de deportes: {e}")
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
            
            # Buscar contenedores de noticias específicos de El Popular
            containers = soup.find_all('div', class_=lambda x: x and any(word in str(x).lower() for word in ['item', 'spotlight', 'main', 'story']))
            
            for container in containers:
                try:
                    # Buscar enlaces dentro del contenedor
                    links = container.find_all('a', href=True)
                    if not links:
                        continue
                    
                    # Tomar el primer enlace que parezca una noticia
                    main_link = None
                    for link in links:
                        href = link.get('href')
                        if href and href.startswith('/') and len(href) > 10:
                            title = link.get_text(strip=True)
                            if title and len(title) > 15:
                                main_link = link
                                break
                    
                    if not main_link:
                        continue
                    
                    href = main_link.get('href')
                    title = main_link.get_text(strip=True)
                    
                    # Construir URL completa
                    if not href.startswith('http'):
                        full_url = self.base_url + href
                    else:
                        full_url = href
                    
                    # Buscar contenido relacionado
                    content = ""
                    content_elem = container.find('p') or container.find('span')
                    if content_elem:
                        content = content_elem.get_text(strip=True)
                    
                    # Buscar imagen en el contenedor
                    imagen_url = self._find_image_url(container)
                    
                    # Extraer fecha de publicación real
                    fecha_publicacion = get_publication_date(container, 'El Popular')
                    
                    noticias.append({
                        'titulo': title,
                        'contenido': content,
                        'enlace': full_url,
                        'imagen_url': imagen_url,
                        'categoria': 'Espectáculos',
                        'diario': 'El Popular',
                        'fecha_publicacion': fecha_publicacion if fecha_publicacion else datetime.now().date(),
                        'fecha_extraccion': datetime.now().isoformat()
                    })
                    
                    if len(noticias) >= 6:  # Limitar a 6 noticias
                        break
                        
                except Exception as e:
                    logging.warning(f"Error procesando contenedor de espectáculos: {e}")
                    continue
                    
            return noticias
            
        except Exception as e:
            logging.error(f"Error obteniendo espectáculos de El Popular: {e}")
            return []
    
    def get_mundo(self) -> List[Dict]:
        """Extrae noticias de la sección Actualidad (equivalente a Mundo)"""
        try:
            url = f"{self.base_url}/actualidad/"
            response = self.session.get(url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            noticias = []
            
            # Buscar artículos de actualidad usando la estructura específica de El Popular
            articles = soup.find_all('div', class_='Item_itemSection___UH_s')
            
            for article in articles[:10]:  # Limitar a 10 noticias
                try:
                    title_elem = article.find('h2') or article.find('h3') or article.find('a')
                    if not title_elem:
                        continue
                        
                    title = title_elem.get_text(strip=True)
                    link_elem = article.find('a')
                    link = link_elem.get('href') if link_elem else None
                    
                    if link and not link.startswith('http'):
                        link = self.base_url + link
                    
                    # Extraer contenido si es posible
                    content_elem = article.find('p') or article.find('div', class_='summary')
                    content = content_elem.get_text(strip=True) if content_elem else ""
                    
                    # Buscar imagen usando la función mejorada
                    imagen_url = self._find_image_url(article)
                    
                    # Extraer fecha de publicación real
                    fecha_publicacion = get_publication_date(container, 'El Popular')
                    
                    noticias.append({
                        'titulo': title,
                        'contenido': content,
                        'enlace': link,
                        'imagen_url': imagen_url,
                        'categoria': 'Mundo',
                        'diario': 'El Popular',
                        'fecha_publicacion': fecha_publicacion if fecha_publicacion else datetime.now().date(),
                        'fecha_extraccion': datetime.now().isoformat()
                    })
                except Exception as e:
                    logging.warning(f"Error procesando artículo de mundo: {e}")
                    continue
                    
            return noticias
            
        except Exception as e:
            logging.error(f"Error obteniendo mundo de El Popular: {e}")
            return []
    
    def get_all_news(self) -> List[Dict]:
        """Obtiene todas las noticias de todas las categorías"""
        all_news = []
        all_news.extend(self.get_deportes())
        all_news.extend(self.get_espectaculos())
        all_news.extend(self.get_mundo())
        return all_news

if __name__ == "__main__":
    scraper = ScraperPopular()
    noticias = scraper.get_all_news()
    print(f"Total de noticias extraídas: {len(noticias)}")
    for noticia in noticias[:3]:
        print(f"- {noticia['categoria']}: {noticia['titulo']}")
