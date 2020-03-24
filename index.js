/**
 * Required External Modules
 */
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");
const redirect = require("express-redirect");
const MongoClient = require('mongodb').MongoClient;
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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
redirect(app);

/**
 * Routes Definitions
 */
app.redirect("/exercises/:exercise(.*)", "/", "post")

app.get("/", (req, res) => {
  const cipher = req.param('submission');
  if(cipher) {
    const submission = CryptoJS.AES.decrypt(cipher, dbConf.cryptoKey).toString(CryptoJS.enc.Utf8);
    client.connect((err) => {
      if(err) throw err;
      const collection = client.db("vas-jsav").collection(dbCollection);
      const data = collection.findOne({ _id: submission })
      res.send(data);
    });
  }
  fs.readFile("index.html", function(err, data){
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write(data);
  res.end();
  });
});

app.post("/", (req, res) => {
  const jsonData = req.body;
  // const stringData = JSON.stringify(jsonData)
  // const buffer = Buffer.from(stringData)
  // const encoded = base64.encode(buffer)
  client.connect((err) => {
    if(err) throw err;
    const collection = client.db("vas-jsav").collection(dbCollection);
    collection.insertOne(jsonData)
    .then( resData => {
      client.close();
      let id = resData.insertedId;
      let cipher = CryptoJS.AES.encrypt(id.toString(), dbConf.cryptoKey).toString();
      let urlParam = encodeURI(`${server}/?submission=${cipher}`);
      const iframe =
      `<iframe
        id="player"
        title="player"
        src="${server}/jsav-player/player.html?submission=${urlParam}"
      </iframe>`;
      res.send(iframe);
    })
  });
})

/**
 * Server Activation
 */
app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});
