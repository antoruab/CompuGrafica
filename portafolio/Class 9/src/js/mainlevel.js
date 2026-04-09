// AUDIO play
window.addEventListener('load', function() {
    var audio = document.getElementById('miAudio2');
    var reproducir = function() {
        audio.play().then(function() {
            document.removeEventListener('click', reproducir);
            document.removeEventListener('keydown', reproducir);
        }).catch(function(error) {
            console.log("Esperando interacción real...");
        });
    };

    // Escuchar clics o teclas (las interacciones que sí valen)
    document.addEventListener('click', reproducir);
    document.addEventListener('keydown', reproducir);
});