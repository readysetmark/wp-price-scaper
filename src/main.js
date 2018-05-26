const axios = require('axios');
const moment = require('moment');
const numeral = require('numeral');
const pricedb = require('./pricedb');


// Load .pricedb file
// merge data from ycharts
// sort by symbol, then by date
// write to new file

const symbols = [
    { symbol: "TDB900", ychartsCode: "TDB900.TO" },
    { symbol: "TDB902", ychartsCode: "TDB902.TO" },
    { symbol: "TDB909", ychartsCode: "TDB909.TO" },
    { symbol: "TDB911", ychartsCode: "TDB911.TO" },
];

updatePriceDb(process.env.WEALTH_PULSE_PRICES_FILE, symbols)
.catch(e => {
    console.log("ERROR:");
    console.log(e.message);
})


async function updatePriceDb(priceDbFilePath, symbols) {
    // read currently stored prices from pricedb file
    console.log(`Reading prices from '${priceDbFilePath}'.`);
    const priceDb = await pricedb.read(priceDbFilePath);
    console.log(`Read ${priceDb.size} prices.`);

    // retrieve new prices from ycharts
    const newPrices = await Promise.all(
        symbols.map(s => {
            console.log(`Retrieving prices for symbol '${s.symbol}'.`);
            return getPricesForSymbol(s.symbol, s.ychartsCode);
        })
    );

    // add any new prices to priceDb
    newPrices.forEach(pricesList => {
        pricesList.forEach(price => {
            if (!priceDb.has(price)) {
                console.log(`Adding price: ${price}`);
                priceDb.add(price);
            }
        });
    });

    // parse out date and symbol so we can sort on those elements
    const prices = [];
    for(let p of priceDb.values()) {
        prices.push(parseSortablePrice(p));
    }

    // Sort all prices by date ...
    prices.sort((a, b) => {
        if (a.date.isBefore(b.date)) {
            return -1;
        }
        if (a.date.isAfter(b.date)) {
            return 1;
        }
        return 0;
    });

    // ... then group by symbol (still sorted by date though)
    const priceSymbols = [];
    const priceSymbolMap = new Map();
    prices.forEach(p => {
        if (!priceSymbolMap.has(p.symbol)) {
            let symbolPrices = [p];
            priceSymbolMap.set(p.symbol, symbolPrices);
            priceSymbols.push(p.symbol);
        } else {
            priceSymbolMap.get(p.symbol).push(p);
        }
    });

    // Sort by symbol
    priceSymbols.sort();

    // prices sorted by symbol, then date
    await pricedb.write(priceDbFilePath, priceSymbols, priceSymbolMap);
    console.log(`Wrote prices to '${priceDbFilePath}'.`);

    return true;
}


async function getPricesForSymbol(symbol, code) {
    const url = "https://ycharts.com/charts/fund_data.json?securities=id%3AM%3A" + code 
        + "%2Cinclude%3Atrue%2C%2C&calcs=id%3Aprice%2Cinclude%3Atrue%2C%2C&correlations=&format=real&recessions=false&zoom=5&startDate=&endDate=&chartView=&splitType=&scaleType=&note=&title=&source=&units=&quoteLegend=&partner=&quotes=&legendOnChart=&securitylistSecurityId=&clientGroupLogoUrl=&displayTicker=&ychartsLogo=&useEstimates=";
    const response = await axios.get(url);
    return response.data.chart_data[0][0].raw_data.map(toPriceLine(symbol));
}


function toPriceLine(symbol) {
    return (e => {
        // price record from ycharts is [date-as-unix-timestamp-in-ms, price]
        const date = moment(e[0]).utc().format('YYYY-MM-DD');
        const price = numeral(e[1]).format('$0.00');
        return `P ${date} "${symbol}" ${price}`;
    });
}


// Parse out symbol and date for sorting prices
function parseSortablePrice(priceLine) {
    const regex = /P (\d{4}-\d{2}-\d{2}) "(\w+)".*/;
    const match = regex.exec(priceLine);
    return {
        symbol: match[2],
        date: moment(match[1]),
        priceLine: priceLine
    };
}