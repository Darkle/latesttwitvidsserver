winston = require('winston')
RollbarTransport = require('winston-rollbar-transport').default

{ rollbarAccessToken } = require('./config.json')

/*****
* We are using winston for logging as there is no way to log to the console in dev without logging
* to rollbar online as well when using the rollbar npm module on its own.
*
* https://github.com/winstonjs/winston
* Winston log levels: { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
* So can use logger.error(), logger.warn(), logger.info(), logger.verbose(), logger.debug()
*
* Important note about error logging with winston-rollbar-transport:
* https://github.com/binded/winston-rollbar-transport#error-handling
*/

transports = [
  new winston.transports.Console({
    handleExceptions: true,
    humanReadableUnhandledException: true,
    json: true,
    level: global.isProduction ? 'info' : 'debug'
  }),
  new RollbarTransport({
    rollbarAccessToken,
    rollbarConfig: {
      captureUncaught: true,
      captureUnhandledRejections: true,
      environment: global.isProduction ? 'production' : 'development'
    },
    handleExceptions: true,
    humanReadableUnhandledException: true,
    level: 'info'
  })
]

/*****
* We don't log to rollbar in dev.
*/
if(!global.isProduction){
  transports.pop()
}

logger = new winston.Logger({transports, exitOnError: false})

/*****
* It's important to handle uncaught exceptions so can know why it crashed.
*/
logger.handleExceptions(transports)

module.exports = {
  logger
}
