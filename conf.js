const MODE = "test";
const exerciseServer = "https://gentle-fjord-22671.herokuapp.com";
const testServer = "http://localhost:8000"
const db = require("./db/db.js")

module.exports = {
  server: MODE === "test"? testServer : exerciseServer,
  port: process.env.PORT || "8000",
  dbURI: db.getDbURI(MODE),
  dbCollection: db.dbCollection
}
