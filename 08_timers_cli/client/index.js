const os = require("os");
const path = require("path");
const inquirer = require("inquirer");

const homeDir = os.homedir();
const isWindows = os.type().match(/windows/i);
const sessionFileName = path.join(homeDir, `${isWindows ? "_" : "."}sb-timers-session`);
console.log("File to keep the session ID:", sessionFileName);

const questions = [
  { type: "string", name: "username", message: "Username: " },
  { type: "password", name: "password", message: "Password: " },
];

(async () => {
  const res = await inquirer.prompt(questions);
  console.log(res);
})();
