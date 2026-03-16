import {
  makeGetRequest,
  fileExists,
  writeToFile,
  timeout,
} from "./utils";
import { getAuth, isAuthConfigured } from "./auth";
import { differenceInSeconds } from "date-fns";
import "dotenv/config";
import SavedSongs from "./classes/SavedSongs";
import SavedSong from "./classes/SavedSong";
import { InitializeDB } from "./database/initializeRepo";
import SourceJSON from "./classes/SourceJSON";
import {
  AddSourceToDB,
  UpdateSourceJSONwithId,
  GetSourceJSONwithId,
} from "./database/sourceRepo";
import { AddSongToDB } from "./database/songsRepo";
import { AddSongArrangementsToDB } from "./database/arrangementsRepo";

const PCO_SERVICES_SONGS_URL =
  "https://api.planningcenteronline.com/services/v2/songs";
const DEFAULT_DB_PATH = "./database.db";

const apiUrl = process.env.APIURL ?? PCO_SERVICES_SONGS_URL;
const dbPath = process.env.DBPATH ?? DEFAULT_DB_PATH;
const sourceName = process.env.SOURCE_NAME || "Default";
const timeStart = Date.now();
let mainVariables: MainVariables = {
  authHeaders: { Authorization: "", "User-Agent": "" },
  callCount: 0,
  currentTime: Date.now(),
  sourceID: 0,
};

async function main() {
  try {
    if (!apiUrl) throw new Error("API URL is null");
    if (!dbPath) throw new Error("DB PATH is null");

    if (!isAuthConfigured()) {
      process.stderr.write(
        "PCO auth not configured. Set PCO_APPLICATION_ID and PCO_SECRET in .env.\n" +
          "Create a Personal Access Token at https://api.planningcenteronline.com/oauth/applications\n"
      );
      process.exit(1);
    }

    const authHeaders = getAuth()!;
    mainVariables.authHeaders = authHeaders;

    const dbExists = await fileExists(dbPath);
    if (!dbExists) {
      await Promise.all([InitializeDB(dbPath), timeout(3000)]);
    }

    mainVariables.sourceID = (await AddSourceToDB(sourceName)) ?? 1;

    let sourceJson = await GetSourceJSONwithId(mainVariables.sourceID);

    process.stdout.write("Requesting songs ...\n");
    let res = JSON.parse(
      await makeGetRequest(apiUrl, mainVariables)
    ) as SongsRequest;

    if (sourceJson.length === 0) {
      // Source JSON is set here
      sourceJson = JSON.stringify(new SourceJSON(res));
      await UpdateSourceJSONwithId(sourceJson, mainVariables.sourceID);
    }

    const savedSongsData = new SavedSongs(res);

    while (!!res.links.next) {
      for (const song of res.data) {
        const songId = parseInt(song.id);
        const songAttributes = song.attributes;
        const songTitle = song.attributes.title;
        const songURL = song.links.self;

        process.stdout.write(`Getting data for ${songTitle}\n`);
        const arrangements = JSON.parse(
          await makeGetRequest(`${songURL}/arrangements`, mainVariables)
        ) as Arrangements;

        const attachments = JSON.parse(
          await makeGetRequest(`${songURL}/attachments`, mainVariables)
        ) as Attachments;

        const tags = JSON.parse(
          await makeGetRequest(`${songURL}/tags`, mainVariables)
        ) as Tags;

        await AddSongToDB(songId, mainVariables.sourceID, songAttributes);

        await AddSongArrangementsToDB(arrangements.data, songId);

        savedSongsData.SetSongToSavedSongData(
          new SavedSong(song, arrangements, attachments, tags)
        );
      }

      res = JSON.parse(await makeGetRequest(res.links.next, mainVariables));
    }

    process.stdout.write(
      `\nThere have been an average of ${
        (mainVariables.callCount /
          differenceInSeconds(mainVariables.currentTime, timeStart)) *
        20
      } api calls per 20 seconds.\n\nThere is an limit of 100 api calls per 20 seconds.\n\n`
    );
    // API rate limit documentation: https://developer.planning.center/docs/#/overview/rate-limiting
    await writeToFile(savedSongsData, "songsSavedData");

    process.exit();
  } catch (error: any) {
    process.stderr.write("There was an error in main:\n", error);
    process.exit();
  }
}

main();
