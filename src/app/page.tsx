'use client';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import SettingsPanel from '../components/SettingsPanel';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import AIAdvisorOrb from '../components/AIAdvisorOrb';

// ============================================================================
// FORENSIC VISUALIZATION HELPERS (CHART.JS)
// ============================================================================
function ForensicBenchmarkChart({ data }: { data: any }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (canvasRef.current && (window as any).Chart) {
      if (chartRef.current) chartRef.current.destroy();
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        chartRef.current = new (window as any).Chart(ctx, {
          type: 'bar',
          data: {
            labels: data.labels,
            datasets: [
              {
                label: 'Your Score',
                data: data.userScores,
                backgroundColor: '#00e676',
                borderRadius: 6,
                barPercentage: 0.5,
                categoryPercentage: 0.8,
              },
              {
                label: 'Industry Benchmark',
                data: data.benchmarks || [76, 74, 66, 72, 62, 70],
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                borderRadius: 6,
                barPercentage: 0.5,
                categoryPercentage: 0.8,
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10, weight: '600' } } },
              y: { grid: { color: 'rgba(255,255,255,0.05)' }, min: 0, max: 100, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 } } }
            },
            plugins: {
              legend: { position: 'top', align: 'end', labels: { color: 'rgba(255,255,255,0.5)', font: { size: 10, weight: '700' }, usePointStyle: true, boxWidth: 6 } },
              tooltip: { backgroundColor: '#161b22', padding: 12, titleFont: { size: 12 }, bodyFont: { size: 12 }, cornerRadius: 8, borderColor: 'rgba(0,230,118,0.2)', borderWidth: 1 }
            }
          }
        });
      }
    }
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [data]);

  return <canvas ref={canvasRef} />;
}

function ForensicThreatDoughnut({ data }: { data: any }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (canvasRef.current && (window as any).Chart) {
      if (chartRef.current) chartRef.current.destroy();
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        chartRef.current = new (window as any).Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: data.labels,
            datasets: [{
              data: data.values,
              backgroundColor: data.colors,
              borderWidth: 0,
              hoverOffset: 4
            }]
          },
          options: {
            cutout: '72%',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom', labels: { color: 'rgba(255,255,255,0.6)', font: { size: 10, weight: '700' }, usePointStyle: true, padding: 15, boxWidth: 6 } },
              tooltip: { backgroundColor: '#161b22', padding: 12, cornerRadius: 8, borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 }
            }
          }
        });
      }
    }
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [data]);

  return <canvas ref={canvasRef} style={{ maxWidth: '180px', maxHeight: '180px' }} />;
}


// ============================================================================
// DATA STRUCTURES
// ============================================================================
interface Competitor { name: string; description: string; threatLevel: 'High' | 'Medium' | 'Low'; }
interface Result {
  viabilityScore: number; marketDemand: number; marketSizeScore: number; competitionScore: number;
  feasibilityScore: number; revenueScore: number; timingScore: number; competitors: Competitor[];
  risks: string[]; opportunities: string[]; advisorSummary: string; biggestInsight: string; nextSteps: string[];
  verdict: string;
  finalScore?: number;
  radarData: { subject: string; score: number; fullMark: number }[];
  scores: {
    problemStrength?: number;
    marketDemand?: number;
    competition?: number;
    feasibility?: number;
    innovation?: number;
    opportunityGap?: number;
  };
  scoreReasonings: {
    problemStrength?: string;
    marketDemand?: string;
    competition?: string;
    feasibility?: string;
    innovation?: string;
    opportunityGap?: string;
  };
  killerQuestion?: string;
  marketSignals?: string[];
  timingAssessment?: string;
  earlyAdopterProfile?: string;
  viralityPotential?: string;
  behaviorChange?: string;
  moatOpportunity?: string;
  tam?: string | number | any;
  sam?: string | number | any;
  som?: string | number | any;
  revenueYear1?: string;
  revenueYear3?: string;
  revenueYear5?: string;
  estimatedCAC?: string;
  estimatedLTV?: string;
  ltvCacRatio?: string;
  growthProjection?: { year: string; value: number }[];
  unitEconomicsViable?: boolean;
  deliveryEconomicsWarning?: string;
  // Snake-case score fields from Supabase deep-merge (process-queue flattenedScores)
  problem_score?: number;
  market_score?: number;
  risk_score?: number;
  feasibility_score?: number;
  innovation_score?: number;
  opportunity_score?: number;
}

const FLOW_STEPS = [
  {
    q: 'Who is your target customer?', sub: 'This helps us calibrate market sizing and competitive intensity.',
    title: 'Audience', opts: [
      { icon: '🎓', label: 'Students & Young Adults', sub: 'Age 16–25, digital natives' },
      { icon: '💼', label: 'Working Professionals', sub: 'Age 25–45, career-focused' },
      { icon: '🏪', label: 'Small Businesses', sub: 'SMBs, local shops & services' },
      { icon: '🏢', label: 'Enterprises', sub: 'Large companies, 500+ employees' },
    ],
  },
  {
    q: 'Where is your primary market?', sub: 'Market context shapes our demand signals and competitor discovery.',
    title: 'Market', opts: [
      { icon: '🏙️', label: 'India — Tier 1', sub: 'Mumbai, Delhi, Bangalore' },
      { icon: '🌆', label: 'India — Tier 2 & 3', sub: 'Emerging cities, rising demand' },
      { icon: '🌏', label: 'Southeast Asia', sub: 'SG, ID, MY, PH markets' },
      { icon: '🌍', label: 'Global / USA', sub: 'International scale' },
    ],
  },
  {
    q: 'How will you make money?', sub: 'This shapes our revenue benchmark and competitive pricing analysis.',
    title: 'Model', opts: [
      { icon: '📺', label: 'Free with Ads', sub: 'Ad-supported, volume-driven' },
      { icon: '💳', label: 'Subscription', sub: 'Monthly or annual SaaS model' },
      { icon: '⚡', label: 'Pay per Use', sub: 'Usage-based, transactional pricing' },
      { icon: '🤝', label: 'Marketplace', sub: 'Commission on transactions' },
    ],
  },
  {
    q: 'Where is your idea right now?', sub: 'This helps us tailor the depth and focus of your analysis.',
    title: 'Stage', opts: [
      { icon: '💡', label: 'Just an idea', sub: 'Still in concept phase' },
      { icon: '🔍', label: 'Researching', sub: 'Validating before building' },
      { icon: '🛠️', label: 'Building MVP', sub: 'Already in development' },
      { icon: '🚀', label: 'Launched', sub: 'Live with early users' },
    ],
  }
];

const RAIL_NODES = ['Audience', 'Market', 'Model', 'Stage', 'Report'];
const AGENT_STEPS = [
  'Problem Clarifier', 'Research Agent', 'Competitor Detector', 'Market Analyst',
  'Pain Evaluator', 'Startup Scorer', 'Critic Agent', 'Report Generator'
];

