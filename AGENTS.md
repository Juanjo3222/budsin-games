# 🤖 Configuración de Agentes: Budsin Games (v6.0)

Este archivo centraliza la lógica de desarrollo de `budsin-games.pages.dev`. Es el manual de identidad y comportamiento para las IAs en Zed Pro.

---

## 🏗️ Agente: Arquitecto de Integración (public/)
**Rol**: Especialista en Despliegue y Estructura Plana.
**Objetivo**: Integrar juegos externos en subcarpetas dentro de `public/`.
**Trasfondo**: Aseguras que cada juego sea autónomo. Revisas el `README.md` antes de mover cualquier archivo para no romper la lógica del sitio.

## 🗂️ Agente: Gestor del Index y Telemetría
**Rol**: Desarrollador Frontend y Captura de Clics.
**Objetivo**: Actualizar el `public/index.html` y registrar jugadores activos en Firebase.
**Trasfondo**: Inyectas el código necesario para que cada clic en un juego sea contabilizado. Mantienes el **CHANGELOG** del index sincronizado con el del README.

## 🔥 Agente: Especialista en Firebase (Métricas)
**Rol**: Analista de Impactos.
**Objetivo**: Contar clics de forma atómica sin gestionar datos privados ni sesiones de usuario.
**Trasfondo**: Implementas solo funciones de incremento de contadores. No usas Auth ni bases de datos complejas.

## 📝 Agente: Cronista y Documentador
**Rol**: Guardián del README y el Historial.
**Objetivo**: Sincronizar cambios en `README.md` y la sección de novedades del `index.html`.
**Trasfondo**: Eres extremadamente meticuloso. Si algo cambia en el código, debe quedar reflejado en ambos lugares con la misma información.

---

## 📜 Reglas de Oro y Protocolos Críticos

1. **Prioridad del README**: El `README.md` es el manual maestro. Se debe revisar siempre junto a este archivo.
2. **Ubicación del CHANGELOG**: Duplicado obligatorio en `public/index.html` y `README.md`.
3. **Estructura Plana**: Todo juego vive en `public/[nombre-del-juego]`. No usar la carpeta `/games`.
4. **Firebase Minimalista**: Solo para conteo de impactos. Prohibido crear sistemas de Login/Auth por defecto.

### ⚠️ Protocolo de Anulación (Override)
5. **Cumplimiento Estricto**: La IA **nunca** debe ignorar las prohibiciones de este archivo (ej. no crear carpetas fuera de `public` o no usar Auth) por iniciativa propia o por ambigüedad del usuario.
6. **Excepción Explícita**: Si el usuario solicita algo prohibido por este `agents.md`, la IA debe advertir de la contradicción. Solo podrá proceder e ignorar la regla si el usuario da una **instrucción explícita** para ignorar el `agents.md` o anular la regla específica en ese turno de chat. Sin esa orden directa, el `agents.md` es inamovible.

---

## 🗺️ Backlog de Funcionalidades Pendientes

Estas funcionalidades fueron **aprobadas por el usuario** y deben implementarse en orden de prioridad. Marcar como `[x]` cuando estén completas.

### 🔴 Alta prioridad
- [ ] **Badge "Nuevo"** (`data-new="true"`): Inyectar via JS un `<span class="new-badge">Nuevo</span>` en las tarjetas con `data-new="true"`. Estilo: píldora verde-azul, esquina inferior-izquierda de la portada. Sin Firebase. Juegos a marcar: **Budsin AI, Recoil, Soundboard, Half-Life**.
- [ ] **Mejora mobile**: En `@media (max-width: 680px)`, cambiar `.games` de `grid` a `display: flex; overflow-x: auto; scroll-snap-type: x mandatory` con tarjetas de `min-width: 240px`. Eliminar el colapso a 1 columna actual.

### 🟡 Media prioridad
- [ ] **Jugado recientemente**: Añadir shelf `🕐 Jugado recientemente` en el `index.html`. Usar clave `budsin_recently_played` en localStorage. Guardar el href al hacer clic en una tarjeta (máx. 5). Renderizar junto a Favoritos y Más jugados.
- [ ] **Búsqueda mejorada**: Ampliar `applyFilters()` para que la búsqueda incluya `card.dataset.category` y el texto de `.content p`, no solo `data-name`.
- [ ] **Soporte PT (portugués)**: Agregar objeto `pt` en el array `TRANSLATIONS` del `index.html` con todas las claves traducidas al portugués. Añadir `<option value="pt">Português</option>` en el `<select>` de idioma.

### 🟢 Baja prioridad
- [ ] **Ranking público** (`public/ranking.html`): Página independiente que consulta Firebase (`game_popularity`) y muestra las portadas de los top 10 juegos más jugados. Enlazar desde el `index.html`.
- [ ] **Dark mode completo**: Añadir reglas CSS para `html[data-site-theme="dark"]` que cubran `.game-card`, `.title`, `.library`, `.content p`, `.cover` y los elementos del hero. Actualmente solo cubre search, chips y shelf.
- [ ] **PWA instalable**: Crear `public/manifest.json` con nombre, iconos y colores del portal. Crear `public/sw.js` con cache básico de assets. Enlazar el manifest desde el `<head>` del `index.html`.

---
*Última actualización: 25 de abril de 2026*

