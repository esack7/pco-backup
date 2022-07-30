import puppeteer from "puppeteer";
import { readSelection, writeToFile } from "./utils.js";
import { AddCookiesToDB } from "./database/cookiesRepo.js";
import "dotenv/config";

const username = process.env.USRNAME;
const password = process.env.PSWORD;
const loginURL = process.env.LOGINURL;

export default async function auth(): Promise<void> {
  const browser = await puppeteer.launch({ headless: false });
  try {
    if (!username) throw new Error("User name is null.");
    if (!password) throw new Error("Password is null.");
    if (!loginURL) throw new Error("Login URL is null.");

    let source = "";
    const pages = await browser.pages();

    process.stdout.write(`Logging in.\n`);

    const page = pages[0];
    await page.goto(loginURL, { waitUntil: "domcontentloaded" });

    await page.type("#email", username);
    await page.type("#password", password);

    page.waitForSelector('input[type="submit"]');
    await page.click('input[type="submit"]');
    let currentURL = await page.mainFrame().url();
    if (currentURL === loginURL) {
      let nameOptions = [];
      let selection = "";
      let selectNum = 0;
      let listOptions = await page.$$('div[data-ref="login-button"] h2');

      for (let i = 0; i < listOptions.length; i++) {
        if (!listOptions) throw new Error("Acccount option is null");
        let name = await page.evaluate(
          (listItem) => listItem.textContent,
          listOptions[i]
        );
        nameOptions.push(name!.trim());
      }
      await Promise.all(nameOptions);

      process.stdout.write(`Which account would you like to log in to:\n`);
      for (let i = 0; i < nameOptions.length; i++) {
        process.stdout.write(`\t${i + 1}. ${nameOptions[i]}\n`);
      }
      process.stdout.write(`Type 1 - ${nameOptions.length}: `);

      selection = await readSelection();
      selectNum = parseInt(selection);
      source = nameOptions.map((str) => str.split(" ").join(""))[selectNum - 1];
      //TODO: Add validation.
      await page.click(
        `div[data-ref="login-button"]:nth-child(${selectNum}) > a.btn`
      );
      process.stdout.write(
        `Awaiting navigation to main page for ${nameOptions[selectNum - 1]}\n`
      );
    }
    await page.waitForNavigation();
    process.stdout.write(`Collecting all cookies\n`);

    const cookies = (await page.cookies()) as CookieInterface[];

    process.stdout.write(` Cookies collected!\n`);
    await AddCookiesToDB(cookies[0], source);
    // await writeToFile(cookies, "cookies");
    await browser.close();
  } catch (error) {
    console.error(
      "There has been an error in auth.js\nHere is the error:\n",
      error
    );
  }
}
