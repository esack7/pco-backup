const { readJSONFile, makeGetRequest, cookiesExist, writeToFile } = require('./utils');
const auth = require('./auth.js');
const { differenceInSeconds } = require('date-fns');
require("dotenv").config();

const apiUrl = process.env.APIURL;
const timeStart = Date.now();
let mainVariables = {
    cookieString: '',
    callCount: 0,
    currentTime: Date(),
};

async function main() {
    const cookiesPath = './cookies.json';
    let cookieExist = await cookiesExist(cookiesPath);

    if(!cookieExist) {
        process.stdout.write('Authorization needed\n')
        await auth();
        main();
    }
    else {
        try {
            process.stdout.write('Cookies already exist\n')
            cookies = await readJSONFile(cookiesPath);

            cookies.map(ele => {
                mainVariables.cookieString = mainVariables.cookieString + `${ele.name}=${ele.value};`;
            })

            process.stdout.write('Requesting songs ');
            let res = await makeGetRequest(apiUrl, mainVariables);
            let savedData = res;
            do {
                process.stdout.write(' .');
                res = await makeGetRequest(res.links.next, mainVariables);
                savedData.data = await savedData.data.concat(res.data);
            } while (!!res.links.next);
            process.stdout.write('\n');

            for(let i = 0; i < savedData.data.length; i++) {
                process.stdout.write(`Getting data for ${savedData.data[i].attributes.title}\n`)
                res = await makeGetRequest(`${savedData.data[i].links.self}/arrangements`, mainVariables);
                savedData.data[i].arrangements = res;
    
                res = await makeGetRequest(`${savedData.data[i].links.self}/attachments`, mainVariables);
                savedData.data[i].attachments = res;
    
                res = await makeGetRequest(`${savedData.data[i].links.self}/tags`, mainVariables);
                savedData.data[i].tags = res;
            }

            process.stdout.write(`\nThere have been an average of ${mainVariables.callCount / differenceInSeconds(mainVariables.currentTime, timeStart)} api calls per seconds.\n\n`)
            await writeToFile(savedData, 'savedData');

            process.exit();
        } catch (error) {
            process.stderr.write('There was an error in main:\n', error);
            process.exit();
        }
    }

}

main();