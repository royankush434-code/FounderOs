import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('leads')
      .select('id, idea, score, created_at, report_data')
      .eq('email', email)
      .not('report_data', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('History fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
    }

    return NextResponse.json({ success: true, history: data });
  } catch (error: any) {
    console.error('History API error:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching history' },
      { status: 500 }
    );
  }
}
