/* FILTRO POR TIPOS Y FAVORITOS*/

const typeNav = document.getElementById("typeNav");

/* Lista oficial de tipos */
const typesList = [
    "fire", "water", "grass", "electric", "normal",
    "flying", "poison", "ground", "fairy",
    "psychic", "ice", "dragon", "dark",
    "steel", "ghost", "rock", "bug", "fighting"
];


/* BOTÓN "TODOS" */

const allBtn = document.createElement("button");
allBtn.classList.add("type-btn");
allBtn.textContent = "Todos";

allBtn.addEventListener("click", async () => {

    isSearching = false;
    loadMoreBtn.style.display = "block";

    container.innerHTML = "";
    currentPokemonList = [];
    offset = 0;

    await fetchPokemonBatch();
});

typeNav.appendChild(allBtn);


/* BOTÓN FAVORITOS*/
/*
const favBtn = document.createElement("button");
favBtn.classList.add("type-btn");
favBtn.textContent = "Favoritos";

favBtn.addEventListener("click", async () => {

    isSearching = true;
    loadMoreBtn.style.display = "none";
    container.innerHTML = "";

    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    if (favorites.length === 0) {
        container.innerHTML = "<p>No tienes Pokémon favoritos.</p>";
        return;
    }

    currentPokemonList = [];

    for (let id of favorites) {

        const detail = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
            .then(res => res.json());

        currentPokemonList.push(detail);
    }

    renderPokemonList(currentPokemonList);
});

typeNav.appendChild(favBtn);

*/

/* BOTONES DE TIPOS */

typesList.forEach(type => {

    const button = document.createElement("button");
    button.classList.add("type-btn", type);
    button.textContent = typeTranslations[type] || type;

    button.addEventListener("click", () => filterByType(type));

    typeNav.appendChild(button);
});


/* FILTRAR POR TIPO */

async function filterByType(type) {

    loader.style.display = "block";
    container.innerHTML = "";
    isSearching = true;
    loadMoreBtn.style.display = "none";

    try {

        const res = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
        const data = await res.json();

        currentPokemonList = [];

        for (let p of data.pokemon) {

            const detail = await fetch(p.pokemon.url)
                .then(res => res.json());

            currentPokemonList.push(detail);
        }

        renderPokemonList(currentPokemonList);

    } catch (error) {
        container.innerHTML = "<p>Error al filtrar por tipo</p>";
    }

    loader.style.display = "none";
}