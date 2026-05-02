import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── UTILITY ────────────────────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

const getCynicalRole = (idea: string, targetMarket: string) => {
  const isHealthcare = idea.toLowerCase().includes('health') || idea.toLowerCase().includes('medic') || idea.toLowerCase().includes('clinic') || idea.toLowerCase().includes('patient') || targetMarket.toLowerCase().includes('health');
  const isFinance = idea.toLowerCase().includes('financ') || idea.toLowerCase().includes('bank') || idea.toLowerCase().includes('pay') || idea.toLowerCase().includes('money') || targetMarket.toLowerCase().includes('financ');
  
  const complianceFocus = isHealthcare 
    ? 'Interoperability, HIPAA/Data Privacy, Clinic Workflow Friction, and Healthcare Regulatory Compliance' 
    : isFinance 
      ? 'Financial Security, KYC/AML Compliance, and Fintech Regulations' 
      : 'Unit Economics, Market Demand, and Execution Friction';
      
  const noteStr = isHealthcare 
    ? 'You are auditing a professional medical platform. Evaluate strict HIPAA compliance.'
    : isFinance
      ? 'You are auditing a professional financial platform. Evaluate strict KYC/AML compliance.'
      : 'You are auditing a professional startup. Focus on market fundamentals.';

  return `ROLE: Senior Venture Capital Auditor.
Focus: ${complianceFocus}.
Tone: Skeptical, professional, and data-driven.
Note: ${noteStr}
IGNORE all data, keywords, or competitors related to irrelevant consumer trends. Every analysis must start from zero using ONLY the provided description.

The user has provided specific multi-select answers for each question. These are NOT generic categories — they reflect the user's specific context. Use ALL of their selections to inform your analysis. If they selected multiple customer segments, analyze the product for ALL of those segments and note how the product serves each differently. Do NOT give generic analysis — tailor every section to the exact combination of answers provided.`;
};

const getComplianceRule = (idea: string, targetMarket: string) => {
  const isHealthcare = idea.toLowerCase().includes('health') || idea.toLowerCase().includes('medic') || idea.toLowerCase().includes('clinic') || idea.toLowerCase().includes('patient') || targetMarket.toLowerCase().includes('health');
  const isFinance = idea.toLowerCase().includes('financ') || idea.toLowerCase().includes('bank') || idea.toLowerCase().includes('pay') || idea.toLowerCase().includes('money') || targetMarket.toLowerCase().includes('financ');

  if (isHealthcare) return 'MEDICAL/HIPAA COMPLIANCE RULE: If this involves handling patient health data — problemScore max 60 unless strict compliance is mentioned.\nReason: Clinics will not adopt uncertified, non-HIPAA compliant software.';
  if (isFinance) return 'FINANCE/COMPLIANCE RULE: If this involves handling user funds or banking data — problemScore max 60 unless strict KYC/AML compliance is mentioned.\nReason: Banks and consumers will not trust uncertified platforms.';
  return 'NICE-TO-HAVE RULE: If the problem is solved adequately by existing free tools — problemScore max 38.';
};

