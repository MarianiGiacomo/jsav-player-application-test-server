const DBUSER = "<YOUR-DB-USER-HERE>";
const DBPASSWORD = "<YOUR-DB-USER-PASSWORD-HERE";
const DBSERVER = "<YOUR-DB-SERVER-ADDRESS-HERE"; //For example `mycluster-a21pf.gcp.mongodb.net`

module.exports = {
  dbURI: `mongodb+srv://${DBUSER}:${DBPASSWORD}@${DBSERVER}`,
}
