// 🔐 Identificador único por navegador
const userId = Math.random().toString(36).substring(2, 10);

// 📡 Conexión a Ably
const ably = new Ably.Realtime('uy8u-A.02rvVw:ngiJYYDCz76bRPehULzgg5uXqxwMYkWp5aFjZjVe-pc');
const canal = ably.channels.get('intercambio-pokemon');

// ⚙️ Variables del sistema
const TOTAL_POKEMON = 151;
let coleccionPokemon = [];
let cartasSeleccionadas = [];
let propuestaRecibida = []; // Cartas que el otro usuario te propone

document.addEventListener('DOMContentLoaded', () => {
  cargarColeccion();
  mostrarCartasDesbloqueadas();
});

// 💾 Leer la colección desde localStorage
function cargarColeccion() {
  const guardada = localStorage.getItem('pokemonColeccion');
  coleccionPokemon = guardada ? JSON.parse(guardada) : Array(TOTAL_POKEMON).fill(null);
}

function actualizarEstadoBoton() {
  const boton = document.querySelector('.boton-enviar');

  const tieneCartasPropias = cartasSeleccionadas.length > 0;
  const tieneCartasRecibidas = propuestaRecibida.length > 0;

  boton.disabled = !(tieneCartasPropias && tieneCartasRecibidas);
}

// 🎴 Mostrar solo las cartas desbloqueadas
function mostrarCartasDesbloqueadas() {
  const grid = document.getElementById('intercambioGrid');
  grid.innerHTML = '';
  cartasSeleccionadas = [];

  coleccionPokemon.forEach(pokemon => {
    if (pokemon) {
      const carta = document.createElement('div');
      carta.className = 'pokemon-cell obtenido';
      carta.dataset.pokemonId = pokemon.id;
      carta.innerHTML = `
        <img src="${pokemon.sprites.front_default}" alt="Pokémon">
        <p>#${String(pokemon.id).padStart(3, '0')}</p>
      `;

      carta.addEventListener('click', function () {
        const id = this.dataset.pokemonId;

        if (cartasSeleccionadas.includes(id)) {
          // ❌ Deseleccionar
          cartasSeleccionadas = cartasSeleccionadas.filter(c => c !== id);
          this.classList.remove('seleccionada');
        } else if (cartasSeleccionadas.length < 6) {
          // ✅ Seleccionar
          cartasSeleccionadas.push(id);
          this.classList.add('seleccionada');
        }

        // 📡 Enviar propuesta solo si hay alguna carta seleccionada
        canal.publish('propuesta-intercambio', {
          from: userId,
          cartas: cartasSeleccionadas
        });
        actualizarEstadoBoton();
      });

      grid.appendChild(carta);
    }
  });
}


function confirmarEntrega() {
  // Solo confirmar si tienes una propuesta recibida
  if (cartasSeleccionadas.length === 0 || propuestaRecibida.length === 0) {
    alert('Asegúrate de haber seleccionado tus cartas y que el otro jugador también lo haya hecho.');
    return;
  }

  canal.publish('intercambio-confirmado', {
    from: userId,
    enviar: cartasSeleccionadas,
    recibir: propuestaRecibida
  });

  alert('¡Intercambio enviado!');
}

canal.subscribe('intercambio-confirmado', mensaje => {
  const soyRemitente = mensaje.data.from === userId;
  const cartasEntrantes = soyRemitente ? mensaje.data.recibir : mensaje.data.enviar;

  const coleccionGuardada = localStorage.getItem('pokemonColeccion');
  let coleccion = coleccionGuardada ? JSON.parse(coleccionGuardada) : Array(TOTAL_POKEMON).fill(null);

  let cartasPendientes = 0;
  let nuevasCartas = [];

  cartasEntrantes.forEach(id => {
    const yaExiste = coleccion[id - 1];
    if (!yaExiste) {
      cartasPendientes++;
      nuevasCartas.push(id);

      fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
        .then(res => res.json())
        .then(pokemon => {
          coleccion[id - 1] = {
            id: pokemon.id,
            name: pokemon.name,
            sprites: { front_default: pokemon.sprites.front_default }
          };

          cartasPendientes--;

          // Si ya se procesaron todas las nuevas cartas
          if (cartasPendientes === 0) {
            localStorage.setItem('pokemonColeccion', JSON.stringify(coleccion));

            setTimeout(() => {
              mostrarCartasDesbloqueadas(); // ✅ Actualiza grilla visual
            }, 300);

            if (nuevasCartas.length > 0) {
              alert('¡Tu colección fue actualizada con cartas del intercambio!');
            }
          }
        });
    }
  });

  // Si todas las cartas ya estaban en la colección
  if (cartasPendientes === 0 && nuevasCartas.length === 0) {
    setTimeout(() => {
      mostrarCartasDesbloqueadas();
    }, 300);

    alert('¡No recibiste cartas nuevas, pero se refrescó la colección!');
  }
});




canal.subscribe('propuesta-intercambio', mensaje => {
  if (mensaje.data.from === userId) return;

  propuestaRecibida = mensaje.data.cartas; // Guarda lo que el otro usuario propuso
  actualizarEstadoBoton(); // 💡 Revisa estado del botón

  const contenedor = document.getElementById('cartasRecibidas');
  contenedor.innerHTML = '';

  mensaje.data.cartas.forEach(id => {
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