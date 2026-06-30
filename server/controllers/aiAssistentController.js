const AIAssistent = require('../module/aiAssistentModel');
const { buildContext } = require('../services/aiContextService');
const { chat } = require('../services/aiService');

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */

/** Map JWT role string → Mongoose model name used in refPath */
const roleModelMap = { admin: 'Admin', teacher: 'Teacher', student: 'Student' };

/**
 * Find or create the active chat session for a user.
 * There is exactly ONE active session per user.
 */
const getOrCreateSession = async (userId, userRole) => {
    let session = await AIAssistent.findOne({ user: userId, userRole: roleModelMap[userRole] })
        .sort({ createdAt: -1 })
        .lean();

    if (!session) {
        const newSession = new AIAssistent({
            user: userId,
            userRole: roleModelMap[userRole],
            messages: [],
        });
        await newSession.save();
        session = newSession.toObject();
    }

    return session;
};

/* ─────────────────────────────────────────────
   SEND CHAT MESSAGE
   POST /api/ai-assistent/chat
   Body: { message: string }
   Auth: JWT cookie (req.user set by protect middleware)
───────────────────────────────────────────── */
const sendChatMessage = async (req, res, next) => {
    try {
        const { id: userId, role } = req.user;
        const { message } = req.body;

        if (!message || typeof message !== 'string' || !message.trim()) {
            return res.status(400).json({ success: false, message: 'message is required' });
        }

        // 1. Build live system prompt + sidebar stats from MongoDB
        const { systemPrompt, sidebarStats } = await buildContext(userId, role);

        // 2. Load existing session history
        const session = await getOrCreateSession(userId, role);

        // 3. Call Gemini with history + new message
        const assistantReply = await chat(systemPrompt, session.messages, message.trim());

        // 4. Persist both the user message and assistant reply to the session
        await AIAssistent.findByIdAndUpdate(session._id, {
            $push: {
                messages: {
                    $each: [
                        { role: 'user', content: message.trim(), timestamp: new Date() },
                        { role: 'assistant', content: assistantReply, timestamp: new Date() },
                    ],
                },
            },
        });

        return res.json({
            success: true,
            reply: assistantReply,
            sidebarStats,
        });

    } catch (error) {
        next(error);
    }
};

/* ─────────────────────────────────────────────
   GET CHAT HISTORY
   GET /api/ai-assistent/history
   Auth: JWT cookie
───────────────────────────────────────────── */
const getChatHistory = async (req, res, next) => {
    try {
        const { id: userId, role } = req.user;

        const session = await AIAssistent.findOne({
            user: userId,
            userRole: roleModelMap[role],
        }).sort({ createdAt: -1 });

        if (!session) {
            return res.json({ success: true, messages: [], sessionId: null });
        }

        return res.json({
            success: true,
            messages: session.messages,
            sessionId: session._id,
        });

    } catch (error) {
        next(error);
    }
};

/* ─────────────────────────────────────────────
   START NEW SESSION
   POST /api/ai-assistent/session
   Auth: JWT cookie
   Creates a fresh session document (old history is preserved in DB but ignored).
───────────────────────────────────────────── */
const startNewSession = async (req, res, next) => {
    try {
        const { id: userId, role } = req.user;

        const newSession = new AIAssistent({
            user: userId,
            userRole: roleModelMap[role],
            messages: [],
        });
        await newSession.save();

        return res.json({
            success: true,
            message: 'New session started',
            sessionId: newSession._id,
        });

    } catch (error) {
        next(error);
    }
};

/* ─────────────────────────────────────────────
   GET AI CONTEXT (sidebar stats)
   GET /api/ai-assistent/context
   Auth: JWT cookie
   Fetches live stats without sending a chat message.
───────────────────────────────────────────── */
const getAIContext = async (req, res, next) => {
    try {
        const { id: userId, role } = req.user;

        const { sidebarStats } = await buildContext(userId, role);

        return res.json({ success: true, sidebarStats });

    } catch (error) {
        next(error);
    }
};

/* ─────────────────────────────────────────────
   LEGACY STUBS (kept for router compatibility)
───────────────────────────────────────────── */
const getAIAssistents = async (req, res) => res.json({ success: true, data: [] });
const getAIAssistentById = async (req, res) => res.json({ success: false, message: 'Not implemented' });
const createAIAssistent = async (req, res) => res.json({ success: false, message: 'Use /session endpoint' });
const updateAIAssistent = async (req, res) => res.json({ success: false, message: 'Not implemented' });
const deleteAIAssistent = async (req, res) => res.json({ success: false, message: 'Not implemented' });

module.exports = {
    getAIAssistents,
    getAIAssistentById,
    createAIAssistent,
    updateAIAssistent,
    deleteAIAssistent,
    sendChatMessage,
    getChatHistory,
    startNewSession,
    getAIContext,
};
