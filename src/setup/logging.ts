import winston, { level, Logger, LoggerOptions } from "winston";

const consoleLogFormat = winston.format.printf((info) => {
    const date = new Date();
    return `${date.toLocaleDateString()}-${date.toLocaleTimeString()}-${info.level}: ${info.message}`;
});

const errorFileFormatter = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
);

export function createGuildLogger(guildId: string): Logger {
    return winston.createLogger(createGuildLoggerOptions(guildId));
}

export const createGuildLoggerOptions = (guildId: string): LoggerOptions => {
    const dirName = `logs/${guildId}`;
    return {
        level: 'info',
        exitOnError: false,
        format: winston.format.errors({
            stack: true,
        }),
        transports: [
            new winston.transports.Console({
                level: level,
                format: winston.format.combine(
                    winston.format.colorize(),
                    consoleLogFormat,
                )
            }),
            new winston.transports.File({
                level: level,
                dirname: dirName,
                filename: 'all_combined.log',
                format: consoleLogFormat,
            }),
            new winston.transports.File({
                level: 'error',
                dirname: dirName,
                filename: 'error.log',
                format: errorFileFormatter
            }),
        ]
    } as LoggerOptions;
}

export const getGuildLogger = (guildId: string): Logger => {
    return winston.loggers.get(guildId, createGuildLoggerOptions(guildId));
}