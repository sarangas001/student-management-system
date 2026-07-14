const OpenAI = require('openai');

require('dotenv').config();

// Initialise once — OpenAI SDK pointed at the Gemini OpenAI-compat endpoint
const openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: process.env.GEMINI_BASE_URL,
});

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.1-flash-lite';

// Retry config
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // base delay; doubles each attempt

/** Sleep helper */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Returns true for transient errors worth retrying (503 Service Unavailable,
 * 429 Too Many Requests, 500 Internal Server Error).
 */
const isRetryable = (error) => {
    const status = error?.status ?? error?.statusCode;
    return status === 503 || status === 429 || status === 500;
};

/**
 * Send a conversation to Gemini and get back the assistant reply.
 * Automatically retries up to MAX_RETRIES times on transient errors,
 * then falls back to FALLBACK_MODEL before giving up.
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

    let lastError;

    // --- Retry loop with primary model ---
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await openai.chat.completions.create({
                model: MODEL,
                messages,
                temperature: 0.7,
                max_tokens: 1024,
            });

            return response.choices[0]?.message?.content ?? 'Sorry, I could not generate a response.';
        } catch (error) {
            lastError = error;

            if (!isRetryable(error)) {
                // Non-transient error (e.g. 400 bad request, 401 auth) — fail fast
                throw error;
            }

            console.warn(
                `[aiService] Gemini ${error?.status ?? 'unknown'} error on attempt ${attempt}/${MAX_RETRIES}. ` +
                `Retrying in ${RETRY_DELAY_MS * attempt}ms...`
            );

            await sleep(RETRY_DELAY_MS * attempt); // exponential backoff: 1s, 2s, 3s
        }
    }

    // --- All retries exhausted — try fallback model once ---
    console.warn(`[aiService] Primary model "${MODEL}" unavailable. Trying fallback "${FALLBACK_MODEL}"...`);
    try {
        const response = await openai.chat.completions.create({
            model: FALLBACK_MODEL,
            messages,
            temperature: 0.7,
            max_tokens: 1024,
        });

        return response.choices[0]?.message?.content ?? 'Sorry, I could not generate a response.';
    } catch (fallbackError) {
        console.error('[aiService] Fallback model also failed:', fallbackError?.message ?? fallbackError);
        // Re-throw the original error so the caller gets a meaningful status code
        throw lastError;
    }
};

module.exports = { chat };

