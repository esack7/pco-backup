// const sqlite3 = require("sqlite3").verbose();
import * as sqlite from "sqlite3";
const sqlite3 = sqlite.verbose();

const dbConnectionString = "./database.db";

export async function InitializeDB() {
  const db = new sqlite3.Database(dbConnectionString);

  db.serialize(() => {
    console.log("Database is serialized!!!");
  });

  db.close();
}
