# Ticket Notification System

This project is an automated ticket availability checker and notifier for the Lutkovno gledališče Ljubljana (Ljubljana Puppet Theatre) website. It scrapes the website for ticket information and sends daily email notifications about available tickets.

## Features

- Scrapes the Lutkovno gledališče Ljubljana website for ticket information
- Filters and processes event data
- Sends daily email notifications with available ticket information
- Supports multiple email recipients
- Runs automatically at a scheduled time each day

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v12 or higher) installed on your system
- A Gmail account for sending notifications
- (Optional) A server or always-on computer to run the script continuously

## Installation

1. Clone this repository:

   ```
   git clone https://github.com/MilossGIT/TicketNotifier.git
   cd ticket-notification-system
   ```

2. Install the necessary dependencies:

   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following content:
   ```
   EMAIL_USER=your_gmail_address@gmail.com
   EMAIL_PASS=your_gmail_app_password
   RECIPIENT_EMAILS=email1@example.com,email2@example.com
   ```
   Replace the email addresses and password with your actual Gmail credentials and recipient email addresses.

## Configuration

- The script is set to run daily at 9:00 AM. You can modify this schedule in the `cron.js` file.
- To add or remove email recipients, update the `RECIPIENT_EMAILS` variable in your `.env` file.

## Usage

To start the ticket notification system:

```
node cron.js
```

This will start the script, which will:

1. Immediately run a check for ticket availability
2. Schedule daily checks at 9:00 AM

The script will continue running until stopped. To stop the script, use `Ctrl+C` in the terminal.

## File Structure

- `cron.js`: Sets up the scheduling for daily checks
- `index.js`: Main logic for checking tickets and initiating notifications
- `scraper.js`: Contains the web scraping logic
- `email.js`: Handles email composition and sending

## Troubleshooting

- If emails are not being sent, check your Gmail account settings and ensure that "Less secure app access" is turned on, or use an App Password if you have 2-factor authentication enabled.
- If the scraper is not working, it might be due to changes in the website's structure. Check the selectors in `scraper.js` and update them if necessary.

## Contributing

Contributions to this project are welcome. Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.

## Contact

If you have any questions or feedback, please contact:

Your Name - youremail@example.com

Project Link: https://github.com/yourusername/ticket-notification-system
