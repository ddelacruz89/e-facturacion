# Paleta de Colores de la Aplicación

Paleta monocromática oficial. Usar para botones de ActionBar, fondos de secciones, chips, y cualquier elemento de UI que requiera consistencia visual.

## Colores

| Hex       | Uso sugerido                          |
|-----------|---------------------------------------|
| `#272C36` | Botón primario / acción principal (Guardar) |
| `#3D4453` | Botón secundario (Nuevo, Reset)       |
| `#525C71` | Botón terciario (Requisición, carga de datos) |
| `#67748F` | Botón de navegación / listados        |
| `#848EA5` | Elementos deshabilitados / informativos |

## Uso en botones (ActionBar)

```tsx
// Guardar — más oscuro, acción principal
sx={{ bgcolor: "#272C36", "&:hover": { bgcolor: "#1a1f27" } }}

// Nuevo / Reset
sx={{ bgcolor: "#3D4453", "&:hover": { bgcolor: "#2e3340" } }}

// Cargar desde entidad (Requisición, Orden, etc.)
sx={{ bgcolor: "#525C71", "&:hover": { bgcolor: "#3D4453" } }}

// Ver lista / navegación
sx={{ bgcolor: "#67748F", "&:hover": { bgcolor: "#525C71" } }}
```

Todos los botones usan `variant="contained"` para mostrar el background.
El hover retrocede un tono más oscuro dentro de la misma paleta.

---

## Colores complementarios

Tonos análogos al azul-gris base, con ligero matiz verde-azul, neutro, violeta, naranja-cálido y dorado-cálido.

| Hex       | Matiz           |
|-----------|-----------------|
| `#526671` | Verde-azul (teal) |
| `#525C71` | Azul-gris neutro (comparte con paleta principal) |
| `#525271` | Violeta-gris     |
| `#715D52` | Naranja-tierra   |
| `#716752` | Dorado-cálido    |

---

## Paleta tetrádica

Usada para estados de prioridad (ALTA / MEDIA / BAJA) y otros indicadores de nivel.

| Hex       | Matiz              | Uso                        |
|-----------|--------------------|----------------------------|
| `#525C71` | Azul-gris          | Base / sin clasificar       |
| `#71526B` | Violeta-rosa       | Prioridad ALTA (urgente)    |
| `#716752` | Dorado-cálido      | Prioridad MEDIA             |
| `#527158` | Verde-salvia       | Prioridad BAJA              |
| `#5F5271` | Violeta-azul       | Secundario / informativo    |
