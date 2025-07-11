const TOTAL_POKEMON = 150;//total de pokemones en el sobre
let pokemonesMostrados = [];//un array para mostrar los pokemones que salgan del sobre

document.addEventListener('DOMContentLoaded', function() {
    const pokePack = document.getElementById('pokePack');//boton para el sobre
    const pokemonModal = document.getElementById('pokemonModal');//modal para cofirmacion
    const modalPokemonImg = document.getElementById('modalPokemonImg');//modal para las imagenes
    const modalPokemonName = document.getElementById('modalPokemonName');//para los nombres
    const modalPokemonId = document.getElementById('modalPokemonId');//Para las ID
    const closeModal = document.getElementById('closeModal');//para cerrar el modal
    const resetColeccion = document.getElementById('resetColeccion');//Boton para borrar toda la coleccion
    const completarColeccion = document.getElementById('completarColeccion');//Boton para rellenar toda la coleccion
    const contadorColeccion = document.getElementById('contadorColeccion');//Un contador para llevar registro
    const seleccionContainer = document.getElementById('seleccionContainer');//Este y el sigueinte seran algo como variables para el apartado de sobres
    const instruccionSeleccion = document.getElementById('instruccionSeleccion');
    
    // Actualizar contador al cargar
    actualizarContador();
    
    pokePack.addEventListener('click', abrirPokePack);//Evento para abrir el sobre
    closeModal.addEventListener('click', function() {//Para cerrar el modal
        pokemonModal.style.display = 'none';
    });
    
    //evento para borrar coleccion
    resetColeccion.addEventListener('click', function() {
        //algunas confirmaciones
        if(confirm('¿Estás seguro de que quieres borrar toda tu colección?')) {
            localStorage.removeItem('pokemonColeccion');
            alert('Colección borrada correctamente');
            actualizarContador();
        }
    });
    //completar coleccion
    completarColeccion.addEventListener('click', function() {
        //algunas confirmaciones
        if(confirm('¿Estás seguro de que quieres completar toda la colección? Esto agregará todos los Pokémon que te faltan.')) {
            completarTodaLaColeccion();
        }
    });
});
//Actua para aumentar los pokemones que llevamos basado en el total
function actualizarContador() {
    //usando el localStorage para esto
    const coleccionGuardada = localStorage.getItem('pokemonColeccion');
    let coleccion = coleccionGuardada ? JSON.parse(coleccionGuardada) : Array(TOTAL_POKEMON).fill(null);
    const obtenidos = coleccion.filter(p => p !== null).length;//cuenta los no nulos
    //actualizar texto
    document.getElementById('contadorColeccion').textContent = 
        `Pokémon obtenidos: ${obtenidos}/${TOTAL_POKEMON}`;
}

