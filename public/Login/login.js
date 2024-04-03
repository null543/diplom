document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Предотвращаем обычную отправку формы

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const data = {
        Email: email,
        Password: password
    };

    fetch('https://localhost:7292/api/Users/login', { // Используйте свой URL
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const userid = getUserIDFromToken();
        console.log('Success:', data);
        // Сохранение токена в cookie
        console.log('Токен получен:', data.token);
        document.cookie = `token=${data.Token};path=/;max-age=86400`; // 86400 секунд = 1 день
        localStorage.setItem('token', data.token); // Используем localStorage для сохранения токена
        console.log('Токен сохранен в localStorage');
        console.log(data.token);
        // Переадресация на страницу профиля
        window.location.href =  `/Profile/${userId}`;
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});
function getUserIDFromToken() {
    const token = localStorage.getItem('token');
    if (token) {
        const decodedToken = jwt_decode(token);
        return decodedToken.nameid; // или другое поле, содержащее userID
    }
    return null;
}
function checkAuth() {
    const token = document.cookie.split(';').find(item => item.trim().startsWith('token='));
    const navMenu = document.querySelector('.md:ml-auto'); // Селектор для меню

    if (token) {
        navMenu.innerHTML = `
            <a href="/Home/index.html" class="mr-5 hover:text-white text-white">Главная</a>
            <a href="/Listing/index.html" class="mr-5 hover:text-white text-white">Обьявления</a>
            <a href="dashboard.html" class="mr-5 hover:text-white text-white">Панель управления продавцом</a>
            <a href="/Profile/index.html" class="mr-5 hover:text-white text-white">Профиль</a>
        `;
    } else {
        navMenu.innerHTML = `
            <a href="/Home/index.html" class="mr-5 hover:text-white text-white">Главная</a>
            <a href="/Listing/index.html" class="mr-5 hover:text-white text-white">Обьявления</a>
            <a href="/Login/index.html" class="mr-5 hover:text-white text-white">Авторизация/Регистрация</a>
        `;
    }
}

// Вызываем функцию при загрузке страницы
document.addEventListener('DOMContentLoaded', checkAuth);
