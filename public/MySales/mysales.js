function getUserIDFromToken() {
    const token = localStorage.getItem('token');
    if (token) {
        const decodedToken = jwt_decode(token);
        return decodedToken.nameid; // или другое поле, содержащее userID
    }
    return null;
}
function formatDate(dateString) {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    const hours = dateString.substring(8, 10);
    const minutes = dateString.substring(10, 12);
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  }
// Функция для получения заказов пользователя и отображения их в таблице
async function fetchAndDisplayOrders() {
    try {
        const token = localStorage.getItem('token');
        console.log(token);

        // Отправляем запрос к серверу Node.js
        const response = await fetch('http://localhost:5000/api/orders', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        // Проверяем успешность запроса
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Получаем данные от сервера Node.js
        const orders = await response.json();

        // Изменение порядка сортировки
        orders.sort((a, b) => parseInt(b.purchaseDate) - parseInt(a.purchaseDate));

        // Отображаем данные в таблице
        const ordersContainer = document.getElementById('orders-container');
        ordersContainer.innerHTML = '';

        orders.forEach(order => {
            // Создаем строки таблицы и добавляем их в контейнер
            const row = document.createElement('tr');
            row.className = 'cursor-pointer';
            row.addEventListener('click', () => {
                window.location.href = `/orders/${order.orderId}`;
            });

            const dateCell = document.createElement('td');
            dateCell.textContent = formatDate(order.purchaseDate);

            const orderIdCell = document.createElement('td');
            orderIdCell.textContent = order.orderId;

            const descriptionCell = document.createElement('td');
            descriptionCell.textContent = order.description;

            const buyerCell = document.createElement('td');
            buyerCell.textContent = order.buyer;

            const statusCell = document.createElement('td');
            statusCell.textContent = order.status;

            const gameCell = document.createElement('td');
            gameCell.textContent = order.game;

            const amountCell = document.createElement('td');
            amountCell.textContent = `${order.amount.toFixed(2)} ₽`;

            row.appendChild(dateCell);
            row.appendChild(orderIdCell);
            row.appendChild(descriptionCell);
            row.appendChild(buyerCell);
            row.appendChild(statusCell);
            row.appendChild(gameCell);
            row.appendChild(amountCell);

            ordersContainer.appendChild(row);
        });
    } catch (error) {
        console.error('Ошибка при получении заказов:', error);
    }
}

// Вызываем функцию при загрузке страницы
document.addEventListener('DOMContentLoaded', fetchAndDisplayOrders);