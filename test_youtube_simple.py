#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script simple para probar el scraping de YouTube
"""

import sys
import os
import requests

# Configurar encoding para Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

def test_youtube_api():
    """Prueba el endpoint de YouTube directamente"""
    
    print("="*80)
    print("TEST DEL ENDPOINT DE YOUTUBE")
    print("="*80)
    
    base_url = "http://localhost:8000"
    
    # Paso 1: Ejecutar scraping
    print("\n[1/3] Ejecutando scraping de YouTube vía API...")
    try:
        response = requests.post(f"{base_url}/scraping/social-media/youtube/ejecutar", timeout=60)
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n[OK] Scraping completado:")
            print(f"   - Videos extraídos: {result.get('total_extracted', 0)}")
            print(f"   - Videos guardados: {result.get('total_saved', 0)}")
            print(f"   - Duplicados: {result.get('duplicates_detected', 0)}")
            print(f"   - Duración: {result.get('duration_seconds', 0)}s")
        else:
            print(f"\n[ERROR] Status code: {response.status_code}")
            print(f"Response: {response.text}")
            return
    
    except Exception as e:
        print(f"\n[ERROR] Error ejecutando scraping: {e}")
        print("\n[HINT] Asegúrate de que el backend esté corriendo:")
        print("   cd backend && uvicorn main:app --reload")
        return
    
    # Paso 2: Obtener videos de YouTube
    print("\n[2/3] Obteniendo videos de YouTube...")
    try:
        response = requests.get(f"{base_url}/social-media?diario=YouTube&limit=5")
        
        if response.status_code == 200:
            videos = response.json()
            print(f"\n[OK] Recibidos {len(videos)} videos")
            
            if len(videos) == 0:
                print("[WARN] No hay videos de YouTube en la base de datos")
                return
            
            # Mostrar ejemplos
            print("\n" + "="*80)
            print("EJEMPLOS DE VIDEOS")
            print("="*80)
            
            for i, video in enumerate(videos[:3], 1):
                print(f"\n[{i}] {video.get('titulo', '')[:60]}")
                print(f"    Diario: {video.get('diario_nombre', 'N/A')}")
                print(f"    Canal/Autor: {video.get('autor', 'N/A')}")
                print(f"    Enlace: {video.get('enlace', '')[:70]}")
                
                # Verificar si se puede reproducir
                enlace = video.get('enlace', '')
                diario_nombre = video.get('diario_nombre', '').lower()
                
                is_youtube = diario_nombre == 'youtube' or 'youtube.com' in enlace or 'youtu.be' in enlace
                
                if is_youtube:
                    print(f"    [OK] Será detectado como video de YouTube")
                    
                    if 'youtube.com/watch?v=' in enlace:
                        video_id = enlace.split('watch?v=')[1].split('&')[0]
                        print(f"    Video ID: {video_id}")
                        print(f"    Embed URL: https://www.youtube.com/embed/{video_id}")
                    elif 'youtu.be/' in enlace:
                        video_id = enlace.split('youtu.be/')[1].split('?')[0]
                        print(f"    Video ID: {video_id}")
                        print(f"    Embed URL: https://www.youtube.com/embed/{video_id}")
                    else:
                        print(f"    [WARN] No se pudo extraer video ID")
                else:
                    print(f"    [ERROR] NO será detectado como YouTube")
                    print(f"    Motivo: diario_nombre='{video.get('diario_nombre')}', enlace no válido")
        else:
            print(f"\n[ERROR] Status code: {response.status_code}")
            return
    
    except Exception as e:
        print(f"\n[ERROR] Error obteniendo videos: {e}")
        return
    
    # Paso 3: Verificar conteo
    print("\n[3/3] Verificando estadísticas...")
    try:
        response = requests.get(f"{base_url}/social-media?limit=100")
        all_news = response.json()
        
        youtube_count = sum(1 for n in all_news if n.get('diario_nombre', '').lower() == 'youtube' or 'youtube.com' in n.get('enlace', ''))
        
        print(f"\n[OK] Total de videos de YouTube: {youtube_count}")
    
    except Exception as e:
        print(f"\n[ERROR] Error obteniendo estadísticas: {e}")
    
    # Resumen
    print("\n" + "="*80)
    print("RESUMEN Y PRÓXIMOS PASOS")
    print("="*80)
    print("\n[OK] El scraping de YouTube está configurado correctamente.")
    print("\nPara ver los videos en el frontend:")
    print("   1. Abre http://localhost:3000")
    print("   2. Ve a la sección 'Redes Sociales'")
    print("   3. Haz clic en el filtro 'YouTube'")
    print("   4. Deberías ver los videos con miniaturas")
    print("   5. Haz clic en el botón de play (▶) para reproducir")
    print("\nSi los videos no se reproducen:")
    print("   - Verifica que diario_nombre sea 'YouTube'")
    print("   - Verifica que el enlace contenga 'youtube.com/watch?v='")
    print("   - Abre la consola del navegador (F12) para ver errores")

if __name__ == "__main__":
    test_youtube_api()

