const crypto = require("crypto");

function setHash(text) {
  const hash = crypto.createHash("sha256");
  return hash.update(text).digest("hex");
}

module.exports = setHash;
