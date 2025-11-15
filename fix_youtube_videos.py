#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para verificar y corregir videos de YouTube en la base de datos
"""

import sys
import os

# Configurar encoding para Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.database import get_db
from backend.models import Noticia, Diario
from datetime import datetime

def fix_youtube_videos():
    """Verifica y corrige los videos de YouTube en la base de datos"""
    try:
        db = next(get_db())
        
        # Buscar el diario YouTube
        youtube_diario = db.query(Diario).filter(Diario.nombre == 'YouTube').first()
        
        if not youtube_diario:
            print("❌ No se encontró el diario 'YouTube' en la base de datos")
            print("   Creándolo...")
            youtube_diario = Diario(
                nombre='YouTube',
                url='https://youtube.com',
                activo=True,
                fecha_creacion=datetime.utcnow()
            )
            db.add(youtube_diario)
            db.commit()
            print("✅ Diario 'YouTube' creado")
        else:
            print(f"✅ Diario 'YouTube' encontrado (ID: {youtube_diario.id})")
        
        # Buscar noticias que parecen ser de YouTube pero no tienen el diario correcto
        youtube_news = db.query(Noticia).filter(
            (Noticia.enlace.like('%youtube.com%')) | 
            (Noticia.enlace.like('%youtu.be%'))
        ).all()
        
        print(f"\n📊 Encontradas {len(youtube_news)} noticias con enlaces de YouTube")
        
        if len(youtube_news) == 0:
            print("\n⚠️ No hay videos de YouTube en la base de datos")
            print("   Ejecuta el scraping de YouTube primero:")
            print("   - Usa el botón 'YouTube' en el frontend")
            print("   - O ejecuta: python -c \"from backend.scraping_service import ScrapingService; ScrapingService().execute_youtube_scraping()\"")
            return
        
        # Verificar y corregir
        fixed_count = 0
        problemas = []
        
        for noticia in youtube_news:
            tiene_problemas = False
            mensaje_problema = []
            
            # Verificar el campo diario_id
            if noticia.diario_id != youtube_diario.id:
                tiene_problemas = True
                mensaje_problema.append(f"diario_id incorrecto ({noticia.diario_id} -> {youtube_diario.id})")
                noticia.diario_id = youtube_diario.id
                fixed_count += 1
            
            # Verificar el enlace
            if not noticia.enlace or not noticia.enlace.startswith('http'):
                tiene_problemas = True
                mensaje_problema.append(f"enlace inválido: '{noticia.enlace}'")
            
            # Verificar metadata
            if noticia.metadata:
                if 'video_id' not in noticia.metadata:
                    tiene_problemas = True
                    mensaje_problema.append("falta video_id en metadata")
            
            if tiene_problemas:
                problemas.append({
                    'id': noticia.id,
                    'titulo': noticia.titulo[:60],
                    'enlace': noticia.enlace[:60] if noticia.enlace else 'None',
                    'problemas': mensaje_problema
                })
        
        if fixed_count > 0:
            db.commit()
            print(f"\n✅ Se corrigieron {fixed_count} videos")
        
        # Mostrar resumen
        print("\n" + "="*80)
        print("RESUMEN DE VIDEOS DE YOUTUBE")
        print("="*80)
        print(f"Total de videos: {len(youtube_news)}")
        print(f"Videos corregidos: {fixed_count}")
        print(f"Videos con problemas: {len(problemas)}")
        
        if problemas:
            print("\n⚠️ VIDEOS CON PROBLEMAS:")
            print("-" * 80)
            for p in problemas[:10]:  # Mostrar solo los primeros 10
                print(f"\nID: {p['id']}")
                print(f"Título: {p['titulo']}")
                print(f"Enlace: {p['enlace']}")
                print(f"Problemas: {', '.join(p['problemas'])}")
            
            if len(problemas) > 10:
                print(f"\n... y {len(problemas) - 10} videos más con problemas")
        
        # Mostrar algunos ejemplos de videos válidos
        print("\n" + "="*80)
        print("EJEMPLOS DE VIDEOS VÁLIDOS")
        print("="*80)
        
        videos_validos = [n for n in youtube_news if n.diario_id == youtube_diario.id and n.enlace and n.enlace.startswith('http')][:5]
        
        for video in videos_validos:
            print(f"\n[OK] {video.titulo[:60]}")
            print(f"   Enlace: {video.enlace}")
            print(f"   Diario: {video.diario.nombre}")
            print(f"   Autor/Canal: {video.autor}")
            print(f"   Fecha: {video.fecha_publicacion}")
        
        print("\n" + "="*80)
        print("RECOMENDACIONES")
        print("="*80)
        
        if len(problemas) > 0:
            print("⚠️ Se encontraron videos con problemas.")
            print("   Recomendación: Ejecuta un nuevo scraping de YouTube para obtener datos frescos.")
            print("   Los nuevos videos tendrán el formato correcto.")
        else:
            print("✅ Todos los videos de YouTube tienen el formato correcto.")
            print("   Deberían reproducirse correctamente en el frontend.")
        
        print("\n💡 Para probar:")
        print("   1. Abre el frontend en http://localhost:3000")
        print("   2. Ve a la sección 'Redes Sociales'")
        print("   3. Filtra por 'YouTube'")
        print("   4. Haz clic en cualquier video para reproducirlo")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    fix_youtube_videos()

