import React, { useState } from 'react';
import { Upload, FileText, Sparkles, Lightbulb, Bookmark, HelpCircle, Calendar, Quote } from 'lucide-react';

const API_BASE_URL = "https://pagiverse.onrender.com";

export default function Dashboard() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [renderKey, setRenderKey] = useState(0);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    
    setLoading(true);
    setData(null); 
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
    
    while (!completed && attempts < 25) {
      try {
        await new Promise(r => setTimeout(r, 3000));
        const statusCheck = await fetch(`${API_BASE_URL}/document/${docId}`);
        const docStatus = await statusCheck.json();
        
        if (docStatus.status === "completed") {
          const response = await fetch(`${API_BASE_URL}/document/${docId}/analytics`);
          const result = await response.json();
          
          console.log("=== RECEIVED PAYLOAD PACKET ===", result);
          
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

  const highlightStyles = [
    "border-l-4 border-blue-500 bg-blue-500/10 text-blue-200",
    "border-l-4 border-emerald-500 bg-emerald-500/10 text-emerald-200",
    "border-l-4 border-amber-500 bg-amber-500/10 text-amber-200",
    "border-l-4 border-purple-500 bg-purple-500/10 text-purple-200",
    "border-l-4 border-rose-500 bg-rose-500/10 text-rose-200"
  ];

  // Dynamic style badge mapping logic for Page Summaries
  const badgeColors = [
    "border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-cyan-500/5",
    "border-indigo-500/30 bg-indigo-500/10 text-indigo-400 shadow-indigo-500/5",
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-emerald-500/5",
    "border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-amber-500/5",
    "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-400 shadow-fuchsia-500/5"
  ];

  // Professional parser utility to isolate raw text into discrete page blocks
  const renderPageSummaries = (rawSummary) => {
    if (!rawSummary) return null;
    
    const parts = rawSummary.split(/### Page\s+(\d+)\s+Summary/i);
    if (parts.length <= 1) {
      return <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-line">{rawSummary}</p>;
    }

    const elements = [];
    for (let i = 1; i < parts.length; i += 2) {
      const pageNum = parts[i];
      const pageContent = parts[i + 1] ? parts[i + 1].strip ? parts[i + 1].strip() : parts[i + 1].trim() : "";
      const styleIndex = (parseInt(pageNum, 10) || 0) % badgeColors.length;

      if (pageContent) {
        elements.push(
          <div key={`page-summary-block-${pageNum}`} className="border border-slate-800/60 bg-[#0f172a]/40 rounded-xl p-5 shadow-sm space-y-3">
            <div className={`inline-flex items-center gap-2 border px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm ${badgeColors[styleIndex]}`}>
              <FileText className="w-3.5 h-3.5" />
              <span>Page {pageNum.padStart(2, '0')} Insights</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-line pl-1">{pageContent}</p>
          </div>
        );
      }
    }
    return <div className="space-y-6 mt-2">{elements}</div>;
  };

  return (
    <div key={renderKey} className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      
      <nav className="border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="bg-gradient-to-tr from-emerald-400 to-teal-600 p-2 rounded-xl shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-5 h-5 text-slate-900" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent tracking-tight">
            Pagiverse <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full ml-1">Beta</span>
          </span>
        </div>
      </nav>

      <div className={`p-4 md:p-8 max-w-[1600px] mx-auto grid gap-8 transition-all duration-500 ${data ? 'grid-cols-1 lg:grid-cols-4' : 'grid-cols-1'}`}>
        
        <div className={`flex flex-col justify-center transition-all duration-500 ${data ? 'lg:col-span-1 lg:sticky lg:top-24 h-fit' : 'max-w-2xl mx-auto w-full my-12'}`}>
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-slate-200 mb-5 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              {data ? "Upload Another File" : "Upload Study Material"}
            </h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-xl p-6 cursor-pointer bg-[#0f172a]/50 w-full">
                <Upload className="w-8 h-8 text-slate-500 mb-2" />
                <span className="text-sm text-slate-300 text-center max-w-[200px] truncate">{file ? file.name : "Choose PDF / Image"}</span>
                <input type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
              </label>
              <button type="submit" disabled={loading || !file} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-900 font-bold py-3 rounded-xl hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Magic ✨</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {data && (
          <div className="lg:col-span-3 space-y-8 animate-in fade-in duration-500">
            
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
                <Bookmark className="w-5 h-5 text-blue-400" /> Executive Summary
              </h2>
              {renderPageSummaries(data.summary)}
            </div>

            {data.timeline_dates && data.timeline_dates.length > 0 && (
              <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl border-t-4 border-t-amber-500/40">
                <h2 className="text-xl font-bold mb-5 flex items-center gap-2 border-b border-slate-800 pb-3 text-amber-400">
                  <Calendar className="w-5 h-5" /> Timeline & Key Dates
                </h2>
                <div className="space-y-3">
                  {data.timeline_dates.map((p, i) => (
                    <div key={`td-${i}`} className="p-4 rounded-xl text-sm md:text-base font-medium border-l-4 border-amber-500 bg-amber-500/10 text-amber-200">
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.historians_quotes && data.historians_quotes.length > 0 && (
              <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl border-t-4 border-t-indigo-500/40">
                <h2 className="text-xl font-bold mb-5 flex items-center gap-2 border-b border-slate-800 pb-3 text-indigo-400">
                  <Quote className="w-5 h-5" /> Historians, Acts & Statements
                </h2>
                <div className="space-y-3">
                  {data.historians_quotes.map((p, i) => (
                    <div key={`hq-${i}`} className="p-4 rounded-xl text-sm md:text-base font-medium border-l-4 border-indigo-500 bg-indigo-500/10 text-indigo-200">
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.key_points && data.key_points.length > 0 && (
              <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl border-t-4 border-t-emerald-500/40">
                <h2 className="text-xl font-bold mb-5 flex items-center gap-2 border-b border-slate-800 pb-3 text-emerald-400">
                  <Lightbulb className="w-5 h-5" /> High-Focus Key Points
                </h2>
                <div className="space-y-3">
                  {data.key_points?.map((p, i) => (
                    <div key={`kp-${i}`} className={`p-4 rounded-xl text-sm md:text-base font-medium transition-all duration-300 hover:scale-[1.01] ${highlightStyles[i % highlightStyles.length]}`}>
                      <div className="flex gap-3">
                        <span className="font-extrabold opacity-70">0{i + 1}.</span>
                        <span>{p}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.flashcards && data.flashcards.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-5 flex items-center gap-2 px-1">
                  <HelpCircle className="w-5 h-5 text-purple-400" /> Interactive Cards (Click to Flip)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {data.flashcards?.map((c, i) => (
                    <Flashcard key={`fc-${i}`} card={c} />
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

function Flashcard({ card }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="h-48 cursor-pointer [perspective:1000px] group/card" onClick={() => setFlipped(!flipped)}>
      <div className={`relative w-full h-full duration-500 [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}>
        
        <div className="absolute inset-0 w-full h-full bg-[#111827] border border-slate-800 group-hover/card:border-purple-500/40 p-5 rounded-2xl [backface-visibility:hidden] flex flex-col justify-between shadow-lg">
          <div>
            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Question</span>
            <p className="mt-2 text-sm font-semibold text-slate-200 leading-snug line-clamp-4">{card.question}</p>
          </div>
          <span className="text-[11px] text-slate-500 font-medium text-right group-hover/card:text-purple-400 transition-colors">Click to flip 👁️</span>
        </div>

        <div className="absolute inset-0 w-full h-full bg-[#131c2e] border border-emerald-500/30 p-5 rounded-2xl [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col justify-between shadow-2xl">
          <div>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Answer</span>
            <p className="mt-2 text-xs md:text-sm font-medium text-emerald-100/90 leading-relaxed overflow-y-auto max-h-28 pr-1">{card.answer}</p>
          </div>
          <span className="text-[11px] text-emerald-400/50 font-medium text-right">Click to hide ↩</span>
        </div>

      </div>
    </div>
  );
}