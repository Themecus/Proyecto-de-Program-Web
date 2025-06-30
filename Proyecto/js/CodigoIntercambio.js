const socket = io();
console.log("¿Socket creado?", socket);
const TOTAL_POKEMON = 151;
let coleccionPokemon = [];
let cartasSeleccionadas = [];

document.addEventListener('DOMContentLoaded', () => {
  cargarColeccion();
  inicializarIntercambioGrid();
});

function cargarColeccion() {
  const guardada = localStorage.getItem('pokemonColeccion');
  if (guardada) {
    coleccionPokemon = JSON.parse(guardada);
  } else {
    coleccionPokemon = Array(TOTAL_POKEMON).fill(null);
  }
}

function inicializarIntercambioGrid() {
  //para hacer prueba
  console.log("Inicializando grid con", coleccionPokemon.filter(p => p !== null).length, "Pokémon");
  //
  const grid = document.getElementById('intercambioGrid');
  grid.innerHTML = '';

  for (let i = 0; i < coleccionPokemon.length; i++) {
    const poke = coleccionPokemon[i];
    if (poke) {
      const cell = document.createElement('div');
      cell.className = 'pokemon-cell obtenido';
      cell.dataset.pokemonId = poke.id;
      cell.innerHTML = `
        <img src="${poke.sprites.front_default}" alt="${poke.name}">
        <p>#${String(poke.id).padStart(3, '0')}</p>
      `;
      grid.appendChild(cell);
    }
  }

  activarSeleccionDeCartas();
}

function activarSeleccionDeCartas() {
  const cartas = document.querySelectorAll('#intercambioGrid .pokemon-cell.obtenido');

  cartas.forEach(carta => {
    carta.addEventListener('click', function () {
      const id = this.dataset.pokemonId;

      if (cartasSeleccionadas.includes(id)) {
        cartasSeleccionadas = cartasSeleccionadas.filter(c => c !== id);
        this.classList.remove('seleccionada');
      } else if (cartasSeleccionadas.length < 6) {
        cartasSeleccionadas.push(id);
        this.classList.add('seleccionada');
      }

      socket.emit('propuesta-intercambio', { cartas: cartasSeleccionadas });
    });
  });
}

function confirmarEntrega() {
  if (cartasSeleccionadas.length === 0) {
    alert('No hay cartas que enviar');
    return;
  }

  socket.emit('intercambio-confirmado', { cartas: cartasSeleccionadas });
  cartasSeleccionadas = [];
  document.querySelectorAll('.seleccionada').forEach(c => c.classList.remove('seleccionada'));
}

socket.on('propuesta-recibida', data => {
  const contenedor = document.getElementById('cartasRecibidas');
  contenedor.innerHTML = '';

  data.cartas.forEach(id => {
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
      .then(res => res.json())
      .then(pokemon => {
        const carta = document.createElement('div');
        carta.className = 'pokemon-cell obtenido';
        carta.innerHTML = `
          <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
          <p>#${String(pokemon.id).padStart(3, '0')}</p>
        `;
        contenedor.appendChild(carta);
      });
  });
});

socket.on('intercambio-recibido', data => {
  let nuevas = 0;

  data.cartas.forEach(id => {
    const yaLoTengo = coleccionPokemon.some(p => p && p.id == id);
    if (!yaLoTengo) {
      fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
        .then(res => res.json())
        .then(pokemon => {
          for (let i = 0; i < coleccionPokemon.length; i++) {
            if (!coleccionPokemon[i]) {
              coleccionPokemon[i] = {
                id: pokemon.id,
                name: pokemon.name,
                sprites: { front_default: pokemon.sprites.front_default }
              };
              nuevas++;
              break;
            }
          }
          guardarColeccion();
          inicializarIntercambioGrid(); // Opcional: mostrar nuevas en intercambio también
        });
    }
  });

  setTimeout(() => {
    alert(nuevas > 0
      ? `¡Has recibido ${nuevas} nuevo(s) Pokémon por intercambio!`
      : 'Todos los Pokémon recibidos ya estaban en tu colección.');
  }, 1000);
});

function guardarColeccion() {
  localStorage.setItem('pokemonColeccion', JSON.stringify(coleccionPokemon));
}