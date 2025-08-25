
const publicKey = 'a4fd49cc95a607824b51a959ed32c0a6';
const baseUrl = 'https://gateway.marvel.com/v1/public/characters';

async function getMarvelCharacters() {
    const response = await fetch('/api/marvel');
    const characters = await response.json();
    return characters;
}

function isValidImage(thumbnail) {
    // Filtra imágenes predeterminadas de Marvel
    return !thumbnail.path.includes('image_not_available');
}

function hasInfo(character) {
    return (
        (character.description && character.description.trim().length > 0) ||
        (character.comics && character.comics.length > 0) ||
        (character.series && character.series.length > 0) ||
        (character.events && character.events.length > 0) ||
        (character.creators && character.creators.length > 0)
    );
}

function createList(title, items) {
    if (!items || items.length === 0) return '';
    return `
    <div class="extra-info">
        <strong>${title}:</strong>
        <ul>
        ${items.slice(0, 5).map(i => `<li>${i}</li>`).join('')}
        </ul>
    </div>
    `;
}

function createCarouselItem(character) {
    const hasImage = isValidImage(character.thumbnail);
    const imageUrl = hasImage
        ? `${character.thumbnail.path}.${character.thumbnail.extension}`
        : 'https://via.placeholder.com/400x600?text=Sin+Imagen';

        const hasData = hasInfo(character);

    return `
    <li class='item' style="background-image: url('${imageUrl}')">
    <div class='content'>
        <h2 class='title'>${character.name}</h2>
        ${
        hasData
            ? `
            <p class='description'>${character.description && character.description.trim().length > 0
                ? character.description
                : 'Sin descripción disponible.'}</p>
        ${createList('Cómics', character.comics)}
        ${createList('Series', character.series)}
        ${createList('Eventos', character.events)}
        ${createList('Creadores', character.creators)}
        `
            : `<p class='description'>Este personaje no dispone de información para mostrar.</p>`
        }
    </div>
    </li>
    `;
}

async function renderCarousel() {
    const slider = document.querySelector('.slider');
    let characters = await getMarvelCharacters();
    // Filtra personajes sin imagen válida y sin información relevante
    characters = characters.filter(c => isValidImage(c.thumbnail) && hasInfo(c));
    // Si no hay suficientes, usa los primeros aunque tengan imagen predeterminada
    if (characters.length < 6) characters = await getMarvelCharacters();

    let html = '';
    characters.forEach((character, idx) => {
        const hasImage = isValidImage(character.thumbnail);
        const imageUrl = hasImage
            ? `${character.thumbnail.path}.${character.thumbnail.extension}`
            : 'https://via.placeholder.com/400x600?text=Sin+Imagen';

        const hasData = hasInfo(character);

        html += `
        <li class="item" style="background-image: url('${imageUrl}'); --item-index: ${idx + 1}">
            <div class='content'>
                <h2 class='title'>${character.name}</h2>
                ${
                hasData
                    ? `
                    <p class='description'>${character.description && character.description.trim().length > 0
                        ? character.description
                        : 'Sin descripción disponible.'}</p>
                    ${createList('Cómics', character.comics)}
                    ${createList('Series', character.series)}
                    ${createList('Eventos', character.events)}
                    ${createList('Creadores', character.creators)}
                    `
                    : `<p class='description'>Este personaje no dispone de información para mostrar.</p>`
                }
            </div>
        </li>
        `;
    });
    slider.innerHTML = html;
}

renderCarousel();

// Lógica del carrusel
document.addEventListener('click', function activate(e) {
    const slider = document.querySelector('.slider');
    const items = document.querySelectorAll('.item');
    if (e.target.matches('.next')) slider.append(items[0]);
    if (e.target.matches('.prev')) slider.prepend(items[items.length-1]);
}, false);

