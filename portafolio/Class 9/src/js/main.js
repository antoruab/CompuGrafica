document.getElementById('play').addEventListener('click', function (e) {
    e.preventDefault();

    const items = document.querySelectorAll('.main-menu__nav > li');

    items.forEach(function (li, index) {
        setTimeout(function () {
            li.style.transition = 'transform 0.3s ease-in';
            li.style.transform = 'translateX(1000px)';
        }, index * 200);
    });
});

// AUDIO play
window.addEventListener('load', function () {
    var audio = document.getElementById('miAudio');
    var reproducir = function () {
        audio.play().then(function () {
            document.removeEventListener('click', reproducir);
            document.removeEventListener('keydown', reproducir);
        }).catch(function (error) {
            console.log("Esperando interacción real...");
        });
    };

    // Escuchar clics o teclas (las interacciones que sí valen)
    document.addEventListener('click', reproducir);
    document.addEventListener('keydown', reproducir);
});