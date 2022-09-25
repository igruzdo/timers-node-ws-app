import { createRequire } from "module";
import fetch from 'node-fetch';
const require = createRequire(import.meta.url);
const os = require("os");
const path = require("path");
const inquirer = require("inquirer");
const fs = require("fs");
const Table = require("cli-table")
require("dotenv").config()

const homeDir = os.homedir();
const isWindows = os.type().match(/windows/i);
const sessionFileName = path.join(homeDir, `${isWindows ? "_" : "."}sb-timers-session`);
console.log("File to keep the session ID:", sessionFileName);

const dateTransform = (start, end, is_active) => {
  let time;
  let hours
  let minutes
  let secs
  if(is_active) {
    hours = Math.floor(parseInt((new Date() - new Date(start))/1000)/60/60)
    minutes = Math.floor((parseInt((new Date() - new Date(start))/1000) - (hours*60*60))/60)
    secs = Math.floor(parseInt((new Date() - new Date(start))/1000) - ((hours*60*60) + minutes*60))
    } else {
    hours = Math.floor(parseInt((new Date(end) - new Date(start))/1000)/60/60)
    minutes = Math.floor((parseInt((new Date(end) - new Date(start))/1000) - (hours*60*60))/60)
    secs = Math.floor(parseInt((new Date(end) - new Date(start))/1000) - ((hours*60*60) + minutes*60))
  }

  let hourStr = hours > 9 ? `${hours}` : `0${hours}`
  let minStr = minutes > 9 ? `${minutes}` : `0${minutes}`
  let secStr = secs > 9 ? `${secs}` : `0${secs}`

  time = `${hourStr}:${minStr}:${secStr}`
  return time
}

const getSessionId = async ({username, password}, url) => {
  let dataInFile;

  let fullUrl;
  let successMsg;

  switch(url) {
    case 'signup':
      fullUrl = `${process.env.SERVER_URL}/api/users/signup`
      successMsg = 'Signed up successfully!'
      break
    case 'login':
      fullUrl = `${process.env.SERVER_URL}/api/users/login`
      successMsg = 'Logged in successfully!'
      break
    default:
      throw console.error(`Not known command ${url}`)
  }

  await fetch(fullUrl, {
    method: "POST",
    headers: {'username': `${username}`, 'password': `${password}`}
  })
    .then(data => data.json())
    .then(data => {
      dataInFile = data.sessionId
      if(!dataInFile) {
        throw new Error('Wrong name or password', 103)
      }
    })

    await fs.writeFile(sessionFileName, `${dataInFile}`, 'utf8', (err) => {
      if(err) console.error(err, 103)
      console.log(successMsg)
    });
}

const start = async () => {
  console.log(process.argv)
  if(!process.argv[3]) {
    throw new Error('Enter description please', 404)
  }

  await fs.readFile(sessionFileName, 'utf8', (err, data) => {
    if(err) {
      throw new Error(err, 103)
    }
    fetch(`${process.env.SERVER_URL}/api/timers`, {
      method: "POST",
      headers: {'sessionId': data, 'description': process.argv[3]}
    })
      .then(data => data.json())
      .then(data => {
        console.log(`Started timer "${process.argv[3]}", ID: ${data.id}.`)
      })
      .catch(err => {
        console.log(err)
      })
  });
}

const stop = async () => {
  if(!process.argv[3]) {
    throw new Error('Enter timer ID', 404)
  }

  await fs.readFile(sessionFileName, 'utf8', (err, data) => {
    if(err) {
      throw new Error(err, 103)
    }

    fetch(`${process.env.SERVER_URL}/api/timers/${process.argv[3]}/stop`, {
      method: "POST",
      headers: {'sessionId': `${data}`, 'id': `${process.argv[3]}`}
    })
      .then(data => data.json())
      .then(data => {
        if(data.id) {
          console.log(`Timer ${data.id} stopped.`)
        }
        else {
          console.log(data.error)
        }
      })
  })
}

const status = async () => {
  await fs.readFile(sessionFileName, 'utf8', (err, data) => {
    if(err) {
      throw new Error(err, 103)
    }

    fetch(`${process.env.SERVER_URL}/api/timers/`, {
      method: "GET",
      headers: {'sessionId': `${data}`}
    })
      .then(data => data.json())
      .then(data => {
        const table = new Table({
          head: ['ID', 'Name', 'Time', 'IsActive'],
          colWidths: [30, 30, 10, 10]
        })
        if(!process.argv[3]) {
          data.forEach(item => {
            let time = dateTransform(item.start, item.end, item.is_active);
            table.push([item._id, item.description, time, item.is_active])
          })
          console.log(table.toString())
        } else {
          const timerExist = data.some(item => item._id === process.argv[3]);
          if(timerExist) {
            const itemInData = data.filter(item => item._id === process.argv[3])[0]
            let time = dateTransform(itemInData.start, itemInData.end, itemInData.is_active);
            table.push([itemInData._id, itemInData.description, time, itemInData.is_active])
            console.log(table.toString())
          } else {
            console.log(`Unknown timer ID ${process.argv[3]}.`)
          }
        }
      })
  })
}

const questions = [
  { type: "string", name: "username", message: "Username: " },
  { type: "password", name: "password", message: "Password: " },
];

(async () => {
  switch(process.argv[2]) {
    case 'signup':
    case 'login':
      await fs.readFile(sessionFileName, 'utf8', (err, data) => {
        if(data) {
          console.log('You are alredy logged in!')
          throw new Error('You are alredy logged in!', 103)
        } else {
          return
        };
      });
      const res = await inquirer.prompt(questions);
      getSessionId(res, process.argv[2])
      break

    case 'logout':
      fs.unlink(sessionFileName, (err) => {
        if(err) throw err;
        console.log('Logged out successfuly!');
    });
    break;
    case 'start':
      start();
      break;
    case 'stop':
      stop();
      break;
    case 'status':
      status();
      break;
  }
})();
