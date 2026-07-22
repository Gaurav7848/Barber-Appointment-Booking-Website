import nodemailer from 'nodemailer';
import twilio from 'twilio';
import Notification from '../models/notification.model.js';

let emailTransporter = null;
let twilioClient = null;

if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  emailTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
}

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

export const sendEmail = async ({ to, subject, text, html }) => {
  if (!emailTransporter) {
    console.log('Simulated email to:', to, 'subject:', subject);
    return true;
  }
  try {
    await emailTransporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text, html });
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};

export const sendSMS = async ({ to, body }) => {
  if (!twilioClient) {
    console.log('Simulated SMS to:', to, 'body:', body);
    return true;
  }
  try {
    await twilioClient.messages.create({ body, from: process.env.TWILIO_PHONE_NUMBER, to });
    return true;
  } catch (error) {
    console.error('SMS send error:', error);
    return false;
  }
};

export const createNotification = async ({ userId, organizationId, title, message, type = 'system', data = {} }) => {
  try {
    const notification = await Notification.create({ userId, organizationId, title, message, type, data });
    return notification;
  } catch (error) {
    console.error('Notification creation error:', error);
    return null;
  }
};