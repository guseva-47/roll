import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

export const winstoneConfig = WinstonModule.forRoot({
    level: 'debug',
    handleExceptions: true,
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.colorize(),
        winston.format.printf(
            ({ level, timestamp, context, message }) =>
                `[${level}] ${timestamp} [${context}]: ${message}`,
        ),
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: 'logs/debug.log',
            format: winston.format.uncolorize(),
        }),
    ],
});
