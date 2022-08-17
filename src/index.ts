import { readJSONFile, makeGetRequest, fileExists, writeToFile } from "./utils";
import auth from "./auth.js";
import { differenceInSeconds } from "date-fns";
import "dotenv/config";
import SavedSongs from "./classes/SavedSongs";
import SavedSong from "./classes/SavedSong";
import { InitializeDB } from "./database/initializeRepo";
import { GetActiveCookiesFromDB } from "./database/cookiesRepo";
import SourceJSON from "./classes/SourceJson";
import {
  UpdateSourceJSONwithId,
  GetSourceJSONwithId,
} from "./database/sourceRepo";

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
    // const cookiesPath = "./cookies.json";
    const dbExists = await fileExists(dbPath);
    if (!dbExists) InitializeDB();

    // let cookieExist = await fileExists(cookiesPath);
    let cookies = await GetActiveCookiesFromDB(mainVariables);
    if (!cookies) {
      process.stdout.write("Authorization needed\n");
      await auth();
      main();
    } else {
      let sourceJson = await GetSourceJSONwithId(mainVariables.sourceID);
      process.stdout.write("Cookies already exist\n");
      // let cookies = JSON.parse(
      //   await readJSONFile(cookiesPath)
      // ) as CookieInterface[];
      cookies.forEach((ele) => {
        mainVariables.cookieString =
          mainVariables.cookieString + `${ele.name}=${ele.value};`;
      });

      process.stdout.write("Requesting songs ...\n");
      let res = JSON.parse(
        await makeGetRequest(apiUrl, mainVariables)
      ) as SongsRequest;
      console.log("Step 1");
      if (sourceJson.length === 0) {
        console.log("Step 2");
        sourceJson = JSON.stringify(new SourceJSON(res));
        await UpdateSourceJSONwithId(sourceJson, mainVariables.sourceID);
      }

      const savedSongsData = new SavedSongs(res);

      while (!!res.links.next) {
        // process.stdout.write(" .");

        for (let i = 0; i < res.data.length; i++) {
          process.stdout.write(
            `Getting data for ${res.data[i].attributes.title}\n`
          );
          const arrangements = JSON.parse(
            await makeGetRequest(
              `${res.data[i].links.self}/arrangements`,
              mainVariables
            )
          ) as Arrangements;
          // savedSongsData.data[i].arrangements = res;

          const attachments = JSON.parse(
            await makeGetRequest(
              `${res.data[i].links.self}/attachments`,
              mainVariables
            )
          ) as Attachments;
          // savedSongsData.data[i].attachments = res;

          const tags = JSON.parse(
            await makeGetRequest(
              `${res.data[i].links.self}/tags`,
              mainVariables
            )
          ) as Tags;
          // savedSongsData.data[i].tags = res;
          savedSongsData.SetSongToSavedSongData(
            new SavedSong(res.data[i], arrangements, attachments, tags)
          );
        }

        res = JSON.parse(await makeGetRequest(res.links.next, mainVariables));
        // savedSongsData.data = savedSongsData.data.concat(res.data);
      }

      // process.stdout.write("\n");

      process.stdout.write(
        `\nThere have been an average of ${
          (mainVariables.callCount /
            differenceInSeconds(mainVariables.currentTime, timeStart)) *
          20
        } api calls per 20 seconds.\n\nThere is an limit of 100 api calls per 20 seconds.\n\n`
      );
      // API rate limit documentation: https://developer.planning.center/docs/#/overview/rate-limiting
      await writeToFile(savedSongsData, "songsSavedData");
      // await saveToDatabase(savedSongsData);

      process.exit();
    }
  } catch (error: any) {
    process.stderr.write("There was an error in main:\n", error);
    process.exit();
  }
}

main();
