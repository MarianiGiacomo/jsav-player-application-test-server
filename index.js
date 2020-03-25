/**
 * Required External Modules
 */
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");
const redirect = require("express-redirect");
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient;
const ObjectID = mongodb.ObjectID;
const aesjs = require('aes-js');
const CryptoJS = require("crypto-js");

/**
 * App Variables
 */
const app = express();
const port = process.env.PORT || "8000";
const mode = "prod";
let dbConf;
if(mode === "test") dbConf = require("./.db.conf.js");
const exerciseServer = "https://gentle-fjord-22671.herokuapp.com";
const testServer = "http://localhost:8000"
const server = mode === "test"? testServer : exerciseServer;
const dbURI = mode === "test"? dbConf.dbURI : process.env.DATABASE_URL;
const dbCollection = "submissions"
const client = new MongoClient(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });
const cryptoKey = mode === "test"? dbConf.cryptoKey : process.env.CRYPTOKEY;


/**
 *  App Configuration
 */
app.use(cors())
app.use(express.static('public'))
app.use(bodyParser({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
redirect(app);

/**
 * Routes Definitions
 */
app.redirect("/exercises/:exercise(.*)", "/", "post")

app.get("/", (req, res) => {
  const cipher = req.query['submission'];
  if(cipher) {
    // const bytes = CryptoJS.AES.decrypt(cipher, cryptoKey);
    // console.log('bytes: ', bytes);
    // const idHex = Buffer.from(bytes.words, 'utf8');
    // const idHex = bytes.toString(CryptoJS.enc.Utf8);
    console.log('received cipher', cipher);
    const encryptedBytes = aesjs.utils.hex.toBytes(cipher);
    const aesCtr = new aesjs.ModeOfOperation.ctr(key);
    const decryptedBytes = aesCtr.decrypt(encryptedBytes);
    const idHex = aesjs.utils.utf8.fromBytes(decryptedBytes);
    console.log('idHex: ', idHex);
    const _id = new ObjectID.createFromHexString(idHex);
    console.log('_id: ', _id)
    const collection = client.db("vas-jsav").collection(dbCollection);
    collection.findOne({ _id })
    .then( (data, err) => {
      if(err) throw err;
      res.send(data);
    })
  } else {
    fs.readFile("index.html", function(err, data){
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    res.end();
    });
  }
});

app.post("/", (req, res) => {
  console.log('Received post request');
  const jsonData = req.body;
  const collection = client.db("vas-jsav").collection(dbCollection);
  collection.insertOne(jsonData)
  .then( resData => {
    let id = resData.insertedId.toHexString();
    console.log('id: ', id);
    // let cipher = CryptoJS.AES.encrypt(id, cryptoKey).toString();
    const textBytes = aesjs.utils.utf8.toBytes(id);
    const aesCtr = new aesjs.ModeOfOperation.ctr(key);
    const encryptedBytes = aesCtr.encrypt(textBytes);
    let cipher = aesjs.utils.hex.fromBytes(encryptedBytes);
    console.log('sent cipher', cipher)
    let urlParam = `${server}/?submission=${cipher}`;
    const iframe =
    `<iframe
      id="player"
      title="player"
      src="${server}/jsav-player/player.html?submission=${urlParam}"
    </iframe>`;
    res.send(iframe);
  })
})

/**
 * Server Activation
 */
app.listen(port, () => {
  client.connect((err) => {
    if(err) throw err;
    else console.log('connected to db');
  });
  console.log(`Listening to requests on http://localhost:${port}`);
});
