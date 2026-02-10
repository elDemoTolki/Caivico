# Condominio Río Caivico — Sitio estático

Resumen de ajustes recientes
--------------------------

Se añadieron varias mejoras solicitadas para la versión ecológica y accesible del sitio:

- Sección **Propietarios**: página nueva en `propietarios/index.html` y enlace en el menú superior.
- Reestructuración de la **Galería**:
	- Generador local: `scripts/generate-gallery-index.py` (Python) y `scripts/generate-gallery-index.mjs` (Node) crean `assets/gallery.json`.
	- `assets/gallery.json` contiene rutas absolutas (`/assets/...`) para evitar 404 desde subrutas como `/galeria/`.
	- Home (`index.html`) carga 6 imágenes aleatorias desde `assets/gallery.json`.
	- Página completa: `galeria/index.html` implementa carga por lotes (infinite scroll) y lazy-loading.
- Lightbox accesible (modal) implementado en `index.html` y `galeria/index.html`:
	- Markup ARIA-compliant (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`).
	- Controles: Cerrar, Anterior, Siguiente y contador.
	- Soporta teclado: Enter/Space para abrir thumbnail, Esc para cerrar, ← / → para navegar.
	- Focus trap dentro del modal y el foco se restaura al thumbnail que abrió el modal.
	- Scroll del body bloqueado mientras el modal está abierto (`.no-scroll`).

Archivos clave modificados
-------------------------

- `index.html` — home; añadido lightbox markup y enlace a galería.
- `galeria/index.html` — galería completa; añadido lightbox markup y mejoras en thumbnails.
- `styles.css` — estilos del lightbox, focus-visible y utilidad `.no-scroll`.
- `script.js` — lógica del lightbox (delegación, focus-trap, teclado), carga de imágenes en home y mejoras de accesibilidad.
- `assets/gallery.json` — índice generado con las rutas de las imágenes.
- `scripts/generate-gallery-index.py` y `scripts/generate-gallery-index.mjs` — generadores que crean `assets/gallery.json`.

Prueba local rápida
-------------------

1. Generar/actualizar el índice de la galería (si agregas/eliminas imágenes):

```powershell
python scripts/generate-gallery-index.py
```

2. Iniciar servidor local y abrir en el navegador:

```powershell
python -m http.server 8000
# Abrir http://localhost:8000/ y http://localhost:8000/galeria/
```

Checklist de accesibilidad (implementado)
----------------------------------------

- `role="dialog"` y `aria-modal="true"` en el lightbox.
- Título accesible y `aria-labelledby`.
- Botón cerrar con `aria-label="Cerrar"`.
- Soporte de teclado: Enter/Space, Esc, ← / →.
- Focus trap dentro del modal y restauración del foco al cerrar.
- No scroll del fondo mientras el modal está abierto.

Notas y recomendaciones
----------------------

- Si regeneras `assets/gallery.json`, asegúrate de que las rutas permanezcan absolutas (`/assets/...`) para evitar problemas desde `/galeria/`.
- Opcional: ajustar textos `alt` de las imágenes para más contexto descriptivo.
- Si quieres, puedo añadir pequeñas mejoras visuales (fade-in por lote, botones más discretos) sin tocar la accesibilidad.

Historial de commits relevantes
-----------------------------

- "Galería dinámica: rutas absolutas, sentinel oculto, generadores"
- "Add accessible lightbox: keyboard, ARIA, focus trap"

Contacto / siguientes pasos
--------------------------

Si deseas que haga el commit de este `README.md` o que añada capturas/ejemplos de uso, dime y lo hago.

---
Generado el 2026-02-09 — ajustes por desarrollador.
