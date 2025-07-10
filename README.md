El propósito de este proyecto es el de actuar como una colección de cartas de la primera generación de la franquicia de Pokémon, imitando el abrir sobres, elegir un Pokémon, guardarlo en la coleccion e intercambiarlos con otros. Explicación de cada archivo y función: La carpeta gacha almacena el HTML y el CSS donde se abrirán los sobres, la carpeta intercambiar almacena el HTML y CSS del apartado de intercambiar cartas, shared almacena CSS y JS varios, ya sea para eventos de los html anteriores como funciones específicas, también almacena la música de cada HTML, el gitignore estándar y el HTML que activa a toda la página.

Las tecnologías usadas para este fueron varias: La primera fue VCSCODE para la programación de cada parte del programa (HTML, CSS, JS), se usó la extensión de “Live Server” para ir haciendo pruebas con la página, el uso de GitHub para almacenar las mejoras y cambios que se fueron haciendo de a poco, se utilizó la API de PokéAPI para conseguir la información relevante para los 150 pokemones que serán almacenados en su localStorage, se usó de GitHud page para el montaje oficial de la página web sin tener que depender de Live Server y por ultimo para la parte del intercambio de cartas se usó el webSocket de Ably que es un servidor virtual, que está disponible las 24 horas del día, para así comunicar dos dispositivos para simular un intercambio de cartas de un lado al otro.

Para ejecutar el proyecto existe 2 formas, usando la extensión de “Live Server” o dándole click a este link https://themecus.github.io/Proyecto-de-Program-Web/ montado en GitHud pages.

A la hora de crear la distribución de carpetas se hizo con el propósito de que a la hora de montarlo en GitHud pages, tomara el primer HTML que viera para activar toda la página.




