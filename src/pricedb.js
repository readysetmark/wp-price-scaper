const readline = require('readline');
const fs = require('fs');

// Load .pricedb file
// remove duplicates (one time thing)
// merge ycharts data
// Save .pricedb file

readPriceDb(process.env.WEALTH_PULSE_PRICES_FILE);


function readPriceDb(priceDbFilePath) {
    const rli = readline.createInterface({
        input: fs.createReadStream(priceDbFilePath),
        crlfDelay: Infinity
    });
    
    let numLines = 0;
    rli.on('line', line => {
        const priceRegex = /^P (\d{4}-\d{2}-\d{2}) (".*"|\w*) (\$)(\d+\.\d{2})/;
        const result = priceRegex.exec(line);
        //console.log(`Line from file: ${line}`);
        //console.log(`Regex result: ${result}`);
        numLines += 1;
    });

    rli.on('close', () => {
        console.log(`Lines read: ${numLines}`)
    })
}
