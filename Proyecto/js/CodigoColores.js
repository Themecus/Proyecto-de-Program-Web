document.addEventListener('DOMContentLoaded', function() {
    const pokePack = document.getElementById('pokePack');
    const delay = 1200; 

    // Cargar color guardado
    const savedColor = localStorage.getItem('pokePackColor');
    if (savedColor) {
        pokePack.style.backgroundColor = savedColor;
    }

    // Cambiar color con delay
    pokePack.addEventListener('click', function() {
        // Agregar clase temporal (efecto visual durante el delay)
        this.classList.add('cambiando');

        // Después del delay, cambiar el color
        setTimeout(() => {
            const randomColor = getRandomColor();
            this.style.backgroundColor = randomColor;
            localStorage.setItem('pokePackColor', randomColor);
            
            // Remover clase temporal
            this.classList.remove('cambiando');
        }, delay);
    });

    // Función para color aleatorio (hexadecimal)
    function getRandomColor() {
        return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
    }
});

