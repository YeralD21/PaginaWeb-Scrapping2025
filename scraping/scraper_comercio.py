#!/usr/bin/env python3
"""
Script rápido para scrapear solo 10 noticias de El Comercio con imágenes
y guardarlas en la base de datos.

Uso:
    python scraper_comercio.py

Este script:
- Scrapea solo las 10 noticias más recientes de El Comercio
- Prioriza noticias con imágenes
- Guarda en la base de datos
- Ideal para presentaciones rápidas
"""

import sys
import os
from datetime import datetime
import logging

# Agregar el directorio raíz al path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('scraper_comercio.log', encoding='utf-8')
    ]
)
logger = logging.getLogger(__name__)

def main():
    """Función principal para scrapear 10 noticias de El Comercio con imágenes"""
    try:
        # Importar el scraper de El Comercio con Selenium
        try:
            from scraper_comercio_selenium import ScraperComercioSelenium
            scraper = ScraperComercioSelenium()
            logger.info("✅ Usando ScraperComercio con Selenium")
        except ImportError as e:
            logger.error(f"❌ Error importando ScraperComercioSelenium: {e}")
            sys.exit(1)
        
        # Importar el servicio de scraping
        backend_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'backend')
        if backend_path not in sys.path:
            sys.path.insert(0, backend_path)
        
        from scraping_service import ScrapingService
        
        logger.info("=" * 80)
        logger.info("🚀 SCRAPEANDO 10 NOTICIAS DE EL COMERCIO (CON IMÁGENES)")
        logger.info("=" * 80)
        
        start_time = datetime.now()
        
        # Scrapear solo las categorías más importantes para obtener 10 noticias rápidamente
        logger.info("📰 Extrayendo noticias de El Comercio (priorizando con imágenes)...")
        
        all_news = []
        
        # Scrapear solo 2-3 categorías para obtener 10 noticias rápidamente
        categorias_prioritarias = ['deportes', 'economia', 'politica']
        
        for categoria in categorias_prioritarias:
            if len(all_news) >= 10:
                break
                
            try:
                categoria_method = getattr(scraper, f'get_{categoria}', None)
                if categoria_method:
                    logger.info(f"📂 Extrayendo {categoria}...")
                    # Limitar a 5 noticias por categoría para ser más rápido
                    noticias = categoria_method(limit=5)
                    
                    # Priorizar noticias con imágenes
                    noticias_con_imagen = [n for n in noticias if n.get('imagen_url') and n.get('imagen_url').strip()]
                    noticias_sin_imagen = [n for n in noticias if not (n.get('imagen_url') and n.get('imagen_url').strip())]
                    
                    # Agregar primero las que tienen imagen
                    for noticia in noticias_con_imagen:
                        if len(all_news) >= 10:
                            break
                        all_news.append(noticia)
                    
                    # Si aún no tenemos 10, agregar las que no tienen imagen
                    for noticia in noticias_sin_imagen:
                        if len(all_news) >= 10:
                            break
                        all_news.append(noticia)
                    
                    logger.info(f"   ✅ {categoria}: {len(noticias)} noticias encontradas ({len(noticias_con_imagen)} con imagen)")
            except Exception as e:
                logger.error(f"   ❌ Error en {categoria}: {e}")
                continue
        
        # Limitar a exactamente 10
        all_news = all_news[:10]
        
        logger.info(f"\n✅ Total de noticias extraídas: {len(all_news)}")
        
        # Mostrar estadísticas
        imagenes_con = sum(1 for n in all_news if n.get('imagen_url') and n.get('imagen_url').strip())
        imagenes_sin = len(all_news) - imagenes_con
        
        logger.info(f"📊 Con imagen: {imagenes_con}")
        logger.info(f"📊 Sin imagen: {imagenes_sin}")
        
        if not all_news:
            logger.warning("⚠️ No se extrajeron noticias.")
            return
        
        # Mostrar las noticias que se van a guardar
        logger.info("\n📋 Noticias a guardar:")
        for i, news in enumerate(all_news, 1):
            tiene_imagen = "✅" if news.get('imagen_url') and news.get('imagen_url').strip() else "❌"
            logger.info(f"   {i}. {tiene_imagen} [{news.get('categoria', 'General')}] {news.get('titulo', 'Sin título')[:60]}...")
        
        # Guardar en la base de datos
        logger.info("\n💾 Guardando noticias en la base de datos...")
        scraping_service = ScrapingService()
        save_result = scraping_service.save_news_to_database_enhanced(all_news)
        
        # Mostrar resultados
        duration = (datetime.now() - start_time).total_seconds()
        
        logger.info("\n" + "=" * 80)
        logger.info("✅ SCRAPING COMPLETADO")
        logger.info("=" * 80)
        logger.info(f"📊 Noticias extraídas: {len(all_news)}")
        logger.info(f"💾 Noticias guardadas: {save_result['total_saved']}")
        logger.info(f"🔄 Duplicados detectados: {save_result['duplicates_detected']}")
        logger.info(f"⏱️  Duración: {duration:.2f} segundos")
        logger.info(f"📷 Noticias con imagen: {imagenes_con}/{len(all_news)}")
        
        logger.info("\n" + "=" * 80)
        logger.info("✨ Las noticias ya están disponibles en http://localhost:3000/diario/el-comercio")
        logger.info("=" * 80)
        
    except Exception as e:
        logger.error(f"❌ Error durante el scraping: {e}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    main()

