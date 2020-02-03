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
    }
}