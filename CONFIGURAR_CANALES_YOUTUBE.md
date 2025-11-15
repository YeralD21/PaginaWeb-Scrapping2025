# 📺 Guía: Configurar Canales de YouTube Correctamente

## Problema Actual
Los canales configurados en `scraping/youtube_channels.py` no existen o tienen IDs incorrectos, causando errores al scrapear.

## Solución: Obtener Channel IDs Correctos

### Método 1: Desde la URL del Canal (Más Rápido)

1. **Busca el canal en YouTube**
   - Ejemplo: "RPP Noticias YouTube"
   - Entra al canal verificado (✓)

2. **Revisa la URL del canal**
   ```
   https://www.youtube.com/@RPPNoticias
   https://www.youtube.com/channel/UCQu0zJVvw4Vg1BhvLXd-xMw
   ```
   - Si tiene `@handle` → usa ese handle
   - Si tiene `/channel/UC...` → ese es el channel_id

3. **Verifica que tenga videos públicos**
   - Navega a la pestaña "Videos"
   - Confirma que hay contenido reciente

### Método 2: Desde el Código Fuente

1. **Entra al canal en YouTube**
2. **Clic derecho → "Ver código fuente"**
3. **Busca (Ctrl+F):**
   - `"channelId":`
   - `"externalChannelId":`
   - Ejemplo: `"channelId":"UCQu0zJVvw4Vg1BhvLXd-xMw"`

### Método 3: Herramientas Online

Usa estas herramientas gratuitas:
- https://commentpicker.com/youtube-channel-id.php
- https://www.streamweasels.com/tools/youtube-channel-id-and-user-id-convertor/

**Pasos:**
1. Copia la URL del canal
2. Pégala en la herramienta
3. Obtén el Channel ID

## Verificar Canales Configurados

Ejecuta el script de verificación:

```bash
# Desde la raíz del proyecto
python scraping/verificar_canales_youtube.py
```

Este script:
- ✅ Verifica que cada canal exista
- ✅ Confirma que tenga videos públicos
- ✅ Identifica canales problemáticos
- ✅ Muestra un reporte detallado

## Actualizar Configuración

Edita `scraping/youtube_channels.py`:

```python
YOUTUBE_CHANNELS = [
    {
        "channel_id": "UCQu0zJVvw4Vg1BhvLXd-xMw",  # ← El ID correcto
        "handle": "@RPPNoticias",                   # ← El handle (opcional)
        "diario_nombre": "RPP Noticias",           # ← Nombre para mostrar
        "url": "https://www.youtube.com/@RPPNoticias",  # ← URL del canal
    },
    # Agrega más canales aquí...
]
```

## Canales de Noticias Peruanas Recomendados

Aquí algunos canales verificados de noticias peruanas:

### RPP Noticias
- **Handle:** @RPPNoticias
- **URL:** https://www.youtube.com/@RPPNoticias
- **Verificado:** ✓ Tiene videos diarios

### ATV Noticias
- **Handle:** @atvmasnoticias
- **URL:** https://www.youtube.com/@atvmasnoticias
- **Verificado:** ✓ Tiene videos diarios

### América Noticias
- **Handle:** @americatv
- **URL:** https://www.youtube.com/@americatv
- **Verificado:** ✓ Tiene videos diarios

### Panamericana TV
- **Handle:** @PanamericanaTV
- **URL:** https://www.youtube.com/@PanamericanaTV
- **Verificado:** ✓ Tiene videos diarios

### CNN en Español
- **Handle:** @cnnee
- **URL:** https://www.youtube.com/@cnnee
- **Verificado:** ✓ Noticias internacionales en español

## Probar la Configuración

Después de actualizar los canales:

1. **Ejecutar verificación:**
   ```bash
   python scraping/verificar_canales_youtube.py
   ```

2. **Probar scraping de YouTube:**
   ```bash
   # Desde el frontend, clic en "Actualizar solo YouTube"
   # O desde el backend:
   curl -X POST http://localhost:8000/scraping/social-media/youtube/ejecutar
   ```

3. **Revisar logs:**
   - Busca mensajes `✅ Canal validado correctamente`
   - Busca mensajes `❌ Canal no encontrado`

## Solución de Problemas Comunes

### Error: "Este canal no existe"
- **Causa:** Channel ID incorrecto
- **Solución:** Obtén el ID correcto usando los métodos anteriores

### Error: "No se encontraron videos"
- **Causa:** El canal existe pero no tiene videos públicos
- **Solución:** Usa otro canal de noticias con contenido activo

### Error 404 en el Feed RSS
- **Causa:** Channel ID incorrecto o canal eliminado
- **Solución:** Verifica manualmente que el canal existe y obtén el ID correcto

### Error 403 - Acceso Denegado
- **Causa:** El canal tiene el feed RSS deshabilitado
- **Solución:** Usa otro canal o contacta al propietario del canal

## Mejores Prácticas

1. **Usa canales verificados (✓):** Tienen menos probabilidad de ser eliminados
2. **Verifica actividad reciente:** Asegúrate que publican videos regularmente
3. **Prueba antes de producción:** Usa el script de verificación
4. **Mantén actualizada la configuración:** Revisa periódicamente los canales
5. **Usa canales oficiales:** De medios de comunicación establecidos

## Contacto y Soporte

Si un canal específico es importante para tu proyecto pero no puedes obtener el ID:
1. Busca el canal en YouTube
2. Revisa la sección "Acerca de" del canal
3. Usa las herramientas online mencionadas
4. Como último recurso, contacta al medio directamente

---

**Última actualización:** Noviembre 2025
**Versión:** 2.0

