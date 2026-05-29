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

---

## Project Overview

**Pagiverse** is a production-grade, full-stack academic document intelligence platform. It ingests raw PDF files — including full textbook chapters, dense lecture notes, and multi-page academic manuscripts — and processes them through a multi-layer AI pipeline to output six distinct structured analytical data blocks.

The system is engineered for real-world academic workloads: documents with 24+ pages, mixed-language scripts, and high-density factual content. It is designed to remain within Gemini API free-tier quota constraints while maintaining fast response times for typical academic documents.

| Property | Value |
| :--- | :--- |
| **Primary Use Case** | Academic PDF analysis and structured knowledge extraction |
| **Supported Languages** | English, Hindi (Devanagari script), mixed-language documents |
| **Document Target** | Textbook chapters, lecture notes, academic manuscripts (1–100+ pages) |
| **AI Core** | Google Gemini API with Multi-Key Failover Architecture (Free Tier compatible) |
| **Backend Runtime** | FastAPI on Python 3.11+, deployed via Gunicorn on Render |
| **Frontend Runtime** | React 18 + Vite + Tailwind CSS v4 |
| **Live API Endpoint** | `https://pagiverse.onrender.com` |

---

## Live Architecture

The diagram below shows the full request lifecycle — from a user uploading a PDF in the browser, through the FastAPI processing pipeline, and back to the frontend as a structured JSON analytics payload.

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
│     └─► Multi-Key API Rotator Pool (Dynamic Failover Switch on 503/429 errors)
│     └─► JSON schema validation & storage                            │
│                                                                     │
│   GET /document/{id}         → status: pending | completed | failed │
│   GET /document/{id}/analytics → full structured JSON payload       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Extraction Data Matrix

Pagiverse extracts six discrete, structured output blocks from every document. Each block is rendered inside its own dedicated pastel-accented content card in the frontend.

| # | Block Name | Frontend Tab | Subject-Adaptive Header Examples | Output Format |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **Page Summaries** | Page Summaries | *Comprehensive Core Overview* / *Mathematical Concept Isolated* | Grouped paragraph blocks per page |
| 2 | **Deep Insights Matrix** | Deep Insights Matrix | *Data Science & Algorithmic Paradigm Isolated* | Numbered factual bullet array |
| 3 | **Timeline & Chronology** | Timeline & Chronology | *Model & Algorithm Evolution* / *System State Chronology* | Chronological event list |
| 4 | **Quotes, Laws & Acts** | Quotes, Laws & Acts | *Complexity Rules & Logic* / *Axioms, Theorems & Corollaries* | Verbatim block quotes |
| 5 | **Exam Cheat-Sheet** | Exam Cheat-Sheet | *High Weightage Formula Blocks* | Condensed bullet-point list |
| 6 | **Active Flashcards** | Active Flashcards | — | Interactive flip-card pairs (question / answer) |

### Subject-Adaptive Header Logic

The frontend automatically detects the document's subject domain from the extracted content and re-maps Tab 3 and Tab 4 section headers accordingly. No manual configuration is required — it works transparently on every upload.

| Detected Domain Keywords | Tab 3 Header | Tab 4 Header |
| :--- | :--- | :--- |
| `algorithm`, `complexity`, `sorting`, `big-o`, `daa`, `tree` | Model & Algorithm Evolution | Complexity Rules & Logic |
| `theorem`, `proof`, `induction`, `discrete`, `math` | Sequential Steps & Proofs | Axioms, Theorems & Corollaries |
| `kernel`, `scheduling`, `operating`, `protocol`, `memory`, `process` | System State Chronology | Standards, Protocols & Limits |
| *(default — history, humanities, general)* | Timeline & Chronology | Quotes, Laws & Acts |

---

## Backend Architecture

### Technical Stack

| Component | Technology |
| :--- | :--- |
| Web Framework | FastAPI 0.110+ |
| ASGI Server | Uvicorn / Gunicorn |
| PDF Parsing | pypdf |
| AI Core | Google GenAI SDK (Dynamic Multi-Key Rotation Matrix: gemini-2.5-flash) |
| Concurrency | Python `asyncio` + `asyncio.Semaphore` |
| Deployment | Render (Free Tier) |

### Ingestion Pipeline

The previous architecture submitted the entire document text as a single monolithic string, which caused frequent **503 memory errors** on the Render free-tier container and exceeded Gemini's per-request token ceiling on documents longer than ~8 pages.

The current architecture implements **Asynchronous Page-Wise Extraction with Compact Batch Grouping**, breaking the document into clean, filterable page units before grouping them into optimal batches for the AI model.

