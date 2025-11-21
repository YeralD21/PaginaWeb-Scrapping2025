"""
Script simple para ejecutar el scraping desde el backend
"""
import requests
import json
import sys

def ejecutar_scraping():
    """Ejecuta el scraping desde el backend"""
    url = "http://localhost:8000/scraping/ejecutar"
    
    print("="*60)
    print("EJECUTANDO SCRAPING DESDE EL BACKEND")
    print("="*60)
    print(f"\nURL: {url}")
    print("Esperando respuesta...\n")
    
    try:
        # Realizar petición POST
        response = requests.post(url, timeout=600)  # 10 minutos de timeout
        
        # Verificar respuesta
        if response.status_code == 200:
            resultado = response.json()
            
            print("="*60)
            print("RESULTADO DEL SCRAPING")
            print("="*60)
            print(f"\nEstado: {'EXITOSO' if resultado.get('success') else 'FALLIDO'}")
            print(f"Noticias extraidas: {resultado.get('total_extracted', 0)}")
            print(f"Noticias guardadas: {resultado.get('total_saved', 0)}")
            print(f"Duplicados detectados: {resultado.get('duplicates_detected', 0)}")
            print(f"Alertas activadas: {resultado.get('alerts_triggered', 0)}")
            print(f"Duracion: {resultado.get('duration_seconds', 0)} segundos")
            
            if resultado.get('error'):
                print(f"\nERROR: {resultado.get('error')}")
            
            print("\n" + "="*60)
            print("Las noticias ya estan guardadas en la base de datos")
            print("Puedes verlas en el frontend: http://localhost:3000")
            print("="*60)
            
            return resultado
        else:
            print(f"ERROR: Status code {response.status_code}")
            print(f"Respuesta: {response.text}")
            return None
            
    except requests.exceptions.ConnectionError:
        print("\nERROR: No se pudo conectar al backend")
        print("Asegurate de que el backend este corriendo:")
        print("  cd backend")
        print("  python main.py")
        return None
    except requests.exceptions.Timeout:
        print("\nERROR: El scraping tardo demasiado tiempo")
        print("El scraping puede tardar varios minutos, especialmente CNN con Selenium")
        return None
    except Exception as e:
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    resultado = ejecutar_scraping()
    sys.exit(0 if resultado and resultado.get('success') else 1)

