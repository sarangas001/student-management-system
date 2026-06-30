# AI Chat Assistant — Full Technical Report

## Overview

The AI assistant is now a **fully live, session-persisted, role-aware chat system** built end-to-end across the student management portal. Every message is answered by **Gemini 2.5 Flash** (via the OpenAI SDK compatibility layer) using **real data fetched from MongoDB at request time** — no hardcoded strings.

---

## Architecture

```
Browser (React)                          Node.js Server (Express)
────────────────────────                 ─────────────────────────────────────
App.jsx                                  authMiddleware.js  ← decodes JWT cookie
  ├── AIAssistant.jsx  (full page)            │
  ├── AIFloatingPanel.jsx  (mini)        aiAssistentRoutes.js  ← 4 protected endpoints
  └── useAIChat.js  (custom hook)             │
         │  axios calls                  aiAssistentController.js
         │                                    ├── sendChatMessage()
         │                                    ├── getChatHistory()
         │                                    ├── startNewSession()
         │                                    └── getAIContext()
         │                                         │
         │                                    aiContextService.js  ← live DB queries
         │                                    aiService.js         ← Gemini SDK client
         │                                         │
         └─────────── MongoDB ─────────────────────┘
                      AIAssistent collection (sessions + messages)
                      Student, Teacher, Admin, Course, Grade, Attendance
```

---

## File Changes Summary

| File | Status | Purpose |
|---|---|---|
| `server/shared/authMiddleware.js` | **NEW** | JWT cookie → `req.user = {id, role}` |
| `server/services/aiService.js` | **NEW** | OpenAI SDK → Gemini chat wrapper |
| `server/services/aiContextService.js` | **NEW** | Live MongoDB data → system prompt builder |
| `server/controllers/aiAssistentController.js` | **REWRITTEN** | 4 fully implemented endpoints |
| `server/routes/aiAssistentRoutes.js` | **UPDATED** | Auth middleware + new routes |
| `client/src/hooks/useAIChat.js` | **NEW** | All API calls + chat state management |
| `client/src/pages/AIAssistant.jsx` | **REWRITTEN** | Full interactive chat page |
| `client/src/components/AIFloatingPanel.jsx` | **REWRITTEN** | Live mini chat panel |
| `client/src/App.jsx` | **UPDATED** | FAB toggle wiring |

---

## 1. Authentication Middleware

