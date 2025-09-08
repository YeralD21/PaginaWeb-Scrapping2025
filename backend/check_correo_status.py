from database import get_db
from models import Noticia
db = next(get_db())

# Verificar cuántas noticias tiene Diario Correo actualmente
correo_count = db.query(Noticia).filter(Noticia.diario_id == 1).count()
print(f'Noticias actuales de Diario Correo: {correo_count}')

# Mostrar las noticias que quedan
noticias_restantes = db.query(Noticia).filter(Noticia.diario_id == 1).all()
print(f'\nNoticias restantes:')
for noticia in noticias_restantes:
    print(f'  - ID: {noticia.id}, Título: {noticia.titulo[:60]}...')

