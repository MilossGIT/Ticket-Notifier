require('dotenv').config();
const { scrapeTickets } = require('./scraper');
const { sendEmail } = require('./emailService');
const { formatDate, sleep } = require('./utils');

async function logMessage(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type}] ${message}`;
  console.log(logMessage);
}

async function runCheck(retryCount = 3) {
  try {
    await logMessage('Starting scheduled ticket check');

    // Run the scraper with retry logic
    let result;
    for (let i = 0; i < retryCount; i++) {
      try {
        await logMessage('Initiating scrape operation');
        result = await scrapeTickets();
        break;
      } catch (error) {
        if (i === retryCount - 1) throw error;
        await logMessage(`Scrape attempt ${i + 1} failed, retrying...`, 'WARN');
        await sleep(2000 * (i + 1)); // Exponential backoff
      }
    }

    await logMessage(`Found ${result.events.length} total events`);
    await logMessage(`Detected ${result.changes.length} changes`);

    // Log premieres
    if (result.upcomingPremieres.length > 0) {
      await logMessage(
        `Found ${result.upcomingPremieres.length} upcoming premieres`,
        'PREMIERE'
      );
      result.upcomingPremieres.forEach((premiere) => {
        logMessage(
          `- ${premiere.title} on ${formatDate(premiere.date)}`,
          'PREMIERE'
        );
      });
    }

    // Send email notification
    if (
      result.changes.length > 0 ||
      result.upcomingPremieres.length > 0 ||
      result.events.some((e) => e.status === 'available')
    ) {
      await logMessage('Sending email notification');
      for (let i = 0; i < retryCount; i++) {
        try {
          await sendEmail(result);
          await logMessage('Email sent successfully');
          break;
        } catch (error) {
          if (i === retryCount - 1) throw error;
          await logMessage(
            `Email attempt ${i + 1} failed, retrying...`,
            'WARN'
          );
          await sleep(2000 * (i + 1));
        }
      }
    } else {
      await logMessage('No updates to report, skipping email');
    }

    await logMessage('Check completed successfully', 'SUCCESS');
    return {
      success: true,
      eventsFound: result.events.length,
      changes: result.changes.length,
      premieres: result.upcomingPremieres.length,
    };
  } catch (error) {
    await logMessage(`Error during check: ${error.message}`, 'ERROR');
    await logMessage(error.stack, 'ERROR');

    // Send error notification
    try {
      const errorEmail = {
        events: [],
        changes: [
          {
            title: 'System Error',
            date: new Date().toISOString(),
            status: 'error',
            changeType: 'error',
            description: error.message,
            stack: error.stack,
          },
        ],
        upcomingPremieres: [],
      };

      await sendEmail(errorEmail);
      await logMessage('Error notification email sent', 'ERROR');
    } catch (emailError) {
      await logMessage(
        `Failed to send error email: ${emailError.message}`,
        'ERROR'
      );
    }

    throw error;
  }
}

// Error handling for unhandled rejections
process.on('unhandledRejection', async (error) => {
  await logMessage(`Unhandled rejection: ${error.message}`, 'ERROR');
  await logMessage(error.stack, 'ERROR');
  process.exit(1);
});

// Main execution
if (require.main === module) {
  runCheck()
    .then((result) => {
      logMessage(`Run completed: ${JSON.stringify(result)}`, 'COMPLETE');
      process.exit(0);
    })
    .catch((error) => {
      logMessage(`Run failed: ${error.message}`, 'ERROR');
      process.exit(1);
    });
}

module.exports = { runCheck };
