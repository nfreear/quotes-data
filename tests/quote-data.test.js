/**
 * Jest-powered unit tests.
 *
 * @author NDF, 14-March-2020.
 */

const { meta, url, count, shortList, data } = require('../index');

describe('Tests on the OpenQuotes short-list data:', () => {

  it("meta - Has a 'title' property containing 'quote'.", () => {
    expect(meta.title).toMatch(/quote/i);

    console.log('Counts:', count);
  });

  it("url  - Contains an 'image' property.", () => {
    expect(url.image).toContain('/img/');
  });

  it("count- Contains numeric 'authors' & 'quotes' properties.", () => {
    expect(count).toEqual({
      authors: shortList.length, quotes: data.length
    });
    expect(count.authors).toBeGreaterThanOrEqual(52);
  });

  it("data - Array contains a specific quote by 'A.A. Milne'.", () => {
    const QUOTE = data.find(quote => /to be called a liar/.test(quote.en));

    expect(QUOTE).toHaveProperty('author', 'A. A. Milne');
    expect(QUOTE).toHaveProperty('qid', '814aae70');

    console.log('Quote found:', QUOTE);
  });

  it("data - Array contains a specific quote by 'Zhuangzi' (莊子).", () => {
    const QUOTE = data.find(quote => /Life comes from the earth/.test(quote.en));

    expect(QUOTE).toHaveProperty('author', 'Zhuangzi');
    expect(QUOTE).toHaveProperty('qid', '2acd1bf7');

    console.log('Quote found (2):', QUOTE);
  });
});
