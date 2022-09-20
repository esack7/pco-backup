import * as sqlite from "sqlite3";
import { readSelection } from "../utils";
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
  let sourceSelection = mainVariables.sourceID;

  const selectQuery = `
  SELECT cookies.sourceId, source.description as 'sourceDesription', cookies.json  FROM cookies
  INNER JOIN source 
  ON source.id = cookies.sourceId
  WHERE datetime() < DATETIME(json_extract(cookies.json, '$.expires'), 'unixepoch') AND cookies.active = true;`;

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
    }).then(async (result) => {
      db.close();
      const cookieQueryResultArray = result as CookieQueryResult[];
      if (mainVariables.sourceID == 0) {
        sourceSelection = await SelectCookieSource(cookieQueryResultArray);
        mainVariables.sourceID =
          cookieQueryResultArray[sourceSelection - 1].sourceId;
      }
      return cookieQueryResultArray.map((ele) =>
        JSON.parse(ele.json)
      ) as CookieInterface[];
    });

    if (query.length == 0 || sourceSelection == 0) {
      return null;
    }
    return query;
  } catch (error) {
    return null;
  }
}

async function SelectCookieSource(availableCookieResults: CookieQueryResult[]) {
  let selection = "";
  let selectNum = 0;

  if (availableCookieResults.length == 0) {
    return selectNum;
  }
  process.stdout.write(
    `Which account would you like to log in to:\n\t0. Account not shown\n`
  );
  for (let i = 0; i < availableCookieResults.length; i++) {
    process.stdout.write(
      `\t${i + 1}. ${availableCookieResults[i].sourceDesription}\n`
    );
  }
  selection = await readSelection();
  selectNum = parseInt(selection);
  return selectNum;
}
