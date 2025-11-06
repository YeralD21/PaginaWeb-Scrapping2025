import sys
sys.path.append('..')
from scraping.scraper_facebook import ScraperFacebook

print("🧪 Probando scraper de Facebook con Playwright...\n")

scraper = ScraperFacebook()
news = scraper.get_all_news()

print(f"\n✅ Total de noticias obtenidas: {len(news)}")
print("\n📰 Primeras 5 noticias:\n")

for i, n in enumerate(news[:5]):
    print(f"{i+1}. {n['titulo'][:80]}...")
    print(f"   Autor: {n['autor']}")
    print(f"   Enlace: {n['enlace']}")
    print(f"   Imagen: {'✅ Sí' if n['imagen_url'] else '❌ No'}")
    print()

