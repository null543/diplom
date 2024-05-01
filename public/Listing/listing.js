// Функция для создания HTML-элемента для каждой игры
// Функция для создания HTML-элемента для каждой игры
function createGameElement(game) {
    const gameDiv = document.createElement('div');
    gameDiv.className = 'p-4 md:w-1/2 lg:w-1/3 listing-card';
    // Установка атрибута data-game-id для хранения идентификатора игры
    gameDiv.setAttribute('data-game-id', game.gameId);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'h-full bg-gray-800 bg-opacity-40 p-6 rounded-lg flex flex-col';
    gameDiv.appendChild(contentDiv);

    if (game.imageURL) {
        const image = document.createElement('img');
        image.src = game.imageURL;
        image.alt = game.title;
        image.className = 'object-cover object-center w-full h-48 mb-4';
        contentDiv.appendChild(image);
    }

    const title = document.createElement('h2');
    title.className = 'hover:text-white text-white title-font text-lg font-medium mb-2';
    title.textContent = game.title;
    contentDiv.appendChild(title);

    const description = document.createElement('p');
    description.className = 'text-base mb-3 flex-grow';
    description.textContent = game.description;
    contentDiv.appendChild(description);

     gameDiv.addEventListener('click', function() {
        // Получаем gameId из атрибута data-game-id
        const gameId = this.getAttribute('data-game-id');
        // Переход на страницу с информацией об игре
        window.location.href = `/Game/gameinfo/${gameId}`;
    });

    return gameDiv;


}


// Функция для загрузки и отображения списка игр
function fetchGames() {
    fetch('https://localhost:7292/api/Games', {
        method: 'GET'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(games => {
        const gamesContainer = document.getElementById('listings-container');
        gamesContainer.innerHTML = '';

        if (games && games.length > 0) {
            games.forEach(game => {
                const gameElement = createGameElement(game);
                gamesContainer.appendChild(gameElement);
            });
        } else {
            gamesContainer.textContent = 'Игры отсутствуют';
        }
    })
    .catch(error => {
        console.error('Ошибка при получении списка игр:', error);
    });
}
// Функция для поиска по играм
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const listings = document.querySelectorAll('.listing-card');

        listings.forEach(listing => {
            const title = listing.querySelector('h2').textContent.toLowerCase();
            const isVisible = title.includes(searchTerm);
            listing.style.display = isVisible ? 'block' : 'none';
        });
    });
}
// Вызываем функции при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    fetchGames();
    setupSearch();
});

document.addEventListener('click', function(e) {
    if (e.target.closest('.listing-card')) {
        const gameId = e.target.closest('.listing-card').getAttribute('data-game-id');
        console.log('Идентификатор игры:', gameId);
    }
});
