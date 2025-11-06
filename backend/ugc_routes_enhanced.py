
"""
Rutas mejoradas para UGC con revisión, reportes y detección de fake news
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime
import os
import uuid
import shutil
import json

from database import get_db
from models_ugc_enhanced import (
    User, Post, Report, Notification, SystemSettings, Reaction,
    RoleEnum, TipoContenido, EstadoPublicacion, EstadoReporte, MotivoReporte, TipoReaccion
)
from auth_ugc import AuthUGC, get_current_user, get_current_admin_user
from notification_service import NotificationService
from report_service import ReportService
import logging

logger = logging.getLogger(__name__)

# ===== ROUTERS =====
auth_router = APIRouter(prefix="/auth", tags=["Auth"])
ugc_router = APIRouter(prefix="/ugc", tags=["User Generated Content - Enhanced"])
admin_router = APIRouter(prefix="/admin", tags=["Admin Dashboard - Enhanced"])

# ===== PYDANTIC MODELS =====

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
    titulo: Optional[str] = None
    contenido: str
    descripcion: Optional[str] = None  # Para noticias
    imagen_url: Optional[str] = None  # Para noticias
    fuente: Optional[str] = None  # Para noticias

class PostResponse(BaseModel):
    id: int
    user_id: int
    tipo: str
    titulo: Optional[str]
    contenido: str
    descripcion: Optional[str] = None
    imagen_url: Optional[str] = None
    fuente: Optional[str] = None
    estado: str
    views: int
    clicks: int
    total_reportes: int
    created_at: datetime
    user_email: Optional[str] = None
    
    class Config:
        from_attributes = True

class ReportCreate(BaseModel):
    post_id: int
    motivo: MotivoReporte
    comentario: str  # Obligatorio

class ReportResponse(BaseModel):
    id: int
    post_id: int
    reporter_email: str
    motivo: str
    comentario: str
    estado: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class NotificationResponse(BaseModel):
    id: int
    titulo: str
    mensaje: str
    tipo: str
    leida: bool
    created_at: datetime
    post_id: Optional[int]
    
    class Config:
        from_attributes = True

class RejectPostRequest(BaseModel):
    motivo_rechazo: str

class UpdateThresholdRequest(BaseModel):
    threshold: int

class EarningsConfigRequest(BaseModel):
    config: dict  # {tipo: {percentage: float, cost_per_interaction: float}}

class MonetizationRequirementsRequest(BaseModel):
    min_noticias: int
    min_interacciones_noticias: int
    min_contenido_simple: int
    min_reacciones_totales: int = 0  # Nuevo: suma de todas las reacciones en todos los posts
    dias_minimos_cuenta: int = 0

class ReactionCreate(BaseModel):
    tipo: str  # like, love, haha, sad, angry
    session_id: Optional[str] = None  # Para usuarios anónimos

class ReactionStats(BaseModel):
    like: int = 0
    love: int = 0
    haha: int = 0
    sad: int = 0
    angry: int = 0
    total: int = 0
    user_reaction: Optional[str] = None  # Reacción del usuario actual

# ===== ENDPOINTS DE AUTENTICACIÓN =====

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

# ===== ENDPOINT DE SUBIDA DE ARCHIVOS =====

@ugc_router.post("/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Subir imagen para noticias"""
    
    # Verificar que el archivo sea una imagen
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se permiten archivos de imagen (JPG, PNG, GIF, etc.)"
        )
    
    # Verificar tamaño del archivo (máx 5MB)
    file_size = 0
    content = await file.read()
    file_size = len(content)
    
    if file_size > 5 * 1024 * 1024:  # 5MB
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo es demasiado grande. Máximo 5MB"
        )
    
    # Crear directorio de uploads si no existe
    upload_dir = os.path.join("backend", "uploads", "images")
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generar nombre único para el archivo
    file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    # Guardar archivo
    with open(file_path, "wb") as buffer:
        buffer.write(content)
    
    # Verificar que el archivo se guardó correctamente
    if os.path.exists(file_path):
        logger.info(f"✅ Imagen guardada exitosamente: {file_path}")
    else:
        logger.error(f"❌ Error: No se pudo guardar la imagen en {file_path}")
    
    # Retornar URL relativa
    image_url = f"/uploads/images/{unique_filename}"
    
    logger.info(f"Imagen subida por usuario {current_user.id}: {unique_filename} -> {image_url}")
    
    return {
        "success": True,
        "image_url": image_url,
        "filename": unique_filename,
        "size": file_size
    }

# Endpoint de servir imágenes movido a main.py usando StaticFiles
# Las imágenes ahora se sirven directamente desde /uploads/images/{filename}

# ===== ENDPOINTS UGC (USUARIOS) =====

