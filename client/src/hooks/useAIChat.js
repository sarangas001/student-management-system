import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const BACKEND = import.meta.env.VITE_BACKEND_URL;

/**
 * useAIChat — Custom hook for the AI assistant chat system.
 *
 * Manages all server communication for:
 *   - Loading chat history (session-based)
 *   - Sending messages and receiving Gemini replies
 *   - Starting a new session
 *   - Fetching live sidebar stats
 *
 * @param {string} role - 'admin' | 'teacher' | 'student'
 * @returns {{
 *   messages: Array,
 *   sidebarStats: object,
 *   isLoading: boolean,
 *   isSending: boolean,
 *   error: string|null,
 *   sendMessage: (text: string) => Promise<void>,
 *   startNewSession: () => Promise<void>,
 *   clearError: () => void,
 * }}
 */
const useAIChat = (role) => {
    const [messages, setMessages] = useState([]);
    const [sidebarStats, setSidebarStats] = useState({});
    const [isLoading, setIsLoading] = useState(true);   // initial history load
    const [isSending, setIsSending] = useState(false);  // sending a message
    const [error, setError] = useState(null);

    // Track mount status to prevent state updates after unmount
    const mounted = useRef(true);
    useEffect(() => {
        mounted.current = true;
        return () => { mounted.current = false; };
    }, []);

    /* ── Load history + sidebar on mount ────────────────────── */
    const loadHistory = useCallback(async () => {
        if (!mounted.current) return;
        setIsLoading(true);
        setError(null);
        try {
            const [historyRes, contextRes] = await Promise.all([
                axios.get(`${BACKEND}/api/ai-assistent/history`, { withCredentials: true }),
                axios.get(`${BACKEND}/api/ai-assistent/context`, { withCredentials: true }),
            ]);

            if (!mounted.current) return;

            if (historyRes.data.success) {
                setMessages(historyRes.data.messages || []);
            }
            if (contextRes.data.success) {
                setSidebarStats(contextRes.data.sidebarStats || {});
            }
        } catch (err) {
            if (mounted.current) {
                setError('Failed to load chat history. Please refresh.');
                console.error('[useAIChat] loadHistory error:', err);
            }
        } finally {
            if (mounted.current) setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (role) loadHistory();
    }, [role, loadHistory]);

    /* ── Send a message ──────────────────────────────────────── */
    const sendMessage = useCallback(async (text) => {
        if (!text || !text.trim() || isSending) return;

        const userMessage = { role: 'user', content: text.trim(), timestamp: new Date().toISOString() };

        // Optimistically append user message
        setMessages(prev => [...prev, userMessage]);
        setIsSending(true);
        setError(null);

        try {
            const { data } = await axios.post(
                `${BACKEND}/api/ai-assistent/chat`,
                { message: text.trim() },
                { withCredentials: true }
            );

            if (!mounted.current) return;

            if (data.success) {
                const assistantMessage = {
                    role: 'assistant',
                    content: data.reply,
                    timestamp: new Date().toISOString(),
                };
                setMessages(prev => [...prev, assistantMessage]);

                // Update sidebar stats with fresh data from response
                if (data.sidebarStats) {
                    setSidebarStats(data.sidebarStats);
                }
            } else {
                setError(data.message || 'Failed to get a response.');
                // Remove the optimistic user message on failure
                setMessages(prev => prev.slice(0, -1));
            }
        } catch (err) {
            if (mounted.current) {
                setError('Network error — could not reach the AI assistant.');
                setMessages(prev => prev.slice(0, -1));
                console.error('[useAIChat] sendMessage error:', err);
            }
        } finally {
            if (mounted.current) setIsSending(false);
        }
    }, [isSending]);

    /* ── Start a new session ─────────────────────────────────── */
    const startNewSession = useCallback(async () => {
        setError(null);
        try {
            const { data } = await axios.post(
                `${BACKEND}/api/ai-assistent/session`,
                {},
                { withCredentials: true }
            );

            if (!mounted.current) return;

            if (data.success) {
                setMessages([]);
            } else {
                setError('Could not start a new session.');
            }
        } catch (err) {
            if (mounted.current) {
                setError('Network error — could not start new session.');
                console.error('[useAIChat] startNewSession error:', err);
            }
        }
    }, []);

    const clearError = useCallback(() => setError(null), []);

    return {
        messages,
        sidebarStats,
        isLoading,
        isSending,
        error,
        sendMessage,
        startNewSession,
        clearError,
    };
};

export default useAIChat;
