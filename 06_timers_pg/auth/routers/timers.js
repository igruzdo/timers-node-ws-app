const express = require('express');
const users = require("../models/users_model")
const timers = require("../models/timers_model")
const auth = require("../midlewares/auth")

const authBySessionId = () => auth(users.findUserBySessionID)

//"/api/timers"

const routerTimers = express.Router();

routerTimers.get('/', authBySessionId(), async (req, res) => {
  if (!req.user) {
    return res.sendStatus('401')
  }

  const allTimersByUSerId = await timers.findTimersByUserId(req.user.id)

  if (req.query.isActive === "true") {
    const active = allTimersByUSerId.filter(timer => timer.is_active).map((timer) => ({
      ...timer,
      progress: Date.now() - timer.start,
    }))
    res.send(JSON.stringify(active))
  } else if (req.query.isActive === "false") {
    const desactive = allTimersByUSerId.filter(timer => !timer.is_active).map((timer) => ({
      ...timer,
      duration: timer.end - timer.start,
    }))
    res.send(JSON.stringify(desactive))
  }
})

routerTimers.post('/', authBySessionId(), async (req, res) => {
  if (!req.user) {
    return res.sendStatus('401')
  }
  const timer = {
    userId: req.user.id,
    description: req.body.description,
  }

  const idTimer = await timers.createTimer({ ...timer })
  res.json({
    ...timer,
    progress: 0,
    isActive: true,
    id: idTimer
  })
})

routerTimers.post('/:id/stop', authBySessionId(), async (req, res) => {
  if (!req.user) {
    return res.sendStatus('401')
  }
  await timers.stopTimer(req.params.id)
  res.json({
    id: req.params.id
  })
})

module.exports = routerTimers
