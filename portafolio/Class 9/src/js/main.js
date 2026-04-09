document.getElementById('play').addEventListener('click', function(e) {
    e.preventDefault();

    const items = document.querySelectorAll('.main-menu__nav > li');

    items.forEach(function(li, index) {
        setTimeout(function() {
            li.style.transition = 'transform 0.3s ease-in';
            li.style.transform = 'translateX(1000px)';
        }, index * 200);
    });
});