import React, { useState } from 'react';
import { Upload, FileText, Sparkles, Lightbulb, Bookmark, HelpCircle, Calendar, Quote } from 'lucide-react';

const API_BASE_URL = "https://pagiverse.onrender.com";

export default function Dashboard() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    
    setLoading(true);
    setData(null); 
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/process-pdf`, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Server container integration failure");
      }
      
      const result = await response.json();
      
      if (result && result.summary) {
        setData({
          summary: result.summary || "",
          key_points: Array.isArray(result.key_points) ? result.key_points : [],
          timeline_dates: Array.isArray(result.timeline_dates) ? result.timeline_dates : [],
          historians_quotes: Array.isArray(result.historians_quotes) ? result.historians_quotes : [],
          cheat_sheet: Array.isArray(result.cheat_sheet) ? result.cheat_sheet : [],
          flashcards: Array.isArray(result.flashcards) ? result.flashcards : []
        });
      }
    } catch (error) {
      console.error("Execution Exception:", error);
      alert("Render backend container response timeout. Please try uploading again in a few seconds.");
    } finally {
      setLoading(false);
    }
  };

  const highlightStyles = [
    "border-l-4 border-blue-500 bg-blue-500/10 text-blue-200",
    "border-l-4 border-emerald-500 bg-emerald-500/10 text-emerald-200",
    "border-l-4 border-amber-500 bg-amber-500/10 text-amber-200",
    "border-l-4 border-purple-500 bg-purple-500/10 text-purple-200",
    "border-l-4 border-rose-500 bg-rose-500/10 text-rose-200"
  ];

  const badgeColors = [
    "border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-cyan-500/5",
    "border-indigo-500/30 bg-indigo-500/10 text-indigo-400 shadow-indigo-500/5",
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-emerald-500/5",
    "border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-amber-500/5",
    "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-400 shadow-fuchsia-500/5"
  ];

  const renderPageSummaries = (rawSummary) => {
    if (!rawSummary) return null;
    const parts = rawSummary.split(/### Page\s+(\d+)\s+Summary/i);
    if (parts.length <= 1) {
      return <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-line">{rawSummary}</p>;
    }
    const elements = [];
    for (let i = 1; i < parts.length; i += 2) {
      const pageNum = parts[i];
      const pageContent = parts[i + 1] ? parts[i + 1].trim() : "";
      const styleIndex = (parseInt(pageNum, 10) || 0) % badgeColors.length;

      if (pageContent) {
        elements.push(
          <div key={`page-summary-block-${pageNum}`} className="border border-slate-800/60 bg-[#0f172a]/40 rounded-xl p-5 space-y-3" style={{ marginBottom: '1.5rem', border: '1px solid #1e293b', borderRadius: '12px', padding: '1.25rem', backgroundColor: '#0f172a' }}>
            <div className={`inline-flex items-center gap-2 border px-3 py-1 rounded-full text-xs font-bold tracking-wide ${badgeColors[styleIndex]}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #334155', borderRadius: '9999px', padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
              <FileText style={{ width: '14px', height: '14px' }} />
              <span>Page {pageNum.padStart(2, '0')} Insights</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-line" style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: '1.625', marginTop: '0.75rem' }}>{pageContent}</p>
          </div>
        );
      }
    }
    return <div style={{ marginTop: '1rem' }}>{elements}</div>;
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans" style={{ minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', backgroundColor: '#0b0f19', color: '#f8fafc', margin: 0, padding: 0 }}>
      
      <nav className="border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-md px-6 py-4 flex justify-between items-center" style={{ width: '100%', boxSizing: 'border-box', borderBottom: '1px solid #1e293b', backgroundColor: '#0f172a', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="flex items-center gap-2.5" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div className="bg-gradient-to-tr from-emerald-400 to-teal-600 p-2 rounded-xl" style={{ background: 'linear-gradient(to top right, #34d399, #0d9488)', padding: '0.5rem', borderRadius: '12px' }}>
            <Sparkles style={{ width: '20px', height: '20px', color: '#0f172a' }} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.025em', color: '#ffffff' }}>
            Pagiverse <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: '600', backgroundColor: 'rgba(52, 211, 153, 0.1)', padding: '0.125rem 0.5rem', borderRadius: '9999px', marginLeft: '0.25rem' }}>Beta</span>
          </span>
        </div>
      </nav>

      <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem', boxSizing: 'border-box', flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <div style={{ width: '100%', maxWidth: '640px', backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '16px', padding: '1.5rem', boxSizing: 'border-box', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#e2e8f0', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText style={{ width: '20px', height: '20px', color: '#34d399' }} />
            {data ? "Upload Another File" : "Upload Study Material"}
          </h2>
          <form onSubmit={handleUpload} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #1e293b', borderRadius: '12px', padding: '2rem', cursor: 'pointer', backgroundColor: 'rgba(15, 23, 42, 0.5)', width: '100%', boxSizing: 'border-box' }}>
              <Upload style={{ width: '32px', height: '32px', color: '#64748b', marginBottom: '0.5rem' }} />
              <span style={{ fontSize: '0.875rem', color: '#cbd5e1', textAlign: 'center', maxWidth: '100%', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file ? file.name : "Choose PDF / Image"}</span>
              <input type="file" accept=".pdf,image/*" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files[0])} />
            </label>
            <button type="submit" disabled={loading || !file} style={{ width: '100%', background: 'linear-gradient(to right, #10b981, #0d9488)', color: '#0f172a', fontWeight: '700', padding: '0.75rem', borderRadius: '12px', border: 'none', cursor: (loading || !file) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: (loading || !file) ? 0.6 : 1 }}>
              {loading ? (
                <div style={{ width: '20px', height: '20px', border: '2px solid #0f172a', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              ) : (
                <>
                  <Sparkles style={{ width: '16px', height: '16px' }} />
                  <span>Generate Magic ✨</span>
                </>
              )}
            </button>
          </form>
        </div>

        {data && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '16px', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem' }}>
                <Bookmark style={{ width: '20px', height: '20px', color: '#3b82f6' }} /> Executive Summary
              </h2>
              {renderPageSummaries(data.summary)}
            </div>

            {data.timeline_dates && data.timeline_dates.length > 0 && (
              <div style={{ backgroundColor: '#111827', border: '1px solid #1e293b', borderTop: '4px solid rgba(245, 158, 11, 0.4)', borderRadius: '16px', padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem', color: '#f59e0b' }}>
                  <Calendar style={{ width: '20px', height: '20px' }} /> Timeline & Key Dates
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {data.timeline_dates.map((p, i) => (
                    <div key={`td-${i}`} style={{ padding: '1rem', borderRadius: '12px', fontSize: '0.9375rem', fontWeight: '500', borderLeft: '4px solid #f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#fef3c7' }}>
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.historians_quotes && data.historians_quotes.length > 0 && (
              <div style={{ backgroundColor: '#111827', border: '1px solid #1e293b', borderTop: '4px solid rgba(99, 102, 241, 0.4)', borderRadius: '16px', padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem', color: '#6366f1' }}>
                  <Quote style={{ width: '20px', height: '20px' }} /> Historians, Acts & Statements
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {data.historians_quotes.map((p, i) => (
                    <div key={`hq-${i}`} style={{ padding: '1rem', borderRadius: '12px', fontSize: '0.9375rem', fontWeight: '500', borderLeft: '4px solid #6366f1', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#e0e7ff' }}>
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.key_points && data.key_points.length > 0 && (
              <div style={{ backgroundColor: '#111827', border: '1px solid #1e293b', borderTop: '4px solid rgba(16, 185, 129, 0.4)', borderRadius: '16px', padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem', color: '#10b981' }}>
                  <Lightbulb style={{ width: '20px', height: '20px' }} /> High-Focus Key Points
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {data.key_points.map((p, i) => (
                    <div key={`kp-${i}`} className={highlightStyles[i % highlightStyles.length]} style={{ padding: '1rem', borderRadius: '12px', fontSize: '0.9375rem', fontWeight: '500' }}>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <span style={{ fontWeight: '800', opacity: 0.7 }}>0{i + 1}.</span>
                        <span>{p}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.flashcards && data.flashcards.length > 0 && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '0.25rem' }}>
                  <HelpCircle style={{ width: '20px', height: '20px', color: '#a855f7' }} /> Interactive Cards (Click to Flip)
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem', width: '100%' }}>
                  {data.flashcards.map((c, i) => (
                    <Flashcard key={`fc-${i}`} card={c} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function Flashcard({ card }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div style={{ height: '12rem', cursor: 'pointer', perspective: '1000px' }} onClick={() => setFlipped(!flipped)}>
      <div style={{ position: 'relative', width: '100%', height: '100%', duration: '0.5s', transformStyle: 'preserve-3d', transition: 'transform 0.5s', transform: flipped ? 'rotateY(180deg)' : 'none' }}>
        <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', backgroundColor: '#111827', border: '1px solid #1e293b', padding: '1.25rem', borderRadius: '16px', backfaceVisibility: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '10px', color: '#c084fc', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Question</span>
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#e2e8f0', lineHeight: '1.25' }}>{card.question}</p>
          </div>
          <span style={{ fontSize: '11px', color: '#64748b', textAlign: 'right' }}>Click to flip 👁️</span>
        </div>
        <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', backgroundColor: '#131c2e', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1.25rem', borderRadius: '16px', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '10px', color: '#34d399', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Answer</span>
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#ecfdf5', lineHeight: '1.6', overflowY: 'auto', maxHeight: '7rem' }}>{card.answer}</p>
          </div>
          <span style={{ fontSize: '11px', color: 'rgba(52, 211, 153, 0.5)', textAlign: 'right' }}>Click to hide ↩</span>
        </div>
      </div>
    </div>
  );
}