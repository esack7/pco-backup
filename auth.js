// const { writeToFile } = require('./utils.js')
require("dotenv").config();

const puppeteer = require("puppeteer");
const username = process.env.USRNAME;
const password = process.env.PSWORD;
const loginURL = process.env.LOGINURL;

module.exports = async function() {
  try {
    const browser = await puppeteer.launch({ headless: false });
    console.log("Starting Puppeteer");
    const pages = await browser.pages();
    const page = pages[0];
    await page.goto(loginURL, { waitUntil: "domcontentloaded" });

    console.log("Loading Page");
    //   await page.waitFor('input[name=username]');
    //   await page.click('#login-fake-btn');
    await page.type("#email", username);
    await page.type("#password", password);

    //   console.log("Waiting to log in")
    await page.waitFor(300);
    //   const loginPage = page.mainFrame().url;
    await page.click('input[type="submit"]');
    //   await page.waitForNavigation();
    cookies = await page.cookies();
    let currentURL = await page.mainFrame().url();

    if (currentURL === loginURL) {
        let nameOptions = [];
        let urlOptions = [];
        console.log('Still on login page');
        
        let listOptions = await page.$$('.f-1');
        listOptions.shift();

        for(i = 0; i < listOptions.length; i++) {
            let name = await page.evaluate(listItem => listItem.text, listOptions[i])
            nameOptions.push(name);
            let url = await page.evaluate(listItem => listItem.href, listOptions[i])
            urlOptions.push(url);
        }
        await Promise.all(nameOptions,urlOptions);
        // console.log('Name Array: ', nameOptions);
        // console.log('URL Array: ', urlOptions);
    }
    //   console.log("Here are the cookies:\n", cookies);
    //   await writeToFile(cookies, 'cookies');
    //   return null;
  } catch (error) {
    console.error("Here is the error:\n", error);
  }
};
