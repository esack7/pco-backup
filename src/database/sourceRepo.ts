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
      REPLACE INTO source (
        description,
        json
      ) VALUES (
        $description,
        $json
      )`;

    db.run(sourceSql, {
      $description: source,
      $json: null,
    });

    const sourceInt = await new Promise((resolve, reject) => {
      db!.get(
        `SELECT id FROM source WHERE description = ?`,
        [source],
        (err, result) => {
          if (err) {
            reject(err);
          }
          resolve(result);
        }
      );
    }).then((output) => (output as SourceQueryResult).id);

    if (dbNeedsClosed) {
      db.close();
    }

    return sourceInt;
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
