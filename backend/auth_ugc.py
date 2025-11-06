"""
Sistema de autenticación JWT simple para UGC
"""

import jwt
import os
from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException, status, Depends, Header
from sqlalchemy.orm import Session
from models_ugc_enhanced import User, RoleEnum
from database import get_db
import logging

logger = logging.getLogger(__name__)

# Configuración JWT
SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'tu_clave_secreta_muy_segura_cambiar_en_produccion_2024')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24  # Token válido por 24 horas

class AuthUGC:
    """Sistema de autenticación para UGC"""
    
    @staticmethod
    def create_access_token(user_id: int, email: str, role: str) -> str:
        """Crear token JWT"""
        expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
        to_encode = {
            "sub": str(user_id),
            "email": email,
            "role": role,
            "exp": expire
        }
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str) -> dict:
        """Verificar y decodificar token JWT"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expirado",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except jwt.JWTError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Token inválido: {str(e)}",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    @staticmethod
    def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> User:
        """Obtener usuario actual desde token"""
        if not authorization:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token de autorización requerido",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Extraer token (formato: "Bearer <token>")
        try:
            scheme, token = authorization.split()
            if scheme.lower() != "bearer":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Esquema de autorización inválido"
                )
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Formato de autorización inválido"
            )
        
        # Verificar token
        payload = AuthUGC.verify_token(token)
        user_id = payload.get("sub")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )
        
        # Obtener usuario
        user = db.query(User).filter(User.id == int(user_id), User.activo == True).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario no encontrado o inactivo"
            )
        
        return user
    
    @staticmethod
    def require_admin(current_user: User = Depends(get_current_user)) -> User:
        """Middleware para requerir rol de admin"""
        if not current_user.is_admin():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acceso denegado: se requiere rol de administrador"
            )
        return current_user
    
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        """Autenticar usuario con email y password"""
        user = db.query(User).filter(User.email == email).first()
        
        if not user or not user.activo:
            return None
        
        if not user.check_password(password):
            return None
        
        return user

# Funciones de conveniencia
def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> User:
    """Obtener usuario actual"""
    return AuthUGC.get_current_user(authorization, db)

def get_current_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """Obtener usuario actual y verificar que sea admin"""
    return AuthUGC.require_admin(current_user)

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Requerir rol de admin"""
    return AuthUGC.require_admin(current_user)

