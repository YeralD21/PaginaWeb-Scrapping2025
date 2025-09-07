"""
Utilidades para extraer fechas de publicación reales de los diarios
"""

import re
from datetime import datetime
from typing import Optional

def extract_publication_date_correo(article) -> Optional[datetime]:
    """
    Extrae la fecha de publicación real del Diario Correo
    """
    try:
        # Buscar en elementos p que contengan fechas
        date_elements = article.find_all('p', string=re.compile(r'\d{4}-\d{2}-\d{2}'))
        
        for elem in date_elements:
            date_text = elem.get_text(strip=True)
            # Formato: 2025-09-06
            if re.match(r'\d{4}-\d{2}-\d{2}', date_text):
                return datetime.strptime(date_text, '%Y-%m-%d')
        
        return None
    except Exception:
        return None

def extract_publication_date_popular(article) -> Optional[datetime]:
    """
    Extrae la fecha de publicación real de El Popular
    """
    try:
        # Buscar en atributo datetime
        time_elem = article.find('time')
        if time_elem:
            datetime_attr = time_elem.get('datetime')
            if datetime_attr:
                # Formato: 07 Sep 2025 | 12:04 h
                # Extraer solo la fecha: 07 Sep 2025
                date_part = datetime_attr.split(' | ')[0]
                return datetime.strptime(date_part, '%d %b %Y')
        
        # Buscar en URL si no se encuentra en datetime
        link_elem = article.find('a')
        if link_elem:
            href = link_elem.get('href', '')
            date_match = re.search(r'\d{4}/\d{1,2}/\d{1,2}', href)
            if date_match:
                date_str = date_match.group()
                return datetime.strptime(date_str, '%Y/%m/%d')
        
        return None
    except Exception:
        return None

def extract_publication_date_comercio(article) -> Optional[datetime]:
    """
    Extrae la fecha de publicación real de El Comercio
    """
    try:
        # Buscar en atributo datetime
        time_elem = article.find('time')
        if time_elem:
            datetime_attr = time_elem.get('datetime')
            if datetime_attr:
                # Intentar diferentes formatos
                formats = ['%Y-%m-%dT%H:%M:%S', '%Y-%m-%d', '%d/%m/%Y']
                for fmt in formats:
                    try:
                        return datetime.strptime(datetime_attr, fmt)
                    except ValueError:
                        continue
        
        # Buscar en URL
        link_elem = article.find('a')
        if link_elem:
            href = link_elem.get('href', '')
            date_match = re.search(r'\d{4}/\d{1,2}/\d{1,2}', href)
            if date_match:
                date_str = date_match.group()
                return datetime.strptime(date_str, '%Y/%m/%d')
        
        return None
    except Exception:
        return None

def get_publication_date(article, diario_name: str) -> Optional[datetime]:
    """
    Obtiene la fecha de publicación según el diario
    """
    if diario_name == 'Diario Correo':
        return extract_publication_date_correo(article)
    elif diario_name == 'El Popular':
        return extract_publication_date_popular(article)
    elif diario_name == 'El Comercio':
        return extract_publication_date_comercio(article)
    else:
        return None
