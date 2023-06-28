var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const dbConn = "mongodb+srv://harsheydevs:harshkaaccount@rankguesser.zszfjfg.mongodb.net/Clips";
const randomNumber = require('random-number');
let alert = require('alert');
const notifier = require('node-notifier');
const client = mongoose.connect(dbConn, { useNewUrlParser: true, useUnifiedTopology: true });
const clients = MongoClient.connect(dbConn);
const session = require('express-session');

async function main() {
  const uri = dbConn;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    await listDatabases(client);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

var db;
var collection;

async function listDatabases(client) {
  databasesList = await client.db().admin().listDatabases();
  db = client.db("Clips");
  collectionsList = await db.listCollections().toArray();
  collection = db.collection("Note");
}

const dbName = 'Clips';
const collectionName = 'Bgmis';

var optionss = {
  min: 1,
  max: 20000,
  integer: true
};

var xx = randomNumber(optionss);
const userInput = xx;
const ui = 897;
var record_final;

async function findRecordByUniqueNumber() {
  try {
    const client = await MongoClient.connect(dbConn);
    const db = client.db('Clips');
    const collection = db.collection('bgmis');

    const records = await collection.find().toArray();
    const arr = [];
    for (const z of records) {
      const xValue = z.unique_no;
      arr.push(xValue);
    }
    console.log('Array of column x values:');
    console.log(arr);
    const randomIndex = Math.floor(Math.random() * arr.length);
    var ran = arr[randomIndex];

    record = await collection.findOne({ unique_no: ran });
    const cursor = collection.find();
    if (record) {
      console.log('Record found:');
      console.log(record);
      record_final = record;
    } else {
      console.log('Record not found');
    }
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    console.log();
  }
}

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use("/public", express.static(path.join(__dirname, "public")))


app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

let totalVisitors = 0;

app.use(function(req, res, next) {
  totalVisitors++;
  next();
});


const notesSchema = {
  unique_no: Number,
  link: String,
  name: String,
  rank: String
};

const bgmisSchema = {
  unique_no: Number,
  link: String,
  name: String,
  rank: String
};

const bgmis = mongoose.model("bgmis", bgmisSchema);

const authenticationSchema = {
  username: String,
  password: String,
  rankofuser: Number
};

const auth = mongoose.model("auth", authenticationSchema);

app.get('/login', function (req, res) {
    // res.sendFile(__dirname + "/public/login.html")
    console.log("totalVisitors: ", totalVisitors)
    res.render('login', { totalVisitors: totalVisitors });
  });
  
  app.post('/login', async function (req, res) {
    console.log("in here");
    const username = req.body.username;
    const password = req.body.password;
  
    try {
      const founduser = await auth.findOne({ username: username });
      if (founduser) {
        if (founduser.password === password) {
          req.session.username = username;
          res.redirect('/public/submit-clip.html');
        } else {
          alert("Wrong Password");
          res.redirect('/login');
        }
      } else {
        alert("User not found");
        res.redirect('/login');
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.get('/register', function (req, res) {
    res.sendFile(__dirname + "/public/register.html")
  });
  
  app.post('/register', async function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    const score = 0;
    try {
      const founduser = await auth.findOne({ username: username });
      if (founduser) {
        alert("User already exists");
        res.redirect('/register');
      } else {
        const newAuth = new auth({
          username: username,
          password: password,
          rankofuser: score
        });
        await newAuth.save();
        alert("User registered successfully");
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: 'Internal server error' });
    }
    res.redirect('/login');
  });
  
  app.get('/', function (req, res) {
    console.log("totalVisitors: ", totalVisitors)
    // res.render('login', { totalVisitors: totalVisitors });
    res.sendFile(__dirname + "/public/index.html");
  });
  
  app.get('/public/submit-clip.html', async function (req, res) {
    console.log("ok");
    res.sendFile(__dirname + "/public/submit-clip.html");
    console.log("kokie");
  });
  
  app.post('/', function (req, res) {
    var options = {
      min: 1,
      max: 20000,
      integer: true
    };
    var x = randomNumber(options);
    console.log(x);
    let Newnote = new bgmis({
      unique_no: x,
      link: req.body.link,
      name: req.body.name,
      rank: req.body.rank
    });
    alert("Clip Submitted Successfully");
  
    // Save the new instance to the database
    Newnote.save()
      .then(() => {
        console.log("New instance saved successfully");
        res.redirect('/');
      })
      .catch((error) => {
        console.error("Error saving new instance:", error);
        res.status(500).json({ message: 'Internal server error' });
      });
  });


  var link = "";
  var rank = "";
  
  app.get('/public/clip-guess', async function (req, res) {
    console.log("in clip guess  ");
    try {
      await findRecordByUniqueNumber();
      link = record_final.link;
      rank = record_final.rank;
      var linkobj = new URL(link);
      var linkid = linkobj.searchParams.get("v");
      const pref = "https://www.youtube.com/embed/";
      res.render("clip-guess", { URL_COMES_HERE: pref + linkid });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.post('/public/clip-guess', async function (req, res) {
    const game = req.body.Button;
    console.log("RANK by user: ", game);
    console.log("RANK by admin: ", rank);
    const username = req.session.username;
    if (game == rank) {
      try {
        const user = await auth.findOne({ username: username });
        user.rankofuser += 1;
        await user.save();
        alert("Correct Answer");
      } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ message: 'Internal server error' });
      }
    } else {
      alert("Wrong Answer");
    }
    res.redirect('/public/clip-guess');
  });

  app.get('/leaderboard', async function (req, res) {
    try {

      const leaderboard = await auth.find({}, 'username rankofuser')
        .sort({ rankofuser: -1 })
        .limit(10)
        .exec();
      
      const currentUser = await auth.findOne({ username: req.session.username }, 'rankofuser');
    const currusername = req.session.username;
      const totalRecords = await auth.countDocuments();
      res.render('leaderboard', { leaderboard: leaderboard, currentUser: currusername, totalRecords: totalRecords , rankofuser : currentUser.rankofuser});
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.listen(3000, function () {
    console.log("Server is running on port 3000");
  });


  app.get('/randomrecgen', async function (req, res) {
    try {
      const numRecords = 20; // Specify the number of random records you want to generate
      
      for (let i = 0; i < numRecords; i++) {
        const username = generateRandomUsername();
        const password = generateRandomPassword();
        const score = generateRandomScore();
        
        const newUser = new auth({
          username: username,
          password: password,
          rankofuser: score
        });
        
        await newUser.save();
      }
      
      res.send('Random records generated successfully');
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Function to generate a random username
  function generateRandomUsername() {
    const length = 8; // Specify the desired length of the username
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let username = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      username += characters.charAt(randomIndex);
    }
    return username;
  }
  
  // Function to generate a random password
  function generateRandomPassword() {
    const length = 10; // Specify the desired length of the password
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      password += characters.charAt(randomIndex);
    }
    return password;
  }
  
  // Function to generate a random score
  function generateRandomScore() {
    const minScore = 0; // Specify the minimum score value
    const maxScore = 1000; // Specify the maximum score value
    return Math.floor(Math.random() * (maxScore - minScore + 1) + minScore);
  }

  

// //-----------------------------------------------------
// var express = require('express');
// var path = require('path');
// var bodyParser = require('body-parser');
// var mongoose = require('mongoose');
// const { MongoClient } = require('mongodb');
// const dbConn = "mongodb+srv://harsheydevs:harshkaaccount@rankguesser.zszfjfg.mongodb.net/Clips";
// const randomNumber = require('random-number');
// let alert = require('alert');
// const notifier = require('node-notifier');
// const client = mongoose.connect(dbConn, { useNewUrlParser: true, useUnifiedTopology: true });
// const clients = MongoClient.connect(dbConn);
// async function main() {
//     const client = new MongoClient(dbConn);
//     try {
//         await client.connect();
//         await listDatabases(client);
//     } catch (e) {
//         console.error(e);
//     } finally {
//         await client.close();
//     }
// }

// main().catch(console.error);
// var db;
// var collection;
// async function listDatabases(client) {
//     databasesList = await client.db().admin().listDatabases();
//     db = client.db("Clips");
//     collectionsList = await db.listCollections().toArray();
//     collection = db.collection("Note");
// };
// const dbName = 'Clips';
// const collectionName = 'Bgmis';

// var optionss = {
//     min: 1,
//     max: 20000,
//     integer: true
// };

// var xx = randomNumber(optionss);
// const userInput = xx;
// const ui = 897;
// var record_final;

// async function findRecordByUniqueNumber() {
//     try {
//         const client = await MongoClient.connect(dbConn);
//         const db = client.db('Clips');
//         const collection = db.collection('bgmis');
//         const records = await collection.find().toArray();
//         const arr = records.map((record) => record.unique_no);
//         console.log('Array of column x values:');
//         console.log(arr);
//         const randomIndex = Math.floor(Math.random() * arr.length);
//         var ran = arr[randomIndex];

//         record = await collection.findOne({ unique_no: ran });
//         if (record) {
//             console.log('Record found:');
//             console.log(record);
//             record_final = record;
//         } else {
//             console.log('Record not found');
//         }
//     } catch (err) {
//         console.error('Error:', err);
//         res.status(500).json({ message: 'Internal server error' });
//     } finally {
//         console.log();
//     }
// }

// var app = express();

// app.use(bodyParser.urlencoded({ extended: false }));
// app.set('view engine', 'ejs');
// app.use("/public", express.static(path.join(__dirname, "public")))

// const bgmiSchema = new mongoose.Schema({
//   unique_no: { type: Number, required: true },
//   link: { type: String, required: true },
//   name: { type: String, required: true },
//   rank: { type: String, required: true },
//   player_rank: { type: Number, default: 0 }
// });

// const Bgmi2 = mongoose.model("Bgmi2", bgmiSchema);

// app.get('/', function (req, res) {
//     res.sendFile(__dirname + "/public/index.html");
// });

// app.get('/public/submit-clip.html', async function (req, res) {
//     console.log("ok");
//     res.sendFile(__dirname + "/public/submit-clip.html");
//     console.log("kokie");
// });

// app.post('/', function (req, res) {
//     var options = {
//         min: 1,
//         max: 20000,
//         integer: true
//     }
//     var x = randomNumber(options);
//     console.log(x);
//     let Newnote = new Bgmi2({
//         unique_no: x,
//         link: req.body.link,
//         name: req.body.name,
//         rank: req.body.rank
//     });
//     alert("Clip Submitted Successfully");
//     Newnote.save();
//     res.redirect('/');
// });

// var link = "";
// var rank = "";

// app.get('/public/clip-guess', async function (req, res) {
//     findRecordByUniqueNumber().then(function () {
//         link = record_final.link;
//         rank = record_final.rank;
//         var linkobj = new URL(link);
//         var linkid = linkobj.searchParams.get("v");
//         const pref = "https://www.youtube.com/embed/";
//         res.render("clip-guess", { URL_COMES_HERE: pref + linkid });
//     });
// });

// app.post('/public/clip-guess', function (req, res) {
//     const game = req.body.Button;
//     console.log("RANK by user: ", game);
//     console.log("RANK by admin: ", rank);
//     if (game == rank) {
//         alert("Correct Answer");
//     }
//     else {
//         alert("Wrong Answer");
//     }
//     res.redirect('/public/clip-guess');
// });

// app.get('/leaderboard', async function (req, res) {
//     try {
//         const client = await MongoClient.connect(dbConn);
//         const db = client.db('Clips');
//         const collection = db.collection('bgmis');
//         const leaderboard = await collection.find().sort({ rank: 1 }).limit(10).toArray();
//         res.render('leaderboard', { leaderboard });
//     } catch (err) {
//         console.error('Error:', err);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// app.listen(3000, function () {
//     console.log("Server is running on port 3000");
// });
