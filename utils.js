const fs = require('fs');
const client = require('superagent');
const readline = require('readline');

const reader = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

module.exports = {
    readSelection: () => {
        return new Promise((resolve, reject) => {
            reader.on('line', input => {
                reader.close();
                resolve(input);
            })
        })
    },
    writeToFile: (data, fileName) => {
        return new Promise((resolve, reject) => {
            const stringifiedData = JSON.stringify(data);
            fs.writeFile(`${fileName}.json`, stringifiedData, 'utf8', function (err) {
                if (err) {
                    console.log(`An error occured while writing ${fileName} JSON file.`);
                    return reject(err);
                }
                console.log(`${fileName} JSON file has been saved.`);
                resolve();
            });
        })
    },
    readJSONFile: (path) => {
        return new Promise((resolve, reject) => {
            fs.readFile(path,(err, data) => {
                if(err) {
                    console.log(`There was an error reading json at ${path}.`);
                    return reject(err);
                }
                resolve(JSON.parse(data));
            })
        })
    },
    makeGetRequest: (postURL, mainVariables) => {
        return new Promise((resolve, reject) => {
            client.get(postURL)
                .set("Cookie", mainVariables.cookieString)
                .then(res => {
                    // console.log('Response Headers:\n', res.header)
                    mainVariables.callCount++;
                    mainVariables.currentTime = Date.now();
                    resolve(res.body);
                })
                .catch(err => {
                    console.error(`Error in posts request:\n${err}`);
                    return reject();
                })
        });
    },
    cookiesExist: (path) => {
        return new Promise((resolve, reject) => {
            fs.access(path,fs.constants.F_OK, (err) => {
                if(err) {
                    return resolve(false);
                }
                resolve(true);
            })
        })
    },
}