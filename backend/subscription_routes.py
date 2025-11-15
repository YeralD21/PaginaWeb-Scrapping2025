from datetime import datetime, timedelta
import os
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, validator
from sqlalchemy.orm import Session
from sqlalchemy import or_

from database import get_db
from models import SubscriptionPlan, UserSubscription, Noticia
from auth_ugc import get_current_user, get_current_admin_user
from models_ugc_enhanced import User
from premium_service import (
    update_premium_scores,
    get_recommended_premium_news,
)

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])


class SubscriptionPlanBase(BaseModel):
    nombre: str = Field(..., max_length=100)
    descripcion: Optional[str] = None
    precio: float = Field(..., gt=0)
    periodo: str = Field(..., description="semanal | mensual | trimestral | anual | personalizado")
    periodo_tipo: Optional[str] = Field(None, description="minutos | horas | dias | semanas | meses | años (solo si periodo=personalizado)")
    periodo_cantidad: Optional[int] = Field(None, gt=0, description="Cantidad del período personalizado (solo si periodo=personalizado)")
    beneficios: Optional[List[str]] = None
    es_activo: bool = True

    @validator("periodo")
    def validate_periodo(cls, value: str) -> str:
        allowed = {"semanal", "mensual", "trimestral", "anual", "personalizado"}
        value = value.lower()
        if value not in allowed:
            raise ValueError(f"periodo debe ser uno de {allowed}")
        return value
    
    @validator("periodo_tipo")
    def validate_periodo_tipo(cls, v, values):
        if values.get("periodo") == "personalizado" and not v:
            raise ValueError("periodo_tipo es requerido cuando periodo es 'personalizado'")
        if v and values.get("periodo") != "personalizado":
            return None  # Ignorar si no es personalizado
        if v:
            allowed = {"minutos", "horas", "dias", "semanas", "meses", "años"}
            if v.lower() not in allowed:
                raise ValueError(f"periodo_tipo debe ser uno de {allowed}")
        return v
    
    @validator("periodo_cantidad")
    def validate_periodo_cantidad(cls, v, values):
        if values.get("periodo") == "personalizado" and not v:
            raise ValueError("periodo_cantidad es requerido cuando periodo es 'personalizado'")
        if v and values.get("periodo") != "personalizado":
            return None  # Ignorar si no es personalizado
        return v


class SubscriptionPlanCreate(SubscriptionPlanBase):
    pass


