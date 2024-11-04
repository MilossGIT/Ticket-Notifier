const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

puppeteer.use(StealthPlugin());

async function scrapeTickets() {
  console.log('Starting scrapeTickets function...');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );

    console.log('Navigating to the page...');
    await page.goto('https://lgl.mojekarte.si/si/celotna-ponudba.html', {
      waitUntil: 'networkidle0',
      timeout: 60000,
    });

    try {
      console.log('Waiting for cookie policy notice...');
      await page.waitForSelector('#hide-cookie-policy-notice', {
        timeout: 20000,
      });
      await page.click('#hide-cookie-policy-notice');
      await page.waitForTimeout(1000);
    } catch (error) {
      console.log(
        'Cookie notice not found or already accepted:',
        error.message
      );
    }

    let events = [];
    let pageNumber = 1;
    const maxRetries = 3;

    while (true) {
      let retries = 0;
      let pageScraped = false;

      while (retries < maxRetries && !pageScraped) {
        try {
          await page.waitForSelector('.perf-wrapper', { timeout: 30000 });

          await page.screenshot({
            path: path.join(__dirname, `page_${pageNumber}.png`),
            fullPage: true,
          });

          const pageEvents = await page.evaluate(() => {
            const eventNodes = document.querySelectorAll(
              '.perf-wrapper:not(.corner-ribon)'
            );
            return Array.from(eventNodes)
              .map((event) => ({
                title:
                  event.querySelector('.perf-info-title a')?.innerText.trim() ||
                  'No title',
                date:
                  event
                    .querySelector('.perf-info-date .date-text')
                    ?.innerText.trim() || 'No date',
                price:
                  event
                    .querySelector('.perf-info-price-list b')
                    ?.innerText.trim() + ' EUR' || 'Price not available',
                venue:
                  event.querySelector('.perf-venue a')?.innerText.trim() ||
                  'Venue not specified',
                purchaseLink:
                  event.querySelector('.fast-buy.buy-button:not(.disabled)')
                    ?.href || null,
              }))
              .filter((event) => event.purchaseLink);
          });

          events = events.concat(pageEvents);
          pageScraped = true;
          console.log(
            `Found ${pageEvents.length} events on page ${pageNumber}`
          );
        } catch (error) {
          retries++;
          console.error(
            `Error scraping page ${pageNumber}, attempt ${retries}:`,
            error.message
          );
          await page.screenshot({
            path: path.join(
              __dirname,
              `error_screenshot_page${pageNumber}.png`
            ),
          });
          if (retries === maxRetries) throw error;
          await page.waitForTimeout(5000);
        }
      }

      const hasNextPage = await page.evaluate(() => {
        const nextButton = document.querySelector(
          '.navigation-top-pagination .next'
        );
        return nextButton && !nextButton.classList.contains('unavailable');
      });

      if (!hasNextPage) break;

      try {
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }),
          page.click('.navigation-top-pagination .next'),
        ]);
        pageNumber++;
      } catch (error) {
        console.error('Error navigating to next page:', error.message);
        await page.screenshot({
          path: path.join(__dirname, 'error_screenshot.png'),
        });
        break;
      }
    }

    return events;
  } catch (error) {
    console.error('Error in scrapeTickets function:', error);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = scrapeTickets;
