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

function mostrarNotificacion(mensaje) {
  document.getElementById('mensajeNotificacion').textContent = mensaje;
  document.getElementById('notificacionPokemon').style.display = 'block';
}

function cerrarNotificacion() {
  document.getElementById('notificacionPokemon').style.display = 'none';
}

//  Mostrar solo las cartas desbloqueadas
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
  if (cartasSeleccionadas.length === 0 || propuestaRecibida.length === 0) {
    mostrarNotificacion('Asegúrate de que ambos jugadores hayan seleccionado cartas.');
    return;
  }

  // ✅ Validar solo lo que tú vas a recibir
  const duplicadasRecibidas = propuestaRecibida.filter(id => {
    const yaTengo = coleccionPokemon[id - 1];
    return yaTengo !== null;
  });

  if (duplicadasRecibidas.length > 0) {
    mostrarNotificacion(' Intercambio cancelado:\nYa tienes alguna de las cartas que te están enviando (#' + duplicadasRecibidas.join(', ') + ')');
    return;
  }

  // ✅ Si todo ok, enviamos intercambio
  canal.publish('intercambio-confirmado', {
    from: userId,
    enviar: cartasSeleccionadas,
    recibir: propuestaRecibida
  });

  mostrarNotificacion('¡Intercambio enviado!');
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

          if (cartasPendientes === 0) {
            localStorage.setItem('pokemonColeccion', JSON.stringify(coleccion));

            setTimeout(() => {
              cargarColeccion();
              mostrarCartasDesbloqueadas();

              // ✅ Vacía bandeja y estado al finalizar intercambio
              document.getElementById('cartasRecibidas').innerHTML = '';
              propuestaRecibida = [];
              actualizarEstadoBoton();
            }, 300);

            if (nuevasCartas.length > 0) {
              mostrarNotificacion('¡Tu colección fue actualizada con cartas del intercambio!');
            }
          }
        });
    }
  });

  // Si todas las cartas ya estaban en la colección
  if (cartasPendientes === 0 && nuevasCartas.length === 0) {
    setTimeout(() => {
      mostrarCartasDesbloqueadas();

      // ✅ También vaciar si no hubo nuevas cartas
      document.getElementById('cartasRecibidas').innerHTML = '';
      propuestaRecibida = [];
      actualizarEstadoBoton();
    }, 300);

    mostrarNotificacion('¡No recibiste cartas nuevas, pero se refrescó la colección!');
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
