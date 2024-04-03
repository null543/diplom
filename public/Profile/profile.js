function getUserIdFromUrl() {
    const pathArray = window.location.pathname.split('/');
    const userId = pathArray[pathArray.length - 1];
    return userId && !isNaN(userId) ? userId : null;
}

function getUserIDFromToken() {
    const token = localStorage.getItem('token');
    if (token) {
        const decodedToken = jwt_decode(token);
        return decodedToken.nameid; // или другое поле, содержащее userID
    }
    return null;
}

function fetchProfileData() {
    let userId = getUserIdFromUrl();

    if (!userId) {
        userId = getUserIDFromToken();
        console.log(`UserID из токена: ${userId}`);
    } else {
        console.log(`UserID из URL: ${userId}`);
    }

    if (userId) {
        const url = `https://localhost:7292/api/Users/${userId}`;
        console.log(`Запрос к URL: ${url}`);

        fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('user-nickname').textContent = data.nickname || 'Неизвестный пользователь';
            document.getElementById('user-rating').textContent = `Рейтинг: ${data.rating} ★`;
            document.getElementById('user-registration-date').textContent = `Дата регистрации: ${new Date(data.registrationDate).toLocaleDateString()}`;
            document.getElementById('user-avatar').src = data.profilePhoto || 'https://i.postimg.cc/SsgkZDJk/image.png';
        })
        .catch(error => {
            console.error('Error:', error);
        });
    } else {
        console.error('UserID не найден');
    }
}
function fetchAndDisplayListings() {
    // ID пользователя из URL
    const profileUserId = window.location.pathname.split('/Profile/')[1];
  
    // ID пользователя из JWT токена
    const userIdFromToken = getUserIDFromToken();
  
    // Флаг, показывающий, является ли это профиль текущего пользователя
    const isCurrentUserProfile = profileUserId === userIdFromToken;
  
    // Получаем данные лотов пользователя
    fetch(`https://localhost:7292/api/Listings/ByUserId?userId=${profileUserId}`)
      .then(response => response.json())
      .then(listings => {
        // Группируем лоты по названию игры
        const listingsByGame = listings.reduce((acc, listing) => {
          acc[listing.gameTitle] = acc[listing.gameTitle] || [];
          acc[listing.gameTitle].push(listing);
          return acc;
        }, {});
  
        // Создаем карточки для каждой игры
        const listingsContainer = document.getElementById('listings-container'); // Родительский контейнер для карточек
        listingsContainer.innerHTML = ''; // Очищаем предыдущие карточки
  
        for (const game in listingsByGame) {
          const card = createCard(game, listingsByGame[game], isCurrentUserProfile);
          listingsContainer.appendChild(card);
        }
      })
      .catch(error => {
        console.error('Ошибка при получении данных:', error);
      });
  }
  
  function createCard(gameTitle, listings, isCurrentUserProfile) {
    // Создаем карточку для игры
    const card = document.createElement('div');
    card.className = 'card-container';
  
    // Заголовок карточки с названием игры
    const header = document.createElement('div');
    header.className = 'card-header';
  
    const title = document.createElement('h3');
    title.textContent = gameTitle;
  
    // Кнопка "Изменить" видна только если это профиль текущего пользователя
    const editButton = document.createElement('a');
    editButton.href = '#';
    editButton.className = 'edit-button';
    editButton.textContent = 'Изменить';
    editButton.style.display = isCurrentUserProfile ? 'block' : 'none';
  
    header.appendChild(title);
    header.appendChild(editButton);
  
    // Таблица для лотов
    const table = document.createElement('table');
    table.className = 'lots-table';
  
    // Заголовок таблицы
    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    const thDesc = document.createElement('th');
    thDesc.textContent = 'Описание';
    const thPrice = document.createElement('th');
    thPrice.textContent = 'Цена';
    trHead.appendChild(thDesc);
    trHead.appendChild(thPrice);
    thead.appendChild(trHead);
  
    // Тело таблицы
    const tbody = document.createElement('tbody');
  
    // Создаем строки для каждого лота
    listings.forEach(listing => {
      const tr = document.createElement('tr');
      const tdDesc = document.createElement('td');
      tdDesc.textContent = listing.description;
      console.log(listing.description);

  
      const tdPrice = document.createElement('td');
      tdPrice.textContent = `${listing.price} ₽`;
      tdPrice.style.color = listing.status === "Неактивно" ? 'red' : ''; // Если лот неактивен, окрашиваем цену в красный
  
      tr.appendChild(tdDesc);
      tr.appendChild(tdPrice);
      tbody.appendChild(tr);
    });
  
    // Сборка таблицы
    table.appendChild(thead);
    table.appendChild(tbody);
  
    // Сборка карточки
    card.appendChild(header);
    card.appendChild(table);
  
    return card;
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    fetchProfileData();
    fetchAndDisplayListings();
    
  });

