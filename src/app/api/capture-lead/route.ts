import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { name, email, idea } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase credentials are not configured' }, { status: 500 });
    }

    const insertPayload = { 
      name: name, 
      email: email, 
      idea: idea || "No idea provided"
    };
    
    console.log('\n--- SUPABASE INSERT ATTEMPT ---');
    console.log('Target Table: leads');
    console.log('Payload being sent:', insertPayload);

    // Call .schema('public') and .select('id').single() to ensure we return the exact correctly inserted ID object
    const { data, error, status, statusText } = await supabase
      .schema('public')
      .from('leads')
      .insert([insertPayload])
      .select('id');

    console.log('Supabase HTTP Status:', status, statusText);

    if (error) {
      console.error('>>> Supabase Insert Error Caught <<<');
      console.error(JSON.stringify(error, null, 2));
      return NextResponse.json({ error: 'Supabase Insert Error', details: error.message }, { status: 500 });
    }

    const insertedId = Array.isArray(data) && data.length > 0 ? data[0].id : null;
    console.log('>>> Supabase Insert Success <<<');
    console.log('Returned ID:', insertedId);

    return NextResponse.json({ success: true, id: insertedId });
  } catch (error: any) {
    console.error('Lead Capture Internal Error:', error);
    return NextResponse.json(
      { error: 'Failed to capture lead', details: error.message || JSON.stringify(error) },
      { status: 500 }
    );
  }
}
