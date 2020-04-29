var dbConf = require("./.dbConf.js");

module.exports = {
  getDbURI: (mode) => mode === "test"? dbConf.dbURI : process.env.DATABASE_URL,
  dbCollection: dbConf.dbCollection
}
