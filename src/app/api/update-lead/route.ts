import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { id, score, reportData } = await req.json();

    if (!id || typeof score !== 'number') {
      return NextResponse.json({ error: 'Lead ID and score are required' }, { status: 400 });
    }

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase credentials are not configured' }, { status: 500 });
    }

    console.log(`\n--- SUPABASE UPDATE ATTEMPT ---`);
    console.log(`Updating Lead ID [${id}] with score [${score}]`);

    const updatePayload: any = { score };
    if (reportData) {
      updatePayload.report_data = reportData;
    }

    const { data, error, status, statusText } = await supabase
      .schema('public')
      .from('leads')
      .update(updatePayload)
      .eq('id', id)
      .select('id, score')
      .single();

    console.log('Supabase HTTP Status:', status, statusText);

    if (error) {
      console.error('>>> Supabase Update Error Caught <<<');
      console.error(JSON.stringify(error, null, 2));
      return NextResponse.json({ error: 'Supabase Update Error', details: error.message }, { status: 500 });
    }

    console.log('>>> Supabase Update Success <<<');
    console.log('Returned Data:', data);
    console.log('-------------------------------\n');

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Lead Update Internal Error:', error);
    return NextResponse.json(
      { error: 'Failed to update lead', details: error.message || JSON.stringify(error) },
      { status: 500 }
    );
  }
}
