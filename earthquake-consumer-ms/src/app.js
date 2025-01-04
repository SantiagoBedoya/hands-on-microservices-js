const express = require("express");
const EarthquakeEventConsumer = require("./services/earthquake");

const app = express();
const earthquakeConsumer = new EarthquakeEventConsumer();

earthquakeConsumer.consumeData();

module.exports = app;
