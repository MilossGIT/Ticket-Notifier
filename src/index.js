require('dotenv').config();
const scrapeTickets = require('./scraper');
const { sendEmail } = require('./email');
const fs = require('fs');
const path = require('path');

function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} [${type}]: ${message}`;
  console.log(logMessage);

  try {
    fs.appendFileSync(
      path.join(__dirname, 'ticket_checker.log'),
      logMessage + '\n'
    );
  } catch (error) {
    console.error('Error writing to log file:', error);
  }
}

async function checkTicketsAndNotify() {
  log('Daily ticket check started', 'START');

  try {
    log('Checking for ticket availability...', 'SCRAPE');
    const events = await scrapeTickets();
    log(`Scrape completed. Found ${events.length} total events.`, 'SCRAPE');

    if (events.length > 0) {
      log('Preparing daily update email...', 'EMAIL');
      try {
        const emailResult = await sendEmail(events);
        if (emailResult) {
          log('Daily update email sent successfully.', 'EMAIL');
        } else {
          log(
            'No daily update email sent. No complete event information available.',
            'WARN'
          );
        }
      } catch (emailError) {
        log(`Error sending daily update email: ${emailError.message}`, 'ERROR');
      }
    } else {
      log('No events found during scraping.', 'WARN');
    }
  } catch (error) {
    log(`Error during checkTicketsAndNotify: ${error.message}`, 'ERROR');
    throw error;
  }

  log('Daily ticket check completed', 'END');
}

module.exports = {
  checkTicketsAndNotify,
  log,
};
