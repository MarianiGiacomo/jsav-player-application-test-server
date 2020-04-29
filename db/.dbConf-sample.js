const DBUSER = "<YOUR-DB-USER-HERE>";
const DBPASSWORD = "<YOUR-DB-USER-PASSWORD-HERE";
const DBSERVER = "<YOUR-DB-SERVER-ADDRESS-HERE"; //For example `mycluster-a21pf.gcp.mongodb.net`
const DBCOLLECTION = "<DB-COLLECTION-HERE>";
const DBURI = `mongodb+srv://${DBUSER}:${DBPASSWORD}@${DBSERVER}`;

module.exports = {
  dbURI: DBURI,
  dbCollection: DBCOLLECTION
}
