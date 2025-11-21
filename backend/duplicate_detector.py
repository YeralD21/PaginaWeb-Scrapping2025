"""
Sistema avanzado de detección de duplicados para noticias
"""

import hashlib
import re
from typing import List, Dict, Tuple, Optional
from difflib import SequenceMatcher
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models import Noticia, Diario
import logging

logger = logging.getLogger(__name__)

class DuplicateDetector:
    """Detector avanzado de noticias duplicadas"""
    
    def __init__(self, similarity_threshold: float = 0.85, time_window_hours: int = 24):
        """
        Args:
            similarity_threshold: Umbral de similitud (0.0 a 1.0)
            time_window_hours: Ventana de tiempo para buscar duplicados
        """
        self.similarity_threshold = similarity_threshold
        self.time_window_hours = time_window_hours
        
        # Palabras comunes a ignorar en español
        self.stop_words = {
            'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 
            'da', 'su', 'por', 'son', 'con', 'para', 'al', 'una', 'del', 'las', 'los', 'como', 
            'pero', 'más', 'sin', 'sobre', 'tras', 'hasta', 'desde', 'ante', 'bajo', 'entre', 
            'hacia', 'según', 'durante', 'muy', 'todo', 'todos', 'esta', 'este', 'estas', 'estos',
            'ser', 'estar', 'tener', 'hacer', 'poder', 'decir', 'ir', 'ver', 'dar', 'saber'
        }
    
    def normalize_text(self, text: str) -> str:
        """Normalizar texto para comparación"""
        if not text:
            return ""
        
        # Convertir a minúsculas
        text = text.lower()
        
        # Remover caracteres especiales pero mantener espacios
        text = re.sub(r'[^\w\s]', '', text)
        
        # Remover espacios múltiples
        text = re.sub(r'\s+', ' ', text)
        
        # Remover palabras comunes
        words = text.split()
        filtered_words = [word for word in words if word not in self.stop_words and len(word) > 2]
        
        return ' '.join(filtered_words).strip()
    
    def calculate_similarity(self, text1: str, text2: str) -> float:
        """Calcular similitud entre dos textos usando SequenceMatcher"""
        if not text1 or not text2:
            return 0.0
        
        # Normalizar ambos textos
        norm_text1 = self.normalize_text(text1)
        norm_text2 = self.normalize_text(text2)
        
        if not norm_text1 or not norm_text2:
            return 0.0
        
        # Calcular similitud
        return SequenceMatcher(None, norm_text1, norm_text2).ratio()
    
    def generate_content_hash(self, titulo: str, contenido: str = None) -> str:
        """Generar hash único basado en el contenido"""
        # Normalizar título
        titulo_norm = self.normalize_text(titulo)
        
        # Si hay contenido, incluirlo en el hash
        if contenido:
            contenido_norm = self.normalize_text(contenido)
            # Tomar solo las primeras 200 palabras del contenido para el hash
            contenido_words = contenido_norm.split()[:200]
            contenido_norm = ' '.join(contenido_words)
            combined_text = f"{titulo_norm} {contenido_norm}"
        else:
            combined_text = titulo_norm
        
        return hashlib.md5(combined_text.encode('utf-8')).hexdigest()
    
    def generate_similarity_hash(self, titulo: str) -> str:
        """Generar hash basado en palabras clave para detección de similitud"""
        words = self.normalize_text(titulo).split()
        
        # Tomar las palabras más significativas (las más largas)
        significant_words = sorted([w for w in words if len(w) >= 4], key=len, reverse=True)[:5]
        
        # Ordenar alfabéticamente para consistencia
        similarity_text = ' '.join(sorted(significant_words))
        
        return hashlib.md5(similarity_text.encode('utf-8')).hexdigest()
    
    def extract_keywords(self, text: str, max_keywords: int = 10) -> List[str]:
        """Extraer palabras clave del texto"""
        words = self.normalize_text(text).split()
        
        # Filtrar palabras por longitud y frecuencia
        word_freq = {}
        for word in words:
            if len(word) >= 4:
                word_freq[word] = word_freq.get(word, 0) + 1
        
        # Ordenar por frecuencia y longitud
        sorted_words = sorted(word_freq.items(), key=lambda x: (x[1], len(x[0])), reverse=True)
        
        return [word[0] for word in sorted_words[:max_keywords]]
    
    def is_duplicate_by_hash(self, db: Session, titulo_hash: str, contenido_hash: str = None, 
                           diario_id: int = None) -> Optional[Noticia]:
        """Verificar duplicados exactos por hash"""
        query = db.query(Noticia).filter(Noticia.titulo_hash == titulo_hash)
        
        if diario_id:
            query = query.filter(Noticia.diario_id == diario_id)
        
        # Verificar en ventana de tiempo
        time_limit = datetime.utcnow() - timedelta(hours=self.time_window_hours)
        query = query.filter(Noticia.fecha_extraccion >= time_limit)
        
        existing = query.first()
        if existing:
            logger.info(f"Duplicado exacto encontrado por hash: {existing.titulo}")
            return existing
        
        # Si no hay duplicado exacto pero hay contenido, verificar por contenido
        if contenido_hash:
            existing_content = db.query(Noticia).filter(
                Noticia.contenido_hash == contenido_hash,
                Noticia.fecha_extraccion >= time_limit
            ).first()
            
            if existing_content:
                logger.info(f"Duplicado por contenido encontrado: {existing_content.titulo}")
                return existing_content
        
        return None
    
    def is_duplicate_by_similarity(self, db: Session, titulo: str, similarity_hash: str, 
                                 diario_id: int = None) -> Optional[Tuple[Noticia, float]]:
        """Verificar duplicados por similitud"""
        # Primero buscar por similarity_hash
        query = db.query(Noticia).filter(Noticia.similarity_hash == similarity_hash)
        
        if diario_id:
            query = query.filter(Noticia.diario_id == diario_id)
        
        # Buscar en ventana de tiempo
        time_limit = datetime.utcnow() - timedelta(hours=self.time_window_hours)
        query = query.filter(Noticia.fecha_extraccion >= time_limit)
        
        similar_candidates = query.all()
        
        # Si encontramos candidatos por similarity_hash, verificar similitud exacta
        for candidate in similar_candidates:
            similarity = self.calculate_similarity(titulo, candidate.titulo)
            if similarity >= self.similarity_threshold:
                logger.info(f"Duplicado por similitud encontrado: {candidate.titulo} (similitud: {similarity:.2f})")
                return candidate, similarity
        
        # Si no hay candidatos por hash, hacer búsqueda más amplia
        # Solo para títulos muy similares (más costoso computacionalmente)
        recent_news = db.query(Noticia).filter(
            Noticia.fecha_extraccion >= time_limit
        ).limit(100).all()  # Limitar para rendimiento
        
        for news in recent_news:
            # Skip if same diario (más probable que sea duplicado)
            if diario_id and news.diario_id != diario_id:
                continue
                
            similarity = self.calculate_similarity(titulo, news.titulo)
            if similarity >= self.similarity_threshold:
                logger.info(f"Duplicado por similitud amplia encontrado: {news.titulo} (similitud: {similarity:.2f})")
                return news, similarity
        
        return None
    
    def check_duplicate(self, db: Session, titulo: str, contenido: str = None, 
                       enlace: str = None, diario_id: int = None) -> Dict:
        """
        Verificar si una noticia es duplicada
        
        Returns:
            Dict con información sobre duplicados encontrados
        """
        result = {
            'is_duplicate': False,
            'duplicate_type': None,
            'existing_news': None,
            'similarity_score': 0.0,
            'reason': None
        }
        
        try:
            # Generar hashes
            titulo_hash = hashlib.md5(self.normalize_text(titulo).encode('utf-8')).hexdigest()
            contenido_hash = None
            if contenido:
                contenido_hash = hashlib.md5(self.normalize_text(contenido).encode('utf-8')).hexdigest()
            
            similarity_hash = self.generate_similarity_hash(titulo)
            
            # 1. Verificar duplicado exacto por enlace (más rápido y confiable)
            # IMPORTANTE: Verificar por URL sin restricción de tiempo para evitar duplicados
            # incluso si la noticia fue scrapeada hace mucho tiempo
            if enlace:
                # Primero verificar sin restricción de tiempo (URL única = noticia única)
                existing_by_link = db.query(Noticia).filter(
                    Noticia.enlace == enlace
                ).first()
                
                if existing_by_link:
                    result.update({
                        'is_duplicate': True,
                        'duplicate_type': 'exact_link',
                        'existing_news': existing_by_link,
                        'similarity_score': 1.0,
                        'reason': f'Mismo enlace encontrado (categoría existente: {existing_by_link.categoria})'
                    })
                    return result
                
                # También verificar variaciones de la URL (con/sin trailing slash)
                # Solo si la URL original termina en /, buscar también la versión sin /
                enlace_normalizado = enlace.rstrip('/')
                if enlace_normalizado != enlace and enlace_normalizado:
                    # Buscar la versión sin trailing slash
                    existing_by_link_normalized = db.query(Noticia).filter(
                        Noticia.enlace == enlace_normalizado
                    ).first()
                    
                    if existing_by_link_normalized:
                        result.update({
                            'is_duplicate': True,
                            'duplicate_type': 'exact_link_normalized',
                            'existing_news': existing_by_link_normalized,
                            'similarity_score': 1.0,
                            'reason': f'Enlace similar encontrado (categoría existente: {existing_by_link_normalized.categoria})'
                        })
                        return result
                
                # También verificar si existe la versión con trailing slash
                enlace_con_slash = enlace if enlace.endswith('/') else enlace + '/'
                existing_by_link_with_slash = db.query(Noticia).filter(
                    Noticia.enlace == enlace_con_slash
                ).first()
                
                if existing_by_link_with_slash:
                    result.update({
                        'is_duplicate': True,
                        'duplicate_type': 'exact_link_normalized',
                        'existing_news': existing_by_link_with_slash,
                        'similarity_score': 1.0,
                        'reason': f'Enlace similar encontrado (categoría existente: {existing_by_link_with_slash.categoria})'
                    })
                    return result
            
            # 2. Verificar duplicado por hash
            existing_by_hash = self.is_duplicate_by_hash(db, titulo_hash, contenido_hash, diario_id)
            if existing_by_hash:
                result.update({
                    'is_duplicate': True,
                    'duplicate_type': 'exact_hash',
                    'existing_news': existing_by_hash,
                    'similarity_score': 1.0,
                    'reason': 'Hash idéntico encontrado'
                })
                return result
            
            # 3. Verificar duplicado por similitud
            similar_result = self.is_duplicate_by_similarity(db, titulo, similarity_hash, diario_id)
            if similar_result:
                existing_news, similarity_score = similar_result
                result.update({
                    'is_duplicate': True,
                    'duplicate_type': 'similarity',
                    'existing_news': existing_news,
                    'similarity_score': similarity_score,
                    'reason': f'Similitud alta detectada ({similarity_score:.2f})'
                })
                return result
            
            # No es duplicado
            result['reason'] = 'No se encontraron duplicados'
            return result
            
        except Exception as e:
            logger.error(f"Error en detección de duplicados: {e}")
            result['reason'] = f'Error en verificación: {str(e)}'
            return result
    
    def prepare_news_for_save(self, news_data: Dict) -> Dict:
        """Preparar datos de noticia con hashes para guardar"""
        titulo = news_data.get('titulo', '')
        contenido = news_data.get('contenido', '')
        
        # Generar hashes
        titulo_normalizado = self.normalize_text(titulo)
        news_data['titulo_hash'] = hashlib.md5(titulo_normalizado.encode('utf-8')).hexdigest()
        
        if contenido:
            contenido_normalizado = self.normalize_text(contenido)
            news_data['contenido_hash'] = hashlib.md5(contenido_normalizado.encode('utf-8')).hexdigest()
        
        news_data['similarity_hash'] = self.generate_similarity_hash(titulo)
        
        # Extraer palabras clave
        news_data['palabras_clave'] = self.extract_keywords(titulo)
        
        # Calcular tiempo de lectura estimado
        if contenido:
            word_count = len(contenido.split())
            news_data['tiempo_lectura_min'] = max(1, word_count // 200)  # ~200 palabras por minuto
        else:
            news_data['tiempo_lectura_min'] = 1
        
        return news_data
    
    def get_duplicate_stats(self, db: Session, days: int = 7) -> Dict:
        """Obtener estadísticas de duplicados"""
        time_limit = datetime.utcnow() - timedelta(days=days)
        
        # Contar noticias por hash duplicado
        duplicate_hashes = db.query(Noticia.titulo_hash).filter(
            Noticia.fecha_extraccion >= time_limit
        ).all()
        
        hash_counts = {}
        for hash_tuple in duplicate_hashes:
            hash_val = hash_tuple[0]
            hash_counts[hash_val] = hash_counts.get(hash_val, 0) + 1
        
        duplicates_count = sum(count - 1 for count in hash_counts.values() if count > 1)
        total_news = len(duplicate_hashes)
        
        return {
            'total_news': total_news,
            'duplicates_detected': duplicates_count,
            'duplicate_rate': duplicates_count / total_news if total_news > 0 else 0,
            'unique_news': total_news - duplicates_count,
            'period_days': days
        }
