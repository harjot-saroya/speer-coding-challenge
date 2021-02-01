const { sessionSchema } = require("./schema/schema.js");
const { CreateUser, UserExists, LoginHandler, IsSessionEmpty, LogOut, GetTweet, OwnsTweet, GetCurrentUser, SendMessage, RecieveMessages, DeleteTweet, PostTweet, UpdateTweet} = require("./helpers/functions.js")
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyparser = require("body-parser");
const app = express();

mongoose.connect("mongodb+srv://test:MSj0qSzKCHhkDZbK@cluster0.xn96g.mongodb.net/speer", {
  useNewUrlParser: true
  });
const conn = mongoose.connection;

app.use(cors());
app.use(bodyparser.urlencoded({ extended: true }));

app.post("/createuser/", async(req, res) => {
  // Creates user if they don't already exist
  const name = req.body.name
  const password = req.body.password
  const searched = await UserExists(name)
  const SessionEmpty = await IsSessionEmpty()
  if (SessionEmpty){
    if (searched){
      res.status(403).send("User already exists")
    }
    else {
      await CreateUser(name,password)
      res.status(200).send("User " + name + " Was created!")
    }
  }
  else {
    res.status(403).send("Must be logged out to create an account")
  }
  
});

app.post("/login/", async(req, res) => {
  // Logs user into session
  const name = req.body.name
  const password = req.body.password
  const search = await LoginHandler(name,password)
  // If not searched turn error (204)
  if(!search){
    res.status(404).send("Incorrect username or password")
  }
  const sessionEmpty = await IsSessionEmpty()
  if (sessionEmpty){
    const session = mongoose.model('session', sessionSchema);
    const db = conn.collection('session')
    const Session = new session({name})
    db.insertOne(Session)
    res.status(200).send("Welcome "+name)
  }
  else
  {
    res.status(403).send("Somebody is already logged in!")
  }
});

app.get("/logout/", async(req, res) => {
  // Logs user out of session
  const SessionEmpty = await IsSessionEmpty()
  if (!SessionEmpty){
    const CurrUser = await GetCurrentUser()
    await LogOut()
    res.status(200).send(CurrUser + " was successfully logged out!")
  }
  else {
    res.status(511).send("Must be logged in first!")
  }
});

app.post("/chat/send", async(req, res) => {
  // Send a direct message to both users (cannot be deleted)
  const SessionEmpty = await IsSessionEmpty()
  if (!SessionEmpty){
    const CurrUser = await GetCurrentUser()
    const TargetUser = req.body.target
    const Message = req.body.message
    await UserExists(TargetUser) ? await SendMessage(CurrUser,TargetUser,Message) : res.status(404).send("User not found")
    res.status(200).send("Message sent!")
  }
  else {
    res.status(511).send("Must be logged in to send messages!")
  }
});

app.get("/chat/recieve", async(req, res) => {
  // Recieves entire chat log for currently logged in user
  const SessionEmpty = await IsSessionEmpty()
  if (!SessionEmpty){
    const CurrUser = await GetCurrentUser()
    const messages = await RecieveMessages(CurrUser)
    res.json('200', messages)
  }
  else {
    res.status(511).send("Must be logged in to recieve messages!")
  }
});

app.post("/tweet/post", async(req, res) => {
  // Posts a tweet
  const SessionEmpty = await IsSessionEmpty()
  if (!SessionEmpty){
    const CurrUser = await GetCurrentUser()
    const tweet = req.body.tweet
    await PostTweet(tweet,CurrUser)
    res.json('200', "Tweet posted")
  }
  else {
    res.status(511).send("Must be logged in to recieve messages!")
  }
});

app.post("/tweet/update", async(req, res) => {
  // User must know their tweet object Id that is stored in mongodb to update their tweet
  const SessionEmpty = await IsSessionEmpty()
  if (!SessionEmpty){
    const CurrUser = await GetCurrentUser()
    const id = req.body.id
    const tweet = req.body.tweet
    const check = await OwnsTweet(CurrUser,id)
    console.log(check)
    if (check){
      await UpdateTweet(tweet,id)
      res.json('200', "Tweet updated")
    }
    else {
      res.status(403).send("Tweet does not exist or is not owned by you")
    }
  }
  else {
    res.status(511).send("Must be logged in to recieve messages!")
  }
});

app.delete("/tweet/delete", async(req, res) => {
  // Allows a user to delete a tweet given their tweet id
  const SessionEmpty = await IsSessionEmpty()
  if (!SessionEmpty){
    const CurrUser = await GetCurrentUser()
    const id = req.body.id
    const check = await OwnsTweet(CurrUser,id)
    if (check){
      await DeleteTweet(id)
      res.json('200', "Tweet Deleted")
    }
    else {
      res.status(403).send("Tweet does not exist or is not owned by you")
    }
  }
  else {
    res.status(511).send("Must be logged in to recieve messages!")
  }
});

app.get("/tweet/get", async(req, res) => {
  // Shows tweets in order by date
  const SessionEmpty = await IsSessionEmpty()
  if (!SessionEmpty){
    const result = await GetTweet()
    res.json('200', result)
  }
  else {
    res.status(511).send("Must be logged in to recieve messages!")
  }
});


var listener = app.listen(8888, () => console.log("listening on port "+ listener.address().port));
