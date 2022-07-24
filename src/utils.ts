import { writeFile, readFile, access, constants } from "fs";
import { get } from "superagent";
import { createInterface } from "readline";

const reader = createInterface({
  input: process.stdin,
  output: process.stdout,
});

export function readSelection(): Promise<string> {
  return new Promise((resolve, reject) => {
    reader.on("line", (input) => {
      reader.close();
      resolve(input);
    });
  });
}
export function writeToFile(data: any, fileName: string) {
  return new Promise<void>((resolve, reject) => {
    const stringifiedData = JSON.stringify(data);
    writeFile(`${fileName}.json`, stringifiedData, "utf8", function (err) {
      if (err) {
        console.log(`An error occured while writing ${fileName} JSON file.`);
        return reject(err);
      }
      console.log(`${fileName} JSON file has been saved.`);
      resolve();
    });
  });
}
export function readJSONFile(path: string) {
  return new Promise<string>((resolve, reject) => {
    readFile(path, (err, data) => {
      if (err) {
        console.log(`There was an error reading json at ${path}.`);
        return reject(err);
      }
      resolve(data.toString("utf-8"));
    });
  });
}
export function makeGetRequest(postURL: string, mainVariables: MainVariables) {
  return new Promise<string>((resolve, reject) => {
    get(postURL)
      .set("Cookie", mainVariables.cookieString)
      .then((res) => {
        // console.log(
        //   "Response Headers: ",
        //   res.headers["X-PCO-API-Request-Rate-Count"] + "\n",
        //   res.headers["X-PCO-API-Request-Rate-Limit"] + "\n",
        //   res.headers["X-PCO-API-Request-Rate-Period"] + "\n"
        // );
        mainVariables.callCount++;
        // console.log("Call Count: ", mainVariables.callCount);
        mainVariables.currentTime = Date.now();
        resolve(JSON.stringify(res.body));
      })
      .catch((err) => {
        console.error(`Error in posts request:\n${err}`);
        return reject();
      });
  });
}
export function fileExists(path: string) {
  return new Promise<boolean>((resolve, reject) => {
    access(path, constants.F_OK, (err) => {
      if (err) {
        return resolve(false);
      }
      resolve(true);
    });
  });
}
