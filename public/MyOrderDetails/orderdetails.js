

// Подключаем скрипт после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    const orderId = window.location.pathname.split('/orders/')[1]; // Извлекаем ID заказа из URL
    fetchOrderDetails(orderId);
  });
  
  function fetchOrderDetails(orderId) {
    // Делаем запрос к API для получения данных о заказе
    fetch(`https://localhost:7292/api/Orders/GetOrderByOrderId?orderId=${orderId}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('Ошибка при запросе данных о заказе');
        return response.json();
    })
    .then(data => {
        const currentUserId = getUserIDFromToken();  // Получаем ID текущего пользователя из токена

        // Заполняем элементы страницы полученными данными
        document.getElementById('order-number').textContent = `Заказ #${data.orderId}`;
        document.getElementById('order-status').textContent = data.status;
        document.getElementById('item-info').textContent = data.autoDelivery.replace(/\\n/g, '\n'); // Заменяем \n на перенос строки
        document.getElementById('game-name').innerHTML = "Игра: <br> " + data.game;
        document.getElementById('short-description').innerHTML = "Кратокое описание: <br> " + data.description;
        document.getElementById('detailed-description').innerHTML = data.descriptionFull.replace(/\n/g, '<br>') || 'Подробное описание недоступно';
        document.getElementById('created-date').textContent += formatDate(data.purchaseDate);
        document.getElementById('amount').textContent += `${data.amount} р`;

        // Скрываем кнопку подтверждения заказа и управление отзывами, если текущий пользователь - продавец
        if (currentUserId == data.sellerId) {
            const confirmButton = document.getElementById('confirm-button');
            if (confirmButton) {
                confirmButton.style.display = 'none';
            }
            const reviewSection = document.getElementById('reviewText');
            if (reviewSection) {
                reviewSection.style.display = 'none';  // Предположим, что у вас есть раздел с отзывами
            }
            const rating = document.getElementById('rating');
            if (rating) {
              rating.style.display = 'none';  // Предположим, что у вас есть раздел с отзывами
            }
            const publish = document.getElementById('btnPublish');
            if (publish) {
              publish.style.display = 'none';  // Предположим, что у вас есть раздел с отзывами
            }
            const btnDeleteReview = document.getElementById('btnDeleteReview');
            if (btnDeleteReview) {
              btnDeleteReview.style.display = 'none';  // Предположим, что у вас есть раздел с отзывами
            }
            const btnEditReview = document.getElementById('btnEditReview');
            if (btnEditReview) {
              btnEditReview.style.display = 'none';  // Предположим, что у вас есть раздел с отзывами
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



  document.addEventListener('DOMContentLoaded', function() {
    const publishButton = document.getElementById('btnPublish');
    const reviewTextArea = document.getElementById('reviewText');
    const stars = document.querySelectorAll('.star');
    const ratingElement = document.querySelector('.rating');
    let selectedRating = 0; // Создаем переменную для хранения выбранного рейтинга

    stars.forEach(star => {
        star.addEventListener('click', function() {
            selectedRating = this.getAttribute('data-value'); // Сохраняем выбранный рейтинг
            console.log("save rating");
            ratingElement.setAttribute('data-rating', selectedRating);
            updateStars(ratingElement, selectedRating);
        });

        star.addEventListener('mouseenter', function() {
            updateStars(ratingElement, this.getAttribute('data-value'));
        });

        star.addEventListener('mouseleave', function() {
            let currentRating = ratingElement.getAttribute('data-rating') || 0;
            updateStars(ratingElement, currentRating);
        });
    });
    const orderId = window.location.pathname.split('/orders/')[1];
    const yourToken = localStorage.getItem("token");
    const apiEndpoint = `https://localhost:7292/api/Reviews/GetReviewByOrder/${orderId}`;
    fetch(apiEndpoint, {
      method: 'GET',
      headers: {
          'Authorization': `Bearer ${yourToken}`
      }
  })
  .then(response => {
      if (!response.ok) {
          if (response.status === 404) {
              // Отзыв не найден, можно выводить сообщение или оставить как есть
              console.log("Отзыв для этого заказа не найден.");
          } else {
              throw new Error('Ошибка сети или сервера');
          }
      } else {
          return response.json();
      }
  })
  .then(reviewData => {
      if (reviewData) {
        console.log(reviewData);
        publishButton.remove();
        reviewTextArea.remove();
        stars.forEach(star => star.remove());
          const reviewCard = createReviewCard2(reviewData);
          document.querySelector('.seller-review').appendChild(reviewCard);
          
      }
  })
  .catch(error => {
      console.error('Error:', error);
  });


    publishButton.addEventListener('click', function() {
      const orderId = window.location.pathname.split('/orders/')[1];
      const reviewText123 = reviewTextArea.value.trim(); // Убедимся, что нет лишних пробелов
      const rating = parseInt(document.querySelector('.rating').getAttribute('data-rating'), 10);
      const apiEndpoint = 'https://localhost:7292/api/Reviews/AddReview';
      const yourToken = localStorage.getItem("token");
      console.log("токен ",yourToken);
      console.log("orderId ",orderId);
      console.log("reviewText ",reviewText123);
      console.log("rating ",rating);

      const requestBody = JSON.stringify({
        orderId: parseInt(orderId, 10),
        rating: rating,
        reviewText: reviewText123
    });
    console.log("Sending request body:", requestBody);


      if (!reviewText123) {
          alert('Пожалуйста, напишите текст отзыва.');
          return;
      }
  
      if (!rating || rating < 1 || rating > 5) {
          alert('Пожалуйста, выберите рейтинг.');
          return;
      }
  
      fetch(apiEndpoint, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${yourToken}`
          },
          body: requestBody
      })
      .then(response => {
          if (!response.ok) {
              // Получаем и логируем тело ответа для диагностики
              return response.text().then(text => { throw new Error(text || 'Server responded with not ok') });
          }
          return response.json();
      })
      .then(data => {
        publishButton.remove();
        reviewTextArea.remove();
        stars.forEach(star => star.remove());

        const reviewCard = createReviewCard(data);
        console.log(data);
        document.querySelector('.seller-review').appendChild(reviewCard);
    })
      .catch(error => {
          console.error('Error:', error);
          alert('Ошибка при отправке отзыва: ' + error.message);
      });
  });
  
  

function createReviewCard(reviewData) {
    const card = document.createElement('div');
    card.className = 'review-card';
    card.innerHTML = `
        <div class="review-header">
            <div class="review-info">
            <div class="review-author">${reviewData.reviewer.nickname}</div>
            <div class="review-date">${new Date(reviewData.reviewDate).toLocaleDateString()}</div>
            </div>
        </div>
        <div class="review-content">${reviewData.reviewText}</div>
        <div class="review-rating">${'★'.repeat(reviewData.rating)}</div>
        <div class="review-actions">
            <button id="btnEditReview" class="edit-button">Редактировать</button>
            <button id="btnDeleteReview" class="delete-button">Удалить</button>
        </div>
    `;
    return card;
}

function createReviewCard2(reviewData) {
  const card = document.createElement('div');
  card.className = 'review-card';
  card.innerHTML = `
      <div class="review-header">
          <div class="review-info">
              <div class="review-author">${reviewData.reviewer}</div>
              <div class="review-date">${new Date(reviewData.reviewDate).toLocaleDateString()}</div>
          </div>
      </div>
      <div class="review-content">${reviewData.reviewText}</div>
      <div class="review-rating">${'★'.repeat(reviewData.rating)}</div>
      <div class="review-actions">
          <button id="btnEditReview" class="edit-button">Редактировать</button>
          <button id="btnDeleteReview" class="delete-button">Удалить</button>
      </div>
  `;
  return card;
}

  function updateStars(ratingElement, rating) {
      stars.forEach(innerStar => {
          if (innerStar.getAttribute('data-value') <= rating) {
              innerStar.style.color = 'orange';
          } else {
              innerStar.style.color = 'lightgray';
          }
      });
  }
});


  
