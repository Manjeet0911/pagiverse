import React, { useState, useEffect, useRef } from 'react';
import {
  FileText, Upload, Sparkles, Calendar, BookOpen,
  Layers, HelpCircle, CheckCircle2, ChevronRight, Copy, Check,
  Maximize2, Minimize2, ArrowRight, X, Trash2, Printer, History,
  Download, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';

// 🚀 PRODUCTION LIVE BACKEND CLUSTER ENDPOINT
const API_BASE_URL = "https://pagiverse.onrender.com";

// --- INTERACTIVE FLASHCARD CARD SUB-SYSTEM ---
function Flashcard({ question, answer, index }) {
  const [flipped, setFlipped] = useState(false);

  const pastelGradients = [
    "from-sky-50 via-blue-50 to-indigo-100 border-indigo-200 text-indigo-950",
    "from-emerald-50 via-teal-50 to-cyan-100 border-teal-200 text-teal-950",
    "from-amber-50 via-orange-50 to-yellow-100 border-amber-200 text-amber-950",
    "from-purple-50 via-fuchsia-50 to-violet-100 border-violet-200 text-violet-950",
    "from-rose-50 via-pink-50 to-red-100 border-rose-200 text-rose-950",
    "from-lime-50 via-green-50 to-emerald-100 border-green-200 text-green-950",
  ];
  const colorClass = pastelGradients[index % pastelGradients.length];

  return (
    <div
      className="h-56 cursor-pointer [perspective:1000px] group print:break-inside-avoid print:h-auto print:mb-4"
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 ease-in-out [transform-style:preserve-3d] ${
          flipped ? '[transform:rotateY(180deg)]' : '[transform:rotateY(0deg)]'
        } print:[transform:none]`}
      >
        {/* Front */}
        <div className="absolute inset-0 w-full h-full bg-white border border-slate-200 p-6 rounded-3xl [backface-visibility:hidden] flex flex-col justify-between shadow-sm hover:border-slate-300 transition-colors print:relative print:backface-visible print:shadow-none print:rounded-xl print:border-slate-300 print:mb-2">
          <div>
            <span className="text-xs text-slate-500 font-extrabold uppercase tracking-widest">QUESTION BLOCK</span>
            <p className="mt-3 text-base font-extrabold text-slate-800 leading-snug print:text-sm">{question}</p>
          </div>
          <span className="text-xs text-slate-400 font-semibold text-right transition-colors print:hidden">Tap Card to Flip 🔄</span>
        </div>

        {/* Back - premium pastel gradient */}
        <div
          className={`absolute inset-0 w-full h-full bg-gradient-to-br ${colorClass} border p-6 rounded-3xl [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col justify-between shadow-sm print:relative print:backface-visible print:[transform:none] print:bg-none print:text-slate-800 print:p-4 print:pt-0 print:shadow-none print:border-b print:border-slate-200 print:rounded-none`}
        >
          <div>
            <span className="text-xs font-black uppercase tracking-widest opacity-70 print:text-slate-500">ANSWER Block</span>
            <p className="mt-3 text-base font-black leading-relaxed overflow-y-auto max-h-32 no-scrollbar print:max-h-none print:text-sm print:mt-1">
              {answer}
            </p>
          </div>
          <span className="text-xs opacity-60 font-semibold text-right print:hidden">Tap Card to Return 🔄</span>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [copiedText, setCopiedText] = useState(false);
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [historyList, setHistoryList] = useState([]);

  // Adaptive Matrix Header States
  const [dynamicTab3Title, setDynamicTab3Title] = useState('Timeline & Chronology');
  const [dynamicTab3Sub, setDynamicTab3Sub] = useState('Date historical structures');
  const [dynamicTab4Title, setDynamicTab4Title] = useState('Quotes, Laws & Acts');
  const [dynamicTab4Sub, setDynamicTab4Sub] = useState('Verbatim high weightage indices');
  const [dynamicSummaryHighlight, setDynamicSummaryHighlight] = useState('Comprehensive Core Overview');

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

  // Load history on mount
  useEffect(() => {
    const localHistory = localStorage.getItem('pagiverse_tabbed_private_history');
    if (localHistory) {
      try {
        setHistoryList(JSON.parse(localHistory));
      } catch (_) {
        setHistoryList([]);
      }
    }
  }, []);

  // Universal Subject Adapter Matrix
  useEffect(() => {
    if (!data) return;

    const joinedContent = [
      data.summary || '',
      Array.isArray(data.key_points) ? data.key_points.join(' ') : '',
      Array.isArray(data.cheat_sheet) ? data.cheat_sheet.join(' ') : '',
    ]
      .join(' ')
      .toLowerCase();

    if (
      joinedContent.includes('algorithm') ||
      joinedContent.includes('complexity') ||
      joinedContent.includes('sorting') ||
      joinedContent.includes('big-o') ||
      joinedContent.includes('daa') ||
      joinedContent.includes('tree')
    ) {
      setDynamicTab3Title('Model & Algorithm Evolution');
      setDynamicTab3Sub('Algorithmic execution sequences');
      setDynamicTab4Title('Complexity Rules & Logic');
      setDynamicTab4Sub('Time/space complexity metrics');
      setDynamicSummaryHighlight('Data Science & Algorithmic Paradigm Isolated');
    } else if (
      joinedContent.includes('theorem') ||
      joinedContent.includes('proof') ||
      joinedContent.includes('induction') ||
      joinedContent.includes('discrete') ||
      joinedContent.includes('math')
    ) {
      setDynamicTab3Title('Sequential Steps & Proofs');
      setDynamicTab3Sub('Logical structure proofs sequences');
      setDynamicTab4Title('Axioms, Theorems & Corollaries');
      setDynamicTab4Sub('Core properties structural formulas');
      setDynamicSummaryHighlight('Mathematical Discrete Analytical Concept Isolated');
    } else if (
      joinedContent.includes('kernel') ||
      joinedContent.includes('scheduling') ||
      joinedContent.includes('operating') ||
      joinedContent.includes('protocol') ||
      joinedContent.includes('memory') ||
      joinedContent.includes('process')
    ) {
      setDynamicTab3Title('System State Chronology');
      setDynamicTab3Sub('CPU process scheduling timelines');
      setDynamicTab4Title('Standards, Protocols & Limits');
      setDynamicTab4Sub('RFC standards and system deadlocks');
      setDynamicSummaryHighlight('Architecture & Core Operating System Framework Isolated');
    } else {
      setDynamicTab3Title('Timeline & Chronology');
      setDynamicTab3Sub('Date historical structures');
      setDynamicTab4Title('Quotes, Laws & Acts');
      setDynamicTab4Sub('Verbatim high weightage indices');
      setDynamicSummaryHighlight('Comprehensive Core Overview');
    }
  }, [data]);

  // Loading stage ticker
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
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') setFile(droppedFile);
      else alert('Bhai, strict parsing ke liye sirf PDF file hi validate hogi!');
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

    setLoading(true);
    setUploadProgress(15);
    setData(null);

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, { method: 'POST', body: formData });
      const result = await response.json();
      if (result && result.id) {
        setUploadProgress(50);
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

  const pollAnalytics = async (docId, fileName) => {
    let completed = false;
    let attempts = 0;
    while (!completed && attempts < 25) {
      try {
        setUploadProgress(50 + Math.min(attempts * 2, 45));
        await new Promise((r) => setTimeout(r, 3000));
        const res = await fetch(`${API_BASE_URL}/document/${docId}`);
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
            setData(parsedData);

            const newHistoryItem = { id: docId, filename: fileName, analytics: parsedData };
            setHistoryList((prev) => {
              const updated = [newHistoryItem, ...prev.filter((item) => item.id !== docId)];
              localStorage.setItem('pagiverse_tabbed_private_history', JSON.stringify(updated));
              return updated;
            });
          }
          setUploadProgress(100);
          completed = true;
          setTimeout(() => {
            if (resultsRef.current) resultsRef.current.scrollIntoView({ behavior: 'smooth' });
          }, 400);
        } else if (statusCheck.status === 'failed') {
          completed = true;
        }
      } catch (err) {
        console.error(err);
      }
      attempts++;
    }
    setLoading(false);
  };

  const loadHistoryItem = (item) => {
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
    if (window.confirm('Kya aap sach me saari local history delete karna chahte hain?')) {
      setHistoryList([]);
      localStorage.removeItem('pagiverse_tabbed_private_history');
      setData(null);
    }
  };

  const copyTabContent = () => {
    let textToCopy = '';
    if (activeTab === 'summary') textToCopy = data.summary || '';
    else if (activeTab === 'key_points') textToCopy = data.key_points?.join('\n') || '';
    else if (activeTab === 'timeline') textToCopy = data.timeline_dates?.join('\n') || '';
    else if (activeTab === 'quotes') textToCopy = data.historians_quotes?.join('\n') || '';
    else if (activeTab === 'cheat_sheet') textToCopy = data.cheat_sheet?.join('\n') || '';

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    });
  };

  // Print all pages (full report)
  const printWholeDocumentMode = () => {
    window.print();
  };

  // Print only the currently visible tab
  const printTargetTabOnlyMode = () => {
    const printArea = document.getElementById('target-tab-print-viewport');
    if (!printArea) return;
    const originalContent = document.body.innerHTML;
    const printContent = printArea.innerHTML;
    document.body.innerHTML = `<div style="padding:30px;font-family:sans-serif;background:white;color:black;">${printContent}</div>`;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  const renderSummaryBlocks = () => {
    if (!data?.summary) {
      return (
        <div className="text-xs font-bold text-slate-400 py-8 text-center">
          No summary datasets unallocated.
        </div>
      );
    }

    const paragraphs = data.summary.split('\n\n');
    const renderedBlocks = [];

    paragraphs.forEach((paragraph, idx) => {
      if (paragraph.trim().startsWith('### Page')) {
        renderedBlocks.push(
          <h3
            key={`h-${idx}`}
            className="text-sm font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl mt-6 mb-3 max-w-max tracking-wide"
          >
            {paragraph.replace('### ', '')}
          </h3>
        );
      } else if (paragraph.trim() !== '') {
        renderedBlocks.push(
          <p
            key={`p-${idx}`}
            className="text-slate-950 font-black text-base md:text-lg leading-relaxed whitespace-pre-line border-l-4 border-emerald-500 pl-4 py-1.5 mb-4 tracking-wide"
          >
            {paragraph}
          </p>
        );
      }
    });

    return <div className="space-y-2">{renderedBlocks}</div>;
  };

  const cheatSheetArray =
    data?.cheat_sheet && data.cheat_sheet.length > 0
      ? data.cheat_sheet
      : data?.key_points?.slice(0, 10) || [];

  return (
    <div
      className={`min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-200 p-4 md:p-6 ${
        fullscreenMode ? 'fixed inset-0 z-50 overflow-y-auto bg-white p-0 md:p-0' : ''
      }`}
    >
      {/* ── CLEAN HEADER ── */}
      <header className="no-print flex flex-col sm:flex-row justify-between items-center bg-white border border-slate-200 rounded-3xl p-5 mb-8 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          {data && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-emerald-600 transition-colors"
            >
              {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
            </button>
          )}
          <div className="bg-gradient-to-tr from-emerald-400 to-teal-500 p-3 rounded-2xl shadow-md text-white">
            <Sparkles size={22} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Pagiverse</h1>
            <p className="text-xs font-medium text-slate-500">
              Academic Analytics Platform • Text Parsing Architecture
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {data && (
            <button
              onClick={printWholeDocumentMode}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-90 px-5 py-2.5 rounded-xl text-sm font-black shadow-md transition-all active:scale-95"
            >
              <Download size={15} /> Print All Pages (Full Report)
            </button>
          )}
        </div>
      </header>

      {/* ── MAIN LAYOUT GRID ── */}
      <div
        className={`max-w-[1600px] mx-auto grid gap-8 ${
          data && sidebarOpen ? 'grid-cols-1 lg:grid-cols-4' : 'grid-cols-1'
        }`}
      >
        {/* ── SIDEBAR ── */}
        {sidebarOpen && (
          <div className="no-print flex flex-col gap-6 lg:col-span-1">

            {/* Upload Module */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Upload size={16} className="text-emerald-500" /> Feed Core Document PDF
              </h3>
              <div
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[160px] ${
                  dragActive
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : 'border-slate-300 bg-slate-50/50 hover:border-emerald-400'
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  onChange={handleFileChange}
                />
                {file ? (
                  <div className="space-y-2 truncate max-w-full">
                    <FileText size={32} className="text-emerald-500 mx-auto" />
                    <p className="text-sm font-bold text-slate-800 truncate">{file.name}</p>
                    <p className="text-xs font-semibold text-slate-400">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload size={28} className="text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-600">
                      Drag & drop or Click to choose PDF
                    </p>
                  </div>
                )}
              </div>
              {file && !data && !loading && (
                <button
                  onClick={handleUpload}
                  className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm transition-all active:scale-98"
                >
                  Initialize Deep AI Processing <ArrowRight size={15} />
                </button>
              )}
            </div>

            {/* Local History Module */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <History size={14} /> Local Private History
                </h3>
                {historyList.length > 0 && (
                  <button
                    onClick={clearAllHistory}
                    className="text-[11px] text-rose-500 hover:text-rose-700 font-bold flex items-center gap-0.5 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 size={12} /> Clear All
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1 no-scrollbar">
                {historyList.length === 0 ? (
                  <p className="text-xs text-slate-400 font-medium text-center py-4">
                    No localized snapshot records available.
                  </p>
                ) : (
                  historyList.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => loadHistoryItem(item)}
                      className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/60 transition-colors cursor-pointer"
                    >
                      <span className="text-xs font-bold text-slate-600 truncate max-w-[80%]">
                        📄 {item.filename}
                      </span>
                      <button
                        onClick={(e) => deleteHistoryItem(item.id, e)}
                        className="p-1 text-slate-400 hover:text-rose-500 bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-all border border-slate-100 shadow-sm"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── LOADING INDICATOR ── */}
        {loading && (
          <div
            className={`${
              sidebarOpen ? 'lg:col-span-3' : 'w-full'
            } bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm space-y-6`}
          >
            <div className="max-w-md mx-auto space-y-2">
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="text-xs font-black text-slate-500">{uploadProgress}% Compiled</span>
            </div>
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <div>
              <h3 className="text-lg font-bold text-slate-800">Analyzing Document Vector Architecture</h3>
              <p className="text-xs font-medium text-emerald-600 mt-1">
                Pipeline Event: {stages[loadingStage]}
              </p>
            </div>
          </div>
        )}

        {/* ── MAIN RESULTS VIEWPORT ── */}
        {data && (
          <div
            ref={resultsRef}
            className={`${
              sidebarOpen ? 'lg:col-span-3' : 'w-full'
            } bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm print:border-none print:shadow-none`}
          >
            {/* Toolbar Header */}
            <div className="no-print bg-slate-50/80 backdrop-blur-md p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-40">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                <div>
                  <h4 className="text-xs font-black text-slate-800">Analysis Engine Scope Succeeded</h4>
                  <p className="text-[10px] font-semibold text-slate-400">
                    Target Core Node Matrix Isolation Running
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                <button
                  onClick={copyTabContent}
                  className="bg-white border border-slate-300 hover:bg-slate-50 px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all text-slate-700"
                >
                  {copiedText ? (
                    <Check size={14} className="text-emerald-500" />
                  ) : (
                    <Copy size={14} />
                  )}
                  <span>{copiedText ? 'Copied!' : 'Copy Stream'}</span>
                </button>

                <button
                  onClick={printTargetTabOnlyMode}
                  className="bg-emerald-600 border border-emerald-700 hover:bg-emerald-700 px-4 py-1.5 text-xs font-black rounded-xl flex items-center gap-1.5 shadow-sm transition-all text-white"
                >
                  <Printer size={14} />
                  <span>Print Current Tab</span>
                </button>

                <button
                  onClick={() => setFullscreenMode(!fullscreenMode)}
                  className="bg-white border border-slate-300 hover:bg-slate-50 p-2 text-xs font-bold rounded-xl shadow-sm transition-all text-slate-700"
                >
                  {fullscreenMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
              </div>
            </div>

            {/* Split Panel Layout */}
            <div className="grid grid-cols-1 md:grid-cols-4 min-h-[600px] print:block">

              {/* Tab Nav Sidebar */}
              <aside className="no-print bg-slate-50/40 border-r border-slate-200 p-3 space-y-2.5 md:col-span-1 max-h-[700px] overflow-y-auto no-scrollbar print:hidden">

                {/* Tab 1 — Page Summaries (mint/emerald) */}
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    activeTab === 'summary'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-md scale-[1.01]'
                      : 'bg-emerald-50/30 border-emerald-100/50 text-slate-600 hover:bg-emerald-50/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText size={16} className="text-emerald-600 shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-black tracking-tight">Page Summaries</p>
                      <p className="text-[10px] font-bold opacity-75 truncate">Granular index bounds</p>
                    </div>
                  </div>
                  <ChevronRight size={12} className="opacity-50 shrink-0" />
                </button>

                {/* Tab 2 — Deep Insights (sky blue) */}
                <button
                  onClick={() => setActiveTab('key_points')}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    activeTab === 'key_points'
                      ? 'bg-sky-50 border-sky-300 text-sky-900 shadow-md scale-[1.01]'
                      : 'bg-sky-50/30 border-sky-100/50 text-slate-600 hover:bg-sky-50/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <BookOpen size={16} className="text-sky-600 shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-black tracking-tight">Deep Insights Matrix</p>
                      <p className="text-[10px] font-bold opacity-75 truncate">Micro factual metrics</p>
                    </div>
                  </div>
                  <ChevronRight size={12} className="opacity-50 shrink-0" />
                </button>

                {/* Tab 3 — Dynamic (amber/lemon) */}
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    activeTab === 'timeline'
                      ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-md scale-[1.01]'
                      : 'bg-amber-50/30 border-amber-100/50 text-slate-600 hover:bg-amber-50/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Calendar size={16} className="text-amber-600 shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-black tracking-tight">{dynamicTab3Title}</p>
                      <p className="text-[10px] font-bold opacity-75 truncate">{dynamicTab3Sub}</p>
                    </div>
                  </div>
                  <ChevronRight size={12} className="opacity-50 shrink-0" />
                </button>

                {/* Tab 4 — Dynamic (indigo/lavender) */}
                <button
                  onClick={() => setActiveTab('quotes')}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    activeTab === 'quotes'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-md scale-[1.01]'
                      : 'bg-indigo-50/30 border-indigo-100/50 text-slate-600 hover:bg-indigo-50/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Layers size={16} className="text-indigo-600 shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-black tracking-tight">{dynamicTab4Title}</p>
                      <p className="text-[10px] font-bold opacity-75 truncate">{dynamicTab4Sub}</p>
                    </div>
                  </div>
                  <ChevronRight size={12} className="opacity-50 shrink-0" />
                </button>

                {/* Tab 5 — Cheat Sheet (rose/pink) */}
                <button
                  onClick={() => setActiveTab('cheat_sheet')}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    activeTab === 'cheat_sheet'
                      ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-md scale-[1.01]'
                      : 'bg-rose-50/30 border-rose-100/50 text-slate-600 hover:bg-rose-50/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Sparkles size={16} className="text-rose-600 shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-black tracking-tight">Exam Cheat-Sheet</p>
                      <p className="text-[10px] font-bold opacity-75 truncate">Formula blocks compiler</p>
                    </div>
                  </div>
                  <ChevronRight size={12} className="opacity-50 shrink-0" />
                </button>

                {/* Tab 6 — Flashcards (purple/violet) */}
                <button
                  onClick={() => setActiveTab('flashcards')}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    activeTab === 'flashcards'
                      ? 'bg-purple-50 border-purple-300 text-purple-900 shadow-md scale-[1.01]'
                      : 'bg-purple-50/30 border-purple-100/50 text-slate-600 hover:bg-purple-50/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <HelpCircle size={16} className="text-purple-600 shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-black tracking-tight">Active Flashcards</p>
                      <p className="text-[10px] font-bold opacity-75 truncate">Interactive testing matrix</p>
                    </div>
                  </div>
                  <div
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-full shrink-0 ${
                      activeTab === 'flashcards'
                        ? 'bg-purple-200 text-purple-900'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {data.flashcards?.length || 0}
                  </div>
                </button>
              </aside>

              {/* ── DATA DISPLAY AREA ── */}
              <main id="target-tab-print-viewport" className="md:col-span-3 p-6 md:p-8 bg-white print:p-0">

                {/* PAGE SUMMARIES */}
                {activeTab === 'summary' && (
                  <div className="space-y-4">
                    <div className="text-xs font-black tracking-widest text-emerald-600 uppercase border-b border-slate-100 pb-2 mb-4">
                      💡 {dynamicSummaryHighlight}
                    </div>
                    {renderSummaryBlocks()}
                  </div>
                )}

                {/* DEEP INSIGHTS MATRIX */}
                {activeTab === 'key_points' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      {data.key_points.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex gap-4 p-4 border border-slate-100 bg-slate-50/50 rounded-2xl border-l-4 border-l-sky-400"
                        >
                          <span className="font-black text-xs text-sky-500 opacity-60 mt-0.5">
                            {String(idx + 1).padStart(2, '0')}.
                          </span>
                          <p className="text-sm font-bold text-slate-800 leading-relaxed tracking-wide">
                            {item}
                          </p>
                        </div>
                      ))}
                      {data.key_points.length === 0 && (
                        <div className="text-xs font-bold text-slate-400 py-8 text-center">
                          No insights found.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TIMELINE / DYNAMIC TAB 3 */}
                {activeTab === 'timeline' && (
                  <div className="space-y-4">
                    <div className="space-y-3 border-l-2 border-amber-300 pl-4 ml-2 relative">
                      {data.timeline_dates.map((dateEvent, idx) => (
                        <div
                          key={idx}
                          className="relative p-3.5 rounded-xl border border-slate-100 bg-amber-50/40 text-amber-950 text-sm font-extrabold shadow-sm tracking-wide"
                        >
                          <div className="absolute -left-[23px] top-4 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-white" />
                          {dateEvent}
                        </div>
                      ))}
                      {data.timeline_dates.length === 0 && (
                        <div className="text-xs font-bold text-slate-400 py-8 text-center">
                          No sequential array entries found.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* QUOTES / DYNAMIC TAB 4 */}
                {activeTab === 'quotes' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      {data.historians_quotes.map((quoteText, idx) => (
                        <div
                          key={idx}
                          className="p-5 border border-slate-100 bg-indigo-50/40 text-indigo-950 rounded-2xl relative border-l-4 border-l-indigo-400"
                        >
                          <span className="absolute right-4 top-2 text-4xl font-serif text-indigo-200 select-none">
                            "
                          </span>
                          <p className="text-sm font-extrabold leading-relaxed pr-6 tracking-wide">
                            {quoteText}
                          </p>
                        </div>
                      ))}
                      {data.historians_quotes.length === 0 && (
                        <div className="text-xs font-bold text-slate-400 py-8 text-center">
                          No verbatim statement blocks found.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* EXAM CHEAT-SHEET */}
                {activeTab === 'cheat_sheet' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      {cheatSheetArray.map((cheatPoint, idx) => (
                        <div
                          key={idx}
                          className="flex gap-4 p-4 border border-slate-100 bg-emerald-50/30 rounded-2xl border-l-4 border-l-emerald-500"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                          <p className="text-sm font-extrabold text-slate-800 leading-relaxed tracking-wide">
                            {cheatPoint}
                          </p>
                        </div>
                      ))}
                      {cheatSheetArray.length === 0 && (
                        <div className="text-xs font-bold text-slate-400 py-8 text-center">
                          No cheat sheet entries found.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* INTERACTIVE FLASHCARDS */}
                {activeTab === 'flashcards' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-extrabold flex items-center gap-2 ml-1 text-slate-800">
                      <HelpCircle size={20} className="text-purple-500" /> Core Interactive Flashcards
                    </h2>
                    {data.flashcards && data.flashcards.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 print:grid-cols-2">
                        {data.flashcards.map((cardItem, idx) => (
                          <Flashcard
                            key={idx}
                            index={idx}
                            question={cardItem.question}
                            answer={cardItem.answer}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs font-bold text-slate-400 py-8 text-center">
                        Flashcards unallocated.
                      </div>
                    )}
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

export default App;
