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
const utils = require("./utils.js");
const conf = require("./conf.js");

/**
 * App Variables
 */
const app = express();
const server = conf.server;
const port = conf.port;

/**
 * DB Variables
 */
const client = new MongoClient(conf.dbURI, { useNewUrlParser: true, useUnifiedTopology: true });
const dbCollection = conf.dbCollection;


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
  const idHex = req.query['submission'];
  if(idHex) {
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
    let urlParam = `${server}/?submission=${id}`;
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
