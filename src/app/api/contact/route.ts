import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

function generateTicketNumber(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Always 6 digits
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const username = formData.get('username')?.toString() || '';
  const email = formData.get('email')?.toString() || '';
  const description = formData.get('description')?.toString() || '';
  const file = formData.get('attachment') as File;

  const ticketNumber = generateTicketNumber();

  const buffer = file ? Buffer.from(await file.arrayBuffer()) : null;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.ADMIN_PASS,
    },
  });

  // Send to Admin
  await transporter.sendMail({
    from: `"Helpdesk AI" <${process.env.ADMIN_EMAIL}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `[New Contact] ${username}`,
    html: `
      <p><strong>Username:</strong> ${username}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Description:</strong><br>${description}</p>
      <p><strong>Ticket No.:</strong> ${ticketNumber}</p>
    `,
    attachments: buffer
      ? [
          {
            filename: file.name,
            content: buffer,
          },
        ]
      : [],
  });

  // Confirmation to User
  await transporter.sendMail({
    from: `"Helpdesk AI" <${process.env.ADMIN_EMAIL}>`,
    to: email,
    subject: `Your Helpdesk Ticket - ${ticketNumber}`,
    html: `
      <p>Hello ${username},</p>
      <p>We've received your concern. Our team will look into it shortly.</p>
      <p><strong>Your Ticket Number:</strong> ${ticketNumber}</p>
      <p>Thank you for contacting Helpdesk AI.</p>
    `,
  });

  // Return ticket number to frontend
  return NextResponse.json({
    success: true,
    ticketNumber,
  });
}
