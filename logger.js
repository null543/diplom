const winston = require('winston');
require('winston-mail');
require('winston-daily-rotate-file');

// Настройка транспорта для файла
const fileTransport = new winston.transports.DailyRotateFile({
  filename: 'application-%DATE%.log',
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
});

const mailTransport = new winston.transports.Mail({
    to: 'resident.evil.remake@mail.ru',
    from: 'theatre.send.code@mail.ru',
    subject: 'Error Logs',
    host: 'smtp.mail.ru',
    port: 465, // Изменен с 465 на 587 для использования STARTTLS
    secure: true, // Изменен на false, поскольку для порта 587 обычно используется STARTTLS
    tls: {
        rejectUnauthorized: false // Добавлен параметр для локального хоста
      },
    auth: {
      user: 'theatre.send.code@mail.ru',
      pass: 'zsKRAUsEYqHRG1AxGiuP'
    },
    level: 'error'
  });
  
// Создание экземпляра логгера
const logger = winston.createLogger({
  level: 'info', // Минимальный уровень логирования
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [
    fileTransport,
    mailTransport
  ]
});

module.exports = logger;