```
Raw PDF
  │
  ▼
pypdf.PdfReader ──► Extract text per page ──► [page_1_text, page_2_text, ..., page_N_text]
  │
  ▼
Noise Filter Pass
  ├── len(words) < 15   →  DROP  (headers, footers, blank padding pages)
  └── len(words) 15–50  →  MERGE into next valid page block
  │
  ▼
Compact Batch Grouping
  └── ~10 dense pages per batch ──► [batch_1, batch_2, batch_3]
      (24-page document → max 3 Gemini API requests)
  │
  ▼
asyncio.gather(*[process_batch(b) for b in batches])
  └── asyncio.Semaphore(2) ──► Limits simultaneous parallel requests
  │
  ▼
Structured JSON Assembly ──► Synchronized to active database ledger tracking
```

### Noise Filter Thresholds

These thresholds prevent low-quality page fragments from contaminating the token stream sent to Gemini.

| Word Count per Page | Action | Reason |
| :--- | :--- | :--- |
| `< 15 words` | **Drop** | Page is a footer, chapter divider, or blank padding — zero semantic value |
| `15 – 50 words` | **Merge** into next block | Partial content fragment; merging preserves logical continuity |
| `> 50 words` | **Accept** as independent unit | Sufficient semantic density for standalone analysis |

### Quota Guardrail Management

Gemini's free tier enforces a **20 requests/day** ceiling. Without batching, a 24-page document could trigger 7–24 individual API calls, easily breaching this limit within a single session. The compact grouping strategy solves this directly.

```
Without batching:  24 pages  ──►  ~7–24 individual Gemini requests  (quota breach risk)
With batching:     24 pages  ──►  2–3 compact batch requests        (well within quota)
```

### Concurrency Control

The `asyncio.Semaphore(2)` cap ensures that no more than 2 Gemini API calls are in-flight simultaneously. This prevents concurrent user uploads from saturating the Render container's single-worker thread pool.

```python
semaphore = asyncio.Semaphore(2)

async def process_batch_safe(batch_text: str):
    async with semaphore:
        return await call_gemini(batch_text)

results = await asyncio.gather(*[process_batch_safe(b) for b in batches])
```

### API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/upload` | Accepts `multipart/form-data` PDF. Returns `{ "id": "<doc_id>" }` |
| `GET` | `/document/{id}` | Returns `{ "status": "pending" \| "completed" \| "failed" }` |
| `GET` | `/document/{id}/analytics` | Returns full structured JSON analytics payload |

### Analytics JSON Schema

This is the exact shape of the object the frontend receives and renders across all six content tabs.

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

### Technical Stack

| Component | Technology |
| :--- | :--- |
| Framework | React 18 |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| State Management | React `useState` / `useEffect` hooks |
| PDF Export | Custom HTML-to-print compilation engine |

### Long-Poll Engine

The frontend uses a non-blocking long-poll loop to check document processing status. The loop runs up to **150 attempts** at 3.5-second intervals, providing a total maximum wait window of ~8.75 minutes. This is sufficient to accommodate even the most compute-intensive 24-page documents processing on a cold Render container.

The `maxAttempts` value was previously set to 25, which caused a premature 9-page cutoff artifact for full 24-page documents. Raising it to 150 with an adjusted progress increment rate resolves this completely.

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

      // requestAnimationFrame defers state commit to next paint cycle,
      // preventing forced synchronous reflow on bulk JSON dispatch
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

All large JSON analytics payloads are committed to React state inside a `window.requestAnimationFrame` callback. This defers the update to the browser's next paint cycle, eliminating the forced synchronous reflows that would otherwise freeze the UI thread when dispatching arrays of 50–200+ items in a single tick.

### PDF Export Engine

The "Download PDF Report" utility compiles all six extraction blocks into a single structured HTML document and triggers the browser's native print dialog for PDF saving. Every data array is wrapped in an `Array.isArray()` guard before iteration to prevent null or incomplete backend responses from crashing the export engine.

### Local Analysis Archive

All completed analytics results are persisted to `localStorage` under the key `pagiverse_tabbed_private_history`. Previous analyses can be reloaded instantly from the **📚 ANALYSIS ARCHIVE REPOSITORY** sidebar panel without re-uploading or re-processing the document.

| Property | Detail |
| :--- | :--- |
| **Storage Key** | `pagiverse_tabbed_private_history` |
| **Value Schema** | `Array<{ id: string, filename: string, analytics: AnalyticsPayload }>` |
| **Clear Trigger** | Confirm dialog → wipes localStorage key and resets UI state |

---

## Environment Setup

### Prerequisites

| Tool | Minimum Version |
| :--- | :--- |
| Python | 3.11+ |
| Node.js | 18+ |
| npm | 9+ |
| Google Gemini API Key | Free tier sufficient |
| Tesseract OCR Engine | Required only if processing scanned document packages locally |

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
# Create a .env file in the backend root and add:
DATABASE_URL=your_postgresql_database_url_here
PROJECT_NAME=AI PDF Study Companion
GEMINI_API_KEY_PRIMARY=your_primary_gemini_api_key_here
GEMINI_API_KEY_SECONDARY=your_secondary_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# 5. Start the development server
uvicorn app.main:app --reload --port 8000
```

> **Windows note:** If using local OCR features, ensure Tesseract is installed at `C:\Program Files\Tesseract-OCR\tesseract.exe` or update the executable path in your local environment settings.

Backend will be live at: `http://localhost:8000`