class SubscriptionPlanUpdate(BaseModel):
    nombre: Optional[str] = Field(None, max_length=100)
    descripcion: Optional[str] = None
    precio: Optional[float] = Field(None, gt=0)
    periodo: Optional[str] = Field(None, description="semanal | mensual | trimestral | anual | personalizado")
    periodo_tipo: Optional[str] = Field(None, description="minutos | horas | dias | semanas | meses | años")
    periodo_cantidad: Optional[int] = Field(None, gt=0)
    beneficios: Optional[List[str]] = None
    es_activo: Optional[bool] = None

    @validator("periodo")
    def validate_periodo(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        allowed = {"semanal", "mensual", "trimestral", "anual", "personalizado"}
        value = value.lower()
        if value not in allowed:
            raise ValueError(f"periodo debe ser uno de {allowed}")
        return value
    
    @validator("periodo_tipo")
    def validate_periodo_tipo(cls, v, values):
        if v:
            allowed = {"minutos", "horas", "dias", "semanas", "meses", "años"}
            if v.lower() not in allowed:
                raise ValueError(f"periodo_tipo debe ser uno de {allowed}")
        return v


class SubscriptionPlanResponse(SubscriptionPlanBase):
    id: int
    creado_en: datetime
    periodo_tipo: Optional[str] = None
    periodo_cantidad: Optional[int] = None

    class Config:
        from_attributes = True


class CheckoutRequest(BaseModel):
    plan_id: int
    renovacion_automatica: bool = False


class CheckoutResponse(BaseModel):
    subscription_id: int
    estado: str
    referencia_pago: str
    plan: SubscriptionPlanResponse
    instrucciones_pago: dict


class SubscriptionSummary(BaseModel):
    subscription_id: int
    estado: str
    fecha_inicio: datetime
    fecha_fin: Optional[datetime]
    renovacion_automatica: bool
    referencia_pago: Optional[str]
    plan: SubscriptionPlanResponse
    dias_restantes: Optional[int]

    class Config:
        from_attributes = True


class ConfirmRequest(BaseModel):
    subscription_id: int


class RecalculateRequest(BaseModel):
    hours_window: int = Field(168, ge=24, le=720)
    auto_mark: bool = False
    top_percentage: float = Field(0.15, gt=0, le=1)


class PremiumToggleRequest(BaseModel):
    noticia_ids: List[int] = Field(..., min_items=1)
    es_premium: bool = True


class PremiumNewsItem(BaseModel):
    id: int
    titulo: str
    categoria: Optional[str]
    es_premium: bool
    premium_score: float
    es_trending: bool
    popularidad_score: Optional[float]
    fecha_publicacion: Optional[datetime]

    class Config:
        from_attributes = True


PERIOD_TO_DAYS = {
    "semanal": 7,
    "mensual": 30,
    "trimestral": 90,
    "anual": 365,
}


def calculate_end_date(start: datetime, plan: SubscriptionPlan) -> datetime:
    """Calcular fecha de fin basada en el plan"""
    if plan.periodo == "personalizado" and plan.periodo_tipo and plan.periodo_cantidad:
        # Período personalizado
        tipo = plan.periodo_tipo.lower()
        cantidad = plan.periodo_cantidad
        
        if tipo == "minutos":
            return start + timedelta(minutes=cantidad)
        elif tipo == "horas":
            return start + timedelta(hours=cantidad)
        elif tipo == "dias":
            return start + timedelta(days=cantidad)
        elif tipo == "semanas":
            return start + timedelta(weeks=cantidad)
        elif tipo == "meses":
            return start + timedelta(days=cantidad * 30)  # Aproximación: 30 días por mes
        elif tipo == "años":
            return start + timedelta(days=cantidad * 365)
        else:
            # Fallback a días
            return start + timedelta(days=cantidad)
    else:
        # Período predefinido
        days = PERIOD_TO_DAYS.get(plan.periodo, 30)
        return start + timedelta(days=days)


@router.get("/plans", response_model=List[SubscriptionPlanResponse])
def list_plans(
    include_inactive: bool = False,
    db: Session = Depends(get_db),
) -> List[SubscriptionPlan]:
    """Obtener planes disponibles (solo activos por defecto)"""
    query = db.query(SubscriptionPlan)
    if not include_inactive:
        query = query.filter(SubscriptionPlan.es_activo.is_(True))
    plans = query.order_by(SubscriptionPlan.precio.asc()).all()
    return plans


@router.get("/admin/plans", response_model=List[SubscriptionPlanResponse])
def list_all_plans_admin(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> List[SubscriptionPlanResponse]:
    """Obtener todos los planes (incluyendo inactivos) - Solo admin"""
    try:
        plans = db.query(SubscriptionPlan).order_by(SubscriptionPlan.creado_en.desc()).all()
        # Convertir a lista de diccionarios para asegurar la serialización
        result = []
        for plan in plans:
            result.append(SubscriptionPlanResponse(
                id=plan.id,
                nombre=plan.nombre,
                descripcion=plan.descripcion,
                precio=plan.precio,
                periodo=plan.periodo,
                beneficios=plan.beneficios or [],
                es_activo=plan.es_activo,
                creado_en=plan.creado_en
            ))
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener planes: {str(e)}")


@router.post("/admin/plans", response_model=SubscriptionPlanResponse)
def create_plan_admin(
    plan_data: SubscriptionPlanCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> SubscriptionPlan:
    """Crear un nuevo plan - Solo admin"""
    existing = db.query(SubscriptionPlan).filter(SubscriptionPlan.nombre == plan_data.nombre).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un plan con ese nombre")

    plan = SubscriptionPlan(
        nombre=plan_data.nombre,
        descripcion=plan_data.descripcion,
        precio=plan_data.precio,
        periodo=plan_data.periodo,
        periodo_tipo=plan_data.periodo_tipo if plan_data.periodo == "personalizado" else None,
        periodo_cantidad=plan_data.periodo_cantidad if plan_data.periodo == "personalizado" else None,
        beneficios=plan_data.beneficios or [],
        es_activo=plan_data.es_activo,
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan


@router.put("/admin/plans/{plan_id}", response_model=SubscriptionPlanResponse)
def update_plan(
    plan_id: int,
    plan_data: SubscriptionPlanUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> SubscriptionPlan:
    """Actualizar un plan existente - Solo admin"""
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan no encontrado")

    # Verificar si hay usuarios activos con este plan antes de desactivarlo
    if plan_data.es_activo is False and plan.es_activo is True:
        active_subscriptions = db.query(UserSubscription).filter(
            UserSubscription.plan_id == plan_id,
            UserSubscription.estado == "active"
        ).count()
        # Los usuarios activos conservarán su plan hasta que expire

    if plan_data.nombre is not None:
        if (
            db.query(SubscriptionPlan)
            .filter(SubscriptionPlan.nombre == plan_data.nombre, SubscriptionPlan.id != plan_id)
            .first()
        ):
            raise HTTPException(status_code=400, detail="Ya existe otro plan con ese nombre")
        plan.nombre = plan_data.nombre

    if plan_data.descripcion is not None:
        plan.descripcion = plan_data.descripcion
    if plan_data.precio is not None:
        plan.precio = plan_data.precio
    if plan_data.periodo is not None:
        plan.periodo = plan_data.periodo
        # Si cambia a personalizado o deja de serlo, actualizar campos relacionados
        if plan_data.periodo == "personalizado":
            if plan_data.periodo_tipo is not None:
                plan.periodo_tipo = plan_data.periodo_tipo
            if plan_data.periodo_cantidad is not None:
                plan.periodo_cantidad = plan_data.periodo_cantidad
        else:
            # Si no es personalizado, limpiar campos
            plan.periodo_tipo = None
            plan.periodo_cantidad = None
    else:
        # Si no se cambia el período pero se actualizan los campos personalizados
        if plan.periodo == "personalizado":
            if plan_data.periodo_tipo is not None:
                plan.periodo_tipo = plan_data.periodo_tipo
            if plan_data.periodo_cantidad is not None:
                plan.periodo_cantidad = plan_data.periodo_cantidad
    if plan_data.beneficios is not None:
        plan.beneficios = plan_data.beneficios
    if plan_data.es_activo is not None:
        plan.es_activo = plan_data.es_activo

    db.commit()
    db.refresh(plan)
    return plan


@router.delete("/admin/plans/{plan_id}")
def deactivate_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> dict:
    """Desactivar un plan (no eliminar) - Solo admin"""
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan no encontrado")

    # Verificar si hay suscripciones activas
    active_subscriptions = db.query(UserSubscription).filter(
        UserSubscription.plan_id == plan_id,
        UserSubscription.estado == "active"
    ).count()
    
    # Desactivar el plan (no eliminar)
    # Los usuarios con suscripciones activas conservarán su plan hasta que expire
    plan.es_activo = False
    db.commit()
    
    message = "Plan desactivado correctamente"
    if active_subscriptions > 0:
        message += f". {active_subscriptions} usuario(s) con suscripción activa conservarán su plan hasta que expire, pero no podrán renovarlo automáticamente."
    
    return {"message": message, "active_subscriptions": active_subscriptions}


@router.post("/admin/plans/{plan_id}/activate")
def activate_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> dict:
    """Activar un plan desactivado - Solo admin"""
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan no encontrado")
    
    plan.es_activo = True
    db.commit()
    
    return {"message": "Plan activado correctamente"}


@router.delete("/admin/plans/{plan_id}/delete")
def delete_plan_permanently(
    plan_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> dict:
    """Eliminar permanentemente un plan - Solo admin"""
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan no encontrado")
    
    # Verificar si hay suscripciones asociadas
    total_subscriptions = db.query(UserSubscription).filter(
        UserSubscription.plan_id == plan_id
    ).count()
    
    if total_subscriptions > 0:
        raise HTTPException(
            status_code=400,
            detail=f"No se puede eliminar el plan. Tiene {total_subscriptions} suscripción(es) asociada(s). Desactiva el plan en su lugar."
        )
    
    # Eliminar el plan permanentemente
    db.delete(plan)
    db.commit()
    
    return {"message": "Plan eliminado permanentemente"}


@router.get("/admin/plans/{plan_id}/stats")
def get_plan_stats(
    plan_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> dict:
    """Obtener estadísticas de un plan - Solo admin"""
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan no encontrado")
    
    total_subscriptions = db.query(UserSubscription).filter(
        UserSubscription.plan_id == plan_id
    ).count()
    
    # Verificar suscripciones activas que no hayan expirado
    now = datetime.utcnow()
    active_subscriptions = db.query(UserSubscription).filter(
        UserSubscription.plan_id == plan_id,
        UserSubscription.estado == "active",
        or_(
            UserSubscription.fecha_fin.is_(None),
            UserSubscription.fecha_fin > now,
        )
    ).count()
    
    pending_subscriptions = db.query(UserSubscription).filter(
        UserSubscription.plan_id == plan_id,
        UserSubscription.estado == "pending"
    ).count()
    
    cancelled_subscriptions = db.query(UserSubscription).filter(
        UserSubscription.plan_id == plan_id,
        UserSubscription.estado == "cancelled"
    ).count()
    
    return {
        "plan_id": plan_id,
        "plan_nombre": plan.nombre,
        "total_subscriptions": total_subscriptions,
        "active_subscriptions": active_subscriptions,
        "pending_subscriptions": pending_subscriptions,
        "cancelled_subscriptions": cancelled_subscriptions,
        "can_deactivate": active_subscriptions == 0
    }


@router.post("/admin/expire-subscriptions")
def expire_subscriptions(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> dict:
    """Expirar suscripciones que han pasado su fecha de fin - Solo admin"""
    now = datetime.utcnow()
    
    # Buscar suscripciones activas que han expirado
    expired_subscriptions = db.query(UserSubscription).filter(
        UserSubscription.estado == "active",
        UserSubscription.fecha_fin.isnot(None),
        UserSubscription.fecha_fin <= now
    ).all()
    
    expired_count = 0
    for subscription in expired_subscriptions:
        subscription.estado = "expired"
        expired_count += 1
    
    db.commit()
    
    return {
        "message": f"Se expiraron {expired_count} suscripción(es)",
        "expired_count": expired_count
    }


@router.post("/checkout", response_model=CheckoutResponse)
def checkout_subscription(
    payload: CheckoutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CheckoutResponse:
    plan = db.query(SubscriptionPlan).filter(
        SubscriptionPlan.id == payload.plan_id,
        SubscriptionPlan.es_activo.is_(True),
    ).first()

    if not plan:
        raise HTTPException(status_code=404, detail="Plan no disponible")

    active_subscription = (
        db.query(UserSubscription)
        .filter(
            UserSubscription.user_id == current_user.id,
            UserSubscription.estado == "active",
            or_(
                UserSubscription.fecha_fin.is_(None),
                UserSubscription.fecha_fin > datetime.utcnow(),
            ),
        )
        .first()
    )

    if active_subscription:
        raise HTTPException(
            status_code=400,
            detail="Ya tienes una suscripción activa",
        )

    referencia = uuid.uuid4().hex[:10].upper()

    subscription = UserSubscription(
        user_id=current_user.id,
        plan_id=plan.id,
        estado="pending",
        referencia_pago=referencia,
        renovacion_automatica=payload.renovacion_automatica,
    )
    db.add(subscription)
    db.commit()
    db.refresh(subscription)

    instrucciones = {
        "mensaje": "Paga el plan usando alguno de los métodos y envía el comprobante al correo soporte@tuapp.com.",
        "referencia_pago": referencia,
        "yape_qr_url": os.getenv("PAYMENT_YAPE_QR_URL", "/images/QR_PAGO.jpg"),
        "paypal_link": os.getenv("PAYMENT_PAYPAL_LINK", "https://www.paypal.me/fabinho1710"),
    }

    return CheckoutResponse(
        subscription_id=subscription.id,
        estado=subscription.estado,
        referencia_pago=referencia,
        plan=plan,
        instrucciones_pago=instrucciones,
    )


@router.post("/confirm", response_model=SubscriptionSummary)
def confirm_subscription(
    payload: ConfirmRequest,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> SubscriptionSummary:
    subscription = (
        db.query(UserSubscription)
        .filter(UserSubscription.id == payload.subscription_id)
        .first()
    )
    if not subscription:
        raise HTTPException(status_code=404, detail="Suscripción no encontrada")

    plan = subscription.plan
    if not plan:
        raise HTTPException(status_code=400, detail="La suscripción no tiene plan asociado")

    now = datetime.utcnow()
    subscription.estado = "active"
    subscription.fecha_inicio = subscription.fecha_inicio or now
    subscription.fecha_fin = calculate_end_date(subscription.fecha_inicio, plan)
    db.commit()
    db.refresh(subscription)

    dias_restantes = None
    if subscription.fecha_fin:
        dias_restantes = max((subscription.fecha_fin - now).days, 0)

    return SubscriptionSummary(
        subscription_id=subscription.id,
        estado=subscription.estado,
        fecha_inicio=subscription.fecha_inicio,
        fecha_fin=subscription.fecha_fin,
        renovacion_automatica=subscription.renovacion_automatica,
        referencia_pago=subscription.referencia_pago,
        plan=plan,
        dias_restantes=dias_restantes,
    )


@router.get("/me", response_model=Optional[SubscriptionSummary])
def get_my_subscription(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Optional[SubscriptionSummary]:
    now = datetime.utcnow()
    subscription = (
        db.query(UserSubscription)
        .filter(
            UserSubscription.user_id == current_user.id,
            UserSubscription.estado == "active",
            or_(
                UserSubscription.fecha_fin.is_(None),
                UserSubscription.fecha_fin > now,
            ),
        )
        .order_by(UserSubscription.fecha_inicio.desc())
        .first()
    )

    if not subscription:
        return None
    
    # Verificar si la suscripción ha expirado (incluso para períodos cortos)
    if subscription.fecha_fin and subscription.fecha_fin <= now:
        # Marcar como expirada automáticamente
        subscription.estado = "expired"
        db.commit()
        return None

    dias_restantes = None
    if subscription.fecha_fin:
        # Calcular tiempo restante en días, horas o minutos según corresponda
        tiempo_restante = subscription.fecha_fin - now
        if tiempo_restante.total_seconds() < 0:
            subscription.estado = "expired"
            db.commit()
            return None
        dias_restantes = max(tiempo_restante.days, 0)
        # Si es menos de un día, también calcular horas y minutos
        if dias_restantes == 0:
            horas_restantes = tiempo_restante.seconds // 3600
            minutos_restantes = (tiempo_restante.seconds % 3600) // 60
            # Para períodos muy cortos, usar minutos
            if horas_restantes == 0:
                dias_restantes = minutos_restantes / 1440  # Convertir minutos a días fraccionarios
            else:
                dias_restantes = horas_restantes / 24  # Convertir horas a días fraccionarios

    plan = subscription.plan
    return SubscriptionSummary(
        subscription_id=subscription.id,
        estado=subscription.estado,
        fecha_inicio=subscription.fecha_inicio,
        fecha_fin=subscription.fecha_fin,
        renovacion_automatica=subscription.renovacion_automatica,
        referencia_pago=subscription.referencia_pago,
        plan=plan,
        dias_restantes=dias_restantes,
    )


class SubscriptionStatusResponse(BaseModel):
    has_active: bool
    has_pending: bool
    has_rejected: bool
    pending_subscription: Optional[dict] = None
    rejected_subscription: Optional[dict] = None
    active_subscription: Optional[SubscriptionSummary] = None


@router.get("/status", response_model=SubscriptionStatusResponse)
def get_subscription_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SubscriptionStatusResponse:
    """Obtener estado completo de suscripciones del usuario"""
    now = datetime.utcnow()
    
    # Primero, marcar como expiradas las suscripciones activas que ya vencieron
    expired_subscriptions = (
        db.query(UserSubscription)
        .filter(
            UserSubscription.user_id == current_user.id,
            UserSubscription.estado == "active",
            UserSubscription.fecha_fin.isnot(None),
            UserSubscription.fecha_fin <= now
        )
        .all()
    )
    
    for expired_sub in expired_subscriptions:
        expired_sub.estado = "expired"
    
    if expired_subscriptions:
        db.commit()
    
    # Buscar suscripción activa
    active_subscription = (
        db.query(UserSubscription)
        .filter(
            UserSubscription.user_id == current_user.id,
            UserSubscription.estado == "active",
            or_(
                UserSubscription.fecha_fin.is_(None),
                UserSubscription.fecha_fin > now,
            ),
        )
        .order_by(UserSubscription.fecha_inicio.desc())
        .first()
    )
    
    # Buscar suscripción pendiente más reciente (solo si NO hay una activa)
    # También verificar si hay una suscripción revisada reciente (active, expired, rejected)
    # para evitar mostrar pendientes antiguas que deberían estar canceladas
    pending_subscription = None
    if not active_subscription:
        # Verificar si hay una suscripción que fue revisada (aprobada o rechazada)
        recent_reviewed = (
            db.query(UserSubscription)
            .filter(
                UserSubscription.user_id == current_user.id,
                UserSubscription.fecha_revision.isnot(None)
            )
            .order_by(UserSubscription.fecha_revision.desc())
            .first()
        )
        
        if recent_reviewed:
            # Solo mostrar pendiente si es más reciente que la última revisada
            pending_subscription = (
                db.query(UserSubscription)
                .filter(
                    UserSubscription.user_id == current_user.id,
                    UserSubscription.estado == "pending",
                    UserSubscription.creado_en > recent_reviewed.creado_en
                )
                .order_by(UserSubscription.creado_en.desc())
                .first()
            )
        else:
            # Si no hay ninguna revisada, buscar cualquier pendiente
            pending_subscription = (
                db.query(UserSubscription)
                .filter(
                    UserSubscription.user_id == current_user.id,
                    UserSubscription.estado == "pending"
                )
                .order_by(UserSubscription.creado_en.desc())
                .first()
            )
    
    # Buscar suscripción rechazada más reciente (solo si NO hay una activa ni pendiente)
    rejected_subscription = None
    if not active_subscription and not pending_subscription:
        rejected_subscription = (
            db.query(UserSubscription)
            .filter(
                UserSubscription.user_id == current_user.id,
                UserSubscription.estado == "rejected",
                UserSubscription.fecha_revision.isnot(None)
            )
            .order_by(UserSubscription.fecha_revision.desc())
            .first()
        )
    
    active_summary = None
    if active_subscription:
        plan = active_subscription.plan
        dias_restantes = None
        if active_subscription.fecha_fin:
            dias_restantes = max((active_subscription.fecha_fin - now).days, 0)
        active_summary = SubscriptionSummary(
            subscription_id=active_subscription.id,
            estado=active_subscription.estado,
            fecha_inicio=active_subscription.fecha_inicio,
            fecha_fin=active_subscription.fecha_fin,
            renovacion_automatica=active_subscription.renovacion_automatica,
            referencia_pago=active_subscription.referencia_pago,
            plan=plan,
            dias_restantes=dias_restantes,
        )
    
    pending_data = None
    if pending_subscription:
        plan = pending_subscription.plan
        pending_data = {
            "subscription_id": pending_subscription.id,
            "plan_nombre": plan.nombre if plan else "Plan desconocido",
            "referencia_pago": pending_subscription.referencia_pago,
            "fecha_pago_notificado": pending_subscription.fecha_pago_notificado.isoformat() if pending_subscription.fecha_pago_notificado else None
        }
    
    rejected_data = None
    if rejected_subscription:
        plan = rejected_subscription.plan
        rejected_data = {
            "subscription_id": rejected_subscription.id,
            "plan_nombre": plan.nombre if plan else "Plan desconocido",
            "motivo_rechazo": rejected_subscription.motivo_rechazo,
            "fecha_revision": rejected_subscription.fecha_revision.isoformat() if rejected_subscription.fecha_revision else None
        }
    
    return SubscriptionStatusResponse(
        has_active=active_subscription is not None,
        has_pending=pending_subscription is not None,
        has_rejected=rejected_subscription is not None,
        pending_subscription=pending_data,
        rejected_subscription=rejected_data,
        active_subscription=active_summary
    )


@router.post("/premium/recalculate")
def recalculate_premium_scores(
    payload: RecalculateRequest,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> dict:
    update_premium_scores(
        db,
        hours_window=payload.hours_window,
        auto_mark=payload.auto_mark,
        top_percentage=payload.top_percentage,
    )
    return {
        "message": "Puntajes premium actualizados",
        "auto_mark": payload.auto_mark,
    }


@router.get("/premium/recommendations", response_model=List[PremiumNewsItem])
def get_premium_recommendations(
    limit: int = 20,
    categoria: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> List[Noticia]:
    noticias = get_recommended_premium_news(
        db,
        limit=min(limit, 100),
        categoria=categoria,
    )
    return noticias


@router.post("/premium/toggle")
def toggle_premium_news(
    payload: PremiumToggleRequest,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> dict:
    noticias = (
        db.query(Noticia)
        .filter(Noticia.id.in_(payload.noticia_ids))
        .all()
    )

    if not noticias:
        raise HTTPException(status_code=404, detail="Noticias no encontradas")

    for noticia in noticias:
        noticia.es_premium = payload.es_premium

    db.commit()
    return {
        "message": f"{len(noticias)} noticias actualizadas",
        "es_premium": payload.es_premium,
    }


class PaymentNotificationRequest(BaseModel):
    subscription_id: int


class PaymentReviewRequest(BaseModel):
    subscription_id: int
    motivo_rechazo: Optional[str] = None


class PendingPaymentItem(BaseModel):
    subscription_id: int
    user_email: str
    plan_nombre: str
    plan_precio: float
    referencia_pago: str
    fecha_pago_notificado: Optional[datetime]
    fecha_creacion: datetime

    class Config:
        from_attributes = True


@router.post("/payment/notify")
def notify_payment(
    payload: PaymentNotificationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Marcar que el usuario ya pagó"""
    subscription = (
        db.query(UserSubscription)
        .filter(
            UserSubscription.id == payload.subscription_id,
            UserSubscription.user_id == current_user.id,
            UserSubscription.estado == "pending"
        )
        .first()
    )
    
    if not subscription:
        raise HTTPException(status_code=404, detail="Suscripción no encontrada o ya procesada")
    
    subscription.fecha_pago_notificado = datetime.utcnow()
    db.commit()
    
    return {
        "message": "Pago notificado. Espera la verificación del administrador.",
        "status": "pending_review"
    }


@router.get("/admin/pending-payments", response_model=List[PendingPaymentItem])
def get_pending_payments(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> List[UserSubscription]:
    """Obtener pagos pendientes de revisión"""
    subscriptions = (
        db.query(UserSubscription)
        .filter(
            UserSubscription.estado == "pending",
            UserSubscription.fecha_pago_notificado.isnot(None)
        )
        .order_by(UserSubscription.fecha_pago_notificado.desc())
        .all()
    )
    
    # Filtrar también para excluir usuarios que ya tienen una suscripción activa
    # (aunque técnicamente no deberían tener pendientes si tienen activas)
    now = datetime.utcnow()
    filtered_subscriptions = []
    for sub in subscriptions:
        # Verificar si el usuario tiene una suscripción activa
        active_sub = (
            db.query(UserSubscription)
            .filter(
                UserSubscription.user_id == sub.user_id,
                UserSubscription.estado == "active",
                or_(
                    UserSubscription.fecha_fin.is_(None),
                    UserSubscription.fecha_fin > now,
                ),
                UserSubscription.id != sub.id
            )
            .first()
        )
        # Solo incluir si el usuario NO tiene una suscripción activa
        if not active_sub:
            filtered_subscriptions.append(sub)
    
    subscriptions = filtered_subscriptions
    
    result = []
    for sub in subscriptions:
        user = db.query(User).filter(User.id == sub.user_id).first()
        plan = sub.plan
        result.append(PendingPaymentItem(
            subscription_id=sub.id,
            user_email=user.email if user else "Usuario desconocido",
            plan_nombre=plan.nombre if plan else "Plan desconocido",
            plan_precio=plan.precio if plan else 0.0,
            referencia_pago=sub.referencia_pago or "",
            fecha_pago_notificado=sub.fecha_pago_notificado,
            fecha_creacion=sub.creado_en
        ))
    
    return result


@router.post("/admin/approve-payment", response_model=SubscriptionSummary)
def approve_payment(
    payload: PaymentReviewRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user),
) -> SubscriptionSummary:
    """Aprobar pago y activar suscripción"""
    subscription = (
        db.query(UserSubscription)
        .filter(UserSubscription.id == payload.subscription_id)
        .first()
    )
    
    if not subscription:
        raise HTTPException(status_code=404, detail="Suscripción no encontrada")
    
    if subscription.estado != "pending":
        raise HTTPException(status_code=400, detail="La suscripción ya fue procesada")
    
    plan = subscription.plan
    if not plan:
        raise HTTPException(status_code=400, detail="La suscripción no tiene plan asociado")
    
    now = datetime.utcnow()
    subscription.estado = "active"
    subscription.fecha_inicio = subscription.fecha_inicio or now
    subscription.fecha_fin = calculate_end_date(subscription.fecha_inicio, plan)
    subscription.revisado_por = admin_user.id
    subscription.fecha_revision = now
    subscription.motivo_rechazo = None
    
    # Cancelar TODAS las otras suscripciones pendientes del mismo usuario para evitar confusión
    # Esto incluye las que son más antiguas Y las que son más nuevas (para evitar duplicados)
    other_pending = (
        db.query(UserSubscription)
        .filter(
            UserSubscription.user_id == subscription.user_id,
            UserSubscription.id != subscription.id,
            UserSubscription.estado == "pending"
        )
        .all()
    )
    
    for other_sub in other_pending:
        other_sub.estado = "cancelled"
        other_sub.motivo_cancelacion = "Reemplazada por nueva suscripción aprobada"
        other_sub.fecha_cancelacion = now
        other_sub.cancelado_por = admin_user.id
    
    db.commit()
    db.refresh(subscription)
    
    dias_restantes = None
    if subscription.fecha_fin:
        dias_restantes = max((subscription.fecha_fin - now).days, 0)
    
    return SubscriptionSummary(
        subscription_id=subscription.id,
        estado=subscription.estado,
        fecha_inicio=subscription.fecha_inicio,
        fecha_fin=subscription.fecha_fin,
        renovacion_automatica=subscription.renovacion_automatica,
        referencia_pago=subscription.referencia_pago,
        plan=plan,
        dias_restantes=dias_restantes,
    )


@router.post("/admin/reject-payment")
def reject_payment(
    payload: PaymentReviewRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user),
) -> dict:
    """Rechazar pago"""
    if not payload.motivo_rechazo:
        raise HTTPException(status_code=400, detail="Debe proporcionar un motivo de rechazo")
    
    subscription = (
        db.query(UserSubscription)
        .filter(UserSubscription.id == payload.subscription_id)
        .first()
    )
    
    if not subscription:
        raise HTTPException(status_code=404, detail="Suscripción no encontrada")
    
    if subscription.estado != "pending":
        raise HTTPException(status_code=400, detail="La suscripción ya fue procesada")
    
    subscription.estado = "rejected"
    subscription.motivo_rechazo = payload.motivo_rechazo
    subscription.revisado_por = admin_user.id
    subscription.fecha_revision = datetime.utcnow()
    
    db.commit()
    
    return {
        "message": "Pago rechazado",
        "subscription_id": subscription.id,
        "motivo": payload.motivo_rechazo
    }


class ActiveSubscriptionItem(BaseModel):
    subscription_id: int
    user_email: str
    user_id: int
    plan_nombre: str
    plan_precio: float
    fecha_inicio: datetime
    fecha_fin: Optional[datetime]
    dias_restantes: Optional[int]
    referencia_pago: str
    renovacion_automatica: bool

    class Config:
        from_attributes = True


class CancelSubscriptionRequest(BaseModel):
    subscription_id: int
    motivo_cancelacion: str


@router.get("/admin/active-subscriptions", response_model=List[ActiveSubscriptionItem])
def get_active_subscriptions(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> List[ActiveSubscriptionItem]:
    """Obtener todas las suscripciones activas"""
    now = datetime.utcnow()
    
    # Primero, marcar como expiradas las suscripciones activas que ya vencieron
    expired_subscriptions = (
        db.query(UserSubscription)
        .filter(
            UserSubscription.estado == "active",
            UserSubscription.fecha_fin.isnot(None),
            UserSubscription.fecha_fin <= now
        )
        .all()
    )
    
    for expired_sub in expired_subscriptions:
        expired_sub.estado = "expired"
    
    if expired_subscriptions:
        db.commit()
    
    # Ahora obtener las suscripciones realmente activas
    subscriptions = (
        db.query(UserSubscription)
        .filter(
            UserSubscription.estado == "active",
            or_(
                UserSubscription.fecha_fin.is_(None),
                UserSubscription.fecha_fin > now,
            ),
        )
        .order_by(UserSubscription.fecha_inicio.desc())
        .all()
    )
    
    result = []
    for sub in subscriptions:
        user = db.query(User).filter(User.id == sub.user_id).first()
        plan = sub.plan
        
        dias_restantes = None
        if sub.fecha_fin:
            dias_restantes = max((sub.fecha_fin - now).days, 0)
        
        result.append(ActiveSubscriptionItem(
            subscription_id=sub.id,
            user_email=user.email if user else "Usuario desconocido",
            user_id=sub.user_id,
            plan_nombre=plan.nombre if plan else "Plan desconocido",
            plan_precio=plan.precio if plan else 0.0,
            fecha_inicio=sub.fecha_inicio,
            fecha_fin=sub.fecha_fin,
            dias_restantes=dias_restantes,
            referencia_pago=sub.referencia_pago or "",
            renovacion_automatica=sub.renovacion_automatica
        ))
    
    return result


@router.post("/admin/cancel-subscription")
def cancel_subscription(
    payload: CancelSubscriptionRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user),
) -> dict:
    """Cancelar suscripción activa"""
    if not payload.motivo_cancelacion:
        raise HTTPException(status_code=400, detail="Debe proporcionar un motivo de cancelación")
    
    subscription = (
        db.query(UserSubscription)
        .filter(UserSubscription.id == payload.subscription_id)
        .first()
    )
    
    if not subscription:
        raise HTTPException(status_code=404, detail="Suscripción no encontrada")
    
    if subscription.estado != "active":
        raise HTTPException(status_code=400, detail="Solo se pueden cancelar suscripciones activas")
    
    subscription.estado = "cancelled"
    subscription.motivo_cancelacion = payload.motivo_cancelacion
    subscription.fecha_cancelacion = datetime.utcnow()
    subscription.cancelado_por = admin_user.id
    
    db.commit()
    
    return {
        "message": "Suscripción cancelada",
        "subscription_id": subscription.id,
        "motivo": payload.motivo_cancelacion
    }

