# API Reference

## Base URL

- Development: `http://localhost:3001`
- Production: configured via `CLIENT_URL`

## Response Format

All endpoints return JSON in this shape:

```json
{
  "success": true | false,
  "message": "Human-readable description",
  "data": {},
  "role": "admin | teacher | student"
}
```

Error responses additionally include:
- `4xx` — client errors (bad input, unauthorized, not found)
- `5xx` — server errors (never expose stack traces in production)

## Authentication

All protected routes require a valid JWT stored in an httpOnly cookie named `token`.

Cookie is set automatically on login and cleared on logout.

---

## Auth Routes — `/api/auth`

> Rate limited: 20 requests per 15 minutes per IP.

### `POST /api/auth/register`

Register a new user.

**Body (admin):**
```json
{ "role": "admin", "adminId": "A001", "firstName": "Jane", "lastName": "Doe", "email": "jane@example.com", "password": "Secret123!" }
```

**Body (student):**
```json
{ "role": "student", "studentId": "S001", "firstName": "John", "lastName": "Doe", "email": "john@example.com", "password": "Secret123!", "department": "CS", "yearOfStudy": 2 }
```

**Body (teacher):**
```json
{ "role": "teacher", "teacherId": "T001", "firstName": "Prof", "lastName": "Smith", "email": "smith@example.com", "password": "Secret123!", "department": "CS" }
```

**Returns:** `201 Created` with `{ success: true, message }`

---

### `POST /api/auth/login`

**Body:** `{ "email": "...", "password": "..." }`

**Returns:** `200 OK` with `{ success: true, role, message }` and sets `token` cookie.

---

### `POST /api/auth/logout`

Clears the auth cookie.

**Returns:** `200 OK`

---

### `GET /api/auth/isLoggedIn`

Returns current session info without exposing password hash.

**Returns:**
```json
{ "success": true, "role": "student", "user": { "_id": "...", "firstName": "...", ... } }
```

---

## Health Endpoints

> Not rate-limited. Intended for load balancers and monitoring.

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Always returns 200 while process is alive |
| `GET /ready` | Returns 200 only when MongoDB is connected |
| `GET /metrics` | Memory/DB metrics (restrict in production) |

---

## Admin Routes

All require `role = admin` in JWT.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/dashboard` | Dashboard stats + recent activity |
| GET/POST/PUT/DELETE | `/api/admin/students` | CRUD students |
| GET/POST/PUT/DELETE | `/api/admin/courses` | CRUD courses |
| GET | `/api/admin/attendance` | Attendance overview |
| GET | `/api/admin/grades` | All grades |
| GET | `/api/admin/reports` | Reports |

---

## Teacher Routes

All require `role = teacher` in JWT.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/teacher/dashboard` | Teacher dashboard |
| GET/POST | `/api/teacher/attendance` | Mark/view attendance |
| GET/POST/PUT | `/api/teacher/grades` | Enter/update grades |
| GET | `/api/teacher/schedule` | View schedule |

---

## Student Routes

All require `role = student` in JWT.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/student/dashboard` | Student dashboard |
| GET | `/api/student/attendance` | Own attendance |
| GET | `/api/student/grades` | Own grades |
| GET | `/api/student/schedule` | Own schedule |

---

## AI Assistant — `/api/ai-assistent`

Proxies to Gemini API with role-scoped system prompt.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/ai-assistent/chat` | Send message, receive AI reply |
| GET | `/api/ai-assistent/history` | Conversation history |
| DELETE | `/api/ai-assistent/history` | Clear conversation |
