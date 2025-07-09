import winston from 'winston';

const options = {
    console: {
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true,
        timestamp: true
    }
};

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.label({ label: '' }),
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(options.console)
    ],
    exitOnError: false
});


const stream = {
    write: (message: string) => {
        logger.info(message.trim());
    }
};


const log = (
    level: string,
    message: string,
    data?: any
): void => {
    logger.log({
        level,
        message,
        logDetails: data
    });
};

export { logger, stream, log };
