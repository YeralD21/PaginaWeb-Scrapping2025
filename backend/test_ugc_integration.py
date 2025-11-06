"""
Script de prueba para verificar la integración del módulo UGC mejorado
"""

import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Verificar que todos los módulos se pueden importar"""
    print("🔍 Verificando imports...")
    
    try:
        from models_ugc_enhanced import (
            User, Post, Report, Notification, SystemSettings,
            EstadoPublicacion, RoleEnum, MotivoReporte
        )
        print("✅ models_ugc_enhanced.py - OK")
    except Exception as e:
        print(f"❌ models_ugc_enhanced.py - ERROR: {e}")
        return False
    
    try:
        from notification_service import NotificationService
        print("✅ notification_service.py - OK")
    except Exception as e:
        print(f"❌ notification_service.py - ERROR: {e}")
        return False
    
    try:
        from report_service import ReportService
        print("✅ report_service.py - OK")
    except Exception as e:
        print(f"❌ report_service.py - ERROR: {e}")
        return False
    
    try:
        from ugc_routes_enhanced import ugc_router, auth_router, admin_router
        print("✅ ugc_routes_enhanced.py - OK")
    except Exception as e:
        print(f"❌ ugc_routes_enhanced.py - ERROR: {e}")
        return False
    
    return True

def test_database_connection():
    """Verificar conexión a base de datos"""
    print("\n🔍 Verificando conexión a base de datos...")
    
    try:
        from database import engine, test_connection
        
        if test_connection():
            print("✅ Conexión a PostgreSQL - OK")
            return True
        else:
            print("❌ No se pudo conectar a PostgreSQL")
            return False
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return False

def check_routes():
    """Verificar que las rutas estén registradas"""
    print("\n🔍 Verificando rutas registradas...")
    
    try:
        from ugc_routes_enhanced import ugc_router, auth_router, admin_router
        
        print(f"✅ Auth Router: {len(auth_router.routes)} rutas")
        print(f"✅ UGC Router: {len(ugc_router.routes)} rutas")
        print(f"✅ Admin Router: {len(admin_router.routes)} rutas")
        
        print("\n📡 Endpoints disponibles:")
        print("\n🔐 Auth:")
        for route in auth_router.routes:
            if hasattr(route, 'methods') and hasattr(route, 'path'):
                methods = ', '.join(route.methods)
                print(f"  {methods:8s} {auth_router.prefix}{route.path}")
        
        print("\n👤 UGC (Usuarios):")
        for route in ugc_router.routes:
            if hasattr(route, 'methods') and hasattr(route, 'path'):
                methods = ', '.join(route.methods)
                print(f"  {methods:8s} {ugc_router.prefix}{route.path}")
        
        print("\n👨‍💼 Admin:")
        for route in admin_router.routes:
            if hasattr(route, 'methods') and hasattr(route, 'path'):
                methods = ', '.join(route.methods)
                print(f"  {methods:8s} {admin_router.prefix}{route.path}")
        
        return True
    except Exception as e:
        print(f"❌ Error verificando rutas: {e}")
        return False

def main():
    print("=" * 70)
    print("  VERIFICACIÓN DE INTEGRACIÓN UGC MEJORADO")
    print("=" * 70)
    
    # Test 1: Imports
    if not test_imports():
        print("\n❌ Falló la verificación de imports")
        return False
    
    # Test 2: Database
    if not test_database_connection():
        print("\n⚠️  Advertencia: No se pudo conectar a la base de datos")
        print("   Asegúrate de que PostgreSQL esté corriendo y configurado correctamente")
    
    # Test 3: Routes
    if not check_routes():
        print("\n❌ Falló la verificación de rutas")
        return False
    
    print("\n" + "=" * 70)
    print("✅ VERIFICACIÓN COMPLETADA EXITOSAMENTE")
    print("=" * 70)
    print("\n📋 PRÓXIMOS PASOS:")
    print("  1. Ejecutar migración: python migrate_ugc_enhanced.py")
    print("  2. Iniciar backend: python main.py")
    print("  3. Verificar en: http://localhost:8000/docs")
    print("\n🔐 CREDENCIALES DE PRUEBA:")
    print("  Admin: admin@ugc.com / admin123")
    print("  User:  user1@test.com / user123")
    print()
    
    return True

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n💥 Error inesperado: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
