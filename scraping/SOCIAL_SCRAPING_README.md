# 📊 Scraping de Redes Sociales con Selenium

Este documento explica cómo usar los scrapers de redes sociales con **Selenium** para obtener datos **REALES** (no mock) de Facebook, Twitter y Instagram.

## 📋 Índice

- [Configuración](#configuración)
- [Uso](#uso)
- [Scrapers Disponibles](#scrapers-disponibles)
- [Ejemplos](#ejemplos)
- [Troubleshooting](#troubleshooting)

---

## ⚙️ Configuración

### 1. Instalar Selenium

```bash
pip install selenium
```

### 2. Instalar ChromeDriver

Selenium necesita **ChromeDriver** para controlar Chrome:

#### **Opción A: Automática (recomendada)**
```bash
# Selenium 4.x ya lo descarga automáticamente
# No necesitas hacer nada adicional
```

#### **Opción B: Manual**
1. Descarga ChromeDriver: https://chromedriver.chromium.org/downloads
2. Extrae el ejecutable
3. Agrégalo a PATH o colócalo en la misma carpeta que el script

### 3. Activar Selenium

Por defecto, los scrapers usan **datos MOCK** (rápidos y garantizados).

Para usar **Selenium** con scraping REAL, configura la variable de entorno:

#### **En Windows (PowerShell):**
```powershell
$env:USE_SELENIUM="true"
python main.py  # Inicia el backend
```

#### **En Linux/Mac:**
```bash
export USE_SELENIUM=true
python main.py
```

#### **En el código:**
```python
import os
os.environ['USE_SELENIUM'] = 'true'
```

---

## 🚀 Uso

### Uso Básico (Modo Mock)

```python
from scraping.main_scraper import MainScraper

scraper = MainScraper()
news = scraper.scrape_social_media()
print(f"Total de noticias: {len(news)}")
```

**Ventajas del modo mock:**
- ✅ Rápido (instantáneo)
- ✅ No requiere Chrome
- ✅ Funciona siempre
- ✅ Datos de prueba consistentes

### Uso Avanzado (Modo Selenium)

```python
import os
os.environ['USE_SELENIUM'] = 'true'

from scraping.main_scraper import MainScraper

scraper = MainScraper()
news = scraper.scrape_social_media()
print(f"Total de noticias REALES: {len(news)}")

# Ver el contenido real
for item in news[:3]:
    print(f"\n{item['titulo']}")
    print(f"Autor: {item['autor']}")
    print(f"URL: {item['enlace']}")
```

**Ventajas del modo Selenium:**
- ✅ Datos **100% reales** de redes sociales
- ✅ Títulos, descripciones e imágenes reales
- ✅ URLs a posts reales

**Desventajas:**
- ⚠️ Lento (1-2 minutos por red social)
- ⚠️ Puede ser bloqueado por CAPTCHAs
- ⚠️ Requiere Chrome instalado

---

## 📱 Scrapers Disponibles

### 1. ScraperFacebookSelenium

**Fuentes:**
- El Comercio (`elcomercio.pe`)
- Diario Correo (`CorreoPeru`)
- CNN (`cnn`)
- El Popular (`elpopular.pe`)
- La República (`larepublicape`)

**Datos extraídos:**
- ✅ Título/post
- ✅ Contenido completo
- ✅ Imagen si existe
- ✅ Enlace directo al post
- ✅ Categoría (auto-clasificada)
- ✅ Fecha de publicación

### 2. ScraperTwitterSelenium

**Fuentes:**
- `@elcomercio_peru`
- `@DiarioCorreo`
- `@rppnoticias`
- `@Peru21`
- `@cnnespanol`

**Datos extraídos:**
- ✅ Texto del tweet
- ✅ Autor
- ✅ Enlace directo
- ✅ Imagen si existe
- ✅ Categoría
- ✅ Fecha

### 3. ScraperInstagramSelenium

**⚠️ LIMITACIONES:**
Instagram requiere **login** para ver posts. El scraper actual:
- ❌ No tiene login implementado
- ✅ Usa **modo mock** siempre (genera datos de prueba)

**Para implementar scraping real de Instagram**, necesitarías:
1. Sistema de login (credenciales + cookies)
2. Manejo de sesiones
3. Rotación de proxies (para evitar bloqueos)

---

## 🧪 Ejemplos

### Ejemplo 1: Probar un scraper individual

```bash
# Probar Facebook (modo mock)
python scraping/scraper_facebook_selenium.py

# Probar Twitter (modo mock)
python scraping/scraper_twitter_selenium.py
```

### Ejemplo 2: Scraping desde el backend

```python
# En backend/scraping_service.py o similar

import os
os.environ['USE_SELENIUM'] = 'true'  # Activar Selenium

from scraping.main_scraper import MainScraper

scraper = MainScraper()
news = scraper.scrape_social_media()

# Guardar en BD
# ...
```

### Ejemplo 3: Scraping solo Facebook real

```python
from scraping.scraper_facebook_selenium import ScraperFacebookSelenium

scraper = ScraperFacebookSelenium()
news = scraper.get_all_news(use_real=True)

for item in news:
    print(f"{item['autor']}: {item['titulo']}")
```

---

## 🔧 Troubleshooting

### Error: "ChromeDriver not found"

**Solución:**
```bash
# Verificar que Chrome está instalado
# Selenium 4.x descarga ChromeDriver automáticamente
# Si aún falla, reinstala selenium:
pip install --upgrade selenium
```

### Error: "Timeout waiting for page to load"

**Causas:**
- Red lenta
- Facebook/Twitter bloquearon la IP
- Los selectores cambiaron (la estructura de la página)

**Solución:**
- Reducir `max_posts` a 1-2
- Aumentar timeout en WebDriverWait
- Verificar selectores actualizados

### Error: "Login required" (Instagram)

**Solución:**
- Instagram siempre requiere login
- Usa modo mock por ahora
- Para scraping real, implementa login + cookies

### El scraping devuelve 0 noticias

**Causas:**
- Los selectores CSS cambiaron
- La página tiene CAPTCHA
- Facebook/Twitter detectó bot

**Solución:**
1. Verifica los selectores en DevTools del navegador
2. Prueba en modo no-headless (quitar `--headless`)
3. Espera unos minutos y reintenta

---

## 📊 Formato de Salida

Todos los scrapers devuelven datos en este formato:

```python
{
    'titulo': 'Título o texto principal del post',
    'contenido': 'Contenido completo del post',
    'enlace': 'https://facebook.com/page/posts/xyz',
    'imagen_url': 'https://example.com/image.jpg',
    'categoria': 'Política',  # Auto-clasificada
    'fecha_publicacion': datetime.now(),
    'fecha_extraccion': datetime.now().isoformat(),
    'diario': 'Facebook',  # o 'Twitter', 'Instagram'
    'diario_nombre': 'El Comercio',  # Nombre del diario
    'autor': 'El Comercio'  # o '@cuenta'
}
```

---

## 🎯 Próximos Pasos

Para mejorar los scrapers:

1. **Implementar login** para Instagram
2. **Rotación de proxies** para evitar bloqueos
3. **Detección de CAPTCHA** y alertas
4. **Cache de sesiones** para reutilizar logins
5. **Retry automático** con backoff exponencial
6. **Scraping incremental** (solo posts nuevos)

---

## 📝 Notas Importantes

- ⚠️ **Respetar rate limits**: Agregar delays entre requests
- ⚠️ **Cambios frecuentes**: Las redes sociales cambian su HTML constantemente
- ⚠️ **Ética**: Scraping solo de páginas públicas
- ⚠️ **API oficial**: Considerar usar APIs oficiales (Facebook Graph API, Twitter API)

---

## 🤝 Contribuir

Si mejoras los scrapers:
1. Actualiza este README
2. Comenta el código
3. Agrega logs detallados
4. Documenta nuevos selectores CSS

---

## 📚 Referencias

- [Selenium Documentation](https://www.selenium.dev/documentation/)
- [WebDriverWait Best Practices](https://selenium-python.readthedocs.io/waits.html)
- [CSS Selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors)
- [XPath Tutorial](https://www.w3schools.com/xml/xpath_intro.asp)

