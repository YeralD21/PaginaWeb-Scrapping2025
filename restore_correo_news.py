from scraping.scraper_correo import ScraperCorreo
from backend.database import get_db
from backend.models import Noticia, Diario
from datetime import datetime
import logging

print('=== RESTAURANDO NOTICIAS DE DIARIO CORREO ===')

# Configurar logging
logging.basicConfig(level=logging.INFO)

# Crear scraper de Diario Correo
scraper = ScraperCorreo()

# Obtener noticias
print('Obteniendo noticias de Diario Correo...')
noticias = scraper.get_all_news()
print(f'Noticias obtenidas: {len(noticias)}')

# Conectar a la base de datos
db = next(get_db())

# Obtener el diario
diario = db.query(Diario).filter(Diario.nombre == 'Diario Correo').first()
if not diario:
    print('Error: Diario Correo no encontrado')
    exit(1)

print(f'Diario encontrado: {diario.nombre} (ID: {diario.id})')

# Guardar noticias
noticias_guardadas = 0
for news_item in noticias:
    try:
        # Verificar si la noticia ya existe
        existing = db.query(Noticia).filter(
            Noticia.titulo == news_item['titulo'],
            Noticia.diario_id == diario.id,
            Noticia.enlace == news_item.get('enlace', '')
        ).first()
        
        if existing:
            print(f'Noticia ya existe: {news_item["titulo"][:50]}...')
            continue
        
        # Crear nueva noticia
        noticia = Noticia(
            titulo=news_item['titulo'],
            contenido=news_item.get('contenido', ''),
            enlace=news_item.get('enlace', ''),
            imagen_url=news_item.get('imagen_url'),
            categoria=news_item['categoria'],
            fecha_extraccion=datetime.fromisoformat(news_item['fecha_extraccion']),
            diario_id=diario.id
        )
        
        db.add(noticia)
        noticias_guardadas += 1
        print(f'Guardando: {news_item["titulo"][:50]}...')
        
    except Exception as e:
        print(f'Error guardando noticia: {e}')
        continue

# Confirmar cambios
db.commit()

print(f'\n=== RESUMEN ===')
print(f'Noticias guardadas: {noticias_guardadas}')
print(f'Total noticias de Diario Correo ahora: {db.query(Noticia).filter(Noticia.diario_id == diario.id).count()}')

