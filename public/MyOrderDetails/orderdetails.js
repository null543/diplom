// Подключаем скрипт после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    const orderId = window.location.pathname.split('/orders/')[1]; // Извлекаем ID заказа из URL
    fetchOrderDetails(orderId);
  });
  
  function fetchOrderDetails(orderId) {
    // Делаем запрос к API для получения данных о заказе
    fetch(`https://localhost:7292/api/Orders/GetOrderByOrderId?orderId=${orderId}`)
      .then(response => {
        if (!response.ok) throw new Error('Ошибка при запросе данных о заказе');
        return response.json();
      })
      .then(data => {
        // Заполняем элементы страницы полученными данными
        document.getElementById('order-number').textContent = `Заказ #${data.orderId}`;
        document.getElementById('order-status').textContent = data.status;
        document.getElementById('item-info').textContent = data.autoDelivery.replace(/\\n/g, '\n'); // Заменяем \n на перенос строки
        document.getElementById('game-name').innerHTML  ="Игра: <br> " + data.game;
        document.getElementById('short-description').innerHTML = "Кратокое описание: <br> "+data.description;
        document.getElementById('detailed-description').innerHTML = data.descriptionFull.replace(/\n/g, '<br>') || 'Подробное описание недоступно';
        document.getElementById('created-date').textContent += formatDate(data.purchaseDate);
        document.getElementById('amount').textContent += `${data.amount} р`;

       // Проверяем статус заказа и скрываем кнопку, если заказ закрыт
       if (data.status === "Закрыт") {
        const confirmButtonDiv = document.getElementById('confirm-button');
        if (confirmButtonDiv) {
            confirmButtonDiv.style.display = 'none';
        }
    }

  
        // Кнопка для копирования оплаченного товара
        const copyButton = document.querySelector('.copy-button');
        copyButton.addEventListener('click', () => {
          // Копируем текст оплаченного товара в буфер обмена
          navigator.clipboard.writeText(data.autoDelivery.replace(/\\n/g, '\n')).then(() => {
            alert('Товар скопирован!');
          }).catch(err => {
            alert('Ошибка при копировании: ', err);
          });
        });
      })
      
      .catch(error => {
        console.error('Ошибка:', error);
      });

     

  }

    
  
  function formatDate(dateString) {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    const hours = dateString.substring(8, 10);
    const minutes = dateString.substring(10, 12);
    const seconds = dateString.substring(12, 14);
    return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
  }
  
  document.getElementById('confirm-button').addEventListener('click', function() {
    // Получаем ID заказа из URL
    const orderId = window.location.pathname.split('/orders/')[1];
  
    // Спрашиваем пользователя, уверен ли он в подтверждении заказа
    if (confirm('Вы уверены, что хотите подтвердить выполнение заказа? Деньги будут отправлены на счет продавца.')) {
      // Если пользователь подтвердил, отправляем запрос на подтверждение заказа
      fetch(`https://localhost:7292/api/Orders/CloseOrder?orderId=${orderId}`, {
        method: 'POST', // Проверьте, какой HTTP метод ожидается на сервере, POST или GET
      })
      .then(response => {
        if (response.ok) {
          // Если запрос успешен, читаем текстовый ответ
          return response.text();
          
        } else {
          // Если сервер вернул ошибку, выбрасываем исключение
          return response.text().then(text => { throw new Error(text) });
        }
      })
      .then(data => {
        // После успешного подтверждения заказа обновляем страницу
        document.getElementById('confirm-button').style.display = 'none';
        window.location.reload();
      })
      .catch(error => {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при подтверждении заказа.');
      });
    }
  });

  
  