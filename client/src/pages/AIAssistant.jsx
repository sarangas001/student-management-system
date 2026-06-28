import { useEffect, useRef, useState, useCallback } from 'react';
import { Lock, Shield, Bot, Send, RefreshCw, AlertCircle, Loader2, Database, Lightbulb, X } from 'lucide-react';
import useAIChat from '../hooks/useAIChat';
import { AI_ROLES } from '../util/context';

/* ─────────────────────────────────────────────
   ROLE THEME CONFIG
───────────────────────────────────────────── */
const ROLE_THEME = {
    admin: { from: '#7c3aed', to: '#1a5faa', bg: 'from-[#7c3aed] to-[#1a5faa]', notice: 'bg-[#ede9fe]', chipColor: '#7c3aed' },
    teacher: { from: '#0f766e', to: '#1a5faa', bg: 'from-[#0f766e] to-[#1a5faa]', notice: 'bg-[#e0f2f1]', chipColor: '#0f766e' },
    student: { from: '#b45309', to: '#1a5faa', bg: 'from-[#b45309] to-[#1a5faa]', notice: 'bg-[#fff8e1]', chipColor: '#b45309' },
};

/* ─────────────────────────────────────────────
   MESSAGE BUBBLE
───────────────────────────────────────────── */
const MessageBubble = ({ msg, theme }) => {
    const isUser = msg.role === 'user';

    // Basic markdown-like rendering: **bold**, `code`, newlines
    const formatContent = (text) => {
        const lines = text.split('\n');
        return lines.map((line, i) => {
            const formatted = line
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/`([^`]+)`/g, '<code style="background:rgba(0,0,0,.07);padding:1px 5px;border-radius:4px;font-size:12px">$1</code>');
            return (
                <span key={i}>
                    <span dangerouslySetInnerHTML={{ __html: formatted }} />
                    {i < lines.length - 1 && <br />}
                </span>
            );
        });
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: isUser ? 'row-reverse' : 'row',
            gap: '10px',
            alignItems: 'flex-start',
            padding: '4px 0',
        }}>
            {/* Avatar */}
            {!isUser && (
                <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,.15)',
                }}>
                    <Bot size={15} color="#fff" />
                </div>
            )}

            {/* Bubble */}
            <div style={{
                maxWidth: '75%',
                padding: '10px 14px',
                borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: isUser
                    ? `linear-gradient(135deg, ${theme.from}, ${theme.to})`
                    : 'var(--card, #fff)',
                color: isUser ? '#fff' : 'var(--text1, #1a1a2e)',
                fontSize: 13.5,
                lineHeight: 1.6,
                boxShadow: isUser
                    ? `0 2px 12px ${theme.from}44`
                    : '0 1px 4px rgba(0,0,0,.08)',
                border: isUser ? 'none' : '1px solid var(--border, #e2e8f0)',
                wordBreak: 'break-word',
            }}>
                {formatContent(msg.content)}
                <div style={{
                    fontSize: 10, marginTop: 4, opacity: 0.6,
                    textAlign: isUser ? 'left' : 'right',
                    color: isUser ? 'rgba(255,255,255,0.8)' : 'var(--text2)',
                }}>
                    {msg.timestamp
                        ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : ''}
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   TYPING INDICATOR
───────────────────────────────────────────── */
const TypingIndicator = ({ theme }) => (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '4px 0' }}>
        <div style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <Bot size={15} color="#fff" />
        </div>
        <div style={{
            padding: '12px 16px', borderRadius: '18px 18px 18px 4px',
            background: 'var(--card, #fff)', border: '1px solid var(--border, #e2e8f0)',
            boxShadow: '0 1px 4px rgba(0,0,0,.08)',
            display: 'flex', gap: 5, alignItems: 'center',
        }}>
            {[0, 1, 2].map(i => (
                <div key={i} style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: theme.from, opacity: 0.6,
                    animation: `aiTypingDot 1.2s ${i * 0.2}s infinite ease-in-out`,
                }} />
            ))}
        </div>
    </div>
);

/* ─────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────── */
const EmptyState = ({ cfg, theme, onChipClick }) => (
    <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '24px 20px', gap: 16,
    }}>
        <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 8px 24px ${theme.from}44`,
        }}>
            <Bot size={28} color="#fff" />
        </div>
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text1)', marginBottom: 6 }}>
                {cfg.title}
            </div>
            <div style={{
                fontSize: 13, color: 'var(--text2)', lineHeight: 1.7,
                whiteSpace: 'pre-line',
            }}>
                {cfg.greeting.replace(/\*\*/g, '')}
            </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 8 }}>
            {cfg.chips.map((chip, i) => (
                <button key={i} onClick={() => onChipClick(chip)} style={{
                    padding: '6px 14px', borderRadius: 20,
                    border: `1.5px solid ${theme.from}55`,
                    background: `${theme.from}0d`,
                    color: theme.from, fontSize: 12.5, fontWeight: 600,
                    cursor: 'pointer', transition: 'all .2s',
                }}
                    onMouseEnter={e => { e.target.style.background = `${theme.from}22`; }}
                    onMouseLeave={e => { e.target.style.background = `${theme.from}0d`; }}
                >
                    {chip}
                </button>
            ))}
        </div>
    </div>
);

