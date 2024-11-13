const nodemailer = require('nodemailer');
require('dotenv').config();

async function sendEmail(data) {
  const { events, changes, upcomingPremieres } = data;

  // Get all available and sold out tickets
  const availableTickets = events.filter(
    (event) => event.status === 'available' && event.purchaseLink
  );

  const soldOutEvents = events.filter(
    (event) =>
      event.status === 'sold_out' ||
      event.isSoldOut ||
      event.status.toLowerCase().includes('razprodano')
  );

  // Only send email if there are updates to report
  if (
    changes.length === 0 &&
    upcomingPremieres.length === 0 &&
    availableTickets.length === 0 &&
    soldOutEvents.length === 0
  ) {
    console.log('No updates to report. Skipping email.');
    return null;
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD?.replace(/\s+/g, ''),
    },
  });

  // Group changes by type
  const newlyAvailable = changes.filter(
    (event) =>
      event.status === 'available' &&
      (!event.previousStatus || event.previousStatus !== 'available')
  );

  const newlySoldOut = changes.filter(
    (event) =>
      (event.status === 'sold_out' ||
        event.isSoldOut ||
        event.status.toLowerCase().includes('razprodano')) &&
      event.previousStatus !== 'sold_out'
  );

  const statusUpdates = changes.filter(
    (event) =>
      event.changeType === 'updated' && event.status !== event.previousStatus
  );

  const htmlContent = `
    <html>
      <head>
        <style>
          body { 
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .urgent { 
            background-color: #ff4444; 
            color: white; 
            padding: 15px; 
            margin: 15px 0;
            border-radius: 8px;
          }
          .new { 
            background-color: #00C851; 
            color: white;
            padding: 15px;
            margin: 15px 0;
            border-radius: 8px;
          }
          .update { 
            background-color: #ffbb33; 
            color: black;
            padding: 15px;
            margin: 15px 0;
            border-radius: 8px;
          }
          .available {
            background-color: #4285f4;
            color: white;
            padding: 15px;
            margin: 15px 0;
            border-radius: 8px;
          }
          .sold-out {
            background-color: #dc3545;
            color: white;
            padding: 15px;
            margin: 15px 0;
            border-radius: 8px;
          }
          .event { 
            margin: 15px 0;
            padding: 10px;
            border-bottom: 1px solid rgba(255,255,255,0.2);
          }
          .event:last-child {
            border-bottom: none;
          }
          .button {
            display: inline-block;
            padding: 8px 15px;
            background-color: white;
            color: #333;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 10px;
            transition: opacity 0.2s;
          }
          .button:hover {
            opacity: 0.9;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            background: rgba(255,255,255,0.2);
            margin-left: 10px;
          }
          h3 { margin: 0 0 10px 0; }
          p { margin: 5px 0; }
        </style>
      </head>
      <body>
        <h1>LGL Theater Update - ${new Date().toLocaleDateString()}</h1>
        
        ${
          newlyAvailable.length > 0
            ? `
          <div class="urgent">
            <h2>🎫 New Tickets Available!</h2>
            ${newlyAvailable
              .map(
                (event) => `
              <div class="event">
                <h3>${event.title}</h3>
                <p><strong>Date:</strong> ${event.eventDate || event.date}</p>
                <p><strong>Venue:</strong> ${event.venue}</p>
                <p><strong>Price:</strong> ${
                  event.price || 'Price not specified'
                }</p>
                ${
                  event.purchaseLink
                    ? `
                  <a href="${event.purchaseLink}" class="button">Purchase Tickets</a>
                `
                    : ''
                }
              </div>
            `
              )
              .join('')}
          </div>
        `
            : ''
        }

        ${
          upcomingPremieres.length > 0
            ? `
          <div class="new">
            <h2>🎭 Upcoming Premieres</h2>
            ${upcomingPremieres
              .map(
                (premiere) => `
              <div class="event">
                <h3>${premiere.title}</h3>
                <p><strong>Date:</strong> ${premiere.rawDate}</p>
                <p><strong>Venue:</strong> ${premiere.venue}</p>
                ${
                  premiere.originalEvent?.purchaseLink
                    ? `
                  <a href="${premiere.originalEvent.purchaseLink}" class="button">Reserve Tickets</a>
                `
                    : ''
                }
              </div>
            `
              )
              .join('')}
          </div>
        `
            : ''
        }

        ${
          availableTickets.length > 0
            ? `
          <div class="available">
            <h2>🎟️ Currently Available Shows</h2>
            ${availableTickets
              .map(
                (event) => `
              <div class="event">
                <h3>${event.title}</h3>
                <p><strong>Date:</strong> ${event.eventDate || event.date}</p>
                <p><strong>Venue:</strong> ${event.venue}</p>
                <p><strong>Price:</strong> ${
                  event.price || 'Price not specified'
                }</p>
                ${
                  event.purchaseLink
                    ? `
                  <a href="${event.purchaseLink}" class="button">Purchase Tickets</a>
                `
                    : ''
                }
              </div>
            `
              )
              .join('')}
          </div>
        `
            : ''
        }

        ${
          newlySoldOut.length > 0
            ? `
          <div class="sold-out">
            <h2>⚠️ Recently Sold Out</h2>
            ${newlySoldOut
              .map(
                (event) => `
              <div class="event">
                <h3>${event.title}</h3>
                <p><strong>Date:</strong> ${event.eventDate || event.date}</p>
                <p><strong>Venue:</strong> ${event.venue}</p>
                <span class="status-badge">RAZPRODANO</span>
              </div>
            `
              )
              .join('')}
          </div>
        `
            : ''
        }

        ${
          soldOutEvents.length > 0
            ? `
          <div class="sold-out">
            <h2>📊 Sold Out Shows</h2>
            ${soldOutEvents
              .map(
                (event) => `
              <div class="event">
                <h3>${event.title}</h3>
                <p><strong>Date:</strong> ${event.eventDate || event.date}</p>
                <p><strong>Venue:</strong> ${event.venue}</p>
                <span class="status-badge">RAZPRODANO</span>
              </div>
            `
              )
              .join('')}
          </div>
        `
            : ''
        }

        ${
          statusUpdates.length > 0
            ? `
          <div class="update">
            <h2>📢 Status Updates</h2>
            ${statusUpdates
              .map(
                (event) => `
              <div class="event">
                <h3>${event.title}</h3>
                <p><strong>Status:</strong> ${event.status} (was: ${
                  event.previousStatus
                })</p>
                <p><strong>Date:</strong> ${event.eventDate || event.date}</p>
                ${
                  event.purchaseLink
                    ? `
                  <a href="${event.purchaseLink}" class="button">View Event</a>
                `
                    : ''
                }
              </div>
            `
              )
              .join('')}
          </div>
        `
            : ''
        }

        <div style="margin-top: 20px; color: #666;">
          <p>This is an automated notification from your LGL Theater Notifier.</p>
          <p>Visit <a href="https://lgl.mojekarte.si/si/celotna-ponudba.html">LGL Theater Website</a> for complete listings.</p>
          <p>Next check will be in a few hours.</p>
          <p>Current time: ${new Date().toLocaleString()}</p>
        </div>
      </body>
    </html>
  `;

  const subject =
    newlyAvailable.length > 0
      ? '🚨 New Tickets Available!'
      : newlySoldOut.length > 0
      ? '⚠️ Shows Sold Out!'
      : upcomingPremieres.length > 0
      ? '🎭 New Premieres Announced'
      : availableTickets.length > 0
      ? '🎟️ Available Shows Update'
      : 'LGL Theater Update';

  const recipients = process.env.RECIPIENT_EMAILS
    ? process.env.RECIPIENT_EMAILS.split(',').map((email) => email.trim())
    : [];

  if (recipients.length === 0) {
    throw new Error('No recipient emails configured');
  }

  const mailOptions = {
    from: `"LGL Ticket Notifier" <${process.env.EMAIL_USER}>`,
    to: recipients.join(', '),
    subject: subject,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully. Message ID:', info.messageId);
    console.log(`Sent update about:
      - ${newlyAvailable.length} newly available tickets
      - ${newlySoldOut.length} newly sold out shows
      - ${upcomingPremieres.length} upcoming premieres
      - ${availableTickets.length} available shows
      - ${soldOutEvents.length} total sold out shows
      - ${statusUpdates.length} status updates
      to ${recipients.length} recipients`);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

module.exports = { sendEmail };
