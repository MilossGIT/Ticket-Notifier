const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function sendEmail(data) {
  const { events, changes, isPremiereMonth, upcomingPremieres } = data;

  if (changes.length === 0 && upcomingPremieres.length === 0) {
    console.log('No changes or premieres to report. Skipping email.');
    return null;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const newlyAvailable = changes.filter(
    (event) =>
      event.status === 'available' &&
      (!event.previousStatus || event.previousStatus !== 'available')
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
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 { 
            color: #2c3e50; 
            text-align: center;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
          }
          .section {
            background: #fff;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .event {
            border-bottom: 1px solid #eee;
            padding: 15px;
            margin-bottom: 15px;
          }
          .event h3 {
            color: #2c3e50;
            margin: 0 0 10px 0;
          }
          .urgent { background-color: #ff4444; color: white; }
          .new { background-color: #00C851; color: white; }
          .update { background-color: #ffbb33; color: black; }
          .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #3498db;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <h1>Ticket Update - ${new Date().toLocaleDateString()}</h1>
        
        ${
          newlyAvailable.length > 0
            ? `
          <div class="section urgent">
            <h2>🎫 New Tickets Available!</h2>
            ${newlyAvailable
              .map(
                (event) => `
              <div class="event">
                <h3>${event.title}</h3>
                <p><strong>Date:</strong> ${event.date}</p>
                <p><strong>Price:</strong> ${event.price}</p>
                <p><strong>Venue:</strong> ${event.venue}</p>
                ${
                  event.purchaseLink
                    ? `
                  <a href="${event.purchaseLink}" class="button">
                    Purchase Now
                  </a>
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
          <div class="section new">
            <h2>🎭 Upcoming Premieres</h2>
            ${upcomingPremieres
              .map(
                (premiere) => `
              <div class="event">
                <h3>${premiere.title}</h3>
                <p><strong>Date:</strong> ${premiere.date.toLocaleDateString()}</p>
                <p><strong>Venue:</strong> ${premiere.venue}</p>
                ${
                  premiere.originalEvent?.purchaseLink
                    ? `
                  <a href="${premiere.originalEvent.purchaseLink}" class="button">
                    Reserve Tickets
                  </a>
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
          statusUpdates.length > 0
            ? `
          <div class="section update">
            <h2>📢 Status Updates</h2>
            ${statusUpdates
              .map(
                (event) => `
              <div class="event">
                <h3>${event.title}</h3>
                <p><strong>Status:</strong> ${event.status} (was: ${
                  event.previousStatus
                })</p>
                <p><strong>Date:</strong> ${event.date}</p>
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

        <div style="margin-top: 20px; color: #666; text-align: center;">
          <p>This is an automated notification from your Ticket Notifier.</p>
          <p>Next check will be in a few hours.</p>
          <p>Current time: ${new Date().toLocaleString()}</p>
          ${
            isPremiereMonth
              ? '<p>🎭 This is a premiere month - checking more frequently.</p>'
              : ''
          }
        </div>
      </body>
    </html>
  `;

  const subject =
    newlyAvailable.length > 0
      ? '🚨 New Tickets Available!'
      : upcomingPremieres.length > 0
      ? '🎭 New Premieres Announced'
      : 'Ticket Update';

  const recipients = process.env.RECIPIENT_EMAILS
    ? process.env.RECIPIENT_EMAILS.split(',')
    : ['your-default-email@gmail.com'];

  const mailOptions = {
    from: `"Ticket Notifier" <${process.env.EMAIL_USER}>`,
    to: recipients.join(', '),
    subject: subject,
    html: htmlContent,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('Email sent successfully. Message ID:', info.messageId);
  return info;
}

module.exports = { sendEmail };
