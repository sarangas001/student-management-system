const OpenAI = require('openai');

require('dotenv').config();

// Initialise once — OpenAI SDK pointed at the Gemini OpenAI-compat endpoint
const openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: process.env.GEMINI_BASE_URL,
});

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

/**
 * Send a conversation to Gemini and get back the assistant reply.
 *
 * @param {string} systemPrompt   - The role-scoped system prompt with live data injected
 * @param {Array}  history        - Array of { role: 'user'|'assistant', content: string }
 *                                  (last N messages from the DB session)
 * @param {string} userMessage    - The newest message from the user
 * @returns {Promise<string>}     - The assistant's reply text
 */
const chat = async (systemPrompt, history = [], userMessage) => {
    // Cap history to last 20 exchanges to stay within token limits
    const cappedHistory = history.slice(-20);

    const messages = [
        { role: 'system', content: systemPrompt },
        // Map stored messages to the OpenAI message format
        ...cappedHistory.map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
        })),
        { role: 'user', content: userMessage },
    ];

    const response = await openai.chat.completions.create({
        model: MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 1024,
    });

    return response.choices[0]?.message?.content ?? 'Sorry, I could not generate a response.';
};

module.exports = { chat };
