const express = require("express");
const EarthquakeEventProducer = require("./services/earthquake");

const app = express();
const earthquakeProducer = new EarthquakeEventProducer();

app.post("/earthquake-events/start", async (req, res) => {
  earthquakeProducer.runEarthquake();
  res.status(200).send("Earthquake event stream started");
});

app.post("/earthquake-events/stop", (req, res) => {
  earthquakeProducer.stopEarthquake();
  res.status(200).send("Earthquake event stream stopped");
});

module.exports = app;
