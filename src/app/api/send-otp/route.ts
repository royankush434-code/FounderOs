import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Invalidate old OTPs for this email
    await supabase
      .from('otp_verifications')
      .update({ verified: true })
      .eq('email', email)
      .eq('verified', false);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry 10 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Store in Supabase
    const { error: insertError } = await supabase
      .from('otp_verifications')
      .insert([
        {
          email,
          otp,
          expires_at: expiresAt.toISOString(),
          verified: false
        }
      ]);

    if (insertError) {
      console.error('OTP Insert Error:', insertError);
      return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 });
    }

    // Send email using nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: parseInt(process.env.SMTP_PORT || '587') === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"FounderOS" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your FounderOS Verification Code',
      text: `Your verification code is: ${otp}. This code expires in 10 minutes. Do not share this code with anyone.`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #00E676;">FounderOS Verification</h2>
          <p>Your verification code is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; padding: 16px; background: #f5f5f5; border-radius: 8px; text-align: center; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code expires in <strong>10 minutes</strong>. Do not share this code with anyone.</p>
        </div>
      `
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Send OTP Error:', error);
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}
