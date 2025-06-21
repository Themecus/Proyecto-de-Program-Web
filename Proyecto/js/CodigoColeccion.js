const TOTAL_POKEMON = 150;//constante de todos los pokemones a buscar
let coleccionPokemon = [];//pokemones obtenidos
let todosLosPokemon = []; // Para almacenar todos los datos de los Pokémon

// Se ejecutara cuando el DOM este completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    cargarColeccion();//cargar la informacion de los pokemones desde el localStorage
    inicializarColeccionGrid();//inicializar las casillas
    
    // Un evento para cerrar los modal de detalles
    document.getElementById('closeModalDetalles').addEventListener('click', function() {
        document.getElementById('pokemonModalDetalles').style.display = 'none';
    });
    
    // Un eventos para los filtros y sus botones
    document.getElementById('aplicarFiltros').addEventListener('click', aplicarFiltros);
    document.getElementById('limpiarFiltros').addEventListener('click', limpiarFiltros);
    
    // Aplicar filtros al presionar Enter en el campo de nombre
    document.getElementById('filtroNombre').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            aplicarFiltros();
        }
    });
});

//esto cargara el localStorage en la coleccion, si no tenemos pokemones lo hara de forma
//vacia
function cargarColeccion() {
    const coleccionGuardada = localStorage.getItem('pokemonColeccion');
    if (coleccionGuardada) {
        //si nos dara pokemones en ese array
        coleccionPokemon = JSON.parse(coleccionGuardada);
    } else {
        //si no tenemos pokemones solo da un array lleno de nulls
        coleccionPokemon = Array(TOTAL_POKEMON).fill(null);
    }
    actualizarContador();
}

//esto solo actualiza el contador en coleccion
function actualizarContador() {
    const obtenidos = coleccionPokemon.filter(p => p !== null).length;
    document.getElementById('contadorColeccion').textContent = 
        `Pokémon obtenidos: ${obtenidos}/${TOTAL_POKEMON}`;
}

