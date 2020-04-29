const DBCOLLECTION = "submissions";

function getDbURI(mode) {
  if (mode === "test") {
    let dbConf = require("./.dbConf.js");
    return dbConf.dbURI;
  }
  return process.env.DATABASE_URL;
}

module.exports = {
  getDbURI: getDbURI,
  dbCollection: DBCOLLECTION
}
