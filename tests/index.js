import { readJSONFile } from "../utils.js";

async function test() {
  let file = await readJSONFile("./test.json");
  console.log("Length of Array: ", file.data.length);
  process.exit();
}

test();
