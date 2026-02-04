const nodemailer = require('nodemailer');

class EmailUtil {
  constructor() {
    // Create transporter with your email service
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // Send OTP email
  async sendOTP(email, otp, username) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Cinema Booking OTP Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .warning { color: #e74c3c; font-weight: bold; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎬 Cinema Seat Reservation</h1>
              <p>Two-Factor Authentication</p>
            </div>
            <div class="content">
              <h2>Hello ${username}!</h2>
              <p>You are attempting to log in to your Cinema Booking account. Please use the following OTP code to complete your authentication:</p>
              
              <div class="otp-box">
                <p style="margin: 0; color: #666;">Your OTP Code:</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">Valid for 5 minutes</p>
              </div>
              
              <p><strong>Security Tips:</strong></p>
              <ul>
                <li>Never share this code with anyone</li>
                <li>Our team will never ask for your OTP</li>
                <li>This code expires in 5 minutes</li>
              </ul>
              
              <p class="warning">⚠️ If you didn't request this code, please ignore this email and secure your account immediately.</p>
            </div>
            <div class="footer">
              <p>This is an automated message from Cinema Seat Reservation System</p>
              <p>&copy; ${new Date().getFullYear()} Cinema Booking. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`OTP sent successfully to ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending OTP email:', error);
      throw new Error('Failed to send OTP email');
    }
  }

  // Send booking confirmation email
  async sendBookingConfirmation(email, bookingDetails) {
    const { bookingId, movieTitle, showtime, seats, totalAmount, username } = bookingDetails;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Booking Confirmation - ${bookingId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; color: #666; }
            .detail-value { color: #333; }
            .total { font-size: 20px; color: #667eea; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Booking Confirmed!</h1>
              <p>Your seats are reserved</p>
            </div>
            <div class="content">
              <h2>Hello ${username}!</h2>
              <p>Thank you for booking with us. Your reservation has been confirmed.</p>
              
              <div class="booking-details">
                <h3 style="margin-top: 0; color: #667eea;">Booking Details</h3>
                <div class="detail-row">
                  <span class="detail-label">Booking ID:</span>
                  <span class="detail-value">${bookingId}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Movie:</span>
                  <span class="detail-value">${movieTitle}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date & Time:</span>
                  <span class="detail-value">${new Date(showtime.date).toLocaleDateString()} at ${showtime.time}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Seats:</span>
                  <span class="detail-value">${seats.map(s => s.row + s.seatNumber).join(', ')}</span>
                </div>
                <div class="detail-row" style="border-bottom: none; margin-top: 10px;">
                  <span class="detail-label total">Total Amount:</span>
                  <span class="detail-value total">₹${totalAmount}</span>
                </div>
              </div>
              
              <p><strong>Important:</strong></p>
              <ul>
                <li>Please arrive 15 minutes before showtime</li>
                <li>Carry a valid ID proof</li>
                <li>Show this email or booking ID at the counter</li>
              </ul>
              
              <p>Enjoy your movie! 🍿🎬</p>
            </div>
            <div class="footer">
              <p>This is an automated confirmation from Cinema Seat Reservation System</p>
              <p>&copy; ${new Date().getFullYear()} Cinema Booking. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Booking confirmation sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending booking confirmation:', error);
      throw new Error('Failed to send confirmation email');
    }
  }
}

module.exports = new EmailUtil();