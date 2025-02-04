const dotenv = require("dotenv");
const Joi = require("joi");

const envVarsSchema = Joi.object()
  .keys({
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().required().description("MongoDB URL"),
    KAFKA_CLIENT_ID: Joi.string().required(),
    KAFKA_BROKERS: Joi.string().required(),
    KAFKA_TOPIC: Joi.string().required(),
    KAFKA_GROUP_ID: Joi.string().required(),
    SECRET_ACCESS_TOKEN: Joi.string().required(),
  })
  .unknown();

function createConfig(configPath) {
  dotenv.config({ path: configPath });
  const { value: envVars, error } = envVarsSchema
    .prefs({
      errors: { label: "key" },
    })
    .validate(process.env);

  if (error) {
    throw new Error(`Config validation error: ${error}`);
  }

  return {
    port: envVars.PORT,
    mongo: {
      url: envVars.MONGODB_URL,
    },
    kafka: {
      clientId: envVars.KAFKA_CLIENT_ID,
      brokers: envVars.KAFKA_BROKERS,
      topic: envVars.KAFKA_TOPIC,
      groupId: envVars.KAFKA_GROUP_ID,
    },
    jwt: {
      access_token: envVars.SECRET_ACCESS_TOKEN,
    },
  };
}

module.exports = {
  createConfig,
};
