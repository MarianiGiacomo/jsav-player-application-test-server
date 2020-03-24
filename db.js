// const mongoose = require('mongoose')

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://jaal:jaal-jsav@jsav-a22pf.gcp.mongodb.net";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

function connectToDb() {
  client.connect(err => {
    if(err) throw err;
    console.log('connected');
    // perform actions on the collection object
    client.close();
  });
}

function addData(data) {
  client.connect((err) => {
    if(err) throw err;
    const collection = client.db("vas-jsav").collection("submissions");
    // perform actions on the collection object
    collection.insertOne({
      test: "test"
    })
    .then( data => {
      client.close();
      return data.insertedId
    })
  });
}

module.exports = client