@ugc_router.post("/create", response_model=PostResponse)
async def create_post(
    post_data: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Crear nueva publicación (entra en pending_review)"""
    
    # Verificar que el usuario no esté suspendido
    if current_user.suspendido:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Tu cuenta está suspendida. Motivo: {current_user.motivo_suspension}"
        )
    
    try:
        # Log para debug
        logger.info(f"🔍 Creando post con tipo: {post_data.tipo} (tipo: {type(post_data.tipo)})")
        
        # Validar que el tipo sea uno de los valores permitidos
        valid_tipos = ['texto', 'imagen', 'video', 'comentario', 'resena', 'post', 'noticia']
        if post_data.tipo not in valid_tipos:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tipo de contenido inválido: {post_data.tipo}"
            )
        
        logger.info(f"🔍 Tipo validado: {post_data.tipo}")
        
        # Crear post en estado pending_review
        new_post = Post(
            user_id=current_user.id,
            tipo=post_data.tipo,  # Usar directamente el valor string
            titulo=post_data.titulo,
            contenido=post_data.contenido,
            descripcion=post_data.descripcion,
            imagen_url=post_data.imagen_url,
            fuente=post_data.fuente,
            estado='pending_review'  # Usar directamente el valor string
        )
        
        db.add(new_post)
        db.commit()
        db.refresh(new_post)
        
        # Enviar notificación al usuario
        NotificationService.notificar_envio_revision(
            db=db,
            user_id=current_user.id,
            post_id=new_post.id
        )
        
        logger.info(f"✅ Post {new_post.id} creado por usuario {current_user.id} - PENDING_REVIEW")
        
        response = PostResponse(
            **new_post.__dict__,
            user_email=current_user.email
        )
        return response
        
    except Exception as e:
        logger.error(f"❌ Error creando post: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@ugc_router.get("/my-posts")
async def get_my_posts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtener mis publicaciones con todos los estados y estadísticas"""
    posts = db.query(Post).filter(Post.user_id == current_user.id).order_by(Post.created_at.desc()).all()
    
    # Calcular estadísticas con manejo de NULL
    total_views = sum((post.views if post.views is not None else 0) for post in posts)
    total_clicks = sum((post.clicks if post.clicks is not None else 0) for post in posts)
    total_interacciones = sum((post.interacciones if post.interacciones is not None else 0) for post in posts)
    
    # Calcular ganancias del usuario usando configuración por tipo
    total_ganancia = 0.0
    for post in posts:
        try:
            earnings_config = get_earnings_for_type(db, post.tipo)
            # Manejar valores NULL
            views = post.views if post.views is not None else 0
            clicks = post.clicks if post.clicks is not None else 0
            interacciones = post.interacciones if post.interacciones is not None else 0
            
            total_interactions = views + clicks + interacciones
            cost_per_interaction = earnings_config["cost_per_interaction"]
            user_percentage = earnings_config["percentage"] / 100
            post_earning = total_interactions * cost_per_interaction * user_percentage
            total_ganancia += post_earning
        except Exception as e:
            logger.warning(f"Error calculando earnings para post {post.id}: {e}")
            continue
    
    posts_data = [
        PostResponse(
            **post.__dict__,
            user_email=current_user.email
        ) for post in posts
    ]
    
    return {
        "posts": posts_data,
        "stats": {
            "total_posts": len(posts),
            "total_views": total_views,
            "total_clicks": total_clicks,
            "total_ganancia": round(total_ganancia, 2)
        }
    }

# ===== ENDPOINTS DE MONETIZACIÓN =====

def get_monetization_requirements(db: Session) -> dict:
    """Obtener requisitos de monetización desde system_settings"""
    try:
        # Refrescar la sesión para evitar caché
        db.expire_all()
        
        # Usar execution_options para deshabilitar caché de consulta
        setting = db.query(SystemSettings).filter(
            SystemSettings.clave == "monetization_requirements"
        ).execution_options(synchronize_session=False).first()
        
        default_requirements = {
            "min_noticias": 10,
            "min_interacciones_noticias": 100,
            "min_contenido_simple": 30,
            "min_reacciones_totales": 50,
            "dias_minimos_cuenta": 0
        }
        
        if setting and setting.valor:
            try:
                requirements = json.loads(setting.valor)
                logger.info(f"📊 Requisitos de monetización obtenidos desde DB: {requirements}")
                return requirements
            except Exception as e:
                logger.warning(f"Error parsing monetization requirements: {e}, using default")
                return default_requirements
        else:
            logger.info(f"📊 No hay requisitos personalizados, usando defaults: {default_requirements}")
            return default_requirements
    except Exception as e:
        logger.error(f"Error in get_monetization_requirements: {e}")
        return {
            "min_noticias": 10,
            "min_interacciones_noticias": 100,
            "min_contenido_simple": 30,
            "min_reacciones_totales": 50,
            "dias_minimos_cuenta": 0
        }

@ugc_router.get("/monetization/progress")
async def get_monetization_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtener progreso de requisitos de monetización"""
    from sqlalchemy import func
    from datetime import datetime, timedelta
    
    # Obtener requisitos configurables
    requirements = get_monetization_requirements(db)
    logger.info(f"🔍 Usuario {current_user.id} - Requisitos cargados: {requirements}")
    
    # Calcular días desde la creación de la cuenta
    account_age = datetime.utcnow() - current_user.created_at
    account_age_days = account_age.days
    
    # Requisito 1: Noticias publicadas
    noticias_publicadas = db.query(func.count(Post.id)).filter(
        Post.user_id == current_user.id,
        Post.tipo == 'noticia',
        Post.estado == 'published'
    ).scalar()
    
    # Requisito 2: Interacciones en noticias
    interacciones_noticias = db.query(
        func.sum(Post.views + Post.clicks + Post.interacciones)
    ).filter(
        Post.user_id == current_user.id,
        Post.tipo == 'noticia',
        Post.estado == 'published'
    ).scalar() or 0
    
    # Requisito 3: Contenido simple (posts, imágenes, videos)
    contenido_simple = db.query(func.count(Post.id)).filter(
        Post.user_id == current_user.id,
        Post.tipo.in_(['texto', 'imagen', 'video', 'post', 'comentario', 'resena']),
        Post.estado == 'published'
    ).scalar()
    
    # Requisito 4: Reacciones totales (suma de todas las reacciones en todos los posts del usuario)
    reacciones_totales = db.query(func.count(Reaction.id)).join(
        Post, Reaction.post_id == Post.id
    ).filter(
        Post.user_id == current_user.id,
        Post.estado == 'published'
    ).scalar() or 0
    
    # Verificar si todos los requisitos se cumplen
    req_noticias = noticias_publicadas >= requirements["min_noticias"]
    req_interacciones = interacciones_noticias >= requirements["min_interacciones_noticias"]
    req_contenido = contenido_simple >= requirements["min_contenido_simple"]
    req_reacciones = reacciones_totales >= requirements["min_reacciones_totales"]
    req_tiempo = account_age_days >= requirements["dias_minimos_cuenta"]
    
    eligible = req_noticias and req_interacciones and req_contenido and req_reacciones and req_tiempo
    
    response_data = {
        "account_age_days": account_age_days,
        "monetization_enabled": current_user.monetization_enabled if hasattr(current_user, 'monetization_enabled') else False,
        "eligible": eligible,
        "requirements": {
            "noticias_publicadas": {
                "current": noticias_publicadas,
                "target": requirements["min_noticias"],
                "met": req_noticias
            },
            "interacciones_noticias": {
                "current": int(interacciones_noticias),
                "target": requirements["min_interacciones_noticias"],
                "met": req_interacciones
            },
            "contenido_simple": {
                "current": contenido_simple,
                "target": requirements["min_contenido_simple"],
                "met": req_contenido
            },
            "reacciones_totales": {
                "current": reacciones_totales,
                "target": requirements["min_reacciones_totales"],
                "met": req_reacciones
            },
            "dias_minimos_cuenta": {
                "current": account_age_days,
                "target": requirements["dias_minimos_cuenta"],
                "met": req_tiempo
            }
        }
    }
    
    logger.info(f"📤 Enviando respuesta a usuario {current_user.id}: targets={requirements}")
    
    return response_data

@ugc_router.post("/monetization/activate")
async def activate_monetization(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Activar monetización para el usuario"""
    from datetime import datetime
    
    # Verificar si ya está activada
    if hasattr(current_user, 'monetization_enabled') and current_user.monetization_enabled:
        raise HTTPException(status_code=400, detail="La monetización ya está activada")
    
    # Verificar requisitos
    progress_response = await get_monetization_progress(current_user, db)
    
    if not progress_response["eligible"]:
        raise HTTPException(
            status_code=400,
            detail="No cumples todos los requisitos para activar la monetización"
        )
    
    # Activar monetización
    db.execute(
        text("UPDATE users SET monetization_enabled = TRUE, monetization_activated_at = :now WHERE id = :user_id"),
        {"now": datetime.utcnow(), "user_id": current_user.id}
    )
    db.commit()
    
    logger.info(f"✅ Monetización activada para usuario {current_user.id}")
    
    return {
        "success": True,
        "message": "Monetización activada exitosamente",
        "activated_at": datetime.utcnow()
    }

@ugc_router.get("/monetization/earnings")
async def get_user_earnings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtener ganancias del usuario (solo si está monetizado)"""
    from sqlalchemy import text
    
    # Verificar si la monetización está activada
    result = db.execute(
        text("SELECT monetization_enabled FROM users WHERE id = :user_id"),
        {"user_id": current_user.id}
    ).fetchone()
    
    if not result or not result[0]:
        raise HTTPException(
            status_code=403,
            detail="Debes activar la monetización primero"
        )
    
    # Obtener todos los posts del usuario
    posts = db.query(Post).filter(
        Post.user_id == current_user.id,
        Post.estado == 'published'
    ).all()
    
    # Calcular ganancias por post
    posts_earnings = []
    total_views = 0
    total_clicks = 0
    total_interactions = 0
    total_earnings = 0.0
    
    # Agrupar ganancias por tipo
    from collections import defaultdict
    earnings_by_type = defaultdict(lambda: {"count": 0, "earnings": 0.0})
    
    for post in posts:
        try:
            earnings_config = get_earnings_for_type(db, post.tipo)
            # Manejar valores NULL
            views = post.views if post.views is not None else 0
            clicks = post.clicks if post.clicks is not None else 0
            interacciones = post.interacciones if post.interacciones is not None else 0
            
            post_interactions = views + clicks + interacciones
            cost_per_interaction = earnings_config["cost_per_interaction"]
            user_percentage = earnings_config["percentage"] / 100
            post_earning = post_interactions * cost_per_interaction * user_percentage
            
            total_views += views
            total_clicks += clicks
            total_interactions += interacciones
            total_earnings += post_earning
            
            posts_earnings.append({
                "id": post.id,
                "tipo": post.tipo,
                "titulo": post.titulo,
                "contenido": post.contenido,
                "views": views,
                "clicks": clicks,
                "interacciones": interacciones,
                "user_earnings": post_earning,
                "created_at": post.created_at
            })
            
            earnings_by_type[post.tipo]["count"] += 1
            earnings_by_type[post.tipo]["earnings"] += post_earning
        except Exception as e:
            logger.warning(f"Error calculando earnings para post {post.id}: {e}")
            continue
    
    earnings_by_type_list = [
        {"tipo": tipo, "count": data["count"], "earnings": data["earnings"]}
        for tipo, data in earnings_by_type.items()
    ]
    
    return {
        "total_earnings": total_earnings,
        "total_views": total_views,
        "total_clicks": total_clicks,
        "total_interactions": total_interactions,
        "posts": posts_earnings,
        "earnings_by_type": earnings_by_type_list
    }

@ugc_router.get("/feed", response_model=List[PostResponse])
async def get_published_feed(
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Obtener feed público (solo posts published)"""
    posts = db.query(Post).filter(
        Post.estado == 'published'
    ).order_by(Post.created_at.desc()).limit(limit).all()
    
    result = []
    for post in posts:
        user = db.query(User).filter(User.id == post.user_id).first()
        result.append(PostResponse(
            **post.__dict__,
            user_email=user.email if user else None
        ))
    
    return result

@ugc_router.post("/posts/{post_id}/view")
async def register_post_view(
    post_id: int,
    db: Session = Depends(get_db)
):
    """Registrar una vista en un post (sin necesidad de autenticación)"""
    post = db.query(Post).filter(Post.id == post_id).first()
    
    if not post:
        raise HTTPException(status_code=404, detail="Publicación no encontrada")
    
    # Incrementar contador de vistas
    if post.views is None:
        post.views = 0
    post.views += 1
    
    try:
        db.commit()
        db.refresh(post)
        logger.info(f"👁️ Vista registrada en post {post_id}. Total vistas: {post.views}")
        return {"success": True, "views": post.views}
    except Exception as e:
        db.rollback()
        logger.error(f"Error registrando vista en post {post_id}: {e}")
        raise HTTPException(status_code=500, detail="Error registrando vista")

@ugc_router.post("/posts/{post_id}/click")
async def register_post_click(
    post_id: int,
    db: Session = Depends(get_db)
):
    """Registrar un click en un post (cuando se abre el modal/detalle)"""
    post = db.query(Post).filter(Post.id == post_id).first()
    
    if not post:
        raise HTTPException(status_code=404, detail="Publicación no encontrada")
    
    # Incrementar contador de clicks
    if post.clicks is None:
        post.clicks = 0
    post.clicks += 1
    
    try:
        db.commit()
        db.refresh(post)
        logger.info(f"🖱️ Click registrado en post {post_id}. Total clicks: {post.clicks}")
        return {"success": True, "clicks": post.clicks}
    except Exception as e:
        db.rollback()
        logger.error(f"Error registrando click en post {post_id}: {e}")
        raise HTTPException(status_code=500, detail="Error registrando click")

@ugc_router.post("/posts/{post_id}/interact")
async def register_post_interaction(
    post_id: int,
    db: Session = Depends(get_db)
):
    """Registrar una interacción en un post (like, share, etc)"""
    post = db.query(Post).filter(Post.id == post_id).first()
    
    if not post:
        raise HTTPException(status_code=404, detail="Publicación no encontrada")
    
    # Incrementar contador de interacciones
    if post.interacciones is None:
        post.interacciones = 0
    post.interacciones += 1
    
    try:
        db.commit()
        db.refresh(post)
        logger.info(f"⭐ Interacción registrada en post {post_id}. Total interacciones: {post.interacciones}")
        return {"success": True, "interacciones": post.interacciones}
    except Exception as e:
        db.rollback()
        logger.error(f"Error registrando interacción en post {post_id}: {e}")
        raise HTTPException(status_code=500, detail="Error registrando interacción")

# ===== ENDPOINTS DE REACCIONES =====

@ugc_router.post("/posts/{post_id}/react")
async def add_reaction(
    post_id: int,
    reaction_data: ReactionCreate,
    current_user: Optional[User] = Depends(lambda: None),  # Opcional
    db: Session = Depends(get_db)
):
    """Agregar o cambiar reacción a un post"""
    post = db.query(Post).filter(Post.id == post_id).first()
    
    if not post:
        raise HTTPException(status_code=404, detail="Publicación no encontrada")
    
    # Validar tipo de reacción
    valid_reactions = ['like', 'love', 'haha', 'sad', 'angry']
    if reaction_data.tipo not in valid_reactions:
        raise HTTPException(status_code=400, detail=f"Tipo de reacción inválido. Debe ser uno de: {', '.join(valid_reactions)}")
    
    # Buscar si ya existe una reacción del usuario/sesión
    if current_user:
        existing_reaction = db.query(Reaction).filter(
            Reaction.post_id == post_id,
            Reaction.user_id == current_user.id
        ).first()
    elif reaction_data.session_id:
        existing_reaction = db.query(Reaction).filter(
            Reaction.post_id == post_id,
            Reaction.session_id == reaction_data.session_id
        ).first()
    else:
        raise HTTPException(status_code=400, detail="Se requiere autenticación o session_id")
    
    if existing_reaction:
        # Si es la misma reacción, eliminarla (toggle)
        if existing_reaction.tipo == reaction_data.tipo:
            db.delete(existing_reaction)
            db.commit()
            logger.info(f"🔄 Reacción {reaction_data.tipo} eliminada del post {post_id}")
            return {"success": True, "action": "removed", "tipo": reaction_data.tipo}
        else:
            # Cambiar la reacción
            existing_reaction.tipo = reaction_data.tipo
            db.commit()
            logger.info(f"🔄 Reacción cambiada a {reaction_data.tipo} en post {post_id}")
            return {"success": True, "action": "changed", "tipo": reaction_data.tipo}
    else:
        # Crear nueva reacción
        new_reaction = Reaction(
            post_id=post_id,
            user_id=current_user.id if current_user else None,
            session_id=reaction_data.session_id if not current_user else None,
            tipo=reaction_data.tipo
        )
        db.add(new_reaction)
        db.commit()
        logger.info(f"✨ Nueva reacción {reaction_data.tipo} agregada al post {post_id}")
        return {"success": True, "action": "added", "tipo": reaction_data.tipo}

@ugc_router.get("/posts/{post_id}/reactions")
async def get_post_reactions(
    post_id: int,
    session_id: Optional[str] = None,
    current_user: Optional[User] = Depends(lambda: None),
    db: Session = Depends(get_db)
):
    """Obtener estadísticas de reacciones de un post"""
    # Contar reacciones por tipo
    reactions = db.query(Reaction).filter(Reaction.post_id == post_id).all()
    
    stats = {
        "like": 0,
        "love": 0,
        "haha": 0,
        "sad": 0,
        "angry": 0,
        "total": len(reactions),
        "user_reaction": None
    }
    
    for reaction in reactions:
        if reaction.tipo in stats:
            stats[reaction.tipo] += 1
        
        # Verificar si el usuario actual ya reaccionó
        if current_user and reaction.user_id == current_user.id:
            stats["user_reaction"] = reaction.tipo
        elif session_id and reaction.session_id == session_id:
            stats["user_reaction"] = reaction.tipo
    
    return stats

@ugc_router.post("/report")
async def report_post(
    report_data: ReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reportar una publicación"""
    
    if not report_data.comentario or len(report_data.comentario.strip()) < 10:
        raise HTTPException(
            status_code=400,
            detail="El comentario debe tener al menos 10 caracteres"
        )
    
    result = ReportService.crear_reporte(
        db=db,
        post_id=report_data.post_id,
        reporter_id=current_user.id,
        motivo=report_data.motivo,
        comentario=report_data.comentario
    )
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@ugc_router.get("/notifications", response_model=List[NotificationResponse])
async def get_notifications(
    unread_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtener notificaciones del usuario"""
    notifications = NotificationService.obtener_notificaciones(
        db=db,
        user_id=current_user.id,
        solo_no_leidas=unread_only
    )
    
    return [NotificationResponse(**n.__dict__) for n in notifications]

@ugc_router.post("/notifications/{notification_id}/mark-read")
async def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marcar notificación como leída"""
    success = NotificationService.marcar_como_leida(db, notification_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    
    return {"success": True}

@ugc_router.post("/notifications/mark-all-read")
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marcar todas las notificaciones como leídas"""
    NotificationService.marcar_todas_leidas(db, current_user.id)
    return {"success": True}

# ===== ENDPOINTS ADMIN =====

@admin_router.get("/dashboard/health")
async def dashboard_health_check(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Diagnóstico de salud del dashboard"""
    results = {}
    
    # Test 1: Conexión a DB
    try:
        db.execute(text("SELECT 1")).scalar()
        results["db_connection"] = "✅ OK"
    except Exception as e:
        results["db_connection"] = f"❌ ERROR: {str(e)}"
    
    # Test 2: Tabla Posts
    try:
        count = db.execute(text("SELECT COUNT(*) FROM posts")).scalar()
        results["posts_table"] = f"✅ OK ({count} posts)"
    except Exception as e:
        results["posts_table"] = f"❌ ERROR: {str(e)}"
    
    # Test 3: Tabla Users
    try:
        count = db.execute(text("SELECT COUNT(*) FROM users")).scalar()
        results["users_table"] = f"✅ OK ({count} users)"
    except Exception as e:
        results["users_table"] = f"❌ ERROR: {str(e)}"
    
    # Test 4: Tabla Reports
    try:
        count = db.execute(text("SELECT COUNT(*) FROM reports")).scalar()
        results["reports_table"] = f"✅ OK ({count} reports)"
    except Exception as e:
        results["reports_table"] = f"❌ ERROR: {str(e)}"
    
    # Test 5: Enum Estados
    try:
        db.execute(text("SELECT DISTINCT estado FROM posts")).fetchall()
        results["post_estados"] = "✅ OK"
    except Exception as e:
        results["post_estados"] = f"❌ ERROR: {str(e)}"
    
    return results

@admin_router.get("/dashboard")
async def get_admin_dashboard(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Obtener estadísticas del dashboard de admin"""
    try:
        logger.info("📊 Iniciando carga de dashboard admin...")
        
        # Obtener todos los posts
        logger.info("Obteniendo posts...")
        total_posts = db.query(Post).count()
        pending_posts = db.query(Post).filter(Post.estado == 'pending_review').count()
        published_posts = db.query(Post).filter(Post.estado == 'published').count()
        rejected_posts = db.query(Post).filter(Post.estado == 'rejected').count()
        flagged_posts = db.query(Post).filter(Post.estado == 'flagged').count()
        logger.info(f"✅ Posts obtenidos: {total_posts} total")
        
        # Obtener usuarios
        logger.info("Obteniendo usuarios...")
        total_users = db.query(User).count()
        admin_users = db.query(User).filter(User.role == 'admin').count()
        suspended_users = db.query(User).filter(User.suspendido == True).count()
        logger.info(f"✅ Usuarios obtenidos: {total_users} total")
        
        # Calcular ingresos totales usando configuración por tipo
        logger.info("Calculando ingresos...")
        all_posts = db.query(Post).all()
        total_ingresos = 0.0
        ganancia_usuarios_total = 0.0
        
        for post in all_posts:
            try:
                earnings_config = get_earnings_for_type(db, post.tipo)
                # Manejar valores NULL
                views = post.views if post.views is not None else 0
                clicks = post.clicks if post.clicks is not None else 0
                interacciones = post.interacciones if post.interacciones is not None else 0
                
                total_interactions = views + clicks + interacciones
                cost_per_interaction = earnings_config["cost_per_interaction"]
                user_percentage = earnings_config["percentage"] / 100
                
                # Ingresos totales por este post
                post_revenue = total_interactions * cost_per_interaction
                total_ingresos += post_revenue
                
                # Ganancias del usuario por este post
                user_earning = post_revenue * user_percentage
                ganancia_usuarios_total += user_earning
            except Exception as e:
                logger.warning(f"Error calculando earnings para post {post.id}: {e}")
                continue
        
        ganancia_admin = total_ingresos - ganancia_usuarios_total
        logger.info(f"✅ Ingresos calculados: ${total_ingresos}")
        
        # Obtener reportes con manejo de errores
        logger.info("Obteniendo reportes...")
        try:
            # Usar raw SQL para evitar problemas con enums
            total_reportes = db.execute(text("SELECT COUNT(*) FROM reports")).scalar() or 0
            reportes_pendientes = db.execute(
                text("SELECT COUNT(*) FROM reports WHERE estado = 'pending'")
            ).scalar() or 0
            logger.info(f"✅ Reportes obtenidos: {total_reportes} total, {reportes_pendientes} pendientes")
        except Exception as e:
            logger.error(f"❌ Error obteniendo reportes: {e}")
            total_reportes = 0
            reportes_pendientes = 0
        
        logger.info("📦 Preparando respuesta del dashboard...")
        
        response_data = {
            "posts": {
                "total": total_posts,
                "pending": pending_posts,
                "published": published_posts,
                "rejected": rejected_posts,
                "flagged": flagged_posts
            },
            "users": {
                "total": total_users,
                "admins": admin_users,
                "suspended": suspended_users
            },
            "earnings": {
                "total_ingresos": round(total_ingresos, 2),
                "ganancia_admin": round(ganancia_admin, 2),
                "ganancia_usuarios": round(ganancia_usuarios_total, 2)
            },
            "reports": {
                "total": total_reportes,
                "pending": reportes_pendientes
            }
        }
        
        logger.info("✅ Dashboard obtenido exitosamente")
        return response_data
        
    except Exception as e:
        logger.error(f"❌ ERROR CRÍTICO en dashboard: {e}")
        logger.exception(e)  # Esto mostrará el stack trace completo
        raise HTTPException(status_code=500, detail=str(e))

@admin_router.get("/users")
async def get_all_users(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Obtener lista de todos los usuarios"""
    try:
        users = db.query(User).all()
        
        users_data = []
        for user in users:
            # Contar posts del usuario
            user_posts = db.query(Post).filter(Post.user_id == user.id).count()
            
            # Calcular ganancias del usuario usando configuración por tipo
            posts = db.query(Post).filter(Post.user_id == user.id).all()
            user_ganancia = 0.0
            for post in posts:
                try:
                    earnings_config = get_earnings_for_type(db, post.tipo)
                    # Manejar valores NULL
                    views = post.views if post.views is not None else 0
                    clicks = post.clicks if post.clicks is not None else 0
                    interacciones = post.interacciones if post.interacciones is not None else 0
                    
                    total_interactions = views + clicks + interacciones
                    cost_per_interaction = earnings_config["cost_per_interaction"]
                    user_percentage = earnings_config["percentage"] / 100
                    post_earning = total_interactions * cost_per_interaction * user_percentage
                    user_ganancia += post_earning
                except Exception as e:
                    logger.warning(f"Error calculando earnings para post {post.id}: {e}")
                    continue
            
            users_data.append({
                "id": user.id,
                "email": user.email,
                "role": user.role,
                "created_at": user.created_at,
                "suspendido": user.suspendido,
                "motivo_suspension": user.motivo_suspension,
                "total_posts": user_posts,
                "ganancia_acumulada": round(user_ganancia, 2)
            })
        
        return users_data
    except Exception as e:
        logger.error(f"Error obteniendo usuarios: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@admin_router.get("/posts/pending", response_model=List[PostResponse])
async def get_pending_posts(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Obtener publicaciones pendientes de revisión"""
    posts = db.query(Post).filter(
        Post.estado == 'pending_review'
    ).order_by(Post.created_at.asc()).all()
    
    result = []
    for post in posts:
        user = db.query(User).filter(User.id == post.user_id).first()
        result.append(PostResponse(
            **post.__dict__,
            user_email=user.email if user else None
        ))
    
    return result

@admin_router.post("/posts/{post_id}/approve")
async def approve_post(
    post_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Aprobar publicación"""
    post = db.query(Post).filter(Post.id == post_id).first()
    
    if not post:
        raise HTTPException(status_code=404, detail="Publicación no encontrada")
    
    if post.estado != 'pending_review':
        raise HTTPException(status_code=400, detail="Solo se pueden aprobar posts en pending_review")
    
    # Aprobar
    post.estado = 'published'
    post.revisado_por = current_user.id
    post.fecha_revision = datetime.now()
    
    # Notificar al autor (opcional si existe el servicio)
    try:
        NotificationService.notificar_aprobacion(
            db=db,
            user_id=post.user_id,
            post_id=post.id
        )
    except Exception as e:
        logger.warning(f"No se pudo enviar notificación: {e}")
    
    db.commit()
    
    logger.info(f"✅ Post {post_id} aprobado por admin {current_user.id}")
    
    return {"success": True, "message": "Publicación aprobada"}

@admin_router.post("/posts/{post_id}/reject")
async def reject_post(
    post_id: int,
    reject_data: RejectPostRequest,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Rechazar publicación"""
    post = db.query(Post).filter(Post.id == post_id).first()
    
    if not post:
        raise HTTPException(status_code=404, detail="Publicación no encontrada")
    
    if post.estado != 'pending_review':
        raise HTTPException(status_code=400, detail="Solo se pueden rechazar posts en pending_review")
    
    # Rechazar
    post.estado = 'rejected'
    post.revisado_por = current_user.id
    post.fecha_revision = datetime.now()
    post.motivo_rechazo = reject_data.motivo_rechazo
    
    # Notificar al autor (opcional si existe el servicio)
    try:
        NotificationService.notificar_rechazo(
            db=db,
            user_id=post.user_id,
            post_id=post.id,
            motivo=reject_data.motivo_rechazo
        )
    except Exception as e:
        logger.warning(f"No se pudo enviar notificación: {e}")
    
    db.commit()
    
    logger.info(f"❌ Post {post_id} rechazado por admin {current_user.id}")
    
    return {"success": True, "message": "Publicación rechazada"}

@admin_router.get("/posts/reported")
async def get_reported_posts(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Obtener publicaciones reportadas"""
    posts = ReportService.obtener_posts_reportados(db, solo_flagged=True)
    
    result = []
    for post in posts:
        user = db.query(User).filter(User.id == post.user_id).first()
        reportes = ReportService.obtener_reportes_por_post(db, post.id)
        
        reportes_data = []
        for reporte in reportes:
            reporter = db.query(User).filter(User.id == reporte.reporter_id).first()
            reportes_data.append({
                "id": reporte.id,
                "reporter_email": reporter.email if reporter else "Unknown",
                "motivo": reporte.motivo,
                "comentario": reporte.comentario,
                "created_at": reporte.created_at
            })
        
        result.append({
            "id": post.id,
            "titulo": post.titulo,
            "contenido": post.contenido[:200] + "..." if len(post.contenido) > 200 else post.contenido,
            "tipo": post.tipo,
            "imagen_url": post.imagen_url,
            "user_email": user.email if user else None,
            "user_id": post.user_id,
            "total_reportes": post.total_reportes,
            "estado": post.estado,
            "created_at": post.created_at,
            "reportes": reportes_data
        })
    
    return result

@admin_router.post("/posts/{post_id}/confirm-fake")
async def confirm_fake_news(
    post_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Confirmar publicación como fake news y suspender autor"""
    result = ReportService.confirmar_fake(db, post_id, current_user.id)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@admin_router.post("/posts/{post_id}/dismiss-reports")
async def dismiss_reports(
    post_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Descartar reportes y restaurar publicación"""
    result = ReportService.descartar_reportes(db, post_id, current_user.id)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@admin_router.get("/reports/stats")
async def get_report_stats(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Obtener estadísticas de reportes"""
    return ReportService.obtener_estadisticas_reportes(db)

@admin_router.get("/settings/report-threshold")
async def get_report_threshold(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Obtener umbral actual de reportes"""
    threshold = ReportService.get_report_threshold(db)
    return {"threshold": threshold}

@admin_router.post("/settings/report-threshold")
async def update_report_threshold(
    threshold_data: UpdateThresholdRequest,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Actualizar umbral de reportes"""
    
    if threshold_data.threshold < 1 or threshold_data.threshold > 1000:
        raise HTTPException(status_code=400, detail="El umbral debe estar entre 1 y 1000")
    
    success = ReportService.set_report_threshold(
        db=db,
        new_threshold=threshold_data.threshold,
        admin_id=current_user.id
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Error actualizando umbral")
    
    return {
        "success": True,
        "message": f"Umbral actualizado a {threshold_data.threshold}",
        "new_threshold": threshold_data.threshold
    }

# ===== GESTIÓN DE GANANCIAS POR TIPO DE CONTENIDO =====

def get_earnings_for_type(db: Session, content_type: str) -> dict:
    """Obtener configuración de ganancias para un tipo de contenido específico"""
    try:
        setting = db.query(SystemSettings).filter(
            SystemSettings.clave == "earnings_config"
        ).first()
        
        default_config = {
            "noticia": {"percentage": 30, "cost_per_interaction": 0.05},
            "texto": {"percentage": 30, "cost_per_interaction": 0.01},
            "imagen": {"percentage": 30, "cost_per_interaction": 0.02},
            "video": {"percentage": 30, "cost_per_interaction": 0.03},
            "comentario": {"percentage": 30, "cost_per_interaction": 0.005},
            "resena": {"percentage": 30, "cost_per_interaction": 0.02},
            "post": {"percentage": 30, "cost_per_interaction": 0.01}
        }
        
        if setting and setting.valor:
            try:
                config = json.loads(setting.valor)
            except Exception as e:
                logger.warning(f"Error parsing earnings config: {e}, using default")
                config = default_config
        else:
            config = default_config
        
        return config.get(content_type, {"percentage": 30, "cost_per_interaction": 0.01})
    except Exception as e:
        logger.error(f"Error in get_earnings_for_type: {e}")
        # Retornar configuración por defecto en caso de error
        return {"percentage": 30, "cost_per_interaction": 0.01}

@admin_router.get("/settings/earnings-config")
async def get_earnings_config(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Obtener configuración de ganancias por tipo de contenido"""
    # Buscar la configuración en system_settings
    setting = db.query(SystemSettings).filter(
        SystemSettings.clave == "earnings_config"
    ).first()
    
    if setting:
        try:
            config = json.loads(setting.valor)
        except:
            config = {}
    else:
        # Configuración por defecto
        config = {
            "noticia": {"percentage": 30, "cost_per_interaction": 0.05},
            "texto": {"percentage": 30, "cost_per_interaction": 0.01},
            "imagen": {"percentage": 30, "cost_per_interaction": 0.02},
            "video": {"percentage": 30, "cost_per_interaction": 0.03},
            "comentario": {"percentage": 30, "cost_per_interaction": 0.005},
            "resena": {"percentage": 30, "cost_per_interaction": 0.02},
            "post": {"percentage": 30, "cost_per_interaction": 0.01}
        }
    
    return {"config": config}

@admin_router.post("/settings/earnings-config")
async def update_earnings_config(
    config_data: EarningsConfigRequest,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Actualizar configuración de ganancias por tipo de contenido"""
    # Validar que los valores sean correctos
    for tipo, values in config_data.config.items():
        if not isinstance(values, dict):
            raise HTTPException(status_code=400, detail=f"Configuración inválida para {tipo}")
        
        percentage = values.get("percentage", 0)
        cost = values.get("cost_per_interaction", 0)
        
        if percentage < 0 or percentage > 100:
            raise HTTPException(status_code=400, detail=f"Porcentaje inválido para {tipo}: debe estar entre 0 y 100")
        
        if cost < 0:
            raise HTTPException(status_code=400, detail=f"Costo inválido para {tipo}: debe ser mayor a 0")
    
    # Buscar o crear el setting
    setting = db.query(SystemSettings).filter(
        SystemSettings.clave == "earnings_config"
    ).first()
    
    if setting:
        setting.valor = json.dumps(config_data.config)
        setting.updated_by = current_user.id
        setting.updated_at = datetime.utcnow()
    else:
        setting = SystemSettings(
            clave="earnings_config",
            valor=json.dumps(config_data.config),
            descripcion="Configuración de ganancias por tipo de contenido",
            updated_by=current_user.id
        )
        db.add(setting)
    
    try:
        db.commit()
        logger.info(f"✅ Configuración de ganancias actualizada por admin {current_user.id}")
        
        return {
            "success": True,
            "message": "Configuración de ganancias actualizada exitosamente",
            "config": config_data.config
        }
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Error actualizando configuración de ganancias: {e}")
        raise HTTPException(status_code=500, detail="Error guardando configuración")

# ===== GESTIÓN DE REQUISITOS DE MONETIZACIÓN =====

@admin_router.get("/settings/monetization-requirements")
async def get_monetization_requirements_endpoint(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Obtener requisitos actuales de monetización"""
    requirements = get_monetization_requirements(db)
    return {"requirements": requirements}

@admin_router.post("/settings/monetization-requirements")
async def update_monetization_requirements(
    requirements_data: MonetizationRequirementsRequest,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Actualizar requisitos de monetización"""
    
    # Validar que los valores sean correctos
    if requirements_data.min_noticias < 0:
        raise HTTPException(status_code=400, detail="El mínimo de noticias no puede ser negativo")
    
    if requirements_data.min_interacciones_noticias < 0:
        raise HTTPException(status_code=400, detail="El mínimo de interacciones no puede ser negativo")
    
    if requirements_data.min_contenido_simple < 0:
        raise HTTPException(status_code=400, detail="El mínimo de contenido simple no puede ser negativo")
    
    if requirements_data.min_reacciones_totales < 0:
        raise HTTPException(status_code=400, detail="El mínimo de reacciones totales no puede ser negativo")
    
    if requirements_data.dias_minimos_cuenta < 0:
        raise HTTPException(status_code=400, detail="Los días mínimos no pueden ser negativos")
    
    # Buscar o crear el setting
    setting = db.query(SystemSettings).filter(
        SystemSettings.clave == "monetization_requirements"
    ).first()
    
    requirements_dict = {
        "min_noticias": requirements_data.min_noticias,
        "min_interacciones_noticias": requirements_data.min_interacciones_noticias,
        "min_contenido_simple": requirements_data.min_contenido_simple,
        "min_reacciones_totales": requirements_data.min_reacciones_totales,
        "dias_minimos_cuenta": requirements_data.dias_minimos_cuenta
    }
    
    if setting:
        setting.valor = json.dumps(requirements_dict)
        setting.updated_by = current_user.id
        setting.updated_at = datetime.utcnow()
    else:
        setting = SystemSettings(
            clave="monetization_requirements",
            valor=json.dumps(requirements_dict),
            descripcion="Requisitos para activar la monetización de usuarios",
            updated_by=current_user.id
        )
        db.add(setting)
    
    try:
        db.commit()
        logger.info(f"✅ Requisitos de monetización actualizados por admin {current_user.id}: {requirements_dict}")
        
        return {
            "success": True,
            "message": "Requisitos de monetización actualizados exitosamente",
            "requirements": requirements_dict
        }
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Error actualizando requisitos de monetización: {e}")
        raise HTTPException(status_code=500, detail="Error guardando requisitos")
