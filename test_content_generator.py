#!/usr/bin/env python3
"""
Script para probar el generador de contenido automático
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.content_generator import generate_content_for_news

def test_content_generator():
    print("🚀 PROBANDO GENERADOR DE CONTENIDO AUTOMÁTICO")
    print("=" * 60)
    
    # Casos de prueba
    test_cases = [
        {
            'title': 'PorDeportesAlianza Lima camiseta morada 2025: ¿cómo es y cuánto cuesta la indumentaria que usarán los íntimos en octubre?',
            'category': 'deportes',
            'existing_content': ''
        },
        {
            'title': 'Selección de Brasil',
            'category': 'deportes', 
            'existing_content': 'Gary Huamán'
        },
        {
            'title': 'Perú pierde en Lima ante Paraguay y cierra las Eliminatorias al Mundial del 2026',
            'category': 'deportes',
            'existing_content': ''
        },
        {
            'title': 'Revelan qué pasó con la casa de Gustavo Salcedo y Maju Mantilla tras descubrirse infidelidad',
            'category': 'espectaculos',
            'existing_content': ''
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📰 CASO {i}: {test_case['title'][:60]}...")
        print(f"📂 Categoría: {test_case['category']}")
        print(f"📝 Contenido existente: '{test_case['existing_content']}'")
        
        try:
            generated_content = generate_content_for_news(
                title=test_case['title'],
                existing_content=test_case['existing_content'],
                category=test_case['category']
            )
            
            print(f"✅ Contenido generado ({len(generated_content)} chars):")
            print("-" * 40)
            print(generated_content[:300] + "..." if len(generated_content) > 300 else generated_content)
            print("-" * 40)
            
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print("\n" + "=" * 60)
    print("🎉 PRUEBA COMPLETADA")

if __name__ == "__main__":
    test_content_generator()
