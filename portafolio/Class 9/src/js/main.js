document.getElementById('play').addEventListener('click', function (e) {
    e.preventDefault();

    const items = document.querySelectorAll('.main-menu__nav > li');
    const destino = this.getAttribute('href');

    items.forEach(function (li, index) {
        setTimeout(function () {
            li.style.transition = 'transform 0.3s ease-in';
            li.style.transform = 'translateX(1000px)';
        }, index * 200);
    });

    const tiempoTotal = (items.length - 1) * 200 + 300;
    setTimeout(function () {
        window.location.href = destino;
    }, tiempoTotal);
});

document.getElementById('characters').addEventListener('click', function (e) {
    e.preventDefault();

    const items = document.querySelectorAll('.main-menu__nav > li');
    const destino = this.getAttribute('href');

    items.forEach(function (li, index) {
        setTimeout(function () {
            li.style.transition = 'transform 0.3s ease-in';
            li.style.transform = 'translateX(1000px)';
        }, index * 200);
    });

    const tiempoTotal = (items.length - 1) * 200 + 300;
    setTimeout(function () {
        window.location.href = destino;
    }, tiempoTotal);
});

document.getElementById('settings').addEventListener('click', function (e) {
    e.preventDefault();

    const items = document.querySelectorAll('.main-menu__nav > li');
    const destino = this.getAttribute('href');

    items.forEach(function (li, index) {
        setTimeout(function () {
            li.style.transition = 'transform 0.3s ease-in';
            li.style.transform = 'translateX(1000px)';
        }, index * 200);
    });

    const tiempoTotal = (items.length - 1) * 200 + 300;
    setTimeout(function () {
        window.location.href = destino;
    }, tiempoTotal);
});


// Audio
window.addEventListener('load', function () {
    var audio = document.getElementById('myAudio');
    var reproducir = function () {
        audio.play().then(function () {
            document.removeEventListener('click', reproducir);
            document.removeEventListener('keydown', reproducir);
        }).catch(function () {
            console.log("Esperando interacción real...");
        });
    };
    document.addEventListener('click', reproducir);
    document.addEventListener('keydown', reproducir);
});