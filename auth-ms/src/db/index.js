const db = require("mongoose");

async function connect({ mongo: { url } }) {
  try {
    await db.connect(url);
  } catch (err) {
    console.log(err);
  }
}

const dbConnection = db.connection;

function disconnect() {
  dbConnection.removeAllListeners();
  return db.disconnect();
}

module.exports = {
  connect,
  disconnect,
};
