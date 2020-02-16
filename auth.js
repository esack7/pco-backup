const puppeteer = require("puppeteer");
const { readSelection, writeToFile } = require('./utils.js')
require("dotenv").config();

const username = process.env.USRNAME;
const password = process.env.PSWORD;
const loginURL = process.env.LOGINURL;

module.exports = async function () {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const pages = await browser.pages();

    process.stdout.write(`Logging in.\n`)

    const page = pages[0];
    await page.goto(loginURL, { waitUntil: "domcontentloaded" });

    await page.type("#email", username);
    await page.type("#password", password);

    await page.waitFor(300);
    await page.click('input[type="submit"]');
    let currentURL = await page.mainFrame().url();

    if (currentURL === loginURL) {
      let nameOptions = [];
      let selection = '';
      let selectNum = 0;
      let listOptions = await page.$$('.f-1');
      listOptions.shift();

      for (i = 0; i < listOptions.length; i++) {
        let name = await page.evaluate(listItem => listItem.text, listOptions[i])
        nameOptions.push(name);
      }
      await Promise.all(nameOptions);

      process.stdout.write(`Which account would you like to log in to:\n`);
      for (i = 0; i < nameOptions.length; i++) {
        process.stdout.write(`\t${i + 1}. ${nameOptions[i]}\n`);
      }
      process.stdout.write(`Type 1 - ${nameOptions.length}: `)

      selection = await readSelection();
      selectNum = parseInt(selection);

      //TODO: Add validation.
      await page.click(`li:nth-child(${selectNum}) > span > a.f-1`);
      process.stdout.write(`Awaiting navigation to main page for ${nameOptions[selectNum - 1]}\n`)
    }
    await page.waitForNavigation();
    process.stdout.write(`Collecting all cookies`);
    await page.waitFor(300);
    process.stdout.write(` .`);
    await page.waitFor(300);
    process.stdout.write(` .`);
    await page.waitFor(300);
    process.stdout.write(` .`);
    await page.waitFor(300);
    cookies = await page.cookies();
    await page.waitFor(1000);
    process.stdout.write(` Cookies collected!\n`);
    await writeToFile(cookies, 'cookies');
    return null;
  } catch (error) {
    console.error("There has been an error in auth.js\nHere is the error:\n", error);
  }
};
