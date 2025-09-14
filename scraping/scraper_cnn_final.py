import requests
from bs4 import BeautifulSoup
from datetime import datetime
import logging
from typing import List, Dict
import re

class ScraperCNNFinal:
    def __init__(self):
        self.base_url = 'https://cnnespanol.cnn.com'
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
    
    def get_article_content(self, article_url: str) -> str:
        """Extrae el contenido de un artículo específico"""
        try:
            if not article_url or 'cnnespanol.cnn.com' not in article_url:
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
                            if text and len(text) > 30:
                                content_paragraphs.append(text)
                    
                    if content_paragraphs:
                        break
            
            # Si no encontramos contenido, buscar todos los párrafos
            if not content_paragraphs:
                all_paragraphs = soup.find_all('p')
                for p in all_paragraphs:
                    text = p.get_text(strip=True)
                    if text and len(text) > 30:
                        content_paragraphs.append(text)
            
            # Unir y limpiar
            full_content = '\n\n'.join(content_paragraphs)
            if len(full_content) > 3000:
                full_content = full_content[:3000] + "..."
            
            return full_content
            
        except Exception as e:
            logging.warning(f"Error extrayendo contenido de {article_url}: {e}")
            return ""
    
    def extract_news_from_page(self, url: str, category: str) -> List[Dict]:
        """Extrae noticias de una página específica"""
        noticias = []
        processed_urls = set()
        
        try:
            response = self.session.get(url, timeout=15)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Buscar enlaces que parecen noticias
            links = soup.find_all('a', href=True)
            
            for link in links:
                try:
                    href = link.get('href', '')
                    if not href:
                        continue
                    
                    # Construir URL completa
                    if href.startswith('/'):
                        full_url = self.base_url + href
                    elif href.startswith('http') and 'cnnespanol.cnn.com' in href:
                        full_url = href
                    else:
                        continue
                    
                    # Evitar duplicados
                    if full_url in processed_urls:
                        continue
                    processed_urls.add(full_url)
                    
                    # Obtener título
                    title = link.get_text(strip=True)
                    
                    # Filtrar títulos válidos
                    if (len(title) < 20 or len(title) > 200 or 
                        title.lower() in ['ver más', 'leer más', 'más información', 'cnn', 'cnn en español', 'economía y dinero', 'mundo', 'deportes'] or
                        'imagen' in title.lower() or 'foto' in title.lower() or
                        title.isdigit() or len(title.split()) < 4 or
                        title == category or title in ['Economía', 'Mundo', 'Deportes']):
                        continue
                    
                    # Buscar imagen
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
                    
                    # Obtener contenido básico
                    content = ""
                    if parent:
                        content_elem = (parent.find('p') or 
                                      parent.find('div', class_=lambda x: x and ('summary' in x.lower() or 'excerpt' in x.lower())) or
                                      parent.find('span', class_=lambda x: x and 'summary' in x.lower()))
                        if content_elem:
                            content = content_elem.get_text(strip=True)
                    
                    # Si no hay contenido, intentar extraer del artículo
                    if not content or len(content) < 50:
                        print(f"🔍 Extrayendo contenido de CNN: {full_url}")
                        content = self.get_article_content(full_url)
                    
                    # Si aún no hay contenido, usar resumen básico
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
            
            logging.info(f"Obtenidas {len(noticias)} noticias de {url}")
            return noticias
            
        except Exception as e:
            logging.error(f"Error obteniendo {url}: {e}")
            return []
    
    def get_mundo(self) -> List[Dict]:
        """Extrae noticias de la sección Mundo"""
        noticias = []
        
        # URLs específicas de mundo
        urls = [
            f"{self.base_url}/mundo/",
            f"{self.base_url}/americas/",
            f"{self.base_url}/internacional/"
        ]
        
        for url in urls:
            section_noticias = self.extract_news_from_page(url, 'Mundo')
            noticias.extend(section_noticias)
        
        return noticias
    
    def get_deportes(self) -> List[Dict]:
        """Extrae noticias de la sección Deportes"""
        noticias = []
        
        # URLs específicas de deportes
        urls = [
            f"{self.base_url}/deportes/",
            f"{self.base_url}/futbol/",
            f"{self.base_url}/olimpiadas/"
        ]
        
        for url in urls:
            section_noticias = self.extract_news_from_page(url, 'Deportes')
            noticias.extend(section_noticias)
        
        return noticias
    
    def get_economia(self) -> List[Dict]:
        """Extrae noticias de la sección Economía"""
        noticias = []
        
        # URLs específicas de economía
        urls = [
            f"{self.base_url}/economia/",
            f"{self.base_url}/negocios/",
            f"{self.base_url}/dinero/"
        ]
        
        for url in urls:
            section_noticias = self.extract_news_from_page(url, 'Economía')
            noticias.extend(section_noticias)
        
        return noticias
    
    def get_all_news(self) -> List[Dict]:
        """Obtiene todas las noticias de todas las categorías"""
        all_news = []
        all_news.extend(self.get_mundo())
        all_news.extend(self.get_deportes())
        all_news.extend(self.get_economia())
        return all_news

if __name__ == "__main__":
    scraper = ScraperCNNFinal()
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
    for i, noticia in enumerate(noticias[:10]):
        print(f"{i+1}. {noticia['categoria']}: {noticia['titulo'][:70]}...")
