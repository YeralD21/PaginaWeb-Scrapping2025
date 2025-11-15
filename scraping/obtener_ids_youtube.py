"""
Script para obtener Channel IDs de YouTube desde handles o URLs.
Usa requests y parsing HTML para extraer el verdadero channel ID.
"""

import requests
import re
import sys
import os

# Agregar el directorio raíz al path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def obtener_channel_id_desde_handle(handle_or_url):
    """
    Obtiene el channel ID real desde un handle o URL de YouTube.
    
    Args:
        handle_or_url: Puede ser @handle, URL completa, o solo el handle
    
    Returns:
        tuple: (channel_id, handle, status_message)
    """
    # Limpiar el input
    if handle_or_url.startswith('https://'):
        # Es una URL completa
        url = handle_or_url
    elif handle_or_url.startswith('@'):
        # Es un handle
        url = f"https://www.youtube.com/{handle_or_url}"
    else:
        # Asumir que es handle sin @
        url = f"https://www.youtube.com/@{handle_or_url}"
    
    try:
        print(f"\n[*] Obteniendo ID desde: {url}")
        
        # Hacer request con headers que simulan un navegador
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        }
        
        response = requests.get(url, headers=headers, timeout=15)
        
        if response.status_code != 200:
            return None, None, f"[ERROR] HTTP {response.status_code}"
        
        html_content = response.text
        
        # Buscar el channel ID en diferentes lugares del HTML
        patterns = [
            r'"channelId":"(UC[a-zA-Z0-9_-]+)"',
            r'"externalChannelId":"(UC[a-zA-Z0-9_-]+)"',
            r'<link rel="canonical" href="https://www\.youtube\.com/channel/(UC[a-zA-Z0-9_-]+)">',
            r'"browseId":"(UC[a-zA-Z0-9_-]+)"',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, html_content)
            if match:
                channel_id = match.group(1)
                
                # Extraer el handle de la URL
                handle_match = re.search(r'youtube\.com/@([^/\?"]+)', url)
                handle = f"@{handle_match.group(1)}" if handle_match else None
                
                return channel_id, handle, "[OK] ID encontrado"
        
        return None, None, "[ERROR] No se pudo extraer el channel ID del HTML"
        
    except requests.exceptions.Timeout:
        return None, None, "[ERROR] Timeout - El servidor tardo mucho"
    except requests.exceptions.RequestException as e:
        return None, None, f"[ERROR] Error de red: {str(e)}"
    except Exception as e:
        return None, None, f"[ERROR] Error inesperado: {str(e)}"


def main():
    print("="*80)
    print("OBTENER CHANNEL IDS DE YOUTUBE")
    print("="*80)
    
    # Canales a verificar
    canales_a_verificar = [
        ("@CNNEE", "CNN en Español"),
        ("@elcomercio", "El Comercio"),
        ("@larepublicape", "La República"),
        ("@CNN", "CNN"),
        ("@BBCNewsMundo", "BBC News Mundo"),
        ("@elcomercioperu", "El Comercio Peru (alternativo)"),
        ("@cnnenespanol", "CNN en Español (alternativo)"),
    ]
    
    resultados = []
    
    for handle, nombre in canales_a_verificar:
        print(f"\n{'='*80}")
        print(f"Canal: {nombre}")
        print(f"Handle: {handle}")
        
        channel_id, extracted_handle, mensaje = obtener_channel_id_desde_handle(handle)
        
        print(f"Resultado: {mensaje}")
        if channel_id:
            print(f"[OK] Channel ID: {channel_id}")
            print(f"[OK] Handle: {extracted_handle}")
            
            # Verificar que el feed RSS funciona
            feed_url = f"https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}"
            try:
                feed_response = requests.get(feed_url, timeout=10)
                if feed_response.status_code == 200 and '<entry>' in feed_response.text:
                    print(f"[OK] Feed RSS verificado - Canal tiene videos")
                    resultados.append({
                        'nombre': nombre,
                        'handle': extracted_handle,
                        'channel_id': channel_id,
                        'valido': True
                    })
                else:
                    print(f"[WARN] Feed RSS sin videos o vacio")
                    resultados.append({
                        'nombre': nombre,
                        'handle': extracted_handle,
                        'channel_id': channel_id,
                        'valido': False
                    })
            except:
                print(f"[WARN] No se pudo verificar el feed RSS")
                resultados.append({
                    'nombre': nombre,
                    'handle': extracted_handle,
                    'channel_id': channel_id,
                    'valido': False
                })
    
    # Resumen
    print(f"\n\n{'='*80}")
    print("RESUMEN - CANALES VALIDOS")
    print("="*80)
    
    canales_validos = [r for r in resultados if r.get('valido')]
    
    if canales_validos:
        print("\nCopia esta configuracion en scraping/youtube_channels.py:\n")
        print("YOUTUBE_CHANNELS = [")
        for canal in canales_validos:
            print(f"    # {canal['nombre']}")
            print(f"    {{")
            print(f"        \"channel_id\": \"{canal['channel_id']}\",")
            print(f"        \"handle\": \"{canal['handle']}\",")
            print(f"        \"diario_nombre\": \"{canal['nombre']}\",")
            print(f"        \"url\": \"https://www.youtube.com/{canal['handle']}\",")
            print(f"    }},")
        print("]")
    else:
        print("\n[ERROR] No se encontraron canales validos")
        print("Verifica manualmente los handles y vuelve a intentar")


if __name__ == "__main__":
    main()

