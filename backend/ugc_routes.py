"""
Rutas UGC para integrar en main.py
Importar y agregar al app principal
"""

from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

from database import get_db
from models_ugc import User, Post, Ingreso, RoleEnum, TipoContenido
from auth_ugc import AuthUGC, get_current_user, require_admin
from revenue_service import RevenueService
import logging

logger = logging.getLogger(__name__)

# Router para UGC
router = APIRouter(prefix="/ugc", tags=["UGC - User Generated Content"])
auth_router = APIRouter(prefix="/auth", tags=["Autenticación UGC"])
admin_router = APIRouter(prefix="/admin", tags=["Admin UGC"])

# ===== SCHEMAS =====

class UserRegister(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

class PostCreate(BaseModel):
    tipo: TipoContenido
    contenido: str

class InteraccionRequest(BaseModel):
    tipo: Optional[str] = "view"

# ===== RUTAS DE AUTENTICACIÓN =====

@auth_router.post("/register", response_model=TokenResponse)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Registrar nuevo usuario UGC"""
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email ya registrado"
        )
    
    new_user = User(email=user_data.email, role=RoleEnum.USER)
    new_user.set_password(user_data.password)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    token = AuthUGC.create_access_token(new_user.id, new_user.email, new_user.role.value)
    
    logger.info(f"Usuario UGC registrado: {new_user.email}")
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "role": new_user.role.value
        }
    }

@auth_router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Iniciar sesión UGC"""
    user = AuthUGC.authenticate_user(db, credentials.email, credentials.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos"
        )
    
    token = AuthUGC.create_access_token(user.id, user.email, user.role.value)
    
    logger.info(f"Usuario UGC logueado: {user.email}")
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role.value
        }
    }

@auth_router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    """Obtener información del usuario actual"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role.value,
        "created_at": current_user.created_at
    }

# ===== RUTAS UGC =====

@router.post("/create", status_code=status.HTTP_201_CREATED)
def create_post(
    post_data: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Crear una nueva publicación"""
    new_post = Post(
        user_id=current_user.id,
        tipo=post_data.tipo,
        contenido=post_data.contenido,
        aprobado=True
    )
    
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    
    logger.info(f"Post creado por {current_user.email}: {new_post.id}")
    
    return {
        "message": "Publicación creada exitosamente",
        "post": {
            "id": new_post.id,
            "tipo": new_post.tipo.value,
            "contenido": new_post.contenido[:100] + "..." if len(new_post.contenido) > 100 else new_post.contenido,
            "created_at": new_post.created_at
        }
    }

@router.get("/my-posts")
def get_my_posts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtener mis publicaciones con métricas"""
    posts = db.query(Post).filter(Post.user_id == current_user.id).order_by(Post.created_at.desc()).all()
    
    stats = RevenueService.get_user_stats(db, current_user.id)
    
    posts_response = []
    for post in posts:
        posts_response.append({
            "id": post.id,
            "tipo": post.tipo.value,
            "contenido": post.contenido,
            "views": post.views,
            "clicks": post.clicks,
            "interacciones": post.interacciones,
            "total_interacciones": post.get_total_interacciones(),
            "created_at": post.created_at
        })
    
    return {
        "posts": posts_response,
        "stats": stats
    }

@router.get("/feed")
def get_feed(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Obtener feed de publicaciones aprobadas"""
    posts = db.query(Post).filter(Post.aprobado == True).order_by(Post.created_at.desc()).offset(skip).limit(limit).all()
    
    posts_response = []
    for post in posts:
        posts_response.append({
            "id": post.id,
            "user_email": post.user.email,
            "tipo": post.tipo.value,
            "contenido": post.contenido,
            "views": post.views,
            "clicks": post.clicks,
            "interacciones": post.interacciones,
            "created_at": post.created_at
        })
    
    return {
        "total": len(posts),
        "posts": posts_response
    }

@router.post("/interact/{post_id}")
def interact_with_post(
    post_id: int,
    interaccion: InteraccionRequest,
    db: Session = Depends(get_db)
):
    """Registrar interacción con un post (genera ingresos)"""
    try:
        result = RevenueService.registrar_interaccion(db, post_id, interaccion.tipo)
        return {
            "message": "Interacción registrada exitosamente",
            "result": result
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# ===== RUTAS DE ADMIN =====

@admin_router.get("/users")
def get_all_users(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Obtener lista de todos los usuarios (solo admin)"""
    users = db.query(User).all()
    
    users_response = []
    for user in users:
        users_response.append({
            "id": user.id,
            "email": user.email,
            "role": user.role.value,
            "created_at": user.created_at,
            "total_posts": len(user.posts),
            "total_ganancia": round(user.get_total_ingresos(), 2)
        })
    
    return {
        "total": len(users),
        "users": users_response
    }

@admin_router.get("/dashboard")
def get_admin_dashboard(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Obtener dashboard completo de admin"""
    stats = RevenueService.get_dashboard_stats(db)
    
    total_users = db.query(User).filter(User.role == RoleEnum.USER).count()
    total_posts = db.query(Post).count()
    
    stats["metrics"] = {
        "total_usuarios": total_users,
        "total_posts": total_posts,
        "total_admin_users": db.query(User).filter(User.role == RoleEnum.ADMIN).count()
    }
    
    return stats

@admin_router.post("/simulate-interactions/{post_id}")
def simulate_interactions(
    post_id: int,
    views: int = 10,
    clicks: int = 5,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Simular interacciones para testing (solo admin)"""
    try:
        result = RevenueService.simular_interacciones(db, post_id, views, clicks)
        return {
            "message": "Interacciones simuladas exitosamente",
            "result": result
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

