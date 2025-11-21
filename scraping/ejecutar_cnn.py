"""
Script simple para ejecutar el scraping de CNN con Selenium
"""
import sys
import os
import io

# Configurar stdout para UTF-8 en Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Asegurar que el path esté correcto
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main_scraper import MainScraper, CNN_SCRAPER_TYPE

def main():
    print("="*60)
    print("SCRAPER DE CNN - EJECUTOR")
    print("="*60)
    print(f"\nScraper activo: {CNN_SCRAPER_TYPE}")
    
    if CNN_SCRAPER_TYPE != "Selenium":
        print("\nADVERTENCIA: No se esta usando Selenium.")
        print("CNN puede no funcionar correctamente sin Selenium.")
        respuesta = input("\n¿Deseas continuar de todas formas? (s/n): ")
        if respuesta.lower() != 's':
            print("Cancelado.")
            return
    
    print("\nIniciando scraping de CNN...")
    print("(Esto puede tardar varios minutos)\n")
    
    try:
        scraper = MainScraper()
        
        if 'cnn' not in scraper.scrapers:
            print("ERROR: Scraper de CNN no disponible")
            return
        
        cnn_scraper = scraper.scrapers['cnn']
        noticias = cnn_scraper.get_all_news(max_articles_per_section=10)
        
        print("\n" + "="*60)
        print("RESULTADOS")
        print("="*60)
        print(f"\nTotal noticias: {len(noticias)}")
        
        # Estadísticas
        categorias = {}
        con_imagenes = 0
        for n in noticias:
            cat = n['categoria']
            categorias[cat] = categorias.get(cat, 0) + 1
            if n['imagen_url']:
                con_imagenes += 1
        
        print(f"Con imagenes: {con_imagenes}/{len(noticias)}")
        print(f"\nPor categoria:")
        for cat, count in categorias.items():
            print(f"  - {cat}: {count}")
        
        # Verificar duplicados
        image_urls = [n['imagen_url'] for n in noticias if n['imagen_url']]
        duplicates = len(image_urls) - len(set(image_urls))
        if duplicates > 0:
            print(f"\nADVERTENCIA: {duplicates} imagenes duplicadas")
        else:
            print(f"\nOK: Sin imagenes duplicadas")
        
        # Ejemplos
        print(f"\nEjemplos (primeras 3):")
        for i, n in enumerate(noticias[:3], 1):
            print(f"\n{i}. [{n['categoria']}] {n['titulo'][:60]}...")
            print(f"   Imagen: {'SI' if n['imagen_url'] else 'NO'}")
            print(f"   URL: {n['enlace']}")
        
        print("\n" + "="*60)
        print("OK: Scraping completado")
        print("="*60)
        print("\nNOTA: Estas noticias NO se guardaron automaticamente en la base de datos.")
        print("Para guardarlas, ejecuta el scraping desde el backend:")
        print("  POST http://localhost:8000/scraping/ejecutar")
        
    except Exception as e:
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()

