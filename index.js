/**
 * Required External Modules
 */
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");
const redirect = require("express-redirect");

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
  // const submission = req.body.submission;
  const submission = {
  "metadata": {},
  "definitions": {
    "style": {},
    "score": {
      "total": 16,
      "correct": 0,
      "undo": 0,
      "fix": 0,
      "student": 0
    },
    "options": {
      "title": "Insertion Sort",
      "instructions": "Use Insertion Sort to sort the table given below in ascending order. Click on an item to select it and click again on another one to swap these bars."
    },
  },
  "initialState": [
    {
      "type": "array",
      "id": "exerArray",
      "values": [
        "47",
        "100",
        "22",
        "38",
        "51",
        "75",
        "95",
        "105",
        "38",
        "93"
      ],
      "options": {
        "autoresize": true,
        "center": true,
        "layout": "bar",
        "indexed": true,
        "template": "<span class=\"jsavvaluebar\"></span><span class=\"jsavvalue\"><span class=\"jsavvaluelabel\">{{value}}</span></span><span class=\"jsavindexlabel\">{{index}}</span>"
      }
    }
  ],
  "animation": [
    {
      "type": "grade",
      "tstamp": "2020-03-20T15:52:09.901Z",
      "currentStep": 0,
      "score": {
        "total": 16,
        "correct": 0,
        "undo": 0,
        "fix": 0,
        "student": 0
      }
    }
  ]
}
  res.redirect(`/jsav-player/player.html?submission=${JSON.stringify(submission)}`);
})

/**
 * Server Activation
 */
app.listen(port, () => {
 console.log(`Listening to requests on http://localhost:${port}`);
});
