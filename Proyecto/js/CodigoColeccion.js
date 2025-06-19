const TOTAL_POKEMON = 150;
        let coleccionPokemon = [];
        let todosLosPokemon = []; // Para almacenar todos los datos de los Pokémon

        document.addEventListener('DOMContentLoaded', function() {
            cargarColeccion();
            inicializarColeccionGrid();
            
            // Evento para cerrar modal
            document.getElementById('closeModalDetalles').addEventListener('click', function() {
                document.getElementById('pokemonModalDetalles').style.display = 'none';
            });
            
            // Eventos para los filtros
            document.getElementById('aplicarFiltros').addEventListener('click', aplicarFiltros);
            document.getElementById('limpiarFiltros').addEventListener('click', limpiarFiltros);
            
            // Aplicar filtros al presionar Enter en el campo de nombre
            document.getElementById('filtroNombre').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    aplicarFiltros();
                }
            });
        });

        function cargarColeccion() {
            const coleccionGuardada = localStorage.getItem('pokemonColeccion');
            if (coleccionGuardada) {
                coleccionPokemon = JSON.parse(coleccionGuardada);
            } else {
                coleccionPokemon = Array(TOTAL_POKEMON).fill(null);
            }
            actualizarContador();
        }

        function actualizarContador() {
            const obtenidos = coleccionPokemon.filter(p => p !== null).length;
            document.getElementById('contadorColeccion').textContent = 
                `Pokémon obtenidos: ${obtenidos}/${TOTAL_POKEMON}`;
        }

        async function inicializarColeccionGrid() {
            const coleccionGrid = document.getElementById('coleccionGrid');
            coleccionGrid.innerHTML = '';
            
            // Mostrar mensaje de carga
            coleccionGrid.innerHTML = '<div class="no-resultados">Cargando colección...</div>';
            
            try {
                // Cargar datos de todos los Pokémon
                if (todosLosPokemon.length === 0) {
                    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${TOTAL_POKEMON}`);
                    const data = await response.json();
                    
                    // Obtener detalles de cada Pokémon
                    const pokemonPromises = data.results.map(async (pokemon, index) => {
                        const pokemonResponse = await fetch(pokemon.url);
                        return await pokemonResponse.json();
                    });
                    
                    todosLosPokemon = await Promise.all(pokemonPromises);
                }
                
                // Generar la cuadrícula
                renderizarPokemonGrid(todosLosPokemon);
                
            } catch (error) {
                console.error('Error al cargar los Pokémon:', error);
                coleccionGrid.innerHTML = '<div class="no-resultados">Error al cargar la colección. Intenta recargar la página.</div>';
            }
        }
        
        function renderizarPokemonGrid(pokemonList) {
            const coleccionGrid = document.getElementById('coleccionGrid');
            coleccionGrid.innerHTML = '';
            
            if (pokemonList.length === 0) {
                coleccionGrid.innerHTML = '<div class="no-resultados">No se encontraron Pokémon que coincidan con los filtros.</div>';
                return;
            }
            
            pokemonList.forEach(pokemon => {
                const pokemonId = pokemon.id;
                const pokemonCell = document.createElement('div');
                pokemonCell.className = 'pokemon-cell';
                pokemonCell.dataset.pokemonId = pokemonId;
                
                const pokemonData = coleccionPokemon[pokemonId-1];
                
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
                } else {
                    pokemonCell.innerHTML = `
                        <div class="placeholder">?</div>
                        <p>#${String(pokemonId).padStart(3, '0')}</p>
                    `;
                }
                
                coleccionGrid.appendChild(pokemonCell);
            });
        }

        async function mostrarDetallesPokemon(pokemonData) {
            try {
                // Mostrar información básica
                document.getElementById('modalPokemonNombre').textContent = 
                    pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1);
                document.getElementById('modalPokemonImagen').src = pokemonData.sprites.front_default;
                document.getElementById('modalPokemonImagen').alt = pokemonData.name;
                document.getElementById('modalPokemonId').textContent = pokemonData.id;
                
                // Mostrar tipos con color de fondo
                const tiposContainer = document.getElementById('modalTiposContainer');
                tiposContainer.innerHTML = '';
                pokemonData.types.forEach(type => {
                    const tipoElement = document.createElement('span');
                    tipoElement.className = 'pokemon-tipo';
                    tipoElement.textContent = type.type.name;
                    tipoElement.style.backgroundColor = getColorPorTipo(type.type.name);
                    tiposContainer.appendChild(tipoElement);
                });
                
                // Mostrar estadísticas simples
                const statsContainer = document.getElementById('modalStatsContainer');
                statsContainer.innerHTML = '<h3>Estadísticas</h3>';
                pokemonData.stats.forEach(stat => {
                    const statElement = document.createElement('div');
                    statElement.className = 'pokemon-stat';
                    statElement.textContent = 
                        `${stat.stat.name.replace('-', ' ')}: ${stat.base_stat}`;
                    statsContainer.appendChild(statElement);
                });
                
                // Mostrar 4 movimientos aleatorios
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

        // Función para obtener colores según el tipo de Pokémon (para fondo)
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
            return colores[tipo] || '#777';
        }

        // Función para mezclar un array (Fisher-Yates)
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }
        
        // Funciones para los filtros
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
        
        function limpiarFiltros() {
            document.getElementById('filtroNombre').value = '';
            document.getElementById('filtroTipo').value = '';
            
            // Mostrar solo los Pokémon obtenidos
            const pokemonObtenidos = todosLosPokemon.filter(pokemon => 
                coleccionPokemon[pokemon.id-1] !== null
            );
            
            renderizarPokemonGrid(pokemonObtenidos);
        }