//Una funcion para rellenar por completo la coleccion
async function completarTodaLaColeccion() {
    try {
        //se trata de obtener la coleccion actual
        const coleccionGuardada = localStorage.getItem('pokemonColeccion');
        let coleccion = coleccionGuardada ? JSON.parse(coleccionGuardada) : Array(TOTAL_POKEMON).fill(null);
        
        // Verificar cuántos Pokémon faltan
        const faltantes = coleccion.filter(p => p === null).length;
        
        // Mostrar mensaje de carga
        alert(`Agregando ${faltantes} Pokémon a tu colección... Esto puede tomar un momento.`);
        
        // Crear una colección completa con los Pokémon que ya tenía más los que faltan
        let nuevaColeccion = [];
        //se recorre cada pokemon que se tiene
        for (let i = 1; i <= TOTAL_POKEMON; i++) {
            if (coleccion[i-1]) {
                // Si ya existe en la colección, mantenerlo
                nuevaColeccion[i-1] = coleccion[i-1];
            } else {
                // Si no existe, obtenerlo de la API
                try {
                    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`);
                    const pokemon = await response.json();
                    //la info nesecesaria siendo nombre, id y sprite
                    nuevaColeccion[i-1] = {
                        id: pokemon.id,
                        name: pokemon.name,
                        sprites: {
                            front_default: pokemon.sprites.front_default
                        }
                    };
                } catch (error) {
                    console.error(`Error al obtener Pokémon ${i}:`, error);
                    // Si hay error, dejamos ese espacio como null
                    nuevaColeccion[i-1] = null;
                }
            }
        }
        
        // Guardar la colección completa
        localStorage.setItem('pokemonColeccion', JSON.stringify(nuevaColeccion));
        actualizarContador();
        alert('¡Colección completada con éxito!');
        
    } catch (error) {
        console.error('Error al completar la colección:', error);
        alert('Ocurrió un error al completar la colección. Intenta de nuevo.');
    }
}

//Aqui esta el proceso para abrir un sobre o pack
async function abrirPokePack() {
    try {
        const pokePack = document.getElementById('pokePack');
        const seleccionContainer = document.getElementById('seleccionContainer');
        const instruccionSeleccion = document.getElementById('instruccionSeleccion');
        
        //aqui duerme el click mientras carga el proceso
        pokePack.style.pointerEvents = 'none';
        seleccionContainer.innerHTML = '';
        pokemonesMostrados = [];
        
        // Se consigue la coleccion para sortear a 6
        const coleccionGuardada = localStorage.getItem('pokemonColeccion');
        let coleccion = coleccionGuardada ? JSON.parse(coleccionGuardada) : Array(TOTAL_POKEMON).fill(null);
        
        // Crear array de IDs disponibles (no obtenidos)
        let disponibles = [];
        for (let i = 1; i <= TOTAL_POKEMON; i++) {
            if (!coleccion[i-1]) {
                disponibles.push(i);
            }
        }
        
        // Si no hay suficientes disponibles, mostrar que los tienes a todos
        if (disponibles.length <= 0) {
            alert(`HAS OBTENIDO A TODOS LOS POKEMONES DE ESTA GENERACION`);
            pokePack.style.pointerEvents = 'auto';
            return;
        }
        
        // Mezclar y tomar 6 aleatorios
        disponibles = shuffleArray(disponibles);
        const seleccionIDs = disponibles.slice(0, 6);
        
        // Obtener datos de los 6 Pokémon
        for (const id of seleccionIDs) {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
            const pokemon = await response.json();
            pokemonesMostrados.push(pokemon);
        }
        
        // Mostrar los 6 Pokémon para selección
        mostrarSeleccionPokemon();
        instruccionSeleccion.style.display = 'block';
        seleccionContainer.style.display = 'grid';
        
    } catch (error) {
        console.error('Error al abrir Poképack:', error);
        alert('Ocurrió un error al abrir el Poképack. Intenta de nuevo.');
        document.getElementById('pokePack').style.pointerEvents = 'auto';
    }
}

// Funcion para mostrar los Pokemones del sobre actual
function mostrarSeleccionPokemon() {
    const seleccionContainer = document.getElementById('seleccionContainer');
    seleccionContainer.innerHTML = '';
    
    //Aqui creamos un elemento por pokemon
    pokemonesMostrados.forEach(pokemon => {
        const pokemonElement = document.createElement('div');
        pokemonElement.className = 'pokemon-seleccion';
        pokemonElement.dataset.id = pokemon.id;
        //dibujamos lo que seria la imagen, su id y nombre
        pokemonElement.innerHTML = `
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <p>#${String(pokemon.id).padStart(3, '0')}</p>
            <p>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</p>
        `;
        //Evento para seleccionar pokemon
        pokemonElement.addEventListener('click', function() {
            seleccionarPokemon(pokemon);
        });
        
        seleccionContainer.appendChild(pokemonElement);
    });
}

//Funcion para puentear el gacha a la coleccion
function seleccionarPokemon(pokemon) {
    // Agregar a la colección
    const coleccionGuardada = localStorage.getItem('pokemonColeccion');
    let coleccion = coleccionGuardada ? JSON.parse(coleccionGuardada) : Array(TOTAL_POKEMON).fill(null);
    
    //agregar al pokemon que se haya seleccionado
    coleccion[pokemon.id-1] = {
        id: pokemon.id,
        name: pokemon.name,
        sprites: {
            front_default: pokemon.sprites.front_default
        }
    };
    
    //almacenado en el localstorage
    localStorage.setItem('pokemonColeccion', JSON.stringify(coleccion));
    
    // Mostrar confirmación
    mostrarPokemonObtenido(pokemon);
    actualizarContador();
    
    // Resetear la selección
    document.getElementById('seleccionContainer').style.display = 'none';
    document.getElementById('instruccionSeleccion').style.display = 'none';
    document.getElementById('pokePack').style.pointerEvents = 'auto';
}

//Modal de confirmacion
function mostrarPokemonObtenido(pokemon) {
    const modal = document.getElementById('pokemonModal');
    document.getElementById('modalPokemonImg').src = pokemon.sprites.front_default;
    document.getElementById('modalPokemonImg').alt = pokemon.name;
    document.getElementById('modalPokemonName').textContent = 
        pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
    document.getElementById('modalPokemonId').textContent = pokemon.id;
    modal.style.display = 'flex';
}

// Función para mezclar un array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}