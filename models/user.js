// import mongoose from 'mongoose';
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: {
    required: true, type: String, trim: true,
  },
  email: {
    type: String, trim: true, validate: {
      validator: (value) => {
        const re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return value.match(re);
      },
      message: 'Please enter a valid email address'
    },
  },

  // cart
}, {strict: false});

const User = mongoose.model('User', userSchema);
// export default User;
module.exports = User;