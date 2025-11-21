"""
Script de ayuda para configurar las variables de entorno del ChatBot
Ejecuta este script para configurar fácilmente las variables de entorno
"""

import os
import sys

def setup_openrouter():
    """Configura OpenRouter API Key"""
    print("\n" + "="*60)
    print("🔑 Configuración de OpenRouter API Key")
    print("="*60)
    print("\n📝 Pasos para obtener tu API Key:")
    print("1. Visita: https://openrouter.ai/")
    print("2. Haz clic en 'Sign Up' para crear una cuenta")
    print("3. Ve a: https://openrouter.ai/keys")
    print("4. Haz clic en 'Create Key'")
    print("5. Copia la API key generada")
    print("\n💡 OpenRouter ofrece créditos gratuitos para empezar!")
    print("\n" + "-"*60)
    
    api_key = input("\n🔑 Pega tu OpenRouter API Key aquí (o presiona Enter para omitir): ").strip()
    
    if api_key:
        # Guardar en archivo .env si existe, o mostrar instrucciones
        env_file = os.path.join(os.path.dirname(__file__), '.env')
        
        # Leer .env existente si existe
        env_vars = {}
        if os.path.exists(env_file):
            with open(env_file, 'r') as f:
                for line in f:
                    if '=' in line and not line.strip().startswith('#'):
                        key, value = line.strip().split('=', 1)
                        env_vars[key] = value
        
        # Actualizar OPENROUTER_API_KEY
        env_vars['OPENROUTER_API_KEY'] = api_key
        
        # Escribir de vuelta
        with open(env_file, 'w') as f:
            f.write("# Variables de entorno para el ChatBot\n")
            f.write("# Generado automáticamente por setup_chatbot_env.py\n\n")
            for key, value in env_vars.items():
                f.write(f"{key}={value}\n")
        
        print(f"\n✅ API Key guardada en: {env_file}")
        print("\n📋 Para usar esta configuración, carga el archivo .env:")
        print("   - En Python: usa python-dotenv")
        print("   - En PowerShell: $env:OPENROUTER_API_KEY=\"" + api_key + "\"")
        print("   - En Linux/Mac: export OPENROUTER_API_KEY=\"" + api_key + "\"")
    else:
        print("\n⏭️  OpenRouter omitido. El chatbot funcionará con búsqueda en BD y fallback.")
    
    return api_key

def setup_ollama():
    """Configura Ollama"""
    print("\n" + "="*60)
    print("🦙 Configuración de Ollama (Local)")
    print("="*60)
    print("\n📝 Pasos para instalar Ollama:")
    print("1. Visita: https://ollama.ai/")
    print("2. Descarga e instala Ollama para tu sistema operativo")
    print("3. Abre una terminal y ejecuta: ollama serve")
    print("4. En otra terminal, descarga un modelo:")
    print("   - ollama pull llama2")
    print("   - ollama pull mistral")
    print("   - ollama pull codellama")
    print("\n" + "-"*60)
    
    use_ollama = input("\n❓ ¿Quieres configurar Ollama? (s/n): ").strip().lower()
    
    if use_ollama == 's':
        ollama_url = input("🔗 URL de Ollama API (Enter para default: http://localhost:11434/api/generate): ").strip()
        if not ollama_url:
            ollama_url = "http://localhost:11434/api/generate"
        
        ollama_model = input("🤖 Modelo de Ollama (Enter para default: llama2): ").strip()
        if not ollama_model:
            ollama_model = "llama2"
        
        # Guardar en .env
        env_file = os.path.join(os.path.dirname(__file__), '.env')
        env_vars = {}
        
        if os.path.exists(env_file):
            with open(env_file, 'r') as f:
                for line in f:
                    if '=' in line and not line.strip().startswith('#'):
                        key, value = line.strip().split('=', 1)
                        env_vars[key] = value
        
        env_vars['OLLAMA_API_URL'] = ollama_url
        env_vars['OLLAMA_MODEL'] = ollama_model
        env_vars['PREFERRED_LLM'] = 'ollama'
        
        with open(env_file, 'w') as f:
            f.write("# Variables de entorno para el ChatBot\n")
            f.write("# Generado automáticamente por setup_chatbot_env.py\n\n")
            for key, value in env_vars.items():
                f.write(f"{key}={value}\n")
        
        print(f"\n✅ Configuración de Ollama guardada en: {env_file}")
    else:
        print("\n⏭️  Ollama omitido.")

def main():
    """Función principal"""
    print("\n" + "="*60)
    print("🤖 Configurador de ChatBot - Variables de Entorno")
    print("="*60)
    print("\nEste script te ayudará a configurar las variables de entorno")
    print("necesarias para que el ChatBot use LLM (OpenRouter u Ollama).")
    print("\n💡 Nota: El ChatBot funcionará SIN LLM usando solo:")
    print("   - Búsqueda en base de datos")
    print("   - Respuestas predefinidas")
    print("\n   Configurar un LLM mejora las respuestas cuando no hay")
    print("   coincidencias exactas en la base de datos.")
    print("\n" + "-"*60)
    
    # Opción 1: OpenRouter
    setup_openrouter()
    
    # Opción 2: Ollama
    setup_ollama()
    
    print("\n" + "="*60)
    print("✅ Configuración completada!")
    print("="*60)
    print("\n📋 Próximos pasos:")
    print("1. Si configuraste variables, reinicia el servidor backend")
    print("2. Verifica el estado: GET http://localhost:8000/chatbot/health")
    print("3. Prueba el chatbot en el frontend")
    print("\n💡 Si no configuraste ningún LLM, el chatbot funcionará")
    print("   perfectamente usando solo la base de datos y respuestas predefinidas.")
    print("\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Configuración cancelada por el usuario.")
        sys.exit(0)
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        sys.exit(1)

