import * as sqlite from "sqlite3";
import { AddSourceToDB } from "./sourceRepo";

const sqlite3 = sqlite.verbose();

const dbConnectionString = "./database.db";

export async function AddCookiesToDB(cookies: CookieInterface, source: string) {
  const db = new sqlite3.Database(dbConnectionString);
  const time = new Date();

  const cookieSql = `
  INSERT INTO cookies(
    sourceId,
    json,
    active,
    date_added
  ) VALUES (
    $sourceId, $json, $active, $date_added
  )`;

  const sourceInt = await AddSourceToDB(source, db);

  db.run(cookieSql, {
    $sourceId: sourceInt,
    $json: JSON.stringify(cookies),
    $active: true,
    $date_added: time.toISOString(),
  });

  db.close();
}

export async function GetActiveCookiesFromDB(mainVariables: MainVariables) {
  const db = new sqlite3.Database(dbConnectionString);
  const time = new Date();

  const selectQuery = `
  SELECT sourceId, json FROM cookies
  WHERE datetime() < DATETIME(json_extract(json, '$.expires'), 'unixepoch') AND active = true;`;

  const updateQuery = `
    UPDATE cookies
    SET active = false, date_modified = $date_modified
    WHERE datetime() > DATETIME(json_extract(json, '$.expires'), 'unixepoch') AND active = true`;
  try {
    // Makes cookies that have expired as invalid
    db.run(updateQuery, {
      $date_modified: time.toISOString(),
    });

    const query = await new Promise((resolve, reject) => {
      db.all(selectQuery, [], (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      });
    }).then((result) => {
      db.close();
      const cookieQueryResultArray = result as CookieQueryResult[];
      mainVariables.sourceID = cookieQueryResultArray[0].sourceId;
      return cookieQueryResultArray.map((ele) =>
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
