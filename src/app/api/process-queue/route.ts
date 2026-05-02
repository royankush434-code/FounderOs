import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { runForensicAgents } from '@/lib/analysis';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  // 1. Auth Check (Cron Secret)
  const authHeader = req.headers.get('x-founderos-cron');
  const vercelCron = req.headers.get('x-vercel-cron');
  const isDev = process.env.NODE_ENV === 'development';

  if (!isDev && authHeader !== process.env.CRON_SECRET && !vercelCron) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 2. Fetch pending jobs (limit to 3 per run to avoid timeout)
    const { data: pendingJobs, error: fetchError } = await supabase
      .from('analysis_queue')
      .select('*')
      .eq('status', 'pending')
      .lt('attempts', 10) // Allow more retries for partial progress
      .order('created_at', { ascending: true })
      .limit(3);

    if (fetchError) throw fetchError;
    if (!pendingJobs || pendingJobs.length === 0) {
      return NextResponse.json({ processed: 0, message: 'No pending jobs' });
    }

    let processed = 0;
    let failures = 0;

    for (const job of pendingJobs) {
      // Mark as processing
      await supabase
        .from('analysis_queue')
        .update({ 
          status: 'processing',
          attempts: job.attempts + 1,
          last_attempted_at: new Date().toISOString()
        })
        .eq('id', job.id);

      // 3. Resume Agents
      const inputs = {
        idea: job.idea,
        customerSegment: job.customer_segment,
        targetMarket: job.target_market,
        businessModel: job.business_model,
        founderStage: job.founder_stage,
        email: job.email,
        leadId: job.lead_id,
        queueId: job.id
      };

      const result = await runForensicAgents(
        job.completed_agents || 0,
        job.partial_data || {},
        inputs
      );

      if (result.completed) {
        // result.result is already the fully-formed report from buildSafeResult
        const finalReport = result.result!;

        // Success: Update Job
        await supabase
          .from('analysis_queue')
          .update({
            status: 'completed',
            result: finalReport,
            completed_agents: 8,
            completed_at: new Date().toISOString()
          })
          .eq('id', job.id);

        // Update Leads Record
        if (job.lead_id) {
          await supabase
            .from('leads')
            .update({ 
                report_data: finalReport,
                score: finalReport.viabilityScore || 0,
                problem_score: finalReport.problem_score,
                market_score: finalReport.market_score,
                risk_score: finalReport.risk_score,
                feasibility_score: finalReport.feasibility_score,
                innovation_score: finalReport.innovation_score,
                opportunity_score: finalReport.opportunity_score,
            })
            .eq('id', job.lead_id);
          
          console.log("SYSTEM: Data Merge Complete for Lead ID: " + job.lead_id);
        }

        // Trigger PDF Email
        const protocol = isDev ? 'http' : 'https';
        const host = req.headers.get('host');
        
        // Fetch user name for personalization if missing
        let userName = job.name || 'Founder';
        if (job.lead_id && !job.name) {
          const { data: lead } = await supabase.from('leads').select('name').eq('id', job.lead_id).single();
          if (lead?.name) userName = lead.name;
        }

        try {
          // Internal call to send-report-email which handles Puppeteer + Nodemailer
          await fetch(`${protocol}://${host}/api/send-report-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: job.email,
              name: userName,
              idea: job.idea,
              result: finalReport,
              queue_id: job.id
            })
          });
        } catch (emailErr) {
          console.error('Failed to trigger email from background worker:', emailErr);
        }

        processed++;
      } else {
        // Rate Limit or other partial failure: Save progress and set back to pending
        await supabase
          .from('analysis_queue')
          .update({
            status: 'pending',
            completed_agents: result.completedCount,
            partial_data: result.partialData,
            estimated_ready_at: result.isRateLimit ? new Date(Date.now() + 60000).toISOString() : null
          })
          .eq('id', job.id);
        
        failures++;
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      failures,
      total_attempted: pendingJobs.length
    });

  } catch (err: any) {
    console.error('Queue Processor Critical Error:', err);
    return NextResponse.json({ error: 'Internal Error', details: err.message }, { status: 500 });
  }
}
