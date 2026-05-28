import React, { useState, useEffect, useRef } from 'react';
import {
  FileText, Upload, Sparkles, Calendar, BookOpen,
  Layers, HelpCircle, ChevronRight, Check, ArrowRight,
  X, Trash2, History, PanelLeftClose, PanelLeftOpen,
  Download, ChevronDown, ChevronUp
} from 'lucide-react';

// 🚀 PRODUCTION LIVE BACKEND CLUSTER ENDPOINT
const API_BASE_URL = "https://pagiverse.onrender.com";

// ── TAB COLOR PALETTES ──────────────────────────────────────────────────────
const TAB_PALETTE = {
  summary:    { bg: 'bg-emerald-50/70', border: 'border-emerald-200', accent: 'border-l-emerald-500', badge: 'bg-emerald-100 border-emerald-300 text-emerald-800', label: 'text-emerald-700' },
  key_points: { bg: 'bg-sky-50/70',     border: 'border-sky-200',     accent: 'border-l-sky-500',     badge: 'bg-sky-100 border-sky-300 text-sky-800',             label: 'text-sky-700' },
  timeline:   { bg: 'bg-amber-50/70',   border: 'border-amber-200',   accent: 'border-l-amber-400',   badge: 'bg-amber-100 border-amber-300 text-amber-800',       label: 'text-amber-700' },
  quotes:     { bg: 'bg-indigo-50/70',  border: 'border-indigo-200',  accent: 'border-l-indigo-500',  badge: 'bg-indigo-100 border-indigo-300 text-indigo-800',    label: 'text-indigo-700' },
  cheat_sheet:{ bg: 'bg-rose-50/70',    border: 'border-rose-200',    accent: 'border-l-rose-500',    badge: 'bg-rose-100 border-rose-300 text-rose-800',          label: 'text-rose-700' },
  flashcards: { bg: 'bg-purple-50/70',  border: 'border-purple-200',  accent: 'border-l-purple-500',  badge: 'bg-purple-100 border-purple-300 text-purple-800',    label: 'text-purple-700' },
};

