import { useRef, useState, useCallback, useEffect } from 'react';
import { Bot, X, Send, Loader2, RefreshCw } from 'lucide-react';
import useAIChat from '../hooks/useAIChat';
import { AI_ROLES } from '../util/context';

const ROLE_THEME = {
    admin:   { from: '#7c3aed', to: '#1a5faa', gradClass: 'from-[#7c3aed] to-[#1a5faa]' },
    teacher: { from: '#0f766e', to: '#1a5faa', gradClass: 'from-[#0f766e] to-[#1a5faa]' },
    student: { from: '#b45309', to: '#1a5faa', gradClass: 'from-[#b45309] to-[#1a5faa]' },
};

const AIFloatingPanel = ({ role, isOpen, onClose }) => {
    const cfg = AI_ROLES[role];
    const theme = ROLE_THEME[role] || ROLE_THEME.student;

    const { messages, isLoading, isSending, sendMessage, startNewSession } = useAIChat(role);

    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isSending]);

    const handleSend = useCallback(() => {
        if (!inputValue.trim() || isSending) return;
        sendMessage(inputValue.trim());
        setInputValue('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }, [inputValue, isSending, sendMessage]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    // Format simple markdown
    const formatContent = (text) =>
        text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');

    if (!isOpen || !role) return null;

    return (
        <div id="ai-panel">
            {/* Panel header */}
            <div className={`ai-panel-head bg-linear-to-br ${theme.gradClass}`} id="panel-head">
                <Bot size={16} style={{ color: '#fff' }} />
                <span className="ai-panel-title" id="panel-title">{cfg?.title || 'AI Assistant'}</span>
                <span id="panel-role-chip" style={{
                    marginLeft: 'auto', marginRight: 4, padding: '2px 8px',
                    borderRadius: 20, fontSize: 10, fontWeight: 700,
                    background: 'rgba(255,255,255,.25)', color: '#fff',
                }}>
                    {cfg?.label}
                </span>
                <button onClick={startNewSession} title="New chat" style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#fff', opacity: 0.8, padding: '2px', marginRight: 2,
                }}>
                    <RefreshCw size={13} />
                </button>
                <button className="ai-panel-close" onClick={onClose}>
                    <X size={14} />
                </button>
            </div>

            {/* Access notice */}
            {role !== 'admin' && cfg?.notice && (
                <div id="panel-notice" style={{
                    display: 'flex', padding: '7px 12px', fontSize: 11,
                    borderBottom: '1px solid var(--border)', alignItems: 'center',
                    gap: 6, background: role === 'student' ? '#fff8e1' : '#e0f2f1',
                    color: 'var(--text2)',
                }}>
                    <span>🔒</span>
                    <span><strong>{cfg.notice.boldText}</strong> {cfg.notice.normalText}</span>
                </div>
            )}

            {/* Messages */}
            <div className="ai-msgs" id="panel-msgs" style={{ overflowY: 'auto', flex: 1, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {isLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8, color: 'var(--text2)', fontSize: 12 }}>
                        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                        Loading…
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : messages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text2)', fontSize: 12, padding: '20px 8px', lineHeight: 1.6 }}>
                        <Bot size={28} style={{ color: theme.from, marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
                        <strong style={{ color: 'var(--text1)' }}>Hi! I'm your AI assistant.</strong>
                        <br />Try one of the suggestions below.
                    </div>
                ) : (
                    messages.map((msg, i) => {
                        const isUser = msg.role === 'user';
                        return (
                            <div key={i} style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
                                <div style={{
                                    maxWidth: '85%', padding: '8px 12px', borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                                    background: isUser
                                        ? `linear-gradient(135deg, ${theme.from}, ${theme.to})`
                                        : 'var(--card, #fff)',
                                    color: isUser ? '#fff' : 'var(--text1)',
                                    fontSize: 12.5, lineHeight: 1.55,
                                    border: isUser ? 'none' : '1px solid var(--border)',
                                    boxShadow: isUser ? `0 2px 8px ${theme.from}33` : '0 1px 3px rgba(0,0,0,.07)',
                                    wordBreak: 'break-word',
                                }}
                                    dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                                />
                            </div>
                        );
                    })
                )}

                {/* Typing indicator */}
                {isSending && (
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '4px 0' }}>
                        {[0, 1, 2].map(i => (
                            <div key={i} style={{
                                width: 7, height: 7, borderRadius: '50%',
                                background: theme.from,
                                animation: `aiTypingDot 1.2s ${i * 0.2}s infinite ease-in-out`,
                            }} />
                        ))}
                        <style>{`
                            @keyframes aiTypingDot {
                                0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
                                40% { transform: scale(1.1); opacity: 1; }
                            }
                        `}</style>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick chips */}
            <div className="ai-chips" style={{ padding: '6px 10px', display: 'flex', gap: 5, flexWrap: 'wrap', borderTop: '1px solid var(--border)' }}>
                {(cfg?.panelChips || []).map((chip, i) => (
                    <span key={i} className="ai-chip" style={{ cursor: 'pointer', fontSize: 11 }}
                        onClick={() => sendMessage(chip)}>
                        {chip}
                    </span>
                ))}
            </div>

            {/* Input row */}
            <div className="ai-input-row">
                <textarea
                    ref={textareaRef}
                    id="panel-input"
                    rows={1}
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={cfg?.panelPlaceholder || 'Ask a question…'}
                    disabled={isSending || isLoading}
                    style={{ resize: 'none', overflow: 'hidden' }}
                />
                <button
                    className={`ai-send-btn bg-linear-to-br ${theme.gradClass}`}
                    id="panel-send-btn"
                    onClick={handleSend}
                    disabled={isSending || !inputValue.trim()}
                    style={{ opacity: (isSending || !inputValue.trim()) ? 0.6 : 1 }}
                >
                    {isSending
                        ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                        : <Send size={13} />
                    }
                </button>
            </div>
        </div>
    );
};

export default AIFloatingPanel;