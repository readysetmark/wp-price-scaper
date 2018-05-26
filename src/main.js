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
.then(r => {
    console.log("SUCCESS");
})
.catch(e => {
    console.log("ERROR:");
    console.log(e.message);
})


async function updatePriceDb(priceDbFilePath, symbols) {
    const priceDb = await pricedb.read(priceDbFilePath);
    const newPrices = await Promise.all(
        symbols.map(s => {
            return getPricesForSymbol(s.symbol, s.ychartsCode);
        })
    );

    // add any new prices to priceDb
    newPrices.forEach(pricesList => {
        pricesList.forEach(price => {
            if (!priceDb.has(price)) {
                priceDb.add(price);
            }
        });
    });

    for(let p of priceDb.values()) {
        console.log(p);
    }

    return true;
}


async function getPricesForSymbol(symbol, code) {
    const url = "https://ycharts.com/charts/fund_data.json?securities=id%3AM%3A" + code 
        + "%2Cinclude%3Atrue%2C%2C&calcs=id%3Aprice%2Cinclude%3Atrue%2C%2C&correlations=&format=real&recessions=false&zoom=5&startDate=&endDate=&chartView=&splitType=&scaleType=&note=&title=&source=&units=&quoteLegend=&partner=&quotes=&legendOnChart=&securitylistSecurityId=&clientGroupLogoUrl=&displayTicker=&ychartsLogo=&useEstimates=";
    const response = await axios.get(url);
    return response.data.chart_data[0][0].raw_data.map(toPriceRecord(symbol));
}


function toPriceRecord(symbol) {
    return (e => {
        const date = moment(e[0]).utc().format('YYYY-MM-DD');
        const price = numeral(e[1]).format('$0.00');
        return `P ${date} "${symbol}" ${price}`;
    });
}