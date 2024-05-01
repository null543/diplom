const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const ejsMate = require('ejs-mate');
const logger = require('./logger'); 
const axios = require('axios').default;
const https = require('https');
const axiosInstance = axios.create({
    httpsAgent: new https.Agent({  
        rejectUnauthorized: false  // Игнорировать недоверенные сертификаты
    })
});
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // Для Node.js

const API_BASE_URL = 'https://localhost:7292';
const server = http.createServer(app);
const io = socketIo(server);


app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.use(cookieParser());


const authCheck = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        logger.error(`Неавторизованный доступ к ${req.path}`);
        return res.redirect('/Login/index.html');
    }
    logger.info(`Авторизованный доступ к ${req.path}`);
    next();
};

app.use(express.static('public'));

// Маршруты, которые не требуют авторизации
app.use('/Home', express.static(path.join(__dirname, 'public', 'Home')));
app.use('/Login', express.static(path.join(__dirname, 'public', 'Login')));
app.use('/Register', express.static(path.join(__dirname, 'public', 'Register')));

// Маршруты, которые требуют авторизацииuse('/Profile', authCheck, express.static(path.join(__dirname, 'public', 'Profile')));
app.use('/Game', authCheck, express.static(path.join(__dirname, 'public', 'Game')));

// Если listings.js находится в папке public/Listing
app.use('/Listing', express.static(path.join(__dirname, 'public', 'Listing')));

// Применяем authCheck ко всем остальным маршрутам
app.use(authCheck);

app.use((err, req, res, next) => {
    logger.error(`Ошибка на сервере: ${err.message}`);
    res.status(500).send('Что-то сломалось!');
});

app.use((req, res, next) => {
    logger.info(`Поступил запрос: ${req.method} ${req.url}`);
    next();
});

app.get('/Profile/:userId', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Profile', 'index.html'));
});

app.get('/Game/gameinfo/:gameId', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Game', 'index.html'));
});

app.get('/offer/:offerid', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ListingFull', 'index.html'));
});

app.get('/uploadoffer/:gameid', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'OfferUploadScreen', 'index.html'));
});

app.get('/orders/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'MyOrders', 'index.html'));
});
app.get('/orders/:orderid', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'MyOrderDetails', 'index.html'));
});

app.get('/sales/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'MySales', 'index.html'));
});
app.get('/messages/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Messages', 'index.html'));
});


app.get('/api/orders', async (req, res) => {
    try {
        // Отправляем запрос к вашему API
        const response = await axios.get('https://localhost:7292/api/Orders/GetOrderBySeller', {
            headers: {
                'Authorization': req.header('Authorization') // Передаем заголовок Authorization из запроса клиента
            }
        });

        // Отправляем полученные данные обратно клиенту
        res.json(response.data);
    } catch (error) {
        console.log(`Ошибка при получении заказов: ${error.message}`);
        res.status(500).send(`Ошибка при получении заказов ${error.message}`);
    }
});

// Получение списка сообщений в чате
app.get('/api/chat-messages', async (req, res) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/ChatMessages`, {
            httpsAgent: new https.Agent({
                rejectUnauthorized: false // Только для локальной разработки!
            })
        });
        res.json(response.data);
    } catch (error) {
        console.error("Error loading chat messages:", error);
        res.status(500).send("Failed to load chat messages");
    }
});

// Получение конкретного сообщения по ID
app.get('/api/messages/:id', async (req, res) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/Messages/${req.params.id}`);
        res.json(response.data);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            res.status(404).send('Message not found');
        } else {
            res.status(500).send(error.toString());
        }
    }
});
const moment = require('moment-timezone');
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('newMessage', async (data) => {
        try {
            const moscowTime = moment().tz('Europe/Moscow').format();
    
            const postData = {
                fromUserID: data.FromUserID,
                toUserID: data.ToUserID,
                messageText: data.MessageText,
                dateSent: moscowTime // Установка времени сообщения
            };
    
            const response = await axiosInstance.post(`${API_BASE_URL}/api/Chats/MessagePost`, postData);
            console.log(response);
            // Воспользуйтесь данными ответа API, если они уже содержат всю необходимую информацию
            if (response.data && response.status === 200) {
                const { messageID, chatID, messageText, dateSent, sender, recipient } = response.data;
                io.emit('messageReceived', {
                    messageID,
                    chatID,
                    messageText,
                    dateSent,
                    senderId: sender.userId, // Используйте camelCase, как в ответе API
                    senderNickname: sender.nickname,
                    recipientId: recipient.userId,
                    recipientNickname: recipient.nickname
                });
            } else {
                throw new Error('Invalid response from message posting API');
            }
        } catch (error) {
            console.log('Error in sending message:', error);
            const errorMessage = error.response ? error.response.data : error.message;
            socket.emit('error', errorMessage);
        }
    });
    

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    logger.info(`Сервер запущен на порту ${PORT}`);
});

