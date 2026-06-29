import { NextResponse, NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';
import { getRedis } from '@/lib/redis';
import { sendEmail } from '@/lib/brevo';

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Spam Protection: 3 requests per minute per IP
    const rateLimit = await checkRateLimit(req, 'auth-otp');
    if (!rateLimit.success) {
      return NextResponse.json({ error: 'Too many requests. Please wait a minute before trying again.' }, { status: 429 });
    }

    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ error: 'Redis is not configured' }, { status: 500 });
    }

    const otp = generateOTP();
    console.log("OTP IS:", otp);

    // Store OTP in Redis with a 5-minute expiration
    await redis.set(`otp:${email}`, otp, { ex: 300 });

    // Send the email via Brevo
    const htmlContent = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Campus Opportunity Hub</h2>
        <p>Your secure 6-digit code is:</p>
        <h1 style="font-size: 32px; letter-spacing: 5px; color: #4F46E5;">${otp}</h1>
        <p>This code will expire in 5 minutes. Do not share this code with anyone.</p>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: 'Your Login Code - Campus Opportunity Hub',
      htmlContent,
    });

    return NextResponse.json({ success: true, message: 'OTP sent successfully via Brevo' });
  } catch (error: any) {
    console.error('API Custom OTP Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
