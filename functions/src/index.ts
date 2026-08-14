import { onDocumentWritten, onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { defineSecret } from 'firebase-functions/params';
import * as nodemailer from 'nodemailer';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

initializeApp();
const db = getFirestore();

// Secret parameter for Gmail app password
const gmailAppPassword = defineSecret('GMAIL_APP_PASSWORD');

function safePdfText(str: any): string {
  if (!str) return '';
  const s = String(str).replace(/[^\x20-\x7E]/g, ' ').replace(/\s+/g, ' ').trim();
  return s || 'N/A';
}

/**
 * Helper: Generate PDF Enquiry Summary Buffer using pdf-lib
 */
async function generateEnquiryPdfBuffer(orderData: any, orderId: string): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size in points
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const { width, height } = page.getSize();
  let y = height - 40;

  // 1. Header Banner
  page.drawRectangle({
    x: 30,
    y: y - 55,
    width: width - 60,
    height: 65,
    color: rgb(0.08, 0.1, 0.12) // Dark Ink background
  });

  page.drawText('CRACKERS FALLS — SIVAKASI WHOLESALE', {
    x: 45,
    y: y - 22,
    size: 15,
    font: fontBold,
    color: rgb(0.98, 0.8, 0.28) // Gold Accent
  });

  page.drawText('Authentic Sivakasi Direct Wholesale Fireworks', {
    x: 45,
    y: y - 38,
    size: 9,
    font: fontRegular,
    color: rgb(0.9, 0.9, 0.9)
  });

  page.drawText('Contact: +91 9159038240 | support@crackersfalls.in', {
    x: width - 260,
    y: y - 38,
    size: 8,
    font: fontRegular,
    color: rgb(0.8, 0.8, 0.8)
  });

  y -= 75;

  // 2. Clear Disclaimer Notice Box (Mandatory Requirement)
  page.drawRectangle({
    x: 30,
    y: y - 40,
    width: width - 60,
    height: 40,
    color: rgb(0.98, 0.94, 0.85),
    borderColor: rgb(0.95, 0.75, 0.2),
    borderWidth: 1
  });

  page.drawText('IMPORTANT DISCLAIMER NOTICE:', {
    x: 42,
    y: y - 16,
    size: 9,
    font: fontBold,
    color: rgb(0.6, 0.35, 0)
  });

  const disclaimerText = 'This is an enquiry summary, not a confirmed order or invoice. Our team will contact you to confirm availability and finalize payment.';
  page.drawText(disclaimerText, {
    x: 42,
    y: y - 30,
    size: 8,
    font: fontRegular,
    color: rgb(0.2, 0.2, 0.2)
  });

  y -= 55;

  // 3. Customer & Enquiry Info Grid
  const customerName = safePdfText(orderData.customerName || orderData.name || 'Valued Customer');
  const customerPhone = safePdfText(orderData.customerPhone || orderData.phone || 'N/A');
  const customerEmail = safePdfText(orderData.customerEmail || orderData.email || 'N/A');
  const customerAddress = safePdfText(orderData.deliveryAddress || orderData.address || 'N/A');
  const pincode = safePdfText(orderData.pincode || '');
  const enquiryDate = orderData.orderDate || orderData.created_at || new Date().toISOString();

  page.drawRectangle({
    x: 30,
    y: y - 75,
    width: width - 60,
    height: 75,
    color: rgb(0.97, 0.97, 0.98),
    borderColor: rgb(0.88, 0.88, 0.9),
    borderWidth: 1
  });

  page.drawText(`Enquiry Ref #: ENQ-${safePdfText(orderId.slice(-8)).toUpperCase()}`, { x: 42, y: y - 18, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
  page.drawText(`Date: ${safePdfText(new Date(enquiryDate).toLocaleString('en-IN'))}`, { x: width - 240, y: y - 18, size: 9, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });

  page.drawText(`Customer: ${customerName}`, { x: 42, y: y - 36, size: 9, font: fontBold, color: rgb(0.15, 0.15, 0.15) });
  page.drawText(`Phone: ${customerPhone}`, { x: 42, y: y - 50, size: 9, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });
  page.drawText(`Email: ${customerEmail}`, { x: 42, y: y - 64, size: 9, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });

  page.drawText(`Address: ${customerAddress} ${pincode}`.slice(0, 50), { x: width - 240, y: y - 36, size: 9, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });

  y -= 90;

  // 4. Line Items Table Header
  page.drawRectangle({
    x: 30,
    y: y - 22,
    width: width - 60,
    height: 22,
    color: rgb(0.12, 0.14, 0.18)
  });

  page.drawText('#', { x: 40, y: y - 15, size: 9, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText('Product Description', { x: 65, y: y - 15, size: 9, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText('Qty', { x: width - 180, y: y - 15, size: 9, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText('Unit Price', { x: width - 130, y: y - 15, size: 9, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText('Total (Rs)', { x: width - 75, y: y - 15, size: 9, font: fontBold, color: rgb(1, 1, 1) });

  y -= 25;

  // 5. Line Items Rows
  const items: any[] = orderData.items || orderData.lineItems || [];
  let index = 1;

  for (const item of items) {
    if (y < 100) break; // Prevent page overflow

    const rawTitle = item.name || item.productName || item.productId || 'Item';
    const title = safePdfText(rawTitle).slice(0, 35);
    const qty = Number(item.quantity || 1);
    const unitPrice = Number(item.price || item.unitPrice || item.costPrice || 0);
    const total = qty * unitPrice;

    // Alternate row shading
    if (index % 2 === 0) {
      page.drawRectangle({
        x: 30,
        y: y - 18,
        width: width - 60,
        height: 18,
        color: rgb(0.96, 0.96, 0.97)
      });
    }

    page.drawText(`${index}`, { x: 40, y: y - 13, size: 8, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });
    page.drawText(title, { x: 65, y: y - 13, size: 8, font: fontRegular, color: rgb(0.1, 0.1, 0.1) });
    page.drawText(`${qty}`, { x: width - 175, y: y - 13, size: 8, font: fontRegular, color: rgb(0.1, 0.1, 0.1) });
    page.drawText(`Rs.${unitPrice}`, { x: width - 130, y: y - 13, size: 8, font: fontRegular, color: rgb(0.1, 0.1, 0.1) });
    page.drawText(`Rs.${total}`, { x: width - 75, y: y - 13, size: 8, font: fontBold, color: rgb(0.1, 0.1, 0.1) });

    y -= 20;
    index++;
  }

  y -= 15;

  // 6. Summary Totals Box
  const grandTotal = Number(orderData.totalAmount || orderData.grand_total || 0);

  page.drawRectangle({
    x: width - 240,
    y: y - 35,
    width: 210,
    height: 35,
    color: rgb(0.97, 0.97, 0.98),
    borderColor: rgb(0.95, 0.75, 0.2),
    borderWidth: 1.5
  });

  page.drawText('Total Estimated Amount:', { x: width - 230, y: y - 22, size: 10, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
  page.drawText(`Rs. ${grandTotal.toLocaleString('en-IN')}`, { x: width - 105, y: y - 22, size: 12, font: fontBold, color: rgb(0.8, 0.1, 0.1) });

  y -= 60;

  // 7. Footer Guarantee
  page.drawText('Thank you for choosing Crackers Falls Sivakasi!', {
    x: 180,
    y: 35,
    size: 9,
    font: fontBold,
    color: rgb(0.4, 0.4, 0.4)
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Helper: Send Email with PDF Attachment via Nodemailer (Gmail SMTP)
 */
async function sendEnquiryEmailWithPdf(options: {
  toEmail: string;
  subject: string;
  htmlBody: string;
  pdfBuffer: Buffer;
  pdfFilename: string;
  enquiryId: string;
  recipientRole: 'customer' | 'admin';
  smtpPass?: string;
}): Promise<boolean> {
  const adminSenderEmail = 'sanjaysurya3010@gmail.com';
  const rawPass = options.smtpPass || process.env.GMAIL_APP_PASSWORD;
  const cleanPass = (rawPass || '').trim().replace(/\s+/g, '');

  if (!cleanPass) {
    const errorMsg = 'GMAIL_APP_PASSWORD secret or environment variable is missing.';
    console.error(`Email Failure [${options.recipientRole}]:`, errorMsg);
    await db.collection('emailLogs').add({
      enquiryId: options.enquiryId,
      recipient: options.toEmail,
      recipientRole: options.recipientRole,
      status: 'failed',
      error: errorMsg,
      timestamp: new Date().toISOString()
    });
    return false;
  }

  // Deduplication check: check if sent in last 5 minutes
  try {
    const checkSnap = await db.collection('emailLogs')
      .where('enquiryId', '==', options.enquiryId)
      .where('recipientRole', '==', options.recipientRole)
      .where('status', '==', 'sent')
      .get();
    if (!checkSnap.empty) {
      console.log(`Email already sent for enquiry ${options.enquiryId} to ${options.recipientRole}. Skipping duplicate.`);
      return true;
    }
  } catch (e) {}

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // SSL
      auth: {
        user: adminSenderEmail,
        pass: cleanPass
      }
    });

    await transporter.sendMail({
      from: `"Crackers Falls Sivakasi" <${adminSenderEmail}>`,
      to: options.toEmail,
      subject: options.subject,
      html: options.htmlBody,
      attachments: [
        {
          filename: options.pdfFilename,
          content: options.pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });

    console.log(`Email successfully sent to ${options.recipientRole} (${options.toEmail}) for Enquiry ${options.enquiryId}`);
    await db.collection('emailLogs').add({
      enquiryId: options.enquiryId,
      recipient: options.toEmail,
      recipientRole: options.recipientRole,
      status: 'sent',
      timestamp: new Date().toISOString()
    });
    return true;
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    console.error(`Email send failed to ${options.recipientRole} (${options.toEmail}):`, errorMsg);

    await db.collection('emailLogs').add({
      enquiryId: options.enquiryId,
      recipient: options.toEmail,
      recipientRole: options.recipientRole,
      status: 'failed',
      error: errorMsg,
      timestamp: new Date().toISOString()
    });
    return false;
  }
}

/**
 * -------------------------------------------------------------------------------------------------
 * CLOUD FUNCTION: onEnquiryCreated
 * Triggered on creation of any salesOrders document with status: 'enquiry'.
 * Generates PDF Enquiry Summary and emails both Customer and Admin.
 * -------------------------------------------------------------------------------------------------
 */
export const onEnquiryCreated = onDocumentCreated(
  {
    document: 'salesOrders/{orderId}',
    secrets: [gmailAppPassword]
  },
  async (event) => {
    const orderData = event.data?.data();
    const orderId = event.params.orderId;

    if (!orderData) return;

    // Execute only if status is 'enquiry' or channel is 'website'
    const status = (orderData.status || '').toLowerCase();
    const channel = (orderData.channel || '').toLowerCase();

    if (status !== 'enquiry' && channel !== 'website' && status !== 'pending') {
      console.log(`Skipping onEnquiryCreated for order ${orderId} (Status: ${status}, Channel: ${channel})`);
      return;
    }

    console.log(`Processing automated enquiry emails & PDF for Order ${orderId}...`);

    try {
      // 1. Fetch configurable Admin Business Email from Firestore master_settings
      let adminEmail = 'sanjaysurya3010@gmail.com'; // Default requirement
      try {
        const masterSnap = await db.collection('site_content').doc('master_settings').get();
        if (masterSnap.exists) {
          const mData = masterSnap.data();
          if (mData?.admin_notification_email) {
            adminEmail = mData.admin_notification_email.trim();
          }
        }
      } catch (e) {
        console.warn('Could not fetch admin_notification_email from master_settings, using fallback.', e);
      }

      const customerEmail = orderData.customerEmail || orderData.email || '';
      const customerName = orderData.customerName || orderData.name || 'Valued Customer';
      const grandTotal = Number(orderData.totalAmount || orderData.grand_total || 0);

      // 2. Generate Enquiry Summary PDF
      const pdfBuffer = await generateEnquiryPdfBuffer(orderData, orderId);
      const pdfFilename = `CrackersFalls_Enquiry_${orderId.slice(-8).toUpperCase()}.pdf`;
      const pass = gmailAppPassword.value();

      // 3. Email 1: To Customer
      if (customerEmail) {
        const customerHtml = `
          <div style="font-family: Arial, sans-serif; color: #222; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; padding: 24px; background-color: #ffffff;">
            <div style="text-align: center; border-bottom: 2px solid #f59e0b; padding-bottom: 16px; margin-bottom: 20px;">
              <h2 style="color: #111827; margin: 0; font-size: 22px;">Crackers Falls — பட்டாசு அருவி</h2>
              <p style="color: #f59e0b; font-weight: bold; margin: 4px 0 0 0; font-size: 13px;">Sivakasi Direct Wholesale Fireworks</p>
            </div>

            <p style="font-size: 15px; color: #111;">Dear <strong>${customerName}</strong>,</p>

            <p style="font-size: 14px; line-height: 1.6; color: #374151;">
              Thank you for submitting your wholesale enquiry with <strong>Crackers Falls</strong>! We have received your product selection (Ref #: <strong>#ENQ-${orderId.slice(-8).toUpperCase()}</strong>) with an estimated value of <strong>Rs. ${grandTotal.toLocaleString('en-IN')}</strong>.
            </p>

            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 20px 0; border-radius: 6px;">
              <p style="margin: 0; font-size: 13px; color: #92400e; font-weight: bold;">
                📌 Important Notice:
              </p>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #78350f;">
                This is an enquiry summary, not a confirmed order or invoice. Our sales team will contact you shortly to confirm product stock availability and finalize transport delivery.
              </p>
            </div>

            <p style="font-size: 14px; color: #374151;">
              Please find your itemized <strong>Enquiry Summary PDF</strong> attached to this email for your reference.
            </p>

            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center;">
              <p style="margin: 0;">Sivakasi Wholesale Helpline: <strong>+91 9159038240</strong></p>
              <p style="margin: 4px 0 0 0;">Website: <a href="https://crackersfalls-2026.web.app" style="color: #d97706;">crackersfalls-2026.web.app</a></p>
            </div>
          </div>
        `;

        await sendEnquiryEmailWithPdf({
          toEmail: customerEmail,
          subject: `We've received your enquiry — Crackers Falls`,
          htmlBody: customerHtml,
          pdfBuffer,
          pdfFilename,
          enquiryId: orderId,
          recipientRole: 'customer',
          smtpPass: pass
        });
      } else {
        console.warn(`No customer email provided for enquiry ${orderId}. Skipping customer email notification.`);
      }

      // 4. Email 2: To Admin (sanjaysurya3010@gmail.com)
      const adminHtml = `
        <div style="font-family: Arial, sans-serif; color: #222; max-width: 600px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 12px; padding: 24px; background-color: #f8fafc;">
          <div style="border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 16px;">
            <h3 style="color: #0f172a; margin: 0;">🔔 New Website Wholesale Enquiry Received!</h3>
            <p style="color: #0284c7; font-size: 12px; margin: 4px 0 0 0;">Crackers Falls Storefront Notification</p>
          </div>

          <table style="width: 100%; font-size: 13px; border-collapse: collapse; margin-bottom: 16px;">
            <tr><td style="padding: 6px 0; color: #64748b;">Customer Name:</td><td style="font-weight: bold; color: #0f172a;">${customerName}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Phone Number:</td><td style="font-weight: bold; color: #0284c7;">${orderData.customerPhone || orderData.phone || 'N/A'}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Customer Email:</td><td>${customerEmail || 'N/A'}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Delivery Address:</td><td>${orderData.deliveryAddress || orderData.address || 'N/A'}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Estimated Total:</td><td style="font-weight: bold; color: #dc2626; font-size: 15px;">Rs. ${grandTotal.toLocaleString('en-IN')}</td></tr>
          </table>

          <p style="font-size: 12px; color: #475569;">
            The complete enquiry breakdown PDF is attached. Log in to the Admin Portal to review, confirm, or dispatch this enquiry.
          </p>
        </div>
      `;

      await sendEnquiryEmailWithPdf({
        toEmail: adminEmail,
        subject: `New Enquiry Received — ${customerName}`,
        htmlBody: adminHtml,
        pdfBuffer,
        pdfFilename,
        enquiryId: orderId,
        recipientRole: 'admin',
        smtpPass: pass
      });

    } catch (err) {
      console.error(`Error in onEnquiryCreated Cloud Function for order ${orderId}:`, err);
    }
  }
);

/**
 * Triggered on creation of document in enquiries collection
 */
export const onDirectEnquiryCreated = onDocumentCreated(
  {
    document: 'enquiries/{enquiryId}',
    secrets: [gmailAppPassword]
  },
  async (event) => {
    const enquiryData = event.data?.data();
    const enquiryId = event.params.enquiryId;

    if (!enquiryData) return;
    console.log(`Processing onDirectEnquiryCreated for Enquiry ${enquiryId}...`);

    try {
      let adminEmail = 'sanjaysurya3010@gmail.com';
      try {
        const masterSnap = await db.collection('site_content').doc('master_settings').get();
        if (masterSnap.exists) {
          const mData = masterSnap.data();
          if (mData?.admin_notification_email) {
            adminEmail = mData.admin_notification_email.trim();
          }
        }
      } catch (e) {}

      const customerEmail = enquiryData.customerEmail || enquiryData.email || '';
      const customerName = enquiryData.customerName || enquiryData.name || 'Valued Customer';
      const grandTotal = Number(enquiryData.totalAmount || enquiryData.grand_total || 0);

      const pdfBuffer = await generateEnquiryPdfBuffer(enquiryData, enquiryId);
      const pdfFilename = `CrackersFalls_Enquiry_${enquiryId.slice(-8).toUpperCase()}.pdf`;
      const pass = gmailAppPassword.value();

      if (customerEmail) {
        const customerHtml = `
          <div style="font-family: Arial, sans-serif; color: #222; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; padding: 24px; background-color: #ffffff;">
            <div style="text-align: center; border-bottom: 2px solid #f59e0b; padding-bottom: 16px; margin-bottom: 20px;">
              <h2 style="color: #111827; margin: 0; font-size: 22px;">Crackers Falls — பட்டாசு அருவி</h2>
              <p style="color: #f59e0b; font-weight: bold; margin: 4px 0 0 0; font-size: 13px;">Sivakasi Direct Wholesale Fireworks</p>
            </div>
            <p style="font-size: 15px; color: #111;">Dear <strong>${customerName}</strong>,</p>
            <p style="font-size: 14px; line-height: 1.6; color: #374151;">
              Thank you for submitting your wholesale enquiry with <strong>Crackers Falls</strong>! We have received your product selection (Ref #: <strong>#ENQ-${enquiryId.slice(-8).toUpperCase()}</strong>) with an estimated value of <strong>Rs. ${grandTotal.toLocaleString('en-IN')}</strong>.
            </p>
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 20px 0; border-radius: 6px;">
              <p style="margin: 0; font-size: 13px; color: #92400e; font-weight: bold;">📌 Important Notice:</p>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #78350f;">This is an enquiry summary, not a confirmed order or invoice. Our sales team will contact you shortly to confirm product stock availability and finalize transport delivery.</p>
            </div>
            <p style="font-size: 14px; color: #374151;">Please find your itemized <strong>Enquiry Summary PDF</strong> attached to this email for your reference.</p>
            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center;">
              <p style="margin: 0;">Sivakasi Wholesale Helpline: <strong>+91 9159038240</strong></p>
              <p style="margin: 4px 0 0 0;">Website: <a href="https://crackersfalls-2026.web.app" style="color: #d97706;">crackersfalls-2026.web.app</a></p>
            </div>
          </div>
        `;

        await sendEnquiryEmailWithPdf({
          toEmail: customerEmail,
          subject: `We've received your enquiry — Crackers Falls`,
          htmlBody: customerHtml,
          pdfBuffer,
          pdfFilename,
          enquiryId,
          recipientRole: 'customer',
          smtpPass: pass
        });
      }

      const adminHtml = `
        <div style="font-family: Arial, sans-serif; color: #222; max-width: 600px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 12px; padding: 24px; background-color: #f8fafc;">
          <div style="border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 16px;">
            <h3 style="color: #0f172a; margin: 0;">🔔 New Website Wholesale Enquiry Received!</h3>
            <p style="color: #0284c7; font-size: 12px; margin: 4px 0 0 0;">Crackers Falls Storefront Notification</p>
          </div>
          <table style="width: 100%; font-size: 13px; border-collapse: collapse; margin-bottom: 16px;">
            <tr><td style="padding: 6px 0; color: #64748b;">Customer Name:</td><td style="font-weight: bold; color: #0f172a;">${customerName}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Phone Number:</td><td style="font-weight: bold; color: #0284c7;">${enquiryData.customerPhone || enquiryData.phone || 'N/A'}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Customer Email:</td><td>${customerEmail || 'N/A'}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Delivery Address:</td><td>${enquiryData.deliveryAddress || enquiryData.address || 'N/A'}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Estimated Total:</td><td style="font-weight: bold; color: #dc2626; font-size: 15px;">Rs. ${grandTotal.toLocaleString('en-IN')}</td></tr>
          </table>
          <p style="font-size: 12px; color: #475569;">The complete enquiry breakdown PDF is attached.</p>
        </div>
      `;

      await sendEnquiryEmailWithPdf({
        toEmail: adminEmail,
        subject: `New Enquiry Received — ${customerName}`,
        htmlBody: adminHtml,
        pdfBuffer,
        pdfFilename,
        enquiryId,
        recipientRole: 'admin',
        smtpPass: pass
      });
    } catch (err) {
      console.error(`Error in onDirectEnquiryCreated Cloud Function for enquiry ${enquiryId}:`, err);
    }
  }
);

/**
 * -------------------------------------------------------------------------------------------------
 * HTTPS CALLABLE / REQUEST FUNCTION: resendEnquiryEmail
 * Allows admin to manually trigger/resend the confirmation email & PDF from the Admin Panel.
 * -------------------------------------------------------------------------------------------------
 */
export const resendEnquiryEmail = onRequest(
  {
    secrets: [gmailAppPassword],
    cors: true
  },
  async (req, res) => {
    const orderId = req.query.orderId as string || req.body.orderId;

    if (!orderId) {
      res.status(400).json({ success: false, error: 'Missing orderId parameter.' });
      return;
    }

    try {
      const docSnap = await db.collection('salesOrders').doc(orderId).get();
      if (!docSnap.exists) {
        res.status(404).json({ success: false, error: `Order #${orderId} not found.` });
        return;
      }

      const orderData = docSnap.data();
      const pdfBuffer = await generateEnquiryPdfBuffer(orderData, orderId);
      const pdfFilename = `CrackersFalls_Enquiry_${orderId.slice(-8).toUpperCase()}.pdf`;
      const pass = gmailAppPassword.value();

      const customerEmail = orderData?.customerEmail || orderData?.email || '';
      const customerName = orderData?.customerName || orderData?.name || 'Customer';

      if (!customerEmail) {
        res.status(400).json({ success: false, error: 'Customer email address is empty.' });
        return;
      }

      const success = await sendEnquiryEmailWithPdf({
        toEmail: customerEmail,
        subject: `We've received your enquiry — Crackers Falls`,
        htmlBody: `<p>Dear ${customerName},</p><p>Please find your requested Enquiry Summary PDF attached below.</p>`,
        pdfBuffer,
        pdfFilename,
        enquiryId: orderId,
        recipientRole: 'customer',
        smtpPass: pass
      });

      res.status(200).json({ success, message: success ? 'Confirmation email resent successfully.' : 'Email delivery failed. Check logs.' });
    } catch (err: any) {
      console.error('resendEnquiryEmail Error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

/**
 * Cloud Function: onStockLedgerWrite & checkLowStock
 */
export const onStockLedgerWrite = onDocumentWritten('stockLedger/{ledgerId}', async (event) => {
  const afterData = event.data?.after.data();
  const beforeData = event.data?.before.data();
  const productId = afterData?.productId || beforeData?.productId;

  if (!productId) return;

  try {
    const ledgerSnapshot = await db
      .collection('stockLedger')
      .where('productId', '==', productId)
      .get();

    let totalStock = 0;
    ledgerSnapshot.forEach((docSnap) => {
      totalStock += Number(docSnap.data().quantity) || 0;
    });

    const productRef = db.collection('products').doc(productId);
    const productSnap = await productRef.get();
    const threshold = Number(productSnap.data()?.reorderThreshold) || 10;

    await productRef.set(
      { currentStock: totalStock, in_stock: totalStock > 0, updatedAt: new Date().toISOString() },
      { merge: true }
    );

    const alertsQuery = await db
      .collection('alerts')
      .where('productId', '==', productId)
      .where('resolved', '==', false)
      .get();

    if (totalStock <= threshold) {
      if (alertsQuery.empty) {
        const newAlertRef = db.collection('alerts').doc();
        await newAlertRef.set({
          id: newAlertRef.id,
          type: 'low-stock',
          productId,
          currentStock: totalStock,
          threshold,
          resolved: false,
          createdAt: new Date().toISOString()
        });
      } else {
        alertsQuery.forEach(async (docSnap) => {
          await docSnap.ref.update({ currentStock: totalStock, threshold });
        });
      }
    } else {
      if (!alertsQuery.empty) {
        alertsQuery.forEach(async (docSnap) => {
          await docSnap.ref.update({ resolved: true, resolvedAt: new Date().toISOString() });
        });
      }
    }
  } catch (error) {
    console.error(`Error recalculating stock for product ${productId}:`, error);
  }
});
