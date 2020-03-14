/**
 *
 * @author NDF, 09-March-2020.
 */

const SHORT_LIST = require('./data/short-list');

const OPEN_QUOTES_EN = {
  meta: SHORT_LIST.meta,
  shortList: SHORT_LIST.data,
  data: mergeAuthorQuotes (SHORT_LIST),
};

module.exports = { OPEN_QUOTES_EN };

// --------------------------------------------

function mergeAuthorQuotes(shortList) {
  let allQuotes = [];

  shortList.data.forEach(author => {
    const QUOTES = require(`./data/short-list/${author.id}-quotes.json`);

    const quotes = QUOTES.quotes.map(quote => {
      return { id: quote.id, en: quote.en, name: QUOTES.name };
    });

    allQuotes = [ ...allQuotes, ...quotes ];
  });

  console.log('Quotes:', allQuotes);

  return allQuotes;
}
