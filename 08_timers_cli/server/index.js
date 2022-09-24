const express = require("express");
const app = express();

app.use(express.json());

app.use("/api/users", require("./routers/users"));
app.use("/api/timers", require("./routers/timers"));

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`  Listening on http://localhost:${port}`);
});
