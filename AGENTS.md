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

5. **Assets obligatorios en páginas de juego**: Toda página de juego nueva o editada **debe incluir** en su `<head>`:
   - Favicon: `<link rel="icon" type="image/jpeg" href="https://budsin-games.pages.dev/images.jpeg">`
   - Script Classroom Hotkey: `<script src="https://budsin-games.pages.dev/classroom-hotkey.js"></script>` (justo antes de `</body>`)
   - Sin excepción. Aplica a cualquier `.html` dentro de `public/` que sea una página de juego.

6. **Traducciones obligatorias al añadir un juego**: Cada vez que se añada una nueva tarjeta de juego al `index.html`, se deben completar **los 3 idiomas** sin excepción:
   - **HTML** (`<a class="game-card">`): atributos `data-desc-es="..."` y `data-desc-en="..."` en el `<p>` de descripción; `data-label-es="Disponible" data-label-en="Available"` en el `<span>` de estado; `data-es="..."` y `data-en="..."` en el `<span class="category-tag">`.
   - **JS** (`PT_DESCRIPTIONS`): añadir entrada `"nombre del juego (en minúsculas, igual que data-name)": "Descripción en portugués."` al objeto `PT_DESCRIPTIONS` del script principal.
   - **JS** (`PT_CATEGORIES`): verificar que la categoría del juego ya existe en `PT_CATEGORIES`. Si es nueva, añadirla.
   - Un juego sin las 3 traducciones completas se considera **incompleto** y no debe commitearse.

### ⚠️ Protocolo de Anulación (Override)
5. **Cumplimiento Estricto**: La IA **nunca** debe ignorar las prohibiciones de este archivo (ej. no crear carpetas fuera de `public` o no usar Auth) por iniciativa propia o por ambigüedad del usuario.
7. **Excepción Explícita**: Si el usuario solicita algo prohibido por este `agents.md`, la IA debe advertir de la contradicción. Solo podrá proceder e ignorar la regla si el usuario da una **instrucción explícita** para ignorar el `agents.md` o anular la regla específica en ese turno de chat. Sin esa orden directa, el `agents.md` es inamovible.

---

## 🗺️ Backlog de Funcionalidades Pendientes

Estas funcionalidades fueron **aprobadas por el usuario** y deben implementarse en orden de prioridad. Marcar como `[x]` cuando estén completas.

### 🔴 Alta prioridad
- [ ] **Badge "Nuevo"** (`data-new="true"`): Inyectar via JS un `<span class="new-badge">Nuevo</span>` en las tarjetas con `data-new="true"`. Estilo: píldora verde-azul, esquina inferior-izquierda de la portada. Sin Firebase.

---
*Última actualización: 25 de abril de 2026*
