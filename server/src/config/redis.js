const redis = require("redis");

const client = redis.createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});

const connectRedis = async () => {
  await client.connect();

  console.log("Redis connected successfully");
};

module.exports = {
  client,
  connectRedis,
};
