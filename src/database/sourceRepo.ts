import * as sqlite from "sqlite3";
const sqlite3 = sqlite.verbose();

const dbConnectionString = "./database.db";

export async function AddSourceToDB(
  source: string,
  db: sqlite.Database | null = null
) {
  try {
    let dbNeedsClosed = false;
    if (!db) {
      dbNeedsClosed = true;
      db = new sqlite3.Database(dbConnectionString);
    }

    const sourceSql = `
      INSERT INTO source (
        description,
        json
      ) VALUES (
        $description,
        $json
      )`;

    let sourceID = await GetSourceIdWithDescription(source, db);

    if (!sourceID) {
      db.run(sourceSql, {
        $description: source,
        $json: null,
      });

      sourceID = await GetSourceIdWithDescription(source, db);
    }

    if (dbNeedsClosed) {
      db.close();
    }

    return sourceID;
  } catch (error) {
    console.error("Error in AddSourceToDB: ", error);
  }
}

export async function UpdateSourceJSONwithId(json: string, id: number) {
  const db = new sqlite3.Database(dbConnectionString);
  const updateSourceJSONSql = `
      UPDATE source
      SET json = $json
      WHERE id = $id`;

  db.run(updateSourceJSONSql, {
    $json: json,
    $id: id,
  });

  db.close();
}

export async function GetSourceJSONwithId(id: number) {
  const db = new sqlite3.Database(dbConnectionString);
  const sourceJson = await new Promise((resolve, reject) => {
    db.get(`SELECT json FROM source WHERE id = $id`, [id], (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  })
    .then((output) => {
      db.close();
      return (output as SourceQueryResult).json;
    })
    .catch((err) =>
      console.error("There was an error in GetSourceJSONwithId.\n", err)
    );
  if (!sourceJson) {
    return "";
  }
  return sourceJson;
}

async function GetSourceIdWithDescription(
  description: string,
  db: sqlite.Database
) {
  try {
    const sourceInt = await new Promise((resolve, reject) => {
      db!.get(
        `SELECT id FROM source WHERE description = ?`,
        [description],
        (err, result) => {
          if (err) {
            reject(err);
          }
          resolve(result);
        }
      );
    }).then((output) => (output as SourceQueryResult).id);

    return sourceInt;
  } catch (error) {}
}
