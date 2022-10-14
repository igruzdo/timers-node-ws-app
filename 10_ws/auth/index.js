const express = require("express");
const nunjucks = require("nunjucks");
const cookieParser = require("cookie-parser");

const WebSocket = require('ws'); 

const users = require("./models/users_model");
const timers = require("./models/timers_model")
const http = require('http')
const { URL } = require("url")

const auth = require("./midlewares/auth");
const authBySessionId = () => auth(users.findUserBySessionID);

const app = express();

nunjucks.configure("views", {
  autoescape: true,
  express: app,
  tags: {
    blockStart: "[%",
    blockEnd: "%]",
    variableStart: "[[",
    variableEnd: "]]",
    commentStart: "[#",
    commentEnd: "#]",
  },
});

app.set("view engine", "njk");

app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/users", require("./routers/users"));
app.use("/api/timers", require("./routers/timers"));

app.get("/", authBySessionId(), (req, res) => {
  res.render("index", {
    user: req.user,
    token: req.sessionId,
    authError: req.query.authError === "true" ? "Wrong username or password" : req.query.authError,
  });
});

const port = process.env.PORT || 3000;

const server = http.createServer(app)

const wss = new WebSocket.Server({clientTracking: false, noServer: true })

server.on("upgrade", async (req, socket, head) => {
  const { searchParams } = new URL(req.url, `http://${req.headers.host}`); 
  const token = searchParams && searchParams.get("token");
  const user = await users.findUserBySessionID(token);
  if(!user) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n")
      socket.destroy();
      return;
  }
  const userId = user._id
  req.userId = userId
  wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req)
  });
});

wss.on("connection", async (ws, req) => {
  const { userId } = req;
  const allTimersByUSerId = await timers.findTimersByUserId(userId);
  const activeTimers = allTimersByUSerId
      .filter((timer) => timer.is_active)
      .map((timer) => ({
        ...timer,
        id: timer._id.toString(),
        progress: Date.now() - timer.start,
      }));

  const oldTimers = allTimersByUSerId
      .filter((timer) => !timer.is_active)
      .map((timer) => ({
        ...timer,
        id: timer._id.toString(),
        duration: timer.end - timer.start,
      }));

  const allTimers = JSON.stringify({
    type: 'all_timers',
    oldTimers: oldTimers,
    activeTimers: activeTimers,
  })

  ws.send(allTimers)

  let activeTimersCount = activeTimers.length
  const intereval = setInterval( async () => {
  const allTimersByUSerId = await timers.findTimersByUserId(userId);

    const activeTimers = allTimersByUSerId
    .filter((timer) => timer.is_active)
    .map((timer) => ({
      ...timer,
      id: timer._id.toString(),
      progress: Date.now() - timer.start,
    }));

    if(activeTimersCount !== activeTimers.length) {
      activeTimersCount = activeTimers.length

      const oldTimers = allTimersByUSerId
          .filter((timer) => !timer.is_active)
          .map((timer) => ({
            ...timer,
            id: timer._id.toString(),
            duration: timer.end - timer.start,
          }));

      const allTimers = JSON.stringify({
        type: 'all_timers',
        oldTimers: oldTimers,
        activeTimers: activeTimers,
      })

      ws.send(allTimers)
    } else {
      const activeTimersMsg = JSON.stringify({
        type: 'active_timers',
        activeTimers: activeTimers,
      })
      ws.send(activeTimersMsg)
    }


  }, 1000)

  ws.on("close", () => {
    clearInterval(intereval)
  });
});

server.listen(port, () => {
  console.log(`Server runned on port ${port}`)
});