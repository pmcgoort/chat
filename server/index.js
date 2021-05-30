const express = require("express");
const path = require('path');
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express();
const url = require('url')

mongoose.connect('mongodb+srv://pmcgoort:65OjfB8fyy0Bzc3Y@cluster0.lptkt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


app.use(cors())

app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())



//Schemas
var userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
})
var User = mongoose.model('User', userSchema)


var conversationSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  conversations: {
    type: Array,
    required: true
  }
})
var Conversation = mongoose.model('Conversation', conversationSchema)

//names will go in alphabetically
var chatSchema = new mongoose.Schema({
  username1: {
    type: String,
    required: true
  },
  username2: {
    type: String,
    required: true
  },
  messages: {
    type: Array,
    required: true
  }
})
var Chat = mongoose.model('Chat', chatSchema)

//creates new users
var createUser = (user, done) => {
  User.findOne({username: user.username}, (err, foundData) => {
    //if user is not found in db then it will add it to the db and new conversations saved
    if(foundData === null){
        user.save((err, data) => {
        if(err){
          return console.error(err)
        }
        //done(null, data)
      })
      const convo = new Conversation({'username':user.username, 'conversations':[]})
      convo.save((err, data) => {
        if(err){
          return console.error(err)
        }
        done(null, data)
      })
    } else if(err){
      done(err)
    } else {
      done(null, null)
    }
  })
}

app.post('/api/newUser', (req, res) => {
  const user = new User({'username': req.body.username, 'password': req.body.password})
  createUser(user, (err, data) => {
    if(err){
      res.send({error: 'Error'})
    } else if(data === null){
      res.send({message: 'user already exists'})
    }
    else {
      res.send({message: 'user added'})
    }
  })
})


//Login
var login = (user, done) => {
  User.findOne({username: user.username, password: user.password}, (err, foundData) => {
    if(foundData){
      done(null, foundData)
    } else {
      done(null, null)
    }
  })
}

var findCoversations = (user, done) => {
  Conversation.findOne({username: user.user}, (err, foundData) => {
    if(foundData){
      done(null, foundData)
    } else {
      //if no conversations are found it will return null, but it shouldn't be able to get this far if the user is not in the db
      done(null, null)
    }
  })
}

app.post('/api/login', (req, res) => {
  const user = new User({'username': req.body.username, 'password': req.body.password})
  login(user, (err, data) => {
    if(err){
      res.send({error: 'Error'})
    } else if(data === null){
      res.send({message: 'Check username and password'})
    }
    else {
      res.redirect('../conversations/?user=' + user.username)
      res.end()
    }
  })
})


//looks for who's conversation it need to return
app.get('/api/findConvos', (req, res) => {
  const user = req.query
  findCoversations(user, (err, data) => {
    res.json(data)
  })
})


//adds conversation pairing to db
var newConversation = (convoPartners, done) => {
  Conversation.findOne({username: convoPartners[1]}, (err, foundData) => {
    if(foundData){
      //search to see if conversation between these two already exists
      let convoPartnerExists = false
      let convos = foundData.conversations
      for(let i = 0; i < convos.length; i++){
        if(convos[i] === convoPartners[0]){
          convoPartnerExists = true
          break
        }
      }
      if(!convoPartnerExists){
        Conversation.updateOne({username: foundData.username}, {conversations: [...foundData.conversations, convoPartners[0]]}, (err, update) => {
          if(err) console.log(err)
        })
        done(null, null)
      }
    }
  })
}


var newChat = (convoPartners, done) => {
  //names need to be put into the chat alphabetically to aid with search
  var alphabeticalConvoPartners = [...convoPartners]
  if(convoPartners[0] > convoPartners[1]){
    alphabeticalConvoPartners = alphabeticalConvoPartners.reverse()
  }
  //creates empty chat
  const chat = new Chat({'username1': alphabeticalConvoPartners[0], 'username2': alphabeticalConvoPartners[1], 'messages': []})
  chat.save((err, data) => {
    if(err){
      return console.error(err)
    }
  })
}


