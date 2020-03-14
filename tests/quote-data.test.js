/**
 * Jest-powered unit tests.
 *
 * @author NDF, 14-March-2020.
 */

const { meta, url, count, shortList, data } = require('../index');

describe('Tests on the Open Quotes short-list data:', () => {

  it('meta', () => {
    expect(meta.title).toMatch(/quote/i);

    console.log('Counts:', count);
  });

  it('url', () => {
    expect(url.image).toContain('/img/');
  });

  test('count', () => {
    expect(count).toEqual({
      authors: shortList.length, quotes: data.length
    });
    expect(count.authors).toBeGreaterThanOrEqual(52);
  });

  test('data (quote: Milne)', () => {
    const QUOTE = data.find(quote => /to be called a liar/.test(quote.en));

    expect(QUOTE).toHaveProperty('author', 'A. A. Milne');
    expect(QUOTE).toHaveProperty('qid', '814aae70');

    console.log('Quote found:', QUOTE);
  });

  test('data (quote: Zhuangzi)', () => {
    const QUOTE = data.find(quote => /Life comes from the earth/.test(quote.en));

    expect(QUOTE).toHaveProperty('author', 'Zhuangzi');
    expect(QUOTE).toHaveProperty('qid', '2acd1bf7');

    console.log('Quote found (2):', QUOTE);
  });
});
