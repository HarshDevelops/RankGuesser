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

const notesSchema = {
  unique_no: Number,
  link: String,
  name: String,
  rank: String
};

const authenticationSchema = {
  username: String,
  password: String,
  rankofuser: Number
};

const auth = mongoose.model("auth", authenticationSchema);

app.get('/login', function (req, res) {
    res.sendFile(__dirname + "/public/login.html")
  });
  
  app.post('/login', async function (req, res) {
    console.log("in here");
    const username = req.body.username;
    const password = req.body.password;
  
    try {
      const founduser = await auth.findOne({ username: username });
      if (founduser) {
        if (founduser.password === password) {
          alert("login successful!")
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
    res.sendFile(__dirname + "/public/login.html");
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
    let Newnote = new Bgmi({
      unique_no: x,
      link: req.body.link,
      name: req.body.name,
      rank: req.body.rank
    });
    alert("Clip Submitted Successfully");
    Newnote.save();
    res.redirect('/');
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
      // Fetch the top 10 users based on their rank (score)
      const leaderboard = await auth.find({}, 'username rankofuser')
        .sort({ rankofuser: -1 })
        .limit(10)
        .exec();
      
      // Find the current user's rank (score)
      const currentUser = await auth.findOne({ username: req.session.username }, 'rankofuser');
      
      console.log('All Users:');
      const allUsers = await auth.find({}, 'username');
      console.log(allUsers);
  
      res.render('leaderboard', { leaderboard: leaderboard, currentUser: currentUser });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  
  app.listen(3000, function () {
    console.log("Server is running on port 3000");
  });

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
