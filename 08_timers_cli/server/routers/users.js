const express = require("express");
const setHash = require("../utils/hash");
const users = require("../models/users_model");
const auth = require("../midlewares/auth");
const authBySessionId = () => auth(users.findUserBySessionID);

const routerUsers = express.Router();

routerUsers.post("/signup", async (req, res) => {
  const username = req.header('username');
  const password = req.header('username');
  const user = await users.findUserByUsername(username);
  console.log(user)
  const passwordHash = setHash(password);

  if (user) {
    return res.json({ error: "This_user_alredy_exists" })
  }
  const userId = await users.createUser(username, passwordHash);
  const sessionId = await users.createSession(userId);
  res.json({ sessionId })
});

routerUsers.post("/login", async (req, res) => {
  const username = req.header('username');
  const password = req.header('username');
  const user = await users.findUserByUsername(username);
  const passwordHash = setHash(password);
  if (!user || user.password_hash !== passwordHash) {
    return res.json({ error: "Wrong name or password" });
  }
  const sessionId = await users.createSession(user._id);
  res.json({ sessionId })
});

routerUsers.get("/logout", authBySessionId(), async (req, res) => {
  if (!req.user) {
    return res.redirect("/");
  }
  await users.deleteSession(req.sessionId);
  res.json({});
});

module.exports = routerUsers;
