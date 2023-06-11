var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
const { MongoClient, ServerApiVersion } = require('mongodb');
const dbConn = "mongodb+srv://harsheydevs:harshkaaccount@rankguesser.zszfjfg.mongodb.net/Clips";
mongoose.connect(dbConn, { useNewUrlParser: true, useUnifiedTopology: true});

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.static(path.resolve(__dirname, 'public')));
app.use('/static', express.static(path.join(__dirname, 'public')));
const notesSchema = {
    game: String,
    link: String,
    name: String,
    rank: String
}

const Note = mongoose.model("Note", notesSchema)
app.get('/', function (req, res) {
    console.log("ok")
    res.sendFile(__dirname + "/submit-clip.html")
    // dbConn.then(function (db) {
    //     delete req.body._id; // for safety reasons
    //     db.collection('feedbacks').insertOne(req.body);
    // });
    // res.send('Data received:\n' + JSON.stringify(req.body));
});

app.post('/', function (req, res) {
    let Newnote = new Note({
        game: req.body.game,
        link: req.body.link,
        name: req.body.name,
        rank: req.body.rank
    });
    Newnote.save();
    res.redirect('/');

})

app.listen(3000,function(){
    console.log("Server is running on port 3000");
})