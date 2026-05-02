import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { runForensicAgents } from '@/lib/analysis';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { idea, customerSegment, targetMarket, businessModel, founderStage, leadId, email } = body;

    if (!idea) {
      return NextResponse.json({ error: 'Idea is required' }, { status: 400 });
    }

    // Try to run the full forensic pipeline
    const result = await runForensicAgents(0, {}, {
      idea,
      customerSegment,
      targetMarket,
      businessModel,
      founderStage,
      email,
      leadId
    });

    if (result.completed) {
      // Success Path: Return immediately and update leads if possible
      if (leadId) {
        await supabase
          .from('leads')
          .update({ report_data: result.result })
          .eq('id', leadId);
      }
      return NextResponse.json(result.result);
    }

    if (result.isRateLimit) {
      // Rate Limit Path: Create a queue entry and return 202
      const { data: queueItem, error: queueError } = await supabase
        .from('analysis_queue')
        .insert({
          lead_id: leadId,
          email,
          idea,
          customer_segment: customerSegment,
          target_market: targetMarket,
          business_model: businessModel,
          founder_stage: founderStage,
          status: 'pending',
          completed_agents: result.completedCount,
          partial_data: result.partialData
        })
        .select()
        .single();

      if (queueError) {
        console.error('Queue insertion failed:', queueError);
        return NextResponse.json({ error: 'Queue failed', details: queueError.message }, { status: 500 });
      }

      return NextResponse.json({ 
        queued: true, 
        queue_id: queueItem.id,
        message: 'Rate limit reached. Analysis is continuing in the background.',
        progress: (result.completedCount / 8) * 100
      }, { status: 202 });
    }

    // General error
    return NextResponse.json({ error: result.error || 'Analysis failed' }, { status: 500 });

  } catch (error: any) {
    console.error('Analyze route CRITICAL failure:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}