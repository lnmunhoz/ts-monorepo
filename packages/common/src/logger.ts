import winston, { Logger } from "winston"

export type ILogger = Logger

export const createLogger = (isProduction: boolean) => {
   const format = isProduction
      ? winston.format.combine(
           winston.format.timestamp(),
           winston.format.json()
        )
      : winston.format.combine(
           winston.format.colorize(),
           winston.format.timestamp({
              format: "YYYY-MM-DD HH:mm:ss",
           }),
           winston.format.json(),
           winston.format.printf(({ level, label, message, timestamp }) => {
              let log = `[${timestamp}] ${level} `

              if (label) {
                 log += `${label} `
              }

              log += `${message}`

              return log
           })
        )

   const logger = winston.createLogger({
      format,
      transports: [
         //
         // - Write all logs with level `error` and below to `error.log`
         // - Write all logs with level `info` and below to `combined.log`
         //
         new winston.transports.File({ filename: "error.log", level: "error" }),
         new winston.transports.File({ filename: "combined.log" }),
      ],
   })

   //
   // If we're not in production then log to the `console` with the format:
   // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
   //
   if (!isProduction) {
      logger.add(
         new winston.transports.Console({
            format,
            level: "debug",
         })
      )
   }

   return logger
}
