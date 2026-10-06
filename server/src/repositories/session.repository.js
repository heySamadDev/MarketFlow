const crypto = require("crypto");
const { client } = require("../config/redis");

const createSession = async (userId) => {
  const sessionId = crypto.randomBytes(32).toString("hex");

  const sessionKey = `session:${sessionId}`;

  const sessionData = JSON.stringify({ userId });

  await client.set(sessionKey, sessionData, {
    EX: 60,
  });

  return sessionId;
};

const findSession = async (sessionId) => {
  const sessionKey = `session:${sessionId}`;

  const result = await client.get(sessionKey);

  const data = result === null ? null : JSON.parse(result);

  return data;
};

module.exports = {
  createSession,
  findSession,
};
