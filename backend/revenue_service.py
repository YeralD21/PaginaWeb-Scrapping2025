"""
Servicio para gestionar ingresos y distribución de ganancias
"""

from sqlalchemy.orm import Session
from models_ugc_enhanced import User, Post, Ingreso, RoleEnum
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

# Configuración de reparto de ingresos
INGRESO_POR_INTERACCION = 0.01  # 1 centavo por interacción
PORCENTAJE_ADMIN = 0.70  # 70% para admin
PORCENTAJE_CREADOR = 0.30  # 30% para creador

class RevenueService:
    """Servicio para gestionar ingresos"""
    
    @staticmethod
    def registrar_interaccion(db: Session, post_id: int, tipo: str = "view") -> Dict:
        """
        Registrar una interacción en un post y generar ingresos
        
        Args:
            db: Sesión de base de datos
            post_id: ID del post
            tipo: Tipo de interacción (view, click, other)
        
        Returns:
            Dict con información de ingresos generados
        """
        # Obtener post
        post = db.query(Post).filter(Post.id == post_id).first()
        if not post:
            raise ValueError("Post no encontrado")
        
        # Registrar interacción
        if tipo == "view":
            post.views += 1
        elif tipo == "click":
            post.clicks += 1
        else:
            post.interacciones += 1
        
        # Calcular ingresos
        monto_total = INGRESO_POR_INTERACCION
        monto_admin = monto_total * PORCENTAJE_ADMIN
        monto_creador = monto_total * PORCENTAJE_CREADOR
        
        # Obtener admin (primer usuario con rol admin)
        admin = db.query(User).filter(User.role == RoleEnum.ADMIN).first()
        if not admin:
            logger.warning("No se encontró usuario admin")
        
        # Crear ingreso para el admin
        if admin:
            ingreso_admin = Ingreso(
                user_id=admin.id,
                post_id=post.id,
                monto=monto_admin,
                tipo="admin",
                concepto=f"Ingreso admin por {tipo} en post #{post.id}"
            )
            db.add(ingreso_admin)
        
        # Crear ingreso para el creador del post
        ingreso_creador = Ingreso(
            user_id=post.user_id,
            post_id=post.id,
            monto=monto_creador,
            tipo="creator",
            concepto=f"Ingreso creador por {tipo} en post #{post.id}"
        )
        db.add(ingreso_creador)
        
        db.commit()
        
        return {
            "post_id": post.id,
            "tipo_interaccion": tipo,
            "monto_total": monto_total,
            "monto_admin": monto_admin,
            "monto_creador": monto_creador,
            "total_interacciones": post.get_total_interacciones()
        }
    
    @staticmethod
    def get_dashboard_stats(db: Session) -> Dict:
        """
        Obtener estadísticas del dashboard de admin
        
        Returns:
            Dict con estadísticas completas
        """
        # Obtener todos los ingresos
        ingresos_admin = db.query(Ingreso).filter(Ingreso.tipo == "admin").all()
        ingresos_creadores = db.query(Ingreso).filter(Ingreso.tipo == "creator").all()
        
        # Calcular totales
        total_admin = sum(ing.monto for ing in ingresos_admin)
        total_creadores = sum(ing.monto for ing in ingresos_creadores)
        total_ingresos = total_admin + total_creadores
        
        # Obtener detalle por usuario
        usuarios = db.query(User).filter(User.role == RoleEnum.USER).all()
        detalle_usuarios = []
        
        for user in usuarios:
            ganancia_usuario = sum(ing.monto for ing in user.ingresos if ing.tipo == "creator")
            detalle_usuarios.append({
                "user_id": user.id,
                "email": user.email,
                "ganancia": round(ganancia_usuario, 2),
                "total_posts": len(user.posts)
            })
        
        # Ordenar por ganancia
        detalle_usuarios.sort(key=lambda x: x["ganancia"], reverse=True)
        
        return {
            "total_ingresos": round(total_ingresos, 2),
            "ganancia_admin": round(total_admin, 2),
            "ganancia_usuarios": round(total_creadores, 2),
            "porcentaje_admin": f"{PORCENTAJE_ADMIN * 100}%",
            "porcentaje_usuarios": f"{PORCENTAJE_CREADOR * 100}%",
            "detalle_usuarios": detalle_usuarios
        }
    
    @staticmethod
    def get_user_stats(db: Session, user_id: int) -> Dict:
        """
        Obtener estadísticas de un usuario específico
        
        Args:
            db: Sesión de base de datos
            user_id: ID del usuario
        
        Returns:
            Dict con estadísticas del usuario
        """
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("Usuario no encontrado")
        
        # Obtener posts del usuario
        posts = user.posts
        
        # Calcular métricas
        total_views = sum(post.views for post in posts)
        total_clicks = sum(post.clicks for post in posts)
        total_interacciones = sum(post.interacciones for post in posts)
        total_ganancia = sum(ing.monto for ing in user.ingresos if ing.tipo == "creator")
        
        # Posts por tipo
        posts_por_tipo = {}
        for post in posts:
            tipo = post.tipo.value
            if tipo not in posts_por_tipo:
                posts_por_tipo[tipo] = 0
            posts_por_tipo[tipo] += 1
        
        return {
            "user_id": user.id,
            "email": user.email,
            "total_posts": len(posts),
            "total_views": total_views,
            "total_clicks": total_clicks,
            "total_interacciones": total_interacciones,
            "total_ganancia": round(total_ganancia, 2),
            "posts_por_tipo": posts_por_tipo
        }
    
    @staticmethod
    def simular_interacciones(db: Session, post_id: int, num_views: int = 10, num_clicks: int = 5) -> Dict:
        """
        Simular múltiples interacciones en un post (para testing)
        
        Args:
            db: Sesión de base de datos
            post_id: ID del post
            num_views: Número de views a simular
            num_clicks: Número de clicks a simular
        
        Returns:
            Dict con resumen de interacciones
        """
        resultados = {
            "views": 0,
            "clicks": 0,
            "ingresos_generados": 0
        }
        
        # Simular views
        for _ in range(num_views):
            result = RevenueService.registrar_interaccion(db, post_id, "view")
            resultados["views"] += 1
            resultados["ingresos_generados"] += result["monto_total"]
        
        # Simular clicks
        for _ in range(num_clicks):
            result = RevenueService.registrar_interaccion(db, post_id, "click")
            resultados["clicks"] += 1
            resultados["ingresos_generados"] += result["monto_total"]
        
        resultados["ingresos_generados"] = round(resultados["ingresos_generados"], 2)
        
        return resultados

