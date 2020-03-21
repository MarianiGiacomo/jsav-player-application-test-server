/**
 * Required External Modules
 */
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");
const redirect = require("express-redirect");
const base64 = require('safe-base64');

/**
 * App Variables
 */
const app = express();
const port = process.env.PORT || "8000";

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
  fs.readFile("index.html", function(err, data){
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write(data);
  res.end();
  });
});

app.post("/", (req, res) => {
  const jsonData = req.body;
  const stringData = JSON.stringify(jsonData)
  const buffer = Buffer.from(stringData)
  const encoded = base64.encode(buffer)
  const iframe =
  `<iframe
    id="player"
    title="player"
    src="https://gentle-fjord-22671.herokuapp.com/jsav-player/player.html?submission=${encoded}"
  </iframe>`;
  res.send(iframe);
})

/**
 * Server Activation
 */
app.listen(port, () => {
 console.log(`Listening to requests on http://localhost:${port}`);
});
