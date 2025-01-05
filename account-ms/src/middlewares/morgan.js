const fs = require("fs");
const path = require("path");

const morgan = require("morgan");
const { logger } = require("../log/logger-logstash");

const morganFormat = JSON.stringify({
  method: ":method",
  url: ":url",
  status: ":status",
  responseTime: ":response-time ms",
});

const logFilePath = path.join(__dirname, "../../combined.log");
const logFileStream = fs.createWriteStream(logFilePath, { flags: "a" });

function messageHandler(message) {
  const parsedMessage = JSON.parse(message.trim());

  logger.info("Request received for logging", parsedMessage);
  logFileStream.write(`${message}\n`);
}

const morganMiddleware = morgan(morganFormat, {
  stream: {
    write: messageHandler,
  },
});

module.exports = morganMiddleware;
