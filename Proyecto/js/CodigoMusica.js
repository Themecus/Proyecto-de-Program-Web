const musicBtn = document.getElementById("play");
const bgMusic = document.getElementById("audioBox");
let isPlaying = false;

// Activar y desactivar el audio junto algunos carteles
musicBtn.addEventListener("click", function() {
    if (isPlaying) {
        bgMusic.pause();
        musicBtn.textContent = "REPRODUCIR MUSICA";
    } else {
        bgMusic.play();
        musicBtn.textContent = "PAUSAR";
    }
    isPlaying = !isPlaying;
});

//  Ajueste de volumen (0.0 a 1.0)
bgMusic.volume = 1.0;