const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();
const ejsMate = require('ejs-mate');
const logger = require('./logger'); 

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




// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`Сервер запущен на порту ${PORT}`); 
});
