// ...existing code...
import nodemailer from 'nodemailer';
import multer from 'multer';
import path from 'path';
// Added SendGrid support
import sgMail from '@sendgrid/mail';

// Configure multer for file uploads
const storage = multer.memoryStorage();
export const upload = multer({ storage: storage });

// Initialize SendGrid if API key provided
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Helper: create transporter when needed so dotenv has had a chance to run
export function createTransporter() {
  const provider = (process.env.EMAIL_PROVIDER || 'smtp').toLowerCase();

  if (provider === 'sendgrid') {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY is not set but EMAIL_PROVIDER=sendgrid');
    }
    // For SendGrid we don't return a nodemailer transporter — caller uses sgMail directly.
    return null;
  }

  // SMTP fallback (configurable)
  const user = process.env.EMAIL;
  const pass = process.env.PASSWORD;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = (process.env.SMTP_SECURE === 'true') || (port === 465);

  if (!user || !pass) {
    throw new Error('Email credentials are not set. Make sure EMAIL and PASSWORD exist in your env');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    // increase timeouts so Render latency doesn't immediately kill connection
    connectionTimeout: parseInt(process.env.SMTP_CONNECTION_TIMEOUT || '30000', 10),
    greetingTimeout: parseInt(process.env.SMTP_GREETING_TIMEOUT || '30000', 10),
    socketTimeout: parseInt(process.env.SMTP_SOCKET_TIMEOUT || '30000', 10),
    tls: {
      rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== 'false'
    }
  });
}

export const test = (req, res) => {
  res.json({
    message: 'Api route is working!',
  });
};

export const sendMail = async (req, res) => {
  try {
    const { to, subject, text } = req.body;

    // Prepare attachments if files were uploaded
    const attachments = req.files ? req.files.map(file => ({
      filename: file.originalname,
      content: file.buffer,
      contentType: file.mimetype
    })) : [];

    const provider = (process.env.EMAIL_PROVIDER || 'smtp').toLowerCase();

    if (provider === 'sendgrid') {
      // Use SendGrid HTTP API (recommended on hosted platforms)
      const msg = {
        to,
        from: process.env.SENDGRID_FROM || process.env.EMAIL, // must be verified sender in SendGrid
        subject,
        text,
        // convert attachments to base64 per SendGrid API
        attachments: attachments.map(a => ({
          content: a.content.toString('base64'),
          filename: a.filename,
          type: a.contentType || 'application/octet-stream',
          disposition: 'attachment'
        }))
      };

      await sgMail.send(msg);
      return res.status(200).json({ message: 'Email sent via SendGrid successfully' });
    }

    // SMTP path (nodemailer)
    const transporter = createTransporter();
    if (!transporter) throw new Error('Transporter not configured');

    const mailOptions = {
      from: process.env.EMAIL,
      to,
      subject,
      text,
      attachments: attachments.map(a => ({
        filename: a.filename,
        content: a.content
      }))
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Email sent successfully (SMTP)' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
};