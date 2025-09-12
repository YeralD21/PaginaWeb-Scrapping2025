"""
Generador de contenido automático para noticias
Crea contenido basado en el título cuando no se puede extraer contenido real
"""

import re
import random
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

class ContentGenerator:
    def __init__(self):
        # Plantillas de contenido por categoría
        self.templates = {
            'deportes': [
                "En el mundo del deporte, {titulo_limpio}. Este acontecimiento ha generado gran expectativa entre los aficionados y expertos del sector. Los detalles de esta noticia continúan desarrollándose, y se espera que tenga un impacto significativo en el panorama deportivo actual.",
                
                "El ámbito deportivo se ve nuevamente conmocionado con la noticia de que {titulo_limpio}. Esta información ha sido confirmada por fuentes cercanas al evento, y promete ser uno de los temas más comentados en las próximas horas. Los fanáticos y seguidores están atentos a los próximos desarrollos.",
                
                "Una nueva actualización en el mundo deportivo revela que {titulo_limpio}. Esta noticia ha captado la atención de medios especializados y aficionados por igual. Se trata de un desarrollo que podría tener repercusiones importantes en el futuro cercano del deporte."
            ],
            
            'espectaculos': [
                "El mundo del entretenimiento se encuentra en el centro de atención tras conocerse que {titulo_limpio}. Esta revelación ha generado múltiples reacciones en redes sociales y medios de comunicación, convirtiéndose rápidamente en uno de los temas más discutidos del momento.",
                
                "Los reflectores del espectáculo se enfocan nuevamente en una noticia que ha sorprendido a propios y extraños: {titulo_limpio}. Fuentes cercanas al evento han confirmado los detalles, y se espera que esta información continúe generando comentarios en las próximas horas.",
                
                "El ámbito artístico y del entretenimiento presenta una nueva controversia al revelarse que {titulo_limpio}. Esta noticia ha despertado el interés del público y los medios especializados, quienes siguen de cerca cada desarrollo de esta historia."
            ],
            
            'mundo': [
                "En el panorama internacional, una noticia ha captado la atención de analistas y ciudadanos: {titulo_limpio}. Este acontecimiento podría tener implicaciones importantes en el contexto global actual, y diversos expertos ya han comenzado a analizar sus posibles consecuencias.",
                
                "El escenario mundial presenta un nuevo desarrollo que ha generado interés en múltiples sectores: {titulo_limpio}. Esta información proviene de fuentes confiables y se espera que tenga repercusiones en el ámbito internacional en los próximos días.",
                
                "Una actualización relevante en el contexto internacional revela que {titulo_limpio}. Los detalles de esta noticia continúan siendo analizados por expertos, y se anticipa que podría influir en las dinámicas globales actuales."
            ],
            
            'economia': [
                "El sector económico registra un nuevo movimiento importante: {titulo_limpio}. Esta noticia ha llamado la atención de analistas financieros y empresarios, quienes evalúan las posibles implicaciones para el mercado y la economía en general.",
                
                "En el ámbito económico y financiero, se ha dado a conocer que {titulo_limpio}. Esta información es considerada relevante por expertos del sector, quienes anticipan que podría generar cambios en las tendencias actuales del mercado.",
                
                "Una nueva actualización en el panorama económico indica que {titulo_limpio}. Los detalles de esta noticia están siendo analizados por especialistas, y se espera que tenga un impacto medible en los indicadores financieros próximamente."
            ],
            
            'politica': [
                "El panorama político nacional presenta un nuevo desarrollo: {titulo_limpio}. Esta noticia ha generado reacciones diversas entre analistas políticos y ciudadanos, convirtiéndose en un tema de debate en múltiples plataformas y medios de comunicación.",
                
                "En el ámbito político, una información relevante ha salido a la luz: {titulo_limpio}. Fuentes oficiales han confirmado los detalles, y se espera que este acontecimiento tenga repercusiones en el panorama político actual del país.",
                
                "Una actualización importante en el escenario político revela que {titulo_limpio}. Esta noticia está siendo seguida de cerca por observadores políticos y ciudadanos interesados en los desarrollos del gobierno y las instituciones."
            ]
        }
        
        # Frases de cierre adicionales
        self.closing_phrases = [
            "Se espera que en las próximas horas se revelen más detalles sobre este importante acontecimiento.",
            "Los medios de comunicación continúan siguiendo de cerca esta historia en desarrollo.",
            "Esta noticia seguirá siendo monitoreada para informar sobre cualquier actualización relevante.",
            "Las reacciones del público y los expertos no se han hecho esperar ante esta revelación.",
            "Se anticipa que habrá más información disponible conforme avance el día."
        ]

    def clean_title(self, title: str) -> str:
        """Limpia el título para usar en las plantillas"""
        # Remover prefijos comunes de diarios
        prefixes_to_remove = [
            'PorDeportes', 'PorEspectáculos', 'PorMundo', 'PorEconomía', 
            'Por Deportes', 'Por Espectáculos', 'Por Mundo', 'Por Economía',
            'DEPORTES:', 'ESPECTÁCULOS:', 'MUNDO:', 'ECONOMÍA:',
            'Deportes:', 'Espectáculos:', 'Mundo:', 'Economía:'
        ]
        
        cleaned_title = title
        for prefix in prefixes_to_remove:
            if cleaned_title.startswith(prefix):
                cleaned_title = cleaned_title[len(prefix):].strip()
                break
        
        # Asegurar que termine con punto
        if not cleaned_title.endswith('.'):
            cleaned_title += '.'
            
        return cleaned_title

    def detect_category(self, title: str, category: str) -> str:
        """Detecta la categoría más apropiada basada en el título y categoría original"""
        title_lower = title.lower()
        
        # Palabras clave por categoría
        keywords = {
            'deportes': ['fútbol', 'alianza', 'universitario', 'selección', 'mundial', 'liga', 'gol', 'partido', 'jugador', 'entrenador', 'copa', 'torneo'],
            'espectaculos': ['ampay', 'infiel', 'artista', 'actor', 'cantante', 'programa', 'televisión', 'show', 'espectáculo', 'famoso', 'celebrity'],
            'politica': ['gobierno', 'presidente', 'ministro', 'congreso', 'política', 'elecciones', 'estado', 'ley', 'decreto'],
            'economia': ['económico', 'financiero', 'mercado', 'empresa', 'negocio', 'inversión', 'banco', 'dinero', 'precio'],
            'mundo': ['internacional', 'mundial', 'país', 'nación', 'global', 'exterior', 'diplomacia']
        }
        
        # Contar coincidencias por categoría
        category_scores = {}
        for cat, words in keywords.items():
            score = sum(1 for word in words if word in title_lower)
            category_scores[cat] = score
        
        # Si hay una categoría con mayor score, usarla
        best_category = max(category_scores.items(), key=lambda x: x[1])
        if best_category[1] > 0:
            return best_category[0]
        
        # Si no hay coincidencias claras, usar la categoría original
        category_lower = category.lower()
        if category_lower in keywords:
            return category_lower
        
        # Por defecto, usar 'mundo'
        return 'mundo'

    def generate_content(self, title: str, category: str = 'mundo', min_length: int = 200) -> str:
        """Genera contenido automático basado en el título"""
        try:
            # Detectar la mejor categoría
            detected_category = self.detect_category(title, category)
            
            # Limpiar título
            clean_title = self.clean_title(title)
            
            # Seleccionar plantilla aleatoria
            templates = self.templates.get(detected_category, self.templates['mundo'])
            base_template = random.choice(templates)
            
            # Generar contenido base
            content = base_template.format(titulo_limpio=clean_title.lower())
            
            # Agregar párrafo adicional si es necesario
            if len(content) < min_length:
                additional_info = self._generate_additional_paragraph(detected_category, clean_title)
                content += f"\n\n{additional_info}"
            
            # Agregar frase de cierre
            closing = random.choice(self.closing_phrases)
            content += f"\n\n{closing}"
            
            logger.info(f"Contenido generado para: {title[:50]}... (Categoría: {detected_category})")
            return content
            
        except Exception as e:
            logger.error(f"Error generando contenido para '{title}': {e}")
            return self._generate_fallback_content(title)

    def _generate_additional_paragraph(self, category: str, title: str) -> str:
        """Genera un párrafo adicional contextual"""
        additional_templates = {
            'deportes': [
                "Los aficionados al deporte han expresado diversas opiniones sobre este desarrollo, algunos mostrando apoyo mientras otros mantienen una postura más cautelosa. Las redes sociales se han llenado de comentarios y debates sobre las implicaciones de esta noticia.",
                "Expertos en el ámbito deportivo consideran que este acontecimiento podría marcar un precedente importante para eventos futuros. Se espera que las autoridades competentes emitan un pronunciamiento oficial en las próximas horas."
            ],
            'espectaculos': [
                "El público y los seguidores han reaccionado de manera inmediata a esta revelación, generando miles de comentarios en redes sociales. Los medios especializados en entretenimiento ya han comenzado a analizar las posibles consecuencias de esta noticia.",
                "Personalidades del medio artístico han comenzado a pronunciarse sobre este tema, algunos ofreciendo su apoyo mientras otros prefieren mantener distancia. La industria del entretenimiento se encuentra expectante ante los próximos desarrollos."
            ],
            'mundo': [
                "Organismos internacionales y gobiernos de diferentes países están monitoreando de cerca esta situación. Los analistas políticos consideran que este desarrollo podría tener ramificaciones importantes en el panorama geopolítico actual.",
                "La comunidad internacional ha comenzado a reaccionar ante esta noticia, con diversos países expresando sus posturas oficiales. Se espera que en las próximas horas se conozcan más detalles sobre las implicaciones globales de este acontecimiento."
            ],
            'economia': [
                "Los mercados financieros han mostrado una reacción inicial a esta noticia, con algunos indicadores registrando movimientos significativos. Analistas económicos están evaluando el impacto potencial en diferentes sectores de la economía.",
                "Empresarios y líderes del sector privado han comenzado a evaluar las posibles consecuencias de este desarrollo en sus operaciones. Se anticipa que habrá ajustes estratégicos en respuesta a esta nueva información."
            ],
            'politica': [
                "Los partidos políticos han comenzado a posicionarse respecto a este tema, con algunos expresando apoyo y otros manifestando preocupación. La ciudadanía sigue de cerca los desarrollos y espera respuestas concretas de sus representantes.",
                "Analistas políticos consideran que este acontecimiento podría influir en las dinámicas del panorama político nacional. Se espera que en los próximos días se definan las posturas oficiales de los diferentes actores políticos."
            ]
        }
        
        templates = additional_templates.get(category, additional_templates['mundo'])
        return random.choice(templates)

    def _generate_fallback_content(self, title: str) -> str:
        """Genera contenido de respaldo en caso de error"""
        return f"""Esta es una noticia importante que ha captado la atención del público y los medios de comunicación. 

{title}

Los detalles de esta información continúan desarrollándose, y se espera que en las próximas horas se revelen más aspectos relevantes sobre este acontecimiento.

Se recomienda a los lectores mantenerse informados a través de fuentes oficiales para conocer las actualizaciones más recientes sobre este tema."""

    def enhance_existing_content(self, title: str, existing_content: str, category: str = 'mundo') -> str:
        """Mejora contenido existente que es muy corto"""
        if len(existing_content) > 150:  # Si ya tiene contenido suficiente
            return existing_content
        
        # Si el contenido es muy corto, generar uno nuevo
        if len(existing_content) < 50:
            return self.generate_content(title, category)
        
        # Si tiene algo de contenido, expandirlo
        detected_category = self.detect_category(title, category)
        additional = self._generate_additional_paragraph(detected_category, title)
        closing = random.choice(self.closing_phrases)
        
        return f"{existing_content}\n\n{additional}\n\n{closing}"

# Función de utilidad para usar en otros módulos
def generate_content_for_news(title: str, existing_content: str = "", category: str = "mundo") -> str:
    """Función de utilidad para generar o mejorar contenido de noticias"""
    generator = ContentGenerator()
    
    if not existing_content or len(existing_content.strip()) < 100:
        return generator.generate_content(title, category)
    else:
        return generator.enhance_existing_content(title, existing_content, category)
