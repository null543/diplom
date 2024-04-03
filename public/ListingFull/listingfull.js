// Получаем ID лота из URL
const offerId = window.location.pathname.split('/offer/')[1];
console.log();
console.log(offerId);

// Функция для получения информации о лоте и отображения её на странице
function fetchOfferDetails(offerId) {
    fetch(`https://localhost:7292/api/Listings/${offerId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(offerDetails => {
            // Заполняем элементы страницы информацией из offerDetails
            document.getElementById('brief-description').querySelector('p').textContent = offerDetails.description || 'Краткое описание недоступно';

            // Преобразуем \n в <br> для корректного отображения переносов строк
            const detailedDescription = offerDetails.descriptionFull.replace(/\n/g, '<br>') || 'Подробное описание недоступно';
            document.getElementById('detailed-description').querySelector('p').innerHTML = detailedDescription;
        })
        .catch(error => {
            console.error('Ошибка при получении информации о лоте:', error);
        });
}

// Вызываем функцию fetchOfferDetails, если offerId существует
if(offerId) {
    fetchOfferDetails(offerId);
} else {
    console.error('ID лота не найден в URL');
}
function getUserIDFromToken() {
    const token = localStorage.getItem('token');
    if (token) {
        const decodedToken = jwt_decode(token);
        return decodedToken.nameid; // или другое поле, содержащее userID
    }
    return null;
}
function getBalanceFromToken () {
    const token = localStorage.getItem('token');
    if (token) {
        const decodedToken = jwt_decode(token);
        console.log(decodedToken);
        return decodedToken.balance; // или другое поле, содержащее userID
    }
    return null;
}
document.getElementById('sell-button').addEventListener('click', async function() {
    const offerId = window.location.pathname.split('/offer/')[1];
    const userId = getUserIDFromToken(); // Получаем ID пользователя (покупателя) из JWT токена

    try {
        // Получаем данные лота
        const listingResponse = await fetch(`https://localhost:7292/api/Listings/${offerId}`);
        if (!listingResponse.ok) {
            throw new Error('Не удалось получить данные лота');
        }
        const listing = await listingResponse.json();

        // Получаем данные пользователя (покупателя)
        const userResponse = await fetch(`https://localhost:7292/api/Users/${userId}`);
        if (!userResponse.ok) {
            throw new Error('Не удалось получить данные пользователя');
        }
        const user = await userResponse.json();

        // Проверяем, достаточно ли средств на балансе пользователя
        if (user.balance < listing.price) {
            alert('Недостаточно средств на балансе');
            return;
        }
        if (user.userId == listing.userId){
            alert('Вы не можете купить свой товар');
            return;
        }

        // Создаём заказ
        const orderData = {
            listingId: offerId,
            buyerUserId: userId,
            status: "Открыт",
        };

        const orderResponse = await fetch('https://localhost:7292/api/Orders/PostOrderBuy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        if (!orderResponse.ok) {
            const errorText = await orderResponse.text();
            throw new Error(`Ошибка при создании заказа: ${errorText}`);
        }

        alert('Заказ успешно создан!');
        // Здесь может быть редирект на страницу успешного создания заказа или обновление UI
    } catch (error) {
        console.error('Ошибка:', error);
        alert(`Ошибка: ${error.message}`);
    }
});
