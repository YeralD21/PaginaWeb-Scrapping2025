import asyncio
import aiohttp
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import logging
from typing import List, Dict
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

class EnhancedScraper:
    """Scraper mejorado con procesamiento paralelo y más categorías"""
    
    def __init__(self):
        self.base_urls = {
            'comercio': 'https://elcomercio.pe',
            'correo': 'https://diariocorreo.pe',
            'popular': 'https://elpopular.pe'
        }
        
        self.categories = {
            'comercio': ['deportes', 'economia', 'mundo', 'politica', 'sociedad', 'tecnologia', 'cultura'],
            'correo': ['deportes', 'economia', 'espectaculos', 'mundo', 'politica', 'sociedad', 'tecnologia'],
            'popular': ['deportes', 'espectaculos', 'actualidad', 'politica', 'sociedad', 'tecnologia']
        }
        
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    
    async def fetch_page(self, session: aiohttp.ClientSession, url: str) -> str:
        """Obtiene el contenido de una página de forma asíncrona"""
        try:
            async with session.get(url, headers=self.headers, timeout=10) as response:
                if response.status == 200:
                    return await response.text()
                else:
                    logging.warning(f"Error {response.status} al obtener {url}")
                    return ""
        except Exception as e:
            logging.error(f"Error obteniendo {url}: {e}")
            return ""
    
    async def scrape_category_async(self, session: aiohttp.ClientSession, diario: str, category: str, max_pages: int = 5) -> List[Dict]:
        """Scraping asíncrono de una categoría específica"""
        noticias = []
        base_url = self.base_urls[diario]
        
        # Crear tareas para múltiples páginas
        tasks = []
        for page in range(1, max_pages + 1):
            if page == 1:
                url = f"{base_url}/{category}/"
            else:
                url = f"{base_url}/{category}/page/{page}/"
            
            tasks.append(self.fetch_page(session, url))
        
        # Ejecutar todas las páginas en paralelo
        pages_content = await asyncio.gather(*tasks, return_exceptions=True)
        
        for page_content in pages_content:
            if isinstance(page_content, Exception) or not page_content:
                continue
                
            soup = BeautifulSoup(page_content, 'html.parser')
            
            # Selectores específicos por diario
            if diario == 'comercio':
                articles = soup.find_all('article') or soup.find_all('div', class_='story-item')
            elif diario == 'correo':
                articles = soup.find_all('article', class_='story-item') or soup.find_all('div', class_='story-item')
            else:  # popular
                articles = soup.find_all('div', class_=lambda x: x and any(word in str(x).lower() for word in ['item', 'spotlight', 'main', 'story']))
            
            for article in articles[:20]:  # Aumentar a 20 por página
                try:
                    noticia = await self.extract_article_data(article, diario, category, base_url)
                    if noticia:
                        noticias.append(noticia)
                except Exception as e:
                    logging.warning(f"Error extrayendo artículo: {e}")
                    continue
        
        return noticias
    
    async def extract_article_data(self, article, diario: str, category: str, base_url: str) -> Dict:
        """Extrae datos de un artículo individual"""
        try:
            # Buscar título
            title_elem = article.find('h2') or article.find('h3') or article.find('a')
            if not title_elem:
                return None
            
            title = title_elem.get_text(strip=True)
            if len(title) < 10:  # Filtrar títulos muy cortos
                return None
            
            # Buscar enlace
            link_elem = article.find('a')
            link = link_elem.get('href') if link_elem else None
            if link and not link.startswith('http'):
                link = base_url + link
            
            # Buscar imagen
            imagen_url = None
            img_elem = article.find('img')
            if img_elem:
                imagen_url = img_elem.get('src') or img_elem.get('data-src')
                if imagen_url and not imagen_url.startswith('http'):
                    if imagen_url.startswith('//'):
                        imagen_url = 'https:' + imagen_url
                    else:
                        imagen_url = base_url + imagen_url
            
            # Buscar contenido básico
            content_elem = article.find('p') or article.find('div', class_='summary')
            content = content_elem.get_text(strip=True) if content_elem else ""
            
            # Mapear nombres de diarios
            diario_names = {
                'comercio': 'El Comercio',
                'correo': 'Diario Correo',
                'popular': 'El Popular'
            }
            
            return {
                'titulo': title,
                'contenido': content,
                'enlace': link,
                'imagen_url': imagen_url,
                'categoria': category.title(),
                'diario': diario_names[diario],
                'fecha_publicacion': datetime.now().date(),
                'fecha_extraccion': datetime.now().isoformat()
            }
            
        except Exception as e:
            logging.warning(f"Error extrayendo datos del artículo: {e}")
            return None
    
    async def scrape_all_enhanced(self) -> List[Dict]:
        """Scraping completo con procesamiento paralelo"""
        all_news = []
        
        async with aiohttp.ClientSession() as session:
            # Crear tareas para todos los diarios y categorías
            tasks = []
            
            for diario, categories in self.categories.items():
                for category in categories:
                    task = self.scrape_category_async(session, diario, category, max_pages=5)
                    tasks.append(task)
            
            # Ejecutar todas las tareas en paralelo
            logging.info(f"Iniciando scraping paralelo de {len(tasks)} categorías...")
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Consolidar resultados
            for result in results:
                if isinstance(result, Exception):
                    logging.error(f"Error en scraping: {result}")
                    continue
                all_news.extend(result)
        
        logging.info(f"Scraping completado. Total de noticias: {len(all_news)}")
        return all_news
    
    def scrape_historical(self, days_back: int = 7) -> List[Dict]:
        """Scraping histórico de días anteriores (simulado)"""
        # En un scraper real, esto navegaría a archivos históricos
        # Por ahora, simulamos con noticias actuales pero con fechas anteriores
        historical_news = []
        
        for i in range(days_back):
            date = datetime.now().date() - timedelta(days=i)
            # Aquí podrías implementar scraping de archivos históricos
            # Por simplicidad, usamos noticias actuales con fechas modificadas
            pass
        
        return historical_news

# Función de conveniencia para usar el scraper mejorado
async def get_enhanced_news():
    """Función principal para obtener noticias con el scraper mejorado"""
    scraper = EnhancedScraper()
    return await scraper.scrape_all_enhanced()

if __name__ == "__main__":
    # Ejecutar scraping mejorado
    async def main():
        news = await get_enhanced_news()
        print(f"Total de noticias obtenidas: {len(news)}")
        
        # Mostrar estadísticas por diario
        stats = {}
        for noticia in news:
            diario = noticia['diario']
            stats[diario] = stats.get(diario, 0) + 1
        
        print("\nEstadísticas por diario:")
        for diario, count in stats.items():
            print(f"  {diario}: {count} noticias")
    
    asyncio.run(main())
