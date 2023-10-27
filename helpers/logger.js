const { createLogger, format } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const { timestamp, combine, printf, errors } = format;

const logFormat = printf(({ level, timestamp, stack, message }) => {
  return `[${timestamp}] ${level}: ${stack || message}`;
});

const levelFilter = (level) =>
  format((info) => {
    if (info.level != level) {
      return false;
    }
    return info;
  })();

const logger = createLogger({
  exitOnError: true,
  format: errors({ stack: true }),
  transports: [
    new DailyRotateFile({
      filename: './logs/info_%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '1g',
      maxFiles: '7d',
      format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), levelFilter('info'), logFormat),
    }),
    new DailyRotateFile({
      filename: './logs/warn_%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '1g',
      maxFiles: '7d',
      format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), levelFilter('warn'), logFormat),
    }),
    new DailyRotateFile({
      filename: './logs/error_%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '1g',
      maxFiles: '7d',
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        levelFilter('error'),
        logFormat,
      ),
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
});

module.exports = logger;
