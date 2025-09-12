#!/usr/bin/env python3
"""
Clasificador Geográfico de Noticias
Detecta automáticamente si una noticia es Internacional, Nacional, Regional o Local
"""

import re
from typing import Dict, List, Optional
from dataclasses import dataclass

@dataclass
class GeographicKeywords:
    """Palabras clave para clasificación geográfica"""
    
    # Países y regiones internacionales
    international_countries = [
        # Países principales
        'estados unidos', 'eeuu', 'usa', 'washington', 'nueva york',
        'china', 'beijing', 'shanghai', 'hong kong',
        'rusia', 'moscú', 'putin', 'kremlin',
        'alemania', 'berlín', 'merkel', 'scholz',
        'francia', 'parís', 'macron',
        'reino unido', 'londres', 'inglaterra', 'escocia',
        'italia', 'roma', 'milán',
        'españa', 'madrid', 'barcelona',
        'japón', 'tokio', 'osaka',
        'corea del sur', 'seúl',
        'india', 'nueva delhi', 'mumbai',
        'brasil', 'brasília', 'río de janeiro', 'são paulo',
        'argentina', 'buenos aires',
        'chile', 'santiago',
        'colombia', 'bogotá',
        'méxico', 'ciudad de méxico',
        'canadá', 'ottawa', 'toronto',
        'australia', 'canberra', 'sídney',
        
        # Organismos internacionales
        'onu', 'naciones unidas', 'otan', 'nato',
        'unión europea', 'ue', 'bruselas',
        'fmi', 'banco mundial', 'oea',
        'fifa', 'uefa', 'coi',
        
        # Términos internacionales
        'mundial', 'internacional', 'global',
        'extranjero', 'exterior', 'diplomacia',
        'embajada', 'consulado', 'tratado',
        'cumbre internacional', 'g7', 'g20',
        'acuerdo bilateral', 'relaciones exteriores'
    ]
    
    # Términos nacionales (Perú)
    national_keywords = [
        # Gobierno nacional
        'presidente', 'presidencia', 'palacio de gobierno',
        'congreso', 'parlamento', 'senado',
        'ministro', 'ministerio', 'premier',
        'pcm', 'consejo de ministros',
        'tribunal constitucional', 'poder judicial',
        'corte suprema', 'fiscalía de la nación',
        
        # Instituciones nacionales
        'sunat', 'reniec', 'onpe', 'jne',
        'bcr', 'banco central', 'sbs',
        'indecopi', 'osinergmin', 'osiptel',
        'sernanp', 'senasa', 'digesa',
        'essalud', 'sis', 'minsa',
        
        # Términos nacionales
        'nacional', 'país', 'perú', 'peruano',
        'república', 'estado peruano',
        'gobierno nacional', 'política nacional',
        'economía nacional', 'desarrollo nacional',
        'seguridad nacional', 'defensa nacional'
    ]
    
    # Regiones del Perú
    regional_keywords = [
        # Regiones
        'amazonas', 'áncash', 'apurímac', 'arequipa',
        'ayacucho', 'cajamarca', 'callao', 'cusco', 'cuzco',
        'huancavelica', 'huánuco', 'ica', 'junín',
        'la libertad', 'lambayeque', 'loreto',
        'madre de dios', 'moquegua', 'pasco',
        'piura', 'puno', 'san martín', 'tacna',
        'tumbes', 'ucayali',
        
        # Ciudades principales
        'arequipa', 'trujillo', 'chiclayo', 'piura',
        'iquitos', 'cusco', 'huancayo', 'chimbote',
        'tacna', 'ica', 'puno', 'tumbes',
        'cajamarca', 'pucallpa', 'huaraz',
        'ayacucho', 'abancay', 'cerro de pasco',
        'huancavelica', 'moquegua', 'moyobamba',
        'puerto maldonado',
        
        # Términos regionales
        'región', 'regional', 'gobierno regional',
        'gobernador regional', 'consejo regional',
        'municipalidad provincial',
        'desarrollo regional', 'economía regional'
    ]
    
    # Lima y Callao (local)
    local_keywords = [
        # Lima metropolitana
        'lima', 'metropolitana', 'capital',
        'municipalidad de lima', 'alcalde de lima',
        'cercado de lima', 'centro de lima',
        
        # Distritos de Lima
        'miraflores', 'san isidro', 'barranco', 'chorrillos',
        'surco', 'la molina', 'san borja', 'magdalena',
        'pueblo libre', 'jesús maría', 'lince',
        'breña', 'rimac', 'independencia', 'los olivos',
        'san martín de porres', 'comas', 'carabayllo',
        'puente piedra', 'ancón', 'santa rosa',
        'villa el salvador', 'villa maría del triunfo',
        'san juan de miraflores', 'santiago de surco',
        'ate', 'chaclacayo', 'lurigancho', 'el agustino',
        'santa anita', 'la victoria', 'san luis',
        'surquillo', 'san miguel', 'pachacamac',
        'punta hermosa', 'punta negra', 'san bartolo',
        'santa maría del mar', 'pucusana',
        
        # Callao
        'callao', 'bellavista', 'carmen de la legua',
        'la perla', 'la punta', 'ventanilla',
        'mi perú',
        
        # Términos locales
        'local', 'distrital', 'municipal',
        'alcalde', 'municipalidad distrital',
        'gobierno local', 'comuna'
    ]

