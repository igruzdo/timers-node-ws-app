require("dotenv").config()

const express = require("express");
const nunjucks = require("nunjucks");
const cookieParser = require("cookie-parser");
const users = require("./models/users_model")

const auth = require("./midlewares/auth")
const authBySessionId = () => auth(users.findUserBySessionID)

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
    authError: req.query.authError === "true" ? "Wrong username or password" : req.query.authError,
  });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`  Listening on http://localhost:${port}`);
});
