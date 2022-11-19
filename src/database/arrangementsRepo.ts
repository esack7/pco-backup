import * as sqlite from "sqlite3";
const sqlite3 = sqlite.verbose();

const dbConnectionString = "./database.db";

export async function AddSongArrangementsToDB(
  arrangements: Arrangement[],
  songId: Number
) {
  try {
    const db = new sqlite3.Database(dbConnectionString);
    const time = new Date();

    const arrangementSql = `
    INSERT INTO arrangements(
        id,
        name,
        songId,
        attributes_json,
        date_added
    ) VALUES (
        $id,
        $name,
        $songId,
        json($attributes_json),
        $date_added
    )`;

    for (const arrangement of arrangements) {
      db.run(arrangementSql, {
        $id: arrangement.id,
        $name: arrangement.attributes.name,
        $songId: songId,
        $attributes_json: JSON.stringify(arrangement.attributes),
        $date_added: time.toISOString(),
      });
    }

    db.close();
  } catch (error) {
    console.error("Error in AddSongArrangmentToDB: ", error);
  }
}
