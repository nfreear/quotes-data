/**
 * Collate the short-list quotes as a merged array.
 *
 * @author NDF, 09-March-2020.
 */

const { meta, url, data } = require('./data/short-list');

const QUOTES = mergeAuthorQuotes(data);
const count = {
  authors: data.length,
  quotes: QUOTES.length,
}

const OPEN_QUOTES_EN = {
  meta,
  url,
  count,
  shortList: data,
  data: QUOTES,
};

module.exports = OPEN_QUOTES_EN;

// --------------------------------------------

function mergeAuthorQuotes (shortList) {
  let allQuotes = [];

  shortList.forEach(author => {
    const QUOTES = require(`./data/short-list/${author.id}-quotes.json`).data;

    /* NOT needed. ~ const quotes = QUOTES.quotes.map(quote => {
      return { id: quote.id, en: quote.en, name: QUOTES.name };
    }); */

    allQuotes = [ ...allQuotes, ...QUOTES ];
  });

  return allQuotes;
}
