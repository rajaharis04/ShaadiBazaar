// ============================================================
// EMAIL SERVICE — Send Admin Notifications for Orders & Bookings
// ============================================================

const nodemailer = require('nodemailer');

// Admin Email configuration
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'megamart316@gmail.com';

// Create Nodemailer Transporter using Gmail SMTP settings
function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS  // Gmail App Password
    }
  });
}

/**
 * Send an HTML email notification to the Admin when a new order is placed
 */
async function sendAdminOrderEmail(order, user, items) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('\n📧 [DEV MODE - SMTP Not Configured] Admin Order Notification:');
    console.log('Order ID:', order.id);
    console.log('Customer:', user.name, `(${user.email})`);
    console.log('Items:', items);
    console.log('Total Amount:', order.total_amount);
    return true;
  }

  try {
    const transporter = createTransporter();
    
    const itemsHTML = items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Rs. ${parseFloat(item.price).toLocaleString()}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Rs. ${(item.quantity * item.price).toLocaleString()}</td>
      </tr>
    `).join('');

    const mailOptions = {
      from: `"Shaadi Bazaar Alerts" <${process.env.EMAIL_USER}>`,
      to: ADMIN_EMAIL,
      subject: `🚨 NEW ORDER PLACED — #${order.id.slice(0, 8).toUpperCase()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Poppins', Arial, sans-serif; background-color: #FFF8F0; margin: 0; padding: 20px; color: #1A0A00; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #EDE0D4; box-shadow: 0 4px 15px rgba(139,0,0,0.05); }
            .header { background: linear-gradient(135deg, #8B0000, #5C0000); padding: 25px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0; font-size: 22px; font-family: Georgia, serif; }
            .body { padding: 30px; }
            .section-title { font-size: 16px; font-weight: 700; color: #8B0000; border-bottom: 2px solid #EDE0D4; padding-bottom: 8px; margin-bottom: 15px; text-transform: uppercase; }
            .details-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .details-table td { padding: 8px 0; font-size: 14px; }
            .details-table td.label { font-weight: bold; color: #5D4E42; width: 140px; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th { background-color: #F9F3EC; padding: 10px; font-size: 13px; text-align: left; border-bottom: 2px solid #EDE0D4; }
            .total-row td { font-weight: bold; font-size: 16px; color: #8B0000; border-top: 2px solid #EDE0D4; padding-top: 15px; }
            .footer { color: #5D4E42; font-size: 11px; text-align: center; padding: 20px; background-color: #F9F3EC; border-top: 1px solid #EDE0D4; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💍 New Order Received</h1>
            </div>
            <div class="body">
              <div class="section-title">Order Summary</div>
              <table class="details-table">
                <tr><td class="label">Order ID:</td><td>#${order.id.toUpperCase()}</td></tr>
                <tr><td class="label">Order Date:</td><td>${new Date().toLocaleString('en-PK')}</td></tr>
                <tr><td class="label">Payment Method:</td><td style="text-transform: uppercase;">${order.payment_method}</td></tr>
                <tr><td class="label">Status:</td><td style="text-transform: capitalize; color: #D4AF37; font-weight: bold;">${order.status}</td></tr>
              </table>

              <div class="section-title">Customer Details</div>
              <table class="details-table">
                <tr><td class="label">Name:</td><td>${user.name || 'N/A'}</td></tr>
                <tr><td class="label">Email:</td><td>${user.email || 'N/A'}</td></tr>
                <tr><td class="label">Phone:</td><td>${user.phone || 'N/A'}</td></tr>
                <tr><td class="label">Shipping Address:</td><td>${order.address}, ${order.city}</td></tr>
              </table>

              <div class="section-title">Items Ordered</div>
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style="text-align: center;">Qty</th>
                    <th style="text-align: right;">Unit Price</th>
                    <th style="text-align: right;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                  <tr class="total-row">
                    <td colspan="3" style="text-align: right; padding-top: 15px;">Grand Total:</td>
                    <td style="text-align: right; padding-top: 15px;">Rs. ${parseFloat(order.total_amount).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="footer">
              💍 Shaadi Bazaar Backend Notification Agent
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Order notification email sent to admin for Order #${order.id}`);
    return true;
  } catch (err) {
    console.error('❌ Failed to send order notification email to admin:', err.message);
    return false;
  }
}

/**
 * Send an HTML email notification to the Admin when a new service is booked
 */
async function sendAdminBookingEmail(booking, user) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('\n📧 [DEV MODE - SMTP Not Configured] Admin Booking Notification:');
    console.log('Booking ID:', booking.id);
    console.log('Customer:', user.name, `(${user.email})`);
    console.log('Service:', booking.services?.title);
    console.log('Date/Slot:', booking.event_date, '/', booking.time_slot);
    console.log('Total Price:', booking.total_price);
    console.log('Notes/Address:', booking.notes);
    return true;
  }

  try {
    const transporter = createTransporter();
    
    // Notes formatted for HTML (replace newlines with breaks)
    const formattedNotes = (booking.notes || '—').replace(/\n/g, '<br>');

    const mailOptions = {
      from: `"Shaadi Bazaar Alerts" <${process.env.EMAIL_USER}>`,
      to: ADMIN_EMAIL,
      subject: `🚨 NEW BOOKING CONFIRMED — #${booking.id.slice(0, 8).toUpperCase()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Poppins', Arial, sans-serif; background-color: #FFF8F0; margin: 0; padding: 20px; color: #1A0A00; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #EDE0D4; box-shadow: 0 4px 15px rgba(139,0,0,0.05); }
            .header { background: linear-gradient(135deg, #8B0000, #5C0000); padding: 25px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0; font-size: 22px; font-family: Georgia, serif; }
            .body { padding: 30px; }
            .section-title { font-size: 16px; font-weight: 700; color: #8B0000; border-bottom: 2px solid #EDE0D4; padding-bottom: 8px; margin-bottom: 15px; text-transform: uppercase; }
            .details-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .details-table td { padding: 8px 0; font-size: 14px; }
            .details-table td.label { font-weight: bold; color: #5D4E42; width: 140px; }
            .notes-box { background-color: #F9F3EC; border: 1px dashed #D4C4B5; border-radius: 8px; padding: 15px; font-size: 13px; color: #5D4E42; line-height: 1.5; margin-top: 10px; }
            .footer { color: #5D4E42; font-size: 11px; text-align: center; padding: 20px; background-color: #F9F3EC; border-top: 1px solid #EDE0D4; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💍 New Booking Confirmed</h1>
            </div>
            <div class="body">
              <div class="section-title">Booking Information</div>
              <table class="details-table">
                <tr><td class="label">Booking ID:</td><td>#${booking.id.toUpperCase()}</td></tr>
                <tr><td class="label">Service Name:</td><td style="color: #8B0000; font-weight: 600;">${booking.services?.title || 'N/A'}</td></tr>
                <tr><td class="label">Provider:</td><td>${booking.services?.provider_name || 'N/A'}</td></tr>
                <tr><td class="label">Category:</td><td style="text-transform: capitalize;">${booking.services?.category || 'N/A'}</td></tr>
                <tr><td class="label">Service City:</td><td>${booking.services?.city || 'N/A'}</td></tr>
              </table>

              <div class="section-title">Event Schedule & Price</div>
              <table class="details-table">
                <tr><td class="label">Event Date:</td><td><strong>${booking.event_date}</strong></td></tr>
                <tr><td class="label">Time Slot:</td><td style="text-transform: capitalize;"><strong>${booking.time_slot}</strong></td></tr>
                <tr><td class="label">Booking Price:</td><td style="font-size: 16px; color: #8B0000; font-weight: bold;">Rs. ${parseFloat(booking.total_price).toLocaleString()}</td></tr>
                <tr><td class="label">Status:</td><td style="text-transform: capitalize; color: #D4AF37; font-weight: bold;">${booking.status}</td></tr>
              </table>

              <div class="section-title">Customer Contact & Address Notes</div>
              <div class="notes-box">
                ${formattedNotes}
              </div>
            </div>
            <div class="footer">
              💍 Shaadi Bazaar Backend Notification Agent
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Booking notification email sent to admin for Booking #${booking.id}`);
    return true;
  } catch (err) {
    console.error('❌ Failed to send booking notification email to admin:', err.message);
    return false;
  }
}

/**
 * Send an HTML email confirmation to the User when their order is placed
 */
async function sendUserOrderConfirmationEmail(order, user, items) {
  if (!user.email) return false;
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`\n📧 [DEV MODE] User Order Confirmation sent to ${user.email}`);
    return true;
  }

  try {
    const transporter = createTransporter();
    
    const itemsHTML = items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Rs. ${parseFloat(item.price).toLocaleString()}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Rs. ${(item.quantity * item.price).toLocaleString()}</td>
      </tr>
    `).join('');

    const mailOptions = {
      from: `"Shaadi Bazaar" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `💍 Order Confirmed — #${order.id.slice(0, 8).toUpperCase()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Poppins', Arial, sans-serif; background-color: #FFF8F0; margin: 0; padding: 20px; color: #1A0A00; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #EDE0D4; }
            .header { background: linear-gradient(135deg, #8B0000, #5C0000); padding: 25px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0; font-size: 22px; font-family: Georgia, serif; }
            .body { padding: 30px; }
            .section-title { font-size: 16px; font-weight: 700; color: #8B0000; border-bottom: 2px solid #EDE0D4; padding-bottom: 8px; margin-bottom: 15px; text-transform: uppercase; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th { background-color: #F9F3EC; padding: 10px; font-size: 13px; text-align: left; border-bottom: 2px solid #EDE0D4; }
            .total-row td { font-weight: bold; font-size: 16px; color: #8B0000; border-top: 2px solid #EDE0D4; padding-top: 15px; }
            .footer { color: #5D4E42; font-size: 11px; text-align: center; padding: 20px; background-color: #F9F3EC; border-top: 1px solid #EDE0D4; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💍 Order Confirmed!</h1>
            </div>
            <div class="body">
              <p>Dear <strong>${user.name || 'Customer'}</strong>,</p>
              <p>Aapka order Shaadi Bazaar par kamyabi se place ho gaya hai. Hum jald hi aap se contact karenge.</p>
              
              <div class="section-title" style="margin-top:20px;">Order Details</div>
              <p><strong>Order ID:</strong> #${order.id.toUpperCase()}</p>
              <p><strong>Payment Method:</strong> Cash on Delivery (COD)</p>
              <p><strong>Delivery Address:</strong> ${order.address}, ${order.city}</p>

              <div class="section-title">Items Ordered</div>
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style="text-align: center;">Qty</th>
                    <th style="text-align: right;">Unit Price</th>
                    <th style="text-align: right;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                  <tr class="total-row">
                    <td colspan="3" style="text-align: right; padding-top: 15px;">Total Amount:</td>
                    <td style="text-align: right; padding-top: 15px;">Rs. ${parseFloat(order.total_amount).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
              <p style="font-size:0.9rem; color:var(--muted); margin-top:20px;">* Cash on Delivery orders are paid when you receive the package.</p>
            </div>
            <div class="footer">
              Thank you for shopping at Shaadi Bazaar! <br>&copy; 2024 Shaadi Bazaar
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Order confirmation email sent to user: ${user.email}`);
    return true;
  } catch (err) {
    console.error('❌ Failed to send order confirmation email to user:', err.message);
    return false;
  }
}

/**
 * Send an HTML email to the User when the Admin updates their order status
 */
async function sendUserOrderStatusUpdateEmail(order, user) {
  if (!user.email) return false;
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`\n📧 [DEV MODE] User Order Status Update sent to ${user.email}`);
    return true;
  }

  try {
    const transporter = createTransporter();

    // Custom text based on status
    let statusText = '';
    let statusColor = '#D4AF37'; // gold
    if (order.status === 'confirmed') {
      statusText = 'Aapka order confirm ho gaya hai aur processing mein hai! 🎉';
      statusColor = '#2D6A4F'; // green
    } else if (order.status === 'delivered') {
      statusText = 'Congratulations! Aapka order deliver ho gaya hai. 🚚';
      statusColor = '#1A5276'; // blue
    } else if (order.status === 'cancelled') {
      statusText = 'Aapka order cancel kar diya gaya hai.';
      statusColor = '#C0392B'; // red
    } else {
      statusText = `Aapke order ka status ab "${order.status}" ho gaya hai.`;
    }

    const mailOptions = {
      from: `"Shaadi Bazaar" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `🔔 Order Status Update — #${order.id.slice(0, 8).toUpperCase()} is ${order.status.toUpperCase()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Poppins', Arial, sans-serif; background-color: #FFF8F0; margin: 0; padding: 20px; color: #1A0A00; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #EDE0D4; }
            .header { background: linear-gradient(135deg, #8B0000, #5C0000); padding: 25px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0; font-size: 22px; font-family: Georgia, serif; }
            .body { padding: 30px; }
            .status-box { background-color: #F9F3EC; border: 1px solid #EDE0D4; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
            .status-val { font-size: 20px; font-weight: bold; color: ${statusColor}; text-transform: uppercase; }
            .footer { color: #5D4E42; font-size: 11px; text-align: center; padding: 20px; background-color: #F9F3EC; border-top: 1px solid #EDE0D4; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 Order Status Update</h1>
            </div>
            <div class="body">
              <p>Dear <strong>${user.name || 'Customer'}</strong>,</p>
              <p>Aapke order <strong>#${order.id.toUpperCase()}</strong> ka status update ho gaya hai:</p>
              
              <div class="status-box">
                <div style="font-size:12px; color:#5D4E42; margin-bottom:5px; text-transform:uppercase;">New Status</div>
                <div class="status-val">${order.status}</div>
                <p style="margin-top:10px; font-size:14px; color:#5D4E42;">${statusText}</p>
              </div>

              <p>Agar aapka koi sawal hai to humare support number par contact karein.</p>
            </div>
            <div class="footer">
              &copy; 2024 Shaadi Bazaar — Pakistan's Premier Wedding Marketplace
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Order status update email sent to user: ${user.email}`);
    return true;
  } catch (err) {
    console.error('❌ Failed to send order status update email to user:', err.message);
    return false;
  }
}

/**
 * Send an HTML email to the User when the Admin updates their booking status
 */
async function sendUserBookingStatusUpdateEmail(booking, user) {
  if (!user.email) return false;
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`\n📧 [DEV MODE] User Booking Status Update sent to ${user.email}`);
    return true;
  }

  try {
    const transporter = createTransporter();

    // Custom status text
    let statusText = '';
    let statusColor = '#D4AF37'; // gold
    if (booking.status === 'confirmed') {
      statusText = 'Aapki booking confirm ho gayi hai! Hamari team aap se jald hi contact karegi. 💍';
      statusColor = '#2D6A4F'; // green
    } else if (booking.status === 'cancelled') {
      statusText = 'Aapki booking cancel kar di gayi hai.';
      statusColor = '#C0392B'; // red
    } else {
      statusText = `Aapki booking ka status ab "${booking.status}" ho gaya hai.`;
    }

    const mailOptions = {
      from: `"Shaadi Bazaar" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `🔔 Booking Status Update — #${booking.id.slice(0, 8).toUpperCase()} is ${booking.status.toUpperCase()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Poppins', Arial, sans-serif; background-color: #FFF8F0; margin: 0; padding: 20px; color: #1A0A00; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #EDE0D4; }
            .header { background: linear-gradient(135deg, #8B0000, #5C0000); padding: 25px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0; font-size: 22px; font-family: Georgia, serif; }
            .body { padding: 30px; }
            .status-box { background-color: #F9F3EC; border: 1px solid #EDE0D4; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
            .status-val { font-size: 20px; font-weight: bold; color: ${statusColor}; text-transform: uppercase; }
            .footer { color: #5D4E42; font-size: 11px; text-align: center; padding: 20px; background-color: #F9F3EC; border-top: 1px solid #EDE0D4; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 Booking Status Update</h1>
            </div>
            <div class="body">
              <p>Dear <strong>${user.name || 'Customer'}</strong>,</p>
              <p>Aapki service booking <strong>#${booking.id.toUpperCase()}</strong> ka status update ho gaya hai:</p>
              
              <div class="status-box">
                <div style="font-size:12px; color:#5D4E42; margin-bottom:5px; text-transform:uppercase;">Service Booked</div>
                <div style="font-size:16px; font-weight:bold; color:#8B0000; margin-bottom:15px;">${booking.services?.title || 'Wedding Service'}</div>
                <div style="font-size:12px; color:#5D4E42; margin-bottom:5px; text-transform:uppercase;">New Status</div>
                <div class="status-val">${booking.status}</div>
                <p style="margin-top:10px; font-size:14px; color:#5D4E42;">${statusText}</p>
              </div>

              <p><strong>Event Date:</strong> ${booking.event_date}</p>
              <p><strong>Time Slot:</strong> ${booking.time_slot}</p>

              <p style="margin-top:20px;">Agar aapka koi sawal hai to humare support number par contact karein.</p>
            </div>
            <div class="footer">
              &copy; 2024 Shaadi Bazaar — Pakistan's Premier Wedding Marketplace
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Booking status update email sent to user: ${user.email}`);
    return true;
  } catch (err) {
    console.error('❌ Failed to send booking status update email to user:', err.message);
    return false;
  }
}

module.exports = {
  sendAdminOrderEmail,
  sendAdminBookingEmail,
  sendUserOrderConfirmationEmail,
  sendUserOrderStatusUpdateEmail,
  sendUserBookingStatusUpdateEmail
};
