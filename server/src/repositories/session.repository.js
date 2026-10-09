const crypto = require("crypto");
const { client } = require("../config/redis");
const { SESSION_TTL } = require("../config/env");

const createSession = async (userId) => {
  const sessionId = crypto.randomBytes(32).toString("hex");

  const sessionKey = `session:${sessionId}`;
  const userSessionsKey = `user:${userId}:sessions`;

  const sessionData = JSON.stringify({ userId });

  await client.set(sessionKey, sessionData, {
    EX: SESSION_TTL,
  });

  await client.sAdd(userSessionsKey, sessionId);

  return sessionId;
};

const findSession = async (sessionId) => {
  const sessionKey = `session:${sessionId}`;

  const result = await client.get(sessionKey);

  const data = result === null ? null : JSON.parse(result);

  return data;
};

const clearSession = async (sessionId) => {
  const session = await findSession(sessionId);

  if (!session) {
    return;
  }

  const sessionKey = `session:${sessionId}`;
  const userSessionsKey = `user:${session.userId}:sessions`;

  await client.del(sessionKey);
  await client.sRem(userSessionsKey, sessionId);
};

const clearAllSessions = async (userId) => {
  const userSessionsKey = `user:${userId}:sessions`;

  const sessionIds = await client.sMembers(userSessionsKey);

  if (sessionIds.length > 0) {
    const sessionKeys = sessionIds.map((sessionId) => `session:${sessionId}`);
    await client.del(sessionKeys);
  }

  await client.del(userSessionsKey);
};

module.exports = {
  createSession,
  findSession,
  clearSession,
  clearAllSessions,
};
