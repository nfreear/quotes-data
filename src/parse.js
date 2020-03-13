/**
 *
 * @author NDF / 09-March-2020.
 * @see https://openquotes.github.io/authors/a-a-milne-quotes/index.html
 * @see https://stackoverflow.com/questions/6156501/read-a-file-one-line-at-a-time-in-node-js
 */

const cheerio = require('cheerio');
const fs = require('fs');
const readline = require('readline');
const path = require('path');

const AUTHOR_REF = 'a-a-milne';

const LIMIT = 1;
const LETTER = 'a';
const STATS_FILE = path.join(__dirname, '..', 'data', 'stats', `${LETTER}.json`);

const authorRefs = getAuthorsStarting(LETTER);
let stats = [];

authorRefs.then(async refs => {
  await refs.slice(0, LIMIT).forEach(async (ref) => {
    await parseHtmlFile(ref);
  });

  writeCompactJsonFile(STATS_FILE, { stats });
});

async function getAuthorsStarting(letter = 'a') {
  const FILE = path.join(__dirname, '..', 'data', 'authors.txt');

  let authorRefs = [];

  await processLineByLine(FILE, line => {
    if (line.substring(0, 1) === letter) {
      authorRefs.push(line);
      return true;
    }
    return false;
  });

  return authorRefs;
}

async function processLineByLine(filePath, callbackFn) {
  const fileStream = fs.createReadStream(filePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  for await (const line of rl) {
    // Each line in input.txt will be successively available here as `line`.
    console.log(`Line from file: ${line}`);

    const bContinue = callbackFn(line);

    if (!bContinue) return;
  }
}

function writeCompactJsonFile(filePath, data) {
  const json = JSON.stringify(data, null, 2);
  const compacted = json.replace(/\},\s+\{/gms, '},{').replace(/  /g, '').replace(/": "/g, '":"');

  fs.promises.writeFile(filePath, compacted);
}

async function parseHtmlFile(authorRef = AUTHOR_REF) {
  const INPUT  = path.join(__dirname, '..', 'openquotes.github.io', 'authors', `${authorRef}-quotes`, 'index.html');
  const OUTPUT = path.join(__dirname, '..', 'data', 'a', `${authorRef}-quotes.json`);

  const HTML = await fs.promises.readFile(INPUT, 'utf8');
  const $ = cheerio.load(HTML);

  // <span itemprop="author">A. A. Milne</span>
  const name = $('span[ itemprop = author ]').text();
  const imageUrl = $('img.mauthor_img').attr('src');
  const image = path.basename(imageUrl).replace(/-quotes\.jpg/, '');

  const $QUOTES = $('article p.q');

  stats.push({ id: authorRef, name, count: $QUOTES.length });

  console.log('>', name, image, $QUOTES.length);

  let quotes = [];

  $QUOTES.each((idx, domQuote) => {
    const ID = $(domQuote).attr('id');
    // <span itemprop="citation">If one is to be called a liar, ... deserve the name.</span>
    const QUOTE = $(domQuote).find('span[ itemprop = citation ]').text();

    // console.log(idx, ID, QUOTE);

    quotes.push({ id: ID, en: QUOTE });
  });


  writeCompactJsonFile(OUTPUT, { name, image, quotes });
}

// End.
