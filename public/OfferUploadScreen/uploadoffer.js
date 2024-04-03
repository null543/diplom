console.log("работает");
document.getElementById('save-button').addEventListener('click', function() {
    const gameId = window.location.pathname.split('/').pop(); // Предполагаем, что ID игры есть в URL
    const userId = getUserIDFromToken();
    const price = document.getElementById('price').value;
    const description = document.getElementById('brief-description').value;
    const descriptionFull = document.getElementById('detailed-description').value;
    const productsRaw = document.getElementById('goods').value;
    const isActive = document.getElementById('active').checked;


    // Форматируем товары
    const autodelivery = productsRaw.split('\n').map(product => product.replace(/\\n/g, '\n')).join(';');

    // Проверяем заполнение всех полей
    if (!price || !description || !descriptionFull || !productsRaw) {
        alert('Пожалуйста, заполните все поля');
        return;
    }
    function getUserIDFromToken() {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken = jwt_decode(token);
            return decodedToken.nameid; // или другое поле, содержащее userID
        }
        return null;
    }
    // Формируем тело запроса
    const listingData = {
        userId: parseInt(userId),
        gameId: parseInt(gameId),
        price: parseFloat(price),
        description: description,
        status: isActive ? "Активно" : "Неактивно",
        dateListed: new Date().toISOString(),
        descriptionFull: descriptionFull,
        autodelivery: autodelivery
    };

    fetch('https://localhost:7292/api/Listings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(listingData)
    })
    .then(response => {
        if (response.status === 201) {
            return response.json();
        } else {
            throw new Error('Network response was not ok');
        }
    })
    .then(data => {
        console.log('Successfully created:', data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
    
});
