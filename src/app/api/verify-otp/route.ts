import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    // Fetch the latest OTP for this email
    const { data, error } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'No verification request found for this email' }, { status: 404 });
    }

    if (data.verified) {
      return NextResponse.json({ error: 'Code already used. Please request a new one.' }, { status: 400 });
    }

    if (new Date() > new Date(data.expires_at)) {
      return NextResponse.json({ error: 'Code has expired. Please request a new one.' }, { status: 400 });
    }

    if (data.otp !== otp) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    // Mark as verified
    await supabase
      .from('otp_verifications')
      .update({ verified: true })
      .eq('id', data.id);

    return NextResponse.json({ success: true, verified: true });
  } catch (error: any) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
