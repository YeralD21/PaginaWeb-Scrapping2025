#!/usr/bin/env python3
"""
Módulo de Análisis de Sentimientos
Analiza el sentimiento de noticias usando diccionarios de palabras clave
"""

import re
import logging
from typing import Dict, List, Tuple
from collections import Counter

logger = logging.getLogger(__name__)

class SentimentAnalyzer:
    """
    Analizador de sentimientos basado en diccionarios de palabras clave
    Detecta: positivo, negativo, neutro, alegre, triste, enojado
    """
    
    def __init__(self):
        """Inicializar diccionarios de palabras clave"""
        # Palabras positivas
        self.positive_words = {
            'éxito', 'triunfo', 'victoria', 'ganar', 'ganó', 'ganaron', 'logro', 'logró',
            'mejora', 'mejoró', 'mejorar', 'crecimiento', 'creció', 'aumento', 'aumentó',
            'prosperidad', 'felicidad', 'alegría', 'celebración', 'celebrar', 'festejar',
            'optimismo', 'optimista', 'esperanza', 'esperanzador', 'prometedor',
            'excelente', 'genial', 'maravilloso', 'fantástico', 'increíble', 'asombroso',
            'bueno', 'buena', 'buenos', 'buenas', 'mejor', 'mejorar', 'superior',
            'avance', 'progreso', 'desarrollo', 'innovación', 'innovador',
            'premio', 'reconocimiento', 'honor', 'distinción', 'galardón',
            'apoyo', 'apoyar', 'respaldar', 'respaldó', 'respaldaron',
            'recuperación', 'recuperó', 'recuperar', 'sanación', 'sanó',
            'bienestar', 'salud', 'saludable', 'fuerte', 'fortaleza',
            'unión', 'unidos', 'solidaridad', 'solidario', 'colaboración',
            'satisfacción', 'satisfecho', 'contento', 'feliz', 'alegre',
            'orgullo', 'orgulloso', 'orgullosa', 'destacado', 'destacada',
            'record', 'récord', 'histórico', 'histórica', 'sin precedentes',
            'aprobación', 'aprobó', 'aprobado', 'aceptación', 'aceptó',
            'inversión', 'invertir', 'inversión', 'confianza', 'confiar',
            'empleo', 'trabajo', 'oportunidad', 'oportunidades', 'nuevo empleo',
            'educación', 'educativo', 'aprendizaje', 'capacitación',
            'seguridad', 'seguro', 'protección', 'protegido',
            'libertad', 'libre', 'independencia', 'independiente',
            'paz', 'pacífico', 'armonía', 'tranquilidad', 'calma',
            'amor', 'querer', 'querido', 'amado', 'cariño',
            'gratitud', 'agradecido', 'agradecer', 'gracias',
            'éxito', 'exitoso', 'triunfante', 'ganador', 'vencedor'
        }
        
        # Palabras negativas
        self.negative_words = {
            'fracaso', 'falló', 'fallar', 'perder', 'perdió', 'perdieron', 'derrota',
            'crisis', 'crisis económica', 'recesión', 'depresión', 'colapso',
            'problema', 'problemas', 'dificultad', 'dificultades', 'obstáculo',
            'error', 'errores', 'equivocación', 'equivocado', 'mal',
            'mala', 'malo', 'malos', 'malas', 'peor', 'empeorar', 'empeoró',
            'pérdida', 'perder', 'perdido', 'desapareció', 'desaparición',
            'muerte', 'muerto', 'muertos', 'falleció', 'fallecimiento', 'fallecidos',
            'accidente', 'accidentes', 'choque', 'colisión', 'siniestro',
            'violencia', 'violento', 'agresión', 'agredir', 'atacar', 'ataque',
            'delito', 'delitos', 'crimen', 'criminal', 'robo', 'robó', 'robaron',
            'corrupción', 'corrupto', 'corrupta', 'fraude', 'fraudulento',
            'escándalo', 'escándalos', 'polémica', 'polémico', 'controversia',
            'conflicto', 'conflictos', 'guerra', 'guerras', 'batalla',
            'desastre', 'desastres', 'catástrofe', 'tragedia', 'tragedias',
            'enfermedad', 'enfermo', 'enfermos', 'enfermedades', 'pandemia',
            'contagio', 'contagios', 'contagiado', 'contagiados', 'infectado',
            'pobreza', 'pobre', 'pobres', 'miseria', 'necesidad', 'necesitado',
            'desempleo', 'desempleado', 'desempleados', 'paro', 'despedido',
            'huelga', 'huelgas', 'protesta', 'protestas', 'manifestación',
            'inseguridad', 'inseguro', 'peligro', 'peligroso', 'riesgo', 'riesgos',
            'miedo', 'temor', 'terror', 'terrorismo', 'terrorista',
            'tristeza', 'triste', 'depresión', 'deprimido', 'desánimo',
            'preocupación', 'preocupado', 'preocupante', 'alarma', 'alarmante',
            'rechazo', 'rechazó', 'rechazaron', 'negación', 'negó',
            'reducción', 'redujo', 'recorte', 'recortes', 'recortar',
            'cierre', 'cerró', 'cerrar', 'clausura', 'clausuró',
            'quiebra', 'quebró', 'quebrar', 'bancarrota', 'insolvencia',
            'deuda', 'deudas', 'endeudado', 'endeudamiento',
            'inflación', 'inflacionario', 'aumento de precios',
            'contaminación', 'contaminado', 'contaminar', 'polución',
            'sequía', 'inundación', 'inundaciones', 'terremoto', 'sismo',
            'incendio', 'incendios', 'fuego', 'quemar', 'quemó'
        }
        
        # Palabras alegres
        self.happy_words = {
            'feliz', 'felices', 'felicidad', 'alegre', 'alegría', 'contento', 'contenta',
            'celebrar', 'celebración', 'festejar', 'fiesta', 'fiestas', 'festival',
            'risa', 'reír', 'sonrisa', 'sonreír', 'divertido', 'diversión',
            'éxito', 'triunfo', 'victoria', 'ganar', 'ganó', 'premio', 'galardón',
            'orgullo', 'orgulloso', 'orgullosa', 'satisfacción', 'satisfecho',
            'amor', 'querer', 'querido', 'amado', 'cariño', 'afecto',
            'esperanza', 'esperanzador', 'optimismo', 'optimista', 'prometedor',
            'bienestar', 'bien', 'bueno', 'excelente', 'genial', 'maravilloso',
            'gratitud', 'agradecido', 'agradecer', 'gracias', 'agradecimiento',
            'unión', 'unidos', 'solidaridad', 'solidario', 'amistad', 'amigo',
            'cumpleaños', 'aniversario', 'boda', 'matrimonio', 'nacimiento',
            'graduación', 'diploma', 'título', 'logro', 'conquista',
            'vacaciones', 'viaje', 'turismo', 'descanso', 'relajación',
            'música', 'baile', 'danza', 'arte', 'cultura', 'espectáculo',
            'deporte', 'deportivo', 'competencia', 'competir', 'campeón',
            'nuevo', 'nueva', 'nuevos', 'nuevas', 'renovado', 'renovación',
            'mejora', 'mejoró', 'progreso', 'avance', 'desarrollo',
            'oportunidad', 'oportunidades', 'chance', 'posibilidad'
        }
        
        # Palabras tristes
        self.sad_words = {
            'triste', 'tristeza', 'tristes', 'deprimido', 'depresión', 'desánimo',
            'llorar', 'llanto', 'lloró', 'llorando', 'lágrimas', 'lágrima',
            'dolor', 'dolores', 'doloroso', 'sufrimiento', 'sufrir', 'sufrió',
            'pérdida', 'perder', 'perdido', 'perdió', 'desapareció', 'desaparición',
            'muerte', 'muerto', 'muertos', 'falleció', 'fallecimiento', 'fallecidos',
            'despedida', 'adiós', 'separación', 'separar', 'separó',
            'soledad', 'solo', 'sola', 'solos', 'solas', 'aislamiento',
            'abandono', 'abandonado', 'abandonar', 'abandonó',
            'desesperación', 'desesperado', 'desesperanza', 'sin esperanza',
            'melancolía', 'nostalgia', 'nostálgico', 'nostálgica',
            'luto', 'duelo', 'velorio', 'funeral', 'entierro',
            'enfermedad', 'enfermo', 'enfermos', 'enfermedades', 'grave',
            'hospital', 'hospitalizado', 'hospitalización', 'operación',
            'pobreza', 'pobre', 'pobres', 'miseria', 'necesidad',
            'hambre', 'hambriento', 'hambrientos', 'desnutrición',
            'desempleo', 'desempleado', 'desempleados', 'sin trabajo',
            'fracaso', 'falló', 'fallar', 'fracasado', 'fracasada',
            'rechazo', 'rechazó', 'rechazaron', 'rechazado', 'rechazada',
            'desilusión', 'desilusionado', 'decepción', 'decepcionado',
            'desgracia', 'desgraciado', 'infortunio', 'mala suerte',
            'ruina', 'arruinado', 'destrucción', 'destruido', 'destruida',
            'catástrofe', 'tragedia', 'tragedias', 'desastre', 'desastres',
            'crisis', 'crisis económica', 'recesión', 'colapso',
            'quiebra', 'quebró', 'quebrar', 'bancarrota', 'pérdida económica'
        }
        
        # Palabras de enojo
        self.angry_words = {
            'enojo', 'enojado', 'enojada', 'enojados', 'enojadas', 'ira', 'irritado',
            'furioso', 'furiosa', 'furiosos', 'furiosas', 'furia', 'rabia', 'rabioso',
            'indignación', 'indignado', 'indignada', 'indignados', 'indignadas',
            'molesto', 'molesta', 'molestos', 'molestas', 'molestar', 'molestó',
            'irritación', 'irritar', 'irritó', 'irritante', 'exasperado',
            'violencia', 'violento', 'violenta', 'violentos', 'violentas',
            'agresión', 'agredir', 'agredió', 'agredieron', 'agresivo', 'agresiva',
            'atacar', 'ataque', 'atacó', 'atacaron', 'atacante', 'atacantes',
            'golpear', 'golpeó', 'golpearon', 'golpe', 'golpes', 'pegar', 'pegó',
            'amenaza', 'amenazar', 'amenazó', 'amenazaron', 'amenazante',
            'protesta', 'protestas', 'protestar', 'protestó', 'protestaron',
            'manifestación', 'manifestaciones', 'manifestar', 'manifestó',
            'huelga', 'huelgas', 'huelguista', 'huelguistas', 'paro',
            'conflicto', 'conflictos', 'confrontación', 'confrontar', 'confrontó',
            'disputa', 'disputas', 'disputar', 'disputó', 'pelea', 'peleas',
            'discusión', 'discusiones', 'discutir', 'discutió', 'discutieron',
            'rechazo', 'rechazar', 'rechazó', 'rechazaron', 'rechazado',
            'oposición', 'oponer', 'opuso', 'opositor', 'opositores',
            'crítica', 'criticar', 'criticó', 'criticaron', 'crítico', 'crítica',
            'denuncia', 'denunciar', 'denunció', 'denunciaron', 'denunciante',
            'escándalo', 'escándalos', 'polémica', 'polémico', 'polémica',
            'corrupción', 'corrupto', 'corrupta', 'fraude', 'fraudulento',
            'abuso', 'abusar', 'abusó', 'abusaron', 'abusivo', 'abusiva',
            'injusticia', 'injusto', 'injusta', 'injustos', 'injustas',
            'discriminación', 'discriminar', 'discriminó', 'discriminaron',
            'odio', 'odiar', 'odiaba', 'odiado', 'odiada', 'odioso', 'odiosa',
            'rencor', 'rencoroso', 'rencorosa', 'venganza', 'vengativo',
            'destrucción', 'destruir', 'destruyó', 'destruyeron', 'destructivo',
            'sabotaje', 'sabotear', 'saboteó', 'sabotearon', 'saboteador',
            'rebelión', 'rebelde', 'rebeldes', 'rebelar', 'rebeló',
            'revolución', 'revolucionario', 'revolucionaria', 'revolucionarios',
            'guerra', 'guerras', 'batalla', 'batallas', 'combate', 'combates',
            'terrorismo', 'terrorista', 'terroristas', 'atentado', 'atentados',
            'delito', 'delitos', 'crimen', 'criminal', 'criminales', 'robo',
            'asesinato', 'asesinatos', 'asesinar', 'asesinó', 'asesinaron',
            'secuestro', 'secuestros', 'secuestrar', 'secuestró', 'secuestraron'
        }
        
        # Palabras neutras (para contexto)
        self.neutral_words = {
            'información', 'informar', 'informó', 'noticia', 'noticias', 'reporte',
            'reportar', 'reportó', 'anuncio', 'anunciar', 'anunció', 'comunicado',
            'declaración', 'declarar', 'declaró', 'afirmación', 'afirmar', 'afirmó',
            'dato', 'datos', 'estadística', 'estadísticas', 'cifra', 'cifras',
            'análisis', 'analizar', 'analizó', 'estudio', 'estudiar', 'estudió',
            'investigación', 'investigar', 'investigó', 'investigador',
            'reunión', 'reuniones', 'encuentro', 'encuentros', 'sesión',
            'decisión', 'decidir', 'decidió', 'acuerdo', 'acordar', 'acordó',
            'propuesta', 'proponer', 'propuso', 'sugerencia', 'sugerir', 'sugirió',
            'plan', 'planes', 'planificar', 'planificó', 'estrategia', 'estrategias',
            'proyecto', 'proyectos', 'programa', 'programas', 'iniciativa',
            'reunión', 'reunir', 'reunió', 'asamblea', 'asambleas', 'conferencia',
            'evento', 'eventos', 'actividad', 'actividades', 'acción', 'acciones',
            'proceso', 'procesos', 'procedimiento', 'procedimientos', 'método',
            'sistema', 'sistemas', 'mecanismo', 'mecanismos', 'estructura',
            'cambio', 'cambios', 'cambiar', 'cambió', 'modificación', 'modificar',
            'actualización', 'actualizar', 'actualizó', 'mejora', 'mejorar',
            'desarrollo', 'desarrollar', 'desarrolló', 'implementación', 'implementar',
            'resultado', 'resultados', 'consecuencia', 'consecuencias', 'efecto',
            'impacto', 'impactos', 'influencia', 'influir', 'influenció'
        }
    
    def normalize_text(self, text: str) -> str:
        """Normalizar texto para análisis"""
        if not text:
            return ""
        
        # Convertir a minúsculas
        text = text.lower()
        
        # Remover caracteres especiales pero mantener acentos
        text = re.sub(r'[^\w\sáéíóúñü]', ' ', text)
        
        # Remover espacios múltiples
        text = re.sub(r'\s+', ' ', text)
        
        return text.strip()
    
    def count_words_in_text(self, text: str, word_set: set) -> int:
        """Contar palabras de un conjunto en el texto"""
        normalized = self.normalize_text(text)
        words = normalized.split()
        
        count = 0
        for word in words:
            # Buscar palabra exacta
            if word in word_set:
                count += 1
            # Buscar palabra como parte de otras palabras (para casos como "felicidad" en "infelicidad")
            else:
                for keyword in word_set:
                    if keyword in word:
                        count += 0.5  # Peso menor para coincidencias parciales
                        break
        
        return count
    
    def analyze_sentiment(self, titulo: str, contenido: str = "") -> Dict[str, any]:
        """
        Analizar sentimiento de una noticia
        
        Returns:
            Dict con:
            - sentimiento: 'positivo', 'negativo', 'neutro', 'alegre', 'triste', 'enojado'
            - confidence: nivel de confianza (0-1)
            - scores: puntuaciones por cada emoción
            - detected_words: palabras detectadas por categoría
        """
        if not titulo and not contenido:
            return {
                'sentimiento': 'neutro',
                'confidence': 0.0,
                'scores': {},
                'detected_words': {}
            }
        
        # Combinar título y contenido
        full_text = f"{titulo} {contenido}".strip()
        
        # Contar palabras por categoría
        positive_count = self.count_words_in_text(full_text, self.positive_words)
        negative_count = self.count_words_in_text(full_text, self.negative_words)
        happy_count = self.count_words_in_text(full_text, self.happy_words)
        sad_count = self.count_words_in_text(full_text, self.sad_words)
        angry_count = self.count_words_in_text(full_text, self.angry_words)
        neutral_count = self.count_words_in_text(full_text, self.neutral_words)
        
        # Calcular puntuaciones normalizadas
        total_words = len(self.normalize_text(full_text).split())
        if total_words == 0:
            total_words = 1
        
        scores = {
            'positivo': positive_count / total_words * 100,
            'negativo': negative_count / total_words * 100,
            'alegre': happy_count / total_words * 100,
            'triste': sad_count / total_words * 100,
            'enojado': angry_count / total_words * 100,
            'neutro': neutral_count / total_words * 100
        }
        
        # Detectar palabras encontradas
        normalized = self.normalize_text(full_text)
        words = normalized.split()
        
        detected_words = {
            'positivo': [w for w in words if w in self.positive_words],
            'negativo': [w for w in words if w in self.negative_words],
            'alegre': [w for w in words if w in self.happy_words],
            'triste': [w for w in words if w in self.sad_words],
            'enojado': [w for w in words if w in self.angry_words]
        }
        
        # Determinar sentimiento principal
        # Priorizar emociones específicas sobre positivo/negativo genérico
        emotion_scores = {
            'alegre': scores['alegre'] + scores['positivo'] * 0.3,
            'triste': scores['triste'] + scores['negativo'] * 0.3,
            'enojado': scores['enojado'] + scores['negativo'] * 0.3,
            'positivo': scores['positivo'] * 0.7,  # Reducir peso si hay emociones específicas
            'negativo': scores['negativo'] * 0.7,
            'neutro': scores['neutro']
        }
        
        # Encontrar el sentimiento con mayor puntuación
        max_score = max(emotion_scores.values())
        max_sentiment = max(emotion_scores, key=emotion_scores.get)
        
        # Si la puntuación es muy baja, considerar neutro
        if max_score < 0.5:
            final_sentiment = 'neutro'
            confidence = min(max_score / 0.5, 1.0)  # Normalizar confianza
        else:
            final_sentiment = max_sentiment
            # Calcular confianza basada en la diferencia entre el máximo y el segundo máximo
            sorted_scores = sorted(emotion_scores.values(), reverse=True)
            if len(sorted_scores) > 1:
                diff = sorted_scores[0] - sorted_scores[1]
                confidence = min(0.5 + (diff / max_score) * 0.5, 1.0)
            else:
                confidence = min(max_score / 2.0, 1.0)
        
        return {
            'sentimiento': final_sentiment,
            'confidence': round(confidence, 2),
            'scores': {k: round(v, 2) for k, v in scores.items()},
            'detected_words': {k: list(set(v))[:10] for k, v in detected_words.items()}  # Máximo 10 palabras por categoría
        }
    
    def get_sentiment_label(self, titulo: str, contenido: str = "") -> str:
        """
        Obtener solo la etiqueta de sentimiento (método simplificado)
        """
        result = self.analyze_sentiment(titulo, contenido)
        return result['sentimiento']


# Instancia global del analizador
_analyzer_instance = None

def get_sentiment_analyzer() -> SentimentAnalyzer:
    """Obtener instancia singleton del analizador"""
    global _analyzer_instance
    if _analyzer_instance is None:
        _analyzer_instance = SentimentAnalyzer()
    return _analyzer_instance

