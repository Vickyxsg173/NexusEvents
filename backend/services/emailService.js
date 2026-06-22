const nodemailer = require('nodemailer');

// Helper to safely format dates
const formatDate = (dateString) => {
  if (!dateString) return 'Date TBA';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Date TBA';
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  } catch {
    return 'Date TBA';
  }
};

// Create the transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // e.g., projectsusedev@gmail.com
    pass: process.env.GMAIL_APP_PASSWORD // The 16-character App Password from Google
  }
});

const sendNewsletter = async (user, recommendedEvents, frequency) => {
  if (!user.email) return false;
  if (!recommendedEvents || recommendedEvents.length === 0) return false;

  const subject = `Your ${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Event Recommendations from NexusEvents`;

  // Build the HTML body with inline CSS for wide email client support
  let eventsHtml = recommendedEvents.map(event => `
    <div style="background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 24px; overflow: hidden;">
      ${event.cover_image && event.cover_image !== 'null' && event.cover_image !== 'None' 
        ? `<img src="${event.cover_image}" alt="Cover" style="width: 100%; height: 180px; object-fit: cover; display: block;" />` 
        : `<div style="width: 100%; height: 180px; background-color: #6366f1; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px;">NexusEvents</div>`}
      <div style="padding: 24px;">
        <div style="margin-bottom: 12px;">
          <span style="display: inline-block; background-color: #e0f2fe; color: #0284c7; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">
            ${event.mode || 'EVENT'}
          </span>
        </div>
        <h3 style="margin: 0 0 4px 0; font-size: 22px; font-weight: 700; color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${event.title || 'Unknown Event'}</h3>
        <p style="margin: 0 0 20px 0; font-size: 15px; color: #64748b;">by ${event.organizer || event.source_platform || 'NexusEvents'}</p>
        
        <div style="margin-bottom: 24px; font-size: 15px; color: #334155;">
          <p style="margin: 0 0 8px 0;"><strong>Date:</strong> ${formatDate(event.start_date)}</p>
          <p style="margin: 0;"><strong>Location:</strong> ${event.venue || 'Online'}</p>
        </div>
        
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/event/${event.id}" style="display: inline-block; background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 15px;">View Details</a>
      </div>
    </div>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 0; margin: 0; color: #334155; line-height: 1.5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="margin: 0; color: #0284c7; font-size: 32px; font-weight: 800; letter-spacing: -0.5px;">NexusEvents</h1>
          <p style="margin: 8px 0 0 0; font-size: 18px; color: #64748b;">Your personalized event digest</p>
        </div>

        <div style="background-color: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <h2 style="margin: 0 0 24px 0; font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">Hello ${user.name || 'Developer'},</h2>
          <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #475569;">
            We've scoured the latest hackathons, tech conferences, and meetups to find the best opportunities matching your tech stack. Here are our top recommendations for you:
          </p>
          
          ${eventsHtml}
          
          <div style="margin-top: 40px; text-align: center;">
            <p style="margin: 0 0 16px 0; font-size: 16px; color: #475569;">Want to see more events?</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/discover" style="display: inline-block; background-color: #f8fafc; color: #0f172a; border: 1px solid #e2e8f0; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">Browse All Events</a>
          </div>
        </div>

        <div style="text-align: center; margin-top: 32px; font-size: 13px; color: #94a3b8;">
          <p style="margin: 0 0 8px 0;">You're receiving this because you subscribed to ${frequency} updates on NexusEvents.</p>
          <p style="margin: 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="color: #64748b; text-decoration: underline;">Update Subscription Preferences</a>
          </p>
        </div>
        
      </div>
    </body>
    </html>
  `;

  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.log(`[EMAIL MOCK] Missing Gmail credentials in .env. Would have sent to ${user.email}`);
      return true;
    }

    const info = await transporter.sendMail({
      from: `"NexusEvents" <${process.env.GMAIL_USER}>`,
      to: user.email,
      subject: subject,
      html: html,
    });

    console.log(`[EMAIL SUCCESS] Sent ${frequency} digest to ${user.email} (MessageId: ${info.messageId})`);
    return true;
  } catch (err) {
    console.error('[EMAIL ERROR] Failed to send email via Gmail:', err);
    return false;
  }
};

const sendEventReminderEmail = async (userEmail, event, daysLeft) => {
  if (!userEmail) return false;
  
  const subject = `Reminder: ${event.title || 'An event'} starts in ${daysLeft} day${daysLeft === 1 ? '' : 's'}!`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 0; margin: 0; color: #334155; line-height: 1.5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="margin: 0; color: #0284c7; font-size: 32px; font-weight: 800; letter-spacing: -0.5px;">NexusEvents</h1>
          <p style="margin: 8px 0 0 0; font-size: 18px; color: #64748b;">Event Reminder</p>
        </div>

        <div style="background-color: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <h2 style="margin: 0 0 24px 0; font-size: 24px; font-weight: bold; color: #0f172a;">Get Ready!</h2>
          <p style="margin: 0 0 24px 0; font-size: 16px; color: #475569;">
            This is a friendly reminder that an event you applied for is starting in exactly <strong>${daysLeft} day${daysLeft === 1 ? '' : 's'}</strong>!
          </p>
          
          <div style="background-color: #f1f5f9; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
            <h3 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700; color: #0f172a;">${event.title || 'Event Name'}</h3>
            <p style="margin: 0 0 16px 0; font-size: 15px; color: #64748b;">by ${event.organizer || event.source_platform || 'NexusEvents'}</p>
            
            <p style="margin: 0 0 8px 0;"><strong>Start Date:</strong> ${formatDate(event.start_date)}</p>
            <p style="margin: 0;"><strong>Location:</strong> ${event.venue || 'Online'}</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/event/${event.id}" style="display: inline-block; background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">View Event Details</a>
          </div>
        </div>

      </div>
    </body>
    </html>
  `;

  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.log(`[EMAIL MOCK] Reminder: Would have sent reminder for ${event.title} to ${userEmail}`);
      return true;
    }

    const info = await transporter.sendMail({
      from: `"NexusEvents" <${process.env.GMAIL_USER}>`,
      to: userEmail,
      subject: subject,
      html: html,
    });

    console.log(`[EMAIL SUCCESS] Sent reminder to ${userEmail} (MessageId: ${info.messageId})`);
    return true;
  } catch (err) {
    console.error('[EMAIL ERROR] Failed to send reminder email:', err);
    return false;
  }
};

module.exports = {
  sendNewsletter,
  sendEventReminderEmail
};
