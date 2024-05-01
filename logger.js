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
  ]
});

module.exports = logger;
