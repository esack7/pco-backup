import * as sqlite from "sqlite3";

const sqlite3 = sqlite.verbose();

const dbConnectionString = "./database.db";

export async function AddSongToDB(
  id: number,
  sourceId: number,
  attributesJSON: SongAttributes
) {
  const db = new sqlite3.Database(dbConnectionString);
  const time = new Date();

  const songSql = `
  INSERT INTO songs(
    id,
    sourceId,
    attributes_json,
    date_added
  ) VALUES (
    $id, $sourceId, $attributes_json, $date_added
  )`;

  db.run(songSql, {
    $id: id,
    $sourceId: sourceId,
    $attributes_json: JSON.stringify(attributesJSON),
    $date_added: time.toISOString(),
  });

  db.close();
}
