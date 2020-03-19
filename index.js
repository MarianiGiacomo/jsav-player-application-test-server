/**
 * Required External Modules
 */
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");

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

/**
 * Routes Definitions
 */
app.get("/", (req, res) => {
  fs.readFile("index.html", function(err, data){
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write(data);
  res.end();
  });
});

app.get('/redirect', (req, res) => {
  let submission =
    {
      "metadata": {},
      "definitions": {
        "style": {},
        "score": {
          "total": 15,
          "correct": 0,
          "undo": 0,
          "fix": 0,
          "student": 0
        },
        "options": {
          "title": "Insertion Sort",
          "instructions": "Use Insertion Sort to sort the table given below in ascending order. Click on an item to select it and click again on another one to swap these bars."
        },
        "modelSolution": "function(e){var t=e.ds.array(i,{indexed:!0,layout:\"bar\"});e._undo=[];for(var n=1;n<10;n++)for(var r=n;r>0&&t.value(r-1)>t.value(r);)e.umsg('Shift \"'+t.value(r)+'\" to the left.'),t.swap(r,r-1),e.stepOption(\"grade\",!0),e.step(),r--;return t}"
      },
      "initialState": [
        {
          "type": "array",
          "id": "exerArray",
          "values": [
            "24",
            "54",
            "21",
            "68",
            "90",
            "73",
            "25",
            "68",
            "37",
            "81"
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
          "tstamp": "2020-03-19T13:38:40.512Z",
          "currentStep": 0,
          "score": {
            "total": 15,
            "correct": 0,
            "undo": 0,
            "fix": 0,
            "student": 0
          }
        }
      ]
    }
  //const submission = req.body.submission
  res.redirect("/jsav-player/player.html?submission=" + submission)
});

app.post("/jsav-player", (req, res) => {
  const submission = req.body.submission
  res.redirect("/jsav-player/player.html" + "?submission=2")
})

/**
 * Server Activation
 */
app.listen(port, () => {
 console.log(`Listening to requests on http://localhost:${port}`);
});
