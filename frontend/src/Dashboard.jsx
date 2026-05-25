import React, { useState, useEffect } from 'react';
import { Upload, FileText, Sparkles, Lightbulb, Bookmark, HelpCircle, Calendar, Quote, Download, History } from 'lucide-react';

const API_BASE_URL = "https://pagiverse.onrender.com";

export default function Dashboard() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("Initializing connection...");
  const [data, setData] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/documents`);
      if (response.ok) {
        const docs = await response.json();
        setHistoryList(docs || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    
    setLoading(true);
    setData(null); 
    setLoadingStage("Uploading file securely...");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      
      if (result && result.id) {
        pollAnalytics(result.id);
        fetchHistory();
      } else {
        alert("Backend sync failed. Please try again.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Render backend timeout. Container might be warming up, please try uploading again.");
      setLoading(false);
    }
  };

  const pollAnalytics = async (docId) => {
    let completed = false;
    let attempts = 0;
    const stages = [
      "Isolating text streams...",
      "Ingesting into Gemini pipeline...",
      "Generating deep insights...",
      "Creating interactive flashcards..."
    ];
    
    while (!completed && attempts < 25) {
      try {
        setLoadingStage(stages[attempts % stages.length]);
        await new Promise(r => setTimeout(r, 3000));
        const statusCheck = await fetch(`${API_BASE_URL}/document/${docId}`);
        const docStatus = await statusCheck.json();
        
        if (docStatus.status === "completed") {
          setLoadingStage("Parsing structural layout payload...");
          const response = await fetch(`${API_BASE_URL}/document/${docId}/analytics`);
          const result = await response.json();
          
          if (result) {
            setData({
              summary: result.summary || "",
              key_points: Array.isArray(result.key_points) ? result.key_points : [],
              timeline_dates: Array.isArray(result.timeline_dates) ? result.timeline_dates : [],
              historians_quotes: Array.isArray(result.historians_quotes) ? result.historians_quotes : [],
              cheat_sheet: Array.isArray(result.cheat_sheet) ? result.cheat_sheet : [],
              flashcards: Array.isArray(result.flashcards) ? result.flashcards : []
            });
          }
          
          setRenderKey(prev => prev + 1); 
          completed = true;
        } else if (docStatus.status === "failed") {
          console.error("Task failed inside engine worker thread.");
          completed = true;
        }
      } catch (error) {
        console.error("Polling stream exception loop:", error);
      }
      attempts++;
    }
    setLoading(false);
  };

  const loadHistoryItem = async (docId) => {
    setLoading(true);
    setData(null);
    setLoadingStage("Loading archival snapshot...");
    try {
      const dataResponse = await fetch(`${API_BASE_URL}/document/${docId}/analytics`);
      if (dataResponse.ok) {
        const result = await dataResponse.json();
        setData({
          summary: result.summary || "",
          key_points: Array.isArray(result.key_points) ? result.key_points : [],
          timeline_dates: Array.isArray(result.timeline_dates) ? result.timeline_dates : [],
          historians_quotes: Array.isArray(result.historians_quotes) ? result.historians_quotes : [],
          cheat_sheet: Array.isArray(result.cheat_sheet) ? result.cheat_sheet : [],
          flashcards: Array.isArray(result.flashcards) ? result.flashcards : []
        });
        setRenderKey(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDFReport = () => {
    window.print();
  };

  // Light Theme Highlighters
  const highlightStyles = [
    "border-l-4 border-blue-500 bg-blue-50 text-blue-900",
    "border-l-4 border-emerald-500 bg-emerald-50 text-emerald-900",
    "border-l-4 border-amber-500 bg-amber-50 text-amber-900",
    "border-l-4 border-purple-500 bg-purple-50 text-purple-900",
    "border-l-4 border-rose-500 bg-rose-50 text-rose-900"
  ];

  const badgeColors = [
    "border-cyan-200 bg-cyan-50 text-cyan-700 shadow-sm",
    "border-indigo-200 bg-indigo-50 text-indigo-700 shadow-sm",
    "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm",
    "border-amber-200 bg-amber-50 text-amber-700 shadow-sm",
    "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 shadow-sm"
  ];

  const renderPageSummaries = (rawSummary) => {
    if (!rawSummary) return null;
    const parts = rawSummary.split(/### Page\s+(\d+)\s+Summary/i);
    if (parts.length <= 1) {
      return <p className="text-slate-600 font-medium leading-relaxed text-sm whitespace-pre-line">{rawSummary}</p>;
    }
    const elements = [];
    for (let i = 1; i < parts.length; i += 2) {
      const pageNum = parts[i];
      const pageContent = parts[i + 1] ? parts[i + 1].trim() : "";
      const styleIndex = (parseInt(pageNum, 10) || 0) % badgeColors.length;

      if (pageContent) {
        elements.push(
          <div key={`page-summary-block-${pageNum}`} className="border border-slate-200 bg-slate-50/50 rounded-2xl p-6 shadow-sm space-y-3">
            <div className={`inline-flex items-center gap-2 border px-3 py-1.5 rounded-full text-xs font-extrabold tracking-wide ${badgeColors[styleIndex]}`}>
              <FileText className="w-3.5 h-3.5" />
              <span>Page {pageNum.padStart(2, '0')} Insights</span>
            </div>
            <p className="text-slate-700 font-medium leading-relaxed text-sm whitespace-pre-line pl-1">{pageContent}</p>
          </div>
        );
      }
    }
    return <div className="space-y-6 mt-3">{elements}</div>;
  };

  return (
    <div key={renderKey} className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-200">
      
      {/* Invisible Scrollbar CSS Injection */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Premium White Navbar */}
      <nav className="sticky top-0 z-50 px-6 py-4 flex justify-between items-center bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-emerald-400 to-teal-500 p-2 rounded-xl shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold text-slate-800 tracking-tight">
            Pagiverse <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full ml-1">Beta</span>
          </span>
        </div>
        {data && (
          <button onClick={downloadPDFReport} className="flex items-center gap-2 border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 shadow-sm transition-all active:scale-95">
            <Download className="w-4 h-4 text-emerald-500" />
            <span>Download PDF</span>
          </button>
        )}
      </nav>

      <div className={`p-4 md:p-8 max-w-[1600px] mx-auto grid gap-8 transition-all duration-500 ${data ? 'grid-cols-1 lg:grid-cols-4' : 'grid-cols-1'}`}>
        
        {/* Left Sidebar (Upload + History) */}
        <div className={`flex flex-col gap-6 transition-all duration-500 ${data ? 'lg:col-span-1 lg:sticky lg:top-24 h-fit' : 'max-w-2xl mx-auto w-full my-12'}`}>
          
          <div className="bg-white border border-slate-200 rounded-3xl p-7 shadow-xl shadow-slate-200/50">
            <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-500" />
              {data ? "Upload Another File" : "Upload Study Material"}
            </h2>
            <form onSubmit={handleUpload} className="space-y-5">
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50 rounded-2xl p-8 cursor-pointer bg-slate-50 transition-all">
                <Upload className="w-8 h-8 text-slate-400 mb-3" />
                <span className="text-sm font-medium text-slate-600 text-center max-w-[200px] truncate">
                  {file ? file.name : "Choose PDF / Image"}
                </span>
                <input type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
              </label>
              <button type="submit" disabled={loading || !file} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">{loadingStage}</span>
                  </div>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Magic</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* History Panel with Hidden Scrollbar */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl shadow-slate-200/50">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <History className="w-4 h-4" /> History
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 no-scrollbar">
              {historyList.length === 0 ? (
                <p className="text-sm text-slate-500">No documents yet.</p>
              ) : (
                historyList.map((item) => (
                  <button key={item.id} onClick={() => loadHistoryItem(item.id)} className="w-full text-left p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors text-sm font-semibold text-slate-700 truncate">
                    📄 {item.filename}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Content Panel */}
        {data && (
          <div className="lg:col-span-3 space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-4">
            
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/50">
              <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-3 border-b border-slate-100 pb-4 text-slate-800">
                <Bookmark className="w-6 h-6 text-blue-500" /> Executive Summary
              </h2>
              {renderPageSummaries(data.summary)}
            </div>

            {data.timeline_dates && data.timeline_dates.length > 0 && (
              <div className="bg-white border border-slate-200 border-t-4 border-t-amber-400 rounded-3xl p-8 shadow-xl shadow-slate-200/50">
                <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-3 text-amber-500 border-b border-slate-100 pb-4">
                  <Calendar className="w-6 h-6" /> Timeline & Key Dates
                </h2>
                <div className="space-y-3">
                  {data.timeline_dates.map((p, i) => (
                    <div key={`td-${i}`} className="p-4 rounded-xl text-sm md:text-base font-semibold border-l-4 border-amber-400 bg-amber-50 text-amber-900">
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.historians_quotes && data.historians_quotes.length > 0 && (
              <div className="bg-white border border-slate-200 border-t-4 border-t-indigo-400 rounded-3xl p-8 shadow-xl shadow-slate-200/50">
                <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-3 text-indigo-500 border-b border-slate-100 pb-4">
                  <Quote className="w-6 h-6" /> Historians, Acts & Statements
                </h2>
                <div className="space-y-3">
                  {data.historians_quotes.map((p, i) => (
                    <div key={`hq-${i}`} className="p-4 rounded-xl text-sm md:text-base font-semibold border-l-4 border-indigo-400 bg-indigo-50 text-indigo-900">
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.key_points && data.key_points.length > 0 && (
              <div className="bg-white border border-slate-200 border-t-4 border-t-emerald-500 rounded-3xl p-8 shadow-xl shadow-slate-200/50">
                <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-3 text-emerald-600 border-b border-slate-100 pb-4">
                  <Lightbulb className="w-6 h-6" /> High-Focus Key Points
                </h2>
                <div className="space-y-4">
                  {data.key_points?.map((p, i) => (
                    <div key={`kp-${i}`} className={`p-4 rounded-2xl text-sm md:text-base font-semibold transition-all duration-300 hover:scale-[1.01] ${highlightStyles[i % highlightStyles.length]}`}>
                      <div className="flex gap-4">
                        <span className="font-black opacity-80">0{i + 1}.</span>
                        <span>{p}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.flashcards && data.flashcards.length > 0 && (
              <div>
                <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-3 text-slate-800 ml-2">
                  <HelpCircle className="w-6 h-6 text-purple-500" /> Interactive Flashcards
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.flashcards?.map((c, i) => (
                    <Flashcard key={`fc-${i}`} card={c} index={i} />
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

function Flashcard({ card, index }) {
  const [flipped, setFlipped] = useState(false);
  
  // Premium Vibrant Gradient Colors for Flashcard Backs
  const backColors = [
    "bg-gradient-to-br from-blue-500 to-indigo-600",
    "bg-gradient-to-br from-emerald-500 to-teal-600",
    "bg-gradient-to-br from-amber-500 to-orange-500",
    "bg-gradient-to-br from-purple-500 to-fuchsia-600",
    "bg-gradient-to-br from-rose-500 to-pink-600"
  ];
  const colorClass = backColors[index % backColors.length];

  return (
    <div className="h-56 cursor-pointer [perspective:1000px] group" onClick={() => setFlipped(!flipped)}>
      <div className={`relative w-full h-full duration-500 [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}>
        
        {/* Front of Card (White Theme) */}
        <div className="absolute inset-0 w-full h-full bg-white border border-slate-200 p-6 rounded-3xl [backface-visibility:hidden] flex flex-col justify-between shadow-xl shadow-slate-200/50 hover:border-blue-300 transition-colors">
          <div>
            <span className="text-xs text-blue-600 font-black uppercase tracking-widest">Question</span>
            <p className="mt-3 text-base font-bold text-slate-700 leading-snug">{card.question}</p>
          </div>
          <span className="text-xs text-slate-400 font-semibold text-right group-hover:text-blue-500 transition-colors">Click to flip ↩</span>
        </div>

        {/* Back of Card (Multicolor) */}
        <div className={`absolute inset-0 w-full h-full ${colorClass} p-6 rounded-3xl [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col justify-between shadow-xl shadow-slate-300/50 text-white`}>
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-white/80">Answer</span>
            <p className="mt-3 text-sm font-semibold leading-relaxed overflow-y-auto max-h-32 pr-2 no-scrollbar">{card.answer}</p>
          </div>
          <span className="text-xs text-white/60 font-semibold text-right">Click to hide ↩</span>
        </div>

      </div>
    </div>
  );
}