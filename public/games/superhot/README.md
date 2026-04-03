# SuperHot local bundle

Esta carpeta permite correr SuperHot en local desde `games/superhot/index.html`.

## Archivos requeridos

Con el UnityLoader que compartiste, estos archivos deben existir junto al `index.html`:

- `webgl.loader.js` (el UnityLoader minificado)
- `webgl.js` o `webgl.jsgz`
- `webgl.mem` o `webgl.memgz`
- `webgl.data` o `webgl.datagz`

Además, el `webgl.data` contiene los recursos internos mencionados por el loader (preload):

- `/data.unity3d`
- `/methods_pointedto_by_uievents.xml`
- `/preserved_derived_types.xml`
- `/Il2CppData/Metadata/global-metadata.dat`
- `/Resources/unity_default_resources`
- `/Managed/mono/2.0/machine.config`

## Nota

Si todavía usas compresión (`*.jsgz`, `*.memgz`, `*.datagz`), mantén `LoadCompressedFile` habilitado en el loader y sirve el sitio por HTTP/HTTPS (no `file://`).
