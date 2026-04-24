# TrueSize DC

Página web estática para comparar Washington D.C., Arlington County y el sur de Montgomery County con capitales latinoamericanas a escala real.

## Qué hace

- Carga polígonos públicos de DC, Arlington y Montgomery County.
- Recorta Montgomery County para aproximar la zona sur usada en el prototipo original.
- Proyecta esos polígonos sobre la capital latinoamericana seleccionada conservando distancias aproximadas en kilómetros desde el centro de DC.
- Permite arrastrar el overlay, cambiar de capital, ver el área real en DC y alternar subdivisiones.

## Ejecutar localmente

Este proyecto no necesita build. Puedes abrir `index.html` directamente o servirlo con cualquier servidor estático:

```bash
python -m http.server 8000
```

Luego abre `http://localhost:8000`.

## Publicar en GitHub Pages

1. Sube este directorio a un repositorio de GitHub.
2. En GitHub, ve a `Settings > Pages`.
3. Selecciona `Deploy from a branch`.
4. Usa la rama principal y la carpeta raíz (`/root`).

## Fuentes

- Leaflet para el mapa interactivo.
- CARTO y OpenStreetMap para el mapa base.
- Census TIGERweb para límites de condados y subdivisiones.
- Repositorios públicos GeoJSON para el polígono de Washington D.C.
