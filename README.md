# Wealth Pulse Price Scraper

Google Finance is toast (RIP March 2018) so I needed to setup an alternative
price scrapping utility. This one's kind of quick and dirty.

Eventually, I should just incorporate it into Wealthpulse...


# Usage

* Update the `symbols` array in `main.js` with the symbols and ycharts codes for
all the symbol prices you care to fetch.

* Ensure the `WEALTH_PULSE_PRICES_FILE` environment variable is set to where
the Wealthpulse `.pricedb` file is located.

* Run the scraper app with:

    node src\main.js
