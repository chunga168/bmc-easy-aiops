import express from 'express';
import mongoose from 'mongoose';
// import mysql from 'mysql2/promise';

import UserService from './services/user.js';
const mongoDbServer = process.env.easyAIOpsDBUrl || 'host.docker.internal';

const DB_URL = `mongodb://admin:qwer1234@${mongoDbServer}:27017/easy-aiops`;
const service = new UserService();

const app = express();
const port = 3000;

let foreverLoop = false;
let foreverRead = false;
let count = 0;

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});

// Connections
console.log('Connecting to: ' +  DB_URL);
mongoose.set('strictQuery', true);
mongoose.connect(DB_URL).
then(() => {
  console.log(`MongoDB connection successful`); 

}).catch((e) => {
  console.error('Error connecting to MongoDB: ', e);
});

const mySqlConnection = '';

// const mySqlConnection = await mysql.createConnection({
//   host: 'host.docker.internal',
//   user: 'root',
//   password: 'qwer1234',
//   database: 'easy-aiops'
// });

// mySqlConnection.execute('SELECT COUNT(*) FROM \`easy-aiops\`.\`users\`').then(results => {
//   // console.log(results);
//   console.log('MySql connection successful');  
// });

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
  foreverReadFunction();
  res.send('Started reading users');
})

app.get('/loopStatus', (req, res) => {
  res.send(`Is Looping? ${foreverLoop}<br>${count} users were created.<br>Forever read loop? ${foreverRead}`);
});

app.get('/stopLoop', (req, res) => {
  foreverLoop = false;
  foreverRead = false;
  res.send(`Stopped creating users. ${count} users were created.`);
});


const foreverLoopFunction = async () => { 
  for (let i = 0; foreverLoop; i++) {
    count = i;
    console.log('i: ' + i);
    await service.createUser(mySqlConnection);
  }
}

const foreverReadFunction = async () => { 
  for (let i = 0; foreverRead; i++) {
    console.log('read loop: ' + i);
    await service.getFullUsers(mySqlConnection);
  }
}