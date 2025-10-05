const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, errors} = format;
const path = require('path');
const fs = require('fs');

class Logger {
    constructor() {
        this.ensureLogDirectoryExists();
        this.errorLogger = this.createErrorLogger();
        this.warnLogger = this.createWarnLogger();
        this.debugLogger = this.createDebugLogger();
    }

    ensureLogDirectoryExists() {
        const logDirectory = path.join(process.cwd(), 'logs');
        if (!fs.existsSync(logDirectory)) {
            fs.mkdirSync(logDirectory, { recursive: true });
        }
    }

    createErrorLogger() {
        return createLogger({
            level: 'error',
            format: combine(
                errors({ stack: true }),
                timestamp(),
                printf(({ timestamp, level, message, stack }) =>
                    `${JSON.stringify(timestamp)} ${level}: ${JSON.stringify(message)} ${stack ? '\n' + JSON.stringify(stack) : ''}`
                )
            ),
            transports: [
                new transports.File({ filename: path.join(process.cwd(), 'logs', 'error.log') })
            ]
        });
    }

    createWarnLogger() {
        return createLogger({
            level: 'warn',
            format: combine(
                errors({ stack: true }),
                timestamp(),
                printf(({ timestamp, level, message, stack }) =>
                    `${JSON.stringify(timestamp)} ${level}: ${JSON.stringify(message)} ${stack ? '\n' + JSON.stringify(stack) : ''}`
                )
            ),
            transports: [
                new transports.File({ filename: path.join(process.cwd(), 'logs', 'warn.log') }),
            ]
        });
    }
    

    createDebugLogger() {
        return createLogger({
            level: 'debug',
            format: combine(
                timestamp(),
                printf(({ timestamp, level, message }) =>
                    `${JSON.stringify(timestamp)} ${level}: ${JSON.stringify(message)}`
                )
            ),
            transports: [
                new transports.File({ filename: path.join(process.cwd(), 'logs', 'debug.log') })
            ]
        });
    }

    error(message, error) {
        this.errorLogger.error(message, { error });
    }

    warn(message, error) {
        this.warnLogger.warn(message, { error });
    }

    debug(message) {
        this.debugLogger.debug(message);
    }
}

// Create singleton instance
const logger = new Logger();
Object.freeze(logger);
module.exports = logger;
