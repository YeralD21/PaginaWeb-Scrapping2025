"""
Script para verificar y obtener información de canales de YouTube.
Ayuda a validar que los canales configurados existen y tienen contenido.

USO:
    python verificar_canales_youtube.py

CÓMO OBTENER EL CHANNEL_ID CORRECTO:
1. Visita el canal en YouTube
2. Clic derecho > Ver código fuente de la página
3. Busca "channelId" o busca en la URL /channel/UC...
4. También puedes usar: https://commentpicker.com/youtube-channel-id.php
"""

import requests
import sys
import os

# Agregar el directorio raíz al path para imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scraping.youtube_channels import YOUTUBE_CHANNELS
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def verificar_canal_rss(channel_id: str, diario_nombre: str) -> dict:
    """Verifica si el feed RSS del canal existe y tiene videos"""
    feed_url = f"https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}"
    
    try:
        response = requests.get(feed_url, timeout=10)
        
        resultado = {
            'channel_id': channel_id,
            'diario_nombre': diario_nombre,
            'status_code': response.status_code,
            'existe': False,
            'tiene_contenido': False,
            'mensaje': ''
        }
        
        if response.status_code == 200:
            resultado['existe'] = True
            # Verificar si tiene contenido
            if '<entry>' in response.text and len(response.content) > 500:
                resultado['tiene_contenido'] = True
                resultado['mensaje'] = '[OK] Canal valido con videos'
            else:
                resultado['mensaje'] = '[WARN] Canal existe pero sin videos recientes o feed vacio'
        elif response.status_code == 404:
            resultado['mensaje'] = '[ERROR] Canal no encontrado (404) - ID incorrecto o canal eliminado'
        elif response.status_code == 403:
            resultado['mensaje'] = '[ERROR] Acceso denegado (403) - Feed deshabilitado o privado'
        else:
            resultado['mensaje'] = f'[ERROR] Error {response.status_code}'
            
        return resultado
        
    except requests.exceptions.Timeout:
        return {
            'channel_id': channel_id,
            'diario_nombre': diario_nombre,
            'existe': False,
            'mensaje': '[WARN] Timeout - El servidor tardo mucho en responder'
        }
    except Exception as e:
        return {
            'channel_id': channel_id,
            'diario_nombre': diario_nombre,
            'existe': False,
            'mensaje': f'[ERROR] Error: {str(e)}'
        }

def main():
    print("\n" + "="*80)
    print("VERIFICACION DE CANALES DE YOUTUBE")
    print("="*80 + "\n")
    
    resultados = []
    canales_validos = 0
    canales_invalidos = 0
    
    for canal in YOUTUBE_CHANNELS:
        channel_id = canal.get('channel_id')
        diario_nombre = canal.get('diario_nombre')
        handle = canal.get('handle', 'N/A')
        
        print(f"[VIDEO] Verificando: {diario_nombre} (@{handle})")
        print(f"   Channel ID: {channel_id}")
        
        resultado = verificar_canal_rss(channel_id, diario_nombre)
        resultados.append(resultado)
        
        print(f"   {resultado['mensaje']}")
        print()
        
        if resultado.get('tiene_contenido'):
            canales_validos += 1
        else:
            canales_invalidos += 1
    
    # Resumen
    print("\n" + "="*80)
    print("RESUMEN")
    print("="*80)
    print(f"Total de canales configurados: {len(YOUTUBE_CHANNELS)}")
    print(f"[OK] Canales validos con contenido: {canales_validos}")
    print(f"[ERROR] Canales invalidos o sin contenido: {canales_invalidos}")
    print()
    
    # Mostrar canales problemáticos
    if canales_invalidos > 0:
        print("\n[ATENCION] CANALES QUE NECESITAN CORRECCION:")
        print("-" * 80)
        for resultado in resultados:
            if not resultado.get('tiene_contenido'):
                print(f"  - {resultado['diario_nombre']}")
                print(f"    ID actual: {resultado['channel_id']}")
                print(f"    Problema: {resultado['mensaje']}")
                print(f"    Accion: Verifica el canal en YouTube y actualiza el ID")
                print()
    
    # Instrucciones para obtener el ID correcto
    if canales_invalidos > 0:
        print("\nCOMO OBTENER EL CHANNEL_ID CORRECTO:")
        print("-" * 80)
        print("1. Visita el canal en YouTube (busca por nombre)")
        print("2. Verifica que el canal tenga videos públicos")
        print("3. Mira la URL del canal:")
        print("   - Si es youtube.com/@handle, usa ese handle")
        print("   - Si es youtube.com/channel/UC..., ese es el channel_id")
        print("4. O usa herramientas online:")
        print("   - https://commentpicker.com/youtube-channel-id.php")
        print("   - https://www.streamweasels.com/tools/youtube-channel-id-and-user-id-convertor/")
        print()
        print("5. Actualiza scraping/youtube_channels.py con el ID correcto")
        print()

if __name__ == "__main__":
    main()

