"""
Script simple para verificar las fechas usando PostgreSQL
"""
import os
from dotenv import load_dotenv
import psycopg2

# Cargar variables de entorno
load_dotenv()

# Configuración de la base de datos
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'diarios_scraping')
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'password')

# Conectar a la base de datos
try:
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )
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
        print(f"URL: {enlace[:80] if enlace else 'N/A'}...")
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
    
except Exception as e:
    print(f"\n❌ Error: {e}\n")

