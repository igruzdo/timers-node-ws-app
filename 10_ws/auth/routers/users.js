const express = require("express");
const setHash = require("../utils/hash");
const bodyParser = require("body-parser");
const users = require("../models/users_model");
const auth = require("../midlewares/auth");
const authBySessionId = () => auth(users.findUserBySessionID);

const routerUsers = express.Router();

routerUsers.post("/signup", bodyParser.urlencoded({ extended: false }), async (req, res) => {
  const { username, password } = req.body;
  const user = await users.findUserByUsername(username);
  const passwordHash = setHash(password);

  if (user) {
    return res.redirect("/?authError=This_user_alredy_exists");
  }
  const userId = await users.createUser(username, passwordHash);
  const sessionId = await users.createSession(userId);
  res.cookie("sessionId", sessionId, { httpOnly: true, maxAge: 300000 }).redirect("/");
});

routerUsers.post("/login", bodyParser.urlencoded({ extended: false }), async (req, res) => {
  const { username, password } = req.body;
  const user = await users.findUserByUsername(username);
  const passwordHash = setHash(password);
  if (!user || user.password_hash !== passwordHash) {
    return res.redirect("/?authError=true");
  }
  const sessionId = await users.createSession(user._id);
  res.cookie("sessionId", sessionId, { httpOnly: true, maxAge: 300000 }).redirect("/");
});

routerUsers.get("/logout", authBySessionId(), async (req, res) => {
  if (!req.user) {
    return res.redirect("/");
  }
  await users.deleteSession(req.sessionId);
  res.clearCookie("sessionId"), res.redirect("/");
});

module.exports = routerUsers;
