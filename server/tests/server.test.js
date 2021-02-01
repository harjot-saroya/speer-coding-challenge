const { CreateUser, UserExists, LoginHandler, IsSessionEmpty, LogOut, GetTweet, OwnsTweet, GetCurrentUser, SendMessage, RecieveMessages, DeleteTweet, PostTweet, UpdateTweet} = require("../helpers/functions.js")
const ObjectID = require('mongodb').ObjectID
const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://test:MSj0qSzKCHhkDZbK@cluster0.xn96g.mongodb.net/speer", {
  useNewUrlParser: true
});
const conn = mongoose.connection;

const createMockUser = async(user) => {
    const p1 = '123'
    await CreateUser(user,p1)
    return user
}

afterAll(async() => {
    const db = await conn.collection('users')
    const db2 = await conn.collection('tweets')
    const db3 = await conn.collection('session')
    const db4 = await conn.collection('chat')
    await db.deleteMany({})
    await db2.deleteMany({})
    await db3.deleteMany({})
    await db4.deleteMany({})
});
  
test('Checks database for input username', async() => {
    const user = await createMockUser('Harjot')
    expect(await UserExists(user)).toBe(true);
});

test('Checks database for input username', async() => {
    expect(await UserExists('george')).toBe(false);
  });

test('Creates a new user', async() => {
    const user = await createMockUser('Harjot')
    expect(await UserExists(user.toString())).toBe(true);
});

test('Attempts login', async() => {
    const user = await createMockUser('Harjot')
    expect(await LoginHandler(user,'123')).toBe(true);
});

test('Attempts login', async() => {
    const user = await createMockUser('Harjot')
    expect(await LoginHandler(user,'12345')).toBe(false);
});

test('Checks session status', async() => {
    const db = await conn.collection('session')
    await db.insertOne({name:'test'})
    expect(await IsSessionEmpty()).toBe(false);
    await db.deleteMany({})
});

test('Checks session status', async() => {
    const db = await conn.collection('session')
    await db.deleteMany({})
    expect(await IsSessionEmpty()).toBe(true);
});

test('Logs user out', async() => {
    const db = await conn.collection('session')
    await db.insertOne({name:'test'})
    await LogOut()
    expect(await IsSessionEmpty()).toBe(true);
});

test('Returns current logged in user', async() => {
    const db = await conn.collection('session')
    await db.insertOne({name:'Harjot'})
    expect(await GetCurrentUser()).toBe('Harjot');
});

test('Sends and receives a user a direct message', async() => {
    const db = await conn.collection('chat')
    const user1 = await createMockUser('Harjot')
    const user2 = await createMockUser('Robot')
    await SendMessage(user1,user2,'unique message')
    const msg = await RecieveMessages(user1)
    expect(msg[0].conversation[0].message).toBe('unique message')
});

test('Receives direct messages sent to current user', async() => {
    const db = await conn.collection('chat')
    const user1 = await createMockUser('Harjot')
    const user2 = await createMockUser('Robot')
    await SendMessage(user1,user2,'unique message')
    const msg = await RecieveMessages(user1)
    expect(msg[0].conversation[0].message).toBe('unique message')
});

test('Posts a tweet', async() => {
    const db = await conn.collection('tweets')
    const user = await createMockUser('Harjot')
    await PostTweet('Hello there!',user)
    const result = await db.findOne({name:user})
    expect(result.tweet).toBe('Hello there!');
});

test('Gets all tweets', async() => {
    const db = await conn.collection('tweets')
    const result = await GetTweet();
    expect(result[0].tweet).toBe('Hello there!');
});

test('Updates a tweet', async() => {
    const db = await conn.collection('tweets')
    const result = await db.findOne({name:'Harjot'})
    await UpdateTweet('Goodbye!',result._id);
    const result2 = await db.findOne({name:'Harjot'})
    expect(result2.tweet).toBe('Goodbye!');
});

test('Deletes a tweet', async() => {
    const db = await conn.collection('tweets')
    const result = await db.findOne({name:'Harjot'})
    await DeleteTweet(result._id)
    const result2 = await db.findOne({name:'Harjot'})
    expect(result2).toBe(null);
});

test('Checks if current user owns tweet', async() => {
    const db = await conn.collection('tweets')
    const user = await createMockUser('Harjot')
    await PostTweet('Hello there!',user)
    const res = await db.findOne({name:'Harjot'})
    console.log(res)
    console.log(res._id)
    const result = await OwnsTweet('Harjot',res._id)
    expect(result).toBe(true);
});
