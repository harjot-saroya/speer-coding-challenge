const mongoose = require("mongoose");
const ObjectID = require('mongodb').ObjectID
const { messageSchema, chatSchema, userSchema, tweetSchema } = require("../schema/schema.js");

mongoose.connect("mongodb+srv://test:MSj0qSzKCHhkDZbK@cluster0.xn96g.mongodb.net/speer", {
  useNewUrlParser: true
});
const conn = mongoose.connection;

const UserExists = async(name) => {
    const db = await conn.collection('users')
    const result = await db.findOne({name: name})
    return Boolean(result)
}

const CreateUser = async(name,password) => {
    const User = mongoose.model('user', userSchema);
    const db = conn.collection('users')
    const test = new User({ name, password })
    await db.insertOne(test)
}

const OwnsTweet = async(name,id) => {
    const db = await conn.collection('tweets')
    id = id.toString()
    if (id.length !=  24) {
        return false
    }
    const result = await db.findOne({_id: ObjectID(id)})
    if (!result) {
        return false
    }
    return true
}
  
const LoginHandler = async(name,password) => {
    const db = await conn.collection('users')
    const result = await db.findOne({name: name})
    const retv = result ? (name == result.name) && (password == result.password) : false
    return retv
}
  
const IsSessionEmpty = async() => {
    const db = await conn.collection('session')
    const result = await db.countDocuments()
    return result == 0
}
  
const LogOut = async() => {
    const db = await conn.collection('session')
    await db.deleteMany({})
}
const GetCurrentUser = async() => {
    const db = await conn.collection('session')
    const result = await db.findOne({})
    return result.name
}
  
const SendMessage = async(from,to,message) => {
    const db = await conn.collection('chat')
    const user1 = await db.findOne({to,from})
    const user2 = await db.findOne({from,to})
    const chatToCurr = user1 ? user1.conversation : []
    const chatToUser = user2 ? user2.conversation : []
    const MessageModel = mongoose.model('message', messageSchema);
    const MessageTo = new MessageModel({ to, from, message })
    const MessageFrom = new MessageModel({ from, to, message })
    chatToCurr.push(MessageTo)
    chatToUser.push(MessageFrom)
    const ChatModel = mongoose.model('chat', chatSchema);
    const Chat1 = new ChatModel({ to, from, conversation:chatToCurr })
    const Chat2 = new ChatModel({ to:from, from:to, conversation:chatToUser })
    chatToCurr.length == 1 ? await db.insertOne(Chat1) : await db.updateOne({ to,from } , { $set:{ conversation:chatToCurr } })
    chatToUser.length == 1 ? await db.insertOne(Chat2) : await db.updateOne({ to:from,from:to } , { $set:{ conversation:chatToCurr } })
}
  
const RecieveMessages = async(user) => {
    const db = await conn.collection('chat')
    const result = await db.find({ to:user }).toArray()
    return result
}

const PostTweet = async(tweet,name) => {
    const date = new Date()
    const TweetModel = mongoose.model('tweet', tweetSchema);
    const db = conn.collection('tweets')
    const Tweet = new TweetModel({ tweet, name, date })
    await db.insertOne(Tweet)
}

const DeleteTweet = async(id) => {
    const db = conn.collection('tweets')
    await db.deleteOne({ _id: ObjectID(id.toString())})
}

const UpdateTweet = async(tweet, id) => {
    const db = conn.collection('tweets')
    await db.updateOne({ _id: ObjectID(id.toString())} , { $set:{ tweet } })
}

const GetTweet = async() => {
    const db = conn.collection('tweets')
    const tweets = await db.find({}).sort({date: -1}).toArray()
    return tweets
}

module.exports = { CreateUser, UserExists, LoginHandler, IsSessionEmpty, LogOut, GetCurrentUser, SendMessage, RecieveMessages, PostTweet, UpdateTweet, OwnsTweet, DeleteTweet, GetTweet }
