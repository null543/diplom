// Функция для получения информации об игре и списка лотов
// Функция для получения информации об игре и списка лотов
function fetchGameAndListings(gameId) {
    fetch(`https://localhost:7292/api/Games/${gameId}/Listings`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('game-title').textContent = data.title;
            document.getElementById('game-description').textContent = data.gameDescription;

            const listingsContainer = document.getElementById('listings-container');
            listingsContainer.innerHTML = '';

            data.listings.forEach(listing => {
                // Проверка статуса лота
                if (listing.status === "Активно") {
                    const row = document.createElement('tr');
                    row.className = 'cursor-pointer'; // Для указателя при наведении
                    row.addEventListener('click', () => {
                        window.location.href = `/offer/${listing.listingId}`;
                    });

                    const descriptionCell = document.createElement('td');
                    descriptionCell.textContent = listing.description;
                    row.appendChild(descriptionCell);

                    const sellerCell = document.createElement('td');
                    const sellerInfo = document.createElement('div');
                    sellerInfo.className = 'flex items-center';
                    sellerInfo.innerHTML = `
                        <img class="w-10 h-10 rounded-full mr-4" src="${listing.userProfilePhoto || 'https://i.postimg.cc/SsgkZDJk/image.png'}" alt="Аватар">
                        <div class="text-sm">
                            <p class="text-white leading-none">${listing.userNickname}</p>
                            <p class="text-gray-600">${listing.userRating} ★</p>
                        </div>
                    `;
                    sellerCell.appendChild(sellerInfo);
                    row.appendChild(sellerCell);

                    const priceCell = document.createElement('td');
                    priceCell.textContent = `${listing.price} ₽`;
                    row.appendChild(priceCell);

                    listingsContainer.appendChild(row);
                }
            });
        })
        .catch(error => {
            console.error('Ошибка при получении данных:', error);
        });
}



// Получаем gameId из URL
const gameIdParam = window.location.pathname.split('/').pop();
const gameId = gameIdParam || '1';

document.addEventListener('DOMContentLoaded', () => {
    fetchGameAndListings(gameId);
});

// Получаем элемент кнопки по его ID
const sellButton = document.getElementById('sell-button');

// Добавляем обработчик события 'click' на кнопку
sellButton.addEventListener('click', function() {
    // Получаем идентификатор игры из адресной строки
    const gameId = window.location.pathname.split('/').pop();

    // Перенаправляем пользователя на страницу выставления лота с идентификатором игры
    window.location.href = `/uploadoffer/${gameId}`;
});

