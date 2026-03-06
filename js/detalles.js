/* REFERENCIAS AL DOM */

/* Elementos del modal */
const modal = document.getElementById("modal");
const closeBtn = document.getElementById("close");
const detailContainer = document.getElementById("pokemon-detail");


/* EVENTOS DEL MODAL */

/* Cerrar modal con botón */
closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
});

/* Cerrar modal al hacer click fuera del contenido */
window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.classList.add("hidden");
    }
});


/* FUNCIÓN PRINCIPAL: MOSTRAR DETALLE */

/*
   Recibe el ID del Pokémon
   Obtiene:
   - Información básica
   - Especie
   - Cadena evolutiva
   - Debilidades
   - Evoluciones con imágenes
*/
async function showPokemonDetail(id) {

    modal.classList.remove("hidden");
    detailContainer.innerHTML = "Cargando...";

    try {

        /* Obtener datos principales */
        const pokemon = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
            .then(res => res.json());

        /* Obtener especie (necesario para evolución) */
        const species = await fetch(pokemon.species.url)
            .then(res => res.json());

        /* Obtener cadena evolutiva */
        const evolution = await fetch(species.evolution_chain.url)
            .then(res => res.json());

        /* Obtener debilidades */
        const weaknesses = await getWeaknesses(pokemon.types);

        /* Obtener evoluciones con imagen */
        const evolutions = await getEvolutionImages(evolution.chain);

        /* Renderizar información */
        renderDetail(pokemon, weaknesses, evolutions);

    } catch (error) {
        detailContainer.innerHTML = "Error al cargar detalles";
    }
}


/* OBTENER DEBILIDADES */

/*
   Recibe los tipos del Pokémon
   Consulta la API de tipos
   Devuelve los tipos que le hacen doble daño
*/
async function getWeaknesses(types) {

    let weaknesses = new Set(); // Evita duplicados

    for (let t of types) {

        const typeData = await fetch(t.type.url)
            .then(res => res.json());

        typeData.damage_relations.double_damage_from.forEach(d => {
            weaknesses.add(d.name);
        });
    }

    return [...weaknesses];
}


/* OBTENER EVOLUCIONES CON IMÁGENES */

/*
   Recorre toda la cadena evolutiva
   Obtiene imagen oficial de cada evolución
*/
async function getEvolutionImages(chain) {

    let evolutions = [];
    let current = chain;

    while (current) {

        const pokeData = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${current.species.name}`
        ).then(res => res.json());

        evolutions.push({
            name: current.species.name,
            image: pokeData.sprites.other["official-artwork"].front_default
        });

        current = current.evolves_to[0];
    }

    return evolutions;
}


/* RENDERIZADO DEL DETALLE */

/*
   Construye dinámicamente:
   - Estadísticas con barras
   - Evoluciones con flechas
   - Tipos y debilidades traducidos
*/
function renderDetail(pokemon, weaknesses, evolutions) {

    /* Generar HTML de estadísticas */
    const statsHTML = pokemon.stats.map(stat => `
        <div class="stat">
            <div class="stat-name">${stat.stat.name}</div>
            <div class="stat-bar">
                <div class="stat-fill" style="width:${stat.base_stat}px"></div>
            </div>
        </div>
    `).join("");

    /* Generar HTML de evoluciones */
    const evolutionHTML = evolutions.map((evo, index) => `
        <div class="evolution-item">
            <img src="${evo.image}">
            <div class="evo-name">${evo.name}</div>
        </div>
        ${index < evolutions.length - 1 ? `<div class="arrow">➜</div>` : ""}
    `).join("");

    /* Insertar contenido en el modal */
    detailContainer.innerHTML = `
        <h2 class="detail-title">${pokemon.name.toUpperCase()}</h2>

        <div class="detail-grid">

            <!-- IZQUIERDA: IMÁGENES -->
            <div class="detail-images">
                <img class="main-img"
                    src="${pokemon.sprites.other["official-artwork"].front_default}">
                
                <h3> Shiny</h3>
                <img class="shiny-img"
                    src="${pokemon.sprites.front_shiny}">
            </div>

            <!-- DERECHA: INFORMACIÓN -->
            <div class="detail-info">

                <h3>Tipos</h3>
                <div class="types">
                    ${pokemon.types.map(t =>
                        `<span class="type-badge ${t.type.name}">
                            ${typeTranslations[t.type.name] || t.type.name}
                        </span>`
                    ).join("")}
                </div>

                <h3> Debilidades</h3>
                <div class="types">
                    ${weaknesses.map(w =>
                        `<span class="type-badge ${w}">
                            ${typeTranslations[w] || w}
                        </span>`
                    ).join("")}
                </div>

                <h3> Estadísticas</h3>
                ${statsHTML}

            </div>
        </div>

        <h3 class="evo-title">🌿 Evoluciones</h3>
        <div class="evolution-chain">
            ${evolutionHTML}
        </div>
    `;
}