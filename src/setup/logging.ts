import winston, { level } from "winston";

const consoleLogFormat = winston.format.printf((info) => {
    const date = new Date();
    return `${date.toLocaleDateString()}-${date.toLocaleTimeString()}-${info.level}: ${info.message}`;
});

const errorFileFormatter = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
);

const logger = winston.createLogger({
    level: 'info',
    exitOnError: false,
    format: winston.format.errors({
        stack: true,
    }),
    transports: [
        new winston.transports.File({
            level: 'error',
            dirname: 'logs',
            filename: 'error.log',
            format: errorFileFormatter
        }),
        new winston.transports.File({
            level: level,
            dirname: 'logs',
            filename: 'all_combined.log',
            format: consoleLogFormat,
        }),
        new winston.transports.Console({
            level: level,
            format: winston.format.combine(
                winston.format.colorize(),
                consoleLogFormat,
            )
        }),
    ],
});

export default function getLogger() {
    return logger;
}