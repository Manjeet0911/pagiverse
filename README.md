<div align="center">

# 📄 Pagiverse

### Multi-Disciplinary Academic Document Intelligence Engine

*Transform full-length textbook chapters and dense academic notes into structured, high-density analytical data matrices — instantly.*

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS_v4-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/AI_Core-Gemini_API-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)
[![Render](https://img.shields.io/badge/Deployed_on-Render-46E3B7?style=flat-square&logo=render)](https://render.com/)

</div>

---

## Table of Contents

- [Project Overview](#project-overview)
- [Live Architecture](#live-architecture)
- [Extraction Data Matrix](#extraction-data-matrix)
- [Backend Architecture](#backend-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Environment Setup](#environment-setup)
- [Deployment & Infrastructure](#deployment--infrastructure)
- [Engineering Milestones](#engineering-milestones)
- [Known Constraints & Guardrails](#known-constraints--guardrails)
- [Contributing](#contributing)

---

## Project Overview

**Pagiverse** is a production-grade, full-stack academic document intelligence platform. It ingests raw PDF files — including full textbook chapters, dense lecture notes, and multi-page academic manuscripts — and processes them through a multi-layer AI pipeline to output six distinct structured analytical data blocks.

The system is engineered for real-world academic workloads: documents with 24+ pages, mixed-language scripts, and high-density factual content. It is designed to remain within Gemini API free-tier quota constraints while maintaining sub-60-second response times for typical academic documents.

| Property | Value |
|---|---|
| **Primary Use Case** | Academic PDF analysis and structured knowledge extraction |
| **Supported Languages** | English, Hindi (Devanagari script), mixed-language documents |
| **Document Target** | Textbook chapters, lecture notes, academic manuscripts (1–100+ pages) |
| **AI Core** | Google Gemini API (Free Tier compatible) |
| **Backend Runtime** | FastAPI on Python 3.11+, deployed via Gunicorn on Render |
| **Frontend Runtime** | React 18 + Vite + Tailwind CSS v4 |
| **Live API Endpoint** | `https://pagiverse.onrender.com` |

---

## Live Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT BROWSER                             │
│                                                                     │
│   React 18 (Vite)  ──►  Drag & Drop PDF Upload                     │
│   Tailwind CSS v4  ◄──  Polling: /document/{id}  every 3.5s        │
│   requestAnimationFrame  ◄──  /document/{id}/analytics  (JSON)     │
└────────────────────────────┬────────────────────────────────────────┘
                             │  HTTPS  (multipart/form-data)
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     FASTAPI BACKEND (Render)                        │
│                                                                     │
│   POST /upload                                                      │
│     └─► pypdf page-wise extraction                                  │
│     └─► Noise filter  (<15 words → drop)                            │
│     └─► Merge filter  (15–50 words → merge into next block)         │
│     └─► Compact batch grouping  (~10 dense pages / batch)           │
│     └─► asyncio.Semaphore(2)  concurrent worker pool                │
│     └─► Gemini API  (2–3 requests per 24-page document)             │
│     └─► JSON schema validation & storage                            │
│                                                                     │
│   GET /document/{id}        → status: pending | completed | failed  │
│   GET /document/{id}/analytics → full structured JSON payload       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Extraction Data Matrix

Pagiverse extracts six discrete, structured output blocks from every document. Each block is rendered inside its own dedicated pastel-accented content card in the frontend.

| # | Block Name | Frontend Tab | Subject-Adaptive Header Examples | Output Format |
|---|---|---|---|---|
| 1 | **Page Summaries** | Page Summaries | *Comprehensive Core Overview* / *Mathematical Discrete Analytical Concept Isolated* | Grouped paragraph blocks per page |
| 2 | **Deep Insights Matrix** | Deep Insights Matrix | *Data Science & Algorithmic Paradigm Isolated* | Numbered factual bullet array |
| 3 | **Timeline & Chronology** | Timeline & Chronology | *Model & Algorithm Evolution* / *System State Chronology* / *Sequential Steps & Proofs* | Chronological event list |
| 4 | **Quotes, Laws & Acts** | Quotes, Laws & Acts | *Complexity Rules & Logic* / *Axioms, Theorems & Corollaries* / *Standards, Protocols & Limits* | Verbatim block quotes |
| 5 | **Exam Cheat-Sheet** | Exam Cheat-Sheet | *High Weightage Formula Blocks* | Condensed bullet-point list |
| 6 | **Active Flashcards** | Active Flashcards | — | Interactive flip-card pairs (question / answer) |

### Subject-Adaptive Header Logic

The frontend automatically detects document domain from the extracted content and re-maps section headers accordingly. No manual configuration is required.

| Detected Domain Keywords | Tab 3 Header | Tab 4 Header |
|---|---|---|
| `algorithm`, `complexity`, `sorting`, `big-o`, `daa`, `tree` | Model & Algorithm Evolution | Complexity Rules & Logic |
| `theorem`, `proof`, `induction`, `discrete`, `math` | Sequential Steps & Proofs | Axioms, Theorems & Corollaries |
| `kernel`, `scheduling`, `operating`, `protocol`, `memory`, `process` | System State Chronology | Standards, Protocols & Limits |
| *(default — history, humanities, general)* | Timeline & Chronology | Quotes, Laws & Acts |

---

## Backend Architecture

### Stack

| Component | Technology |
|---|---|
| Web Framework | FastAPI 0.110+ |
| ASGI Server | Uvicorn / Gunicorn |
| PDF Parsing | pypdf |
| AI Model | Google Gemini API (`gemini-1.5-flash`) |
| Concurrency | Python asyncio, asyncio.Semaphore |
| Deployment | Render (Free Tier) |

### Ingestion Pipeline

The ingestion pipeline is the core engineering improvement of this release cycle. The previous architecture submitted entire document text as a single monolithic string, which caused frequent 503 memory errors on the Render free-tier container and exceeded Gemini's per-request token ceiling on documents longer than ~8 pages.

The current architecture implements **Asynchronous Page-Wise Extraction with Compact Batch Grouping**:

```
Raw PDF
  │
  ▼
pypdf.PdfReader  ──►  Extract text per page  ──►  [page_1_text, page_2_text, ..., page_N_text]
  │
  ▼
Noise Filter Pass
  ├── len(words) < 15   →  DROP  (headers, footers, blank padding pages)
  └── len(words) 15–50  →  MERGE into next valid page block
  │
  ▼
Compact Batch Grouping
  └── ~10 dense pages per batch  →  [batch_1, batch_2, batch_3]
      (24-page document → max 3 Gemini API requests)
  │
  ▼
asyncio.gather(*[process_batch(b) for b in batches])
  └── asyncio.Semaphore(2)  →  max 2 concurrent Gemini calls at any time
  │
  ▼
Structured JSON Assembly  →  stored in-memory / DB keyed by document ID
```

### Noise Filter Thresholds

| Word Count per Page | Action | Reason |
|---|---|---|
| `< 15 words` | **Drop** | Page is a footer, chapter divider, or blank padding — zero semantic value |
| `15 – 50 words` | **Merge** into next block | Partial content fragment; merging preserves logical continuity |
| `> 50 words` | **Accept** as independent page unit | Sufficient semantic density for independent analysis |

### Quota Guardrail Management

Gemini's free tier enforces a **20 requests/day** ceiling. The compact batching strategy ensures that even the largest academic documents (24+ pages) consume no more than 2–3 API requests:

```
Without batching:  24 pages  →  ~7–24 individual Gemini requests  (quota breach risk)
With batching:     24 pages  →  2–3 compact batch requests        (well within quota)
```

### Concurrency Control

```python
semaphore = asyncio.Semaphore(2)

async def process_batch_safe(batch_text: str):
    async with semaphore:
        return await call_gemini(batch_text)

results = await asyncio.gather(*[process_batch_safe(b) for b in batches])
```

The `Semaphore(2)` cap prevents concurrent spike loads from saturating the Render container's single-worker thread pool during simultaneous multi-user upload events.

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/upload` | Accepts `multipart/form-data` PDF. Returns `{ "id": "<doc_id>" }` |
| `GET` | `/document/{id}` | Returns `{ "status": "pending" \| "completed" \| "failed" }` |
| `GET` | `/document/{id}/analytics` | Returns full structured JSON analytics payload |

### Analytics JSON Schema

```json
{
  "summary": "string — full page-grouped summary text",
  "key_points": ["string", "..."],
  "timeline_dates": ["string", "..."],
  "historians_quotes": ["string", "..."],
  "cheat_sheet": ["string", "..."],
  "flashcards": [
    { "question": "string", "answer": "string" }
  ]
}
```

---

## Frontend Architecture

### Stack

| Component | Technology |
|---|---|
| Framework | React 18 |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| State Management | React `useState` / `useEffect` hooks |
| PDF Export | Custom HTML-to-print compilation engine |

### Polling Engine

The frontend uses a non-blocking long-poll loop to check document processing status. The loop runs up to **150 attempts** at 3.5-second intervals — providing a total maximum wait window of ~8.75 minutes — which is sufficient to accommodate even the most compute-intensive 24-page academic documents on a cold Render container.

```javascript
const pollAnalytics = async (docId, fileName) => {
  let completed = false;
  let attempts = 0;
  const maxAttempts = 150; // Supports full 24-page payload without premature cutoff

  while (!completed && attempts < maxAttempts) {
    setUploadProgress(40 + Math.min(attempts * 0.4, 59));
    await new Promise((r) => setTimeout(r, 3500));

    const res = await fetch(`${API_BASE_URL}/document/${docId}`, {
      headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
    });
    const statusCheck = await res.json();

    if (statusCheck.status === 'completed') {
      const dataRes = await fetch(`${API_BASE_URL}/document/${docId}/analytics`);
      const result = await dataRes.json();

      // requestAnimationFrame prevents forced synchronous reflow on bulk JSON commit
      window.requestAnimationFrame(() => {
        setData(parsedData);
        setUploadProgress(100);
      });
      completed = true;
    }
    attempts++;
  }
  setLoading(false);
};
```

### Thread-Safe State Commit

All large JSON analytics payloads are committed to React state inside a `window.requestAnimationFrame` callback. This defers the state update to the browser's next paint cycle, eliminating forced synchronous reflows that would otherwise freeze the UI thread when dispatching arrays of 50–200+ items simultaneously.

### PDF Export Engine

The "Download PDF Report" utility compiles all six extraction blocks into a single structured HTML document and triggers the browser's native print dialog for PDF saving. It uses `Array.isArray()` guards on every data array before iteration to prevent runtime errors from incomplete or null backend responses.

```javascript
const handleDownloadPdfReport = () => {
  // Safe iteration with Array.isArray guards on all 6 data blocks
  const keyPointsHtml = Array.isArray(data.key_points)
    ? data.key_points.map((item) => `<div>...</div>`).join('')
    : '';
  // ... repeated for all blocks

  const blob = new Blob([fullHtml], { type: 'text/html' });
  const printWin = window.open(URL.createObjectURL(blob), '_blank');
  printWin.onload = () => { printWin.focus(); printWin.print(); };
};
```

### Local Analysis Archive

All completed analytics results are persisted to `localStorage` under the key `pagiverse_tabbed_private_history`. Previous analyses can be reloaded instantly from the **📚 ANALYSIS ARCHIVE REPOSITORY** sidebar panel without re-uploading or re-processing the document.

```
localStorage key:  pagiverse_tabbed_private_history
Value schema:      Array<{ id: string, filename: string, analytics: AnalyticsPayload }>
Max display:       Unbounded (scroll-capped at 224px in sidebar)
Clear trigger:     Confirm dialog → wipes localStorage key + resets UI state
```

---

## Environment Setup

### Prerequisites

| Tool | Minimum Version |
|---|---|
| Python | 3.11+ |
| Node.js | 18+ |
| npm | 9+ |
| Google Gemini API Key | Free tier sufficient |

---

### Backend — Local Development

```bash
# 1. Clone the repository
git clone https://github.com/your-org/pagiverse.git
cd pagiverse/backend

# 2. Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # macOS / Linux
venv\Scripts\activate           # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment variables
cp .env.example .env
```

Edit `.env`:

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

```bash
# 5. Start the development server
uvicorn main:app --reload --port 8000
```

Backend will be live at: `http://localhost:8000`

---

### Frontend — Local Development

```bash
# 1. Navigate to frontend directory
cd pagiverse/frontend

# 2. Install dependencies
npm install

# 3. Configure API endpoint
# Edit src/Dashboard.jsx line 4:
#   const API_BASE_URL = "http://localhost:8000";

# 4. Start the Vite dev server
npm run dev
```

Frontend will be live at: `http://localhost:5173`

---

### Backend `requirements.txt`

```
fastapi
uvicorn[standard]
gunicorn
pypdf
google-generativeai
python-multipart
python-dotenv
```

---

### Git Workflow

```bash
# Stage all changes
git add .

# Commit with structured message
git commit -m "feat: describe your change here"

# Push to main branch
git push origin main
```

---

## Deployment & Infrastructure

### Backend — Render

The FastAPI backend is deployed as a **Web Service** on Render's free tier.

| Setting | Value |
|---|---|
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `gunicorn main:app -w 1 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT` |
| **Environment Variable** | `GEMINI_API_KEY` = your key |
| **Instance Type** | Free |
| **Region** | Oregon (US West) |

### Cold-Start Prevention — UptimeRobot

Render's free tier suspends web service instances after **15 minutes of inactivity**, introducing 30–60 second cold-start delays on the next request. To eliminate this entirely, the backend instance is registered with **UptimeRobot** on a strict **5-minute ping interval**.

| Configuration | Value |
|---|---|
| **Monitor Type** | HTTP(s) |
| **Monitor URL** | `https://pagiverse.onrender.com` (or `/health` endpoint) |
| **Check Interval** | Every 5 minutes |
| **Alert Contacts** | Optional — email on downtime |

This keeps the Render container perpetually warm, reducing first-request latency to under 500ms at all hours.

### Frontend — Deployment Options

The React/Vite frontend can be deployed to any static hosting provider:

```bash
# Build for production
npm run build

# Output directory: dist/
# Deploy dist/ to: Vercel, Netlify, Render Static Site, GitHub Pages, Cloudflare Pages
```

---

## Engineering Milestones

The following table documents the major engineering decisions and bug resolutions completed during the current development cycle.

| # | Component | Issue | Resolution |
|---|---|---|---|
| 1 | Backend — Ingestion | Single-shot large text dumps caused 503 memory errors on Render free tier | Replaced with asynchronous page-wise extraction via `pypdf` |
| 2 | Backend — Quotas | 24-page documents generated 7–24 Gemini API calls, breaching 20/day free tier | Implemented compact batch grouping (~10 pages/batch → max 3 calls per document) |
| 3 | Backend — Noise | Footer-only and blank padding pages contaminated token streams | Added word-count noise filter: drop < 15 words, merge 15–50 words into next block |
| 4 | Backend — Concurrency | Simultaneous uploads caused Render container thread saturation | Implemented `asyncio.Semaphore(2)` to cap concurrent Gemini calls at 2 |
| 5 | Backend — Runtime Crash | JavaScript `String()` syntax used inside Python string formatter | Replaced all `String(x)` occurrences with Python-native `str(x)` |
| 6 | Frontend — Thread Freeze | Bulk 200+ item JSON array state commit caused synchronous browser reflow | Wrapped all analytics state commits in `window.requestAnimationFrame` |
| 7 | Frontend — Layout Clutter | Redundant inner navigation tabs, success panels, and aside blocks consumed canvas space | Purged all duplicate layout nodes; unified to clean single-page scroll stream |
| 8 | Frontend — PDF Export | Pop-up blocker dependencies and null array crashes in export engine | Fortified with `Array.isArray()` guards on all 6 data arrays before iteration |
| 9 | Frontend — Polling Cutoff | 9-page result artifact returned for 24-page documents due to low `maxAttempts` cap | Raised `maxAttempts` from 25 → 150 with adjusted progress increment rate |
| 10 | Infrastructure — Cold Start | Render free tier sleep caused 30–60s cold-start latency on first request | Registered instance with UptimeRobot at 5-minute ping interval |

---

## Known Constraints & Guardrails

| Constraint | Detail |
|---|---|
| **Gemini Free Tier Quota** | 20 requests/day. The compact batching strategy keeps typical 24-page documents within 2–3 requests. Heavy usage days may approach the ceiling. |
| **Render Free Tier RAM** | 512MB. Documents exceeding ~150 pages may trigger memory pressure. Tested stable up to 100 pages. |
| **Concurrent Users** | `asyncio.Semaphore(2)` limits to 2 parallel Gemini calls. Additional uploads queue behind the semaphore and process sequentially. |
| **PDF Type Support** | Text-layer PDFs only. Scanned image-based PDFs with no embedded text layer will produce empty extraction results. |
| **localStorage Persistence** | Analytics history is stored in the user's browser localStorage. Clearing browser data wipes the archive. No server-side history persistence in the current release. |
| **Language Detection** | Hindi/Devanagari and English are processed natively. Other scripts (Arabic, Chinese, Cyrillic) are passed to Gemini as-is — output quality depends on Gemini's multilingual capability for that script. |

---

## Contributing

```bash
# Fork the repository, then:

# 1. Create a feature branch
git checkout -b feat/your-feature-name

# 2. Make changes and commit
git add .
git commit -m "feat(backend): describe change"

# 3. Push your branch
git push origin feat/your-feature-name

# 4. Open a Pull Request on GitHub
```

### Commit Message Convention

| Prefix | Usage |
|---|---|
| `feat` | New feature or extraction capability |
| `fix` | Bug fix |
| `refactor` | Code restructuring without behaviour change |
| `perf` | Performance improvement |
| `docs` | Documentation update |
| `chore` | Dependency updates, config changes |

---

<div align="center">

Built with precision for academic excellence.

**Pagiverse** — *Read less. Know more.*

</div>
