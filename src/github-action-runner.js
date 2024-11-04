require('dotenv').config();
const fs = require('fs');
const path = require('path');
const scrapeTickets = require('./scraper');
const { sendEmail } = require('./email');

async function runTicketCheck() {
  try {
    console.log('Starting ticket check...');

    // Debug: Check environment variables
    console.log('Environment variables check:');
    console.log('EMAIL_USER exists:', !!process.env.EMAIL_USER);
    console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);
    console.log('RECIPIENT_EMAILS exists:', !!process.env.RECIPIENT_EMAILS);
    console.log(
      'PUPPETEER_EXECUTABLE_PATH:',
      process.env.PUPPETEER_EXECUTABLE_PATH
    );

    // Debug: Check if .env file exists and its contents
    const envPath = path.join(__dirname, '.env');
    console.log('.env file exists:', fs.existsSync(envPath));
    if (fs.existsSync(envPath)) {
      console.log('.env file contents:');
      console.log(fs.readFileSync(envPath, 'utf8'));
    }

    // Debug: List directory contents
    console.log('Directory contents:');
    console.log(fs.readdirSync(__dirname));

    console.log('Running scraper...');
    const events = await scrapeTickets();
    console.log(
      `Found ${events.length} events:`,
      JSON.stringify(events, null, 2)
    );

    if (events && events.length > 0) {
      console.log('Attempting to send email...');
      await sendEmail(events);
      console.log('Email notification sent successfully');
    } else {
      console.log('No events found, skipping email');
    }
  } catch (error) {
    console.error('Error during ticket check:', error.message);
    console.error('Full error:', error);
    console.error('Stack trace:', error.stack);

    // Create an error log file
    const errorLogPath = path.join(__dirname, 'error.log');
    fs.writeFileSync(
      errorLogPath,
      `
      Error Time: ${new Date().toISOString()}
      Error Message: ${error.message}
      Stack Trace: ${error.stack}
      Environment:
      - NODE_ENV: ${process.env.NODE_ENV}
      - PUPPETEER_PATH: ${process.env.PUPPETEER_EXECUTABLE_PATH}
    `
    );

    process.exit(1);
  }
}

runTicketCheck();
