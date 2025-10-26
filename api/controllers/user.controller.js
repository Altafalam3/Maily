import nodemailer from 'nodemailer';
import multer from 'multer';
import path from 'path';

// Configure multer for file uploads
const storage = multer.memoryStorage();
export const upload = multer({ storage: storage });

// Helper: create transporter when needed so dotenv has had a chance to run
function createTransporter() {
  const user = process.env.EMAIL;
  const pass = process.env.PASSWORD;

  if (!user || !pass) {
    throw new Error('Email credentials are not set. Make sure EMAIL and PASSWORD exist in your .env');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
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
    // create transporter here so env vars are loaded before use
    const transporter = createTransporter();
    
    // Prepare attachments if files were uploaded
    const attachments = req.files ? req.files.map(file => ({
      filename: file.originalname,
      content: file.buffer
    })) : [];

    // Email options
    const mailOptions = {
      from: process.env.EMAIL,
      to,
      subject,
      text,
      attachments
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
};