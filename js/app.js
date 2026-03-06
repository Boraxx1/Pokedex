/*REFERENCIAS AL DOM */

/* Elementos principales del HTML */
const container = document.getElementById("pokemon-container");
const searchInput = document.getElementById("search");
const loader = document.getElementById("loader");
const sortFilter = document.getElementById("sortFilter");
const loadMoreBtn = document.getElementById("loadMoreBtn");


/* CONFIGURACIÓN GLOBAL Y ESTADO */

/* Control de paginación progresiva */
let offset = 0;        // Desde qué Pokémon empezar
let limit = 50;        // Cantidad inicial
let increment = 20;    // Cuántos cargar al presionar "Mostrar más"

/* Estado actual */
let currentPokemonList = [];  // Pokémon actualmente visibles
let isSearching = false;      // Indica si estamos en modo búsqueda


/* TRADUCCIÓN DE TIPOS (INGLÉS → ESPAÑOL)*/

const typeTranslations = {
    normal: "Normal",
    fire: "Fuego",
    water: "Agua",
    electric: "Eléctrico",
    grass: "Planta",
    ice: "Hielo",
    fighting: "Lucha",
    poison: "Veneno",
    ground: "Tierra",
    flying: "Volador",
    psychic: "Psíquico",
    bug: "Bicho",
    rock: "Roca",
    ghost: "Fantasma",
    dragon: "Dragón",
    dark: "Siniestro",
    steel: "Acero",
    fairy: "Hada"
};


/* CARGA PROGRESIVA DE POKÉMON */

/* Obtiene un bloque de Pokémon usando limit y offset */
async function fetchPokemonBatch(customLimit = limit) {

    loader.style.display = "block";

    const res = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=${customLimit}&offset=${offset}`
    );

    const data = await res.json();

    /* Se obtiene el detalle individual de cada Pokémon */
    for (let pokemon of data.results) {
        const detail = await fetch(pokemon.url).then(r => r.json());
        currentPokemonList.push(detail);
    }

    renderPokemonList(currentPokemonList);

    loader.style.display = "none";
}


/* CREACIÓN Y RENDERIZADO DE TARJETAS */

/* Genera una tarjeta individual */
function createCard(pokemon) {

    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const isFav = favorites.includes(pokemon.id);

    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
        <span class="favorite">${isFav ? "❤️" : "🤍"}</span>
        <p>N.º ${pokemon.id.toString().padStart(4,"0")}</p>
        <img src="${pokemon.sprites.other["official-artwork"].front_default}">
        <h3>${pokemon.name}</h3>
        <div class="types">
            ${pokemon.types.map(t =>
                `<span class="type-badge ${t.type.name}">
                    ${typeTranslations[t.type.name] || t.type.name}
                </span>`
            ).join("")}
        </div>
    `;

    /* Evento para favoritos */
    card.querySelector(".favorite").addEventListener("click", (e)=>{
        e.stopPropagation();
        toggleFavorite(pokemon.id);
    });

    /* Evento para abrir detalle */
    card.addEventListener("click", () => {
        showPokemonDetail(pokemon.id);
    });

    container.appendChild(card);
}


/* Renderiza una lista completa */
function renderPokemonList(list) {
    container.innerHTML = "";
    list.forEach(pokemon => createCard(pokemon));
}


/*  BOTÓN "MOSTRAR MÁS" */

loadMoreBtn.addEventListener("click", async () => {

    if (isSearching) return;  // No cargar más si estamos buscando

    offset += increment;
    await fetchPokemonBatch(increment);
});


/* SISTEMA DE FAVORITOS (LocalStorage) */

function toggleFavorite(id){

    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    if(favorites.includes(id)){
        favorites = favorites.filter(f => f !== id);
    } else {
        favorites.push(id);
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
    renderPokemonList(currentPokemonList);
}


/* =====================================================
   🔍 BUSCADOR MEJORADO
   ===================================================== */

/* BÚSQUEDA PARCIAL EN TIEMPO REAL */
searchInput.addEventListener("input", () => {

    const value = searchInput.value.toLowerCase().trim();

    /* Si el input está vacío → volver a vista normal */
    if (value === "") {
        isSearching = false;
        loadMoreBtn.style.display = "block";
        renderPokemonList(currentPokemonList);
        return;
    }

    isSearching = true;
    loadMoreBtn.style.display = "none";

    /* Filtrar localmente (sin fetch extra) */
    const filtered = currentPokemonList.filter(pokemon =>
        pokemon.name.includes(value) ||
        pokemon.id.toString().includes(value)
    );

    renderPokemonList(filtered);
});


/* BÚSQUEDA POR EVOLUCIÓN (SOLO CON ENTER) */
searchInput.addEventListener("keydown", async (e) => {

    if (e.key !== "Enter") return;

    const value = searchInput.value.toLowerCase().trim();

    if (value === "") return;

    loader.style.display = "block";
    container.innerHTML = "";
    isSearching = true;
    loadMoreBtn.style.display = "none";

    try {

        const pokemon = await fetch(`https://pokeapi.co/api/v2/pokemon/${value}`)
            .then(res => {
                if (!res.ok) throw new Error("No encontrado");
                return res.json();
            });

        const species = await fetch(pokemon.species.url).then(res => res.json());
        const evolution = await fetch(species.evolution_chain.url).then(res => res.json());

        const evolutionNames = getFullEvolutionChain(evolution.chain);

        currentPokemonList = [];

        for (let name of evolutionNames) {
            const evoData = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
                .then(res => res.json());

            currentPokemonList.push(evoData);
        }

        renderPokemonList(currentPokemonList);

    } catch (error) {
        container.innerHTML = "<p>No se encontró ese Pokémon.</p>";
    }

    loader.style.display = "none";
});


/* ORDENAMIENTO GLOBAL */

sortFilter.addEventListener("change", () => {

    let sortedList = [...currentPokemonList];

    switch (sortFilter.value) {

        case "id-asc":
            sortedList.sort((a, b) => a.id - b.id);
            break;

        case "id-desc":
            sortedList.sort((a, b) => b.id - a.id);
            break;

        case "name-asc":
            sortedList.sort((a, b) => a.name.localeCompare(b.name));
            break;

        case "name-desc":
            sortedList.sort((a, b) => b.name.localeCompare(a.name));
            break;
    }

    currentPokemonList = sortedList;
    renderPokemonList(currentPokemonList);
});


/* FUNCIÓN AUXILIAR: CADENA EVOLUTIVA COMPLETA */

function getFullEvolutionChain(chain) {

    let evolutions = [];

    function traverse(node) {
        evolutions.push(node.species.name);
        node.evolves_to.forEach(evo => traverse(evo));
    }

    traverse(chain);
    return evolutions;
}


/* INICIALIZACIÓN */

/* Carga inicial de los primeros 50 Pokémon */
fetchPokemonBatch();