#!/bin/bash
# Script de inicio rápido del sistema automatizado

echo "🚀 Iniciando Sistema de Scraping Automatizado..."

# Activar entorno virtual si existe
if [ -d "venv" ]; then
    echo "📦 Activando entorno virtual..."
    source venv/Scripts/activate 2>/dev/null || source venv/bin/activate
fi

# Iniciar sistema
echo "🔄 Iniciando sistema completo..."
python start_advanced_system.py

echo "👋 Sistema detenido"
