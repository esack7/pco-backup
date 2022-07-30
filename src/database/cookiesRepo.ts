import * as sqlite from "sqlite3";
import { AddSourceToDB } from "./sourceRepo";

const sqlite3 = sqlite.verbose();

const dbConnectionString = "./database.db";

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

  const sourceInt = await AddSourceToDB(source, db);

  db.run(cookieSql, {
    $source: sourceInt,
    $json: JSON.stringify(cookies),
    $active: true,
    $date_added: time.toISOString(),
  });

  db.close();
}

export async function GetActiveCookiesFromDB() {
  const db = new sqlite3.Database(dbConnectionString);
  const sqlQuery = `SELECT json FROM cookies WHERE datetime() < DATETIME(json_extract(json, '$.expires'), 'unixepoch') AND active = true;`;
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
      return (result as CookieQueryResult[]).map((ele) =>
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
