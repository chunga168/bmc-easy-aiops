import mysql from 'mysql2/promise';
import User from '../models/user.js';
import winston from 'winston';

const { combine, timestamp, label, printf  } = winston.format;
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level.toUpperCase()}: ${message}`;
});

const logger = winston.createLogger({
  level: 'info',
  format: combine(
    label({ label: 'services/user' }),
    timestamp(),
    myFormat
  ),
  // defaultMeta: { service: 'index.js' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});


export default class UserService {
  constructor() {
    this.model = User;    
  }
  
  async createUser(mySqlConnection) {
    let username = makeid(10);
    let email = `${username}@fakeemail.com`;

    // MongoDB
    let user = new User({ username, email });
    user = await user.save();

    // MySQL
    let query = `INSERT INTO \`easy-aiops\`.\`users\` (\`username\`, \`email\`) VALUES ('${username}', '${email}')`;
    // console.log('MySQL query: ' + query);

    try {
      
      const [results] = await mySqlConnection.execute(query);
    } catch (e) {
      console.error('Unable to create user in MySQL. ', e);
      logger.error('Unable to create user in MySQL. ', e);
    }
    // console.log(results);
    logger.info(`${username} created.`);
    return user;
  }

  async getFullUsers(mySqlConnection) {
    let result = '';
    let users = await User.find();
    // console.log('users: ' + users.length);
    result += `MongoDB: ${users.length}. `;
    
    let query = `select * from \`easy-aiops\`.\`users\``;    
    try {
      let [results ] = await mySqlConnection.execute(query);
      result += `MySQL: ${results.length}. `;
    } catch (e) {
      console.error('Unable to create user in MySQL. ', e);
      logger.error('Unable to create user in MySQL. ', e);
    }
    logger.info(result);
    return result;
  }
}


function makeid(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}
