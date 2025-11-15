"""
Script para cancelar suscripciones pendientes obsoletas
"""
import sys
sys.stdout.reconfigure(encoding='utf-8')
from datetime import datetime
from sqlalchemy.orm import Session
from database import SessionLocal
from models_ugc_enhanced import User
from models import UserSubscription

def fix_pending_subscriptions(email: str = None):
    """Cancelar suscripciones pendientes que son más antiguas que la última activa/revisada"""
    db: Session = SessionLocal()
    
    try:
        if email:
            users = [db.query(User).filter(User.email == email).first()]
            if not users[0]:
                print(f"Usuario {email} no encontrado")
                return
        else:
            # Procesar todos los usuarios
            users = db.query(User).all()
        
        total_fixed = 0
        
        for user in users:
            if not user:
                continue
                
            # Obtener todas las suscripciones del usuario ordenadas por fecha de creación
            all_subs = (
                db.query(UserSubscription)
                .filter(UserSubscription.user_id == user.id)
                .order_by(UserSubscription.creado_en.desc())
                .all()
            )
            
            if not all_subs:
                continue
            
            # Buscar la última suscripción que fue aprobada o revisada (active, expired, rejected)
            last_reviewed = None
            for sub in all_subs:
                if sub.estado in ["active", "expired", "rejected"] and sub.fecha_revision:
                    last_reviewed = sub
                    break
            
            if not last_reviewed:
                # Si no hay ninguna revisada, buscar la última activa
                for sub in all_subs:
                    if sub.estado == "active":
                        last_reviewed = sub
                        break
            
            if last_reviewed:
                # Cancelar todas las pendientes que son más antiguas que la última revisada
                pending_to_cancel = [
                    sub for sub in all_subs
                    if sub.estado == "pending" 
                    and sub.creado_en < last_reviewed.creado_en
                ]
                
                if pending_to_cancel:
                    print(f"\nUsuario: {user.email}")
                    print(f"Última suscripción revisada: ID {last_reviewed.id}, Estado: {last_reviewed.estado}, Fecha: {last_reviewed.creado_en}")
                    print(f"Cancelando {len(pending_to_cancel)} suscripción(es) pendiente(s) obsoleta(s):")
                    
                    for sub in pending_to_cancel:
                        sub.estado = "cancelled"
                        sub.motivo_cancelacion = "Cancelada automáticamente: reemplazada por suscripción más reciente"
                        sub.fecha_cancelacion = datetime.utcnow()
                        sub.cancelado_por = 1  # Admin system
                        print(f"  - Suscripción ID {sub.id} (creada: {sub.creado_en})")
                        total_fixed += 1
                    
                    db.commit()
                    print(f"✓ {len(pending_to_cancel)} suscripción(es) cancelada(s) correctamente")
        
        print(f"\n{'='*60}")
        print(f"✓ Total de suscripciones corregidas: {total_fixed}")
        print(f"{'='*60}\n")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    email = sys.argv[1] if len(sys.argv) > 1 else None
    fix_pending_subscriptions(email)

