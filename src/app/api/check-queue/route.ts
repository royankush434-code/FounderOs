import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const queueId = searchParams.get('queue_id');

  if (!queueId) {
    return NextResponse.json({ error: 'Missing queue_id' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('analysis_queue')
      .select('status, result, completed_agents, resume_at, rate_limit_agent')
      .eq('id', queueId)
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Calculate progress (8 agents total)
    const progress = Math.min(((data.completed_agents || 0) / 8) * 100, 100);

    // Rate-limited status: expose countdown info to the frontend
    if (data.status === 'rate_limited') {
      return NextResponse.json({
        status: 'rate_limited',
        completed_agents: data.completed_agents,
        progress: Math.round(progress),
        resume_at: data.resume_at,
        rate_limit_agent: data.rate_limit_agent,
        message: `Token limit reached after Agent ${(data.rate_limit_agent || 0) + 1}. Auto-resuming soon...`
      });
    }

    return NextResponse.json({
      status: data.status,
      result: data.result,
      completed_agents: data.completed_agents,
      progress: Math.round(progress),
      message: data.status === 'failed' ? 'The analysis failed during processing.' : null
    });

  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to check status', details: err.message }, { status: 500 });
  }
}
