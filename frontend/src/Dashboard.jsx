import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Upload, Sparkles, Calendar, BookOpen, 
  Layers, HelpCircle, CheckCircle2, AlertTriangle, 
  Download, RefreshCw, ChevronRight, Copy, Check,
  Maximize2, Minimize2, ArrowRight, Info, Search, FileDown,
  PanelLeftClose, PanelLeftOpen, Trash2, X
} from 'lucide-react';

const API_BASE_URL = "https://pagiverse.onrender.com";

// --- ORIGINAL INTERACTIVE FLASHCARD CARD SUB-SYSTEM (PREMIUM GRADIENTS) ---
function Flashcard({ question, answer, index }) {
  const [flipped, setFlipped] = useState(false);
  
  const backColors = [
    "from-blue-500 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-500",
    "from-purple-500 to-fuchsia-600",
    "from-rose-500 to-pink-600"
  ];
  const colorClass = backColors[index % backColors.length];

  return (
    <div 
      className="h-56 cursor-pointer [perspective:1000px] group print:break-inside-avoid print:h-auto print:mb-4" 
      onClick={() => setFlipped(!flipped)}
    >
      <div className={`relative w-full h-full transition-transform duration-500 ease-in-out [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : '[transform:rotateY(0deg)]'} print:[transform:none]`}>
        
        {/* Front */}
        <div className="absolute inset-0 w-full h-full bg-white border border-slate-200 p-6 rounded-3xl [backface-visibility:hidden] flex flex-col justify-between shadow-md hover:border-emerald-300 transition-colors print:relative print:backface-visible print:shadow-none print:rounded-xl print:border-slate-300 print:mb-2">
          <div>
            <span className="text-xs text-emerald-600 font-black uppercase tracking-widest">Question Block</span>
            <p className="mt-3 text-base font-bold text-slate-700 leading-snug print:text-sm">{question}</p>
          </div>
          <span className="text-xs text-slate-400 font-semibold text-right group-hover:text-emerald-500 transition-colors print:hidden">Tap Card to Flip 🔄</span>
        </div>

        {/* Back */}
        <div className={`absolute inset-0 w-full h-full bg-gradient-to-br ${colorClass} p-6 rounded-3xl [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col justify-between shadow-md text-white print:relative print:backface-visible print:[transform:none] print:bg-none print:text-slate-800 print:p-4 print:pt-0 print:shadow-none print:border-b print:border-slate-200 print:rounded-none`}>
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-white/80 print:text-emerald-600">AI Answer Resolution</span>
            <p className="mt-3 text-sm font-semibold leading-relaxed overflow-y-auto max-h-32 no-scrollbar print:max-h-none print:text-xs print:mt-1">{answer}</p>
          </div>
          <span className="text-xs text-white/60 font-semibold text-right print:hidden">Tap Card to Return 🔄</span>
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
  const [copiedText, setCopiedText] = useState(false);
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedPageFilter, setSelectedPageFilter] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [historyList, setHistoryList] = useState([]);
  
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
    "Final structural audit completed. Rendering dashboard viewport..."
  ];

  useEffect(() => {
    const localHistory = localStorage.getItem('pagiverse_tabbed_private_history');
    if (localHistory) setHistoryList(JSON.parse(localHistory));
  }, []);

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
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") setFile(droppedFile);
      else alert("Bhai, strict parsing ke liye sirf PDF file hi validate hogi!");
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setUploadProgress(15);
    setData(null);

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, { method: "POST", body: formData });
      const result = await response.json();
      if (result && result.id) {
        setUploadProgress(50);
        pollAnalytics(result.id, file.name);
      } else {
        alert("Backend sync failed. Please try again.");
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      alert("Pipeline Execution Exception. Render instance container might be warming up.");
      setLoading(false);
    }
  };

  const pollAnalytics = async (docId, fileName) => {
    let completed = false;
    let attempts = 0;
    while (!completed && attempts < 25) {
      try {
        setUploadProgress(50 + Math.min(attempts * 2, 45));
        await new Promise(r => setTimeout(r, 3000));
        const res = await fetch(`${API_BASE_URL}/document/${docId}`);
        const statusCheck = await res.json();
        
        if (statusCheck.status === "completed") {
          const dataRes = await fetch(`${API_BASE_URL}/document/${docId}/analytics`);
          const result = await dataRes.json();
          if (result) {
            const parsedData = {
              summary: result.summary || "",
              key_points: Array.isArray(result.key_points) ? result.key_points : [],
              timeline_dates: Array.isArray(result.timeline_dates) ? result.timeline_dates : [],
              historians_quotes: Array.isArray(result.historians_quotes) ? result.historians_quotes : [],
              cheat_sheet: Array.isArray(result.cheat_sheet) ? result.cheat_sheet : [],
              flashcards: Array.isArray(result.flashcards) ? result.flashcards : []
            };
            setData(parsedData);

            const newHistoryItem = {
              id: docId,
              filename: fileName,
              analytics: parsedData
            };
            const updatedHistory = [newHistoryItem, ...historyList.filter(item => item.id !== docId)];
            setHistoryList(updatedHistory);
            localStorage.setItem('pagiverse_tabbed_private_history', JSON.stringify(updatedHistory));
          }
          setUploadProgress(100);
          completed = true;
          setTimeout(() => {
            if (resultsRef.current) resultsRef.current.scrollIntoView({ behavior: 'smooth' });
          }, 400);
        } else if (statusCheck.status === "failed") {
          completed = true;
        }
      } catch (err) { console.error(err); }
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
    const updatedHistory = historyList.filter(item => item.id !== id);
    setHistoryList(updatedHistory);
    localStorage.setItem('pagiverse_tabbed_private_history', JSON.stringify(updatedHistory));
    if (data && historyList.find(item => item.id === id)?.analytics === data) setData(null);
  };

  const clearAllHistory = () => {
    if (window.confirm("Kya aap sach me saari local history delete karna chahte hain?")) {
      setHistoryList([]);
      localStorage.removeItem('pagiverse_tabbed_private_history');
      setData(null);
    }
  };

  const copyTabContent = () => {
    let textToCopy = "";
    if (activeTab === 'summary') textToCopy = data.summary;
    else if (activeTab === 'key_points') textToCopy = data.key_points?.join('\n') || "";
    else if (activeTab === 'timeline') textToCopy = data.timeline_dates?.join('\n') || "";
    else if (activeTab === 'quotes') textToCopy = data.historians_quotes?.join('\n') || "";
    else if (activeTab === 'cheat_sheet') textToCopy = data.cheat_sheet?.join('\n') || "";

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    });
  };

  const exportToJson = () => {
    if (!data) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `${file?.name || 'document'}_analytics.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click(); downloadAnchor.remove();
  };

  const filterArrayData = (arr) => {
    if (!arr) return [];
    if (searchQuery.trim() === '') return arr;
    return arr.filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  const getPageOptions = () => {
    if (!data || !data.summary) return [];
    const logs = data.summary.split('\n\n');
    const options = [];
    logs.forEach(block => {
      if (block.trim().startsWith('### Page')) {
        const header = block.split('\n')[0].replace('### ', '').trim();
        options.push(header);
      }
    });
    return options;
  };

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-200 p-4 md:p-6 ${fullscreenMode ? 'fixed inset-0 z-50 overflow-y-auto bg-white p-0 md:p-0' : ''}`}>
      
      {/* 🌌 HERO PREMIUM BRANDING NAVBAR */}
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
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Pagiverse <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Engine v1.0 Live</span>
            </h1>
            <p className="text-xs font-medium text-slate-500">Enterprise Academic Analytics Platform • University Core Text Parsing Node</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {data && <button onClick={() => window.print()} className="flex items-center gap-2 border border-slate-300 hover:bg-slate-50 px-4 py-2 rounded-xl text-sm font-bold shadow-sm text-slate-700 transition-all"><Download size={15} className="text-emerald-500" /> Print Report</button>}
          <div className="cluster-status-pill inline-flex items-center gap-2 text-xs font-bold bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Production Cluster Sync Active
          </div>
        </div>
      </header>

      {/* Main Container Workspace */}
      <div className={`max-w-[1600px] mx-auto grid gap-8 ${data && sidebarOpen ? 'grid-cols-1 lg:grid-cols-4' : 'grid-cols-1'}`}>
        
        {/* Sidebar Space Controller */}
        {sidebarOpen && (
          <div className="no-print flex flex-col gap-6 lg:col-span-1">
            {/* Upload Module */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Upload size={16} className="text-emerald-500" /> {data ? "Upload Another Asset" : "Feed Core Document PDF"}
              </h3>
              <div 
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[160px]
                  ${dragActive ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-300 bg-slate-50/50 hover:border-emerald-400'}`}
                onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
              >
                <input ref={fileInputRef} type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                {file ? (
                  <div className="space-y-2 truncate max-w-full">
                    <FileText size={32} className="text-emerald-500 mx-auto" />
                    <p className="text-sm font-bold text-slate-800 truncate">{file.name}</p>
                    <p className="text-xs font-semibold text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB • Binary Buffer</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload size={28} className="text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-600">Drag & drop or Click to choose PDF</p>
                    <div className="text-[10px] inline-flex items-center gap-1 bg-slate-200/60 text-slate-500 px-2 py-0.5 rounded-md"><Info size={10}/> Limit: Up to 300+ Pages</div>
                  </div>
                )}
              </div>
              {file && !data && !loading && (
                <button onClick={handleUpload} className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm transition-all active:scale-98">
                  Initialize Deep AI Processing <ArrowRight size={15}/>
                </button>
              )}
            </div>

            {/* Private Local Sandbox History Module */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><History size={14}/> Local Private History</h3>
                {historyList.length > 0 && <button onClick={clearAllHistory} className="text-[11px] text-rose-500 hover:text-rose-700 font-bold flex items-center gap-0.5 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"><Trash2 size={12}/> Clear All</button>}
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1 no-scrollbar">
                {historyList.length === 0 ? (
                  <p className="text-xs text-slate-400 font-medium text-center py-4">No localized snapshot records available.</p>
                ) : (
                  historyList.map((item) => (
                    <div key={item.id} onClick={() => loadHistoryItem(item)} className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/60 transition-colors cursor-pointer">
                      <span className="text-xs font-bold text-slate-600 truncate max-w-[80%]">📄 {item.filename}</span>
                      <button onClick={(e) => deleteHistoryItem(item.id, e)} className="p-1 text-slate-400 hover:text-rose-500 bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-all border border-slate-100 shadow-sm"><X size={12}/></button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Process Indicator Stream */}
        {loading && (
          <div className={`${data && sidebarOpen ? 'lg:col-span-3' : 'w-full'} bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm space-y-6`}>
            <div className="max-w-md mx-auto space-y-2">
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden relative">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <span className="text-xs font-black text-slate-500">{uploadProgress}% Compiled</span>
            </div>
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Analyzing Document Vector Architecture</h3>
              <p className="text-xs font-medium text-emerald-600 mt-1">Pipeline Event: {stages[loadingStage]}</p>
            </div>
            <div className="text-xs inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-xl max-w-fit mx-auto"><AlertTriangle size={14}/> Critical Pipeline Active: Do not refresh workspace session matrix.</div>
          </div>
        )}

        {/* Main Operational Viewport Node */}
        {data && (
          <div ref={resultsRef} className={`${sidebarOpen ? 'lg:col-span-3' : 'w-full'} bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm print:border-none print:shadow-none`}>
            
            {/* Toolbar Header Controls */}
            <div className="no-print bg-slate-50/80 backdrop-blur-md p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-40">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                <div>
                  <h4 className="text-xs font-black text-slate-800">Analysis Engine Scope Succeeded</h4>
                  <p className="text-[10px] font-semibold text-slate-400">Target Core Node Matrix Isolation Running</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                <div className="relative inline-flex items-center bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 shadow-sm text-xs text-slate-500 w-full max-w-[240px]">
                  <Search size={14} className="text-slate-400 mr-1.5" />
                  <input type="text" placeholder="Search parameters..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none w-full text-slate-700 font-medium" />
                </div>
                
                {activeTab === 'summary' && (
                  <select value={selectedPageFilter} onChange={(e) => setSelectedPageFilter(e.target.value)} className="bg-white border border-slate-300 text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm outline-none text-slate-700">
                    <option value="all">📁 All Page Indices</option>
                    {getPageOptions().map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
                  </select>
                )}

                <button onClick={copyTabContent} className="utility-btn bg-white border border-slate-300 hover:bg-slate-50 p-2 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all text-slate-700">
                  {copiedText ? <Check size={14} className="text-emerald-500"/> : <Copy size={14}/>} <span>{copiedText ? "Copied!" : "Copy Stream"}</span>
                </button>
                <button onClick={exportToJson} className="utility-btn bg-white border border-slate-300 hover:bg-slate-50 p-2 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all text-slate-700">
                  <FileDown size={14}/> <span>Export JSON</span>
                </button>
                <button onClick={() => setFullscreenMode(!fullscreenMode)} className="bg-white border border-slate-300 hover:bg-slate-50 p-2 text-xs font-bold rounded-xl shadow-sm transition-all text-slate-700">
                  {fullscreenMode ? <Minimize2 size={14}/> : <Maximize2 size={14}/>}
                </button>
              </div>
            </div>

            {/* Desktop Horizontal Split Panel UI Layout */}
            <div className="grid grid-cols-1 md:grid-cols-4 min-h-[600px] print:block">
              
              {/* Tab Selector Nav Pill Node */}
              <aside className="no-print bg-slate-50/40 border-r border-slate-200 p-3 space-y-1.5 md:col-span-1 print:hidden">
                {[
                  { id: 'summary', label: 'Page Summaries', sub: 'Granular index bounds', icon: FileText },
                  { id: 'key_points', label: 'Deep Insights Matrix', sub: 'Micro factual metrics', icon: BookOpen },
                  { id: 'timeline', label: 'Timeline & Chronology', sub: 'Date historical structures', icon: Calendar },
                  { id: 'quotes', label: 'Quotes, Laws & Acts', sub: 'Verbatim high indices', icon: Layers },
                  { id: 'cheat_sheet', label: 'Exam Cheat-Sheet', sub: 'Formula blocks compiler', icon: Sparkles },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all group ${activeTab === tab.id ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm' : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon size={16} className={activeTab === tab.id ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'} />
                        <div className="truncate">
                          <p className="text-xs font-bold tracking-tight">{tab.label}</p>
                          <p className="text-[10px] font-semibold text-slate-400 opacity-80 truncate">{tab.sub}</p>
                        </div>
                      </div>
                      <ChevronRight size={12} className={`opacity-40 transition-transform ${activeTab === tab.id ? 'translate-x-0.5 opacity-100' : ''}`} />
                    </button>
                  );
                })}

                <button onClick={() => setActiveTab('flashcards')} className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all group ${activeTab === 'flashcards' ? 'bg-purple-50 text-purple-700 border-purple-200 shadow-sm' : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <HelpCircle size={16} className={activeTab === 'flashcards' ? 'text-purple-600' : 'text-slate-400'} />
                    <div className="truncate">
                      <p className="text-xs font-bold tracking-tight">Active Flashcards</p>
                      <p className="text-[10px] font-semibold text-slate-400 opacity-80">Interactive testing matrix</p>
                    </div>
                  </div>
                  <div className={`text-[10px] font-black px-2 py-0.5 rounded-full ${activeTab === 'flashcards' ? 'bg-purple-200 text-purple-800' : 'bg-slate-200 text-slate-600'}`}>{data.flashcards?.length || 0}</div>
                </button>
              </aside>

              {/* Data Display Field Layout Area */}
              <main className="md:col-span-3 p-6 md:p-8 bg-white print:p-0">
                
                {/* PAGE SUMMARIES WORKSPACE TAB */}
                {(activeTab === 'summary' || window.matchMedia('print').matches) && (
                  <div className={`space-y-6 ${activeTab !== 'summary' ? 'print:block hidden' : ''}`}>
                    <h2 className="hidden print:flex text-xl font-black text-slate-800 border-b pb-2 mb-4 items-center gap-2"><FileText size={18}/> Page Summaries Analysis</h2>
                    {data.summary ? (
                      (() => {
                        const paragraphs = data.summary.split('\n\n');
                        let currentHeading = ""; const renderedBlocks = [];
                        paragraphs.forEach((paragraph, idx) => {
                          if (paragraph.trim().startsWith('### Page')) currentHeading = paragraph.split('\n')[0].replace('### ', '').trim();
                          if (selectedPageFilter === 'all' || currentHeading === selectedPageFilter) {
                            if (paragraph.trim().startsWith('### Page')) {
                              renderedBlocks.push(<h3 key={`h-${idx}`} className="text-sm font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl mt-4 mb-2 max-w-max tracking-wide">{paragraph.replace('### ', '')}</h3>);
                            } else if (paragraph.trim() !== '') {
                              if (searchQuery === '' || paragraph.toLowerCase().includes(searchQuery.toLowerCase())) {
                                renderedBlocks.push(<p key={`p-${idx}`} className="text-slate-600 font-medium text-sm leading-relaxed whitespace-pre-line border-l-2 border-slate-200 pl-4 py-1">{paragraph}</p>);
                              }
                            }
                          }
                        });
                        return renderedBlocks.length > 0 ? <div className="space-y-4">{renderedBlocks}</div> : <div className="text-xs font-bold text-slate-400 py-8 text-center">No structural distribution matched filters.</div>;
                      })()
                    ) : <div className="text-xs font-bold text-slate-400 py-8 text-center">No summary datasets unallocated.</div>}
                  </div>
                )}

                {/* DEEP INSIGHTS MATRIX WORKSPACE TAB */}
                {(activeTab === 'key_points' || window.matchMedia('print').matches) && (
                  <div className={`space-y-4 ${activeTab !== 'key_points' ? 'print:block hidden' : ''}`}>
                    <h2 className="hidden print:flex text-xl font-black text-slate-800 border-b pb-2 mb-4 items-center gap-2"><BookOpen size={18}/> Deep Insights Matrix</h2>
                    <div className="grid grid-cols-1 gap-3">
                      {filterArrayData(data.key_points).map((item, idx) => (
                        <div key={idx} className="flex gap-4 p-4 border border-slate-100 bg-slate-50/50 rounded-2xl border-l-4 border-l-blue-400 hover:scale-[1.005] transition-all">
                          <span className="font-black text-xs text-blue-500 opacity-60 mt-0.5">{String(idx + 1).padStart(2, '0')}.</span>
                          <p className="text-xs font-bold text-slate-700 leading-relaxed">{item}</p>
                        </div>
                      ))}
                    </div>
                    {filterArrayData(data.key_points).length === 0 && <div className="text-xs font-bold text-slate-400 py-8 text-center">No data vectors corresponding to search query.</div>}
                  </div>
                )}

                {/* TIMELINE & CHRONOLOGY TIMELINE WORKSPACE TAB */}
                {(activeTab === 'timeline' || window.matchMedia('print').matches) && (
                  <div className={`space-y-4 ${activeTab !== 'timeline' ? 'print:block hidden' : ''}`}>
                    <h2 className="hidden print:flex text-xl font-black text-slate-800 border-b pb-2 mb-4 items-center gap-2"><Calendar size={18}/> Chronological Timeline</h2>
                    <div className="space-y-3 border-l-2 border-amber-300 pl-4 ml-2 relative">
                      {filterArrayData(data.timeline_dates).map((dateEvent, idx) => (
                        <div key={idx} className="relative group p-3 rounded-xl border border-slate-100 bg-amber-50/40 text-amber-900 text-xs font-bold shadow-sm">
                          <div className="absolute -left-[23px] top-4 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-white group-hover:scale-110 transition-transform"></div>
                          {dateEvent}
                        </div>
                      ))}
                    </div>
                    {filterArrayData(data.timeline_dates).length === 0 && <div className="text-xs font-bold text-slate-400 py-8 text-center">No chronological elements found.</div>}
                  </div>
                )}

                {/* HISTORIANS QUOTES / STATUTORY ACTS TAB */}
                {(activeTab === 'quotes' || window.matchMedia('print').matches) && (
                  <div className={`space-y-4 ${activeTab !== 'quotes' ? 'print:block hidden' : ''}`}>
                    <h2 className="hidden print:flex text-xl font-black text-slate-800 border-b pb-2 mb-4 items-center gap-2"><Layers size={18}/> Quotes, Laws & Institutional Acts</h2>
                    <div className="grid grid-cols-1 gap-4">
                      {filterArrayData(data.historians_quotes).map((quoteText, idx) => (
                        <div key={idx} className="p-5 border border-slate-100 bg-indigo-50/40 text-indigo-950 rounded-2xl relative border-l-4 border-l-indigo-400">
                          <span className="absolute right-4 top-2 text-4xl font-serif text-indigo-200 select-none">“</span>
                          <p className="text-xs font-bold leading-relaxed pr-6">{quoteText}</p>
                        </div>
                      ))}
                    </div>
                    {filterArrayData(data.historians_quotes).length === 0 && <div className="text-xs font-bold text-slate-400 py-8 text-center">No textual statements found.</div>}
                  </div>
                )}

                {/* EXAM CHEAT-SHEET WORKSPACE DATA MATRIX TAB */}
                {(activeTab === 'cheat_sheet' || window.matchMedia('print').matches) && (
                  <div className={`space-y-4 ${activeTab !== 'cheat_sheet' ? 'print:block hidden' : ''}`}>
                    <h2 className="hidden print:flex text-xl font-black text-slate-800 border-b pb-2 mb-4 items-center gap-2"><Sparkles size={18}/> High Weightage Cheat-Sheet</h2>
                    <div className="grid grid-cols-1 gap-3">
                      {(data.cheat_sheet && data.cheat_sheet.length > 0 ? filterArrayData(data.cheat_sheet) : filterArrayData(data.key_points?.slice(0, 10) || [])).map((cheatPoint, idx) => (
                        <div key={idx} className="flex gap-4 p-4 border border-slate-100 bg-emerald-50/30 rounded-2xl border-l-4 border-l-emerald-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
                          <p className="text-xs font-bold text-slate-700 leading-relaxed">{cheatPoint}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* INTERACTIVE DYNAMIC FLASHCARDS VIEWPORT INDEX */}
                {(activeTab === 'flashcards' || window.matchMedia('print').matches) && (
                  <div className={`space-y-6 ${activeTab !== 'flashcards' ? 'print:block hidden print:break-before-page' : ''}`}>
                    <h2 className="text-xl font-extrabold flex items-center gap-2 ml-1 text-slate-800"><HelpCircle size={20} className="text-purple-500"/> Core Interactive Flashcards</h2>
                    {data.flashcards && data.flashcards.length > 0 ? (
                      (() => {
                        const filteredCards = data.flashcards.filter(card => 
                          card.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          card.answer.toLowerCase().includes(searchQuery.toLowerCase())
                        );
                        return filteredCards.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 print:grid-cols-2">
                            {filteredCards.map((cardItem, idx) => (
                              <Flashcard key={idx} index={idx} question={cardItem.question} answer={cardItem.answer} />
                            ))}
                          </div>
                        ) : <div className="text-xs font-bold text-slate-400 py-8 text-center">No flashcards match query.</div>;
                      })()
                    ) : <div className="text-xs font-bold text-slate-400 py-8 text-center">Flashcards unallocated.</div>}
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