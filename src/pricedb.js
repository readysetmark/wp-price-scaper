const readline = require('readline');
const fs = require('fs');

const rli = readline.createInterface({
    input: fs.createReadStream(process.env.WEALTH_PULSE_PRICES_FILE),
    crlfDelay: Infinity
});

rli.on('line', line => {
    console.log(`Line from file: ${line}`);
});
