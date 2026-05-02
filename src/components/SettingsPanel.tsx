'use client'
import React, { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'

/* ──────────────────────────────────────────────────────────────────────────────
   TOGGLE SWITCH
   ────────────────────────────────────────────────────────────────────────────── */
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 24, borderRadius: 12, position: 'relative', cursor: 'pointer', userSelect: 'none',
        background: value ? 'var(--accent)' : 'var(--bg-elevated)',
        border: `1px solid ${value ? 'var(--accent)' : 'var(--border-default)'}`,
        transition: 'background 200ms ease, border-color 200ms ease',
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2,
        left: value ? 23 : 3, transition: 'left 200ms ease',
      }} />
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────────
   ACCORDION
   ────────────────────────────────────────────────────────────────────────────── */
function Accordion({ icon, label, desc, children }: { icon: string; label: string; desc?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 0', background: 'none',
          border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 18 }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
          {desc && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{desc}</div>}
        </div>
        <span style={{ fontSize: 14, color: 'var(--text-tertiary)', transition: 'transform 200ms', transform: open ? 'rotate(90deg)' : 'rotate(0)' }}>▶</span>
      </button>
      {open && <div style={{ padding: '0 0 16px 30px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{children}</div>}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────────
   MAIN SETTINGS PANEL
   ────────────────────────────────────────────────────────────────────────────── */
export default function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { theme, toggleTheme, isDark } = useTheme()

  // --- persisted states ---
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [scoringMode, setScoringMode] = useState<'balanced' | 'strict' | 'exploratory'>('strict')
  const [defaultMarket, setDefaultMarket] = useState('')
  const [showKiller, setShowKiller] = useState(true)
  const [autoSave, setAutoSave] = useState(true)
  const [notifyComplete, setNotifyComplete] = useState(false)
  const [notifyRateLimit, setNotifyRateLimit] = useState(true)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [feedback, setFeedback] = useState('')
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  useEffect(() => {
    setFontSize((localStorage.getItem('founderos-fontsize') as any) || 'medium')
    setScoringMode((localStorage.getItem('founderos-scoring-mode') as any) || 'strict')
    setDefaultMarket(localStorage.getItem('founderos-default-market') || '')
    setShowKiller(localStorage.getItem('founderos-show-killer') !== 'false')
    setAutoSave(localStorage.getItem('founderos-autosave') !== 'false')
    setNotifyComplete(localStorage.getItem('founderos-notify-complete') === 'true')
    setNotifyRateLimit(localStorage.getItem('founderos-notify-ratelimit') !== 'false')
    setUserName(localStorage.getItem('founderos-user-name') || '')
    setUserEmail(localStorage.getItem('founderos-user-email') || '')
  }, [])

  const applyFontSize = (s: 'small' | 'medium' | 'large') => {
    setFontSize(s)
    localStorage.setItem('founderos-fontsize', s)
    document.documentElement.style.fontSize = s === 'small' ? '14px' : s === 'large' ? '18px' : '16px'
  }

  const applyScoringMode = (m: 'balanced' | 'strict' | 'exploratory') => {
    setScoringMode(m)
    localStorage.setItem('founderos-scoring-mode', m)
  }

  const handleNotifyComplete = (v: boolean) => {
    if (v && 'Notification' in window) Notification.requestPermission()
    setNotifyComplete(v)
    localStorage.setItem('founderos-notify-complete', String(v))
  }

  const handleClearHistory = () => {
    localStorage.removeItem('founderos-history')
    setConfirmClear(false)
    window.dispatchEvent(new Event('founderos-history-cleared'))
  }

  const handleExport = () => {
    const data = localStorage.getItem('founderos-history') || '[]'
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'founderos-export.json'; a.click()
    URL.revokeObjectURL(url)
  }

  const handleFeedback = () => {
    if (!feedback.trim()) return
    localStorage.setItem(`founderos-feedback-${Date.now()}`, feedback)
    setFeedback('')
    setFeedbackSent(true)
    setTimeout(() => setFeedbackSent(false), 3000)
  }

  const sectionHeader = (label: string) => (
    <div style={{
      fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const,
      color: 'var(--accent)', marginBottom: 12, paddingBottom: 6,
      borderBottom: '1px solid var(--border-subtle)',
    }}>{label}</div>
  )

  const rowStyle: React.CSSProperties = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0',
    borderBottom: '1px solid var(--border-subtle)',
  }

  const btnGroup = (options: string[], active: string, onChange: (v: any) => void) => (
    <div style={{ display: 'flex', gap: 6 }}>
      {options.map(o => (
        <button key={o} onClick={() => onChange(o.toLowerCase())} style={{
          padding: '6px 16px', borderRadius: 6, fontSize: 13, cursor: 'pointer',
          background: active === o.toLowerCase() ? 'var(--accent-dim)' : 'var(--bg-elevated)',
          border: `1px solid ${active === o.toLowerCase() ? 'var(--accent)' : 'var(--border-subtle)'}`,
          color: active === o.toLowerCase() ? 'var(--accent)' : 'var(--text-secondary)',
          transition: 'all 200ms ease',
        }}>{o}</button>
      ))}
    </div>
  )

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: 280, height: '100vh',
      background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)',
      overflowY: 'auto', zIndex: 200, padding: '0 0 40px',
      transition: 'background-color 300ms ease, border-color 300ms ease',
    }}>
      {/* Header */}
      <div style={{
        height: 56, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '1px solid var(--border-subtle)', background: 'var(--sidebar-bg)',
        position: 'sticky', top: 0, zIndex: 1, transition: 'background-color 300ms ease',
      }}>
        <button onClick={onClose} style={{
          width: 32, height: 32, borderRadius: 8, background: 'transparent', border: 'none',
          color: 'var(--text-secondary)', fontSize: 18, cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', transition: 'all 150ms',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
        >←</button>
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Settings & Help</span>
      </div>

      {/* ──── SECTION A: APPEARANCE ──── */}
      <div style={{ padding: '20px 16px 8px' }}>
        {sectionHeader('Appearance')}

        {/* Theme Cards */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Color Theme</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>Choose your preferred interface theme</div>
          <div style={{ display: 'flex', gap: 12 }}>
            {(['dark', 'light'] as const).map(t => (
              <div key={t} onClick={() => { if (theme !== t) toggleTheme() }} style={{ cursor: 'pointer', textAlign: 'center' }}>
                <div style={{
                  width: 100, height: 64, borderRadius: 10,
                  background: t === 'dark' ? '#0D1117' : '#F0F4F8',
                  border: `2px solid ${theme === t ? 'var(--accent)' : 'transparent'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'border-color 200ms ease', position: 'relative',
                }}>
                  {/* Mini UI dots */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'center' }}>
                    <div style={{ width: 50, height: 6, borderRadius: 3, background: t === 'dark' ? '#1E242C' : '#E2EBF3' }} />
                    <div style={{ width: 36, height: 4, borderRadius: 2, background: t === 'dark' ? '#00E676' : '#00875A', opacity: 0.7 }} />
                    <div style={{ width: 50, height: 4, borderRadius: 2, background: t === 'dark' ? '#1E242C' : '#E2EBF3' }} />
                  </div>
                  {theme === t && <span style={{ position: 'absolute', top: 4, right: 6, fontSize: 12, color: 'var(--accent)' }}>✓</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, textTransform: 'capitalize' }}>{t}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div style={rowStyle}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Interface Font Size</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Adjust text size across the app</div>
          </div>
        </div>
        <div style={{ padding: '8px 0 12px' }}>
          {btnGroup(['Small', 'Medium', 'Large'], fontSize, applyFontSize)}
        </div>
      </div>

      {/* ──── SECTION B: ANALYSIS PREFERENCES ──── */}
      <div style={{ padding: '20px 16px 8px' }}>
        {sectionHeader('Analysis Preferences')}

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>Scoring Mode</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>How strictly the AI evaluates ideas</div>
          {btnGroup(['Balanced', 'Strict', 'Exploratory'], scoringMode, applyScoringMode)}
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>Default Target Market</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>Pre-select your usual market in analysis</div>
          <select
            value={defaultMarket}
            onChange={e => { setDefaultMarket(e.target.value); localStorage.setItem('founderos-default-market', e.target.value) }}
            style={{
              width: '100%', padding: '9px 14px', fontSize: 14, borderRadius: 8,
              background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
              color: 'var(--text-primary)', outline: 'none', cursor: 'pointer',
              transition: 'border-color 200ms ease',
            }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
          >
            <option value="">No default</option>
            <option value="India Tier 1">India Tier 1</option>
            <option value="India Tier 2 & 3">India Tier 2 & 3</option>
            <option value="Southeast Asia">Southeast Asia</option>
            <option value="Global/USA">Global/USA</option>
          </select>
        </div>

        <div style={rowStyle}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Show Killer Question</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Display the fatal flaw question in reports</div>
          </div>
          <Toggle value={showKiller} onChange={v => { setShowKiller(v); localStorage.setItem('founderos-show-killer', String(v)) }} />
        </div>

        <div style={rowStyle}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Auto-Save Analysis History</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Save completed reports to Recent History</div>
          </div>
          <Toggle value={autoSave} onChange={v => { setAutoSave(v); localStorage.setItem('founderos-autosave', String(v)) }} />
        </div>
      </div>

      {/* ──── SECTION C: NOTIFICATIONS ──── */}
      <div style={{ padding: '20px 16px 8px' }}>
        {sectionHeader('Notifications')}

        <div style={rowStyle}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Analysis Complete Alert</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Show browser notification when report is ready</div>
          </div>
          <Toggle value={notifyComplete} onChange={handleNotifyComplete} />
        </div>

        <div style={{ ...rowStyle, borderBottom: 'none' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Rate Limit Warning</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Alert before daily analysis limit is reached</div>
          </div>
          <Toggle value={notifyRateLimit} onChange={v => { setNotifyRateLimit(v); localStorage.setItem('founderos-notify-ratelimit', String(v)) }} />
        </div>
      </div>

      {/* ──── SECTION D: ACCOUNT ──── */}
      <div style={{ padding: '20px 16px 8px' }}>
        {sectionHeader('Account')}

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Your Name</div>
          <input
            value={userName}
            onChange={e => setUserName(e.target.value)}
            onBlur={() => localStorage.setItem('founderos-user-name', userName)}
            placeholder="Enter your name"
            style={{
              width: '100%', padding: '9px 14px', fontSize: 14, borderRadius: 8,
              background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
              color: 'var(--text-primary)', outline: 'none', transition: 'border-color 200ms',
            }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Email Address</div>
          <input
            value={userEmail}
            onChange={e => setUserEmail(e.target.value)}
            onBlur={() => localStorage.setItem('founderos-user-email', userEmail)}
            placeholder="your@email.com"
            style={{
              width: '100%', padding: '9px 14px', fontSize: 14, borderRadius: 8,
              background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
              color: 'var(--text-primary)', outline: 'none', transition: 'border-color 200ms',
            }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>Clear Analysis History</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>Remove all saved analyses from Recent History</div>
          {!confirmClear ? (
            <button onClick={() => setConfirmClear(true)} style={{
              background: 'var(--danger-dim)', border: '1px solid var(--danger)', color: 'var(--danger)',
              padding: '8px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer', transition: 'all 150ms',
            }}>Clear History</button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setConfirmClear(false)} style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)',
                padding: '8px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={handleClearHistory} style={{
                background: 'var(--danger)', border: '1px solid var(--danger)', color: '#fff',
                padding: '8px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600,
              }}>Clear All</button>
            </div>
          )}
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>Export My Data</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>Download all your analyses as JSON</div>
          <button onClick={handleExport} style={{
            background: 'var(--accent-dim)', border: '1px solid var(--accent)', color: 'var(--accent)',
            padding: '8px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer', transition: 'all 150ms',
          }}>Export JSON</button>
        </div>
      </div>

      {/* ──── SECTION E: HELP & RESOURCES ──── */}
      <div style={{ padding: '20px 16px 8px' }}>
        {sectionHeader('Help & Resources')}

        <Accordion icon="📖" label="How to Use FounderOS" desc="Guide to getting the best analysis results">
          <div style={{ marginBottom: 12 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Tip 1:</strong> Be specific in your idea description. Instead of &quot;food delivery app&quot; write &quot;hyper-local surplus food marketplace for college students in Pune connecting cafeteria leftovers to buyers within 2 hours.&quot; Specific ideas get specific analysis.
          </div>
          <div style={{ marginBottom: 12 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Tip 2:</strong> Choose the right customer segment. The same idea scores very differently for Students vs Working Professionals. Students have lower budgets and higher price sensitivity.
          </div>
          <div style={{ marginBottom: 12 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Tip 3:</strong> Understand your scores. Competition score is inverse — a HIGH competition score means LOW competition, which is GOOD. Feasibility measures execution difficulty.
          </div>
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Tip 4:</strong> Use Strict mode for honest results. Balanced mode gives benefit of the doubt. Strict mode catches fundamental business model flaws like delivery cost exceeding item value.
          </div>
        </Accordion>

        <Accordion icon="📊" label="Understanding Your Scores">
          <div style={{ marginBottom: 12 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Score Ranges:</strong><br />
            80–87: Strong Opportunity — rare, genuinely good idea<br />
            65–79: Moderate Potential — proceed with validation<br />
            45–64: High Risk — significant issues to resolve<br />
            0–44: Not Viable — fundamental flaws, consider pivot
          </div>
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Factor Explanations:</strong><br />
            Problem Strength: How painful and urgent is the problem<br />
            Market Demand: Size and growth of the target market<br />
            Competition: Higher = less competition (inverse scale)<br />
            Feasibility: Can a small team actually build and run this<br />
            Innovation: How novel is the approach vs existing options<br />
            Opportunity Gap: Whitespace competitors are not filling
          </div>
        </Accordion>

        <Accordion icon="❓" label="Frequently Asked Questions">
          <div style={{ marginBottom: 14 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Q: Why did my idea score lower than expected?</strong><br />
            A: FounderOS uses a Cynical Auditor approach. It applies dealbreaker rules for business models where unit economics are negative, trust barriers are insurmountable, or markets are dominated by funded giants. A low score means the idea needs fundamental rethinking, not just execution.
          </div>
          <div style={{ marginBottom: 14 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Q: Why do scores change between runs?</strong><br />
            A: The AI has a small randomness factor to simulate different analyst perspectives. If scores vary significantly, try submitting with more detail.
          </div>
          <div style={{ marginBottom: 14 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Q: Is my idea data private?</strong><br />
            A: Your ideas are sent to the AI model for analysis and stored in your session. They are not shared publicly or used to train AI models.
          </div>
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Q: How do I get better recommendations?</strong><br />
            A: Include the specific customer, geography, and business model. The more specific the idea, the more accurate the analysis.
          </div>
        </Accordion>

        <Accordion icon="💬" label="Contact Support" desc="Get help with FounderOS">
          <textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="Describe your issue or feedback..."
            style={{
              width: '100%', minHeight: 100, padding: 12, borderRadius: 8, fontSize: 13,
              background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
              color: 'var(--text-primary)', resize: 'vertical', outline: 'none',
              transition: 'border-color 200ms',
            }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
          />
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={handleFeedback} style={{
              background: 'var(--accent)', color: 'var(--text-inverse)', padding: '9px 20px',
              borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
              transition: 'background 150ms',
            }}>Send Feedback</button>
            {feedbackSent && <span style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 600 }}>Thank you! Your feedback has been recorded.</span>}
          </div>
        </Accordion>
      </div>

      {/* ──── SECTION F: ABOUT ──── */}
      <div style={{ padding: '20px 16px 8px' }}>
        {sectionHeader('About')}
        <div style={{
          background: 'var(--bg-elevated)', borderRadius: 10, padding: 16, textAlign: 'center',
          transition: 'background-color 300ms ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ width: 8, height: 8, background: 'var(--accent)', borderRadius: '50%', display: 'inline-block' }} />
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>FounderOS</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 12 }}>v1.0.0 — Initial Release</div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
            FounderOS is a startup forensic analysis engine that uses 8 specialized AI agents to evaluate startup ideas.
            It acts as a Cynical Auditor — finding reasons ideas will fail before founders invest time and money building them.
          </p>
          <div style={{ fontSize: 13, color: 'var(--accent)', fontStyle: 'italic', marginTop: 12 }}>
            Built for founders who want honest answers.
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: 16, paddingTop: 12, display: 'flex', gap: 16, justifyContent: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)', cursor: 'pointer', transition: 'color 150ms' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
          >Privacy Policy</span>
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)', cursor: 'pointer', transition: 'color 150ms' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
          >Terms of Service</span>
        </div>
      </div>
    </div>
  )
}
