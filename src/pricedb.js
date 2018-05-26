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

    write: function (priceDbFilePath, symbols, priceSymbolMap) {
        return new Promise((resolve, reject) => {
            const tempFilePath = priceDbFilePath + "_temp";
            const outFS = fs.createWriteStream(tempFilePath);

            symbols.forEach(s => {
                priceSymbolMap.get(s).forEach(p => {
                    outFS.write(p.priceLine + '\r\n');
                });
            });

            outFS.end();

            outFS.on('error', error => {
                reject(error);
            });

            outFS.on('close', () => {
                if (fs.existsSync(priceDbFilePath)){
                    fs.unlinkSync(priceDbFilePath);
                }
                fs.renameSync(tempFilePath, priceDbFilePath);
                resolve();
            })
        });
    }
}
