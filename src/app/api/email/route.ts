import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { to, subject } = await request.json();

    if (!to) {
      return NextResponse.json({ success: false, message: 'Recipient email is required' }, { status: 400 });
    }

    const kpis = {
      forecastAccuracy: 92.5,
      inventoryTurns: 8.3,
      fillRate: 97,
      stockCoverage: 18,
      stockoutRisk: 4,
    };

    // Check if SMTP is configured
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;

    if (!smtpHost || !smtpUser || smtpHost === 'smtp.gmail.com' && smtpUser === 'your_email@gmail.com') {
      // Simulate email sending for demo
      console.log(`[EMAIL DEMO] Sending report to: ${to}`);
      console.log(`[EMAIL DEMO] Subject: ${subject}`);
      console.log(`[EMAIL DEMO] KPIs: Forecast Accuracy ${kpis.forecastAccuracy}%`);

      // Simulate a short delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      return NextResponse.json({
        success: true,
        message: `Report sent to ${to} (demo mode - configure SMTP for real emails)`,
        demo: true,
      });
    }

    // Real email sending with nodemailer
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: smtpUser,
        pass: process.env.SMTP_PASS,
      },
    });

    const htmlContent = `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; color: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 32px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: white;">Tenchi S&OP Report</h1>
          <p style="margin: 8px 0 0; opacity: 0.8; font-size: 14px; color: white;">Strategy. Scale. Success.</p>
        </div>
        <div style="padding: 32px;">
          <h2 style="font-size: 18px; margin: 0 0 16px; color: #1e293b;">📊 Key Performance Indicators</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px; color: #64748b;">Forecast Accuracy</td>
              <td style="padding: 12px; text-align: right; font-weight: 700; color: #3b82f6;">${kpis.forecastAccuracy}%</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px; color: #64748b;">Inventory Turns</td>
              <td style="padding: 12px; text-align: right; font-weight: 700; color: #06b6d4;">${kpis.inventoryTurns}x</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px; color: #64748b;">Fill Rate</td>
              <td style="padding: 12px; text-align: right; font-weight: 700; color: #10b981;">${kpis.fillRate}%</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px; color: #64748b;">Stock Coverage</td>
              <td style="padding: 12px; text-align: right; font-weight: 700; color: #f59e0b;">${kpis.stockCoverage} days</td>
            </tr>
            <tr>
              <td style="padding: 12px; color: #64748b;">Stockout Risk</td>
              <td style="padding: 12px; text-align: right; font-weight: 700; color: #ef4444;">${kpis.stockoutRisk} items</td>
            </tr>
          </table>
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">
            Generated on ${new Date().toLocaleDateString()} | Tenchi S&OP Platform
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || smtpUser,
      to,
      subject: subject || 'Tenchi S&OP Report',
      html: htmlContent,
    });

    return NextResponse.json({ success: true, message: `Report sent to ${to}` });
  } catch (error: any) {
    console.error('Email Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
