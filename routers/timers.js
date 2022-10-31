const express = require("express");
const users = require("../models/users_model");
const timers = require("../models/timers_model");
const auth = require("../midlewares/auth");

const authBySessionId = () => auth(users.findUserBySessionID);

const routerTimers = express.Router();

routerTimers.post("/", authBySessionId(), async (req, res) => {
  if (!req.user) {
    return res.sendStatus("401");
  }
  const timer = {
    userId: req.user._id,
    description: req.header("username"),
  };

  const idTimer = await timers.createTimer({ ...timer });
  res.json({
    ...timer,
    progress: 0,
    isActive: true,
    id: idTimer,
  });
});

routerTimers.post("/:id/stop", authBySessionId(), async (req, res) => {
  if (!req.user) {
    return res.sendStatus("401");
  }
  await timers.stopTimer(req.params.id);
  res.json({
    id: req.params.id,
  });
});

module.exports = routerTimers;
