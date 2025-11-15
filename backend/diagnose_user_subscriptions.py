"""
Script de diagnóstico para verificar el estado de las suscripciones de un usuario
"""
import sys
sys.stdout.reconfigure(encoding='utf-8')
from datetime import datetime
from sqlalchemy.orm import Session
from database import SessionLocal
from models_ugc_enhanced import User
from models import UserSubscription

def diagnose_user_subscriptions(email: str):
    """Diagnosticar todas las suscripciones de un usuario"""
    db: Session = SessionLocal()
    
    try:
        # Buscar usuario
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"❌ Usuario {email} no encontrado")
            return
        
        print(f"\n{'='*60}")
        print(f"📊 DIAGNÓSTICO DE SUSCRIPCIONES PARA: {email}")
        print(f"   User ID: {user.id}")
        print(f"{'='*60}\n")
        
        # Obtener TODAS las suscripciones del usuario
        all_subscriptions = (
            db.query(UserSubscription)
            .filter(UserSubscription.user_id == user.id)
            .order_by(UserSubscription.creado_en.desc())
            .all()
        )
        
        if not all_subscriptions:
            print("⚠️  No se encontraron suscripciones para este usuario")
            return
        
        print(f"📋 Total de suscripciones encontradas: {len(all_subscriptions)}\n")
        
        now = datetime.utcnow()
        
        for idx, sub in enumerate(all_subscriptions, 1):
            plan = sub.plan
            plan_nombre = plan.nombre if plan else "Plan desconocido"
            
            print(f"{'─'*60}")
            print(f"Suscripción #{idx} (ID: {sub.id})")
            print(f"{'─'*60}")
            print(f"  Estado: {sub.estado}")
            print(f"  Plan: {plan_nombre}")
            print(f"  Fecha de creación: {sub.creado_en}")
            print(f"  Fecha de inicio: {sub.fecha_inicio}")
            print(f"  Fecha de fin: {sub.fecha_fin}")
            
            if sub.fecha_fin:
                tiempo_restante = sub.fecha_fin - now
                if tiempo_restante.total_seconds() > 0:
                    dias = tiempo_restante.days
                    horas = tiempo_restante.seconds // 3600
                    minutos = (tiempo_restante.seconds % 3600) // 60
                    print(f"  ⏰ Tiempo restante: {dias} días, {horas} horas, {minutos} minutos")
                else:
                    print(f"  ⚠️  EXPIRADA hace: {abs(tiempo_restante.days)} días")
            
            print(f"  Referencia de pago: {sub.referencia_pago or 'N/A'}")
            print(f"  Fecha pago notificado: {sub.fecha_pago_notificado or 'N/A'}")
            print(f"  Revisado por: {sub.revisado_por or 'N/A'}")
            print(f"  Fecha revisión: {sub.fecha_revision or 'N/A'}")
            print(f"  Motivo rechazo: {sub.motivo_rechazo or 'N/A'}")
            print(f"  Motivo cancelación: {sub.motivo_cancelacion or 'N/A'}")
            print(f"  Fecha cancelación: {sub.fecha_cancelacion or 'N/A'}")
            print()
        
        # Análisis del estado actual
        print(f"\n{'='*60}")
        print("🔍 ANÁLISIS DEL ESTADO ACTUAL")
        print(f"{'='*60}\n")
        
        # Buscar activas
        active_subs = [s for s in all_subscriptions if s.estado == "active"]
        expired_active = [
            s for s in active_subs 
            if s.fecha_fin and s.fecha_fin <= now
        ]
        valid_active = [
            s for s in active_subs 
            if not s.fecha_fin or s.fecha_fin > now
        ]
        
        print(f"✅ Suscripciones ACTIVAS: {len(active_subs)}")
        if expired_active:
            print(f"   ⚠️  {len(expired_active)} están EXPIRADAS (deberían marcarse como 'expired')")
        if valid_active:
            print(f"   ✓ {len(valid_active)} son VÁLIDAS (no expiradas)")
        
        # Buscar pendientes
        pending_subs = [s for s in all_subscriptions if s.estado == "pending"]
        print(f"\n⏳ Suscripciones PENDIENTES: {len(pending_subs)}")
        if pending_subs:
            print("   IDs:", [s.id for s in pending_subs])
            print("   Fechas de creación:", [s.creado_en for s in pending_subs])
        
        # Buscar canceladas
        cancelled_subs = [s for s in all_subscriptions if s.estado == "cancelled"]
        print(f"\n🚫 Suscripciones CANCELADAS: {len(cancelled_subs)}")
        
        # Buscar rechazadas
        rejected_subs = [s for s in all_subscriptions if s.estado == "rejected"]
        print(f"\n❌ Suscripciones RECHAZADAS: {len(rejected_subs)}")
        
        # Buscar expiradas
        expired_subs = [s for s in all_subscriptions if s.estado == "expired"]
        print(f"\n⏰ Suscripciones EXPIRADAS: {len(expired_subs)}")
        
        # Recomendaciones
        print(f"\n{'='*60}")
        print("💡 RECOMENDACIONES")
        print(f"{'='*60}\n")
        
        if expired_active:
            print("⚠️  Hay suscripciones activas que deberían marcarse como 'expired'")
            print("   Ejecuta el endpoint /subscriptions/status para que se marquen automáticamente\n")
        
        if pending_subs and valid_active:
            print("⚠️  Hay suscripciones pendientes pero también hay una activa válida")
            print("   Las pendientes deberían cancelarse automáticamente\n")
        
        if pending_subs and not valid_active and expired_active:
            print("⚠️  Hay suscripciones pendientes y activas expiradas")
            print("   La lógica debería mostrar la activa expirada o ninguna, no la pendiente\n")
        
        if not active_subs and not pending_subs:
            print("✓ Estado correcto: No hay suscripciones activas ni pendientes\n")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    email = sys.argv[1] if len(sys.argv) > 1 else "user2@test.com"
    diagnose_user_subscriptions(email)

