import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages, idea, analysisResult } = await req.json();

    if (!idea || !analysisResult || !messages) {
      return NextResponse.json(
        { error: 'Missing required chat context' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are the FounderOS Forensic AI Advisor. 
You are speaking to a founder who just validated their startup idea using the FounderOS multi-agent forensic pipeline.

CONTEXT:
Startup Idea: "${idea}"
Analysis Report (JSON): ${JSON.stringify(analysisResult)}

YOUR ROLE:
1. Be an elite, high-level startup advisor.
2. Be "Brutally Calibrated"—honest about risks but structured in your advice.
3. Use the specific scores from the report (Viability: ${analysisResult.viabilityScore}, etc.) to back up your points.
4. Reference the "Key Risks" and "Competitors" identified by the other agents.
5. Suggest specific pivots or "Next Steps" if the user asks for them.
6. Keep responses high-density and professional. Avoid fluff.

TONE: Forensic, insightful, authoritative, yet supportive of the validation process.

Answer the user's follow-up questions about their report.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
    });

    const aiMessage = chatCompletion.choices[0]?.message?.content ?? "I'm sorry, I couldn't process that request.";

    return NextResponse.json({ content: aiMessage });

  } catch (error: any) {
    console.error('AI Advisor Chat Error:', error);
    return NextResponse.json(
      { error: 'Chat failed. Please try again.' },
      { status: 500 }
    );
  }
}
