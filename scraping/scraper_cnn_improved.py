import requests
from bs4 import BeautifulSoup
from datetime import datetime
import logging
from typing import List, Dict
import re

class ScraperCNNImproved:
    def __init__(self):
        self.base_url = 'https://cnnespanol.cnn.com'
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
    
    def get_full_article_content(self, article_url: str) -> str:
        """Extrae el contenido completo de un artículo individual"""
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
                '.main p',
                'div.zn-body__read-all p'
            ]
            
            content_paragraphs = []
            
            for selector in content_selectors:
                elements = soup.select(selector)
                if elements:
                    for element in elements:
                        paragraphs = element.find_all('p')
                        for p in paragraphs:
                            text = p.get_text(strip=True)
                            if text and len(text) > 30:  # Párrafos con contenido sustancial
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
    
    def extract_news_from_links(self, soup: BeautifulSoup, category: str, max_links: int = 30) -> List[Dict]:
        """Extrae noticias de todos los enlaces de una página"""
        noticias = []
        processed_urls = set()  # Para evitar duplicados
        
        # Buscar todos los enlaces
        links = soup.find_all('a', href=True)
        
        for link in links[:max_links]:
            try:
                href = link.get('href', '')
                if not href:
                    continue
                
                # Construir URL completa
                if href.startswith('/'):
                    full_url = self.base_url + href
                elif href.startswith('http'):
                    full_url = href
                else:
                    continue
                
                # Evitar duplicados
                if full_url in processed_urls:
                    continue
                processed_urls.add(full_url)
                
                # Obtener texto del enlace como título
                title = link.get_text(strip=True)
                
                # Filtrar títulos válidos
                if (len(title) < 15 or len(title) > 200 or 
                    title.lower() in ['ver más', 'leer más', 'más información', 'cnn', 'cnn en español'] or
                    'imagen' in title.lower() or 'foto' in title.lower() or
                    title.isdigit() or len(title.split()) < 3):
                    continue
                
                # Buscar imagen en el enlace o elemento padre
                img_elem = None
                parent = link.find_parent()
                
                # Buscar imagen en diferentes niveles
                for elem in [link, parent, parent.find_parent() if parent else None]:
                    if elem:
                        img_elem = elem.find('img')
                        if img_elem:
                            break
                
                imagen_url = None
                if img_elem:
                    imagen_url = img_elem.get('src') or img_elem.get('data-src') or img_elem.get('data-lazy-src')
                    if imagen_url and not imagen_url.startswith('http'):
                        if imagen_url.startswith('//'):
                            imagen_url = 'https:' + imagen_url
                        else:
                            imagen_url = self.base_url + imagen_url
                
                # Obtener contenido básico del resumen
                content = ""
                if parent:
                    # Buscar párrafos de resumen
                    content_elem = (parent.find('p') or 
                                  parent.find('div', class_=lambda x: x and ('summary' in x.lower() or 'excerpt' in x.lower())) or
                                  parent.find('span', class_=lambda x: x and 'summary' in x.lower()))
                    if content_elem:
                        content = content_elem.get_text(strip=True)
                
                # Si no hay contenido, intentar extraer del artículo completo
                if not content or len(content) < 50:
                    print(f"🔍 Extrayendo contenido de CNN en Español: {full_url}")
                    content = self.get_full_article_content(full_url)
                
                # Si aún no hay contenido, usar un resumen básico
                if not content:
                    content = f"Noticia de {category} de CNN en Español. Para más información, visita el enlace completo."
                
                noticias.append({
                    'titulo': title,
                    'contenido': content,
                    'enlace': full_url,
                    'imagen_url': imagen_url,
                    'categoria': category,
                    'diario': 'CNN en Español',
                    'fecha_publicacion': datetime.now().date(),
                    'fecha_extraccion': datetime.now().isoformat()
                })
                
            except Exception as e:
                logging.warning(f"Error procesando enlace: {e}")
                continue
        
        return noticias
    
    def get_mundo(self, max_pages=2) -> List[Dict]:
        """Extrae noticias de la sección Mundo"""
        try:
            noticias = []
            
            # URLs específicas de mundo
            urls = [
                f"{self.base_url}/mundo/",
                f"{self.base_url}/americas/",
                f"{self.base_url}/internacional/"
            ]
            
            for url in urls:
                try:
                    response = self.session.get(url, timeout=15)
                    response.raise_for_status()
                    
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Extraer noticias de los enlaces
                    section_noticias = self.extract_news_from_links(soup, 'Mundo', max_links=25)
                    noticias.extend(section_noticias)
                    
                    logging.info(f"Obtenidas {len(section_noticias)} noticias de {url}")
                    
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
                    response = self.session.get(url, timeout=15)
                    response.raise_for_status()
                    
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Extraer noticias de los enlaces
                    section_noticias = self.extract_news_from_links(soup, 'Deportes', max_links=25)
                    noticias.extend(section_noticias)
                    
                    logging.info(f"Obtenidas {len(section_noticias)} noticias de {url}")
                    
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
                    response = self.session.get(url, timeout=15)
                    response.raise_for_status()
                    
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Extraer noticias de los enlaces
                    section_noticias = self.extract_news_from_links(soup, 'Economía', max_links=25)
                    noticias.extend(section_noticias)
                    
                    logging.info(f"Obtenidas {len(section_noticias)} noticias de {url}")
                    
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
    scraper = ScraperCNNImproved()
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
    
    # Mostrar algunas noticias de ejemplo
    print("\n📰 Ejemplos de noticias:")
    for i, noticia in enumerate(noticias[:5]):
        print(f"{i+1}. {noticia['categoria']}: {noticia['titulo'][:60]}...")
