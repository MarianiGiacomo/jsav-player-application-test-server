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
const CryptoJS = require("crypto-js");
const dbConf = require("./.db.conf.js");

/**
 * App Variables
 */
const app = express();
const port = process.env.PORT || "8000";
const mode = "test";
const exerciseServer = "https://gentle-fjord-22671.herokuapp.com";
const testServer = "http://localhost:8000"
const server = mode === "test"? testServer : exerciseServer;
const dbCollection = "submissions"
const client = new MongoClient(dbConf.dbURI, { useNewUrlParser: true, useUnifiedTopology: true });


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
    const bytes = CryptoJS.AES.decrypt(cipher, dbConf.cryptoKey);
    const idHex = bytes.toString(CryptoJS.enc.Utf8);
    const _id = new ObjectID.createFromHexString(idHex);
    console.log(idHex);
    console.log(_id)
    const collection = client.db("vas-jsav").collection(dbCollection);
    collection.findOne({ _id })
    .then( (data, err) => {
      if(err) throw err;
      console.log(data)
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
  const jsonData = req.body;
  // const stringData = JSON.stringify(jsonData)
  // const buffer = Buffer.from(stringData)
  // const encoded = base64.encode(buffer)
  const collection = client.db("vas-jsav").collection(dbCollection);
  collection.insertOne(jsonData)
  .then( resData => {
    let id = resData.insertedId.toHexString();
    let cipher = CryptoJS.AES.encrypt(id.toString(), dbConf.cryptoKey).toString();
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
    const collection = client.db("vas-jsav").collection(dbCollection);
    // let _id = "5e7a9463a382a51ddac08532"
    // collection.findOne({ _id } )
    // .then( (data, err) => {
    //   if(err) throw err;
    //   console.log(data);
    // })
  });
  console.log(`Listening to requests on http://localhost:${port}`);
});
