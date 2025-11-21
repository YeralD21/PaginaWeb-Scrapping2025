"""
Script simple para verificar las fechas usando SQL directo
"""
import sqlite3
from datetime import datetime

# Conectar a la base de datos
conn = sqlite3.connect('noticias.db')
cursor = conn.cursor()

print("\n" + "="*80)
print("ÚLTIMAS 10 NOTICIAS DE EL COMERCIO")
print("="*80 + "\n")

# Obtener las últimas 10 noticias de El Comercio
cursor.execute("""
    SELECT n.id, n.titulo, n.fecha_publicacion, n.fecha_extraccion, n.enlace
    FROM noticias n
    JOIN diarios d ON n.diario_id = d.id
    WHERE d.nombre = 'El Comercio'
    ORDER BY n.fecha_extraccion DESC
    LIMIT 10
""")

noticias = cursor.fetchall()

for n in noticias:
    id_noticia, titulo, fecha_pub, fecha_ext, enlace = n
    print(f"ID: {id_noticia}")
    print(f"Título: {titulo[:70]}...")
    print(f"Fecha de publicación: {fecha_pub}")
    print(f"Fecha de extracción: {fecha_ext}")
    print(f"URL: {enlace[:80]}...")
    print("-" * 80)

print("\n" + "="*80)
print("NOTICIAS DE EL COMERCIO POR FECHA DE PUBLICACIÓN (ÚLTIMAS 10 FECHAS)")
print("="*80 + "\n")

cursor.execute("""
    SELECT DATE(n.fecha_publicacion) as fecha, COUNT(*) as total
    FROM noticias n
    JOIN diarios d ON n.diario_id = d.id
    WHERE d.nombre = 'El Comercio'
    GROUP BY DATE(n.fecha_publicacion)
    ORDER BY fecha DESC
    LIMIT 10
""")

fechas_count = cursor.fetchall()

for fecha, total in fechas_count:
    print(f"{fecha}: {total} noticias")

conn.close()
print("\n✅ Verificación completada\n")

