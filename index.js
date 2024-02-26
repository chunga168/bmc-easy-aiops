import express from 'express';
import mongoose from 'mongoose';
import mysql from 'mysql2/promise';
import winston from 'winston';

import UserService from './services/user.js';
const mongoDbServer = process.env.easyAIOpsDBUrl || 'host.docker.internal';

const DB_URL = `mongodb://admin:qwer1234@${mongoDbServer}:27017/easy-aiops`;
const service = new UserService();

const app = express();
const port = 3000;

// https://www.npmjs.com/package/winston
const { combine, timestamp, label, printf  } = winston.format;
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level.toUpperCase()}: ${message}`;
});

const logger = winston.createLogger({
  level: 'info',
  format: combine(
    label({ label: 'index.js' }),
    timestamp(),
    myFormat
  ),
  // defaultMeta: { service: 'index.js' },
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});


let foreverLoop = false;
let foreverRead = false;
let count = 0;

// https://stackify.com/node-js-logging/
app.use(logRequest);

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
  logger.info(`App listening on port ${port}`);
});

// Connections
console.log('Connecting to: ' +  DB_URL);
mongoose.set('strictQuery', true);
mongoose.connect(DB_URL).
then(() => {
  console.log(`MongoDB connection successful`); 
  logger.info(`MongoDB connection successful`);
}).catch((e) => {
  console.error('Error connecting to MongoDB: ', e);
  logger.error('Error connecting to MongoDB: ', e);
});

let mySqlConnection;

try {
  mySqlConnection = await mysql.createConnection({
     host: mongoDbServer,
     user: 'root',
     password: 'qwer1234',
     database: 'easy-aiops'
   });
   mySqlConnection.execute('SELECT COUNT(*) FROM \`easy-aiops\`.\`users\`').then(results => {
     // console.log(results);
     console.log('MySql connection successful');
     logger.info('MySql connection successful');
   });
} catch (e) {
  console.error('Error connecting to MySQL: ', e);
  logger.error('Error connecting to MySQL: ', e);
}

// APIs
app.get('/createUser', (req, res) => {
    service.createUser(mySqlConnection).then(user => res.send(user));
});

app.get('/generateUsers', (req, res) => {
  foreverLoop = true;  
  foreverLoopFunction();
  res.send('Started creating users');  
});

app.get('/readUsers', (req, res) => {
  foreverRead = true;
  service.getFullUsers(mySqlConnection).then((result) => {    
    res.send(`Started reading users: ${result}`);
  });
  foreverReadFunction();
})

app.get('/loopStatus', (req, res) => {
  service.getFullUsers(mySqlConnection).then((result) => {
    res.send(`Is Looping? ${foreverLoop}<br>${count} users were created.<br>Forever read loop? ${foreverRead}.<br>${result}`);
  });
});

app.get('/stopLoop', (req, res) => {
  foreverLoop = false;
  foreverRead = false;
  res.send(`Stopped creating users. ${count} users were created.`);
});


const foreverLoopFunction = async () => { 
  for (let i = 0; foreverLoop; i++) {
    count = i;
    logger.info('write loop: ' + i);
    await service.createUser(mySqlConnection);
  }
}

const foreverReadFunction = async () => { 
  for (let i = 0; foreverRead; i++) {
    logger.info('read loop: ' + i);
    await service.getFullUsers(mySqlConnection);
  }
}

function logRequest(req, res, next) {
  logger.info(req.method + ' ' + req.url);
  next();
}