const express = require("express");
const users = require("../models/users_model");
const timers = require("../models/timers_model");
const auth = require("../midlewares/auth");

const authBySessionId = () => auth(users.findUserBySessionID);

const routerTimers = express.Router();

routerTimers.get("/", authBySessionId(), async (req, res) => {
  if (!req.user) {
    return res.sendStatus("401");
  }

  const allTimersByUSerId = await timers.findTimersByUserId(req.user._id);
  res.send(JSON.stringify(allTimersByUSerId));
});

routerTimers.post("/", authBySessionId(), async (req, res) => {
  if (!req.user) {
    return res.sendStatus("401");
  }
  const timer = {
    userId: req.user._id,
    description: req.header('description'),
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
  const modifiedCount = await timers.stopTimer(req.params.id);

  if(modifiedCount > 0) {
    res.json({
      id: req.params.id,
    });
  } else {
    res.json({
      error: `Timer  ID = ${req.params.id} not exist`,
    });
  }
});

module.exports = routerTimers;
