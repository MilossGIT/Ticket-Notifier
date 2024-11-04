const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const { checkTicketsAndNotify } = require('./index');

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp}: ${message}\n`;
  console.log(logMessage.trim());
  fs.appendFileSync(path.join(__dirname, 'ticket_checker.log'), logMessage);
}

async function runCheck() {
  log('Running ticket availability check...');
  try {
    await checkTicketsAndNotify();
    log('Ticket check completed successfully.');
  } catch (error) {
    log(`Error during ticket check: ${error.message}`);
  }
}

// Run immediately on startup
runCheck();

// Schedule morning check (9 AM)
cron.schedule('0 9 * * *', runCheck, {
  scheduled: true,
  timezone: 'Europe/Ljubljana',
});

// Schedule afternoon check (3 PM)
cron.schedule('0 15 * * *', runCheck, {
  scheduled: true,
  timezone: 'Europe/Ljubljana',
});

log('Ticket checker started. Scheduled for 9 AM and 3 PM daily.');

// Keep the script running
process.stdin.resume();
