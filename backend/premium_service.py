from datetime import datetime, timedelta
from typing import List, Optional

from sqlalchemy.orm import Session

from models import Noticia

CATEGORY_BOOST = {
    "política": 6,
    "economía": 5,
    "deportes": 4,
    "internacional": 3,
    "tecnología": 3,
    "espectáculos": 2,
}


def calculate_premium_score(noticia: Noticia, now: Optional[datetime] = None) -> float:
    """
    Heurística para estimar qué tan atractiva es una noticia para contenido premium.
    Combina popularidad, tendencia, categoría, palabras clave y frescura.
    """
    if now is None:
        now = datetime.utcnow()

    score = 0.0

    # Popularidad del scraper (normalizada)
    popularidad = noticia.popularidad_score or 0.0
    score += min(popularidad, 100) * 0.6

    # Tendencia explícita
    if noticia.es_trending:
        score += 12

    # Categoría prioritaria
    categoria = (noticia.categoria or "").lower()
    score += CATEGORY_BOOST.get(categoria, 1)

    # Cantidad de palabras clave identificadas
    keywords = noticia.palabras_clave or []
    score += min(len(keywords), 8) * 0.8

    # Frescura (más valor si es reciente en últimas 48h)
    fecha_ref = noticia.fecha_publicacion or noticia.fecha_extraccion or now
    horas = max((now - fecha_ref).total_seconds() / 3600, 1)
    if horas <= 48:
        score += (48 - horas) * 0.3

    # Penalizar si es muy antigua
    if horas > 120:
        score *= 0.5

    return round(score, 2)


def update_premium_scores(
    db: Session,
    hours_window: int = 168,
    auto_mark: bool = False,
    top_percentage: float = 0.15,
) -> None:
    """
    Recalcular puntajes premium de noticias recientes.
    Si auto_mark = True, marca automáticamente el top (top_percentage) como premium.
    """
    now = datetime.utcnow()
    since = now - timedelta(hours=hours_window)

    noticias = (
        db.query(Noticia)
        .filter(Noticia.fecha_extraccion >= since)
        .all()
    )

    if not noticias:
        return

    for noticia in noticias:
        noticia.premium_score = calculate_premium_score(noticia, now)

    if auto_mark and noticias:
        sorted_news = sorted(noticias, key=lambda n: n.premium_score, reverse=True)
        cutoff = max(1, int(len(sorted_news) * top_percentage))
        threshold = sorted_news[cutoff - 1].premium_score

        for noticia in noticias:
            noticia.es_premium = noticia.premium_score >= threshold

    db.commit()


def get_recommended_premium_news(
    db: Session,
    limit: int = 20,
    categoria: Optional[str] = None,
) -> List[Noticia]:
    """
    Obtener noticias mejor puntuadas para sugerir como premium.
    """
    query = db.query(Noticia).order_by(Noticia.premium_score.desc(), Noticia.fecha_extraccion.desc())

    if categoria:
        query = query.filter(Noticia.categoria.ilike(categoria))

    return query.limit(limit).all()

