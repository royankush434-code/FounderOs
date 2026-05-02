'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, MessageSquare, Bot } from 'lucide-react';

interface AIAdvisorOrbProps {
  idea: string;
  analysisResult: any;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAdvisorOrb({ idea, analysisResult }: AIAdvisorOrbProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I'm your Forensic AI Advisor. I've analyzed your idea for "${idea}". My mission is to help you navigate the data and find the most profitable path. What's on your mind?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          idea,
          analysisResult
        })
      });

      const data = await response.json();
      if (data.content) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error processing that." }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Something went wrong. Please check your connection." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '100px', right: '40px', zIndex: 1000 }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.8, y: 20, filter: 'blur(10px)' }}
            style={{
              position: 'absolute',
              bottom: '90px',
              right: '0',
              width: '420px',
              height: '580px',
              background: 'rgba(13, 17, 23, 0.85)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(0, 230, 118, 0.15)',
              borderRadius: '24px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 24px rgba(0, 230, 118, 0.05)',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(0, 230, 118, 0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0D1117'
                }}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>Forensic Advisor</div>
                  <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Agent Online</div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{ color: 'var(--text-tertiary)', padding: '4px', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Messages */}
            <div
              ref={scrollRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%'
                  }}
                >
                  <div style={{
                    background: m.role === 'user' ? 'rgba(0, 230, 118, 0.12)' : 'rgba(255,255,255,0.03)',
                    border: m.role === 'user' ? '1px solid rgba(0, 230, 118, 0.2)' : '1px solid rgba(255,255,255,0.08)',
                    padding: '12px 16px',
                    borderRadius: m.role === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: m.role === 'user' ? 'var(--text-primary)' : 'rgba(255,255,255,0.88)'
                  }}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div style={{ alignSelf: 'flex-start' }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '12px 16px',
                    borderRadius: '18px 18px 18px 2px',
                    display: 'flex',
                    gap: '4px'
                  }}>
                    {[0, 1, 2].map(n => (
                      <motion.div
                        key={n}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1.2, delay: n * 0.2 }}
                        style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask your advisor about the report..."
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  style={{
                    color: input.trim() ? 'var(--accent)' : 'var(--text-tertiary)',
                    transition: 'all 0.2s'
                  }}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Orb (Concept 3) */}
      <motion.button
        whileHover={{ scale: 1.1, y: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: 'none',
          padding: 0,
          background: 'transparent'
        }}
      >
        {/* Outer Glow Ring */}
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.05, 1],
            boxShadow: [
              '0 0 20px rgba(0, 230, 118, 0.2)',
              '0 0 40px rgba(0, 230, 118, 0.4)',
              '0 0 20px rgba(0, 230, 118, 0.2)'
            ]
          }}
          transition={{
            rotate: { duration: 10, repeat: Infinity, ease: 'linear' },
            scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
            boxShadow: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
          }}
          style={{
            position: 'absolute',
            inset: '-2px',
            borderRadius: '50%',
            background: 'conic-gradient(from 0deg, transparent, var(--accent), transparent 60deg, var(--accent), transparent 120deg, var(--accent), transparent)',
            opacity: 0.4,
            filter: 'blur(2px)'
          }}
        />

        {/* Inner Glass Orb */}
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(0, 230, 118, 0.3) 0%, rgba(13, 17, 23, 0.8) 50%, rgba(0, 230, 118, 0.2) 100%)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
          position: 'relative',
          boxShadow: 'inset 0 0 15px rgba(255,255,255,0.1)'
        }}>
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              style={{ color: 'var(--accent)' }}
            >
              <Sparkles size={28} />
            </motion.div>
          ) : (
            isOpen ? (
              <X size={28} style={{ color: 'var(--accent)' }} />
            ) : (
              <MessageSquare size={28} style={{ color: 'var(--accent)' }} />
            )
          )}
        </div>

        {/* Pulse Animations */}
        <motion.div
          animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '1px solid var(--accent)',
            zIndex: 1,
            pointerEvents: 'none'
          }}
        />
      </motion.button>
    </div>
  );
}