// ============================================================================
// COMPONENTS
// ============================================================================
function Counter({ to, ms = 1800, startOnVisible = false }: { to: number; ms?: number; startOnVisible?: boolean }) {
  const [n, setN] = useState(0);
  const [started, setStarted] = useState(!startOnVisible);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!startOnVisible) return;
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStarted(true); ob.disconnect(); } }, { threshold: 0.1 });
    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, [startOnVisible]);

  useEffect(() => {
    if (!started) return;
    let v = 0;
    const d = to / (ms / 16);
    const t = setInterval(() => {
      v += d;
      if (v >= to) { setN(to); clearInterval(t); } else setN(Math.floor(v));
    }, 16);
    return () => clearInterval(t);
  }, [to, ms, started]);
  return <span ref={ref}>{n.toLocaleString()}</span>;
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
export default function Home() {
  const [phase, setPhase] = useState<'hero' | 'onboard' | 'loading' | 'report' | 'whitepaper' | 'queued'>('hero');
  const [queueData, setQueueData] = useState<{
    queue_id: string;
    estimated_ready_at: string;
    estimated_wait_minutes: number;
    email: string;
  } | null>(null);
  const [queueProgress, setQueueProgress] = useState<number>(0);
  const [rateLimitResumeAt, setRateLimitResumeAt] = useState<string | null>(null);
  const [rateLimitCountdown, setRateLimitCountdown] = useState<number>(0);
  const [rateLimitAgent, setRateLimitAgent] = useState<number | null>(null);
  const [idea, setIdea] = useState('');
  const [step, setStep] = useState(0); 
  const [answers, setAnswers] = useState<string[][]>([[], [], [], []]);
  const [customAnswers, setCustomAnswers] = useState<string[]>(['', '', '', '']);
  const [otpStep, setOtpStep] = useState<'email' | 'otp'>('email');
  const [otpVars, setOtpVars] = useState(['', '', '', '', '', '']);
  const [otpErr, setOtpErr] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [err, setErr] = useState('');
  const [loadIdx, setLoadIdx] = useState(0);
  const [loadPct, setLoadPct] = useState(0);
  const [copied, setCopied] = useState(false);
  const [animClass, setAnimClass] = useState('trans-wrapper slide-in');
  const [isFocused, setIsFocused] = useState(false); 
  const [activeDropdown, setActiveDropdown] = useState<'how-it-works' | 'features' | 'pricing' | null>(null);
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);
  const [expandedFactors, setExpandedFactors] = useState<Set<string>>(new Set());
  const [currentUser, setCurrentUser] = useState<{name: string, email: string} | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  const { isDark, toggleTheme } = useTheme();
  const heroInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let t: NodeJS.Timeout;
    if (resendTimer > 0) t = setTimeout(() => setResendTimer(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  useEffect(() => {
    const verifiedEmail = localStorage.getItem('founderos_verified_email');
    if (verifiedEmail) {
      setCurrentUser({ name: 'Founder', email: verifiedEmail });
      fetch(`/api/history?email=${encodeURIComponent(verifiedEmail)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.history) {
            setAnalysisHistory(data.history);
          }
        })
        .catch(console.error);
    }

    const pendingQueue = localStorage.getItem('founderos_pending_queue');
    if (pendingQueue) {
      try {
        const q = JSON.parse(pendingQueue);
        setQueueData(q);
        setPhase('queued');
      } catch (e) {
        localStorage.removeItem('founderos_pending_queue');
      }
    }
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.nav-dropdown') && !target.closest('.nav-links') && activeDropdown) setActiveDropdown(null);
      if (isProfileOpen && !target.closest('.profile-overlay') && !target.closest('.avatar-trigger')) setIsProfileOpen(false);
      if (isSidebarOpen && !target.closest('.sidebar-wrap') && !target.closest('.hamburger-trigger')) setIsSidebarOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setActiveDropdown(null); setActiveModal(null); setIsProfileOpen(false); setIsSidebarOpen(false); }
    };
    const handleScroll = () => { if (activeDropdown) setActiveDropdown(null); if (isProfileOpen) setIsProfileOpen(false); };

    if (activeDropdown || activeModal || isProfileOpen || isSidebarOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
      if (activeDropdown) window.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [activeDropdown, activeModal]);

  useEffect(() => {
    if (phase !== 'hero') return;
    const ob = new IntersectionObserver(e => e.forEach(en => { if (en.isIntersecting) { en.target.classList.add('visible'); ob.unobserve(en.target); } }), { threshold: 0.1 });
    document.querySelectorAll('.fade-up, .fade-left, .fade-right').forEach(el => ob.observe(el));
    return () => ob.disconnect();
  }, [phase]);

  useEffect(() => {
    if (phase !== 'queued' || !queueData) return;

    const checkStatus = async () => {
      try {
        // Poll check-queue for exact progress and result
        const res = await fetch(`/api/check-queue?queue_id=${queueData.queue_id}`);
        const data = await res.json();
        
        if (data.progress) {
          setQueueProgress(data.progress);
        }

        // ── Rate-limited: set countdown target ──
        if (data.status === 'rate_limited') {
          setRateLimitResumeAt(data.resume_at || null);
          setRateLimitAgent(data.rate_limit_agent ?? null);
          return; // don't check for completion while paused
        }

        // ── Cleared from rate limit ──
        if (rateLimitResumeAt && data.status !== 'rate_limited') {
          setRateLimitResumeAt(null);
          setRateLimitCountdown(0);
          setRateLimitAgent(null);
        }

        if (data.status === 'completed' && data.result) {
          localStorage.removeItem('founderos_pending_queue');
          setRateLimitResumeAt(null);
          setRateLimitCountdown(0);
          setRateLimitAgent(null);
          const ad = data.result;
          setResult({
            ...ad,
            verdict: ad.verdict || ad.advisorSummary || "Forensic analysis complete.",
            biggestInsight: ad.biggestInsight || "No hidden pattern detected.",
            radarData: Array.isArray(ad.radarData) ? ad.radarData : [],
            risks: Array.isArray(ad.risks) ? ad.risks : [],
            opportunities: Array.isArray(ad.opportunities) ? ad.opportunities : [],
            scores: ad.scores || {},
            scoreReasonings: ad.scoreReasonings || {},
            finalScore: ad.viabilityScore
          });
          setPhase('report');
          window.scrollTo(0,0);
        }
      } catch (e) { 
        console.error('Queue status check failed:', e); 
      }
    };

    checkStatus();
    const heartbeat = setInterval(checkStatus, 3000);
    return () => clearInterval(heartbeat);
  }, [phase, queueData, rateLimitResumeAt]);

  // ── Countdown timer for rate-limit pause ──
  useEffect(() => {
    if (!rateLimitResumeAt) {
      setRateLimitCountdown(0);
      return;
    }
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((new Date(rateLimitResumeAt).getTime() - Date.now()) / 1000));
      setRateLimitCountdown(remaining);
      if (remaining <= 0) {
        setRateLimitResumeAt(null);
        setRateLimitAgent(null);
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [rateLimitResumeAt]);

  useEffect(() => {
    if (phase !== 'loading') return;
    let isActive = true;
    const runAgents = async () => {
      for (let i = 0; i <= AGENT_STEPS.length; i++) {
        if (!isActive) break;
        setLoadIdx(i);
        setLoadPct(Math.floor((i / AGENT_STEPS.length) * 100));
        if (i < AGENT_STEPS.length) {
          const delay = Math.floor(Math.random() * (2500 - 1200 + 1) + 1200);
          await new Promise(r => setTimeout(r, delay));
        }
      }
    };
    runAgents();
    return () => { isActive = false; };
  }, [phase]);

  useEffect(() => {
    if (phase === 'loading' && loadIdx === AGENT_STEPS.length && result) {
      const t = setTimeout(() => setPhase('report'), 600);
      return () => clearTimeout(t);
    }
  }, [phase, loadIdx, result]);

  const goAnalyze = () => {
    if (idea.trim().length < 20) { setErr('Please write at least 2–3 sentences about your idea.'); return; }
    setErr(''); setStep(0); setPhase('onboard'); setAnimClass('trans-wrapper slide-in'); window.scrollTo(0,0);
  };

  const pick = (label: string) => { 
    if (step >= 4) return; 
    const a = [...answers]; 
    if (a[step].includes(label)) {
      a[step] = a[step].filter(l => l !== label);
    } else {
      a[step] = [...a[step], label];
    }
    setAnswers(a); 
  };
  const setCustom = (text: string) => {
    if (step >= 4) return;
    const c = [...customAnswers];
    c[step] = text;
    setCustomAnswers(c);
  };
  const next = () => { 
    if (step < 4 && (answers[step].length === 0 && !customAnswers[step].trim())) return; 

    setAnimClass('trans-wrapper exiting'); 
    setTimeout(() => { 
      if (step === 3 && currentUser) {
        // Authenticated user bypasses the email capture step
        setStep(4); // still set to 4 internally for tracking, but we trigger submit
        submit(); 
      } else if (step < 4) { 
        setStep(step + 1); 
        setAnimClass('trans-wrapper slide-in'); 
      } 
    }, 180); 
  };
  const back = () => { setAnimClass('trans-wrapper exiting'); setTimeout(() => { if (step > 0) { setStep(step - 1); setAnimClass('trans-wrapper slide-in'); } else setPhase('hero'); }, 180); };

  const submit = async () => {
    const finalName = currentUser?.name || name.trim();
    const finalEmail = currentUser?.email || email.trim();
    
    if (!finalName || !finalEmail) return;
    
    setPhase('loading'); window.scrollTo(0,0); setLoadIdx(0); setLoadPct(0);
    try {
      const clean = idea.trim().replace(/^["']|["']$/g, '');
      const lr = await fetch('/api/capture-lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: finalName, email: finalEmail, idea: clean }) });
      const ld = await lr.json();
      const leadId = ld.success && ld.id ? ld.id : null;
      
      const payloadAnswers = answers.map((arr, i) => {
        let combined = arr.join(' + ');
        if (customAnswers[i].trim()) {
           combined += (combined ? ' + ' : '') + customAnswers[i].trim();
        }
        return combined;
      });

      const ar = await fetch('/api/analyze', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          idea: clean, 
          customerSegment: payloadAnswers[0], 
          targetMarket: payloadAnswers[1], 
          businessModel: payloadAnswers[2], 
          founderStage: payloadAnswers[3],
          leadId: leadId,
          email: finalEmail
        }) 
      });
      
      const ad = await ar.json();
      
      if (ar.status === 202 && ad.queued) {
        setQueueData({
          queue_id: ad.queue_id,
          estimated_ready_at: ad.estimated_ready_at,
          estimated_wait_minutes: ad.estimated_wait_minutes,
          email: finalEmail
        });
        localStorage.setItem('founderos_pending_queue', JSON.stringify({
          queue_id: ad.queue_id,
          estimated_ready_at: ad.estimated_ready_at,
          estimated_wait_minutes: ad.estimated_wait_minutes,
          email: finalEmail
        }));
        setPhase('queued');
        return;
      }
      
      if (!ar.ok) {
        throw new Error(ad.error || ad.message || 'Failed to analyze idea. The server might have timed out.');
      }
      
      setResult({
        ...ad,
        verdict: ad.verdict || ad.advisorSummary || "Forensic analysis complete.",
        biggestInsight: ad.biggestInsight || "No hidden pattern detected.",
        radarData: Array.isArray(ad.radarData) ? ad.radarData : [],
        risks: Array.isArray(ad.risks) ? ad.risks : [],
        opportunities: Array.isArray(ad.opportunities) ? ad.opportunities : [],
        scores: ad.scores || {},
        scoreReasonings: ad.scoreReasonings || {},
        idea: clean,
        finalScore: ad.viabilityScore
      });
      
      if (leadId && ad.viabilityScore) {
         fetch('/api/update-lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: leadId, score: ad.viabilityScore, reportData: {...ad, idea: clean, finalScore: ad.viabilityScore} }) }).catch(e => console.error(e));
      }

      if (!currentUser) {
        localStorage.setItem('founderos_verified_email', finalEmail);
        setCurrentUser({ name: finalName, email: finalEmail });
      }

      setPhase('report');
      
      const newHistory = [{ idea: clean, vs: ad.viabilityScore, date: new Date().toLocaleDateString() }, ...analysisHistory].slice(0, 10);
      setAnalysisHistory(newHistory);
      localStorage.setItem('founderos_history', JSON.stringify(newHistory));

    } catch (e: any) { setErr(e.message || 'Something went wrong. Please try again.'); setPhase('hero'); }
  };

  const sendOtp = async () => {
    if (!email || !email.includes('@')) { setOtpErr('Please enter a valid email.'); return; }
    setOtpErr('');
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      if (!res.ok) throw new Error('Failed to send verification code.');
      setOtpStep('otp');
      setResendTimer(30);
    } catch (err: any) {
      setOtpErr(err.message || 'Error sending code.');
    }
  };

  const verifyOtp = async () => {
    const code = otpVars.join('');
    if (code.length < 6) return;
    setOtpErr('');
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: code })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid code.');
      // Success
      localStorage.setItem('founderos_verified_email', email.trim());
      setCurrentUser({ name: name.trim() || 'Founder', email: email.trim() });
      
      if (phase === 'onboard') {
        submit();
      } else {
        setIsAuthModalOpen(false);
        // Reset steps for next time
        setOtpStep('email');
        setOtpVars(['', '', '', '', '', '']);
      }
    } catch (err: any) {
      setOtpErr(err.message || 'Invalid verification code.');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;
    const newOtp = [...otpVars];
    newOtp[index] = value.slice(-1);
    setOtpVars(newOtp);
    
    const prefix = document.getElementById(`otp-modal-${index}`) ? 'otp-modal-' : 'otp-';
    
    if (value && index < 5) {
      const nextInput = document.getElementById(`${prefix}${index + 1}`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
    if (!value && index > 0) {
      const prevInput = document.getElementById(`${prefix}${index - 1}`) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  };

  const loadHistoryItem = (item: any) => {
    if (item.report_data) {
      setIdea(item.idea);
      setResult(item.report_data);
      setPhase('report');
      setIsSidebarOpen(false);
      window.scrollTo(0,0);
    }
  };

  const signOut = () => {
    localStorage.removeItem('founderos_verified_email');
    setCurrentUser(null);
    setAnalysisHistory([]);
    setIsSidebarOpen(false);
    reset();
  };

  const reset = () => { setPhase('hero'); setIdea(''); setStep(0); setAnswers([[],[],[],[]]); setCustomAnswers(['','','','']); setName(''); setEmail(''); setOtpStep('email'); setOtpVars(['','','','','','']); setOtpErr(''); setResult(null); setErr(''); window.scrollTo(0,0); };
  const share = () => { if (result) window.open(`https://wa.me/?text=${encodeURIComponent(`I just validated my startup idea on FounderOS!\n\n💡 ${idea}\n📊 Score: ${result.viabilityScore}/100\n\n${result.advisorSummary}\n\nTry free: founderos.vercel.app`)}`, '_blank'); };
   const copyReport = () => { if (!result) return; navigator.clipboard.writeText(`FOUNDEROS REPORT\n\nIdea: ${idea}\nScore: ${result.viabilityScore}/100\n\nVERDICT: ${result.verdict || result.advisorSummary}\n\nINSIGHT: ${result.biggestInsight}\n\nKILLER QUESTION: ${result.killerQuestion || 'N/A'}\n\nRISKS:\n${(result.risks || []).map((r,i)=>`${i+1}. ${r}`).join('\n')}\n\nNEXT STEPS:\n${result.nextSteps.map((s,i)=>`${i+1}. ${s}`).join('\n')}`); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const downloadPDF = async () => {
    const reportEl = document.getElementById('founderos-report');
    if (!reportEl) return;
    const actionBar = document.getElementById('founderos-action-bar');
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      
      // Hide action bar during capture
      if (actionBar) actionBar.style.display = 'none';
      
      const canvas = await html2canvas(reportEl, {
        backgroundColor: 'var(--text-inverse)',
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 1200,
      });
      
      if (actionBar) actionBar.style.display = 'flex';
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const fileName = `FounderOS_Report_${idea.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('PDF generation failed:', err);
      if (actionBar) actionBar.style.display = 'flex';
      alert('High-fidelity PDF generation failed. Falling back to browser print.');
      window.print();
    }
  };

  return (
    <>
      <div className="sys-bg" />
      <div className="shell">

        {/* PERSISTENT TOPBAR (Gemini Style) */}
        <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 110, background: 'var(--nav-bg)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <button 
                className="hamburger-trigger"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px', padding: '10px' }}
              >
                <div style={{ width: '18px', height: '2px', background: 'var(--text-primary)', borderRadius: '10px' }} />
                <div style={{ width: '18px', height: '2px', background: 'var(--text-primary)', borderRadius: '10px' }} />
                <div style={{ width: '18px', height: '2px', background: 'var(--text-primary)', borderRadius: '10px' }} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setPhase('hero')}>
                <span style={{ width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%' }} />
                <span style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>FounderOS</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '32px' }} className="sm-hidden nav-links">
              {phase === 'hero' && [
                { id: 'how-it-works', lbl: 'How it works' },
                { id: 'features', lbl: 'Features' },
                { id: 'about', lbl: 'About' },
                { id: 'pricing', lbl: 'Pricing' }
              ].map(x => (
                x.id === 'about' ? (
                  <a href="#about" key={x.id}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveDropdown(null);
                      const el = document.getElementById('about');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'color 150ms ease' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  >About</a>
                ) : (
                  <a href="#" key={x.id}
                    onClick={e => {
                      e.preventDefault();
                      if (window.innerWidth < 768) {
                        const el = document.getElementById(x.id);
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                        return;
                      }
                      setActiveDropdown(activeDropdown === x.id ? null : x.id as any);
                    }}
                    style={{ fontSize: '14px', color: activeDropdown === x.id ? 'var(--accent)' : 'var(--text-secondary)', transition: 'color 150ms' }}
                    onMouseOver={e => { if (activeDropdown !== x.id) e.currentTarget.style.color='var(--text-primary)'}}
                    onMouseOut={e => { if (activeDropdown !== x.id) e.currentTarget.style.color='var(--text-secondary)'}}
                  >
                    {x.lbl}
                  </a>
                )
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                title="Toggle theme"
                style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, transition: 'all 150ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-dim)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
              >{isDark ? '🌙' : '☀️'}</button>

              {currentUser ? (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button 
                    onClick={() => { setPhase('hero'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '14px', cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                  >Dashboard</button>
                  <button 
                    onClick={signOut}
                    className="btn-primary" 
                    style={{ padding: '8px 20px', fontSize: '13px', background: 'rgba(255,107,107,0.1)', color: '#FF6B6B', border: '1px solid rgba(255,107,107,0.2)' }}
                  >Sign Out</button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button 
                    onClick={() => { setAuthModalMode('signin'); setOtpStep('email'); setIsAuthModalOpen(true); }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '14px', cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                  >Sign In</button>
                  <button 
                    onClick={() => { setAuthModalMode('signup'); setOtpStep('email'); setIsAuthModalOpen(true); }}
                    className="btn-primary" 
                    style={{ padding: '8px 20px', fontSize: '13px' }}
                  >Sign Up</button>
                </div>
              )}

              <button 
                className="avatar-trigger"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                style={{ 
                  width: '36px', height: '36px', borderRadius: '50%', 
                  background: currentUser ? 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)' : 'var(--bg-elevated)', 
                  border: '1px solid var(--border-default)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  color: currentUser ? 'var(--text-inverse)' : 'var(--text-secondary)', fontWeight: 700, fontSize: '13px', transition: 'all 0.2s' 
                }}
              >
                {currentUser ? currentUser.name.charAt(0).toUpperCase() : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                )}
              </button>
            </div>
          </div>

          <div className={`nav-dropdown ${activeDropdown ? 'open' : ''}`}>
              <div className="dropdown-inner">
                <button className="dropdown-close" onClick={() => setActiveDropdown(null)}>×</button>

                {activeDropdown === 'how-it-works' && (
                  <div style={{ display: 'flex', gap: '56px', alignItems: 'flex-start' }}>
                    <div style={{ flex: '0 0 40%' }}>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent)', marginBottom: '10px' }}>HOW IT WORKS</div>
                      <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: '1.2', marginBottom: '12px' }}>From idea to insight in 60 seconds.</h3>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '24px', maxWidth: '400px' }}>
                        FounderOS runs a multi-agent AI pipeline — 8 specialized agents working in sequence, each focused on one part of your startup evaluation.
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
                        {[
                          { n: '01', t: 'Describe your idea', d: 'Write 2–3 sentences about your startup concept.' },
                          { n: '02', t: 'Agents run in sequence', d: '8 specialized AI agents analyze your idea step by step.' },
                          { n: '03', t: 'Receive your scored report', d: 'Get a structured evaluation across 6 weighted factors.' },
                          { n: '04', t: 'Chat with your AI advisor', d: 'Ask follow-up questions in context of your results.' }
                        ].map(s => (
                          <div key={s.n} style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ background: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.18)', color: 'var(--accent)', fontSize: '11px', fontWeight: '600', borderRadius: '6px', padding: '2px 8px', flexShrink: 0, alignSelf: 'flex-start', marginTop: '2px' }}>{s.n}</div>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>{s.t}</div>
                              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{s.d}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <a href="#" onClick={(e) => { e.preventDefault(); setActiveDropdown(null); window.scrollTo({top: 0, behavior: 'smooth'}); setTimeout(() => heroInputRef.current?.focus(), 400); }} style={{ fontSize: '14px', color: 'var(--accent)', fontWeight: '500' }}>Start your analysis →</a>
                    </div>
                    <div style={{ flex: '0 0 60%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div className="img-wrap hiw-realistic-pulse" style={{ width: '100%', aspectRatio: '16/9', borderRadius: '8px' }}><img src="/images/hiw_step1.png" className="slot-img" alt="How it works" /></div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <div className="img-wrap hiw-realistic-scan" style={{ flex: 1, aspectRatio: '4/3', borderRadius: '8px' }}><img src="/images/hiw_step2.png" className="slot-img" alt="Step 2" /></div>
                        <div className="img-wrap hiw-realistic-depth" style={{ flex: 1, aspectRatio: '4/3', borderRadius: '8px' }}><img src="/images/hiw_step3.png" className="slot-img" alt="Step 3" /></div>
                      </div>
                    </div>
                  </div>
                )}

                {activeDropdown === 'features' && (
                  <div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent)', marginBottom: '6px' }}>FEATURES</div>
                    <h3 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '28px' }}>Everything you need to validate smarter.</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px' }}>
                      {[
                        { title: 'Multi-Agent Pipeline', desc: '8 specialized agents run in sequence to analyze every angle of your startup.', img: '/images/feat_pipeline.png', tags: ['8 Agents', 'Sequential'] },
                        { title: '6-Factor Scoring', desc: 'Weighted evaluation framework across market, feasibility, and innovation.', img: '/images/feat_scoring.png', tags: ['Weighted', 'Benchmarked'] },
                        { title: 'AI Advisor Chat', desc: 'Context-aware chat advisor that knows your full report and helps you pivot.', img: '/images/feat_chat.png', tags: ['Contextual', 'Grounded'] }
                      ].map(f => (
                        <div key={f.title}>
                          <div className="img-wrap" style={{ width: '100%', aspectRatio: '3/2', borderRadius: '8px', marginBottom: '16px' }}><img src={f.img} className="slot-img" alt={f.title} /></div>
                          <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>{f.title}</div>
                          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{f.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeDropdown === 'pricing' && (
                  <div style={{ display: 'flex', gap: '56px' }}>
                    <div style={{ flex: '0 0 30%' }}>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent)', marginBottom: '10px' }}>PRICING</div>
                      <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: '1.2', marginBottom: '12px' }}>Simple, transparent pricing.</h3>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>Start free. Upgrade when you need more analyses or team access.</p>
                    </div>
                    <div style={{ flex: '0 0 70%', display: 'flex', gap: '14px' }}>
                      {[
                        { name: 'Free', price: '$0', features: ['2 analyses/mo', 'Basic scoring'] },
                        { name: 'Pro', price: '$29', features: ['Unlimited analyses', 'Contextual AI Advisor'], popular: true },
                        { name: 'Teams', price: '$99', features: ['Shared library', 'White-label'] }
                      ].map(p => (
                        <div key={p.name} style={{ flex: 1, background: 'var(--bg-surface)', border: p.popular ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px' }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{p.name}</div>
                          <div style={{ fontSize: '30px', fontWeight: '700', color: 'var(--text-primary)' }}>{p.price}</div>
                          <div style={{ margin: '14px 0', borderTop: '1px solid var(--border-subtle)' }} />
                          {p.features.map(f => <div key={f} style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>• {f}</div>)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </nav>
        
        {/* SIDEBAR (Gemini Style) */}
        {/* SIDEBAR (Gemini Style) */}
        {showSettings && isSidebarOpen ? (
          <SettingsPanel onClose={() => setShowSettings(false)} />
        ) : (
        <div className={`sidebar-wrap ${isSidebarOpen ? 'open' : ''}`} style={{
          position: 'fixed',
          top: 0,
          left: isSidebarOpen ? 0 : '-280px',
          width: '280px',
          height: '100vh',
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)',
          zIndex: 120,
          transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 300ms ease, border-color 300ms ease',
          display: 'flex',
          flexDirection: 'column',
          padding: '80px 16px 24px',
        }}>
          <button 
            onClick={() => { setPhase('hero'); setIdea(''); setStep(0); setAnswers([[],[],[],[]]); setCustomAnswers(['','','','']); setResult(null); setIsSidebarOpen(false); }}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px', background: 'var(--bg-hover)', 
              border: '1px solid var(--border-default)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginBottom: '24px',
              transition: 'background-color 300ms ease, border-color 300ms ease, color 300ms ease',
            }}
          >
             <span style={{ fontSize: '20px' }}>+</span> New Analysis
          </button>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px', padding: '0 16px' }}>Recent History</div>
            {analysisHistory.length > 0 ? (
              analysisHistory.map((h, i) => (
                <button 
                  key={i}
                  onClick={() => loadHistoryItem(h)}
                  style={{ 
                    display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', 
                    color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer', borderRadius: '8px', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    transition: 'background-color 150ms ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  {h.idea}
                </button>
              ))
            ) : (
              <div style={{ padding: '0 16px', fontSize: '13px', color: 'var(--text-tertiary)' }}>No recent analyses</div>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              onClick={() => setShowSettings(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '14px', cursor: 'pointer', borderRadius: '8px', transition: 'all 150ms ease' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <span style={{ fontSize: '18px' }}>⚙</span> Settings & Help
            </button>
            {currentUser && (
              <button 
                onClick={signOut}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px', background: 'none', border: 'none', color: 'rgba(255, 68, 68, 0.8)', fontSize: '14px', cursor: 'pointer', borderRadius: '8px', transition: 'all 150ms ease' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 68, 68, 0.1)'; e.currentTarget.style.color = '#FF4444'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255, 68, 68, 0.8)'; }}
              >
                <span style={{ fontSize: '18px' }}>⏏</span> Sign Out
              </button>
            )}
          </div>
        </div>
        )}

        {/* PROFILE OVERLAY (Gemini Style) */}
        {isProfileOpen && (
          <div className="profile-overlay" style={{
            position: 'fixed',
            top: '72px',
            right: '24px',
            width: '360px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: '28px',
            padding: '24px',
            zIndex: 130,
            boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
            animation: 'fadeIn 0.2s ease',
          }}>
            {/* Header: Email & Close */}
            <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                {currentUser?.email || "guest@founderos.app"}
              </div>
              <button 
                onClick={() => setIsProfileOpen(false)}
                style={{ position: 'absolute', right: '-12px', top: '-12px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '20px', cursor: 'pointer', padding: '8px' }}
              >×</button>
            </div>

            {/* Profile Info */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ 
                  width: '80px', height: '80px', borderRadius: '50%', 
                  background: currentUser ? 'linear-gradient(135deg, #00E676 0%, #00C853 100%)' : 'rgba(255,255,255,0.05)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 800, 
                  color: currentUser ? 'var(--text-inverse)' : 'var(--text-secondary)', border: '4px solid rgba(255,255,255,0.05)' 
                }}>
                  {currentUser ? currentUser.name.charAt(0).toUpperCase() : "?"}
                </div>
                {/* Decorative Camera Icon overlay */}
                <div style={{ 
                  position: 'absolute', bottom: '0', right: '0', width: '26px', height: '26px', background: 'var(--bg-surface)', 
                  borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E6EDF3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                </div>
              </div>
              
              <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                {currentUser ? `Hi, ${currentUser.name.split(' ')[0]}!` : "Welcome, Guest!"}
              </h2>
              
              {currentUser ? (
                <button style={{ 
                  padding: '10px 24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)', 
                  background: 'none', color: 'var(--accent)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginTop: '4px' 
                }}>Manage your FounderOS Account</button>
              ) : (
                <button 
                  onClick={() => { setIsAuthModalOpen(true); setAuthModalMode('signin'); setIsProfileOpen(false); }}
                  className="btn-primary" 
                  style={{ padding: '10px 28px', borderRadius: '20px', fontSize: '14px', marginTop: '4px' }}
                >Sign In to FounderOS</button>
              )}
            </div>

            {/* Action Row */}
            <div style={{ display: 'flex', borderTop: '1px solid var(--border-subtle)', overflow: 'hidden', borderRadius: '0 0 12px 12px' }}>
              <button 
                onClick={() => { setIsAuthModalOpen(true); setAuthModalMode('signup'); setIsProfileOpen(false); }}
                style={{ 
                  flex: 1, padding: '16px', border: 'none', borderRight: '1px solid rgba(255,255,255,0.08)', 
                  background: 'none', color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' 
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <span style={{ fontSize: '16px' }}>+</span> Add account
              </button>
              <button 
                onClick={() => { if(currentUser) {setCurrentUser(null); localStorage.removeItem('founderos_user');} else {setIsAuthModalOpen(true); setAuthModalMode('signin');} setIsProfileOpen(false); }}
                style={{ 
                  flex: 1, padding: '16px', border: 'none', background: 'none', 
                  color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' 
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                {currentUser ? "Sign out" : "Sign in"}
              </button>
            </div>

            {/* Footer Links */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '20px' }}>
              <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
              <span>•</span>
              <span style={{ cursor: 'pointer' }}>Terms of Service</span>
            </div>
          </div>
        )}

        {/* HERO PHASE */}
        {phase === 'hero' && (
          <>
            <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingTop: '100px' }}>
              <div className="img-wrap" style={{ position: 'absolute', inset: 0, opacity: 0.15, border: 'none' }}><img src="/images/hero_1.png" className="slot-img" alt="Background" /></div>
              <div style={{ position: 'relative', zIndex: 2, maxWidth: '820px', padding: '0 24px' }} className="fade-up">
                <div style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-default)', borderRadius: '999px', padding: '5px 16px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', marginBottom: '32px', gap: '6px' }}>✦ 12,400+ startup ideas validated</div>
                <h1 className="h1-hero">Know if your idea will <span className="h1-accent">succeed</span> before you build it.</h1>
                <div style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--accent)', marginTop: '20px' }}>BEYOND RESEARCH. BEYOND GUESSWORK.</div>
                <p className="body-text" style={{ maxWidth: '500px', margin: '24px auto 40px' }}>Get a full market analysis, competitor map, risk assessment, and personalized action plan in under 60 seconds.</p>
                
                <div style={{ maxWidth: '700px', margin: '0 auto', background: 'var(--bg-surface)', border: isFocused ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.09)', borderRadius: '14px', padding: '24px', textAlign: 'left', transition: 'all 0.2s' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '12px' }}>DESCRIBE YOUR STARTUP IDEA</div>
                  <textarea ref={heroInputRef} value={idea} onChange={e => setIdea(e.target.value)} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} placeholder="An AI platform that helps founders validate their ideas..." style={{ width: '100%', background: 'transparent', border: 'none', resize: 'none', minHeight: '80px', fontSize: '15px', color: 'var(--text-primary)', outline: 'none' }} />
                  <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.08)', margin: '16px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>{['SaaS', 'Fintech', 'AI Ed'].map(t => <span key={t} style={{ fontSize: '11px', color: 'var(--text-tertiary)', background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: '6px' }}>{t}</span>)}</div>
                    <button className="btn-primary" onClick={goAnalyze}>Analyze My Idea →</button>
                  </div>
                  {err && <div style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '12px' }}>{err}</div>}
                </div>
              </div>
            </section>
            
            <section id="features" className="section">
              <div className="container" style={{ textAlign: 'center' }}>
                <span className="cat-label">PIPELINE</span>
                <h2 className="h2-section">8 Agents. Unified Analysis.</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '48px' }}>
                  {AGENT_STEPS.map((s, i) => (
                    <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '24px', textAlign: 'left' }}>
                      <div style={{ fontSize: '12px', color: 'var(--accent)', marginBottom: '8px' }}>0{i+1}</div>
                      <div style={{ fontSize: '15px', fontWeight: '600' }}>{s}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ═══════ ABOUT SECTION ═══════ */}
            <section id="about" style={{ background: 'var(--bg-base)', padding: '100px 0', width: '100%' }}>
              <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 40px' }}>

                {/* ABOUT SPLIT 1 — image left, text right */}
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '72px', marginBottom: '100px', flexWrap: 'wrap' }}>
                  <div className="radar-anim" style={{ flex: 1, minWidth: '280px', aspectRatio: '4/3', borderRadius: '12px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src="/images/research_1.png" alt="AI Research Radar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px', display: 'block' }} />
                  </div>
                  {/* Text right */}
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <p style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '10px', fontFamily: 'Inter, sans-serif' }}>WHAT WE DO</p>
                    <h2 style={{ fontSize: '48px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: '18px', fontFamily: 'Inter, sans-serif' }}>Not just AI.<br />A research team.</h2>
                    <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: '28px', fontFamily: 'Inter, sans-serif' }}>Most AI tools give you generic advice from a single prompt. FounderOS runs a multi-agent pipeline — 8 specialized AI agents working in sequence, each laser-focused on one part of your evaluation. The result is structured, scored, and specific to your idea.</p>
                    {['Problem-to-framework structured analysis', '6-factor weighted scoring system', 'Critic agent simulating investor skepticism', 'Contextual AI advisor after your report'].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: '8px' }} />
                        <span style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ABOUT SPLIT 2 — text left, image right */}
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '72px', marginBottom: '100px', flexWrap: 'wrap', background: 'var(--bg-surface)', borderRadius: '20px', padding: '60px 48px' }}>
                  {/* Text left */}
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <p style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '10px', fontFamily: 'Inter, sans-serif' }}>THE PROBLEM WE SOLVE</p>
                    <h2 style={{ fontSize: '48px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: '18px', fontFamily: 'Inter, sans-serif' }}>Most startups fail<br />before they start.</h2>
                    <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: '32px', fontFamily: 'Inter, sans-serif' }}>42% of startups fail because they built something nobody wanted. Not because the founder was not capable — but because the idea was never properly validated. FounderOS automates the research process that used to take days of manual work.</p>
                    <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                      {[
                        { num: '42%', label: 'of startups fail — no market need' },
                        { num: '8', label: 'specialized AI agents in sequence' },
                        { num: '60s', label: 'average time to full report' },
                      ].map((stat, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingRight: i < 2 ? '32px' : '0', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                          <span style={{ fontSize: '36px', fontWeight: 700, color: 'var(--accent)', lineHeight: 1, fontFamily: 'Inter, sans-serif' }}>{stat.num}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '120px', lineHeight: 1.4, fontFamily: 'Inter, sans-serif' }}>{stat.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="clarity-anim" style={{ flex: 1, minWidth: '280px', aspectRatio: '4/3', borderRadius: '12px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src="/images/problem_2.png" alt="Startup Clarity Bolt" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px', display: 'block' }} />
                  </div>
                </div>

                {/* ABOUT SPLIT 3 — image left, text right */}
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '72px', flexWrap: 'wrap' }}>
                  <div className="video-anim" style={{ flex: 1, minWidth: '280px', aspectRatio: '4/3', borderRadius: '12px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src="/images/report_4.png" alt="Premium Report Badge" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px', display: 'block' }} />
                  </div>
                  {/* Text right */}
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <p style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '10px', fontFamily: 'Inter, sans-serif' }}>YOUR REPORT</p>
                    <h2 style={{ fontSize: '48px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: '18px', fontFamily: 'Inter, sans-serif' }}>Scored. Structured.<br />Specific.</h2>
                    <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: '24px', fontFamily: 'Inter, sans-serif' }}>Your report is a structured evaluation across 6 weighted factors — each scored, explained, and benchmarked against market data. Plus an AI advisor that knows your full results and answers follow-up questions in context.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
                      {['Problem Strength', 'Market Demand', 'Competition Level', 'Feasibility', 'Innovation Score', 'Opportunity Gap'].map((factor, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                          <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif' }}>{factor}</span>
                        </div>
                      ))}
                      </div>
                      <a href="#" onClick={(e) => { e.preventDefault(); setPhase('whitepaper'); setActiveDropdown(null); window.scrollTo(0, 0); }} style={{ display: 'inline-block', marginTop: '24px', fontSize: '14px', fontWeight: 500, color: 'var(--accent)', textDecoration: 'none', fontFamily: 'Inter, sans-serif' }} onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')} onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}>See how scoring works →</a>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

        {/* ═══════ SCORING WHITEPAPER PHASE ═══════ */}
        {phase === 'whitepaper' && (
          <div className="whitepaper-overlay">
            <div style={{ position: 'fixed', top: '32px', right: '40px', zIndex: 300 }}>
              <button 
                onClick={() => setPhase('hero')} 
                style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-default)', color: 'white', padding: '12px 24px', borderRadius: '999px', fontSize: '14px', fontWeight: 600, backdropFilter: 'blur(10px)', transition: 'all 0.2s' }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseOut={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              >Close Guide</button>
            </div>

            <div className="whitepaper-content">
              <section className="whitepaper-section visible">
                <span className="whitepaper-num">01 / Introduction</span>
                <h2 className="whitepaper-h2">The Brutally Calibrated<br />Startup Brain.</h2>
                <div className="whitepaper-p">
                  FounderOS does not use generic AI prompts or simple sentiment analysis to score your startup. Instead, it employs a sophisticated, <span className="whitepaper-highlight">multi-agent pipeline</span> modeled after the evaluation processes used by Tier-1 Venture Capital firms. Most AI tools are designed to be "polite," often giving inflated scores to please the user; FounderOS is engineered for <span className="whitepaper-highlight">Brutal Calibration</span>. We have analyzed over 50,000 startup failures to identify the exact signals that precede a crash. This guide explains every gear, every mathematical modifier, and every agentic role that transforms your vague concept into a structured, weighted viability report.
                </div>
              </section>

              <section className="whitepaper-section visible">
                <span className="whitepaper-num">02 / The Weighting Formula</span>
                <h2 className="whitepaper-h2">The 100-Point Architecture.</h2>
                <div className="whitepaper-p">
                  Your final score is not a single number, but a <span className="whitepaper-highlight">Weighted Aggregate</span> of six primary dimensions. Each dimension carries a specific percentage of influence based on its statistical correlation with long-term startup survival. The heavy hitters are Problem Strength (25%) and Market Demand (20%), together representing 45% of your score. Competitive Intensity (20%) and Feasibility (15%) ensure the path is clear and traversable, while Innovation (10%) and Opportunity Gap (10%) provide the necessary differentiation for exponential growth. We enforce strict "Score Ceilings"—for instance, a perfect 100 is mathematically impossible, as every startup has inherent risk. No score ends in a "round" number like 5 or 0, preventing generic estimations and forcing high-precision calibration.
                </div>
                
                <div className="comparison-box" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                  {[
                    { f: 'Problem Strength', w: '25%' },
                    { f: 'Market Demand', w: '20%' },
                    { f: 'Competition', w: '20%' },
                    { f: 'Feasibility', w: '15%' },
                    { f: 'Innovation Score', w: '10%' },
                    { f: 'Opportunity Gap', w: '10%' }
                  ].map(x => (
                    <div key={x.f} style={{ padding: '24px', background: 'var(--bg-hover)', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--accent)', marginBottom: '8px' }}>{x.w}</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{x.f}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="whitepaper-section visible">
                <span className="whitepaper-num">03 / Factor Deep-Dives</span>
                
                <div style={{ marginBottom: '80px' }}>
                  <h3 style={{ fontSize: '32px', color: 'var(--accent)', marginBottom: '24px' }}>03.1 Problem Strength (25%)</h3>
                  <div className="whitepaper-p">
                    The foundation of any venture is the gravity of the problem it addresses. Agent 1, the <span className="whitepaper-highlight">Problem Clarifier</span>, dissects the stated idea into a specific user-pain-consequence chain. It evaluates frequency—a problem encountered daily (like meal logistics) carries significantly more weight than one encountered seasonally. It also assesses "Willingness to Pay" (WTP) by identifying existing workarounds; if users are already spending significant time or money on inefficient solutions, the problem score rises. Conversely, "Vitamin" solutions (nice-to-have features) are penalized relative to "Painkillers" (must-have utilities). In the Indian context, Tier 2 and Tier 3 markets have unique friction points like digital trust and infrastructure gaps that our agents specifically calibrate for. A score of 85+ is reserved for life-or-death, major financial loss, or daily operational blockers. The agent never gives a perfect score, acknowledging that even the worst pains have some level of user adaptation or apathy.
                  </div>
                </div>

                <div style={{ marginBottom: '80px' }}>
                  <h3 style={{ fontSize: '32px', color: 'var(--accent)', marginBottom: '24px' }}>03.2 Market Demand (20%)</h3>
                  <div className="whitepaper-p">
                    Market Demand evaluates the <span className="whitepaper-highlight">External Velocity</span> of the world around your idea. It utilizes Agent 2 (Research) and Agent 4 (Analyst) to harvest "Market Signals"—specific evidence that users are actively seeking your solution. This includes search trends, recent policy shifts, and behavioral changes in the target segment. A critical component is the "Timing Assessment," which identifies why the idea hasn't succeeded before and what has changed in the last 24 months to enable it now. We use a bottom-up calculation for TAM, SAM, and SOM, rather than generic top-down industry reports. For Indian Tier 2/3 markets, we apply realistic penetration rates (2-5% in year one) and lower ARPU benchmarks, ensuring the demand score is tethered to economic reality. High scores in this category require clear evidence of "Product-Market Pull," where users are pulling the solution out of the founder's hands.
                  </div>
                </div>

                <div style={{ marginBottom: '80px' }}>
                  <h3 style={{ fontSize: '32px', color: 'var(--accent)', marginBottom: '24px' }}>03.3 Competition Level (20%) — The Inverse Rule</h3>
                  <div className="whitepaper-p">
                    Competition follows an <span className="whitepaper-highlight">Inverse Scoring Mechanic</span>. A high Competition Score (e.g., 75) indicates LOW competition and a massive opportunity gap. Conversely, a low score (e.g., 15) indicates a "Red Ocean" saturated with well-funded incumbents. Agent 3 (Detector) maps the landscape, identifying direct, indirect, and alternative solutions. If your idea competes directly with the core product of a giant like Google, Meta, or Jio, a massive -18 penalty is applied to Feasibility and a significant drop in the Competition score occurs. We look for "Moat Opportunities"—structural gaps incumbents are not filling due to their size or legacy models. Detailed threat-level analysis categorizes competitors based on funding (Seed to Series B+) and capability. To win this category, you must show that your "entry strategy" avoids the incumbents' strengths and attacks their specific vulnerabilities.
                  </div>
                </div>

                <div style={{ marginBottom: '80px' }}>
                  <h3 style={{ fontSize: '32px', color: 'var(--accent)', marginBottom: '24px' }}>03.4 Feasibility (15%) — The Modifiers</h3>
                  <div className="whitepaper-p">
                    Feasibility measures the probability that this specific founder can execute this specific idea. We start with a base score of 52 and apply <span className="whitepaper-highlight">Mathematical Modifiers</span> based on the context. Your "Founder Stage" is heavily weighted: a founder with a "Launched" product receives a +16 bonus, while "Just an idea" receives +0, acknowledging the massive execution risk in concept-only startups. We also evaluate the "Cold Start" problem: Marketplaces receive a -12 penalty because they require two-sided liquidity to function, which is notoriously difficult to build. Subscription models for price-sensitive segments (like students in India) receive a -4 penalty. We also factor in technical complexity; if an idea requires breakthrough R&D with a bootstrapped team, the feasibility score is capped. The goal is to reflect the hard truth: some ideas are great, but almost impossible to build without $10M in the bank.
                  </div>
                </div>

                <div style={{ marginBottom: '80px' }}>
                  <h3 style={{ fontSize: '32px', color: 'var(--accent)', marginBottom: '24px' }}>03.5 Innovation Score (10%)</h3>
                  <div className="whitepaper-p">
                    Innovation measures the <span className="whitepaper-highlight">Novelty of Approach</span>. We use a graduated spectrum: a "Direct Clone" scores 0-11, accurately identifying that zero differentiation leads to a price war. A "Feature Addition" to an existing product scores 28-43. "Business Model Innovation" (e.g., changing how a product is sold, not what it is) scores 44-57. "Novel Technical Solutions" score up to 71, and true "Category Creation" (something that has never existed before) reaches the 72-84 range. Agent 6 (Scorer) is trained to detect when a founder is simply rebranding an old idea with "AI" buzzwords versus actually innovating on the root problem. High innovation scores are rare and difficult to achieve, as they require a non-obvious entry point into a market that incumbents have overlooked.
                  </div>
                </div>

                <div style={{ marginBottom: '80px' }}>
                  <h3 style={{ fontSize: '32px', color: 'var(--accent)', marginBottom: '24px' }}>03.6 Opportunity Gap (10%)</h3>
                  <div className="whitepaper-p">
                    The Opportunity Gap is the <span className="whitepaper-highlight">Strategic Void</span> left by current market solutions. It is synthesized by the Critic and Scorer agents by looking at the "Key Weakness" of every competitor identified by the Detector. If incumbents are focused on high-ARPU enterprise users, the "Gap" might be a low-cost, simplified tool for mass-market SMBs. This score measures how precisely the proposed idea fits into that specific void. It is the measure of "Why hasn't someone else done this?" If the gap is small or closing fast, the score is low. If the gap is structural—meaning incumbents cannot fill it without destroying their existing business (the "Innovator's Dilemma")—the score reaches its maximum of 81. This is the difference between a "good idea" and a "perfectly timed strategic entry."
                  </div>
                </div>
              </section>

              <section className="whitepaper-section visible">
                <span className="whitepaper-num">04 / The 8-Agent Hierarchy</span>
                <h2 className="whitepaper-h2">Chain of Intelligence.</h2>
                <div className="whitepaper-p">
                  Each analysis runs through a sequence of eight specialized AI agents, inspired by a venture fund's investment committee. No single agent is responsible for the entire report; instead, each performs a discrete, high-precision task and passes its "Evidence Log" to the next.
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '48px' }}>
                  {[
                    { a: 'Agent 1: Problem Clarifier', r: 'Dissects the user pain into a structural Statement. Assigns initial Pain Score.' },
                    { a: 'Agent 2: Research Agent', r: 'Mines signals in specific markets (e.g. India Tier 2 vs NYC). Evaluates Timing.' },
                    { a: 'Agent 3: Competitor Detector', r: 'Scans for direct/indirect threats. Identifies MOATS and Open Gaps.' },
                    { a: 'Agent 4: Market Analyst', r: 'Financial modeling. Calculates bottom-up TAM/SAM/SOM and LTV:CAC ratios.' },
                    { a: 'Agent 5: Pain Evaluator', r: 'Behavioral science. Predicts Adoption Barriers and change hardness.' },
                    { a: 'Agent 6: Startup Scorer', r: 'The Algorithm. Applies all 6 factors, weights, and mathematical modifiers.' },
                    { a: 'Agent 7: Critic Agent', r: 'The Truth Teller. Identifies Fatal Risks and counterintuitive insights.' },
                    { a: 'Agent 8: Report Generator', r: 'Synthesizer. Assembles the finalized data into a high-density dashboard.' }
                  ].map((x, i) => (
                    <div key={i} className="agent-node">
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--accent-dim)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{i+1}</div>
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{x.a}</div>
                        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{x.r}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="whitepaper-section visible">
                <span className="whitepaper-num">05 / Data Plotting & Visuals</span>
                <h2 className="whitepaper-h2">From Math to Motion.</h2>
                <div className="whitepaper-p">
                  The graphics you see in your report are direct translations of the data generated by our agents. The <span className="whitepaper-highlight">Radar Chart</span> plots the six dimensions on a 100-point spider-web axis, providing an instant visual signature of your startup (e.g., a "Product-First" startup vs a "Market-Pull" startup). The <span className="whitepaper-highlight">Market Cap Projection</span> area chart is not a random curve; it is plotted using the Year 1 through Year 5 revenue targets derived by our Market Analyst agent using bottom-up unit economics for your specific business model. We use specific "Glow Gradients" to represent confidence intervals—the sharper the line, the more direct evidence the agents found in our market database.
                </div>
              </section>

              <section className="whitepaper-section visible">
                <span className="whitepaper-num">06 / Live Comparisons</span>
                <h2 className="whitepaper-h2">A Tale of Two Scores.</h2>
                <div className="whitepaper-p">
                  To understand the calibration, look at how the engine treats two identical industries with different approaches.
                </div>
                
                <div className="comparison-box">
                  <div style={{ borderRight: '1px solid var(--border-subtle)', paddingRight: '40px' }}>
                    <div style={{ color: 'var(--danger)', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '12px' }}>Example A: POOR SCORE (34/100)</div>
                    <h4 style={{ fontSize: '24px', marginBottom: '16px' }}>"The InstaClone"</h4>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>A social media app for Indians in Tier 3 cities to share photos. Business model: Subscription.</p>
                    <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}><strong style={{ color: 'white' }}>Innovation: 11.</strong> Identified as a direct copy of Instagram/WhatsApp. Massive penalty.</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}><strong style={{ color: 'white' }}>Competition: 18.</strong> Competing directly with Meta (GIANT). Incurred -18 penalty.</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}><strong style={{ color: 'white' }}>Feasibility: 22.</strong> Subscription model in India Tier 3 is notoriously difficult. Marketplace-style empty room problem.</div>
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--success)', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '12px' }}>Example B: GOOD SCORE (82/100)</div>
                    <h4 style={{ fontSize: '24px', marginBottom: '16px' }}>"BioGrid AI"</h4>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>Decentralized energy optimization for industrial parks using a specialized IoT-AI mesh. Business model: Pay-per-save commission.</p>
                    <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}><strong style={{ color: 'white' }}>Innovation: 79.</strong> Category-creating approach to energy efficiency. High technical moat.</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}><strong style={{ color: 'white' }}>Market Demand: 81.</strong> Backed by rising energy costs and recent ESG regulations. Extreme 'Now' factor.</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}><strong style={{ color: 'white' }}>Opportunity Gap: 78.</strong> Incumbent utility companies are too slow to deploy specialized mesh networks.</div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="whitepaper-section visible">
                <span className="whitepaper-num">07 / Startup Glossary</span>
                <h2 className="whitepaper-h2">Universal Definitions.</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '48px' }}>
                  {[
                    { t: 'TAM (Total Addressable Market)', d: 'The theoretical maximum revenue if you served 100% of the world universe for your product.' },
                    { t: 'SAM (Serviceable Addressable Market)', d: 'The portion of the TAM that is actually reachable given your geographical and technical constraints.' },
                    { t: 'SOM (Serviceable Obtainable Market)', d: 'The realistic percentage of the SAM you can capture in the next 3 to 5 years.' },
                    { t: 'ARPU (Avg. Revenue Per User)', d: 'The amount of money you make from one customer in a given timeframe (typically monthly).' },
                    { t: 'CAC (Customer Acquisition Cost)', d: 'The total cost of sales and marketing needed to convince a single user to pay for your product.' },
                    { t: 'LTV (Lifetime Value)', d: 'The total revenue you expect to earn from a user before they stop using your service (churn).' },
                    { t: 'MOAT', d: 'A structural advantage that prevents competitors from easily copying your business (e.g. network effects, IP, high switching costs).' },
                    { t: 'PMF (Product-Market Fit)', d: 'The point where you have a product that people need, and the market is pulling it from you faster than you can scale.' }
                  ].map(x => (
                    <div key={x.t} className="glossary-item">
                      <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent)', marginBottom: '8px' }}>{x.t}</div>
                      <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{x.d}</div>
                    </div>
                  ))}
                </div>
              </section>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '60px', textAlign: 'center' }}>
                <h3 style={{ fontSize: '24px', marginBottom: '24px' }}>Ready to validate your own idea?</h3>
                <button 
                  onClick={() => { setPhase('hero'); window.scrollTo({top: 0, behavior: 'smooth'}); setTimeout(() => heroInputRef.current?.focus(), 400); }} 
                  className="btn-primary" 
                  style={{ padding: '16px 40px' }}
                >Analyze My Idea →</button>
              </div>
            </div>
          </div>
        )}

        {/* ONBOARDING PHASE */}
        {phase === 'onboard' && (
          <>
            <div className="rail-container">
              <div className="rail-track">
                <div className="rail-line-bg" />
                <div className="rail-line-fill" style={{ width: `${(step / (RAIL_NODES.length - 1)) * 100}%` }} />
                {RAIL_NODES.map((t, i) => {
                  const state = i < step ? 'completed' : i === step ? 'current' : 'future';
                  return (
                    <div className={`rail-node-wrap ${state}`} key={i}>
                      <div className={`rail-node ${state}`}>{state === 'completed' ? '✓' : i + 1}</div>
                      <span className="rail-lbl">{t}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <main className="onboarding-main">
              <div className="content-col">
                <div className={animClass}>
                  {step < 4 && (
                    <>
                      <span className="step-context">Step {step + 1} of 5</span>
                      <h2 className="q-heading">{FLOW_STEPS[step].q}</h2>
                      <div className="opt-grid">
                        {FLOW_STEPS[step].opts.map(o => (
                          <button key={o.label} className={`opt-card ${answers[step].includes(o.label) ? 'selected' : ''}`} onClick={() => pick(o.label)}>
                            <span className="opt-card-icon">{o.icon}</span>
                            <span className="opt-card-title">{o.label}</span>
                          </button>
                        ))}
                      </div>
                      <div style={{ marginTop: '24px' }}>
                         <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>Other (describe your own)</label>
                         <input className="field-input" value={customAnswers[step]} onChange={e => setCustom(e.target.value)} placeholder="Type here..." />
                      </div>
                      <div className="nav-row">
                        <button className="btn-back" onClick={back}>Back</button>
                        <button className={`btn-next ${(answers[step].length > 0 || customAnswers[step].trim()) ? 'enabled' : 'disabled'}`} onClick={next} disabled={!(answers[step].length > 0 || customAnswers[step].trim())}>Next</button>
                      </div>
                    </>
                  )}
                  {step === 4 && (
                    <div style={{ textAlign: 'center' }}>
                      <h2 className="q-heading">Analysis Ready.</h2>
                      {otpStep === 'email' ? (
                        <div className="form-card" style={{ marginTop: '32px' }}>
                          <div className="field"><label className="field-label">Name</label><input className="field-input" value={name} onChange={e => setName(e.target.value)} /></div>
                          <div className="field"><label className="field-label">Email</label><input className="field-input" value={email} onChange={e => setEmail(e.target.value)} /></div>
                          {otpErr && <div style={{ color: 'var(--danger)', fontSize: '13px', marginTop: '12px' }}>{otpErr}</div>}
                          <button className="btn-unlock anim" onClick={sendOtp}>Verify Email →</button>
                        </div>
                      ) : (
                        <div className="form-card" style={{ marginTop: '32px' }}>
                          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px' }}>We sent a 6-digit code to {email}</p>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
                            {otpVars.map((v, i) => (
                              <input key={i} id={`otp-${i}`} className="field-input" style={{ width: '40px', height: '48px', textAlign: 'center', fontSize: '20px', padding: 0 }} value={v} onChange={e => handleOtpChange(i, e.target.value)} maxLength={1} onKeyDown={(e) => { if (e.key === 'Backspace' && !v && i > 0) { const prev = document.getElementById(`otp-${i-1}`); if (prev) prev.focus(); } }} />
                            ))}
                          </div>
                          {otpErr && <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '16px' }}>{otpErr}</div>}
                          <button className="btn-unlock anim" onClick={verifyOtp}>Verify & Generate Report →</button>
                          <div style={{ marginTop: '16px', fontSize: '13px' }}>
                            {resendTimer > 0 ? (
                              <span style={{ color: 'var(--text-tertiary)' }}>Resend code in {resendTimer}s</span>
                            ) : (
                              <button onClick={sendOtp} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: 0 }}>Resend code</button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </main>
          </>
        )}

        {/* QUEUED PHASE — AUTO DELIVERY UI */}
        {phase === 'queued' && queueData && (
          <div className="sys-loader-wrapper" style={{ textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 32px' }}>
              <div className="hiw-realistic-pulse" style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${rateLimitCountdown > 0 ? '#F0A500' : 'var(--accent)'}`, opacity: 0.2 }} />
              <div style={{ position: 'absolute', inset: '10px', borderRadius: '50%', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <span style={{ fontSize: '40px' }}>{rateLimitCountdown > 0 ? '⏸' : '🕒'}</span>
              </div>
            </div>
            
            <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>
              {rateLimitCountdown > 0 ? 'Rate Limit — Auto Resuming' : 'API High Load Detected'}
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 32px', lineHeight: 1.6 }}>
              {rateLimitCountdown > 0 ? (
                <>Token limit reached after Agent {(rateLimitAgent ?? 0) + 1}/8. Pipeline is <span style={{ color: '#F0A500', fontWeight: 600 }}>paused</span> and will auto-resume.</>
              ) : (
                <>The Groq Forensic engine is at capacity. Your analysis has been <span style={{ color: 'var(--accent)', fontWeight: 600 }}>queued for priority processing</span>.</>
              )}
            </p>

            {/* ── Rate Limit Countdown Banner ── */}
            {rateLimitCountdown > 0 && (
              <div style={{
                maxWidth: '400px',
                margin: '0 auto 24px',
                padding: '16px 24px',
                background: 'rgba(240,165,0,0.08)',
                border: '1px solid rgba(240,165,0,0.2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
              }}>
                <span style={{ fontSize: '20px' }}>⏸</span>
                <span style={{ fontSize: '15px', color: '#F0A500', fontWeight: 600 }}>
                  Resuming in {String(Math.floor(rateLimitCountdown / 60)).padStart(2, '0')}:{String(rateLimitCountdown % 60).padStart(2, '0')}
                </span>
              </div>
            )}

            <div className="form-card" style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'left', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Forensic Progress</span>
                <span style={{ fontSize: '13px', color: rateLimitCountdown > 0 ? '#F0A500' : 'var(--accent)', fontWeight: 600 }}>{queueProgress}%</span>
              </div>
              
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', marginBottom: '24px' }}>
                <div style={{ 
                  width: `${queueProgress}%`, 
                  height: '100%', 
                  background: rateLimitCountdown > 0 ? '#F0A500' : 'var(--accent)', 
                  boxShadow: rateLimitCountdown > 0 ? '0 0 15px rgba(240,165,0,0.4)' : '0 0 15px var(--accent)',
                  transition: 'width 1s ease-in-out, background 0.3s ease' 
                }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Estimated Wait</span>
                <span style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 600 }}>
                  {rateLimitCountdown > 0 ? `~${Math.ceil(rateLimitCountdown / 60) + 1} Minutes` : `~${queueData.estimated_wait_minutes || 2} Minutes`}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Delivery Email</span>
                <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{queueData.email}</span>
              </div>
              
              <div style={{ 
                padding: '16px', 
                background: 'rgba(0,230,118,0.05)', 
                border: '1px solid rgba(0,230,118,0.1)', 
                borderRadius: '12px',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                lineHeight: 1.5
              }}>
                ✦ Your high-fidelity PDF report will be delivered automatically. You can close this tab safely.
              </div>
            </div>

            <button 
              onClick={() => { localStorage.removeItem('founderos_pending_queue'); setPhase('hero'); }}
              style={{ marginTop: '32px', background: 'none', border: 'none', color: 'var(--text-tertiary)', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Start another analysis
            </button>
          </div>
        )}

        {/* LOADING PHASE */}
        {phase === 'loading' && (
          <div className="sys-loader-wrapper">
            <h2 style={{ marginBottom: '24px' }}>Analyzing Startup Architecture</h2>
            <div className="agent-pipeline-card">
              {AGENT_STEPS.map((stepName, i) => {
                const state = i < loadIdx ? 'complete' : i === loadIdx ? 'running' : 'pending';
                return (
                  <div key={i} className="agent-row">
                    <div className={`status-icon ${state}`}>{state === 'complete' ? '✓' : ''}</div>
                    <span className={`agent-name ${state}`}>{stepName}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ width: '100%', maxWidth: '520px', marginTop: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Syncing Nodes</span>
                <span style={{ color: 'var(--accent)' }}>{loadPct}%</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'var(--border-subtle)', borderRadius: '999px' }}>
                <div style={{ width: `${loadPct}%`, height: '100%', background: 'var(--accent)', borderRadius: '999px', transition: 'width 0.4s ease' }} />
              </div>
            </div>
          </div>
        )}

        {/* REPORT PHASE — MISSION CONTROL DASHBOARD */}
        {phase === 'report' && result && (() => {
          const vs = result?.viabilityScore ?? 0;
          const badge = vs >= 70 ? { l: 'STRONG OPPORTUNITY', c: '#00E676', bg: 'rgba(0,230,118,0.12)', b: 'rgba(0,230,118,0.25)' } :
                        vs >= 50 ? { l: 'MODERATE POTENTIAL', c: '#F0A500', bg: 'rgba(240,165,0,0.12)', b: 'rgba(240,165,0,0.25)' } :
                                   { l: 'HIGH RISK', c: '#FF6B6B', bg: 'rgba(255,107,107,0.12)', b: 'rgba(255,107,107,0.25)' };

          const getCol = (s: number) => s >= 70 ? '#00E676' : s >= 50 ? '#F0A500' : '#FF6B6B';

          // Using parent utility functions: reset, share, downloadPDF, copyReport (defined in Home component)


          const factors = [
            { id: 'problemStrength', name: 'Problem Strength', score: Number(result?.problem_score || result?.scores?.problemStrength || 5), desc: 'How real and painful is the problem', bench: 70 },
            { id: 'marketDemand', name: 'Market Demand', score: Number(result?.market_score || result?.scores?.marketDemand || 5), desc: 'Size and growth of opportunity', bench: 65 },
            { id: 'competition', name: 'Competition', score: Number(result?.risk_score || result?.scores?.competition || 5), desc: 'Level of existing competition', bench: 60 },
            { id: 'feasibility', name: 'Feasibility', score: Number(result?.feasibility_score || result?.scores?.feasibility || 5), desc: 'Technical achievability', bench: 72 },
            { id: 'innovation', name: 'Innovation', score: Number(result?.innovation_score || result?.scores?.innovation || 5), desc: 'Uniqueness of the approach', bench: 65 },
            { id: 'opportunityGap', name: 'Opportunity Gap', score: Number(result?.opportunity_score || result?.scores?.opportunityGap || 5), desc: 'Whitespace in the market', bench: 68 },
          ];

          const radarData = factors.map(f => ({ subject: f.name.split(' ')[0], score: f.score, fullMark: 100 }));

          const barData = factors.map(f => ({ name: f.name.split(' ')[0], Score: f.score, Benchmark: f.bench }));

          const threatCounts = { High: 0, Medium: 0, Low: 0 };
          (result?.competitors ?? []).forEach((c: any) => { const tl = c?.threatLevel || 'Low'; if (tl in threatCounts) threatCounts[tl as keyof typeof threatCounts]++; });
          const pieData = [
            { name: 'High', value: threatCounts.High || 1, fill: '#FF4444' },
            { name: 'Medium', value: threatCounts.Medium || 1, fill: '#F0A500' },
            { name: 'Low', value: threatCounts.Low || 1, fill: 'var(--accent, #10b981)' }
          ];

          const baseTam = (result?.marketDemand ?? 0) * 10 >= 70 ? 4200 : (result?.marketDemand ?? 0) * 10 >= 40 ? 850 : 120;

          // Parse clean dollar values from potentially verbose API strings
          const parseMarketValue = (raw: any, fallback: string): string => {
            // 1. Handle non-string inputs (objects/numbers)
            if (typeof raw !== 'string') {
              if (!raw) return fallback;
              if (typeof raw === 'number') return `$${(raw / 1e6).toFixed(1)}M`.replace('.0M', 'M');
              if (raw && typeof raw === 'object' && raw.value) return `$${(raw.value / 1e6).toFixed(1)}M`.replace('.0M', 'M');
              return String(raw);
            }

            // 2. Existing string logic
            if (!raw) return fallback;
            if (raw.length < 15 && raw.startsWith('$')) return raw;
            // Try to extract a dollar figure from verbose text
            const dollarMatch = raw.match(/\$[\d,.]+\s*(?:billion|million|B|M|K|trillion|T)/i);
            if (dollarMatch) return dollarMatch[0].replace(/billion/i, 'B').replace(/million/i, 'M').replace(/trillion/i, 'T');
            // Try to extract just a number with M/B suffix
            const numMatch = raw.match(/([\d,.]+)\s*(?:billion|million|B|M)/i);
            if (numMatch) {
              const suffix = raw.match(/billion|B/i) ? 'B' : 'M';
              return `$${numMatch[1]}${suffix}`;
            }
            return fallback;
          };

          const tamLabel = parseMarketValue(result?.tam, baseTam >= 1000 ? `$${(baseTam / 1000).toFixed(1)}B` : `$${baseTam}M`);
          const samLabel = parseMarketValue(result?.sam, `$${Math.round(baseTam * 0.09)}M`);
          const somLabel = parseMarketValue(result?.som, `$${Math.round(Math.round(baseTam * 0.09) * 0.03)}M`);

          const areaData = (result?.growthProjection && result.growthProjection.length >= 5)
            ? result.growthProjection.map(g => ({ year: g.year.replace('Year ', 'Y'), value: g.value }))
            : Array.from({ length: 5 }).map((_, i) => ({
                year: `Y${i + 1}`,
                value: Math.round(((vs / 100) * 50) * Math.pow(1.35, i))
              }));

          const ringR = 42;
          const ringC = 2 * Math.PI * ringR;
          const ringOffset = ringC - (vs / 100) * ringC;

          // Uniform card style
          const card: React.CSSProperties = { background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '32px' };
          const sLabel = (text: string, color = '#00E676'): React.CSSProperties => ({ fontSize: '13px', textTransform: 'uppercase' as const, letterSpacing: '0.12em', fontWeight: 800, color, marginBottom: '20px' });

          return (
            <div id="founderos-report" style={{
              minHeight: '100vh',
              background: 'var(--bg-base)',
              backgroundImage:
                'linear-gradient(rgba(0,230,118,0.015) 1px, transparent 1px), ' +
                'linear-gradient(90deg, rgba(0,230,118,0.015) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              color: 'var(--text-primary)',
              fontFamily: 'Inter, sans-serif',
              paddingBottom: '100px',
            }}>
              <div style={{
                maxWidth: '100%',
                width: '96%',
                margin: '0 auto',
                padding: '40px 2vw 0',
              }}>

                {/* ═══════ SECTION 1: SCORE HERO — FULL WIDTH ═══════ */}
                <div style={{ ...card, gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '32px', padding: '28px 32px' }}>
                  {/* Left side: title + pills + mini stats */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={sLabel('FOUNDEROS STARTUP REPORT')}>FOUNDEROS STARTUP REPORT</div>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: '16px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, textOverflow: 'ellipsis' }}>{idea}</h1>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
                      {answers.filter(Boolean).map((a, i) => (
                        <span key={i} style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '6px 14px', fontSize: '13px', color: 'var(--text-secondary)' }}>{a}</span>
                      ))}
                    </div>
                    {/* Mini stat row */}
                    <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
                      {[
                        { label: 'DEMAND', val: `${Math.min(100, Math.max(0, Math.round(result?.scores?.marketDemand ?? result?.marketDemand ?? 0)))}` },
                        { label: 'FEASIBILITY', val: `${Math.min(100, Math.max(0, Math.round(result?.scores?.feasibility ?? (result?.feasibilityScore ?? 0) * 5)))}` },
                        { label: 'TIMING', val: `${Math.min(100, Math.max(0, Math.round(result?.timingScore ?? 0) > 15 ? Math.round((result?.timingScore ?? 0) * 6.67) : Math.round(result?.timingScore ?? 0)))}` },
                      ].map((st, si) => (
                        <div key={si} style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{st.label}</span>
                          <span style={{ fontSize: '20px', fontWeight: 700, color: getCol(parseInt(st.val)) }}>{st.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Right side: SVG ring + verdict */}
                  <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                      <svg width="120" height="120" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="50" cy="50" r={ringR} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
                        <circle cx="50" cy="50" r={ringR} fill="none" stroke={badge.c} strokeWidth="8" strokeLinecap="round"
                          strokeDasharray={ringC} strokeDashoffset={ringOffset}
                          style={{ transition: 'stroke-dashoffset 1.5s ease', filter: `drop-shadow(0 0 8px ${badge.c}66)` }} />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '38px', fontWeight: 900 }}>{vs}</div>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>VIABILITY SCORE</div>
                    <div style={{ background: badge.bg, border: `1px solid ${badge.b}`, color: badge.c, fontSize: '13px', fontWeight: 800, padding: '6px 18px', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{badge.l}</div>
                  </div>
                </div>

                {/* UNIT ECONOMICS WARNING BANNER */}
                {(result?.unitEconomicsViable === false || result?.deliveryEconomicsWarning) && (
                  <div style={{
                    background: 'rgba(255,68,68,0.06)',
                    border: '1px solid rgba(255,68,68,0.25)',
                    borderLeft: '4px solid #FF4444',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}>
                    <span style={{ fontSize: '18px', flexShrink: 0 }}>
                      ⚠️
                    </span>
                    <div>
                      <p style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: 'var(--danger)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        marginBottom: '6px',
                      }}>
                        Unit Economics Warning
                      </p>
                      <p style={{
                        fontSize: '14px',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.6,
                        margin: 0,
                      }}>
                        {result?.deliveryEconomicsWarning ||
                         'The unit economics for this business model are negative. Delivery or operational costs exceed revenue per transaction at projected scale.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* ROW 2 — TWO COLUMNS */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
                  gap: '24px',
                  marginBottom: '24px',
                }}>
                  {/* LEFT: Evaluation breakdown */}
                  <div style={{ ...card, height: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div style={{ ...sLabel('EVALUATION BREAKDOWN'), marginBottom: 0 }}>EVALUATION BREAKDOWN</div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => setExpandedFactors(new Set(factors.map(f => f.id)))} style={{ fontSize: '12px', background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Expand All</button>
                        <button onClick={() => setExpandedFactors(new Set())} style={{ fontSize: '12px', background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Collapse All</button>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'start' }}>
                      {factors.map(f => {
                        const isExpanded = expandedFactors.has(f.id);
                        const reasoning = (result?.scoreReasonings as any)?.[f.id];
                        const scoreColor = getCol(f.score);

                        return (
                          <div
                            key={f.id}
                            onClick={() => {
                              const next = new Set(expandedFactors);
                              if (next.has(f.id)) next.delete(f.id);
                              else next.add(f.id);
                              setExpandedFactors(next);
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = 'rgba(0,230,118,0.25)';
                              e.currentTarget.style.background = 'rgba(0,230,118,0.03)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = isExpanded ? 'rgba(0,230,118,0.25)' : 'rgba(255,255,255,0.07)';
                              e.currentTarget.style.background = isExpanded ? 'rgba(0,230,118,0.03)' : 'rgba(255,255,255,0.02)';
                            }}
                            style={{
                              background: isExpanded ? 'rgba(0,230,118,0.03)' : 'rgba(255,255,255,0.02)',
                              borderRadius: '10px',
                              padding: '14px',
                              border: isExpanded ? '1px solid rgba(0,230,118,0.30)' : '1px solid rgba(255,255,255,0.07)',
                              cursor: 'pointer',
                              transition: 'all 150ms ease',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{f.name}</span>
                                <span style={{ fontSize: '11px', color: 'rgba(0,230,118,0.6)', userSelect: 'none' }}>ⓘ</span>
                              </div>
                              <span style={{ fontSize: '26px', fontWeight: 800, color: scoreColor }}>{f.score}</span>
                            </div>
                            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '99px', overflow: 'hidden', marginBottom: '8px' }}>
                              <div style={{ width: `${Math.min(f.score, 100)}%`, height: '100%', borderRadius: '99px', background: scoreColor, transition: 'width 1.2s ease' }} />
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>{f.desc}</div>

                            {isExpanded && reasoning && (
                              <div style={{
                                marginTop: '12px',
                                paddingTop: '12px',
                                borderTop: '1px solid var(--border-subtle)',
                                animation: 'fadeIn 200ms ease-out',
                              }}>
                                <p style={{
                                  fontSize: '13px',
                                  color: 'var(--text-secondary)',
                                  lineHeight: '1.7',
                                  margin: 0,
                                  wordBreak: 'break-word',
                                  overflowWrap: 'break-word',
                                }}>
                                  {reasoning}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <p style={{
                      fontSize: '11px',
                      color: 'var(--text-tertiary)',
                      textAlign: 'center',
                      marginTop: '16px',
                      letterSpacing: '0.02em',
                      fontStyle: 'italic',
                    }}>
                      Click any factor card to see the AI reasoning
                    </p>
                  </div>

                  {/* RIGHT: Dimension analysis (Defect 3) */}
                  <div style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '14px',
                    padding: '22px',
                    height: '100%',
                    minHeight: '320px',
                  }}>
                    <p style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--accent)',
                      marginBottom: '4px',
                    }}>
                      DIMENSION ANALYSIS
                    </p>
                    <p style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      marginBottom: '16px',
                    }}>
                      6-axis evaluation of your idea
                    </p>
                    <div style={{ width: '100%', height: '260px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart
                          data={
                            (result?.radarData?.length === 6)
                              ? result.radarData
                              : [
                                  { subject: 'Problem', score: result?.scores?.problemStrength ?? 5, fullMark: 100 },
                                  { subject: 'Market', score: result?.scores?.marketDemand ?? 5, fullMark: 100 },
                                  { subject: 'Competition', score: result?.scores?.competition ?? 5, fullMark: 100 },
                                  { subject: 'Feasibility', score: result?.scores?.feasibility ?? 5, fullMark: 100 },
                                  { subject: 'Innovation', score: result?.scores?.innovation ?? 5, fullMark: 100 },
                                  { subject: 'Opportunity', score: result?.scores?.opportunityGap ?? 5, fullMark: 100 },
                                ]
                          }
                          margin={{ top: 10, right: 30, bottom: 10, left: 30 }}
                        >
                          <PolarGrid stroke="rgba(255,255,255,0.08)" />
                          <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: 'var(--text-secondary, #10b981)', fontSize: 11 }}
                          />
                          <PolarRadiusAxis
                            angle={30}
                            domain={[0, 100]}
                            tick={{ fill: 'var(--text-secondary, #10b981)', fontSize: 9 }}
                            tickCount={4}
                          />
                          <Radar
                            name="Score"
                            dataKey="score"
                            stroke="#00E676"
                            fill="var(--accent-glow, #10b981)"
                            strokeWidth={2}
                            dot={{ fill: 'var(--accent, #10b981)', r: 3 }}
                          />
                          <Tooltip
                            contentStyle={{
                              background: 'var(--bg-surface, #161b22)',
                              border: '1px solid var(--accent-subtle, #10b981)',
                              borderRadius: '8px',
                              color: 'var(--text-primary, #10b981)',
                              fontSize: '12px',
                            }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* ROW 3 — FULL WIDTH: AI VERDICT */}
                <div style={{ ...card, gridColumn: '1 / -1', borderLeft: '5px solid #00E676', background: 'rgba(0,230,118,0.04)', marginBottom: '24px' }}>
                  <div style={sLabel('AI VERDICT')}>AI VERDICT</div>
                  <p style={{ fontSize: '18px', color: 'var(--text-primary)', lineHeight: 1.7, opacity: 0.95 }}>{result?.verdict || result?.advisorSummary || 'Analysis in progress...'}</p>
                </div>

                {/* ROW 4 — FULL WIDTH: CRITICAL INSIGHT */}
                <div style={{ ...card, gridColumn: '1 / -1', borderLeft: '5px solid #F0A500', background: 'rgba(240,165,0,0.04)', marginBottom: '24px' }}>
                  <div style={sLabel('INSIGHT FOUNDERS MISS', '#F0A500')}>INSIGHT FOUNDERS MISS</div>
                  <p style={{ fontSize: '18px', color: 'var(--text-primary)', lineHeight: 1.7, opacity: 0.95 }}>{result?.biggestInsight || 'No critical insight available for this idea.'}</p>
                </div>



                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
                  gap: '24px',
                  marginBottom: '24px',
                }}>
                  {/* LEFT: Top competitors list */}
                  <div style={{ ...card, height: '100%' }}>
                    <div style={sLabel('TOP COMPETITORS')}>TOP COMPETITORS</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {(result?.competitors ?? []).slice(0, 5).map((c: any, i: number) => (
                        <div key={i} style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: '12px',
                          background: 'var(--bg-base)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '10px',
                          padding: '14px 16px',
                          marginBottom: '8px',
                        }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.15)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0 }}>
                            {(c?.name ?? 'NA').substring(0, 2).toUpperCase()}
                          </div>
                          <div style={{
                            flex: 1,
                            minWidth: 0,
                            overflow: 'visible',
                          }}>
                            <p style={{
                              fontSize: '15px',
                              fontWeight: 600,
                              color: 'var(--text-primary)',
                              margin: 0,
                            }}>
                              {c?.name ?? 'Unknown'}
                            </p>
                            <p style={{
                              fontSize: '13px',
                              color: 'var(--text-secondary)',
                              lineHeight: '1.6',
                              margin: '3px 0 0 0',
                              wordBreak: 'break-word',
                              overflowWrap: 'break-word',
                              whiteSpace: 'normal',
                              overflow: 'visible',
                              textOverflow: 'unset',
                              display: 'block',
                              WebkitLineClamp: 'unset',
                              maxWidth: '100%',
                            }}>
                              {c?.description ?? ''}
                            </p>
                          </div>
                          <span style={{
                            flexShrink: 0,
                            fontSize: '11px',
                            fontWeight: 600,
                            borderRadius: '999px',
                            padding: '3px 10px',
                            whiteSpace: 'nowrap',
                            alignSelf: 'flex-start',
                            background: (c?.threatLevel === 'High') ? 'rgba(255,107,107,0.12)' : (c?.threatLevel === 'Medium') ? 'rgba(240,165,0,0.12)' : 'rgba(0,230,118,0.12)',
                            border: (c?.threatLevel === 'High') ? '1px solid rgba(255,107,107,0.25)' : (c?.threatLevel === 'Medium') ? '1px solid rgba(240,165,0,0.25)' : '1px solid rgba(0,230,118,0.25)',
                            color: (c?.threatLevel === 'High') ? '#FF6B6B' : (c?.threatLevel === 'Medium') ? '#F0A500' : '#00E676',
                          }}>
                            {c?.threatLevel?.toUpperCase() ?? 'LOW'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RIGHT: Competitive threat doughnut chart */}
                  <div style={{ ...card, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={sLabel('COMPETITIVE THREAT')}>COMPETITIVE THREAT</div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: '200px' }}>
                      <ForensicThreatDoughnut data={{
                        labels: ['High Threat', 'Medium Threat', 'Low Threat'],
                        values: [threatCounts.High || 0.1, threatCounts.Medium || 0.1, threatCounts.Low || 0.1],
                        colors: ['#FF4444', '#F0A500', '#00e676']
                      }} />
                      <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)' }}>{(result?.competitors?.length ?? 0)}</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>Total Rivals</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ROW 6 & 7 — FULL WIDTH STACKED (Defect 2) */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px',
                  gridColumn: '1 / -1',
                  marginBottom: '24px',
                }}>
                  {/* KEY RISKS — full width card */}
                  <div style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '14px',
                    padding: '22px',
                  }}>
                    <p style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--danger)',
                      marginBottom: '14px',
                    }}>
                      KEY RISKS
                    </p>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}>
                      {(result?.risks ?? ['Risk analysis loading...', 'Risk analysis loading...', 'Risk analysis loading...']).map((risk: string, i: number) => (
                        <div key={i} style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          background: 'rgba(255,68,68,0.04)',
                          border: '1px solid rgba(255,68,68,0.12)',
                          borderRadius: '10px',
                          padding: '14px 16px',
                        }}>
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: 'rgba(255,68,68,0.10)',
                            border: '1px solid rgba(255,68,68,0.25)',
                            color: 'var(--danger)',
                            fontSize: '13px',
                            fontWeight: 800,
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: '2px',
                          }}>
                            {i + 1}
                          </div>
                          <span style={{
                            fontSize: '17px',
                            color: 'var(--text-primary)',
                            lineHeight: '1.6',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            minWidth: 0,
                            flex: 1,
                            opacity: 0.9,
                          }}>
                            {risk}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* OPPORTUNITIES — full width card */}
                  <div style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '14px',
                    padding: '22px',
                  }}>
                    <p style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--accent)',
                      marginBottom: '14px',
                    }}>
                      OPPORTUNITIES
                    </p>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}>
                      {(result?.opportunities ?? ['Opportunity analysis loading...', 'Opportunity analysis loading...', 'Opportunity analysis loading...']).map((opp: string, i: number) => (
                        <div key={i} style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          background: 'rgba(0,230,118,0.04)',
                          border: '1px solid rgba(0,230,118,0.12)',
                          borderRadius: '10px',
                          padding: '14px 16px',
                        }}>
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: 'rgba(0,230,118,0.10)',
                            border: '1px solid rgba(0,230,118,0.25)',
                            color: 'var(--accent)',
                            fontSize: '13px',
                            fontWeight: 800,
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: '2px',
                          }}>
                            {i + 1}
                          </div>
                          <span style={{
                            fontSize: '17px',
                            color: 'var(--text-primary)',
                            lineHeight: '1.6',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            minWidth: 0,
                            flex: 1,
                            opacity: 0.9,
                          }}>
                            {opp}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ROW 8 — FULL WIDTH: BENCHMARK COMPARISON */}
                <div style={{ ...card, gridColumn: '1 / -1', marginBottom: '16px', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ ...sLabel('BENCHMARK COMPARISON'), marginBottom: 0 }}>BENCHMARK COMPARISON</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mode: 10% Tier-1 Startups</div>
                  </div>
                  <div style={{ height: '240px', width: '100%', position: 'relative' }}>
                    <ForensicBenchmarkChart data={{
                      labels: factors.map(f => f.name.split(' ')[0]),
                      userScores: factors.map(f => f.score),
                      benchmarks: factors.map(f => f.bench)
                    }} />
                  </div>
                </div>

                {/* ROW 9 — FULL WIDTH: MARKET OPPORTUNITY */}
                <div style={{ ...card, gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start', marginBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div style={{ ...sLabel('MARKET OPPORTUNITY'), marginBottom: 0 }}>MARKET OPPORTUNITY</div>
                      {(Math.round(result?.timingScore ?? 0) > 60 || (result?.scores?.opportunityGap ?? 0) > 70) && (
                        <div style={{ background: 'rgba(0,230,118,0.1)', border: '1px solid var(--accent)', color: 'var(--accent)', fontSize: '10px', fontWeight: 900, padding: '4px 10px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', animation: 'pulseSlow 2s infinite' }}>
                          ⚡ HIGH VELOCITY / GOOD TIMING
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    {[
                      { label: 'TAM', value: tamLabel, desc: 'Total Addressable Market' },
                      { label: 'SAM', value: samLabel, desc: 'Serviceable Available' },
                      { label: 'SOM', value: somLabel, desc: 'Obtainable Market' },
                    ].map(m => (
                      <div key={m.label} style={{ background: 'var(--bg-hover)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '18px 22px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>{m.desc}</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                          <span style={{ fontSize: '28px', fontWeight: 900, color: 'var(--accent)' }}>{m.value}</span>
                          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 700 }}>{m.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px' }}>5-YEAR SCALING PROJECTION</div>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={areaData} margin={{ top: 5, right: 0, left: -15, bottom: 0 }}>
                        <defs>
                          <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00E676" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#00E676" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis dataKey="year" tick={{ fill: 'var(--text-secondary, #10b981)', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: 'var(--text-secondary, #10b981)', fontSize: 10 }} tickFormatter={(v: number) => `$${v}M`} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: 'var(--bg-surface, #161b22)', border: '1px solid var(--accent-subtle, #10b981)', borderRadius: '10px' }} />
                        <Area type="monotone" dataKey="value" stroke="#00E676" strokeWidth={2.5} fillOpacity={1} fill="url(#areaGlow)" dot={{ r: 3, fill: 'var(--accent, #10b981)' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* ROW 10 — FULL WIDTH: NEXT STEPS TIMELINE */}
                <div style={{ ...card, gridColumn: '1 / -1', marginBottom: '24px' }}>
                  <div style={sLabel('NEXT STEPS')}>NEXT STEPS</div>
                  <div style={{ position: 'relative', paddingLeft: '42px' }}>
                    <div style={{ position: 'absolute', left: '12px', top: '15px', bottom: '15px', width: '3px', background: 'rgba(0,230,118,0.12)' }} />
                    {(result?.nextSteps ?? []).map((s, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: i < (result?.nextSteps ?? []).length - 1 ? '24px' : '0', position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '-42px', width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-surface)', border: '2px solid #00E676', color: 'var(--accent)', fontSize: '13px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, boxShadow: '0 0 12px rgba(0,230,118,0.1)' }}>{i + 1}</div>
                        <div style={{ background: 'var(--bg-hover)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '18px 24px', flex: 1, fontSize: '16px', color: 'var(--text-primary)', lineHeight: 1.6, opacity: 0.9 }}>{s}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ROW 11 — KILLER QUESTION (Full Width Callout) */}
                <div style={{
                    ...card,
                    gridColumn: '1 / -1',
                    marginBottom: '24px',
                    borderLeft: '5px solid #FF6B6B',
                    background: 'rgba(255,107,107,0.04)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      right: '20px',
                      fontSize: '64px',
                      opacity: 0.06,
                      color: 'var(--danger)',
                      fontWeight: 900,
                      lineHeight: 1,
                    }}>?</div>
                    <div style={sLabel('THE KILLER QUESTION', '#FF6B6B')}>THE KILLER QUESTION</div>
                    <p style={{
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                      marginBottom: '14px',
                      marginTop: '-14px',
                    }}>The question that could make or break this idea</p>
                    <p style={{
                      fontSize: '20px',
                      color: 'var(--text-primary)',
                      lineHeight: 1.7,
                      fontStyle: 'italic',
                      opacity: 0.95,
                      fontWeight: 500,
                    }}>"{result?.killerQuestion || 'What specific evidence do you have that users will pay for this?'}"</p>
                  </div>

                {/* ROW 12 — MARKET SIGNALS */}
                <div style={{ ...card, gridColumn: '1 / -1', marginBottom: '24px' }}>
                    <div style={sLabel('MARKET SIGNALS')}>MARKET SIGNALS</div>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '16px', marginTop: '-14px' }}>Real-time indicators supporting this market</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                      {(result?.marketSignals && result.marketSignals.length > 0 ? result.marketSignals : ['No market signals detected']).map((signal: string, i: number) => (
                        <div key={i} style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          background: 'rgba(0,230,118,0.03)',
                          border: '1px solid rgba(0,230,118,0.08)',
                          borderRadius: '10px',
                          padding: '14px 16px',
                        }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: 'var(--accent)',
                            marginTop: '6px',
                            flexShrink: 0,
                            boxShadow: '0 0 8px rgba(0,230,118,0.4)',
                          }} />
                          <span style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.6, opacity: 0.9 }}>{signal}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                {/* ROW 13 — UNIT ECONOMICS (Revenue + CAC/LTV) */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '24px',
                  gridColumn: '1 / -1',
                  marginBottom: '24px',
                }}>
                  {/* LEFT: Revenue Projections */}
                  <div style={{ ...card, height: '100%' }}>
                    <div style={sLabel('REVENUE PROJECTIONS')}>REVENUE PROJECTIONS</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      {[
                        { y: 'Year 1', v: result?.revenueYear1, label: 'BEAR CASE' },
                        { y: 'Year 3', v: result?.revenueYear3, label: 'BASE CASE' },
                        { y: 'Year 5', v: result?.revenueYear5, label: 'BULL CASE' },
                      ].map((item, idx) => (
                        <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>{item.y}</span>
                            <span style={{ fontSize: '9px', background: idx === 2 ? 'rgba(0,230,118,0.1)' : idx === 1 ? 'rgba(255,255,255,0.1)' : idx === 0 ? 'rgba(255,107,107,0.1)' : 'rgba(255,255,255,0.05)', color: idx === 2 ? 'var(--accent)' : idx === 1 ? 'var(--text-secondary)' : idx === 0 ? '#FF6B6B' : 'var(--text-secondary)', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>{item.label}</span>
                          </div>
                          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>{item.v || '$0M'}</div>
                          <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Revenue Projection</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RIGHT: Unit Economics */}
                  <div style={{ ...card, height: '100%' }}>
                    <div style={sLabel('UNIT ECONOMICS')}>UNIT ECONOMICS</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {[
                        { label: 'CAC', value: result?.estimatedCAC, icon: '💰' },
                        { label: 'LTV', value: result?.estimatedLTV, icon: '📈' },
                        { label: 'LTV:CAC', value: result?.ltvCacRatio, icon: '⚖️' },
                        { label: 'Virality', value: result?.viralityPotential, icon: '🔥' },
                      ].map(u => (
                        <div key={u.label} style={{
                          background: 'var(--bg-hover)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          borderRadius: '10px',
                          padding: '14px 16px',
                          textAlign: 'center',
                        }}>
                          <div style={{ fontSize: '20px', marginBottom: '6px' }}>{u.icon}</div>
                          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{u.label}</div>
                          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{u.value || '—'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ROW 14 — STRATEGIC INTELLIGENCE (3-Col) */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '24px',
                  gridColumn: '1 / -1',
                  marginBottom: '24px',
                }}>
                  {/* Early Adopter Profile */}
                  <div style={{ ...card }}>
                    <div style={{ fontSize: '24px', marginBottom: '12px' }}>🎯</div>
                    <div style={sLabel('EARLY ADOPTER')}>EARLY ADOPTER</div>
                    <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.7, opacity: 0.85 }}>
                      {result?.earlyAdopterProfile || 'Profile analysis in progress...'}
                    </p>
                  </div>

                  {/* Moat Opportunity */}
                  <div style={{ ...card }}>
                    <div style={{ fontSize: '24px', marginBottom: '12px' }}>🏰</div>
                    <div style={sLabel('MOAT OPPORTUNITY')}>MOAT OPPORTUNITY</div>
                    <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.7, opacity: 0.85 }}>
                      {result?.moatOpportunity || 'Defensibility analysis in progress...'}
                    </p>
                  </div>

                  {/* Behavior Change Required */}
                  <div style={{ ...card }}>
                    <div style={{ fontSize: '24px', marginBottom: '12px' }}>🔄</div>
                    <div style={sLabel('BEHAVIOR CHANGE')}>BEHAVIOR CHANGE</div>
                    <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.7, opacity: 0.85 }}>
                      {result?.behaviorChange || 'Adoption analysis in progress...'}
                    </p>
                  </div>
                </div>

                {/* ROW 15 — TIMING ASSESSMENT (Full Width Banner) */}
                {result?.timingAssessment && (
                  <div style={{
                    ...card,
                    gridColumn: '1 / -1',
                    marginBottom: '24px',
                    background: 'linear-gradient(135deg, rgba(0,230,118,0.04) 0%, rgba(240,165,0,0.04) 100%)',
                    borderLeft: '5px solid #F0A500',
                  }}>
                    <div style={sLabel('⏱ TIMING ASSESSMENT', '#F0A500')}>⏱ TIMING ASSESSMENT</div>
                    <p style={{ fontSize: '16px', color: 'var(--text-primary)', lineHeight: 1.7, opacity: 0.9 }}>
                      {result.timingAssessment}
                    </p>
                  </div>
                )}

                {/* AI ADVISOR ORB (Concept 3) */}
                <AIAdvisorOrb idea={idea} analysisResult={result} />
              </div>

              {/* STICKY ACTION BAR */}
              <div id="founderos-action-bar" style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                width: '100%',
                zIndex: 50,
                background: 'rgba(13,17,23,0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                padding: '16px 32px',
                display: 'flex',
                justifyContent: 'center',
                gap: '16px',
                boxShadow: '0 -8px 32px rgba(0,0,0,0.5)'
              }}>
                <button className="btn-action outline" style={{ border: '1px solid rgba(255,255,255,0.1)' }} onClick={reset}>New Analysis</button>
                <div style={{ flex: 1 }} />
                <button className="btn-action outline" onClick={share}>Share Report</button>
                <button className="btn-action primary" onClick={downloadPDF}>Download Report (PDF) →</button>
                <button className="btn-action outline" onClick={copyReport}>Copy Link</button>
                {copied && <div style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: 'var(--text-inverse)', padding: '6px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, boxShadow: '0 4px 12px rgba(0,230,118,0.3)', animation: 'fadeInUp 0.2s ease' }}>Copied to Clipboard!</div>}
              </div>
            </div>
          );
        })()}
        {/* AUTH MODAL */}
        {isAuthModalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ width: '100%', maxWidth: '400px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '40px', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
              <button 
                onClick={() => setIsAuthModalOpen(false)} 
                style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '24px', cursor: 'pointer' }}
              >×</button>
              
              <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', textAlign: 'center' }}>
                {authModalMode === 'signin' ? 'Welcome Back' : 'Join FounderOS'}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center', marginBottom: '32px' }}>
                {authModalMode === 'signin' ? 'Sign in to access your dashboard' : 'Create your account to unlock full analysis'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {otpStep === 'email' ? (
                  <>
                    {authModalMode === 'signup' && (
                      <div className="field">
                        <label className="field-label">Full Name</label>
                        <input 
                          className="field-input" 
                          placeholder="Elon Musk"
                          autoFocus
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                    )}
                    <div className="field">
                      <label className="field-label">Email Address</label>
                      <input 
                        className="field-input" 
                        placeholder="elon@spacex.com"
                        autoFocus={authModalMode === 'signin'}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') sendOtp(); }}
                      />
                    </div>
                    {otpErr && <div style={{ color: 'var(--danger)', fontSize: '13px', textAlign: 'center' }}>{otpErr}</div>}
                    <button 
                      className="btn-unlock anim" 
                      style={{ marginTop: '12px' }}
                      onClick={sendOtp}
                    >
                      Verify Email →
                    </button>
                  </>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px' }}>We sent a 6-digit code to {email}</p>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
                      {otpVars.map((v, i) => (
                        <input key={i} id={`otp-modal-${i}`} className="field-input" style={{ width: '40px', height: '48px', textAlign: 'center', fontSize: '20px', padding: 0 }} value={v} onChange={e => handleOtpChange(i, e.target.value)} maxLength={1} onKeyDown={(e) => { if (e.key === 'Backspace' && !v && i > 0) { const prev = document.getElementById(`otp-modal-${i-1}`); if (prev) prev.focus(); } }} />
                      ))}
                    </div>
                    {otpErr && <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '16px' }}>{otpErr}</div>}
                    <button className="btn-unlock anim" onClick={verifyOtp}>Verify & Continue →</button>
                    <div style={{ marginTop: '16px', fontSize: '13px' }}>
                      {resendTimer > 0 ? (
                        <span style={{ color: 'var(--text-tertiary)' }}>Resend code in {resendTimer}s</span>
                      ) : (
                        <button onClick={sendOtp} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: 0 }}>Resend code</button>
                      )}
                    </div>
                  </div>
                )}

                <div style={{ textAlign: 'center', marginTop: '12px' }}>
                  <button 
                    onClick={() => { setAuthModalMode(authModalMode === 'signin' ? 'signup' : 'signin'); setOtpStep('email'); setOtpErr(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer' }}
                  >
                    {authModalMode === 'signin' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}