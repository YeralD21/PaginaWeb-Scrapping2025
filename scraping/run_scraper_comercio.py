#!/usr/bin/env python3
"""
Script independiente para scrapear solo noticias de El Comercio
y guardarlas en la base de datos.

Uso:
    python run_scraper_comercio.py [--limit N] [--categoria CATEGORIA]

Ejemplos:
    python run_scraper_comercio.py                    # Todas las noticias
    python run_scraper_comercio.py --limit 10         # Solo 10 noticias más recientes
    python run_scraper_comercio.py --limit 10 --categoria deportes  # 10 de deportes

Este script:
- Usa Selenium para scrapear noticias de El Comercio (con fallback a BeautifulSoup)
- Guarda las noticias en la base de datos PostgreSQL
- Evita duplicados
- Prioriza noticias con imágenes
- Muestra estadísticas del proceso
"""

import sys
import os
import argparse
from datetime import datetime
import logging

# Agregar el directorio raíz al path para importar módulos del backend
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
    """Función principal para scrapear y guardar noticias de El Comercio"""
    # Configurar argumentos de línea de comandos
    parser = argparse.ArgumentParser(description='Scrapear noticias de El Comercio')
    parser.add_argument('--limit', type=int, default=None, help='Número máximo de noticias a scrapear (por defecto: todas)')
    parser.add_argument('--categoria', type=str, default=None, help='Categoría específica (deportes, economia, mundo, politica, sociedad, tecnologia, cultura, espectaculos)')
    args = parser.parse_args()
    
    try:
        # Importar el scraper de El Comercio con Selenium
        try:
            from scraper_comercio_selenium import ScraperComercioSelenium
            scraper = ScraperComercioSelenium()
            logger.info("✅ Usando ScraperComercio con Selenium")
        except ImportError as e:
            logger.error(f"❌ Error importando ScraperComercioSelenium: {e}")
            logger.error("Asegúrate de que Selenium esté instalado: pip install selenium")
            logger.error("Y que ChromeDriver esté disponible en el PATH")
            sys.exit(1)
        
        # Importar el servicio de scraping para guardar en la base de datos
        # Asegurar que el path esté correcto
        backend_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'backend')
        if backend_path not in sys.path:
            sys.path.insert(0, backend_path)
        
        from scraping_service import ScrapingService
        
        logger.info("=" * 80)
        logger.info("🚀 INICIANDO SCRAPING DE EL COMERCIO")
        if args.limit:
            logger.info(f"📊 Límite: {args.limit} noticias")
        if args.categoria:
            logger.info(f"📂 Categoría: {args.categoria}")
        logger.info("=" * 80)
        
        start_time = datetime.now()
        
        # Obtener noticias de El Comercio
        logger.info("📰 Extrayendo noticias de El Comercio...")
        
        if args.categoria:
            # Scrapear solo una categoría específica
            categoria_method = getattr(scraper, f'get_{args.categoria.lower()}', None)
            if categoria_method:
                all_news = categoria_method()
            else:
                logger.error(f"❌ Categoría '{args.categoria}' no válida")
                logger.info("Categorías disponibles: deportes, economia, mundo, politica, sociedad, tecnologia, cultura, espectaculos")
                sys.exit(1)
        else:
            # Obtener noticias de todas las categorías
            # Si hay límite, limitar por categoría para obtener las más recientes
            limit_per_category = max(3, args.limit // 5) if args.limit else 10
            all_news = scraper.get_all_news(limit_per_category=limit_per_category)
        
        # Aplicar límite final si se especificó
        if args.limit and len(all_news) > args.limit:
            # Priorizar noticias con imágenes y más recientes
            noticias_con_imagen = [n for n in all_news if n.get('imagen_url') and n.get('imagen_url').strip()]
            noticias_sin_imagen = [n for n in all_news if not (n.get('imagen_url') and n.get('imagen_url').strip())]
            
            # Ordenar por fecha de extracción (más recientes primero)
            noticias_con_imagen.sort(key=lambda x: x.get('fecha_extraccion', ''), reverse=True)
            noticias_sin_imagen.sort(key=lambda x: x.get('fecha_extraccion', ''), reverse=True)
            
            # Tomar primero las que tienen imagen, luego las que no
            if len(noticias_con_imagen) >= args.limit:
                all_news = noticias_con_imagen[:args.limit]
            else:
                all_news = noticias_con_imagen + noticias_sin_imagen[:args.limit - len(noticias_con_imagen)]
            
            logger.info(f"📊 Limitando a {args.limit} noticias (priorizando con imágenes y más recientes)")
        
        logger.info(f"✅ Total de noticias extraídas: {len(all_news)}")
        
        if not all_news:
            logger.warning("⚠️ No se extrajeron noticias. Verifica la conexión o la estructura del sitio.")
            return
        
        # Mostrar estadísticas de extracción
        categorias = {}
        imagenes_con = 0
        imagenes_sin = 0
        
        for news in all_news:
            categoria = news.get('categoria', 'General')
            categorias[categoria] = categorias.get(categoria, 0) + 1
            
            if news.get('imagen_url') and news['imagen_url'].strip():
                imagenes_con += 1
            else:
                imagenes_sin += 1
        
        logger.info("\n📊 ESTADÍSTICAS DE EXTRACCIÓN:")
        logger.info(f"   Total de noticias: {len(all_news)}")
        logger.info(f"   Con imagen: {imagenes_con}")
        logger.info(f"   Sin imagen: {imagenes_sin}")
        logger.info(f"   Por categoría:")
        for cat, count in sorted(categorias.items(), key=lambda x: x[1], reverse=True):
            logger.info(f"      - {cat}: {count}")
        
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
        logger.info(f"🚨 Alertas activadas: {save_result['alerts_triggered']}")
        logger.info(f"⏱️  Duración: {duration:.2f} segundos")
        
        if save_result.get('errors'):
            logger.warning(f"\n⚠️ Errores encontrados: {len(save_result['errors'])}")
            for error in save_result['errors'][:5]:  # Mostrar solo los primeros 5
                logger.warning(f"   - {error}")
        
        logger.info("\n" + "=" * 80)
        logger.info("✨ Las noticias ya están disponibles en el frontend")
        logger.info("=" * 80)
        
    except ImportError as e:
        logger.error(f"❌ Error de importación: {e}")
        logger.error("Asegúrate de que todos los módulos estén disponibles.")
        logger.error("Ejecuta desde el directorio raíz del proyecto.")
        sys.exit(1)
    except Exception as e:
        logger.error(f"❌ Error durante el scraping: {e}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    main()

