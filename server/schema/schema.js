const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name : { type: String },
    password : { type: String }
});
  
const sessionSchema = new mongoose.Schema({
    name : { type: String }
});

const chatSchema = new mongoose.Schema({
    to : { type: String },
    from : { type: String},
    conversation : {type: Array}
});

const messageSchema = new mongoose.Schema({
    to : { type: String },
    from : { type: String},
    message : {type: String}
});

const tweetSchema = new mongoose.Schema({
    tweet : { type: String },
    date : { type: Date },
    name : { type: String }
});

module.exports = {userSchema, tweetSchema, sessionSchema, chatSchema, messageSchema}