---

### Frontend — Local Development

```bash
# 1. Navigate to frontend directory
cd ../frontend

# 2. Install dependencies
npm install

# 3. Start the Vite dev server
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

## Deployment & Infrastructure

### Backend — Render

The FastAPI backend is deployed as a **Web Service** on Render's free tier.

| Setting | Value |
| :--- | :--- |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `gunicorn app.main:app -w 1 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT` |
| **Environment Variable** | `GEMINI_API_KEY_PRIMARY, GEMINI_API_KEY_SECONDARY, GROQ_API_KEY` |
| **Instance Type** | Free |

### Cold-Start Prevention — UptimeRobot

Render's free tier suspends web service instances after **15 minutes of inactivity**, introducing 30–60 second cold-start delays on the next incoming request. To eliminate this entirely, the backend instance is registered with **UptimeRobot** on a strict **5-minute ping interval**, keeping the Render container perpetually warm.

| Configuration | Value |
| :--- | :--- |
| **Monitor Type** | HTTP(s) |
| **Monitor URL** | `https://pagiverse.onrender.com` |
| **Check Interval** | Every 5 minutes |

### Frontend — Deployment

```bash
# Build for production
npm run build

# The output /dist directory can be deployed to:
# Vercel, Netlify, Render Static Site, GitHub Pages, or Cloudflare Pages
```

---

## Engineering Milestones

The table below documents every major engineering decision and bug resolution completed during the current development cycle.

| Component | Issue | Resolution |
| :--- | :--- | :--- |
| Backend — Ingestion | Single-shot text dumps caused 503 memory errors on Render free tier | Replaced with asynchronous page-wise extraction loops via `pypdf` |
| Backend — Quotas | 24-page documents generated 7–24 Gemini API calls, breaching the 20/day free-tier limit | Implemented compact batch grouping (~10 pages/batch → max 3 calls per document) |
| Backend — Noise | Footer-only and blank padding pages contaminated the token stream sent to Gemini | Added word-count filter: drop `< 15` words, merge `15–50` words into next block |
| Backend — Concurrency | Simultaneous user uploads caused Render container thread saturation | Implemented `asyncio.Semaphore(2)` to cap concurrent Gemini calls at 2 |
| Backend — Runtime Crash | JavaScript `String()` constructor syntax was used inside Python string formatters | Overhauled all affected format layers and replaced with Python-native `str()` |
| Frontend — Thread Freeze | Bulk 200+ item JSON state commits caused forced synchronous browser layout freeze | Wrapped all analytics state updates in `window.requestAnimationFrame` |
| Frontend — Layout Clutter | Redundant inner tabs and duplicate static panels wasted canvas viewport space | Purged all duplicate node instances; unified layout to a clean single-scroll stream |
| Frontend — PDF Export | Pop-up blocker dependencies and null array iteration caused export engine crashes | Fortified all six data arrays with explicit `Array.isArray()` conditional guards |
| Frontend — Polling Cutoff | `maxAttempts: 25` caused a premature 9-page artifact cutoff for 24-page documents | Raised `maxAttempts` to `150` with an adjusted progress increment rate |
| Infrastructure — Cold Start | Render free tier sleep caused 30–60s latency on the first request of each session | Registered instance with UptimeRobot at a 5-minute ping interval |
| Backend — Infrastructure | API downtime or 503 high demand spikes caused pipeline exceptions | Implemented an Automated Multi-Key Failover Matrix with dynamic configuration properties to rotate keys on request failure |

---

## Known Constraints & Guardrails

| Constraint | Detail |
| :--- | :--- |
| **Gemini Free Tier Quota** | 20 requests/day per key. The compact batching strategy combined with the Multi-Key API Rotator pool seamlessly scales the availability ceiling past single-key restrictions. |
| **Render Free Tier RAM** | 512MB. Documents exceeding ~150 pages may trigger memory pressure. Tested and stable up to 100 pages. |
| **Concurrent Users** | `asyncio.Semaphore(2)` limits to 2 parallel Gemini calls. Additional uploads queue behind the semaphore and are processed sequentially. |
| **PDF Type Support** | Text-layer PDFs only. Scanned image-based PDFs with no embedded text layer will produce empty extraction results unless local OCR is manually configured. |
| **localStorage Persistence** | Analytics history is stored in the user's browser `localStorage`. Clearing browser data wipes the archive. No server-side history persistence in the current release. |

---

<div align="center">

Built with precision for academic excellence.

**Pagiverse** — *Read less. Know more.*

</div>