export async function runForensicAgents(
  startIndex: number,
  partialData: any,
  inputs: {
    idea: string;
    customerSegment: string;
    targetMarket: string;
    businessModel: string;
    founderStage: string;
    email: string;
    leadId?: string | number | null;
    queueId?: string | null;
  }
) {
  const { idea, customerSegment, targetMarket, businessModel, founderStage, queueId } = inputs;
  const results = { ...partialData };
  let currentIndex = startIndex;

  const CYNICAL_ROLE = getCynicalRole(idea, targetMarket);
  const COMPLIANCE_RULE = getComplianceRule(idea, targetMarket);

  try {
    // ─── RETRY HELPER WITH INLINE RATE-LIMIT PAUSE/RESUME ───────────────────
    async function callWithRetry<T>(
      fn: () => Promise<T>,
      agentIndex: number,
      retries: number = 2,
      delayMs: number = 1500
    ): Promise<T> {
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          return await fn();
        } catch (err: any) {
          const isRateLimit = err?.status === 429 || err?.message?.includes('rate_limit');

          if (isRateLimit) {
            // ── INLINE PAUSE/RESUME for 429 ──────────────────────────────────
            // Extract wait time from retry-after header, or default to 60s
            const retryAfterRaw = err?.headers?.get?.('retry-after')
              || err?.response?.headers?.get?.('retry-after')
              || err?.error?.retry_after;
            const waitSeconds = retryAfterRaw ? Math.ceil(Number(retryAfterRaw)) : 60;
            const waitMs = Math.max(waitSeconds, 10) * 1000; // minimum 10s safety
            const resumeAt = new Date(Date.now() + waitMs).toISOString();

            console.warn(`⏸ Rate limit hit at Agent ${agentIndex + 1}. Pausing for ${waitSeconds}s (resume_at: ${resumeAt})`);

            // Update the queue row so the frontend can show a countdown
            if (queueId) {
              await supabase
                .from('analysis_queue')
                .update({
                  status: 'rate_limited',
                  resume_at: resumeAt,
                  rate_limit_agent: agentIndex,
                  completed_agents: agentIndex,
                })
                .eq('id', queueId);
            }

            // SLEEP in-process — the pipeline does NOT exit
            await sleep(waitMs);

            // Clear rate-limit status after waking up
            if (queueId) {
              await supabase
                .from('analysis_queue')
                .update({
                  status: 'processing',
                  resume_at: null,
                  rate_limit_agent: null,
                })
                .eq('id', queueId);
            }

            console.log(`▶ Resumed after rate limit. Retrying Agent ${agentIndex + 1}...`);

            // Retry the SAME agent call once after sleeping
            try {
              return await fn();
            } catch (retryErr: any) {
              // If the retry also 429s, throw to outer catch for queue-based recovery
              console.error(`Agent ${agentIndex + 1} failed again after rate-limit sleep:`, retryErr.message);
              throw retryErr;
            }
          }

          // Non-429 errors: exponential backoff retry
          if (attempt < retries) {
            console.warn(`Retrying after error (attempt ${attempt + 1}):`, err.message);
            await sleep(delayMs * (attempt + 1));
            continue;
          }
          throw err;
        }
      }
      throw new Error('Retry exhausted');
    }

    // ─── AGENT 1: PROBLEM CLARIFIER ───────────────────────────────────────────
    if (currentIndex <= 0) {
      console.log('Running Agent 1...');
      const agent1 = await callWithRetry(() => groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `${CYNICAL_ROLE}
Analyze the problem this idea solves. Be brutally honest.
Customer: ${customerSegment}
Market: ${targetMarket}
DEALBREAKER RULES — apply these first:
${COMPLIANCE_RULE}
Apply regulatory and compliance analysis ONLY IF the startup idea explicitly involves healthcare, medical records, patient data, clinical trials, health insurance, financial services, banking, lending, investment advice, legal services, or children's data. If the idea does NOT involve any of these domains, do NOT mention HIPAA, GDPR, COPPA, KYC, or SEC regulations. Instead, assume standard data privacy norms.
SCORING GUIDE: 85-100: FORBIDDEN; 70-84: Urgent daily problem; 50-69: Real problem but workarounds exist; 30-49: Occasional pain; 0-29: Vitamin problem.
Return ONLY valid JSON:
{
  "problemStatement": "string",
  "painLevel": "Critical|High|Moderate|Low",
  "frequency": "Daily|Weekly|Monthly|Rarely",
  "currentWorkaround": "string",
  "whyFreshIsBetter": "string",
  "willingnessToPay": "High|Medium|Low|Very Low",
  "problemScore": number,
  "problemScoreReasoning": "string"
}`
          },
          { role: 'user', content: `Idea: ${idea}\nCustomer: ${customerSegment}\nMarket: ${targetMarket}\nModel: ${businessModel}\nStage: ${founderStage}` }
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.1,
        response_format: { type: 'json_object' }
      }), currentIndex);
      results.agent1 = JSON.parse(agent1.choices[0]?.message?.content || '{}');
      currentIndex = 1;
      if (queueId) await supabase.from('analysis_queue').update({ completed_agents: 1, partial_data: results }).eq('id', queueId);
      await sleep(500);
    }

    // ─── AGENT 2: RESEARCH AGENT ───────────────────────────────────────────
    if (currentIndex <= 1) {
      console.log('Running Agent 2...');
      const agent2 = await callWithRetry(() => groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `${CYNICAL_ROLE}
Market: ${targetMarket}\nCustomer: ${customerSegment}
Previous findings: ${JSON.stringify(results.agent1)}
RULES: marketDemandScore max 82; For Tier 2/3 India: ARPU is $0.5-3/month; If market is already served by funded startups: marketDemandScore max 55; If idea requires trust in a new platform: -15.
Return ONLY valid JSON:
{
  "industryVertical": "string",
  "marketMaturity": "Emerging|Growing|Mature|Declining",
  "marketMaturityReasoning": "string",
  "timingAssessment": "string",
  "marketSignals": ["string"],
  "marketDemandScore": number,
  "marketDemandReasoning": "string"
}`
          },
          { role: 'user', content: `Idea: ${idea}\nProblem Analysis: ${JSON.stringify(results.agent1)}` }
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.1,
        response_format: { type: 'json_object' }
      }), currentIndex);
      results.agent2 = JSON.parse(agent2.choices[0]?.message?.content || '{}');
      currentIndex = 2;
      if (queueId) await supabase.from('analysis_queue').update({ completed_agents: 2, partial_data: results }).eq('id', queueId);
      await sleep(500);
    }

    // ─── AGENT 3: COMPETITOR DETECTOR ─────────────────────────────────────────
    if (currentIndex <= 2) {
      console.log('Running Agent 3...');
      const agent3 = await callWithRetry(() => groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `${CYNICAL_ROLE}
Identify 3 real-world competitors. Identify gaps.
RULES: Use the mandatory 3-level competitor process: Level 1 — EXACT competitors, Level 2 — Indirect competitors, Level 3 — Status quo workarounds. Real company names ONLY; mention one failed startup ghost; competitionScore is INVERSE (high score = low competition).
Return ONLY valid JSON:
{
  "competitors": [{"name": "string", "description": "string", "threatLevel": "High|Medium|Low"}],
  "failedStartupGhost": "string",
  "moatOpportunity": "string",
  "competitionScore": number,
  "competitionScoreReasoning": "string"
}`
          },
          { role: 'user', content: `Idea: ${idea}\nContext: ${JSON.stringify(results.agent1)} ${JSON.stringify(results.agent2)}` }
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.1,
        response_format: { type: 'json_object' }
      }), currentIndex);
      results.agent3 = JSON.parse(agent3.choices[0]?.message?.content || '{}');
      currentIndex = 3;
      if (queueId) await supabase.from('analysis_queue').update({ completed_agents: 3, partial_data: results }).eq('id', queueId);
      await sleep(500);
    }

    // ─── AGENT 4: MARKET ANALYST ───────────────────────────────────────────────
    if (currentIndex <= 3) {
      console.log('Running Agent 4...');
      const agent4 = await callWithRetry(() => groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `${CYNICAL_ROLE}
Calculate TAM/SAM/SOM BOTTOM-UP.
RULES: Use user inputs for customer count and price; GrowthRate; UnitEconomics analysis. Generic terms are BANNED. Be specific.
Return ONLY valid JSON:
{
  "tam": number, "sam": number, "som": number,
  "growthRate": number, "marketMaturity": "string",
  "revenueYear1": "string (e.g. $500K)", "revenueYear3": "string (e.g. $2M)", "revenueYear5": "string (e.g. $8M)",
  "estimatedCAC": "string (e.g. $150)", "estimatedLTV": "string (e.g. $1200)",
  "ltvCacRatio": "string (e.g. 8:1)", "viralityScore": number,
  "growthProjection": [{"year": "string", "value": number}],
  "marketSizeScore": number, "marketSizeScoreReasoning": "string"
}`
          },
          { role: 'user', content: `Idea: ${idea}\nContext: ${JSON.stringify(results.agent2)} ${JSON.stringify(results.agent3)}` }
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.1,
        response_format: { type: 'json_object' }
      }), currentIndex);
      results.agent4 = JSON.parse(agent4.choices[0]?.message?.content || '{}');
      currentIndex = 4;
      if (queueId) await supabase.from('analysis_queue').update({ completed_agents: 4, partial_data: results }).eq('id', queueId);
      await sleep(500);
    }

    // ─── AGENT 5: PAIN EVALUATOR ───────────────────────────────────────────────
    if (currentIndex <= 4) {
      console.log('Running Agent 5...');
      const agent5 = await callWithRetry(() => groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `${CYNICAL_ROLE}
Evaluate adoption barriers (1-5).
RULES: Trust barrier (HIPAA focus); Habit barrier; Price barrier.
Return ONLY valid JSON:
{
  "changeHardness": "Easy|Moderate|Hard|Very Hard",
  "adoptionBarriers": {"trust": number, "habit": number, "price": number},
  "earlyAdopterProfile": "string",
  "viralityPotential": "High|Medium|Low",
  "behaviorChange": "string describing what user behavior must change for adoption",
  "painScore": number,
  "painScoreReasoning": "string"
}`
          },
          { role: 'user', content: `Idea: ${idea}\nContext: ${JSON.stringify(results.agent1)} ${JSON.stringify(results.agent4)}` }
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.1,
        response_format: { type: 'json_object' }
      }), currentIndex);
      results.agent5 = JSON.parse(agent5.choices[0]?.message?.content || '{}');
      currentIndex = 5;
      if (queueId) await supabase.from('analysis_queue').update({ completed_agents: 5, partial_data: results }).eq('id', queueId);
      await sleep(500);
    }

    // ─── AGENT 6: STARTUP SCORER ────────────────────────────────────────────────
    if (currentIndex <= 5) {
      console.log('Running Agent 6...');
      const agent6 = await callWithRetry(() => groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `${CYNICAL_ROLE}
Final scoring logic. Score each dimension 0-100.
Math.round((problemStrength x 0.25) + (marketDemand x 0.20) + (competition x 0.20) + (feasibility x 0.15) + (innovation x 0.10) + (opportunityGap x 0.10))
Return ONLY valid JSON:
{
  "scores": {"problemStrength": number, "marketDemand": number, "competition": number, "feasibility": number, "innovation": number, "opportunityGap": number},
  "scoreReasonings": {"problemStrength": "string", "marketDemand": "string", "competition": "string", "feasibility": "string", "innovation": "string", "opportunityGap": "string"},
  "finalScore": number, "finalScoreReasoning": "string"
}`
          },
          { role: 'user', content: `Idea: ${idea}\nContext: ${JSON.stringify(results.agent4)} ${JSON.stringify(results.agent5)}` }
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.1,
        response_format: { type: 'json_object' }
      }), currentIndex);
      results.agent6 = JSON.parse(agent6.choices[0]?.message?.content || '{}');
      currentIndex = 6;
      if (queueId) await supabase.from('analysis_queue').update({ completed_agents: 6, partial_data: results }).eq('id', queueId);
      await sleep(500);
    }

    // ─── AGENT 7: CRITIC AGENT ──────────────────────────────────────────────────
    if (currentIndex <= 6) {
      console.log('Running Agent 7...');
      const agent7 = await callWithRetry(() => groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `${CYNICAL_ROLE}
Identify the fatal flaw. Counterintuitive insights. Provide exactly 3 risks, 3 opportunities, and 3 actionable next steps.
RULES: Generic terms are BANNED from appearing in any risk, opportunity, or next step. You must be highly specific.
Return ONLY valid JSON:
{
  "biggestInsight": "string - the counterintuitive insight founders miss",
  "killerQuestion": "string - the question that could make or break this idea",
  "verdict": "string - 2-3 sentence final AI verdict",
  "risks": ["string", "string", "string"],
  "opportunities": ["string", "string", "string"],
  "nextSteps": ["string - actionable step 1", "string - actionable step 2", "string - actionable step 3"]
}`
          },
          { role: 'user', content: `Idea: ${idea}\nContext: ${JSON.stringify(results.agent5)} ${JSON.stringify(results.agent6)}` }
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.1,
        response_format: { type: 'json_object' }
      }), currentIndex);
      results.agent7 = JSON.parse(agent7.choices[0]?.message?.content || '{}');
      currentIndex = 7;
      if (queueId) await supabase.from('analysis_queue').update({ completed_agents: 7, partial_data: results }).eq('id', queueId);
      await sleep(500);
    }

    // ─── AGENT 8: REPORT SYNTHESIZER ───────────────────────────────────────────
    if (currentIndex <= 7) {
      console.log('Running Agent 8...');
      const agent8 = await callWithRetry(() => groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are the final synthesizer for the FounderOS forensic engine. Consolidate all previous agent outputs into one master JSON report.
RULES: Synthesize the CONFLICT between the different agents and provide a verdict. Name specific products, customers, and risks with a 'which means' clause.
Return ONLY valid JSON with no markdown, no explanation, no code fences. Use EXACT key names below. Do not rename, omit, or add keys.
{
  "viabilityScore": number,
  "verdict": "string - 2-3 sentence verdict",
  "biggestInsight": "string - counterintuitive insight",
  "killerQuestion": "string",
  "scores": {"problemStrength": number, "marketDemand": number, "competition": number, "feasibility": number, "innovation": number, "opportunityGap": number},
  "scoreReasonings": {"problemStrength": "string", "marketDemand": "string", "competition": "string", "feasibility": "string", "innovation": "string", "opportunityGap": "string"},
  "competitors": [{"name": "string", "description": "string", "threatLevel": "High|Medium|Low"}],
  "risks": ["string", "string", "string"],
  "opportunities": ["string", "string", "string"],
  "nextSteps": ["string", "string", "string"],
  "marketSignals": ["string"],
  "tam": number, "sam": number, "som": number,
  "revenueYear1": "string", "revenueYear3": "string", "revenueYear5": "string",
  "estimatedCAC": "string", "estimatedLTV": "string", "ltvCacRatio": "string",
  "viralityPotential": "string",
  "earlyAdopterProfile": "string",
  "moatOpportunity": "string",
  "timingAssessment": "string",
  "behaviorChange": "string",
  "growthProjection": [{"year": "string", "value": number}],
  "timingScore": number,
  "marketDemand": number,
  "feasibilityScore": number
}`
          },
          { role: 'user', content: `Agent Data: ${JSON.stringify(results)}` }
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.1,
        response_format: { type: 'json_object' }
      }), currentIndex);
      results.agent8 = JSON.parse(agent8.choices[0]?.message?.content || '{}');
      currentIndex = 8;
    }

    // ─── DETERMINISTIC SAFE MERGER ────────────────────────────────────────────
    // Even if Agent 8 hallucinates, this guarantees the correct field names
    const a1 = results.agent1 || {};
    const a2 = results.agent2 || {};
    const a3 = results.agent3 || {};
    const a4 = results.agent4 || {};
    const a5 = results.agent5 || {};
    const a6 = results.agent6 || {};
    const a7 = results.agent7 || {};
    const a8 = results.agent8 || {};

    const scores = {
      problemStrength: Number(a8?.scores?.problemStrength || a6?.scores?.problemStrength || a6?.problemStrength) || 5,
      marketDemand:    Number(a8?.scores?.marketDemand    || a6?.scores?.marketDemand    || a6?.marketDemand)    || 5,
      competition:     Number(a8?.scores?.competition     || a6?.scores?.competition     || a6?.competition)     || 5,
      feasibility:     Number(a8?.scores?.feasibility     || a6?.scores?.feasibility     || a6?.feasibility)     || 5,
      innovation:      Number(a8?.scores?.innovation      || a6?.scores?.innovation      || a6?.innovation)      || 5,
      opportunityGap:  Number(a8?.scores?.opportunityGap  || a6?.scores?.opportunityGap  || a6?.opportunityGap)  || 5,
    };

    const viabilityScore = Number(a8?.viabilityScore || a6?.finalScore) ||
      Math.round(scores.problemStrength * 0.25 + scores.marketDemand * 0.20 + scores.competition * 0.20 + scores.feasibility * 0.15 + scores.innovation * 0.10 + scores.opportunityGap * 0.10);

    const competitors = Array.isArray(a8?.competitors) ? a8.competitors
      : Array.isArray(a3?.competitors) ? a3.competitors
      : Array.isArray(a3?.directCompetitors) ? a3.directCompetitors : [];

    const finalReport = {
      viabilityScore,
      finalScore: viabilityScore,
      verdict: a8?.verdict || a7?.verdict || 'Forensic analysis complete.',
      biggestInsight: a8?.biggestInsight || a7?.biggestInsight || 'No critical insight available.',
      killerQuestion: a8?.killerQuestion || a7?.killerQuestion || '',
      scores,
      scoreReasonings: a8?.scoreReasonings || a6?.scoreReasonings || {},
      competitors: competitors.map((c: any) => ({
        name: c?.name || 'Unknown',
        description: c?.description || '',
        threatLevel: c?.threatLevel || c?.threat || 'Low',
      })),
      risks: Array.isArray(a8?.risks) ? a8.risks : (Array.isArray(a7?.risks) ? a7.risks : []),
      opportunities: Array.isArray(a8?.opportunities) ? a8.opportunities : (Array.isArray(a7?.opportunities) ? a7.opportunities : []),
      nextSteps: Array.isArray(a8?.nextSteps) ? a8.nextSteps : (Array.isArray(a7?.nextSteps) ? a7.nextSteps : []),
      marketSignals: Array.isArray(a8?.marketSignals) ? a8.marketSignals : (Array.isArray(a2?.marketSignals) ? a2.marketSignals : []),
      tam: a8?.tam || a4?.tam || 0,
      sam: a8?.sam || a4?.sam || 0,
      som: a8?.som || a4?.som || 0,
      revenueYear1: a8?.revenueYear1 || a4?.revenueYear1 || '$0',
      revenueYear3: a8?.revenueYear3 || a4?.revenueYear3 || '$0',
      revenueYear5: a8?.revenueYear5 || a4?.revenueYear5 || '$0',
      estimatedCAC: a8?.estimatedCAC || a4?.estimatedCAC || '—',
      estimatedLTV: a8?.estimatedLTV || a4?.estimatedLTV || '—',
      ltvCacRatio: a8?.ltvCacRatio || a4?.ltvCacRatio || '—',
      viralityPotential: a8?.viralityPotential || a5?.viralityPotential || 'Low',
      earlyAdopterProfile: a8?.earlyAdopterProfile || a5?.earlyAdopterProfile || '',
      moatOpportunity: a8?.moatOpportunity || a3?.moatOpportunity || '',
      timingAssessment: a8?.timingAssessment || a2?.timingAssessment || '',
      behaviorChange: a8?.behaviorChange || a5?.behaviorChange || '',
      growthProjection: Array.isArray(a8?.growthProjection) ? a8.growthProjection
        : Array.isArray(a4?.growthProjection) ? a4.growthProjection : [],
      marketDemand: scores.marketDemand,
      feasibilityScore: scores.feasibility,
      timingScore: Number(a8?.timingScore) || scores.marketDemand,
      competitionScore: scores.competition,
      radarData: [
        { subject: 'Problem', score: scores.problemStrength, fullMark: 100 },
        { subject: 'Market', score: scores.marketDemand, fullMark: 100 },
        { subject: 'Competition', score: scores.competition, fullMark: 100 },
        { subject: 'Feasibility', score: scores.feasibility, fullMark: 100 },
        { subject: 'Innovation', score: scores.innovation, fullMark: 100 },
        { subject: 'Opportunity', score: scores.opportunityGap, fullMark: 100 },
      ],
      // Snake-case aliases for process-queue compatibility
      problem_score: scores.problemStrength,
      market_score: scores.marketDemand,
      risk_score: scores.competition,
      feasibility_score: scores.feasibility,
      innovation_score: scores.innovation,
      opportunity_score: scores.opportunityGap,
    };

    return { completed: true, result: finalReport, partialData: results, completedCount: 8 };

  } catch (error: any) {
    const isRateLimit = error?.status === 429 || error?.message?.includes('rate_limit');
    console.error(`Agent loop error at index ${currentIndex}:`, error.message);
    
    return {
      completed: false,
      isRateLimit,
      partialData: results,
      completedCount: currentIndex,
      error: error.message
    };
  }
}