//inicia la cuadricula de la coleccion que se nos dio con los datos de POKEAPI
async function inicializarColeccionGrid() {
    const coleccionGrid = document.getElementById('coleccionGrid');
    coleccionGrid.innerHTML = '';
    
    // Mostrar mensaje de carga
    coleccionGrid.innerHTML = '<div class="no-resultados">Cargando colección...</div>';
    
    try {
        // si caremos de los datos del pokemon, se conseguiran de la API
        if (todosLosPokemon.length === 0) {
            //nos da la lista basica de pokemones
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${TOTAL_POKEMON}`);
            // Obtiene los datos de la respuesta HTTP y los convierte a formato JSON
            const data = await response.json();
            
            // Obtener detalles de cada Pokémon
            const pokemonPromises = data.results.map(async (pokemon, index) => {
                const pokemonResponse = await fetch(pokemon.url);
                return await pokemonResponse.json();
            });
            
            todosLosPokemon = await Promise.all(pokemonPromises);
        }
        
        // renderiza las cuadrículas
        renderizarPokemonGrid(todosLosPokemon);
        
    } catch (error) {
        console.error('Error al cargar los Pokémon:', error);
        coleccionGrid.innerHTML = '<div class="no-resultados">Error al cargar la colección. Intenta recargar la página.</div>';
    }
}

//esta funcion se encargara de dibujar las casillas/cuadriculas con las que trabajaremos
function renderizarPokemonGrid(pokemonList) {
    const coleccionGrid = document.getElementById('coleccionGrid');//donde dibujaremos
    coleccionGrid.innerHTML = '';//usaremos esto para dibujar en el HTML
    
    //mensaje de error si los filtros no coinciden
    if (pokemonList.length === 0) {
        coleccionGrid.innerHTML = '<div class="no-resultados">No se encontraron Pokémon que coincidan con los filtros.</div>';
        return;
    }
    
    //Este cuadro hara lo siguiente:
    pokemonList.forEach(pokemon => {
        const pokemonId = pokemon.id;
        const pokemonCell = document.createElement('div');
        pokemonCell.className = 'pokemon-cell';
        pokemonCell.dataset.pokemonId = pokemonId;
        //verificar si el pokemon esta en la coleccion del usuario
        const pokemonData = coleccionPokemon[pokemonId-1];
        //agrega al pokemon a la lista con su icono y nombre
        if (pokemonData) {
            pokemonCell.classList.add('obtenido');
            pokemonCell.innerHTML = `
                <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
                <p>#${String(pokemonId).padStart(3, '0')}</p>
            `;
            
            // Agregar evento para mostrar detalles
            pokemonCell.addEventListener('click', function() {
                mostrarDetallesPokemon(pokemon);
            });
        } else {//sino solo una "?" de no ser descubierto aun
            pokemonCell.innerHTML = `
                <p class="placeholder">?</p>
                <p>#${String(pokemonId).padStart(3, '0')}</p>
            `;
        }
        //al final agrega la cuadricula/casilla
        coleccionGrid.appendChild(pokemonCell);
    });
}

//este sera el Modal que muestra los detalles del pokemon a profundidad
async function mostrarDetallesPokemon(pokemonData) {
    try {
        // Mostrar información básica
        document.getElementById('modalPokemonNombre').textContent = 
            pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1);
        document.getElementById('modalPokemonImagen').src = pokemonData.sprites.front_default;
        document.getElementById('modalPokemonImagen').alt = pokemonData.name;
        document.getElementById('modalPokemonId').textContent = pokemonData.id;
        
        // Mostrar su tipo
        const tiposContainer = document.getElementById('modalTiposContainer');
        tiposContainer.innerHTML = '';
        pokemonData.types.forEach(type => {
            const tipoElement = document.createElement('span');
            tipoElement.className = 'pokemon-tipo';
            tipoElement.textContent = type.type.name;
            tipoElement.style.backgroundColor = getColorPorTipo(type.type.name);
            tiposContainer.appendChild(tipoElement);
        });
        
        // Mostrar estadísticas
        const statsContainer = document.getElementById('modalStatsContainer');
        statsContainer.innerHTML = '<h3>Estadísticas</h3>';
        pokemonData.stats.forEach(stat => {
            const statElement = document.createElement('div');
            statElement.className = 'pokemon-stat';
            statElement.textContent = 
                `${stat.stat.name.replace('-', ' ')}: ${stat.base_stat}`;
            statsContainer.appendChild(statElement);
        });
        
        // Mostrar 4 movimientos aleatorios de su estado evolutivo
        const movimientosContainer = document.getElementById('modalMovimientosContainer');
        movimientosContainer.innerHTML = '';
        
        // Mezclar movimientos y tomar 4
        const movimientos = [...pokemonData.moves];
        shuffleArray(movimientos);
        const movimientosMostrar = movimientos.slice(0, 4);
        
        movimientosMostrar.forEach(move => {
            const movimientoItem = document.createElement('div');
            movimientoItem.className = 'pokemon-movimiento';
            movimientoItem.textContent = move.move.name.replace('-', ' ');
            movimientosContainer.appendChild(movimientoItem);
        });
        
        // Mostrar modal
        document.getElementById('pokemonModalDetalles').style.display = 'flex';
        
    } catch (error) {
        console.error('Error al cargar detalles del Pokémon:', error);
        alert('Ocurrió un error al cargar los detalles del Pokémon.');
    }
}

// Función para obtener colores según el tipo de Pokémon
function getColorPorTipo(tipo) {
    const colores = {
        normal: '#A8A878',
        fire: '#F08030',
        water: '#6890F0',
        electric: '#F8D030',
        grass: '#78C850',
        ice: '#98D8D8',
        fighting: '#C03028',
        poison: '#A040A0',
        ground: '#E0C068',
        flying: '#A890F0',
        psychic: '#F85888',
        bug: '#A8B820',
        rock: '#B8A038',
        ghost: '#705898',
        dragon: '#7038F8',
        dark: '#705848',
        steel: '#B8B8D0',
        fairy: '#EE99AC'
    };
    return colores[tipo];//esto ultimo es el color por defecto
}

// funcion para mezclar esos 4 movientos aleatorios del pokemon, se esta usando 
//un algoritmo fisher-yates
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Funciones para los filtros y su control
function aplicarFiltros() {
    const nombreFiltro = document.getElementById('filtroNombre').value.toLowerCase();
    const tipoFiltro = document.getElementById('filtroTipo').value;
    
    // Filtrar la lista completa de Pokémon
    const pokemonFiltrados = todosLosPokemon.filter(pokemon => {
        // Verificar si el Pokémon está en la colección del usuario
        const enColeccion = coleccionPokemon[pokemon.id-1] !== null;
        
        // Aplicar filtro por nombre
        const coincideNombre = pokemon.name.toLowerCase().includes(nombreFiltro);
        
        // Aplicar filtro por tipo
        let coincideTipo = true;
        if (tipoFiltro) {
            coincideTipo = pokemon.types.some(type => type.type.name === tipoFiltro);
        }
        
        return enColeccion && coincideNombre && coincideTipo;
    });
    
    // Renderizar la cuadrícula con los Pokémon filtrados
    renderizarPokemonGrid(pokemonFiltrados);
}

//limpia y solo muestra la lista sin filtros
function limpiarFiltros() {
    document.getElementById('filtroNombre').value = '';
    document.getElementById('filtroTipo').value = '';
    
    // Mostrar solo los Pokémon obtenidos
    const pokemonObtenidos = todosLosPokemon.filter(pokemon => 
        coleccionPokemon[pokemon.id-1] !== null
    );
    
    renderizarPokemonGrid(pokemonObtenidos);
}