const socket = io();
// Глобальные переменные для хранения текущих идентификаторов
let currentChatId = null;
let currentUserId = null; // Это значение должно быть установлено после аутентификации
let currentChatPartnerId = null;
let token = localStorage.getItem("token");
let currentUserIdService = getUserIDFromToken();

document.getElementById('message-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const input = document.getElementById('message-input');
    const message = input.value;
    console.log('Current Chat ID:', currentChatId);  // Логируйте значение для проверки
    console.log(typeof currentChatId);  // Должно быть 'number'

    // Передаём callback функцию, которая будет выполнена после обновления ID
    fetchChatParticipants(currentChatId, () => {
        console.log("важный лог", currentUserId);
        socket.emit('newMessage', {
            MessageText: message,
            FromUserID: currentUserId,
            ToUserID: currentChatPartnerId,
        });
        input.value = '';
    });
});


socket.on('messageReceived', function(data) {
    const messagesContainer = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.className = 'message';

    // Определение, является ли текущий пользователь отправителем сообщения
    const senderName = data.senderId === currentUserId ? 'Вы' : data.senderNickname;

    messageElement.innerHTML = `
        <p><strong>${senderName}:</strong> ${data.messageText}</p>
        <p class="message-time">${new Date(data.dateSent).toLocaleString()}</p>
    `;
    messagesContainer.appendChild(messageElement);
    scrollToBottom();
    // Находим диалог в списке диалогов и обновляем текст последнего сообщения
    const dialogElement = document.querySelector(`.last-message`);
    if (dialogElement) {
        dialogElement.textContent = `${data.messageText}`;
    }
});





socket.on('error', function(errorMessage) {
    console.log('Error:', errorMessage);
});
// Функция для запроса участников чата
function fetchChatParticipants(chatId, callback) {

    fetch(`https://localhost:7292/api/Chats/GetChatParticipants/${chatId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log('HTTP Status:', response.status);  // Логирование статуса HTTP ответа
        if (!response.ok) {
            return response.text().then(text => {
                console.error('HTTP Error Response:', response.status, response.statusText, text);
                throw new Error(`Failed to fetch chat participants: ${response.statusText} (${response.status}) - ${text}`);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Participants:', data);
        if (data.fromUserID && data.toUserID) {
            currentUserId = data.fromUserID;  // Обновляем идентификатор текущего пользователя
            currentChatPartnerId = data.toUserID;  // Обновляем идентификатор партнера по чату
            console.log(`Updated currentUserId: ${currentUserId}, currentChatPartnerId: ${currentChatPartnerId}`);
            if (callback) {
                callback();  // Вызываем callback после обновления данных
            }
        } else {
            console.error('Data fields missing in the response:', data);
        }
    })
    .catch(error => {
        console.error('Error in fetchChatParticipants:', error);
    });
}


function loadDialogs() {
 // Замените 'your_jwt_token_here' на ваш JWT токен

    fetch('https://localhost:7292/api/Chats/UserChats', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load dialogs');
        }
        return response.json();
    })
    .then(dialogs => {
        console.log(dialogs);
        const dialogList = document.getElementById('dialog-list');
        dialogList.innerHTML = '';  // Очистка списка диалогов
        dialogs.forEach(dialog => {
            const dialogElement = document.createElement('div');
            dialogElement.className = 'dialog-card';
            dialogElement.innerHTML = `
                <h3>${dialog.chatName}</h3>
                <p class="last-message">${dialog.lastMessage ? dialog.lastMessage.messageText : 'Нет сообщений'}</p>
            `; // Отображаем имя чата и последнее сообщение
            dialogElement.onclick = () => loadMessages(dialog.chatID); // Функция загрузки сообщений по клику
            dialogList.appendChild(dialogElement);
        });
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('dialog-list').innerHTML = 'Error loading dialogs. Please try again later.';
    });
}




function loadMessages(chatID) {
    currentChatId = chatID;
    fetch(`https://localhost:7292/api/Messages/ChatMessages/${chatID}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load chat messages');
        }
        return response.json();
    })
    .then(messages => {
        const messagesContainer = document.getElementById('messages');
        messagesContainer.innerHTML = '';  // Очистка предыдущих сообщений
        messages.forEach(message => {
            // Добавляем проверку для чата с id = 8
            console.log(currentUserIdService);
            console.log(message.recipientId);
            if (chatID == 8 && message.recipientId != currentUserIdService) {
                return; // Пропускаем сообщения, не предназначенные для текущего пользователя
            }

            console.log(message);

            const messageElement = document.createElement('div');
            messageElement.className = 'message';

            // Проверяем, совпадает ли senderId с currentUserId
            const senderDisplayName = message.senderId === currentUserId ? 'Вы' : message.senderNickname;

            messageElement.innerHTML = `
                <p><strong>${senderDisplayName}:</strong> ${message.messageText}</p>
                <p class="message-time">${new Date(message.dateSent).toLocaleString()}</p>
            `; // Убедитесь, что используете правильные имена свойств
            messagesContainer.appendChild(messageElement);
        });
        scrollToBottom();
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('messages').innerHTML = 'Error loading messages. Please try again later.';
    });
}


function scrollToBottom() {
    const messagesContainer = document.getElementById('messages');
    const inputContainer = document.getElementById('message-input');

    if (messagesContainer.lastElementChild) {
        // Прокрутка до последнего сообщения в контейнере сообщений
        messagesContainer.lastElementChild.scrollIntoView(false);
    }

    if (inputContainer) {
        // Прокрутка до поля ввода сообщения
        inputContainer.scrollIntoView(false);
    }
}

function getUserIDFromToken() {
    const token = localStorage.getItem('token');
    if (token) {
        const decodedToken = jwt_decode(token);
        return decodedToken.nameid; // или другое поле, содержащее userID
    }
    return null;
}

window.onload = function() {
    loadDialogs();  // Загружаем список диалогов при загрузке страницы
};
