import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { email, name, idea, result, queue_id } = await req.json();

    if (!email || !result) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FounderOS Analysis Report</title>
    <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-deep: #0a0b0f;
            --bg-surface: #12141c;
            --accent: #ff4d2e;
            --text-primary: #ffffff;
            --text-secondary: #94a3b8;
            --border-subtle: rgba(255, 255, 255, 0.05);
        }
        body {
            background-color: var(--bg-deep);
            color: var(--text-primary);
            font-family: 'Syne', sans-serif;
            margin: 0;
            padding: 40px;
            line-height: 1.6;
        }
        .header {
            text-align: center;
            margin-bottom: 60px;
        }
        .logo {
            font-size: 32px;
            font-weight: 800;
            color: var(--accent);
            text-transform: uppercase;
            letter-spacing: -1px;
        }
        .score-container {
            background: var(--bg-surface);
            border: 1px solid var(--border-subtle);
            border-radius: 32px;
            padding: 48px;
            text-align: center;
            margin-bottom: 40px;
        }
        .score-circle {
            width: 160px;
            height: 160px;
            border-radius: 50%;
            border: 8px solid var(--accent);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
            font-size: 64px;
            font-weight: 800;
        }
        .section {
            background: var(--bg-surface);
            border: 1px solid var(--border-subtle);
            border-radius: 24px;
            padding: 32px;
            margin-bottom: 32px;
        }
        .section-title {
            color: var(--accent);
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 16px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .reasoning {
            color: var(--text-secondary);
            font-size: 15px;
            margin-bottom: 24px;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
        }
        .dimension-card {
            background: rgba(255, 255, 255, 0.02);
            padding: 24px;
            border-radius: 16px;
        }
        .dimension-name {
            font-size: 14px;
            font-weight: 700;
            color: var(--text-secondary);
            margin-bottom: 8px;
        }
        .dimension-score {
            font-size: 24px;
            font-weight: 800;
            color: var(--text-primary);
        }
        .verdict-banner {
            background: linear-gradient(135deg, rgba(255, 77, 46, 0.1) 0%, rgba(255, 77, 46, 0.05) 100%);
            border: 1px solid rgba(255, 77, 46, 0.2);
            padding: 32px;
            border-radius: 24px;
            margin-top: 40px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">FounderOS</div>
        <p style="color: var(--text-secondary)">SaaS Forensic Analysis Report</p>
    </div>

    <div class="score-container">
        <div class="score-circle">${result.viabilityScore}</div>
        <h1 style="margin: 0">Viability Score</h1>
        <p style="color: var(--text-secondary)">${idea}</p>
    </div>

    <div class="grid">
        <div class="section">
            <h2 class="section-title">Market Signals</h2>
            <div class="reasoning">${result.marketSignals?.join('<br>') || 'N/A'}</div>
        </div>
        <div class="section">
            <h2 class="section-title">Evaluation Breakdown</h2>
            <div class="grid" style="grid-template-columns: 1fr 1fr;">
                ${Object.entries(result.scores || {}).map(([name, score]) => `
                    <div class="dimension-card">
                        <div class="dimension-name">${name}</div>
                        <div class="dimension-score">${score}/100</div>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>

    <div class="verdict-banner">
        <h2 class="section-title">AI Verdict</h2>
        <div style="font-size: 18px; font-weight: 700; margin-bottom: 12px;">${result.verdict?.split('.')[0]}.</div>
        <div class="reasoning">${result.insight || result.verdict}</div>
    </div>

    <div style="margin-top: 60px; text-align: center; color: var(--text-secondary); font-size: 12px;">
        © 2024 FounderOS Forensic Engineering. Confidential Analysis.
    </div>
</body>
</html>
    `;

    let pdfBuffer;
    try {
      const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      pdfBuffer = await page.pdf({ 
        format: 'A4', 
        printBackground: true,
        margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
      });
      await browser.close();
    } catch (pError) {
      console.error('Puppeteer failed:', pError);
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions: any = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: `Your FounderOS Startup Analysis Report is Ready`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0b0f; color: #ffffff; padding: 40px; border-radius: 20px;">
          <h2 style="color: #ff4d2e;">FounderOS Forensic Analysis</h2>
          <p>Hi ${name || 'Founder'},</p>
          <p>Your startup analysis report for "<b>${idea?.substring(0, 60)}${idea?.length > 60 ? '...' : ''}</b>" is ready.</p>
          
          <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p style="margin: 0; color: #94a3b8;">Viability Score</p>
            <h1 style="margin: 5px 0; color: #ff4d2e;">${result.viabilityScore}/100</h1>
          </div>

          <p>Your full detailed report is attached as a PDF.</p>
          ${!pdfBuffer ? '<p style="color: #ff4d2e; font-size: 13px;"><i>Note: PDF attachment could not be generated. Please visit founderos.ai to view your report online.</i></p>' : ''}
          
          <p style="margin-top: 30px;">— The FounderOS Team</p>
        </div>
      `,
    };

    if (pdfBuffer) {
      mailOptions.attachments = [
        {
          filename: `FounderOS-Report-${idea?.substring(0, 20).replace(/\s+/g, '-')}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ];
    }

    await transporter.sendMail(mailOptions);

    if (queue_id) {
      await supabase
        .from('analysis_queue')
        .update({ email_sent: true })
        .eq('id', queue_id);
    }

    return NextResponse.json({ success: true, email_sent_to: email });

  } catch (error: any) {
    console.error('Email sending failed:', error);
    return NextResponse.json({ error: 'Failed to send report email', details: error.message }, { status: 500 });
  }
}
