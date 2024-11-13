const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

puppeteer.use(StealthPlugin());

const STATE_FILE = path.join(__dirname, 'scraper_state.json');

// Helper function for delays
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper Functions
function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (e) {
    return {
      knownEvents: {},
      lastCheck: null,
      premiereMonths: {},
      upcomingPremieres: [],
    };
  }
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function parsePremiereDate(dateStr) {
  if (!dateStr) return null;

  const months = {
    jan: 0,
    januar: 0,
    januarja: 0,
    feb: 1,
    februar: 1,
    februarja: 1,
    mar: 2,
    marec: 2,
    marca: 2,
    apr: 3,
    april: 3,
    aprila: 3,
    maj: 4,
    maja: 4,
    jun: 5,
    junij: 5,
    junija: 5,
    jul: 6,
    julij: 6,
    julija: 6,
    avg: 7,
    avgust: 7,
    avgusta: 7,
    sep: 8,
    september: 8,
    septembra: 8,
    okt: 9,
    oktober: 9,
    oktobra: 9,
    nov: 10,
    november: 10,
    novembra: 10,
    dec: 11,
    december: 11,
    decembra: 11,
  };

  try {
    dateStr = dateStr.replace(/^[^,]*,\s*/, '');
    const patterns = [
      /(\d{1,2})\.\s*(\w+)\.\s*(\d{4})/i,
      /(\d{1,2})\s*(\w+)\s*(\d{4})/i,
      /(\w+)\s*(\d{1,2})\.*\s*(\d{4})/i,
    ];

    for (const pattern of patterns) {
      const match = dateStr.match(pattern);
      if (match) {
        let day, month, year;

        if (months[match[2].toLowerCase().replace(/\.$/, '')] !== undefined) {
          day = parseInt(match[1]);
          month = months[match[2].toLowerCase().replace(/\.$/, '')];
          year = parseInt(match[3]);
        } else if (
          months[match[1].toLowerCase().replace(/\.$/, '')] !== undefined
        ) {
          month = months[match[1].toLowerCase().replace(/\.$/, '')];
          day = parseInt(match[2]);
          year = parseInt(match[3]);
        }

        if (day && month !== undefined && year) {
          const date = new Date(year, month, day);
          if (!isNaN(date.getTime())) {
            return date;
          }
        }
      }
    }
  } catch (error) {
    console.error('Error parsing premiere date:', error);
  }
  return null;
}

function isPremiereMonth(premieres) {
  if (!premieres || premieres.length === 0) return false;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return premieres.some((premiere) => {
    if (!premiere.date) return false;

    const premiereDate = premiere.date;
    const isCurrentMonth =
      premiereDate.getMonth() === currentMonth &&
      premiereDate.getFullYear() === currentYear;
    const isNextMonth =
      premiereDate.getMonth() === (currentMonth + 1) % 12 &&
      (premiereDate.getMonth() === 0 ? currentYear + 1 : currentYear) ===
        premiereDate.getFullYear();
    const isMonthBefore =
      premiereDate.getMonth() === (currentMonth - 1 + 12) % 12 &&
      (currentMonth === 0 ? currentYear - 1 : currentYear) ===
        premiereDate.getFullYear();

    return isCurrentMonth || isNextMonth || isMonthBefore;
  });
}

