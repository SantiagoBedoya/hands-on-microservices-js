const express = require("express");
const cors = require("cors");

const v1 = require("./routes/v1");
const consumerModule = require("./modules/kafkamodule");
const jwtVerifyMiddleware = require("./middlewares/verify");
const morganMiddleware = require("./middlewares/morgan");

const app = express();

app.use(morganMiddleware);
app.use(jwtVerifyMiddleware);
consumerModule();

const corsConfig = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200,
};

app.use(cors(corsConfig));
app.use(express.json());

app.use("/v1", v1);
module.exports = app;
