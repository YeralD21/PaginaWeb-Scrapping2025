#!/usr/bin/env python3
"""
Script para probar la extracción de contenido completo de los scrapers mejorados
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'scraping'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from scraper_popular import ScraperPopular
from scraper_comercio import ScraperComercio
from scraper_correo import ScraperCorreo

def test_content_extraction():
    print("🚀 PROBANDO EXTRACCIÓN DE CONTENIDO COMPLETO")
    print("=" * 60)
    
    # Test El Popular
    print("\n📰 PROBANDO EL POPULAR...")
    scraper_popular = ScraperPopular()
    noticias_popular = scraper_popular.get_deportes()
    
    if noticias_popular:
        noticia = noticias_popular[0]
        print(f"✅ Título: {noticia['titulo'][:80]}...")
        print(f"📄 Contenido ({len(noticia['contenido'])} chars): {noticia['contenido'][:200]}...")
        print(f"🔗 Enlace: {noticia['enlace']}")
    else:
        print("❌ No se encontraron noticias de El Popular")
    
    # Test El Comercio
    print("\n📰 PROBANDO EL COMERCIO...")
    scraper_comercio = ScraperComercio()
    noticias_comercio = scraper_comercio.get_deportes()
    
    if noticias_comercio:
        noticia = noticias_comercio[0]
        print(f"✅ Título: {noticia['titulo'][:80]}...")
        print(f"📄 Contenido ({len(noticia['contenido'])} chars): {noticia['contenido'][:200]}...")
        print(f"🔗 Enlace: {noticia['enlace']}")
    else:
        print("❌ No se encontraron noticias de El Comercio")
    
    # Test Diario Correo
    print("\n📰 PROBANDO DIARIO CORREO...")
    scraper_correo = ScraperCorreo()
    noticias_correo = scraper_correo.get_deportes()
    
    if noticias_correo:
        noticia = noticias_correo[0]
        print(f"✅ Título: {noticia['titulo'][:80]}...")
        print(f"📄 Contenido ({len(noticia['contenido'])} chars): {noticia['contenido'][:200]}...")
        print(f"🔗 Enlace: {noticia['enlace']}")
    else:
        print("❌ No se encontraron noticias de Diario Correo")
    
    print("\n" + "=" * 60)
    print("🎉 PRUEBA COMPLETADA")

if __name__ == "__main__":
    test_content_extraction()
