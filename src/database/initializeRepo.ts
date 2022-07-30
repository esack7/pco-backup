import * as sqlite from "sqlite3";
const sqlite3 = sqlite.verbose();

const dbConnectionString = "./database.db";

export async function InitializeDB() {
  try {
    const db = new sqlite3.Database(dbConnectionString);

    db.serialize(() => {
      console.log("Database is initialized!!!");
      db.run(`
    CREATE TABLE cookies (
      id INTEGER PRIMARY KEY,
      source INTEGER NOT NULL,
      json TEXT,
      active BOOLEAN NOT NULL,
      date_added TEXT NOT NULL,
      date_modified TEXT
    )`);

      db.run(`
    CREATE TABLE source (
      id INTEGER PRIMARY KEY,
      description TEXT UNIQUE NOT NULL,
      json TEXT
    )`);
      db.close();
    });
  } catch (error) {
    console.error("Error in InitializeDB: ", error);
  }
}
