const VOLUME_KEY = 'cg_volume';
const SONG_KEY   = 'cg_song';
const BGCOLOR_KEY = 'cg_bgcolor';

const savedVolume  = localStorage.getItem(VOLUME_KEY)  ?? '80';
const savedSong    = localStorage.getItem(SONG_KEY)    ?? '../src/sounds/intro.mp3';
const savedBgColor = localStorage.getItem(BGCOLOR_KEY) ?? '#7BD0F7';

const audio3 = document.getElementById('myAudio3');

window.addEventListener('load', () => {
    audio3.volume = savedVolume / 100;
    audio3.src = savedSong;
    audio3.play().catch(() => {
        const resume = () => { audio3.play(); document.removeEventListener('click', resume); };
        document.addEventListener('click', resume);
    });
});

const volumeSlider = document.getElementById('volumeSlider');
const volLabel     = document.getElementById('volLabel');

volumeSlider.value = savedVolume;
volLabel.textContent = savedVolume + '%';

volumeSlider.addEventListener('input', () => {
    const v = volumeSlider.value;
    volLabel.textContent = v + '%';
    localStorage.setItem(VOLUME_KEY, v);
    document.querySelectorAll('audio').forEach(a => a.volume = v / 100);
});

const songBtns = document.querySelectorAll('.song-btn');

songBtns.forEach(btn => {
    if (btn.dataset.src === savedSong) btn.classList.add('active');
    else btn.classList.remove('active');

    btn.addEventListener('click', () => {
        songBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const src = btn.dataset.src;
        localStorage.setItem(SONG_KEY, src);
        audio3.src = src;
        audio3.play();
    });
});
const swatches      = document.querySelectorAll('.swatch');
const customColor   = document.getElementById('customColor');
const bgColorLabel  = document.getElementById('bgColorLabel');

customColor.value = savedBgColor;
bgColorLabel.textContent = savedBgColor;

swatches.forEach(sw => {
    if (sw.dataset.color === savedBgColor) sw.classList.add('active');
    else sw.classList.remove('active');

    sw.addEventListener('click', () => {
        swatches.forEach(s => s.classList.remove('active'));
        sw.classList.add('active');
        const color = sw.dataset.color;
        customColor.value = color;
        bgColorLabel.textContent = color;
        localStorage.setItem(BGCOLOR_KEY, color);
    });
});

customColor.addEventListener('input', () => {
    const color = customColor.value;
    bgColorLabel.textContent = color;
    swatches.forEach(s => s.classList.remove('active'));
    localStorage.setItem(BGCOLOR_KEY, color);
});