class GeographicClassifier:
    """Clasificador geográfico de noticias"""
    
    def __init__(self):
        self.keywords = GeographicKeywords()
        
        # Compilar patrones regex para mejor rendimiento
        self.patterns = {
            'internacional': self._compile_patterns(self.keywords.international_countries),
            'nacional': self._compile_patterns(self.keywords.national_keywords),
            'regional': self._compile_patterns(self.keywords.regional_keywords),
            'local': self._compile_patterns(self.keywords.local_keywords)
        }
    
    def _compile_patterns(self, keywords: List[str]) -> re.Pattern:
        """Compilar patrones regex para las palabras clave"""
        # Crear patrón que busque palabras completas
        pattern = r'\b(?:' + '|'.join(re.escape(kw) for kw in keywords) + r')\b'
        return re.compile(pattern, re.IGNORECASE)
    
    def classify_news(self, title: str, content: str = "") -> Dict[str, any]:
        """
        Clasificar una noticia geográficamente
        
        Args:
            title: Título de la noticia
            content: Contenido de la noticia (opcional)
            
        Returns:
            Dict con la clasificación y detalles
        """
        # Combinar título y contenido para análisis
        text = f"{title} {content}".lower()
        
        # Contar coincidencias por categoría
        matches = {}
        keywords_found = {}
        
        for category, pattern in self.patterns.items():
            found_matches = pattern.findall(text)
            matches[category] = len(found_matches)
            keywords_found[category] = list(set(found_matches))  # Eliminar duplicados
        
        # Determinar categoría principal
        primary_category = self._determine_primary_category(matches, text)
        
        # Calcular confianza
        confidence = self._calculate_confidence(matches, primary_category)
        
        return {
            'geographic_type': primary_category,
            'confidence': confidence,
            'matches': matches,
            'keywords_found': keywords_found,
            'is_mixed': self._is_mixed_content(matches)
        }
    
    def _determine_primary_category(self, matches: Dict[str, int], text: str) -> str:
        """Determinar la categoría principal basada en las coincidencias"""
        
        # Reglas especiales
        if any(word in text for word in ['mundial', 'internacional', 'extranjero']):
            return 'internacional'
        
        if any(word in text for word in ['presidente', 'congreso', 'ministro']):
            return 'nacional'
        
        # Basado en número de coincidencias
        max_matches = max(matches.values())
        if max_matches == 0:
            return 'nacional'  # Por defecto
        
        # Encontrar categoría con más coincidencias
        for category, count in matches.items():
            if count == max_matches:
                return category
        
        return 'nacional'  # Fallback
    
    def _calculate_confidence(self, matches: Dict[str, int], primary_category: str) -> float:
        """Calcular nivel de confianza de la clasificación"""
        total_matches = sum(matches.values())
        
        if total_matches == 0:
            return 0.3  # Baja confianza sin matches
        
        primary_matches = matches.get(primary_category, 0)
        confidence = primary_matches / total_matches
        
        # Ajustar confianza basada en cantidad total
        if total_matches >= 3:
            confidence = min(confidence + 0.2, 1.0)
        elif total_matches >= 2:
            confidence = min(confidence + 0.1, 1.0)
        
        return round(confidence, 2)
    
    def _is_mixed_content(self, matches: Dict[str, int]) -> bool:
        """Determinar si el contenido es mixto (múltiples categorías)"""
        categories_with_matches = sum(1 for count in matches.values() if count > 0)
        return categories_with_matches >= 2
    
    def get_geographic_stats(self, news_list: List[Dict]) -> Dict:
        """Obtener estadísticas geográficas de una lista de noticias"""
        stats = {
            'internacional': 0,
            'nacional': 0,
            'regional': 0,
            'local': 0,
            'total': len(news_list)
        }
        
        for news in news_list:
            classification = self.classify_news(
                news.get('titulo', ''),
                news.get('contenido', '')
            )
            geo_type = classification['geographic_type']
            stats[geo_type] += 1
        
        # Calcular porcentajes
        for key in ['internacional', 'nacional', 'regional', 'local']:
            if stats['total'] > 0:
                stats[f'{key}_percent'] = round((stats[key] / stats['total']) * 100, 1)
            else:
                stats[f'{key}_percent'] = 0
        
        return stats

# Instancia global del clasificador
geo_classifier = GeographicClassifier()

def classify_geographic_type(title: str, content: str = "") -> str:
    """Función helper para clasificar tipo geográfico"""
    result = geo_classifier.classify_news(title, content)
    return result['geographic_type']

def get_geographic_classification(title: str, content: str = "") -> Dict:
    """Función helper para obtener clasificación completa"""
    return geo_classifier.classify_news(title, content)

# Ejemplos de uso
if __name__ == "__main__":
    # Ejemplos de prueba
    classifier = GeographicClassifier()
    
    ejemplos = [
        {
            'titulo': 'Presidente se reúne con ministros en Palacio de Gobierno',
            'contenido': 'El presidente de la República sostuvo una reunión con el Consejo de Ministros'
        },
        {
            'titulo': 'Biden y Xi Jinping se reunirán en cumbre del G20',
            'contenido': 'Los líderes de Estados Unidos y China planean encuentro bilateral'
        },
        {
            'titulo': 'Gobierno Regional de Arequipa anuncia nuevas obras',
            'contenido': 'El gobernador regional presentó proyectos de infraestructura'
        },
        {
            'titulo': 'Alcalde de Miraflores inaugura nuevo parque',
            'contenido': 'La municipalidad distrital invirtió en áreas verdes'
        }
    ]
    
    for ejemplo in ejemplos:
        resultado = classifier.classify_news(ejemplo['titulo'], ejemplo['contenido'])
        print(f"\nTítulo: {ejemplo['titulo']}")
        print(f"Clasificación: {resultado['geographic_type']}")
        print(f"Confianza: {resultado['confidence']}")
        print(f"Palabras encontradas: {resultado['keywords_found']}")
