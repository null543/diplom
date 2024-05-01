let ToUserIDService;
let FromUserIDService;
let ChatIDService;
const offerId = window.location.pathname.split('/offer/')[1];
const userId = 0;
console.log();
console.log(offerId);

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
        // Получаем ID созданного заказа из ответа API
        const order = await orderResponse.json();
        console.log(order);
        const orderId = order.orderId; // Убедитесь, что это имя свойства совпадает с тем, что возвращает ваш API
        console.log(orderId);
        alert('Заказ успешно создан!');
        sendPaymentNotification(orderId)
        
        // Здесь может быть редирект на страницу успешного создания заказа или обновление UI
    } catch (error) {
        console.error('Ошибка:', error);
        alert(`Ошибка: ${error.message}`);
    }
});

function updateListingPriceOnPage(offerId, newPrice) {
    fetch(`https://localhost:7292/api/Listings/${offerId}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.price !== newPrice) {
                data.price = newPrice;
                document.getElementById('listing-price').textContent = `Цена: ${newPrice} руб.`;
            }
        })
        .catch(error => console.error('Не удалось обновить цену лота:', error));
}

document.getElementById('send-button').addEventListener('click', async function() {
    const offerId = window.location.pathname.split('/offer/')[1];
    const userId = getUserIDFromToken(); // Получаем ID текущего пользователя из JWT токена
    const messageText = document.getElementById('message-input').value; // Получаем текст сообщения из <input>

    try {
        // Получаем данные о лоте
        const response = await fetch(`https://localhost:7292/api/Listings/${offerId}`);
        if (!response.ok) {
            throw new Error('Не удалось получить данные о лоте');
        }
        const listing = await response.json();

        // Отправляем сообщение
        const messageData = {
            fromUserId: userId,
            toUserId: listing.userId, // Используем userId продавца лота как toUserId
            messageText: messageText, // Используем текст сообщения из <input>
            dateSent: new Date().toISOString() // Используем текущую дату и время
        };

        const messageResponse = await fetch('https://localhost:7292/api/Chats/MessagePost', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(messageData)
        });

        if (!messageResponse.ok) {
            const errorText = await messageResponse.text();
            throw new Error(`Ошибка при отправке сообщения: ${errorText}`);
        }

        alert('Сообщение успешно отправлено!');
        // Очищаем <input> после отправки сообщения
        document.getElementById('message-input').value = '';
        // Здесь можно добавить код для обновления интерфейса или выполнить другие действия после отправки сообщения
    } catch (error) {
        console.error('Ошибка:', error);
        alert(`Ошибка: ${error.message}`);
    }
});

async function sendPaymentNotification(orderId) {
    try {
        // Получаем данные заказа
        const orderResponse = await fetch(`https://localhost:7292/api/Orders/${orderId}`);
        if (!orderResponse.ok) {
            throw new Error('Не удалось получить данные заказа');
        }
        const order = await orderResponse.json();

        // Получаем ID продавца и покупателя из заказа
        const buyerId = order.buyerUserId;
        const sellerId = order.sellerUserId;

        // Получаем ID продавца или покупателя в зависимости от того, кто должен получить уведомление
        const recipientId = sellerId; // или buyerId, если нужно уведомить покупателя

        const messageText = `Заказ №${orderId} был успешно оплачен. Сумма заказа: ${order.sumOrder}`;

        // Отправляем системное сообщение
        const data = {
            ChatID: 8,
            FromUserID: 1, // ID системного пользователя или null, если отправляется системное уведомление
            ToUserID: recipientId,
            MessageText: messageText,
        };

        const response = await fetch('https://localhost:7292/api/Chats/SystemMessagePost', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Ошибка при отправке системного сообщения');
        }

        console.log('Системное сообщение успешно отправлено');
    } catch (error) {
        console.error('Ошибка при отправке уведомления о платеже:', error);
    }
}
