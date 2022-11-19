import {
  readJSONFile,
  makeGetRequest,
  fileExists,
  writeToFile,
  timeout,
} from "./utils";
import auth from "./auth.js";
import { differenceInSeconds } from "date-fns";
import "dotenv/config";
import SavedSongs from "./classes/SavedSongs";
import SavedSong from "./classes/SavedSong";
import { InitializeDB } from "./database/initializeRepo";
import { GetActiveCookiesFromDB } from "./database/cookiesRepo";
import SourceJSON from "./classes/SourceJSON";
import {
  UpdateSourceJSONwithId,
  GetSourceJSONwithId,
} from "./database/sourceRepo";
import { AddSongToDB } from "./database/songsRepo";
import { AddSongArrangementsToDB } from "./database/arrangementsRepo";

const apiUrl = process.env.APIURL;
const dbPath = process.env.DBPATH;
const timeStart = Date.now();
let mainVariables: MainVariables = {
  cookieString: "",
  callCount: 0,
  currentTime: Date.now(),
  sourceID: 0,
};

async function main() {
  try {
    if (!apiUrl) throw new Error("API URL is null");
    if (!dbPath) throw new Error("DB PATH is null");

    const dbExists = await fileExists(dbPath);
    if (!dbExists) {
      await Promise.all([InitializeDB(dbPath), timeout(3000)]);
    }

    let cookies = await GetActiveCookiesFromDB(mainVariables);

    if (!cookies) {
      process.stdout.write("Authorization needed\n");
      await auth();
      main();
    } else {
      let sourceJson = await GetSourceJSONwithId(mainVariables.sourceID);
      const cookieSelection = cookies[mainVariables.sourceID - 1];

      process.stdout.write("Cookies already exist\n");

      mainVariables.cookieString = `${cookieSelection.name}=${cookieSelection.value};`;

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
    }
  } catch (error: any) {
    process.stderr.write("There was an error in main:\n", error);
    process.exit();
  }
}

main();
