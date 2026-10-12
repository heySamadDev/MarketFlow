const crypto = require("crypto");
const { client } = require("../config/redis");
const { SESSION_TTL } = require("../config/env");

const createSession = async (userId) => {
  const sessionId = crypto.randomBytes(32).toString("hex");
  const csrfToken = crypto.randomBytes(32).toString("hex");

  const sessionKey = `session:${sessionId}`;
  const userSessionsKey = `user:${userId}:sessions`;

  const sessionRecordId = crypto.randomUUID();

  const sessionData = JSON.stringify({
    userId,
    createdAt: Date.now(),
    sessionRecordId,
    csrfToken,
  });

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

const findExistingSessions = async (userId) => {
  const userSessionsKey = `user:${userId}:sessions`;

  const sessionIds = await client.sMembers(userSessionsKey);
  const activeSessionIds = [];

  for (const sessionId of sessionIds) {
    const sessionKey = `session:${sessionId}`;
    const exists = await client.exists(sessionKey);

    if (exists === 0) {
      await client.sRem(userSessionsKey, sessionId);
    } else {
      activeSessionIds.push(sessionId);
    }
  }

  return activeSessionIds;
};

const clearSession = async (sessionId) => {
  const session = await findSession(sessionId);

  if (session) {
    const userSessionsKey = `user:${session.userId}:sessions`;
    await client.sRem(userSessionsKey, sessionId);
  }

  const sessionKey = `session:${sessionId}`;

  await client.del(sessionKey);
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

const getActiveSessions = async (userId) => {
  const sessionIds = await findExistingSessions(userId);
  const activeSessions = [];

  for (const sessionId of sessionIds) {
    const session = await findSession(sessionId);

    if (session) {
      activeSessions.push({
        sessionId,
        sessionRecordId: session.sessionRecordId,
        createdAt: session.createdAt,
      });
    }
  }

  return activeSessions;
};

const clearSessionByRecordId = async (userId, sessionRecordId) => {
  const sessionIds = await findExistingSessions(userId);

  for (const sessionId of sessionIds) {
    const session = await findSession(sessionId);

    if (session?.sessionRecordId === sessionRecordId) {
      await clearSession(sessionId);
      return true;
    }
  }
  return false;
};

const clearOtherSession = async (userId, currentSessionId) => {
  const sessionIds = await findExistingSessions(userId);

  for (const sessionId of sessionIds) {
    if (sessionId !== currentSessionId) {
      await clearSession(sessionId);
    }
  }
};

module.exports = {
  createSession,
  findSession,
  findExistingSessions,
  clearSession,
  clearAllSessions,
  getActiveSessions,
  clearSessionByRecordId,
  clearOtherSession,
};
