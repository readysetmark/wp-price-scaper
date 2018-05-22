const axios = require('axios');
const moment = require('moment');
const numeral = require('numeral');


// Load .pricedb file
// remove duplicates (one time thing)
// merge data from ycharts

Promise.all([
    getPricesForSymbol("TDB900", "TDB900.TO"),
    getPricesForSymbol("TDB902", "TDB902.TO"),
    getPricesForSymbol("TDB909", "TDB909.TO"),
    getPricesForSymbol("TDB911", "TDB911.TO")
])
.then(responses => {
    responses.forEach(element => {
        //console.log(element);
        element[1]
        .map(toPriceRecord(element[0]))
        .forEach(price => {
            console.log(price);
        });
    });
})
.catch(error => {
    console.log(error);
    console.log('There was an error!');
});


function getPricesForSymbol(symbol, code) {
    const url = "https://ycharts.com/charts/fund_data.json?securities=id%3AM%3A" + code 
        + "%2Cinclude%3Atrue%2C%2C&calcs=id%3Aprice%2Cinclude%3Atrue%2C%2C&correlations=&format=real&recessions=false&zoom=5&startDate=&endDate=&chartView=&splitType=&scaleType=&note=&title=&source=&units=&quoteLegend=&partner=&quotes=&legendOnChart=&securitylistSecurityId=&clientGroupLogoUrl=&displayTicker=&ychartsLogo=&useEstimates=";
    return axios.get(url).then(response => { return [symbol, response.data.chart_data[0][0].raw_data]; });
}


function toPriceRecord(symbol) {
    return (e => {
        const date = moment(e[0]).utc().format('YYYY-MM-DD');
        const price = numeral(e[1]).format('$0.00');
        return `P ${date} "${symbol}" ${price}`;
    });
}