/* ─────────────────────────────────────────────
   MAIN AI ASSISTANT PAGE
───────────────────────────────────────────── */
const AIAssistant = ({ role }) => {
    const cfg = AI_ROLES[role];
    const theme = ROLE_THEME[role] || ROLE_THEME.student;

    const { messages, sidebarStats, isLoading, isSending, error, sendMessage, startNewSession, clearError } = useAIChat(role);

    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isSending]);

    // Handle textarea auto-resize
    const handleInput = (e) => {
        setInputValue(e.target.value);
        const el = e.target;
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    };

    const handleSend = useCallback(() => {
        if (!inputValue.trim() || isSending) return;
        sendMessage(inputValue);
        setInputValue('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    }, [inputValue, isSending, sendMessage]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleChipClick = (chip) => {
        setInputValue(chip);
        textareaRef.current?.focus();
    };

    // Sidebar stats: merge live server data with static fallbacks
    const displayStats = Object.keys(sidebarStats).length > 0
        ? Object.entries(sidebarStats)
        : cfg.sidebarStats;

    return (
        <div id="ai-assistant">
            {/* Typing animation keyframes */}
            <style>{`
                @keyframes aiTypingDot {
                    0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
                    40% { transform: scale(1.1); opacity: 1; }
                }
            `}</style>

            <div className="ai-page-wrap">
                {/* ── Main Chat Panel ────────────────────────────────── */}
                <div className="ai-full-chat">

                    {/* Header */}
                    <div className={`ai-full-head bg-linear-to-br ${theme.bg}`} id="ai-full-head">
                        <i className="ti ti-robot" style={{ fontSize: 22 }} />
                        <div>
                            <div className="ai-full-title" id="ai-full-title">{cfg.title}</div>
                            <div className="ai-full-sub" id="ai-full-sub">{cfg.sub}</div>
                        </div>
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                            {/* Role badge */}
                            <div id="ai-role-badge" style={{
                                background: 'rgba(255,255,255,.22)', padding: '4px 12px',
                                borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: '.05em',
                            }}>
                                {cfg.label}
                            </div>
                            {/* New Chat button */}
                            <button
                                onClick={startNewSession}
                                title="Start new chat"
                                style={{
                                    background: 'rgba(255,255,255,.2)', border: '1px solid rgba(255,255,255,.35)',
                                    borderRadius: 20, padding: '5px 12px', color: '#fff',
                                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: 5,
                                    transition: 'background .2s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.32)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.2)'}
                            >
                                <RefreshCw size={12} /> New Chat
                            </button>
                        </div>
                    </div>

                    {/* Access notice (teacher & student only) */}
                    {role !== 'admin' && cfg.notice && (
                        <div id="ai-access-notice" className={`flex text-[12px] ${theme.notice}`} style={{
                            padding: '9px 16px', fontSize: 12, alignItems: 'center',
                            gap: 8, borderBottom: '1px solid var(--border)',
                        }}>
                            {role === 'student'
                                ? <Lock size={14} style={{ color: '#b45309', flexShrink: 0 }} />
                                : <Shield size={14} style={{ color: '#0f766e', flexShrink: 0 }} />
                            }
                            <span className="text-[--text2]">
                                <strong className="font-bold">{cfg.notice.boldText}</strong>{' '}
                                {cfg.notice.normalText}
                            </span>
                        </div>
                    )}

                    {/* Error banner */}
                    {error && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
                            background: '#fef2f2', borderBottom: '1px solid #fecaca',
                            fontSize: 12.5, color: '#dc2626',
                        }}>
                            <AlertCircle size={14} />
                            <span style={{ flex: 1 }}>{error}</span>
                            <button onClick={clearError} style={{
                                background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626',
                            }}>
                                <X size={13} />
                            </button>
                        </div>
                    )}

                    {/* Messages area */}
                    <div className="ai-full-msgs" id="full-msgs" style={{ padding: '16px 20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>

                        {isLoading ? (
                            <div style={{
                                flex: 1, display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--text2)',
                            }}>
                                <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} />
                                <span style={{ fontSize: 13 }}>Loading your conversation…</span>
                                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                            </div>
                        ) : messages.length === 0 ? (
                            <EmptyState cfg={cfg} theme={theme} onChipClick={handleChipClick} />
                        ) : (
                            messages.map((msg, i) => (
                                <MessageBubble key={i} msg={msg} theme={theme} />
                            ))
                        )}

                        {/* Typing indicator */}
                        {isSending && <TypingIndicator theme={theme} />}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick suggestion chips */}
                    {messages.length > 0 && !isSending && (
                        <div className="ai-chips" id="full-chips" style={{ padding: '8px 16px', display: 'flex', gap: 6, flexWrap: 'wrap', borderTop: '1px solid var(--border)' }}>
                            {cfg.chips.slice(0, 4).map((c, i) => (
                                <span key={i} className="ai-chip" style={{ cursor: 'pointer' }}
                                    onClick={() => handleChipClick(c)}>
                                    {c}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Input bar */}
                    <div className="ai-full-input">
                        <textarea
                            ref={textareaRef}
                            id="full-input"
                            rows={1}
                            value={inputValue}
                            onChange={handleInput}
                            onKeyDown={handleKeyDown}
                            placeholder={cfg.fullPlaceholder}
                            disabled={isSending || isLoading}
                            style={{ resize: 'none', overflow: 'hidden', maxHeight: 120, transition: 'height .1s' }}
                        />
                        <button
                            className={`ai-send-full bg-linear-to-br ${theme.bg}`}
                            id="full-send-btn"
                            onClick={handleSend}
                            disabled={isSending || isLoading || !inputValue.trim()}
                            style={{ opacity: (isSending || !inputValue.trim()) ? 0.6 : 1, transition: 'opacity .2s' }}
                        >
                            {isSending
                                ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                                : <Send size={14} />
                            }
                            {isSending ? 'Thinking…' : 'Ask'}
                        </button>
                    </div>
                </div>

                {/* ── Right Sidebar ──────────────────────────────────── */}
                <div className="ai-sidebar-panel" id="ai-sidebar-panel">

                    {/* Live data card */}
                    <div className="ai-data-card">
                        <div className="ai-data-title">
                            <Database size={13} style={{ marginRight: 5 }} />
                            {isLoading ? 'Loading data…' : cfg.sidebarLabel}
                        </div>
                        {isLoading ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', color: 'var(--text2)', fontSize: 12 }}>
                                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                                Fetching live data…
                            </div>
                        ) : (
                            displayStats.map(([k, v], i) => (
                                <div key={i} className="ai-data-item">
                                    <span>{k}</span>
                                    <span style={{
                                        fontWeight: 700,
                                        color: String(v).includes('⚠️') ? '#b45309' : 'var(--text1)',
                                    }}>{v}</span>
                                </div>
                            ))
                        )}
                        {/* Live indicator */}
                        {!isLoading && (
                            <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'aiPulse 2s infinite' }} />
                                Live data from database
                                <style>{`@keyframes aiPulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
                            </div>
                        )}
                    </div>

                    {/* Suggestion prompts card */}
                    <div className="ai-data-card">
                        <div className="ai-suggest-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Lightbulb size={13} /> Try asking…
                        </div>
                        {cfg.sidebarSuggestions.map((suggestion, i) => (
                            <button key={i} className="ai-suggest-chip"
                                onClick={() => handleChipClick(suggestion)}>
                                {suggestion}
                            </button>
                        ))}
                    </div>

                    {/* Session info */}
                    <div className="ai-data-card" style={{ fontSize: 11.5, color: 'var(--text2)', gap: 4, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 12, color: 'var(--text1)' }}>💬 Session Info</div>
                        <div>Messages in session: <strong>{messages.length}</strong></div>
                        <div>Role access: <strong>{cfg.label}</strong></div>
                        <button onClick={startNewSession} style={{
                            marginTop: 8, padding: '6px 12px', borderRadius: 8,
                            background: 'var(--bg2, #f1f5f9)', border: '1px solid var(--border)',
                            color: 'var(--text2)', fontSize: 11.5, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 5, width: '100%',
                            justifyContent: 'center', transition: 'background .2s',
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg2, #f1f5f9)'}
                        >
                            <RefreshCw size={11} /> Clear & Start New Chat
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIAssistant;