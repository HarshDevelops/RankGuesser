var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
const { MongoClient, ServerApiVersion } = require('mongodb');
const dbConn = "mongodb+srv://harsheydevs:harshkaaccount@rankguesser.zszfjfg.mongodb.net/Clips";
const randomNumber = require('random-number');
let alert = require('alert');
const notifier = require('node-notifier');
const client = mongoose.connect(dbConn, { useNewUrlParser: true, useUnifiedTopology: true });
const clients = MongoClient.connect('mongodb+srv://harsheydevs:harshkaaccount@rankguesser.zszfjfg.mongodb.net/Clips');
async function main() {
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
     */
    const uri = "mongodb+srv://harsheydevs:harshkaaccount@rankguesser.zszfjfg.mongodb.net/Clips";
    const client = new MongoClient(uri);
    try {
        // Connect to the MongoDB cluster
        await client.connect();

        // Make the appropriate DB calls
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
    //  console.log("ok");
    collectionsList = await db.listCollections().toArray();
    // console.log(collectionsList);
    collection = db.collection("Note");
    // console.log("Databases:");
    // databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};
const dbName = 'Clips';
const collectionName = 'Bgmis';
var optionss = {
    min: 1
    , max: 20000
    , integer: true
}
var xx = randomNumber(optionss);
const userInput = xx;
const ui = 897;
var record_final;
async function findRecordByUniqueNumber() {
    try {
        // Connect to the MongoDB server
        const client = await MongoClient.connect(dbConn);

        // Select the database and collection
        const db = client.db('Clips');
        const collection = db.collection('bgmis'); // Replace with the actual collection name

        // Find the record with the given unique_number
        record = await collection.findOne({ unique_no: ui });
        const cursor = collection.find();
        // Iterate over the cursor and print each record
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
        // Close the connection
        console.log();
    }
}

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use("/public", express.static(path.join(__dirname, "public")))

const notesSchema = {
    unique_no: Number,
    link: String,
    name: String,
    rank: String
}

const Bgmi = mongoose.model("Bgmi", notesSchema)
app.get('/', function (req, res) {
    res.sendFile(__dirname + "/public/index.html")
});

app.get('/public/submit-clip.html', async function (req, res){
    console.log("ok");
    res.sendFile(__dirname + "/public/submit-clip.html");
    console.log("kokie");
});
app.post('/', function (req, res) {
    var options = {
        min: 1
        , max: 20000
        , integer: true
    }
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
})

var link = "";
var rank = "";
app.get('/public/clip-guess', async function (req, res) {
    findRecordByUniqueNumber().then(function () {
        link = record_final.link;
        rank = record_final.rank;
        var linkobj = new URL(link);
        var linkid = linkobj.searchParams.get("v");
        const pref = "https://www.youtube.com/embed/";
        res.render("clip-guess", { URL_COMES_HERE: pref + linkid });
    });

});

app.post('/public/clip-guess', function (req, res) {
    const game = req.body.Button;
    console.log("RANK by user: ",game);
    console.log("RANK by admin: ",rank);
    if (game == rank) {
        alert("Correct Answer");
    }
    else{
        alert("Wrong Answer");
    }

    res.redirect('/public/clip-guess');
});

app.listen(3000, function () {
    console.log("Server is running on port 3000");
})