const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendConfirmation(appointment) {
  const businessName = process.env.BUSINESS_NAME || 'Our Business';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
        ${businessName}
      </h1>
      <h2 style="color: #1e293b;">Appointment Confirmed!</h2>
      <p>Hi <strong>${appointment.name}</strong>,</p>
      <p>Your appointment has been confirmed and payment received. Here are your details:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background: #f1f5f9;">
          <td style="padding: 12px; font-weight: bold;">Service</td>
          <td style="padding: 12px;">${appointment.service}</td>
        </tr>
        <tr>
          <td style="padding: 12px; font-weight: bold;">Date</td>
          <td style="padding: 12px;">${appointment.date}</td>
        </tr>
        <tr style="background: #f1f5f9;">
          <td style="padding: 12px; font-weight: bold;">Time</td>
          <td style="padding: 12px;">${appointment.timeSlot}</td>
        </tr>
      </table>
      <p style="color: #64748b; font-size: 14px;">
        If you need to reschedule, please contact us directly.
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
      <p style="color: #94a3b8; font-size: 12px; text-align: center;">
        &copy; ${new Date().getFullYear()} ${businessName}. All rights reserved.
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: appointment.email,
      subject: `Appointment Confirmed - ${businessName}`,
      html,
    });
    console.log(`Confirmation email sent to ${appointment.email}`);
  } catch (err) {
    console.error('Failed to send confirmation email:', err.message);
  }
}

module.exports = { sendConfirmation };
