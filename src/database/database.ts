// const sqlite3 = require("sqlite3").verbose();
import * as sqlite from "sqlite3";
const sqlite3 = sqlite.verbose();

const dbConnectionString = "./database.db";

export async function InitializeDB() {
  const db = new sqlite3.Database(dbConnectionString);

  db.serialize(() => {
    console.log("Database is initialized!!!");
    db.run(`
    CREATE TABLE cookies (
      id INTEGER PRIMARY KEY,
      source TEXT NOT NULL,
      json TEXT,
      active BOOLEAN NOT NULL,
      date_added TEXT NOT NULL,
      date_modified TEXT
    )`);
  });

  db.close();
}

export async function AddCookiesToDB(cookies: CookieInterface, source: string) {
  const db = new sqlite3.Database(dbConnectionString);
  const time = new Date();
  const cookieSql = `
  INSERT INTO cookies(
    source,
    json,
    active,
    date_added
  ) VALUES (
    $source, $json, $active, $date_added
  )`;

  db.run(cookieSql, {
    $source: source,
    $json: JSON.stringify(cookies),
    $active: true,
    $date_added: time.toISOString(),
  });

  db.close();
}

export async function GetActiveCookiesFromDB() {
  const db = new sqlite3.Database(dbConnectionString);
  const sqlQuery = `SELECT json FROM cookies WHERE active = true`;
  try {
    const query = await new Promise((resolve, reject) => {
      db.all(sqlQuery, [], (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      });
    }).then((result) => {
      db.close();
      const cookieJSONResult = result as CookieJSON[];
      return cookieJSONResult.map((ele) =>
        JSON.parse(ele.json)
      ) as CookieInterface[];
    });
    if (query.length == 0) {
      return null;
    }
    return query;
  } catch (error) {
    return null;
  }
}

interface CookieJSON {
  json: string;
}
