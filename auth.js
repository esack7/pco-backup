const puppeteer = require("puppeteer");
const { readSelection } = require('./utils.js')
require("dotenv").config();

const username = process.env.USRNAME;
const password = process.env.PSWORD;
const loginURL = process.env.LOGINURL;

module.exports = async function () {
  try {
    const browser = await puppeteer.launch({ headless: false });
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
    }
    await page.waitForNavigation();
    cookies = await page.cookies();

    console.log("Here are the cookies:\n", cookies);

    //TODO: Persist cookies for use later and return auth as a Promise.

  } catch (error) {
    console.error("Here is the error:\n", error);
  }
};