async function scrapeTickets() {
  console.log('Starting scrapeTickets function...');
  const state = loadState();
  const currentEvents = {};
  const upcomingPremieres = [];
  let allEvents = [];

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--window-size=1920,1080',
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
    });

    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(60000);
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );

    console.log('Navigating to the page...');
    await page.goto('https://lgl.mojekarte.si/si/celotna-ponudba.html', {
      waitUntil: 'networkidle0',
      timeout: 60000,
    });

    try {
      await page.waitForSelector('#hide-cookie-policy-notice', {
        timeout: 20000,
      });
      await page.evaluate(() => {
        const element = document.querySelector('#hide-cookie-policy-notice');
        if (element) element.click();
      });
      await delay(2000);
    } catch (error) {
      console.log('Cookie notice handled:', error.message);
    }

    let pageNumber = 1;
    const maxRetries = 3;

    // Main scraping loop
    while (true) {
      let retries = 0;
      let pageScraped = false;

      while (retries < maxRetries && !pageScraped) {
        try {
          await page.waitForSelector('.perf-wrapper', { timeout: 30000 });

          const events = await page.evaluate(() => {
            const eventNodes = document.querySelectorAll('.perf-wrapper');
            return Array.from(eventNodes)
              .map((event) => {
                try {
                  const title =
                    event
                      .querySelector('.perf-info-title a')
                      ?.innerText.trim() || 'No title';
                  const fullText = event.innerText;
                  const dateText =
                    event
                      .querySelector('.perf-info-date .date-text')
                      ?.innerText.trim() || 'No date';

                  // Enhanced status detection
                  const soldOutText = [
                    'RAZPRODANO',
                    'Razprodano',
                    'razprodano',
                  ];
                  const isSoldOut = soldOutText.some(
                    (text) =>
                      event
                        .querySelector('.sysnote')
                        ?.innerText.includes(text) ||
                      event
                        .querySelector('.note-highlighted')
                        ?.innerText.includes(text) ||
                      fullText.includes(text)
                  );

                  // Check for purchase button and link
                  const purchaseButton = event.querySelector(
                    '.fast-buy.buy-button:not(.disabled)'
                  );
                  const purchaseLink = purchaseButton?.href || null;

                  // Price extraction with fallback
                  let price = event
                    .querySelector('.perf-info-price-list b')
                    ?.innerText.trim();
                  if (price) price += ' EUR';

                  // Enhanced status detection
                  let status = 'unknown';
                  let availability = 'unknown';

                  if (isSoldOut) {
                    status = 'sold_out';
                    availability = 'razprodano';
                  } else if (purchaseLink) {
                    status = 'available';
                    availability = 'on_sale';
                  } else if (fullText.toLowerCase().includes('napovedujemo')) {
                    status = 'announced';
                    availability = 'upcoming';
                  } else {
                    status = 'upcoming';
                    availability = 'not_on_sale';
                  }

                  // Premiere detection
                  const premiereTags = [
                    'premiera in izven',
                    'premiera za vabljene',
                    'premiera',
                    'premier',
                  ];
                  const isPremiere = premiereTags.some(
                    (tag) =>
                      title.toLowerCase().includes(tag) ||
                      fullText.toLowerCase().includes(tag)
                  );

                  // Date processing
                  const dateMatch = dateText.match(
                    /(?:.*?,\s*)?(\d{1,2})\.\s*(\w+)\.\s*(\d{4})/i
                  );
                  const eventDate = dateMatch
                    ? `${dateMatch[1]}. ${dateMatch[2]}. ${dateMatch[3]}`
                    : null;

                  // Venue and additional info
                  const venue =
                    event.querySelector('.perf-venue a')?.innerText.trim() ||
                    'Venue not specified';
                  const genres = Array.from(
                    event.querySelectorAll('.perf-info-genre-link')
                  ).map((el) => el.innerText.trim());
                  const notes =
                    event.querySelector('.perf-info-note')?.innerText.trim() ||
                    null;

                  return {
                    title,
                    date: dateText,
                    eventDate,
                    venue,
                    price: price || 'Price not available',
                    status,
                    availability,
                    purchaseLink,
                    isSoldOut,
                    isPremiere,
                    premiereDate: isPremiere ? eventDate : null,
                    showType: genres.includes('lutkovna predstava')
                      ? 'puppet_show'
                      : genres.includes('dramska predstava')
                      ? 'drama'
                      : 'other',
                    importance: isPremiere
                      ? 'high'
                      : status === 'announced'
                      ? 'medium'
                      : 'normal',
                    eventId: `${title}-${dateText}`
                      .replace(/[^a-z0-9]/gi, '-')
                      .toLowerCase(),
                    rawDescription: fullText,
                    additionalInfo: {
                      genres,
                      notes,
                      isVabljeni: fullText.toLowerCase().includes('vabljene'),
                      hasNote: !!notes,
                    },
                  };
                } catch (err) {
                  console.error('Error processing event:', err);
                  return null;
                }
              })
              .filter((event) => event !== null);
          });

          console.log(`Found ${events.length} events on page ${pageNumber}`);

          events.forEach((event) => {
            if (event.isPremiere) {
              console.log(`\nPremiere found: "${event.title}"`);
              console.log(`Date: ${event.premiereDate || event.eventDate}`);
              console.log(`Status: ${event.status}`);
            }
          });

          allEvents = [...allEvents, ...events];
          pageScraped = true;
        } catch (error) {
          retries++;
          console.error(
            `Error scraping page ${pageNumber}, attempt ${retries}:`,
            error.message
          );
          if (retries === maxRetries) throw error;
          await delay(5000);
        }
      }

      // Check for next page
      const hasNextPage = await page.evaluate(() => {
        const nextButton = document.querySelector(
          '.navigation-top-pagination .next'
        );
        return nextButton && !nextButton.classList.contains('unavailable');
      });

      if (!hasNextPage) {
        console.log('Reached last page');
        break;
      }

      try {
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 45000 }),
          page.click('.navigation-top-pagination .next'),
        ]);
        pageNumber++;
        await delay(2000);
      } catch (error) {
        console.log('Navigation ended:', error.message);
        break;
      }
    }

    // Process results with new categorization
    allEvents.forEach((event) => {
      if (event.isPremiere || event.premiereDate) {
        const parsedDate = parsePremiereDate(
          event.premiereDate || event.eventDate
        );
        if (parsedDate) {
          upcomingPremieres.push({
            title: event.title,
            date: parsedDate,
            venue: event.venue,
            rawDate: event.premiereDate || event.eventDate,
            status: event.status,
            showType: event.showType,
            originalEvent: event,
          });
        }
      }

      if (event.eventId) {
        currentEvents[event.eventId] = event;
      }
    });

    // Detect changes with enhanced status tracking
    const changedEvents = allEvents
      .filter((event) => {
        if (!event.eventId) return false;
        const previousEvent = state.knownEvents?.[event.eventId];

        return (
          !previousEvent ||
          previousEvent.status !== event.status ||
          previousEvent.availability !== event.availability ||
          (previousEvent.status === 'upcoming' && event.purchaseLink) ||
          (previousEvent.status === 'announced' &&
            event.status === 'available') ||
          (event.isPremiere && !previousEvent.isPremiere) ||
          previousEvent.isSoldOut !== event.isSoldOut
        );
      })
      .map((event) => ({
        ...event,
        changeType: !state.knownEvents?.[event.eventId] ? 'new' : 'updated',
        previousStatus: state.knownEvents?.[event.eventId]?.status || null,
        previousAvailability:
          state.knownEvents?.[event.eventId]?.availability || null,
      }));

    // Update state
    state.knownEvents = currentEvents;
    state.lastCheck = new Date().toISOString();
    state.upcomingPremieres = upcomingPremieres;
    saveState(state);

    // Prepare comprehensive results
    const processedResults = {
      events: allEvents,
      changes: changedEvents,
      isPremiereMonth: isPremiereMonth(upcomingPremieres),
      upcomingPremieres,
      availableTickets: allEvents.filter(
        (event) => event.status === 'available' && event.purchaseLink
      ),
      soldOutShows: allEvents.filter(
        (event) => event.status === 'sold_out' || event.isSoldOut
      ),
      upcomingShows: allEvents.filter((event) =>
        ['announced', 'upcoming'].includes(event.status)
      ),
    };

    // Log summary
    console.log('\nEvent Summary:');
    console.log(`- Total events: ${processedResults.events.length}`);
    console.log(
      `- Available tickets: ${processedResults.availableTickets.length}`
    );
    console.log(`- Sold out shows: ${processedResults.soldOutShows.length}`);
    console.log(`- Upcoming shows: ${processedResults.upcomingShows.length}`);
    console.log(`- Premieres: ${processedResults.upcomingPremieres.length}`);
    console.log(`- Changed events: ${processedResults.changes.length}\n`);

    return processedResults;
  } catch (error) {
    console.error('Error in scrapeTickets function:', error);

    // Take error screenshot if possible
    try {
      if (page) {
        await page.screenshot({
          path: path.join(__dirname, 'error_screenshot.png'),
          fullPage: true,
        });
      }
    } catch (screenshotError) {
      console.error('Failed to take error screenshot:', screenshotError);
    }

    throw error;
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
  }
}

// Export both the main function and helper functions for testing
module.exports = {
  scrapeTickets,
  parsePremiereDate,
  isPremiereMonth,
  loadState,
  saveState,
};
