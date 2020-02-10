const fs = require('fs');
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
}