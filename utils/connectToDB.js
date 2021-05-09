const sqlite3 = require("sqlite3").verbose();

const connectToDB = () => {

  let db = new sqlite3.Database("./sqlite.db", sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Connected to the database.");
  });

  return db
};

module.exports = connectToDB;
