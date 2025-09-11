from database import engine
from sqlalchemy import text

def check_news():
    conn = engine.connect()
    
    # Verificar noticias del 09/09/2025
    result = conn.execute(text("""
        SELECT d.nombre, COUNT(*) 
        FROM noticias n 
        JOIN diarios d ON n.diario_id = d.id 
        WHERE n.fecha_publicacion = '2025-09-09' 
        GROUP BY d.nombre
    """))
    
    print("Noticias del 09/09/2025:")
    total = 0
    for row in result:
        print(f"{row[0]}: {row[1]} noticias")
        total += row[1]
    
    print(f"Total: {total} noticias")
    
    # Verificar noticias recientes
    result2 = conn.execute(text("""
        SELECT n.fecha_publicacion, d.nombre, COUNT(*) 
        FROM noticias n 
        JOIN diarios d ON n.diario_id = d.id 
        WHERE n.fecha_publicacion >= '2025-09-08' 
        GROUP BY n.fecha_publicacion, d.nombre 
        ORDER BY n.fecha_publicacion DESC
    """))
    
    print("\nNoticias recientes:")
    for row in result2:
        print(f"{row[0]} - {row[1]}: {row[2]} noticias")
    
    conn.close()

if __name__ == "__main__":
    check_news()
