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
    title,
    ccli_number,
    admin,
    author,
    copyright,
    themes,
    date_added
  ) 
  SELECT
    $id, 
    $sourceId, 
    $title,
    $ccli_number,
    $admin,
    $author,
    $copyright,
    $themes,
    $date_added
  WHERE NOT EXISTS
  (SELECT * FROM songs WHERE id = $id OR ccli_number =$ccli_number)
  `;

  db.run(songSql, {
    $id: id,
    $sourceId: sourceId,
    $title: attributesJSON.title,
    $ccli_number: attributesJSON.ccli_number,
    $admin: attributesJSON.admin,
    $author: attributesJSON.author,
    $copyright: attributesJSON.copyright,
    $themes: attributesJSON.themes,
    $date_added: time.toISOString(),
  });

  db.close();
}
