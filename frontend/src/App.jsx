import React, { useState, useEffect } from "react";
import axios from "axios";
import { Upload, FileText, Sparkles, Lightbulb, Bookmark, HelpCircle, Trash2, Clock, Download, Calendar, Quote } from "lucide-react";

function App() {
  const [file, setFile] = useState(null);
  const [docId, setDocId] = useState("");
  const [status, setStatus] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [aiProgress, setAiProgress] = useState(0); 
  const [analytics, setAnalytics] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [flippedCards, setFlippedCards] = useState({});

  useEffect(() => {
    fetchUserHistory();
  }, []);

  useEffect(() => {
    let interval;
    if (docId && (status === "processing" || status === "pending")) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`http://localhost:8000/document/${docId}`);
          const data = await res.json();
          setStatus(data.status);
          
          if (data.status === "completed") {
            clearInterval(interval);
            setAiProgress(100);
            fetchAnalytics(docId);
            fetchUserHistory();
          } else {
            setAiProgress((prev) => {
              if (prev >= 95) return 96;
              return prev + Math.floor(Math.random() * 6) + 2;
            });
          }
        } catch (err) {
          console.error(err);
        }
      }, 3000);
    } else {
      setAiProgress(0);
    }
    return () => clearInterval(interval);
  }, [docId, status]);

  const fetchUserHistory = async () => {
    try {
      const res = await fetch("http://localhost:8000/user/documents");
      if (res.ok) {
        const data = await res.json();
        setHistory(data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnalytics = async (id) => {
    try {
      const res = await fetch(`http://localhost:8000/document/${id}/analytics`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
        setFlippedCards({});
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadOldDocument = (id, currentStatus) => {
    setDocId(id);
    setStatus(currentStatus);
    if (currentStatus === "completed") {
      fetchAnalytics(id);
    } else {
      setAnalytics(null);
    }
  };

  const handleDeleteDocument = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to permanently delete this notebook?")) return;

    try {
      const res = await fetch(`http://localhost:8000/document/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        if (docId === id) {
          setDocId("");
          setStatus("");
          setAnalytics(null);
        }
        fetchUserHistory();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleCard = (index) => {
    setFlippedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setError("");
      setUploadProgress(1);
      setAiProgress(0);
      setAnalytics(null);
      
      const res = await axios.post("http://localhost:8000/upload", formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      setDocId(res.data.id);
      setStatus(res.data.status);
      fetchUserHistory();
    } catch (err) {
      setError(err.response?.data?.detail || "Upload pipeline disconnected.");
      setUploadProgress(0);
    }
  };

  const downloadReportAsPDF = () => {
    if (!analytics) return;
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.write(`
      <html>
        <head>
          <title>Pagiverse Notes - ${docId.substring(0,8)}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; padding: 40px; line-height: 1.6; }
            h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; font-size: 24px; margin-bottom: 20px; }
            h2 { color: #0f172a; margin-top: 30px; font-size: 18px; border-left: 4px solid #10b981; padding-left: 10px; }
            p { font-size: 14px; text-align: justify; color: #334155; white-space: pre-line; }
            .point-box { background: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px 15px; margin-bottom: 12px; border-radius: 4px; font-size: 13px; font-weight: 600; }
            .card-box { background: #fafafa; border: 1px solid #e2e8f0; padding: 15px; margin-bottom: 15px; border-radius: 8px; page-break-inside: avoid; }
            .q-tag { font-weight: bold; color: #7c3aed; font-size: 12px; text-transform: uppercase; }
            .a-tag { font-weight: bold; color: #059669; font-size: 12px; text-transform: uppercase; margin-top: 8px; }
            .text-content { font-size: 13px; margin-top: 4px; color: #0f172a; }
          </style>
        </head>
        <body>
          <h1>PAGIVERSE INTEGRATED STUDY REPORT</h1>
          <h2>EXECUTIVE SUMMARY</h2>
          <p>${analytics.summary}</p>
          <h2>HIGH-FOCUS KEY POINTS</h2>
          ${cleanKeyPoints.map((pt, idx) => `<div class="point-box">0${idx + 1}. ${pt}</div>`).join('')}
          <h2>REVISION FLASHCARDS DECK</h2>
          ${uniqueFlashcards.map(fc => `
            <div class="card-box">
              <div class="q-tag">Question:</div>
              <div class="text-content">${fc.question}</div>
              <div class="a-tag">Answer:</div>
              <div class="text-content">${fc.answer}</div>
            </div>
          `).join('')}
        </body>
      </html>
    `);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
    }, 500);
  };

  const premiumLightStyles = [
    "border-l-4 border-blue-600 bg-blue-50/70 text-blue-950 shadow-sm hover:bg-blue-50/90 hover:translate-x-1 transition-all duration-200",
    "border-l-4 border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-sm hover:bg-emerald-50/90 hover:translate-x-1 transition-all duration-200",
    "border-l-4 border-amber-600 bg-amber-50/70 text-amber-950 shadow-sm hover:bg-amber-50/90 hover:translate-x-1 transition-all duration-200",
    "border-l-4 border-purple-600 bg-purple-50/70 text-purple-950 shadow-sm hover:bg-purple-50/90 hover:translate-x-1 transition-all duration-200",
    "border-l-4 border-rose-600 bg-rose-50/70 text-rose-950 shadow-sm hover:bg-rose-50/90 hover:translate-x-1 transition-all duration-200",
    "border-l-4 border-indigo-600 bg-indigo-50/70 text-indigo-950 shadow-sm hover:bg-indigo-50/90 hover:translate-x-1 transition-all duration-200",
    "border-l-4 border-cyan-600 bg-cyan-50/70 text-cyan-950 shadow-sm hover:bg-cyan-50/90 hover:translate-x-1 transition-all duration-200",
    "border-l-4 border-teal-600 bg-teal-50/70 text-teal-950 shadow-sm hover:bg-teal-50/90 hover:translate-x-1 transition-all duration-200",
    "border-l-4 border-fuchsia-600 bg-fuchsia-50/70 text-fuchsia-950 shadow-sm hover:bg-fuchsia-50/90 hover:translate-x-1 transition-all duration-200",
    "border-l-4 border-orange-600 bg-orange-50/70 text-orange-950 shadow-sm hover:bg-orange-50/90 hover:translate-x-1 transition-all duration-200"
  ];

  const badgeColors = [
    "border-cyan-500/30 bg-cyan-500/10 text-cyan-600 shadow-cyan-500/5",
    "border-indigo-500/30 bg-indigo-500/10 text-indigo-600 shadow-indigo-500/5",
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 shadow-emerald-500/5",
    "border-amber-500/30 bg-amber-500/10 text-amber-600 shadow-amber-500/5",
    "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-600 shadow-fuchsia-500/5"
  ];

  const flashcardColorMatrix = [
    { tag: "text-blue-600 bg-blue-50 border-blue-100", border: "group-hover/card:border-blue-400", backBg: "bg-[#f2f6ff] border-blue-200 text-blue-950" },
    { tag: "text-emerald-600 bg-emerald-50 border-emerald-100", border: "group-hover/card:border-emerald-400", backBg: "bg-[#f0fdf4] border-emerald-200 text-emerald-950" },
    { tag: "text-amber-600 bg-amber-50 border-amber-100", border: "group-hover/card:border-amber-400", backBg: "bg-[#fffbeb] border-amber-200 text-amber-950" },
    { tag: "text-purple-600 bg-purple-50 border-purple-100", border: "group-hover/card:border-purple-400", backBg: "bg-[#faf5ff] border-purple-200 text-purple-950" },
    { tag: "text-rose-600 bg-rose-50 border-rose-100", border: "group-hover/card:border-rose-400", backBg: "bg-[#fff1f2] border-rose-200 text-rose-950" },
    { tag: "text-indigo-600 bg-indigo-50 border-indigo-100", border: "group-hover/card:border-indigo-400", backBg: "bg-[#f5f7ff] border-indigo-200 text-indigo-950" },
    { tag: "text-cyan-600 bg-cyan-50 border-cyan-100", border: "group-hover/card:border-cyan-400", backBg: "bg-[#ecfeff] border-cyan-200 text-cyan-950" },
    { tag: "text-teal-600 bg-teal-50 border-teal-100", border: "group-hover/card:border-teal-400", backBg: "bg-[#f0fdfa] border-teal-200 text-teal-950" },
    { tag: "text-fuchsia-600 bg-fuchsia-50 border-fuchsia-100", border: "group-hover/card:border-fuchsia-400", backBg: "bg-[#fdf4ff] border-fuchsia-200 text-fuchsia-950" },
    { tag: "text-orange-600 bg-orange-50 border-orange-100", border: "group-hover/card:border-orange-400", backBg: "bg-[#fff7ed] border-orange-200 text-orange-950" }
  ];

  const renderPageSummaries = (rawSummary) => {
    if (!rawSummary) return null;
    
    const parts = rawSummary.split(/### Page\s+(\d+)\s+Summary/i);
    if (parts.length <= 1) {
      return <p className="text-[#0f172a] font-medium leading-relaxed text-sm whitespace-pre-line">{rawSummary}</p>;
    }

    const elements = [];
    for (let i = 1; i < parts.length; i += 2) {
      const pageNum = parts[i];
      const pageContent = parts[i + 1] ? parts[i + 1].trim() : "";
      const styleIndex = (parseInt(pageNum, 10) || 0) % badgeColors.length;

      if (pageContent) {
        elements.push(
          <div key={`page-summary-block-${pageNum}`} className="border border-slate-200 bg-slate-50/50 rounded-xl p-5 space-y-3">
            <div className={`inline-flex items-center gap-2 border px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm ${badgeColors[styleIndex]}`}>
              <FileText className="w-3.5 h-3.5" />
              <span>Page {pageNum.padStart(2, '0')} Insights</span>
            </div>
            <p className="text-[#0f172a] font-medium leading-relaxed text-sm md:text-base whitespace-pre-line pl-1">{pageContent}</p>
          </div>
        );
      }
    }
    return <div className="space-y-6 mt-2">{elements}</div>;
  };

  const isGarbageText = (text) => {
    if (!text) return true;
    const txtLower = text.toLowerCase();
    
    const garbageKeywords = [
      "jumbled collection", "lacks coherence", "apparent language mix", 
      "unclear symbols", "mixture of english and hindi", "collection of words",
      "provided text appears", "cannot discern", "meaningful information",
      "phrase '", "mention of '", "contains several symbols", "abbreviations",
      "page 25", "page 27", "related to a specific code", "usfaat", "sera 8 cadre",
      "format of the text", "likely source", "audience for the text", "characters in the text",
      "valuable resource", "reflection of their own", "learning process", "taught in a region",
      "bilingual or multilingual", "intended audience", "purpose of the symbols", "possible field of study",
      "possible meaning of", "what is the likely", "meaning of '", "text mentions '", "ao ° ai wat", "aor x", 
      "ci eee xa", "you thank", "arte etarerat", "afraid eacaan", "indicates a specific", "might indicate",
      "gratitude or appreciation", "scientific or mathematical"
    ];

    if (garbageKeywords.some(k => txtLower.includes(k))) return true;
    if (txtLower.includes("@") || txtLower.includes("$") || txtLower.includes("cipher") || txtLower.includes("abbreviation")) return true;

    const individualWords = txtLower.replace(/[^a-z\s]/g, "").split(/\s+/).filter(w => w.length >= 4);
    for (let word of individualWords) {
      const vowels = (word.match(/[aeiou]/g) || []).length;
      if (vowels === 0 || vowels === word.length || (word.length >= 5 && vowels > word.length - 2)) {
        return true; 
      }
    }
    return false;
  };

  let cleanKeyPoints = [];
  if (analytics && analytics.key_points) {
    cleanKeyPoints = analytics.key_points.filter(pt => !isGarbageText(pt) && pt.trim().length > 30);
  }

  let uniqueFlashcards = [];
  if (analytics && analytics.flashcards) {
    const seenQuestions = new Set();
    uniqueFlashcards = analytics.flashcards.filter(card => {
      if (!card.question || !card.answer) return false;
      if (isGarbageText(card.question) || isGarbageText(card.answer)) return false;
      const normalizedQ = card.question.trim().toLowerCase();
      if (seenQuestions.has(normalizedQ)) return false;
      seenQuestions.add(normalizedQ);
      return true;
    });
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-emerald-500 selection:text-white antialiased">
      
      <style>{`
        .premium-scroll {
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
          transition: scrollbar-color 0.2s ease;
        }
        .premium-scroll::-webkit-scrollbar { width: 5px; height: 5px; }
        .premium-scroll::-webkit-scrollbar-track { background: transparent; }
        .premium-scroll::-webkit-scrollbar-thumb { background: transparent; border-radius: 10px; }
        .premium-scroll:hover { scrollbar-color: rgba(148, 163, 184, 0.3) transparent; }
        .premium-scroll:hover::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.3); }
        .premium-scroll::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.6) !important; }
      `}</style>

      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-4 md:px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="bg-gradient-to-tr from-emerald-400 to-teal-600 p-2 rounded-xl shadow-md shadow-emerald-500/10">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-transparent tracking-tight">
            Pagiverse <span className="text-xs text-emerald-600 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full ml-1">Beta</span>
          </span>
        </div>
      </nav>

      <div className={`p-4 md:p-8 max-w-[1680px] mx-auto grid gap-8 transition-all duration-500 ${analytics ? 'grid-cols-1 lg:grid-cols-4' : 'grid-cols-1'}`}>
        
        <div className={`flex flex-col gap-6 transition-all duration-500 ${analytics ? 'lg:col-span-1 lg:sticky lg:top-24 lg:h-[calc(100vh-140px)]' : 'max-w-2xl mx-auto w-full my-4'}`}>
          
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden flex-shrink-0">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              {analytics ? "Upload Another File" : "Upload Study Material"}
            </h3>
            <p className="text-[11px] md:text-xs text-slate-500 mb-4">
              Upload textbook PDFs, handwritten materials, or scanned notes.
            </p>

            <form onSubmit={handleUpload} className="space-y-4">
              <input 
                type="file" 
                accept=".pdf,image/*" 
                className="hidden" 
                id="pdf-file-upload-input"
                disabled={uploadProgress > 0 && uploadProgress < 100}
                onChange={(e) => setFile(e.target.files[0])} 
              />
              <label 
                htmlFor="pdf-file-upload-input"
                className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-emerald-500/40 rounded-xl p-6 md:p-7 cursor-pointer bg-slate-50/40 hover:bg-slate-50 transition-all duration-300 group/drop"
              >
                <Upload className="w-7 h-7 text-slate-400 group-hover/drop:text-emerald-500 transition-all duration-300 mb-2" />
                <span className="text-xs font-semibold text-slate-700 text-center max-w-[220px] truncate block">
                  {file ? file.name : "Click to select study file"}
                </span>
              </label>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-500">Uploading...</span>
                    <span className="text-emerald-600 font-mono">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 h-full rounded-full transition-all duration-200 ease-out" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}

              {uploadProgress === 100 && status !== "completed" && status !== "failed" && (
                <div className="space-y-1.5 bg-emerald-50/50 p-3 rounded-xl border border-emerald-200/60">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-emerald-700">AI Extracting...</span>
                    <span className="text-emerald-600 font-mono">{aiProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-400 h-full rounded-full transition-all duration-300" style={{ width: `${aiProgress}%` }}></div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={!file || (uploadProgress > 0 && uploadProgress < 100) || (status === "processing")}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-2.5 px-4 rounded-xl shadow-md shadow-emerald-500/10 hover:brightness-105 active:scale-[0.99] transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-2 text-xs md:text-sm"
              >
                {uploadProgress > 0 && uploadProgress < 100 ? (
                  <span>Uploading...</span>
                ) : status === "processing" ? (
                  <span>AI Running... {aiProgress}%</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Magic ✨</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className={`bg-white border border-slate-200/60 rounded-2xl p-4 flex flex-col flex-1 overflow-hidden shadow-sm ${analytics ? 'hidden lg:flex' : 'flex'}`}>
            <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-3 px-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Scanned Documents History
            </h4>
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 premium-scroll">
              {history.map((doc) => (
                <div 
                  key={doc.id}
                  onClick={() => loadOldDocument(doc.id, doc.status)}
                  className={`group/item w-full text-left p-3.5 rounded-xl border text-xs transition-all flex justify-between items-center cursor-pointer ${
                    docId === doc.id
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-sm"
                      : "bg-slate-50/60 border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="truncate flex-1 pr-2">
                    <div className="truncate font-semibold text-sm md:text-xs mb-0.5">{doc.filename}</div>
                    <div className="text-[10px] flex gap-2 items-center mt-1 opacity-70 font-medium">
                      <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                      <span className="font-extrabold uppercase tracking-wide">{doc.status}</span>
                    </div>
                  </div>
                  <button onClick={(e) => handleDeleteDocument(e, doc.id)} className="opacity-0 group-hover/item:opacity-100 flex items-center justify-center text-slate-400 hover:text-rose-500 p-1.5 rounded-md hover:bg-slate-100 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className="lg:col-span-3 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {analytics && (
            <>
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-sm">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                  <h3 className="text-md md:text-lg font-bold text-slate-900 flex items-center gap-2 tracking-wide">
                    <Bookmark className="w-4 h-4 text-blue-600" />
                    Executive Summary
                  </h3>
                  <button
                    onClick={downloadReportAsPDF}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 px-3 py-1.5 rounded-xl transition-all shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                </div>
                {renderPageSummaries(analytics.summary)}
              </div>

              {analytics.timeline_dates && analytics.timeline_dates.length > 0 && (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-sm border-t-4 border-t-amber-500/60">
                  <h3 className="text-md md:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 tracking-wide text-amber-600">
                    <Calendar className="w-4 h-4" /> Timeline & Key Dates
                  </h3>
                  <div className="space-y-3">
                    {analytics.timeline_dates.map((p, i) => (
                      <div key={`td-${i}`} className="p-4 rounded-xl text-xs sm:text-sm md:text-base font-bold border border-amber-200/20 border-l-4 border-l-amber-500 bg-amber-50/50 text-slate-900 shadow-sm">
                        {p}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analytics.historians_quotes && analytics.historians_quotes.length > 0 && (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-sm border-t-4 border-t-indigo-500/60">
                  <h3 className="text-md md:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 tracking-wide text-indigo-600">
                    <Quote className="w-4 h-4" /> Historians, Acts & Statements
                  </h3>
                  <div className="space-y-3">
                    {analytics.historians_quotes.map((p, i) => (
                      <div key={`hq-${i}`} className="p-4 rounded-xl text-xs sm:text-sm md:text-base font-bold border border-indigo-200/20 border-l-4 border-l-indigo-500 bg-indigo-50/50 text-slate-900 shadow-sm">
                        {p}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {cleanKeyPoints.length > 0 && (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-7 shadow-sm">
                  <h3 className="text-md md:text-lg font-bold text-slate-900 mb-5 flex items-center gap-2 border-b border-slate-100 pb-3 tracking-wide">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    High-Focus Key Points
                  </h3>
                  <div className="space-y-4">
                    {cleanKeyPoints.map((pt, idx) => {
                      const dynamicPointStyle = premiumLightStyles[idx % premiumLightStyles.length];
                      return (
                        <div key={idx} className={`p-4 rounded-xl leading-relaxed text-xs sm:text-sm md:text-base font-bold tracking-wide border border-slate-200/20 ${dynamicPointStyle}`}>
                          <div className="flex gap-2.5 md:gap-3 items-start">
                            <span className="font-black opacity-45 mt-0.5">0{idx + 1}.</span>
                            <span className="text-[#0f172a] font-bold">{pt}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {uniqueFlashcards.length > 0 && (
                <div>
                  <h3 className="text-md md:text-lg font-bold text-slate-900 mb-5 flex items-center gap-2 px-1 tracking-wide">
                    <HelpCircle className="w-4 h-4 text-purple-600" />
                    Interactive Cards (Click to Flip)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                    {uniqueFlashcards.map((fc, i) => {
                      const cardStyleAccent = flashcardColorMatrix[i % flashcardColorMatrix.length];
                      return (
                        <div key={i} onClick={() => toggleCard(i)} className="h-44 md:h-48 cursor-pointer [perspective:1000px] group/card select-none">
                          <div className={`relative w-full h-full text-center transition-all duration-500 [transform-style:preserve-3d] ${flippedCards[i] ? "[transform:rotateY(180deg)]" : ""}`}>
                            
                            <div className={`absolute inset-0 w-full h-full bg-white border border-slate-200 ${cardStyleAccent.border} p-4 md:p-5 rounded-2xl [backface-visibility:hidden] flex flex-col justify-between shadow-sm transition-all text-left`}>
                              <div>
                                <span className={`text-[8px] md:text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-md border ${cardStyleAccent.tag}`}>QUESTION</span>
                                <p className="text-[#0f172a] font-bold mt-4 text-xs sm:text-sm md:text-base leading-snug line-clamp-4">{fc.question}</p>
                              </div>
                              <span className="text-[10px] text-slate-400 font-semibold text-right group-hover/card:text-slate-600 transition-colors">Click to flip 👁️</span>
                            </div>

                            <div className={`absolute inset-0 w-full h-full border p-4 md:p-5 rounded-2xl [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col justify-between shadow-md text-left transition-all ${cardStyleAccent.backBg}`}>
                              <div>
                                <span className="text-[8px] md:text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-md border bg-white/80">ANSWER</span>
                                <p className="font-bold mt-4 text-xs sm:text-sm md:text-base leading-relaxed overflow-y-auto max-h-20 md:max-h-24 pr-1 premium-scroll">{fc.answer}</p>
                              </div>
                              <span className="text-[10px] opacity-50 font-semibold text-right">Click to close ↩</span>
                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;