const Kafka = require("node-rdkafka");
const { createConfig } = require("../config/config");
const path = require("path");

class EarthquakeEventConsumer {
  constructor() {
    const configPath = path.join(__dirname, "../../configs/.env");
    this.appConfig = createConfig(configPath);

    this.stream = Kafka.KafkaConsumer.createReadStream(
      {
        "metadata.broker.list": this.appConfig.kafka.brokers,
        "group.id": this.appConfig.kafka.groupId,
        "socket.keepalive.enable": true,
        "enable.auto.commit": true,
      },
      {},
      {
        topics: this.appConfig.kafka.topic,
        waitInterval: 0,
        objectMode: false,
      },
    );
  }

  async consumeData() {
    console.log("consuming data...");
    this.stream.on("data", (message) => {
      console.log("Got message");
      console.log(JSON.parse(message));
    });
  }
}

module.exports = EarthquakeEventConsumer;
