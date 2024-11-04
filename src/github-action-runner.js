require('dotenv').config();
const scrapeTickets = require('./scraper');
const { sendEmail } = require('./email');

async function runTicketCheck() {
  try {
    console.log('Starting ticket check...');
    console.log('Environment check:', {
      emailUser: process.env.EMAIL_USER ? 'Set' : 'Not set',
      emailPass: process.env.EMAIL_PASS ? 'Set' : 'Not set',
      recipientEmails: process.env.RECIPIENT_EMAILS ? 'Set' : 'Not set',
      puppeteerPath: process.env.PUPPETEER_EXECUTABLE_PATH,
    });

    console.log('Running scraper...');
    const events = await scrapeTickets();
    console.log(`Found ${events.length} events`);

    if (events.length > 0) {
      console.log('Attempting to send email...');
      await sendEmail(events);
      console.log('Email notification sent successfully');
    } else {
      console.log('No events found, skipping email');
    }
  } catch (error) {
    console.error('Error during ticket check:', error);
    console.error('Error stack:', error.stack);
    process.exit(1);
  }
}

runTicketCheck();
