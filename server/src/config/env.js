const SESSION_TTL = Number(process.env.SESSION_TTL);

if(Number.isNaN(SESSION_TTL) || SESSION_TTL <= 0){
  throw new Error("SESSION_TTL must be a positive number.");
}

module.exports = {
  SESSION_TTL
}