// ── FLASHCARD COMPONENT ─────────────────────────────────────────────────────
function Flashcard({ question, answer, index }) {
  const [flipped, setFlipped] = useState(false);

  const answerPastels = [
    'bg-sky-50/80 border-sky-200 text-sky-950',
    'bg-emerald-50/80 border-emerald-200 text-emerald-950',
    'bg-amber-50/80 border-amber-200 text-amber-950',
    'bg-purple-50/80 border-purple-200 text-purple-950',
    'bg-rose-50/80 border-rose-200 text-rose-950',
    'bg-teal-50/80 border-teal-200 text-teal-950',
  ];
  const answerColor = answerPastels[index % answerPastels.length];

  return (
    <div
      className="h-60 cursor-pointer [perspective:1000px] group"
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 ease-in-out [transform-style:preserve-3d] ${
          flipped ? '[transform:rotateY(180deg)]' : '[transform:rotateY(0deg)]'
        }`}
      >
        {/* FRONT */}
        <div className="absolute inset-0 w-full h-full bg-white border-2 border-slate-200 p-6 rounded-2xl [backface-visibility:hidden] flex flex-col justify-between shadow-sm hover:border-slate-300 hover:shadow-md transition-all">
          <div>
            <span className="inline-block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-100 px-3 py-1 rounded-full mb-3">
              QUESTION
            </span>
            <p className="text-[15px] font-black text-slate-900 leading-snug">{question}</p>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">#{String(index + 1).padStart(2, '0')}</span>
            <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
              <span className="w-3 h-3 border-2 border-slate-300 rounded-full inline-block" />
              Tap to reveal
            </span>
          </div>
        </div>

        {/* BACK */}
        <div className={`absolute inset-0 w-full h-full border-2 ${answerColor} p-6 rounded-2xl [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col justify-between shadow-sm`}>
          <div>
            <span className="inline-block text-[10px] font-black uppercase tracking-[0.2em] opacity-60 bg-black/5 px-3 py-1 rounded-full mb-3">
              ANSWER
            </span>
            <p className="text-[15px] font-black leading-relaxed overflow-y-auto max-h-32 no-scrollbar">
              {answer}
            </p>
          </div>
          <span className="text-[10px] font-semibold opacity-50 text-right">Tap to return</span>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const [dynamicTab3Title, setDynamicTab3Title] = useState('Timeline & Chronology');
  const [dynamicTab3Sub, setDynamicTab3Sub] = useState('Date historical structures');
  const [dynamicTab4Title, setDynamicTab4Title] = useState('Quotes, Laws & Acts');
  const [dynamicTab4Sub, setDynamicTab4Sub] = useState('Verbatim high weightage indices');

  const fileInputRef = useRef(null);
  const resultsRef = useRef(null);

  const stages = [
    "Establishing handshake with production container cluster...",
    "Streaming raw binary buffers via multipart network layer...",
    "Reading layout matrix and running structural bounds calculation...",
    "Isolating textual streams from individual page blocks...",
    "Executing single-shot injection into Gemini core pipeline...",
    "Parsing high-density abstract academic content configurations...",
    "Generating deep insights matrix and matching chronological dates...",
    "Validating historian quotes, structural acts, and statutory laws...",
    "Formatting dynamic JSON model to construct interactive flashcards...",
    "Final structural audit completed. Rendering dashboard viewport...",
  ];

  useEffect(() => {
    const localHistory = localStorage.getItem('pagiverse_tabbed_private_history');
    if (localHistory) {
      try { setHistoryList(JSON.parse(localHistory)); }
      catch (_) { setHistoryList([]); }
    }
  }, []);

  useEffect(() => {
    if (!data) return;
    const joinedContent = [
      data.summary || '',
      Array.isArray(data.key_points) ? data.key_points.join(' ') : '',
      Array.isArray(data.cheat_sheet) ? data.cheat_sheet.join(' ') : '',
    ].join(' ').toLowerCase();

    if (joinedContent.includes('algorithm') || joinedContent.includes('complexity') || joinedContent.includes('sorting') || joinedContent.includes('big-o') || joinedContent.includes('daa') || joinedContent.includes('tree')) {
      setDynamicTab3Title('Model & Algorithm Evolution');
      setDynamicTab3Sub('Algorithmic execution sequences');
      setDynamicTab4Title('Complexity Rules & Logic');
      setDynamicTab4Sub('Time/space complexity metrics');
    } else if (joinedContent.includes('theorem') || joinedContent.includes('proof') || joinedContent.includes('induction') || joinedContent.includes('discrete') || joinedContent.includes('math')) {
      setDynamicTab3Title('Sequential Steps & Proofs');
      setDynamicTab3Sub('Logical structure proofs sequences');
      setDynamicTab4Title('Axioms, Theorems & Corollaries');
      setDynamicTab4Sub('Core properties structural formulas');
    } else if (joinedContent.includes('kernel') || joinedContent.includes('scheduling') || joinedContent.includes('operating') || joinedContent.includes('protocol') || joinedContent.includes('memory') || joinedContent.includes('process')) {
      setDynamicTab3Title('System State Chronology');
      setDynamicTab3Sub('CPU process scheduling timelines');
      setDynamicTab4Title('Standards, Protocols & Limits');
      setDynamicTab4Sub('RFC standards and system deadlocks');
    } else {
      setDynamicTab3Title('Timeline & Chronology');
      setDynamicTab3Sub('Date historical structures');
      setDynamicTab4Title('Quotes, Laws & Acts');
      setDynamicTab4Sub('Verbatim high weightage indices');
    }
  }, [data]);

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStage((prev) => (prev === stages.length - 1 ? prev : prev + 1));
      }, 3500);
    } else {
      setLoadingStage(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') setFile(droppedFile);
      else alert('Strict verification: Please drop valid PDF data matrices only.');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    loadingTimeoutEnforcer();
    setLoading(true);
    setUploadProgress(15);
    setData(null);
    try {
      const response = await fetch(`${API_BASE_URL}/upload`, { method: 'POST', body: formData });
      const result = await response.json();
      if (result && result.id) {
        setUploadProgress(40);
        pollAnalytics(result.id, file.name);
      } else {
        alert('Backend sync failed. Please try again.');
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      alert('Pipeline Execution Exception. Render instance container might be warming up.');
      setLoading(false);
    }
  };

  const loadingTimeoutEnforcer = () => {
    setTimeout(() => {
      setUploadProgress((p) => (p > 0 && p < 90 ? p + 5 : p));
    }, 12000);
  };

  const pollAnalytics = async (docId, fileName) => {
    let completed = false;
    let attempts = 0;
    const maxAttempts = 150;

    while (!completed && attempts < maxAttempts) {
      try {
        setUploadProgress(40 + Math.min(attempts * 0.4, 59));
        await new Promise((r) => setTimeout(r, 3000));

        const res = await fetch(`${API_BASE_URL}/document/${docId}`, {
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        });
        const statusCheck = await res.json();

        if (statusCheck.status === 'completed') {
          const dataRes = await fetch(`${API_BASE_URL}/document/${docId}/analytics`);
          const result = await dataRes.json();
          if (result) {
            const parsedData = {
              summary: result.summary || '',
              key_points: Array.isArray(result.key_points) ? result.key_points : [],
              timeline_dates: Array.isArray(result.timeline_dates) ? result.timeline_dates : [],
              historians_quotes: Array.isArray(result.historians_quotes) ? result.historians_quotes : [],
              cheat_sheet: Array.isArray(result.cheat_sheet) ? result.cheat_sheet : [],
              flashcards: Array.isArray(result.flashcards) ? result.flashcards : [],
            };

            window.requestAnimationFrame(() => {
              setData(parsedData);
              const newHistoryItem = { id: docId, filename: fileName, analytics: parsedData };
              setHistoryList((prev) => {
                const updated = [newHistoryItem, ...prev.filter((item) => item.id !== docId)];
                localStorage.setItem('pagiverse_tabbed_private_history', JSON.stringify(updated));
                return updated;
              });
              setUploadProgress(100);
            });
          }
          completed = true;
          setTimeout(() => {
            if (resultsRef.current) resultsRef.current.scrollIntoView({ behavior: 'smooth' });
          }, 500);
        } else if (statusCheck.status === 'failed') {
          alert('Analytics Engine processing exception on Render container layer.');
          completed = true;
        }
      } catch (err) {
        console.error("Polling interruption status exception:", err);
      }
      attempts++;
    }
    setLoading(false);
  };

  const poolSampleSnapshot = (item) => {
    setLoading(true);
    setData(null);
    setTimeout(() => {
      setData(item.analytics);
      setLoading(false);
      setTimeout(() => {
        if (resultsRef.current) resultsRef.current.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, 500);
  };

  const deleteHistoryItem = (id, e) => {
    e.stopPropagation();
    setHistoryList((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem('pagiverse_tabbed_private_history', JSON.stringify(updated));
      return updated;
    });
  };

  const clearAllHistory = () => {
    if (window.confirm('Are you sure you want to permanently clear all local private analysis history?')) {
      setHistoryList([]);
      localStorage.removeItem('pagiverse_tabbed_private_history');
      setData(null);
    }
  };

  // ── VISUAL NATIVE PDF PRINT ENGINE ──
  const handleDownloadPdfReport = () => {
    if (!data) return;
    setDownloadingPdf(true);

    const cheatArr = data.cheat_sheet?.length > 0 ? data.cheat_sheet : data.key_points?.slice(0, 10) || [];
    const summaryBlocks = buildSummaryMap(data.summary);
    const escHtml = (str) => String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/^\s*[\*\-\+]\s*/gm, '');

    const summaryHtml = Object.keys(summaryBlocks).map((header) => `
      <div style="margin-bottom:24px;page-break-inside:avoid;">
        <div style="display:inline-block;background:#f0fdf4;border:1px solid #bbf7d0;color:#166534;font-size:11px;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;padding:5px 12px;border-radius:8px;margin-bottom:8px;font-family:sans-serif;">✨ ${escHtml(header)}</div>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-left:4px solid #10b981;border-radius:12px;padding:20px;box-shadow:0 1px 2px rgba(0,0,0,0.05);">
          <p style="color:#030712;font-size:15px;font-weight:800;line-height:1.7;white-space:pre-line;margin:0;font-family:sans-serif;">${escHtml(summaryBlocks[header].join('\n\n'))}</p>
        </div>
      </div>
    `).join('');

    const keyPointsHtml = data.key_points.map((item, idx) => `
      <div style="background:#f0f9ff;border:1px solid #e0f2fe;border-left:4px solid #0284c7;border-radius:12px;padding:16px;margin-bottom:12px;display:flex;gap:12px;page-break-inside:avoid;font-family:sans-serif;">
        <span style="color:#0284c7;font-weight:900;font-size:13px;min-width:20px;">${String(idx+1).padStart(2,'0')}.</span>
        <p style="color:#030712;font-size:14px;font-weight:800;line-height:1.6;margin:0;">${escHtml(item)}</p>
      </div>
    `).join('');

    const timelineHtml = data.timeline_dates.map(event => `
      <div style="background:#fffbeb;border:1px solid #fef3c7;border-left:4px solid #d97706;border-radius:12px;padding:16px;margin-bottom:12px;page-break-inside:avoid;font-family:sans-serif;">
        <p style="color:#451a03;font-size:14px;font-weight:800;line-height:1.6;margin:0;">${escHtml(event)}</p>
      </div>
    `).join('');

    const quotesHtml = data.historians_quotes.map(q => `
      <div style="background:#f5f3ff;border:1px solid #ede9fe;border-left:4px solid #7c3aed;border-radius:12px;padding:18px;margin-bottom:12px;position:relative;page-break-inside:avoid;font-family:sans-serif;">
        <p style="color:#1e1b4b;font-size:14px;font-weight:800;line-height:1.6;margin:0;font-style:italic;">"${escHtml(q)}"</p>
      </div>
    `).join('');

    const cheatHtml = cheatArr.map(point => `
      <div style="background:#fff1f2;border:1px solid #ffe4e6;border-left:4px solid #f43f5e;border-radius:12px;padding:16px;margin-bottom:12px;page-break-inside:avoid;font-family:sans-serif;">
        <p style="color:#030712;font-size:14px;font-weight:800;line-height:1.6;margin:0;">${escHtml(point)}</p>
      </div>
    `).join('');

    const flashcardsHtml = data.flashcards.map((card, idx) => `
      <div style="display:flex;gap:12px;margin-bottom:14px;page-break-inside:avoid;font-family:sans-serif;">
        <div style="flex:1;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:14px;">
          <span style="font-size:9px;font-weight:900;color:#64748b;letter-spacing:0.1em;display:block;margin-bottom:4px;">Q${String(idx+1).padStart(2,'0')}</span>
          <p style="font-size:13px;font-weight:800;color:#0f172a;margin:0;">${escHtml(card.question)}</p>
        </div>
        <div style="flex:1;background:#faf5ff;border:1px solid #e9d5ff;border-radius:12px;padding:14px;">
          <span style="font-size:9px;font-weight:900;color:#7c3aed;letter-spacing:0.1em;display:block;margin-bottom:4px;">ANSWER</span>
          <p style="font-size:13px;font-weight:800;color:#1e1b4b;margin:0;">${escHtml(card.answer)}</p>
        </div>
      </div>
    `).join('');

    const sectionHeader = (title, color) =>
      `<div style="border-bottom:2px solid ${color};padding-bottom:6px;margin-top:32px;margin-bottom:16px;page-break-after:avoid;font-family:sans-serif;">
        <h2 style="font-size:18px;font-weight:900;color:#0f172a;margin:0;text-transform:uppercase;letter-spacing:0.02em;">${title}</h2>
      </div>`;

    const fullHtml = `<html><head><meta charset="utf-8"/><title>Report</title>
      <style>
        body { background:#fff; color:#0f172a; padding:36px; font-family:system-ui,sans-serif; }
        .section { page-break-inside:auto; }
        @media print { body { padding:10px; } .section { page-break-before:always; } .section:first-of-type { page-break-before:avoid; } }
      </style></head><body>
      <div style="padding-bottom:16px;border-bottom:2px solid #10b981;margin-bottom:30px;font-family:sans-serif;">
        <h1 style="font-size:26px;font-weight:900;margin:0;">Pagiverse</h1>
        <p style="font-size:11px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:0.1em;margin-top:2px;">Full Factual Extraction Dossier</p>
      </div>
      <div class="section">${sectionHeader('Page Summaries Document Matrix', '#10b981')}${summaryHtml}</div>
      <div class="section">${sectionHeader('Deep Insights Core Matrix', '#0284c7')}${keyPointsHtml}</div>
      <div class="section">${sectionHeader(dynamicTab3Title, '#d97706')}${timelineHtml}</div>
      <div class="section">${sectionHeader(dynamicTab4Title, '#7c3aed')}${quotesHtml}</div>
      <div class="section">${sectionHeader('Exam High-Weightage Cheat-Sheet', '#f43f5e')}${cheatHtml}</div>
      <div class="section">${sectionHeader('Active Revision Flashcards', '#6b21a8')}${flashcardsHtml}</div>
      </body></html>`;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(fullHtml);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => {
        printWin.print();
        setDownloadingPdf(false);
      }, 600);
    } else {
      setDownloadingPdf(false);
    }
  };

  const buildSummaryMap = (summaryText) => {
    if (!summaryText) return {};
    const rawLines = summaryText.split('\n');
    const pageMap = {};
    let currentKey = 'PAGE 01 INSIGHTS';
    let pageCount = 1;
    let hasKeysFound = false;

    rawLines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const lower = trimmed.toLowerCase();
      if (lower.startsWith('page') || lower.startsWith('### page') || lower.startsWith('## page')) {
        const match = trimmed.match(/\d+/);
        const pageNum = match ? String(match[0]).padStart(2, '0') : String(pageCount++).padStart(2, '0');
        currentKey = `PAGE ${pageNum} INSIGHTS`;
        hasKeysFound = true;
        if (!pageMap[currentKey]) pageMap[currentKey] = [];
      } else {
        if (!pageMap[currentKey]) pageMap[currentKey] = [];
        const sanitizedLine = trimmed.replace(/^[\*\-\+]\s*/, '').trim();
        if (sanitizedLine) {
          pageMap[currentKey].push(sanitizedLine);
        }
      }
    });

    if (!hasKeysFound && rawLines.length > 0) {
      const fallbackKey = 'PAGE 01 INSIGHTS';
      pageMap[fallbackKey] = [];
      rawLines.forEach(line => {
        const cleaned = line.trim().replace(/^[\*\-\+]\s*/, '').trim();
        if (cleaned) pageMap[fallbackKey].push(cleaned);
      });
    }

    return pageMap;
  };

  const renderSummaryBlocks = () => {
    if (!data?.summary)
      return <div className="text-xs font-bold text-slate-400 py-10 text-center tracking-wide">No summary datasets unallocated.</div>;

    const pageMap = buildSummaryMap(data.summary);
    const badgeColors = [
      'bg-emerald-100 border-emerald-300 text-emerald-800',
      'bg-teal-100 border-teal-300 text-teal-800',
      'bg-cyan-100 border-cyan-300 text-cyan-800',
      'bg-sky-100 border-sky-300 text-sky-800',
      'bg-indigo-100 border-indigo-300 text-indigo-800',
      'bg-violet-100 border-violet-300 text-violet-800',
    ];

    return (
      <div className="space-y-6">
        {Object.keys(pageMap).map((header, index) => {
          if (pageMap[header].length === 0) return null;
          
          const flatTextSummary = pageMap[header].join(' ').replace(/\s+/g, ' ').trim();

          return (
            <div key={index} className="space-y-3">
              <span className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] px-4 py-2 rounded-xl border ${badgeColors[index % badgeColors.length]}`}>
                <span className="opacity-70">✦</span> {header}
              </span>
              <div className="bg-white border border-slate-200 border-l-4 border-l-emerald-500 rounded-2xl p-6 shadow-sm">
                <p className="text-slate-800 font-semibold text-sm md:text-[15px] leading-relaxed text-justify tracking-normal whitespace-normal">
                  {flatTextSummary}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const cheatSheetArray = data?.cheat_sheet?.length > 0 ? data.cheat_sheet : data?.key_points?.slice(0, 10) || [];

  const tabs = [
    { key: 'summary',     icon: FileText,    label: 'Page Summaries',       sub: 'Granular index bounds',       pal: TAB_PALETTE.summary },
    { key: 'key_points', icon: BookOpen,    label: 'Deep Insights Matrix', sub: 'Micro factual metrics',         pal: TAB_PALETTE.key_points },
    { key: 'timeline',   icon: Calendar,    label: dynamicTab3Title,       sub: 'Chronology benchmarks',        pal: TAB_PALETTE.timeline },
    { key: 'quotes',     icon: Layers,      label: dynamicTab4Title,       sub: 'Verbatim high weightage indices', pal: TAB_PALETTE.quotes },
    { key: 'cheat_sheet',icon: Sparkles,    label: 'Exam Cheat-Sheet',     sub: 'Formula blocks compiler',       pal: TAB_PALETTE.cheat_sheet },
    { key: 'flashcards', icon: HelpCircle,  label: 'Active Flashcards',    sub: 'Interactive testing matrix',    pal: TAB_PALETTE.flashcards },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-emerald-200 p-4 md:p-6" style={{ fontFamily: "'DM Sans', 'Outfit', system-ui, sans-serif" }}>

      {/* ── NAVBAR ── */}
      <header className="flex justify-between items-center bg-white border border-slate-200 rounded-2xl px-5 py-4 mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-emerald-600 transition-colors"
          >
            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
          <div className="w-9 h-9 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-md text-white">
            <Sparkles size={18} />
          </div>
          <h1 className="text-[18px] font-black text-slate-900 tracking-tight">Pagiverse</h1>
        </div>
        {/* 📥 RE-ACTIVATED HIGH-END PDF DOWNLOAD reporting engine BUTTON */}
        {data && (
          <button
            onClick={handleDownloadPdfReport}
            disabled={downloadingPdf}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-black px-5 py-2.5 rounded-xl shadow-md hover:shadow-emerald-400/30 hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-60 cursor-pointer active:scale-95"
          >
            <Download size={14} />
            {downloadingPdf ? 'Compiling Report...' : 'Download PDF Report'}
          </button>
        )}
      </header>

      {/* ── MAIN GRID ── */}
      <div className={`max-w-[1640px] mx-auto grid gap-6 transition-all ${sidebarOpen ? 'grid-cols-1 lg:grid-cols-[300px_1fr]' : 'grid-cols-1'}`}>

        {/* ── LEFT SIDEBAR ── */}
        {sidebarOpen && (
          <div className="flex flex-col gap-5">

            {/* UPLOAD ZONE */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
                <Upload size={13} className="text-emerald-500" /> Feed Core Document PDF
              </h3>
              <div
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[148px] ${
                  dragActive ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50/60 hover:border-emerald-400 hover:bg-emerald-50/40'
                }`}
                onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
              >
                <input ref={fileInputRef} type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                {file ? (
                  <div className="space-y-2 w-full">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto">
                      <FileText size={20} className="text-emerald-600" />
                    </div>
                    <p className="text-xs font-black text-slate-800 truncate px-2">{file.name}</p>
                    <p className="text-[10px] font-semibold text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mx-auto">
                      <Upload size={18} className="text-slate-400" />
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 leading-snug">Drag & drop or click<br/>to choose PDF</p>
                  </div>
                )}
              </div>
              {file && !loading && (
                <button
                  onClick={handleUpload}
                  className="w-full mt-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black py-2.5 rounded-xl shadow hover:shadow-emerald-400/30 flex items-center justify-center gap-2 text-xs transition-all hover:from-emerald-600 hover:to-teal-600 active:scale-[0.98]"
                >
                  Initialize Deep AI Processing <ArrowRight size={13} />
                </button>
              )}
            </div>

            {/* 🗂️ RESTORED NAV CONTROLLER SLIDER (ADDED IN BETWEEN UPLOAD AND REPOSITORY) */}
            {data && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setNavCollapsed(!navCollapsed)}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] hover:bg-slate-50 transition-colors"
                >
                  <span>Navigation Views</span>
                  {navCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                </button>
                {!navCollapsed && (
                  <div className="px-3 pb-3 space-y-1.5 border-t border-slate-100">
                    {tabs.map(({ key, icon: Icon, label, sub, pal }) => {
                      const isActive = activeTab === key;
                      return (
                        <button
                          key={key}
                          onClick={() => setActiveTab(key)}
                          className={`w-full text-left px-3.5 py-3 rounded-xl border transition-all flex items-center justify-between group ${
                            isActive
                              ? `${pal.bg} ${pal.border} shadow-sm font-black`
                              : 'bg-slate-50/50 border-transparent hover:bg-slate-50 hover:border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon size={14} className={isActive ? pal.label : 'text-slate-400'} />
                            <div className="truncate">
                              <p className={`text-[11px] font-black tracking-tight truncate leading-tight ${isActive ? 'text-slate-900 font-black' : 'text-slate-600'}`}>{label}</p>
                              <p className={`text-[9px] font-semibold truncate leading-tight mt-0.5 ${isActive ? 'text-slate-500' : 'text-slate-300'}`}>{sub}</p>
                            </div>
                          </div>
                          {key === 'flashcards' ? (
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 ml-1 ${pal.badge}`}>
                              {data.flashcards?.length || 0}
                            </span>
                          ) : (
                            <ChevronRight size={11} className={`shrink-0 transition-transform ${isActive ? pal.label : 'text-slate-200'} group-hover:translate-x-0.5`} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ANALYSIS ARCHIVE REPOSITORY */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-1.5">
                  <History size={11} /> 📚 ANALYSIS ARCHIVE REPOSITORY
                </h3>
                {historyList.length > 0 && (
                  <button
                    onClick={clearAllHistory}
                    className="text-[10px] text-rose-500 hover:text-rose-700 font-black flex items-center gap-0.5 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 size={11} /> Clear
                  </button>
                )}
              </div>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5" style={{ scrollbarWidth: 'none' }}>
                {historyList.length === 0 ? (
                  <p className="text-[11px] text-slate-400 font-medium text-center py-5">No archive elements synced.</p>
                ) : (
                  historyList.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => poolSampleSnapshot(item)}
                      className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all cursor-pointer"
                    >
                      <span className="text-[11px] font-bold text-slate-600 truncate max-w-[80%]">📄 {item.filename}</span>
                      <button
                        onClick={(e) => deleteHistoryItem(item.id, e)}
                        className="p-1 text-slate-300 hover:text-rose-500 bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-all border border-slate-100 shadow-sm"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── LOADING PANEL ── */}
        {loading && (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm space-y-6">
            <div className="max-w-sm mx-auto space-y-2">
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-500 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="text-[11px] font-black text-slate-400 tracking-wider">{Math.round(uploadProgress)}% COMPILED</span>
            </div>
            <div className="w-11 h-11 border-[3px] border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <div>
              <h3 className="text-base font-black text-slate-800 tracking-tight">Analyzing Document Vector Architecture</h3>
              <p className="text-[11px] font-bold text-emerald-600 mt-2 max-w-xs mx-auto leading-relaxed">
                ◎ {stages[loadingStage]}
              </p>
            </div>
          </div>
        )}

        {/* ── RESULTS PANEL ── */}
        {data && !loading && (
          <div ref={resultsRef} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] min-h-[620px]">

              {/* SIDE NAVIGATION INTERACTION INSIDE CONTENT PANE */}
              <aside className="bg-slate-50/60 border-r border-slate-100 p-3 space-y-1.5 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                {tabs.map(({ key, icon: Icon, label, sub, pal }) => {
                  const isActive = activeTab === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`w-full text-left px-3.5 py-3 rounded-xl border transition-all flex items-center justify-between group ${
                        isActive
                          ? `${pal.bg} ${pal.border} shadow-sm font-black`
                          : 'bg-white/60 border-transparent hover:bg-white hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon size={14} className={isActive ? pal.label : 'text-slate-400'} />
                        <div className="truncate">
                          <p className={`text-[11px] font-black tracking-tight truncate leading-tight ${isActive ? 'text-slate-900 font-black' : 'text-slate-600'}`}>{label}</p>
                          <p className={`text-[9px] font-semibold truncate leading-tight mt-0.5 ${isActive ? 'text-slate-500' : 'text-slate-300'}`}>{sub}</p>
                        </div>
                      </div>
                      {key === 'flashcards' ? (
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 ml-1 ${pal.badge}`}>
                          {data.flashcards?.length || 0}
                        </span>
                      ) : (
                        <ChevronRight size={11} className={`shrink-0 transition-transform ${isActive ? pal.label : 'text-slate-200'} group-hover:translate-x-0.5`} />
                      )}
                    </button>
                  );
                })}
              </aside>

              {/* MAIN REFLUSH VIEWPORT */}
              <main className="p-6 md:p-8 bg-white overflow-y-auto">

                {/* PAGE SUMMARIES */}
                {activeTab === 'summary' && (
                  <div className="space-y-5">
                    {renderSummaryBlocks()}
                  </div>
                )}

                {/* DEEP INSIGHTS MATRIX */}
                {activeTab === 'key_points' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      {data.key_points.map((item, idx) => (
                        <div key={idx} className="flex gap-4 p-4 bg-sky-50 border border-sky-200 border-l-4 border-l-sky-500 rounded-2xl">
                          <span className="text-[11px] font-black text-sky-400 mt-0.5 shrink-0 w-6 text-right">{String(idx + 1).padStart(2, '0')}.</span>
                          <p className="text-[14px] font-black text-slate-900 leading-relaxed">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TIMELINE */}
                {activeTab === 'timeline' && (
                  <div className="space-y-4">
                    <div className="border-l-2 border-amber-300 pl-5 ml-2 space-y-3 relative">
                      {data.timeline_dates.map((dateEvent, idx) => (
                        <div key={idx} className="relative p-4 bg-amber-50 border border-amber-200 border-l-4 border-l-amber-400 rounded-xl shadow-sm">
                          <div className="absolute -left-[29px] top-4 w-3 h-3 rounded-full bg-amber-400 border-2 border-white shadow-sm" />
                          <p className="text-[14px] font-black text-amber-950 leading-relaxed">{dateEvent}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* QUOTES / LAWS / ACTS */}
                {activeTab === 'quotes' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      {data.historians_quotes.map((quoteText, idx) => (
                        <div key={idx} className="relative p-5 bg-indigo-50 border border-indigo-200 border-l-4 border-l-indigo-500 rounded-2xl">
                          <span className="absolute right-4 top-2 text-5xl font-serif text-indigo-200 select-none leading-none">"</span>
                          <p className="text-[14px] font-black text-indigo-950 leading-relaxed pr-8">{quoteText}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CHEAT SHEET */}
                {activeTab === 'cheat_sheet' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      {cheatSheetArray.map((point, idx) => (
                        <div key={idx} className="flex gap-3 p-4 bg-rose-50 border border-rose-200 border-l-4 border-l-rose-500 rounded-2xl items-start">
                          <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                          <p className="text-[14px] font-black text-rose-950 leading-relaxed">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* FLASHCARDS */}
                {activeTab === 'flashcards' && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {data.flashcards.map((cardItem, idx) => (
                        <Flashcard key={idx} index={idx} question={cardItem.question} answer={cardItem.answer} />
                      ))}
                    </div>
                  </div>
                )}

              </main>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}