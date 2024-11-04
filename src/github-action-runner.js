require('dotenv').config();
const scrapeTickets = require('./scraper');
const { sendEmail } = require('./email');

async function runTicketCheck() {
  try {
    console.log('Starting ticket check...');

    const events = await scrapeTickets();
    console.log(`Found ${events.length} events`);

    if (events.length > 0) {
      await sendEmail(events);
      console.log('Email notification sent successfully');
    } else {
      console.log('No events found, skipping email');
    }
  } catch (error) {
    console.error('Error during ticket check:', error);
    process.exit(1);
  }
}

runTicketCheck();