//adds new conversation partner
app.post('/api/newConvoPartner', (req, res) => {
  var convoPartners = [req.body.convoPartner, req.body.user]
  //checks if convoPartner exists in user database
  User.findOne({username: convoPartners[0]}, (err, foundData) => {
    if(foundData){
      newConversation([req.body.convoPartner, req.body.user], (err, data) => {
        if(err){
          res.send({error: 'Error'})
        }
      })
      newConversation([req.body.user, req.body.convoPartner], (err, data) => {
        if(err){
          res.send({error: 'Error'})
        }
      })

      newChat([req.body.user, req.body.convoPartner], (err, data) => {
        if(err){
          res.send({error: 'Error'})
        }
      })
      res.redirect('../chat?user=' + req.body.user + '&recipient=' + req.body.convoPartner)
    } else {
      res.send({error: 'User does not exist'})
    }
  })
})


var addMessage = (message, sender, recipient, done) => {
  var alphabeticalConvoPartners = [sender]
  if(recipient > sender){
    alphabeticalConvoPartners.push(recipient)
  } else {
    alphabeticalConvoPartners.unshift(recipient)
  }

  Chat.updateOne({username1: alphabeticalConvoPartners[0], username2: alphabeticalConvoPartners[1]}, {$push: {messages: [[message, sender]]}}, (err, update) => {
    if(err) console.log(err)
    done(null, update)
  })
}

//add new messages in chatSchema
app.post('/api/newMessage', (req, res) => {
  var message = req.body.newMessage
  var sender = req.body.sender
  var recipient = req.body.recipient

  addMessage(message, sender, recipient, (err, data) => {
    if(err){
      res.send({error: 'Error'})
    }
    res.redirect(req.get('referer'));
  })
})


//finds the chat that has the users in it
var findChats = (users, done) => {
  Chat.findOne({username1: users[0], username2: users[1]}, (err, foundData) => {
    if(foundData){
      done(null, foundData)
    } else {
      done(null, null)
    }
  })
}

app.get('/api/findChats', (req, res) => {
  var users = [req.query.user]

  if(users[0] < req.query.recipient){
    users.push(req.query.recipient)
  } else {
    users.unshift(req.query.recipient)
  }

  findChats(users, (err, data) => {
    res.json(data)
  })
})

//function deletes chat array and conversation array between these two users
var deleteConversation = (users, done) => {
  Chat.deleteOne({username1: users.username1, username2: users.username2}, (err, remove) => {
    if(err) console.log(err)
    done(null, remove)
  })

  Conversation.findOne({username: users.username1}, (err, foundData) => {
    let conversations = foundData.conversations
    for(let i = 0; i < conversations.length; i++){
      if(conversations[i] === users.username2){
        conversations.splice(i, 1)
        break
      }
    }
    Conversation.updateOne({username: users.username1}, {$set: {conversations: conversations}}, (err, update) => {
      if(err) console.log(err)
      done(null, update)
    })
  })

  //same thing as above but with username1 and 2 reversed
  Conversation.findOne({username: users.username2}, (err, foundData) => {
    let conversations = foundData.conversations
    for(let i = 0; i < conversations.length; i++){
      if(conversations[i] === users.username1){
        conversations.splice(i, 1)
        break
      }
    }
    Conversation.updateOne({username: users.username2}, {$set: {conversations: conversations}}, (err, update) => {
      if(err) console.log(err)
      done(null, update)
    })
  })
}

//deletes conversations
app.delete('/api/deleteConversation', (req, res) => {
  deleteConversation(req.query, (err, data) => {
    res.end()
  })
})


// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../client/build')));

// Handle GET requests to /api route
app.get('/api', (req, res) => {
  res.json({message:'hey'})
})

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/public', 'index.html'));
});



const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
