document.addEventListener('DOMContentLoaded', function() {
    const token = document.cookie.split(';').find(item => item.trim().startsWith('token='));
    const header = document.createElement('header');
    const userId = getUserIDFromToken();

    header.className = 'hover:text-white text-white body-font';

    let menuItems;

    if (token) {
        menuItems = `
            <a href="/Listing/index.html" class="mr-5 hover:text-white">Обьявления</a>
            <a href="/orders/" class="mr-5 hover:text-white">Покупки</a>
            <a href="dashboard.html" class="mr-5 hover:text-white">Панель управления продавцом</a>
            <a href="/Profile/${userId}" class="mr-5 hover:text-white">Профиль</a>
        `;
    } else {
        menuItems = `
        <a href="/Home/index.html" class="mr-5 hover:text-white">Главная</a>
        <a href="/Login/index.html" class="mr-5 hover:text-white">Авторизация/Регистрация</a>
        `;
    }

    header.innerHTML = `
        <div class="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
            <nav class="md:ml-auto flex flex-wrap items-center text-base justify-center">
                ${menuItems}
            </nav>
        </div>
        <div id="user-profile">
            <!-- Профиль пользователя или кнопки входа/регистрации будут вставлены сюда -->
        </div>`;

    if (token) {
        const userProfile = header.querySelector('#user-profile');
        userProfile.innerHTML = `<div class="user-icon"></div>`; // Иконка пользователя
    }

    document.body.insertBefore(header, document.body.firstChild);
});
function getUserIDFromToken() {
    const token = localStorage.getItem('token');
    if (token) {
        const decodedToken = jwt_decode(token);
        return decodedToken.nameid; // или другое поле, содержащее userID
    }
    return null;
}