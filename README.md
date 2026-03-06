# Pokédex Interactiva

Aplicación web desarrollada con **HTML5, CSS3 y JavaScript puro** que consume la API pública **PokeAPI** utilizando `fetch()`.

El proyecto permite explorar Pokémon, filtrarlos, ordenarlos, ver sus estadísticas, evoluciones y gestionar favoritos.

---

## Características principales

-  Búsqueda parcial en tiempo real (por nombre o ID)
-  Búsqueda por línea evolutiva (presionando Enter)
-  Filtro por tipo (Fuego, Agua, Planta, etc.)
-  Filtro por favoritos (guardados en LocalStorage)
-  Ordenamiento:
  - ID (menor a mayor / mayor a menor)
  - Nombre (A-Z / Z-A)
-  Carga progresiva con botón "Mostrar más"
-  Modal con:
  - Imagen oficial
  - Versión Shiny
  - Estadísticas con barras animadas
  - Tipos traducidos al español
  - Debilidades
  - Cadena evolutiva con imágenes
-  Diseño completamente responsive (móvil, tablet y escritorio)

---

## Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript (ES6)
- Fetch API
- LocalStorage
- PokeAPI (https://pokeapi.co/)

 No se utilizaron frameworks ni librerías externas.

---

## API utilizada

PokeAPI pública:

- `https://pokeapi.co/api/v2/pokemon`
- `https://pokeapi.co/api/v2/type/{type}`
- `https://pokeapi.co/api/v2/evolution-chain/{id}`

Todos los datos se obtienen dinámicamente mediante `fetch()`.

---

## Arquitectura del Proyecto

El proyecto está dividido en módulos:

- `app.js` → Lógica principal, carga progresiva, buscador, ordenamiento y favoritos.
- `detail.js` → Modal con detalles, estadísticas, debilidades y evoluciones.
- `tipos.js` → Filtro por tipo y favoritos.
- `style.css` → Estilos organizados por secciones y diseño responsive.

---

## Diseño Responsive

La aplicación está adaptada para:

- Teléfonos móviles
- Tablets
- Escritorio

Se utilizan `media queries` para adaptar:

- Grid de tarjetas
- Modal
- Barra de navegación de tipos
- Botones y controles

---

## Funcionalidad de Favoritos

Los Pokémon favoritos se almacenan en el navegador usando:

```javascript
localStorage
