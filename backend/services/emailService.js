const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendContactEmail(contactData) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Send to yourself
        subject: `New Contact Form Submission from ${contactData.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
              New Contact Form Submission
            </h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #495057; margin-top: 0;">Contact Details:</h3>
              <p><strong>Name:</strong> ${contactData.name}</p>
              <p><strong>Email:</strong> ${contactData.email}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div style="background-color: #ffffff; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px;">
              <h3 style="color: #495057; margin-top: 0;">Message:</h3>
              <p style="line-height: 1.6; color: #333;">${contactData.message}</p>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background-color: #e9ecef; border-radius: 8px;">
              <p style="margin: 0; color: #6c757d; font-size: 14px;">
                This message was sent from your portfolio contact form.
              </p>
            </div>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendAutoReply(contactData) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: contactData.email,
        subject: 'Thank you for contacting me!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Thank you for reaching out!</h2>
            
            <p>Hi ${contactData.name},</p>
            
            <p>Thank you for contacting me through my portfolio. I've received your message and will get back to you as soon as possible.</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #495057; margin-top: 0;">Your Message:</h3>
              <p style="line-height: 1.6; color: #333;">${contactData.message}</p>
            </div>
            
            <p>Best regards,<br>Yaten Arora</p>
            
            <div style="margin-top: 30px; padding: 15px; background-color: #e9ecef; border-radius: 8px;">
              <p style="margin: 0; color: #6c757d; font-size: 14px;">
                This is an automated response. Please do not reply to this email.
              </p>
            </div>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Auto-reply sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending auto-reply:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
