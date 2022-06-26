const express = require("express");
const nunjucks = require("nunjucks");
const { nanoid } = require("nanoid");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");

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

const auth = () => async (req, res, next) => {
  if(!req.cookies['sessionId']) {
    return next()
  }

  const user = await findUserBySession(req.cookies['sessionId']);
  req.user = user;
  req.sessionId = req.cookies['sessionId'];
  next();
}

const adminId = nanoid();

const DB = {
  users: [
    {
      _id: adminId,
      username: "admin",
      password: setHash("pwd007"),
    },
  ],
  sessions: {},
  timers: [
    {
      start: Date.now(),
      description: "Timer 1",
      userId: adminId,
      progress: 0,
      isActive: true,
      id: nanoid(),
    },
    {
      start: Date.now() - 5000,
      end: Date.now() - 3000,
      userId: adminId,
      duration: 2000,
      description: "Timer 0",
      isActive: false,
      id: nanoid(),
    },
  ],
};

app.get("/", auth(), (req, res) => {
  res.render("index", {
    user: req.user,
    authError: req.query.authError === "true" ? "Wrong username or password" : req.query.authError,
  });
  countTimer()
});

app.get('/api/timers', auth(), (req, res) => {
  if(!req.user) {
    return res.sendStatus('401')
  }
  if(req.query.isActive === "true") {
    const active = DB.timers.filter(item => item.isActive && item.userId === req.user._id)
    res.send(JSON.stringify(active))
  } else if(req.query.isActive === "false") {
    const old = DB.timers.filter(item => !item.isActive && item.userId === req.user._id)
    res.send(JSON.stringify(old))
  }
})

app.post('/login', bodyParser.urlencoded({extended: false}), async (req, res) => {
  const { username, password } = req.body
  const user = await findUserByName(username);
  const passwordHash = setHash(password);
  if(!user || user.password !== passwordHash) {
    return res.redirect('/?authError=true')
  }
  const sessionId = await createSession(user._id)
  res.cookie('sessionId', sessionId, {httpOnly: true, maxAge: 300000}).redirect('/')
  
})

app.post('/signup', bodyParser.urlencoded({extended: false}), async (req, res) => {
  const { username, password } = req.body
  const user = await findUserByName(username);
  const passwordHash = setHash(password);

  if(user) {
    return res.redirect('/?authError=This_user_alredy_exists')
  }

  const newUser = {
    _id: nanoid(),
    username: username,
    password: setHash(password),
  }

  DB.users.push(newUser)
  const sessionId = await createSession(newUser._id)
  res.cookie('sessionId', sessionId, {httpOnly: true, maxAge: 300000}).redirect('/')
})

app.post('/api/timers', auth(), (req, res) => {
  if(!req.user) {
    return res.sendStatus('401')
  }
  const timer = {
    start: Date.now(),
    userId: req.user._id,
    description: req.body.description,
    progress: 0,
    isActive: true,
    id: nanoid(),
  }
  DB.timers.push(timer)
  countTimer()
  res.json(timer)
})

app.post('/api/timers/:id/stop', auth(), (req, res) => {
  if(!req.user) {
    return res.sendStatus('401')
  }
  DB.timers.forEach(item => {
    if(item.id === req.params.id ) {
      item['duration'] = item.progress,
      delete item.progress
      item['end'] = Date.now(),
      item.isActive = false
    }
  })
  res.json({
    id: req.params.id
  })
})

app.get('/logout', auth(), async (req, res) => {
  if(!req.user) {
    return res.redirect('/');
  }
  await deleteSession(req.sessionId);
  res.clearCookie("sessionId"),res.redirect('/');
})

const intervals = [];

function countTimer() {
  intervals.forEach(item => clearInterval(item))
  DB.timers.filter(item => item?.isActive).forEach(timer => {
    intervals.push(setInterval(() => { 
      timer.progress += 1000
    }, 1000))
  })
}

// You can use these initial data

function setHash(text) {
  const hash = crypto.createHash("sha256");
  return hash.update(text).digest("hex");
}


const findUserByName = async name => {
  return DB.users.find(user => user.username === name)
}

const findUserBySession = async sessionId => {
  const userId = DB.sessions[sessionId]
  if (!userId) {
    return
  }
  return DB.users.find(user => user._id === userId)
}

const createSession = async userId  => {
  const sessionId = nanoid();
  DB.sessions[sessionId] = userId
  return sessionId;
}

const deleteSession = async sessionId => {
  delete DB.sessions[sessionId]
}

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`  Listening on http://localhost:${port}`);
});
