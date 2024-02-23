import mysql from 'mysql2/promise';
import User from '../models/user.js';

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
    }
    // console.log(results);
    return user;
  }

  async getFullUsers(mySqlConnection) {
    await User.find({ $limit: 1000});
    let query = `select * from \`easy-aiops\`.\`users\` limit 1000`;
    // await mySqlConnection.execute(query);
    try {
      await mySqlConnection.execute(query);
    } catch (e) {
      console.error('Unable to create user in MySQL. ', e);
    }
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
