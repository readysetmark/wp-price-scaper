const readline = require('readline');
const fs = require('fs');

// TODO: Save .pricedb file

module.exports = {
    read: function (priceDbFilePath) {
        return new Promise((resolve, reject) => {
            const rli = readline.createInterface({
                input: fs.createReadStream(priceDbFilePath),
                crlfDelay: Infinity
            });

            const priceDb = new Set();
            rli.on('line', line => {
                if (!priceDb.has(line)) {
                    priceDb.add(line);
                }
            });

            rli.on('close', () => {
                resolve(priceDb);
            });
        });
    },
}
