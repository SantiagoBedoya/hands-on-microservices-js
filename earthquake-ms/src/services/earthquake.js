const Kafka = require("node-rdkafka");
const { createConfig } = require("../config/config");
const path = require("path");

class EarthquakeEventProducer {
  constructor() {
    this.intervalId = null;
  }

  #generateEarthquakeEvent() {
    return {
      id: Math.random().toString(36).substring(2, 15),
      magnitude: Math.random() * 9,
      location: {
        latitude: Math.random() * 180 - 90,
        longitude: Math.random() * 360 - 180,
      },
      timestamp: Date.now(),
    };
  }

  async runEarthquake() {
    const config = path.join(__dirname, "../../configs/.env");
    const appConfig = createConfig(config);

    const stream = Kafka.Producer.createWriteStream(
      {
        "metadata.broker.list": appConfig.kafka.brokers,
        "client.id": appConfig.kafka.clientId,
      },
      {},
      {
        topic: appConfig.kafka.topic,
      },
    );
    stream.on("error", (err) => {
      console.error("Error in out kafka stream");
      console.error(err);
    });

    this.intervalId = setInterval(async () => {
      const event = this.#generateEarthquakeEvent();
      const queuedSuccess = stream.write(Buffer.from(JSON.stringify(event)));
      if (queuedSuccess) {
        console.log("The message has been queued!");
      } else {
        console.log("Too many messages in queue already");
      }
    }, 100);
  }

  stopEarthquake() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("Earthquake event stream stoped");
    } else {
      console.log("No running earthquake event stream to stop");
    }
  }
}

module.exports = EarthquakeEventProducer;
