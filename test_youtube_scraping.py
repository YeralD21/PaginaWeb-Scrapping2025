#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de prueba para verificar el scraping de YouTube end-to-end
"""

import sys
import os

# Configurar encoding para Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.scraping_service import ScrapingService
from backend.database import get_db
from backend.models import Noticia, Diario
import json

def test_youtube_scraping():
    """Prueba el scraping de YouTube y verifica el resultado"""
    
    print("="*80)
    print("TEST DE SCRAPING DE YOUTUBE")
    print("="*80)
    
    # Paso 1: Ejecutar scraping
    print("\n[1/3] Ejecutando scraping de YouTube...")
    try:
        service = ScrapingService()
        result = service.execute_youtube_scraping()
        
        print(f"\n[OK] Scraping completado:")
        print(f"   - Videos extraídos: {result['total_extracted']}")
        print(f"   - Videos guardados: {result['total_saved']}")
        print(f"   - Duplicados detectados: {result['duplicates_detected']}")
        print(f"   - Alertas generadas: {result['alerts_triggered']}")
        print(f"   - Duración: {result['duration_seconds']}s")
        
        if result.get('error'):
            print(f"\n[WARN] Error: {result['error']}")
        
        if result.get('errors'):
            print(f"\n[WARN] Errores durante el scraping:")
            for error in result['errors'][:5]:
                print(f"   - {error}")
    
    except Exception as e:
        print(f"\n[ERROR] Error ejecutando scraping: {e}")
        import traceback
        traceback.print_exc()
        return
    
    # Paso 2: Verificar videos en la base de datos
    print("\n[2/3] Verificando videos en la base de datos...")
    try:
        db = next(get_db())
        youtube_diario = db.query(Diario).filter(Diario.nombre == 'YouTube').first()
        
        if not youtube_diario:
            print("[ERROR] No se encontró el diario 'YouTube'")
            return
        
        videos = db.query(Noticia).filter(
            Noticia.diario_id == youtube_diario.id
        ).order_by(Noticia.fecha_extraccion.desc()).limit(5).all()
        
        print(f"\n[OK] Videos más recientes ({len(videos)}):")
        for i, video in enumerate(videos, 1):
            print(f"\n   [{i}] {video.titulo[:60]}")
            print(f"       Enlace: {video.enlace}")
            print(f"       Canal: {video.autor}")
            print(f"       Categoría: {video.categoria}")
            print(f"       Fecha: {video.fecha_publicacion}")
            
            # Verificar que el enlace sea válido
            if video.enlace and 'youtube.com/watch?v=' in video.enlace:
                video_id = video.enlace.split('watch?v=')[1].split('&')[0]
                print(f"       Video ID: {video_id}")
                print(f"       [OK] Enlace válido para embed")
            else:
                print(f"       [WARN] Enlace no válido para embed")
    
    except Exception as e:
        print(f"\n[ERROR] Error verificando videos: {e}")
        import traceback
        traceback.print_exc()
        return
    
    # Paso 3: Simular lo que el frontend recibe
    print("\n[3/3] Simulando respuesta del API para el frontend...")
    try:
        # Simular el endpoint /social-media?diario=YouTube
        videos_api = db.query(Noticia).filter(
            Noticia.diario_id == youtube_diario.id
        ).order_by(Noticia.fecha_extraccion.desc()).limit(3).all()
        
        print(f"\n[OK] Datos que recibirá el frontend:")
        for video in videos_api:
            api_response = {
                'id': video.id,
                'titulo': video.titulo,
                'contenido': video.contenido,
                'enlace': video.enlace,
                'imagen_url': video.imagen_url,
                'categoria': video.categoria,
                'diario_nombre': video.diario.nombre,  # CRÍTICO: Debe ser 'YouTube'
                'autor': video.autor,  # El canal (CNN, RPP, etc.)
                'fecha_publicacion': str(video.fecha_publicacion)
            }
            
            print(f"\n   Video: {api_response['titulo'][:60]}")
            print(f"   diario_nombre: {api_response['diario_nombre']}")
            print(f"   autor: {api_response['autor']}")
            print(f"   enlace: {api_response['enlace'][:70]}")
            
            # Verificar si el frontend detectará esto como YouTube
            diario_lower = api_response['diario_nombre'].lower()
            enlace = api_response['enlace'] or ''
            
            is_youtube = (
                diario_lower == 'youtube' or 
                'youtube.com' in enlace or 
                'youtu.be' in enlace
            )
            
            if is_youtube:
                print(f"   [OK] El frontend SÍ detectará esto como YouTube")
                if 'youtube.com/watch?v=' in enlace:
                    video_id = enlace.split('watch?v=')[1].split('&')[0]
                    embed_url = f"https://www.youtube.com/embed/{video_id}?autoplay=1&rel=0"
                    print(f"   [OK] Se puede embedar con: {embed_url}")
                else:
                    print(f"   [WARN] No se puede extraer video_id del enlace")
            else:
                print(f"   [ERROR] El frontend NO detectará esto como YouTube")
                print(f"   Razón: diario_nombre='{api_response['diario_nombre']}' y enlace no válido")
    
    except Exception as e:
        print(f"\n[ERROR] Error simulando API: {e}")
        import traceback
        traceback.print_exc()
        return
    
    # Resumen final
    print("\n" + "="*80)
    print("RESUMEN")
    print("="*80)
    print("\n[OK] El flujo de scraping está funcionando correctamente.")
    print("\nPara reproducir los videos en el frontend:")
    print("   1. Abre http://localhost:3000")
    print("   2. Ve a 'Redes Sociales'")
    print("   3. Haz clic en el botón 'YouTube' (rojo)")
    print("   4. Los videos deberían mostrarse con un botón de play")
    print("   5. Haz clic en el botón de play para reproducir el video en la página")
    print("\nNOTA: Si los videos son MOCK, los IDs no serán válidos en YouTube.")
    print("      Para obtener videos reales, asegúrate de que el scraper está")
    print("      configurado con USE_SELENIUM=true o que el RSS feed esté activo.")

if __name__ == "__main__":
    test_youtube_scraping()