**File:** [`authMiddleware.js`](file:///d:/Node%20JS/student-management-system/server/shared/authMiddleware.js)

All AI endpoints are protected. The middleware reads the `token` httpOnly cookie that is set on login, verifies it with `JWT_SECRET`, and attaches the decoded user to the request:

```js
// server/shared/authMiddleware.js
const protect = (req, res, next) => {
    const { token } = req.cookies;
    if (!token) return res.status(401).json({ success: false, message: 'Not authenticated' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };  // attached for all downstream handlers
    next();
};
```

Applied to all AI routes:
```js
// aiAssistentRoutes.js
router.post('/chat',    protect, aiAssistentController.sendChatMessage);
router.get('/history',  protect, aiAssistentController.getChatHistory);
router.post('/session', protect, aiAssistentController.startNewSession);
router.get('/context',  protect, aiAssistentController.getAIContext);
```

---

## 2. AI Service (Gemini via OpenAI SDK)

**File:** [`aiService.js`](file:///d:/Node%20JS/student-management-system/server/services/aiService.js)

The project already has `openai@6.45.0` installed and Gemini env vars set. The service wraps a single `chat()` call:

```js
// server/services/aiService.js
const openai = new OpenAI({
    apiKey:  process.env.GEMINI_API_KEY,    // AQ.Ab8RN6Id7...
    baseURL: process.env.GEMINI_BASE_URL,   // https://generativelanguage.googleapis.com/v1beta/openai/
});

const chat = async (systemPrompt, history = [], userMessage) => {
    const cappedHistory = history.slice(-20);   // token budget protection

    const messages = [
        { role: 'system', content: systemPrompt },
        ...cappedHistory.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
        { role: 'user',   content: userMessage },
    ];

    const response = await openai.chat.completions.create({
        model: process.env.GEMINI_MODEL,    // gemini-2.5-flash
        messages,
        temperature: 0.7,
        max_tokens:  1024,
    });

    return response.choices[0]?.message?.content ?? 'Sorry, I could not generate a response.';
};
```

**Key design choices:**
- History is capped at 20 messages to stay within Gemini's token window
- Temperature `0.7` — factual but not robotic
- `max_tokens: 1024` — enough for detailed academic answers

---

## 3. Context Service — Role-Scoped Live Data

**File:** [`aiContextService.js`](file:///d:/Node%20JS/student-management-system/server/services/aiContextService.js)

This is the heart of the system. It fetches real data from MongoDB and builds a role-scoped system prompt injected into every Gemini request.

### Admin Context
```js
// Fetches EVERYTHING — no restrictions
const buildAdminContext = async () => {
    const [students, teachers, courses, attendanceRecords, grades] = await Promise.all([
        Student.find().select('studentId firstName lastName department yearOfStudy enrolledCourses'),
        Teacher.find().select('teacherId firstName lastName department'),
        Course.find().populate('teacher', 'firstName lastName'),
        Attendance.find().populate('student', 'studentId firstName lastName').populate('course', 'code'),
        Grade.find({ published: true }).populate('student', 'studentId firstName lastName').populate('course', 'code'),
    ]);

    // Compute at-risk count, avg GPA, avg attendance...
    // Build system prompt with ALL data injected
    const systemPrompt = `You are an AI assistant for the Administrator of the SMS...
=== ALL STUDENTS ===
FC222010 | R.A.D.S. Methmini | Computing | Year 2 | Att: 86% | GPA: 3.50
FC222015 | K.G.A.K. Sathsarani | Computing | Year 2 | Att: 87% | GPA: 3.70
...

=== COURSES ===
CS301 Software Engineering | Teacher: T. Gunawardena | 3 credits | Active
...`;
};
```

### Teacher Context
```js
// Scoped to only this teacher's courses and their enrolled students
const buildTeacherContext = async (userId) => {
    const teacher = await Teacher.findById(userId)
        .populate({ path: 'assignedCourses', select: '_id code name credits department status' });

    const courseIds = teacher.assignedCourses.map(c => c._id);

    const [students, attendanceRecords, grades] = await Promise.all([
        Student.find({ enrolledCourses: { $in: courseIds } }),  // only enrolled students
        Attendance.find({ course: { $in: courseIds } }),         // only for these courses
        Grade.find({ course: { $in: courseIds } }),              // only their grades
    ]);

    // System prompt: "You CANNOT discuss other courses or students..."
};
```

### Student Context
```js
// Only this student's own records — published grades only
const buildStudentContext = async (userId) => {
    const student = await Student.findById(userId).populate('enrolledCourses');
    const courseIds = student.enrolledCourses.map(c => c._id);

    const [attendanceRecords, grades] = await Promise.all([
        Attendance.find({ student: userId, course: { $in: courseIds } }),  // own attendance
        Grade.find({ student: userId, published: true }),                   // own published grades ONLY
    ]);

    // System prompt: "CRITICAL PRIVACY RULES: Never reveal other students' data..."
};
```

### Output shape
```js
return {
    systemPrompt: "...",   // injected into every Gemini message
    sidebarStats: {         // displayed in the right sidebar of the UI
        'Total Students': 1248,
        'Avg Attendance': '87%',
        ...
    }
};
```

---

## 4. AI Controller — 4 Endpoints

**File:** [`aiAssistentController.js`](file:///d:/Node%20JS/student-management-system/server/controllers/aiAssistentController.js)

### `POST /api/ai-assistent/chat`
The main endpoint — the complete flow per message:

```js
const sendChatMessage = async (req, res) => {
    const { id: userId, role } = req.user;  // from JWT cookie via protect middleware
    const { message } = req.body;

    // Step 1: Fetch live DB data + build role-scoped system prompt
    const { systemPrompt, sidebarStats } = await buildContext(userId, role);

    // Step 2: Load existing session history from MongoDB
    const session = await getOrCreateSession(userId, role);

    // Step 3: Call Gemini with [system prompt + history + new message]
    const assistantReply = await chat(systemPrompt, session.messages, message.trim());

    // Step 4: Persist both messages to the session document
    await AIAssistent.findByIdAndUpdate(session._id, {
        $push: {
            messages: {
                $each: [
                    { role: 'user',      content: message.trim(), timestamp: new Date() },
                    { role: 'assistant', content: assistantReply, timestamp: new Date() },
                ],
            },
        },
    });

    return res.json({ success: true, reply: assistantReply, sidebarStats });
};
```

### `GET /api/ai-assistent/history`
Returns the current session's messages (used on page load):
```js
const getChatHistory = async (req, res) => {
    const session = await AIAssistent.findOne({
        user: userId,
        userRole: roleModelMap[role],
    }).sort({ createdAt: -1 });  // most recent session

    return res.json({ success: true, messages: session.messages, sessionId: session._id });
};
```

### `POST /api/ai-assistent/session`
Creates a fresh session document (old history kept in DB, just not shown):
```js
const startNewSession = async (req, res) => {
    const newSession = new AIAssistent({
        user: userId,
        userRole: roleModelMap[role],
        messages: [],
    });
    await newSession.save();
    return res.json({ success: true, sessionId: newSession._id });
};
```

### `GET /api/ai-assistent/context`
Returns sidebar stats without triggering a chat:
```js
const getAIContext = async (req, res) => {
    const { sidebarStats } = await buildContext(userId, role);
    return res.json({ success: true, sidebarStats });
};
```

---

## 5. Session Model (MongoDB)

**File:** [`aiAssistentModel.js`](file:///d:/Node%20JS/student-management-system/server/module/aiAssistentModel.js)

This schema was already correctly defined:

```js
const messageSchema = new mongoose.Schema({
    role:      { type: String, enum: ['user', 'assistant'], required: true },
    content:   { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
}, { _id: false });

const aiAssistentSchema = new mongoose.Schema({
    user:             { type: ObjectId, required: true, refPath: 'userRole' },
    userRole:         { type: String, enum: ['Student', 'Teacher', 'Admin'] },
    messages:         [messageSchema],
    sessionStartedAt: { type: Date, default: Date.now }
}, { timestamps: true });
```

**How sessions work:**
- One document = one session per user
- "New Chat" → creates a new document (`startNewSession`)
- History is loaded with `findOne({ user, userRole }).sort({ createdAt: -1 })`
- Old sessions are preserved in DB (not deleted)
- Messages grow via `$push { $each: [userMsg, assistantMsg] }`

---

## 6. Client — `useAIChat` Hook

**File:** [`useAIChat.js`](file:///d:/Node%20JS/student-management-system/client/src/hooks/useAIChat.js)

Single hook used by both the full page and the floating panel:

```js
const useAIChat = (role) => {
    const [messages, setMessages] = useState([]);
    const [sidebarStats, setSidebarStats] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState(null);

    // On mount: load history + sidebar stats in parallel
    useEffect(() => {
        Promise.all([
            axios.get('/api/ai-assistent/history', { withCredentials: true }),
            axios.get('/api/ai-assistent/context', { withCredentials: true }),
        ]).then(([historyRes, contextRes]) => {
            setMessages(historyRes.data.messages || []);
            setSidebarStats(contextRes.data.sidebarStats || {});
        });
    }, [role]);

    // Optimistic UI: append user message immediately, remove on error
    const sendMessage = async (text) => {
        setMessages(prev => [...prev, { role: 'user', content: text, timestamp: new Date() }]);
        setIsSending(true);

        const { data } = await axios.post('/api/ai-assistent/chat', { message: text }, { withCredentials: true });

        if (data.success) {
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply, timestamp: new Date() }]);
            setSidebarStats(data.sidebarStats);
        } else {
            setMessages(prev => prev.slice(0, -1));  // remove failed user message
        }
        setIsSending(false);
    };

    return { messages, sidebarStats, isLoading, isSending, error, sendMessage, startNewSession, clearError };
};
```

---

## 7. Client — AI Assistant Page

**File:** [`AIAssistant.jsx`](file:///d:/Node%20JS/student-management-system/client/src/pages/AIAssistant.jsx)

Key UI features:

| Feature | Implementation |
|---|---|
| **Message bubbles** | User = gradient right-aligned, Assistant = white card left-aligned with Bot avatar |
| **Markdown formatting** | `**bold**` → `<strong>`, `` `code` `` → styled inline code, `\n` → `<br>` |
| **Typing indicator** | 3-dot animation while `isSending === true` |
| **Auto-scroll** | `useRef` + `scrollIntoView` on every message update |
| **Empty state** | Shows greeting + chip buttons when no history |
| **Role color themes** | Admin=purple, Teacher=teal, Student=amber |
| **Live sidebar** | Stats from DB via `context` endpoint, updates on each reply |
| **Error banner** | Dismissible red banner on API failure |
| **New Chat button** | Header + sidebar, calls `startNewSession()` |
| **Enter to send** | `onKeyDown` checks `!e.shiftKey` |
| **Chip suggestions** | Click fills textarea and focuses it |

---

## 8. Client — Floating Mini Panel

**File:** [`AIFloatingPanel.jsx`](file:///d:/Node%20JS/student-management-system/client/src/components/AIFloatingPanel.jsx)

Now receives `{ role, isOpen, onClose }` props from `App.jsx`. Uses the **same `useAIChat` hook** — messages are shared between the mini panel and the full page because they load from the same session.

**App.jsx wiring:**
```jsx
// App.jsx
const [isPanelOpen, setIsPanelOpen] = useState(false);

// FAB button
<button id="ai-fab" onClick={togglePanel}
    style={{ transform: isPanelOpen ? 'rotate(15deg)' : 'none' }}>
    <Bot />
</button>

// Panel
<AIFloatingPanel
    role={role}
    isOpen={isPanelOpen}
    onClose={() => setIsPanelOpen(false)}
/>
```

---

## 9. Role Data Access Table

| Data Type | Admin | Teacher | Student |
|---|---|---|---|
| All students (names, IDs, dept) | ✅ Full | ✅ Own courses only | ❌ Private |
| All teachers | ✅ Full | ❌ | ❌ |
| All courses | ✅ Full | ✅ Assigned only | ✅ Enrolled only |
| Attendance records | ✅ All | ✅ Own courses only | ✅ Own only |
| Grade records | ✅ All published | ✅ Own courses only | ✅ Own published only |
| Other student's GPA/grades | ✅ Allowed | ✅ For enrolled students | ❌ Blocked by system prompt |
| Faculty summary stats | ✅ Full | ❌ | ❌ |

---

## 10. Complete Request Flow (End-to-End)

```
1. User types "Who has the lowest attendance?" and clicks Send

2. Client (useAIChat.sendMessage):
   - Optimistically appends user message to UI
   - POST /api/ai-assistent/chat  { message: "Who has lowest attendance?" }
   - withCredentials: true  → sends the JWT httpOnly cookie

3. Server (protect middleware):
   - Reads req.cookies.token
   - jwt.verify(token, JWT_SECRET) → { id: "6872abc...", role: "admin" }
   - Sets req.user = { id, role }

4. Server (sendChatMessage):
   - buildContext("6872abc...", "admin")
     → Student.find(), Teacher.find(), Attendance.find(), Grade.find() [in parallel]
     → Computes per-student attendance percentages
     → Builds systemPrompt string with real data table
   - AIAssistent.findOne({ user: id }) → loads session history
   - chat(systemPrompt, history, "Who has lowest attendance?")
     → OpenAI SDK → Gemini 2.5 Flash API
     → Response: "Ranasinghe (FC222016) has the lowest overall attendance at..."
   - AIAssistent.findByIdAndUpdate($push both messages)
   - Returns { success: true, reply: "...", sidebarStats: {...} }

5. Client:
   - Appends assistant message to UI
   - Updates sidebar stats
   - Auto-scrolls to bottom
   - Typing indicator disappears
```

---

## How to Test

1. **Start the server:** `cd server && npm run dev`
2. **Start the client:** `cd client && npm run dev`
3. **Login as Admin** → click **AI Assistant** in sidebar → ask *"How many students are enrolled?"*
4. **Login as Teacher** → ask *"Who is at risk in my courses?"* → should only see their own courses' students
5. **Login as Student** → ask *"What is Niralgama's GPA?"* → AI refuses (privacy rule in system prompt)
6. **Navigate away and back** → conversation history should persist (loaded from MongoDB)
7. **Click "New Chat"** → fresh session starts, old history gone from view (still in DB)
8. **Open the FAB (🤖 button)** on any page → mini chat panel opens with same session

> [!NOTE]
> The `GEMINI_API_KEY` in `.env` appears to be a sample key. Replace it with a valid Gemini API key from [Google AI Studio](https://aistudio.google.com) if the chat returns errors.
