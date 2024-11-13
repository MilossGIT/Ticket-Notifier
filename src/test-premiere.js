const scrapeTickets = require('./scraper');
const fs = require('fs');
const path = require('path');

// Helper Functions
function findPremiereContext(text) {
  if (!text) return 'No description available';

  const lines = text.split('\n');
  let premiereLines = [];
  const premiereKeywords = ['premiera', 'premier', 'premiere', 'vabljene'];

  lines.forEach((line, index) => {
    if (
      premiereKeywords.some((keyword) => line.toLowerCase().includes(keyword))
    ) {
      if (index > 0) premiereLines.push(lines[index - 1]);
      premiereLines.push(line);
      if (index < lines.length - 1) premiereLines.push(lines[index + 1]);
    }
  });

  return premiereLines.length > 0
    ? premiereLines.join('\n')
    : 'No premiere context found';
}

function getDateDifference(date) {
  if (!date) return 'Invalid date';

  const now = new Date();
  const diffTime = date - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Past event';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `In ${diffDays} days`;
  if (diffDays < 14) return `In ${Math.floor(diffDays / 7)} week`;
  if (diffDays < 30) return `In ${Math.floor(diffDays / 7)} weeks`;
  if (diffDays < 60) return `In 1 month`;
  return `In ${Math.floor(diffDays / 30)} months`;
}

function formatDatetime(date) {
  return new Date(date).toLocaleString('sl-SI', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function testPremiereDetection() {
  try {
    console.log('=== Starting Premiere Detection Test ===\n');
    const startTime = Date.now();
    const result = await scrapeTickets();
    const endTime = Date.now();

    // Performance metrics
    console.log('\n=== Performance Metrics ===');
    console.log(
      `Execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds`
    );
    console.log(
      `Average time per event: ${(
        (endTime - startTime) /
        result.events.length
      ).toFixed(2)} ms`
    );

    // Results overview
    console.log('\n=== Detailed Results ===');
    console.log(`Total events found: ${result.events.length}`);
    console.log(`Changes detected: ${result.changes.length}`);

    // Premiere events
    const premiereEvents = result.events.filter(
      (event) =>
        event.premiereDate ||
        event.isPremiere ||
        event.rawDescription.toLowerCase().includes('premiera')
    );

    if (premiereEvents.length > 0) {
      console.log('\n=== Events with Premiere Information ===');
      premiereEvents.forEach((event, index) => {
        console.log(`\n--- Event ${index + 1} ---`);
        console.log(`Title: ${event.title}`);
        console.log(`Event Date: ${event.date}`);
        console.log(`Premiere Date: ${event.premiereDate || 'Not detected'}`);
        console.log(`Status: ${event.status}`);
        console.log(`Venue: ${event.venue}`);
        console.log(`Show Type: ${event.showType}`);
        console.log(`Price: ${event.price}`);

        if (event.premiereDate) {
          const parsedDate = new Date(event.premiereDate);
          if (!isNaN(parsedDate.getTime())) {
            console.log(
              `Time until premiere: ${getDateDifference(parsedDate)}`
            );
          }
        }

        console.log('\nPremiereContext:');
        const premiereContext = findPremiereContext(event.rawDescription);
        console.log(premiereContext);
        console.log('\nAdditional Info:');
        console.log(`- Genres: ${event.additionalInfo.genres.join(', ')}`);
        console.log(
          `- Invitation Only: ${event.additionalInfo.isVabljeni ? 'Yes' : 'No'}`
        );
        if (event.additionalInfo.notes) {
          console.log(`- Notes: ${event.additionalInfo.notes}`);
        }
        console.log('-'.repeat(50));
      });
    } else {
      console.log('\nNo events with premiere information found');
    }

    // Upcoming premieres
    if (result.upcomingPremieres.length > 0) {
      console.log('\n=== Upcoming Premieres ===');
      const sortedPremieres = [...result.upcomingPremieres].sort(
        (a, b) => a.date - b.date
      );

      sortedPremieres.forEach((premiere, index) => {
        console.log(`\n${index + 1}. ${premiere.title}`);
        console.log(`   Date: ${formatDatetime(premiere.date)}`);
        console.log(
          `   Time until premiere: ${getDateDifference(premiere.date)}`
        );
        console.log(`   Venue: ${premiere.venue}`);
        console.log(`   Show Type: ${premiere.showType}`);
        console.log(`   Status: ${premiere.status}`);
      });
    } else {
      console.log('\nNo upcoming premieres found');
    }

    // Changes detected
    if (result.changes.length > 0) {
      console.log('\n=== Recent Changes ===');
      result.changes.forEach((change, index) => {
        console.log(`\n${index + 1}. ${change.title}`);
        console.log(`   Type: ${change.changeType}`);
        console.log(
          `   Status: ${change.status} ${
            change.previousStatus ? `(was: ${change.previousStatus})` : ''
          }`
        );
        console.log(`   Date: ${change.date}`);
      });
    }

    // Summary
    console.log('\n=== Summary ===');
    console.log(`Current Time: ${formatDatetime(new Date())}`);
    console.log(
      `Last Check: ${formatDatetime(result.lastCheck || new Date())}`
    );
    console.log(`Is premiere month: ${result.isPremiereMonth}`);
    console.log(`Total premiere events found: ${premiereEvents.length}`);
    console.log(`Upcoming premieres: ${result.upcomingPremieres.length}`);

    // Status distribution
    const statusCounts = result.events.reduce((acc, event) => {
      acc[event.status] = (acc[event.status] || 0) + 1;
      return acc;
    }, {});

    console.log('\n=== Event Status Distribution ===');
    Object.entries(statusCounts)
      .sort(([, a], [, b]) => b - a)
      .forEach(([status, count]) => {
        console.log(`${status}: ${count} events`);
      });

    // Show type distribution
    const showTypeCounts = result.events.reduce((acc, event) => {
      acc[event.showType] = (acc[event.showType] || 0) + 1;
      return acc;
    }, {});

    console.log('\n=== Show Type Distribution ===');
    Object.entries(showTypeCounts)
      .sort(([, a], [, b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`${type}: ${count} shows`);
      });
  } catch (error) {
    console.error('\n=== Test Failed ===');
    console.error('Error:', error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
  }
}

// Run the test
testPremiereDetection();
