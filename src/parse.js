/**
 * Parse (off-line) author-quote page(s) from 'Open Quotes', extracting the quote-text, etc.
 *
 * @author NDF / 09-March-2020.
 * @see https://openquotes.github.io/authors/a-a-milne-quotes/index.html
 * @see https://stackoverflow.com/questions/6156501/read-a-file-one-line-at-a-time-in-node-js
 */

const SHORT_LIST = require('../data/short-list');
const cheerio = require('cheerio');
const fs = require('fs');
const readline = require('readline');
const { join, basename } = require('path');

const BY_LETTER = false;

const AUTHOR_ID = 'a-a-milne';
const LETTER = 'a';
const LIMIT = 999;
const COMPACT_JSON = false;
const INPUT_DIR = 'openquotes.github.io';
const STATS_FILE = join(__dirname, '..', 'data', 'stats', `${LETTER}.json`);

let authorRefs;
if (BY_LETTER) {
  authorRefs = getAuthorsStarting(LETTER);
} else {
  authorRefs = Promise.resolve(SHORT_LIST.data.map(author => author.id));

  console.log('By short-list:', authorRefs);
}

const OUTPUT_DIR = BY_LETTER ? LETTER : 'short-list';

let stats = [];

authorRefs.then(async refs => {
  await refs.slice(0, LIMIT).forEach(async (ref) => {
    await parseHtmlFile(ref, OUTPUT_DIR);
  });

  writeCompactJsonFile(STATS_FILE, { stats });
});

// --------------------------------------------

async function getAuthorsStarting(letter = 'a') {
  const FILE = join(__dirname, '..', 'data', 'authors.txt');

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
  let compacted;
  if (COMPACT_JSON) {
    compacted = json.replace(/\},\s+\{/gms, '},{').replace(/  /g, '').replace(/": "/g, '":"');
  } else {
    compacted = json;
  }

  fs.promises.writeFile(filePath, compacted);
}

async function parseHtmlFile(authorId = AUTHOR_REF, outDir = LETTER) {
  const INPUT  = join(__dirname, '..', INPUT_DIR, 'authors', `${authorId}-quotes`, 'index.html');
  const OUTPUT = join(__dirname, '..', 'data', outDir, `${authorId}-quotes.json`);

  const HTML = await fs.promises.readFile(INPUT, 'utf8');
  const $ = cheerio.load(HTML);

  // <span itemprop="author">A. A. Milne</span>
  const author = $('span[ itemprop = author ]').text();
  const imageUrl = $('img.mauthor_img').attr('src');
  const imageId = basename(imageUrl).replace(/-quotes\.jpg/, '');

  const $QUOTES = $('article p.q');

  stats.push({ id: authorId, author, count: $QUOTES.length });

  console.log('>', author, imageId, $QUOTES.length);

  let quotes = [];

  $QUOTES.each((idx, domQuote) => {
    const qid = $(domQuote).attr('id');
    // <span itemprop="citation">If one is to be called a liar, ... deserve the name.</span>
    const QUOTE = $(domQuote).find('span[ itemprop = citation ]').text();

    quotes.push({ qid, author, en: QUOTE });
  });

  writeCompactJsonFile(OUTPUT, { author, imageId, data: quotes });
}

// End.
