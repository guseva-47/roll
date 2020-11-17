import { NestFactory } from '@nestjs/core';
import { DocumentBuilder } from '@nestjs/swagger/dist/document-builder';
import { SwaggerModule } from '@nestjs/swagger/dist/swagger-module';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

async function bootstrap() {
    const loggerConfig = {
        logger: WinstonModule.createLogger({
            level: 'debug',
            handleExceptions: true,
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.colorize(),
                winston.format.printf(({ level, timestamp, context, message }) =>
                    `[${level}] ${timestamp} [${context}]: ${message}`
                )
            ),
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({
                    filename: 'logs/debug.log',
                    format: winston.format.uncolorize()
                })
            ],
        })
    };
    const app = await NestFactory.create(AppModule, loggerConfig);

    const options = new DocumentBuilder()
        .setTitle('Cats example')
        .setDescription('The cats API description')
        .setVersion('1.0')
        .addTag('cats')
        .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);

    await app.listen(3000);
}
bootstrap();