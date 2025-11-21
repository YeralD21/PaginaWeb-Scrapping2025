"""
Configuración centralizada de canales de noticias en YouTube.

Cada entrada define:
    - channel_id: ID oficial del canal (empieza con 'UC')
    - handle: identificador con arroba visible en YouTube
    - diario_nombre: nombre del diario o medio que se muestra en la UI
    - url: URL pública del canal

✅ Canales VERIFICADOS y FUNCIONALES (Actualizado: Noviembre 2025)
Todos los canales han sido verificados manualmente y tienen videos públicos.
"""

YOUTUBE_CHANNELS = [
    # ===== CANALES OFICIALES SOLICITADOS (PRIORITARIOS) =====
    
    # CNN en Español - Canal oficial @cnnee ✓ (VERIFICADO: Nov 2025)
    {
        "channel_id": "UC_lEiu6917IJz03TnntWUaQ",
        "handle": "@cnnee",
        "diario_nombre": "CNN en Español",
        "url": "https://www.youtube.com/@cnnee",
    },
    
    # El Comercio Perú - Canal oficial @DiarioElComercio ✓ (VERIFICADO: Nov 2025)
    {
        "channel_id": "UCA5MMdT1ePEEi9ACfCelIKQ",
        "handle": "@DiarioElComercio",
        "diario_nombre": "El Comercio",
        "url": "https://www.youtube.com/@DiarioElComercio",
    },
    
    # ===== NOTICIAS PERUANAS (SECUNDARIOS) =====
    
    # RPP Noticias - Principal medio de noticias de Perú ✓ (VERIFICADO: Nov 2025)
    {
        "channel_id": "UC5j8-2FT0ZMMBkmK72R4aeA",
        "handle": "@RPPNoticias",
        "diario_nombre": "RPP Noticias",
        "url": "https://www.youtube.com/@RPPNoticias",
    },
    # América TV - Canal de televisión peruano ✓ (VERIFICADO)
    {
        "channel_id": "UCRFUzVEen4SIFW1pJn0u0nw",
        "handle": "@americatv",
        "diario_nombre": "América TV",
        "url": "https://www.youtube.com/@americatv",
    },
    
    # ===== NOTICIAS INTERNACIONALES EN ESPAÑOL (SECUNDARIOS) =====
    
    # BBC News Mundo - Noticias BBC en español ✓ (VERIFICADO)
    {
        "channel_id": "UCVHNftB4Z2juvIY1R8dRg1Q",
        "handle": "@BBCNewsMundo",
        "diario_nombre": "BBC News Mundo",
        "url": "https://www.youtube.com/@BBCNewsMundo",
    },
    # El País - Diario español con cobertura latinoamericana ✓ (VERIFICADO)
    {
        "channel_id": "UCnsvJeZO4RigQ898WdDNoBw",
        "handle": "@ElPais",
        "diario_nombre": "El País",
        "url": "https://www.youtube.com/@ElPais",
    },
    
    # ===== NOTICIAS INTERNACIONALES (INGLÉS) (SECUNDARIOS) =====
    
    # CNN - Canal principal de CNN ✓ (VERIFICADO)
    {
        "channel_id": "UCupvZG-5ko_eiXAupbDfxWw",
        "handle": "@CNN",
        "diario_nombre": "CNN",
        "url": "https://www.youtube.com/@CNN",
    },
]



