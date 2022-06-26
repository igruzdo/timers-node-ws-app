const express = require("express");
const nunjucks = require("nunjucks");
const { nanoid } = require("nanoid");

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

app.get("/", (req, res) => {
  res.render("index");
  countTimer();
});

app.get("/api/timers", (req, res) => {
  if (req.query.isActive === "true") {
    const active = TIMERS.filter((item) => item.isActive);
    res.send(JSON.stringify(active));
  } else if (req.query.isActive === "false") {
    const old = TIMERS.filter((item) => !item.isActive);
    res.send(JSON.stringify(old));
  }
});

app.post("/api/timers", (req, res) => {
  const timer = {
    start: Date.now(),
    description: req.body.description,
    progress: 0,
    isActive: true,
    id: nanoid(),
  };
  TIMERS.push(timer);
  countTimer();
  res.json(timer);
});

app.post("/api/timers/:id/stop", (req, res) => {
  TIMERS.forEach((item) => {
    if (item.id === req.params.id) {
      (item["duration"] = item.progress), delete item.progress;
      (item["end"] = Date.now()), (item.isActive = false);
    }
  });
  res.json({
    id: req.params.id,
  });
});

const intervals = [];

function countTimer() {
  intervals.forEach((item) => clearInterval(item));
  TIMERS.filter((item) => item?.isActive).forEach((timer) => {
    intervals.push(
      setInterval(() => {
        timer.progress += 1000;
      }, 1000)
    );
  });
}

// You can use these initial data
const TIMERS = [
  {
    start: Date.now(),
    description: "Timer 1",
    progress: 0,
    isActive: true,
    id: nanoid(),
  },
  {
    start: Date.now() - 5000,
    end: Date.now() - 3000,
    duration: 2000,
    description: "Timer 0",
    isActive: false,
    id: nanoid(),
  },
];

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`  Listening on http://localhost:${port}`);
});
