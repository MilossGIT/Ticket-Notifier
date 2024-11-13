const { scrapeTickets } = require('./scraper');

async function test() {
  try {
    const result = await scrapeTickets();
    console.log('Scraping successful:', result);
  } catch (error) {
    console.error('Scraping failed:', error);
  }
}

test();
